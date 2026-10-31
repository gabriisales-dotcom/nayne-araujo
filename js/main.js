/* ============================================================
   Nayne Araújo Beauty Academy — interactions
   Vanilla JS · Lenis (progressive enhancement)
   ============================================================ */
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* -------------------------------------------------- year */
  var y = $("[data-year]"); if (y) y.textContent = new Date().getFullYear();

  /* -------------------------------------------------- loader */
  function hideLoader() {
    var l = $(".loader"); if (!l) return;
    l.classList.add("is-done");
    setTimeout(function () { if (l && l.parentNode) l.parentNode.removeChild(l); }, 800);
  }
  window.addEventListener("load", function () { setTimeout(hideLoader, reduce ? 0 : 850); });
  // safety net
  setTimeout(hideLoader, 4000);

  /* -------------------------------------------------- hero intro */
  function heroReady() { var h = $(".hero"); if (h) h.classList.add("is-ready"); }
  if (reduce) { heroReady(); }
  else { window.addEventListener("load", function () { setTimeout(heroReady, 700); });
         setTimeout(heroReady, 1600); /* safety */ }

  /* -------------------------------------------------- smooth scroll (Lenis) */
  var lenis = null;
  if (window.Lenis && !reduce) {
    try {
      lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
      var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    } catch (e) { lenis = null; }
  }
  function scrollToTarget(target) {
    if (!target) return;
    var offset = -70;
    if (lenis) lenis.scrollTo(target, { offset: offset, duration: 1.2 });
    else {
      var top = target.getBoundingClientRect().top + window.pageYOffset + offset;
      window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
    }
  }

  /* -------------------------------------------------- nav + menu */
  var nav = $("[data-nav]");
  var body = document.body;
  var lastY = window.pageYOffset;
  function onScrollNav() {
    var sy = window.pageYOffset;
    if (nav) {
      nav.classList.toggle("is-stuck", sy > 24);
      // o Safari do iPhone pinta a zona da Dynamic Island com o fundo do body: no topo, a cor do hero
      document.body.classList.toggle("at-top", sy <= 24);
      if (!body.classList.contains("menu-open")) {
        if (sy > lastY && sy > 340) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
      }
    }
    lastY = sy;
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  var burger = $("[data-burger]");
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
    var menu = $("[data-menu]"); if (menu) menu.setAttribute("aria-hidden", open ? "false" : "true");
    if (lenis) { open ? lenis.stop() : lenis.start(); }
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  if (burger) burger.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });

  /* anchor links */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      if (body.classList.contains("menu-open")) setMenu(false);
      setTimeout(function () { scrollToTarget(t); }, body.classList.contains("menu-open") ? 0 : 0);
    });
  });

  /* -------------------------------------------------- reveals */
  var reveals = $$("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          var d = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
          if (d) el.style.transitionDelay = d + "ms";
          el.classList.add("in");
          io.unobserve(el);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* -------------------------------------------------- hero roles (rotating) */
  (function () {
    var roles = $$("[data-roles] .hero__role"); if (roles.length < 2 || reduce) return;
    var i = 0;
    setInterval(function () {
      var cur = roles[i]; i = (i + 1) % roles.length; var nxt = roles[i];
      cur.classList.remove("is-on"); cur.classList.add("is-out");
      nxt.classList.remove("is-out"); void nxt.offsetWidth; nxt.classList.add("is-on");
      setTimeout(function () { cur.classList.remove("is-out"); }, 700);
    }, 2600);
  })();

  /* -------------------------------------------------- lash line (drift with scroll) */
  (function () {
    var wrap = $("[data-lashline]"), track = $("[data-lashline-track]");
    if (!wrap || !track || reduce) return;
    var tick = false;
    var run = function () {
      var r = wrap.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom > -100 && r.top < vh + 100) {
        var p = clamp((vh - r.top) / (vh + r.height), 0, 1);
        track.style.transform = "translate3d(" + (-(track.scrollWidth / 3) * (0.15 + p * 0.55)).toFixed(1) + "px,0,0)";
      }
      tick = false;
    };
    var onS = function () { if (!tick) { tick = true; requestAnimationFrame(run); } };
    if (lenis) lenis.on("scroll", onS);
    window.addEventListener("scroll", onS, { passive: true });
    window.addEventListener("resize", onS);
    run();
  })();

  /* -------------------------------------------------- parallax */
  var pxEls = $$("[data-parallax]");
  if (pxEls.length && !reduce) {
    pxEls.forEach(function (el) { el.style.willChange = "transform"; });
    var tickP = false;
    var runP = function () {
      var vh = window.innerHeight;
      pxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var f = parseFloat(el.getAttribute("data-parallax")) || 0.1;
        var p = (r.top + r.height / 2 - vh / 2) / vh;
        var move = clamp(p * f * 300, -46, 46);
        el.style.transform = "translate3d(0," + move.toFixed(1) + "px,0) scale(1.14)";
      });
      tickP = false;
    };
    var onScrollP = function () { if (!tickP) { tickP = true; requestAnimationFrame(runP); } };
    if (lenis) lenis.on("scroll", onScrollP);
    window.addEventListener("scroll", onScrollP, { passive: true });
    window.addEventListener("resize", onScrollP);
    runP();
  }

  /* -------------------------------------------------- services */
  var services = $$("[data-service]");
  var previewInner = $("[data-preview]");
  var previewImg = $("[data-preview-img]");
  var isDesktop = window.matchMedia("(min-width:1001px)").matches;

  function setService(s) {
    services.forEach(function (o) {
      var on = o === s;
      o.classList.toggle("is-active", on);
      var btn = $(".service__row", o); if (btn) btn.setAttribute("aria-expanded", on ? "true" : "false");
    });
    var img = s.getAttribute("data-img");
    if (previewInner && previewImg && img && previewImg.getAttribute("src") !== img) {
      previewInner.classList.add("is-swap");
      setTimeout(function () {
        previewImg.setAttribute("src", img);
        previewInner.classList.remove("is-swap");
      }, 240);
    }
  }
  services.forEach(function (s) {
    var row = $(".service__row", s);
    if (isDesktop) s.addEventListener("mouseenter", function () { setService(s); });
    if (row) row.addEventListener("click", function () {
      if (!isDesktop && s.classList.contains("is-active")) {
        s.classList.remove("is-active"); row.setAttribute("aria-expanded", "false"); return;
      }
      setService(s);
    });
  });

  /* -------------------------------------------------- before / after */
  (function () {
    var ba = $("[data-ba]"); if (!ba) return;
    var range = $("[data-ba-range]", ba);
    var beforeImg = $("[data-ba-before]", ba);
    var afterImg = $("[data-ba-after]", ba);
    var cases = $$("[data-case]");

    function setPos(v) { v = clamp(v, 0, 100); ba.style.setProperty("--pos", v + "%"); if (range) range.value = v; }
    setPos(50);
    if (range) range.addEventListener("input", function () { ba.style.setProperty("--pos", range.value + "%"); });

    // arrastar em qualquer ponto da foto; na vertical o toque continua a fazer scroll (touch-action: pan-y)
    var frame = $(".ba__frame", ba);
    var userMoved = false;
    function dragTo(e) {
      var r = frame.getBoundingClientRect();
      setPos((e.clientX - r.left) / r.width * 100);
    }
    if (frame) {
      // no toque só mexe depois de um gesto horizontal: rolar a página por cima da foto não move a barra
      var startX = null, moved = false;
      frame.addEventListener("pointerdown", function (e) {
        if (ba.classList.contains("is-single")) return;
        startX = e.clientX; moved = false;
        frame.setPointerCapture(e.pointerId);
        if (e.pointerType === "mouse") { userMoved = moved = true; dragTo(e); }
      });
      frame.addEventListener("pointermove", function (e) {
        if (startX === null) return;
        if (!moved && Math.abs(e.clientX - startX) < 6) return;
        userMoved = moved = true;
        dragTo(e);
      });
      frame.addEventListener("pointerup", function (e) {
        if (startX !== null && !moved) { userMoved = true; dragTo(e); }   // toque simples
        startX = null;
      });
      frame.addEventListener("pointercancel", function () { startX = null; });   // o browser ficou com o gesto (scroll)
    }

    // teaser tween on first view
    function tween(from, to, dur, cb, done) {
      var start = performance.now();
      (function step(now) {
        if (userMoved) return;   // o gesto da pessoa cancela a demonstração
        var t = clamp((now - start) / dur, 0, 1);
        var e = 1 - Math.pow(1 - t, 3);
        cb(from + (to - from) * e);
        if (t < 1) requestAnimationFrame(step); else if (done) done();
      })(start);
    }
    function teaser() {
      if (reduce) return;
      tween(50, 30, 620, setPos, function () {
        tween(30, 70, 900, setPos, function () {
          tween(70, 50, 620, setPos);
        });
      });
    }
    var teased = false;
    if ("IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting && !teased) { teased = true; setTimeout(teaser, 350); io2.unobserve(e.target); } });
      }, { threshold: 0.4 });
      io2.observe(ba);
    }

    // case switching
    function preload(src) { var i = new Image(); i.src = src; }
    cases.forEach(function (c) {
      c.addEventListener("click", function () {
        cases.forEach(function (o) { o.classList.remove("is-active"); o.setAttribute("aria-selected", "false"); });
        c.classList.add("is-active"); c.setAttribute("aria-selected", "true");
        var row = c.parentNode;
        if (row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: c.offsetLeft - 2, behavior: reduce ? "auto" : "smooth" });
        var b = c.getAttribute("data-before"), a = c.getAttribute("data-after");
        preload(b); preload(a);
        ba.classList.add("is-swapping");
        setTimeout(function () {
          if (beforeImg) beforeImg.setAttribute("src", b);
          if (afterImg) afterImg.setAttribute("src", a);
          ba.classList.toggle("is-single", c.hasAttribute("data-single"));
          ba.classList.remove("is-swapping");
        }, 280);
      });
    });
  })();

  /* -------------------------------------------------- testimonials */
  (function () {
    var track = $("[data-testi-track]"); if (!track) return;
    var slides = $$("[data-testi]", track);
    var prev = $("[data-testi-prev]"), next = $("[data-testi-next]"), dotsWrap = $("[data-testi-dots]");
    var i = 0, timer = null;
    slides.forEach(function (_, k) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Mensagem " + (k + 1));
      d.addEventListener("click", function () { go(k, true); });
      if (dotsWrap) dotsWrap.appendChild(d);
    });
    var dots = dotsWrap ? $$("button", dotsWrap) : [];
    function go(n, user) {
      i = (n + slides.length) % slides.length;
      track.style.transform = "translateX(" + (-i * 100) + "%)";
      slides.forEach(function (s, k) { s.classList.toggle("is-active", k === i); });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === i); });
      if (user) restart();
    }
    function restart() { if (timer) clearInterval(timer); if (!reduce) timer = setInterval(function () { go(i + 1); }, 6000); }
    if (prev) prev.addEventListener("click", function () { go(i - 1, true); });
    if (next) next.addEventListener("click", function () { go(i + 1, true); });
    var vp = $(".feedback__viewport");
    if (vp) { vp.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
              vp.addEventListener("mouseleave", restart); }
    go(0); restart();
  })();

  /* -------------------------------------------------- WhatsApp booking */
  (function () {
    var wa = $("[data-wa]"); if (!wa) return;
    var btn = $("[data-wa-btn]", wa);
    var label = $("[data-wa-label]", wa);
    var chips = $$("[data-wa-chip]", wa);
    var base = "https://wa.me/351933041699?text=";
    function list(arr) { return arr.length < 2 ? arr.join("") : arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1]; }
    function update() {
      var picked = chips.filter(function (c) { return c.getAttribute("aria-pressed") === "true"; })
                        .map(function (c) { return c.getAttribute("data-wa-chip"); });
      var academy = picked.indexOf("Formação na Academy") > -1;
      var services = picked.filter(function (n) { return n !== "Formação na Academy"; }).map(function (n) { return n.toLowerCase(); });
      var msg = "Olá Nayne! ";
      if (services.length) msg += "Gostaria de fazer uma marcação de " + list(services) + (academy ? " e saber mais sobre a formação na Academy." : ".");
      else if (academy) msg += "Gostaria de saber mais sobre a formação na Academy.";
      else msg += "Gostaria de fazer uma marcação.";
      btn.setAttribute("href", base + encodeURIComponent(msg));
      if (label) label.textContent = !picked.length ? "+351 933 041 699" : picked.length === 1 ? picked[0] : picked.length + " serviços escolhidos";
      btn.classList.remove("is-bump"); void btn.offsetWidth; btn.classList.add("is-bump");
    }
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        c.setAttribute("aria-pressed", c.getAttribute("aria-pressed") === "true" ? "false" : "true");
        update();
      });
    });
    // magnetic pull on fine pointers
    if (isFinePointer && !reduce && btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) / r.width, yy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.setProperty("--mx", (x * 14).toFixed(1) + "px");
        btn.style.setProperty("--my", (yy * 10).toFixed(1) + "px");
      });
      btn.addEventListener("mouseleave", function () { btn.style.setProperty("--mx", "0px"); btn.style.setProperty("--my", "0px"); });
    }
  })();

  /* -------------------------------------------------- custom cursor */
  if (isFinePointer && !reduce) {
    var cur = $(".cursor");
    if (cur) {
      var dot = $(".cursor__dot", cur), ring = $(".cursor__ring", cur);
      var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
      window.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        if (dot) dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      });
      (function loop() {
        rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
        if (ring) ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
        requestAnimationFrame(loop);
      })();
      var hoverSel = "a,button,input,select,textarea,label,.service__row,.case,[data-link]";
      document.addEventListener("mouseover", function (e) { if (e.target.closest(hoverSel)) cur.classList.add("is-hover"); });
      document.addEventListener("mouseout", function (e) { if (e.target.closest(hoverSel)) cur.classList.remove("is-hover"); });
    }
  }

})();
