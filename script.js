(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll progress */
  var bar = document.getElementById("bar");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  }, { passive: true });

  var mk = document.querySelector(".mark");
  if (mk) mk.addEventListener("click", function (e) { e.preventDefault(); scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }); });

  /* reveal + counters + bars */
  function count(el) {
    var to = +el.dataset.count, pre = el.dataset.pre || "", suf = el.dataset.suf || "", t0 = null;
    if (still) { el.textContent = pre + to + suf; return; }
    (function step(t) {
      t0 = t0 || t;
      var p = Math.min((t - t0) / 1400, 1);
      el.textContent = pre + Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      e.target.querySelectorAll("[data-count]").forEach(count);
      io.unobserve(e.target);
    });
  }, { threshold: 0.2 });
  document.querySelectorAll("[data-r]").forEach(function (el) { io.observe(el); });

  /* calm background: squares drift across and get ticked off at random */
  var cv = document.getElementById("net"), cx = cv.getContext("2d"), items = [], W, H, t = 0, nextAt = 0, laneH = 104;
  function reset(it, x) { it.x = x; it.w = 14 + Math.random() * 10; it.f = false; it.tk = 0; it.h = 0; it.a = 1; it.up = false; }
  function respawn(it) {
    var x, ok = false;
    for (var i = 0; i < 14 && !ok; i++) {
      x = 60 + Math.random() * (W - 120); ok = true;
      for (var j = 0; j < items.length; j++) { var o = items[j]; if (o !== it && o.y === it.y && Math.abs(o.x - x) < 220) { ok = false; break; } }
    }
    if (!ok) {
      var m = it.d > 0 ? -30 : W + 30;
      items.forEach(function (o) { if (o !== it && o.y === it.y && (it.d > 0 ? o.x < m : o.x > m)) m = o.x; });
      x = m - it.d * (220 + Math.random() * 200);
    }
    reset(it, x); it.a = 0; it.up = true;
  }
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight; items = [];
    for (var l = 0, n = Math.ceil(H / laneH); l < n; l++) {
      var sp = .22 + Math.random() * .4, d = Math.random() < .5 ? 1 : -1;
      for (var x = Math.random() * 200; x < W + 60; x += 200 + Math.random() * 220) {
        var it = { y: l * laneH + laneH / 2, s: sp, d: d, p: Math.random() * 6 }; reset(it, x);
        if (still && Math.random() < .35) { it.f = true; it.tk = 1; }
        items.push(it);
      }
    }
  }
  addEventListener("resize", size); size();
  function frame() {
    cx.clearRect(0, 0, W, H);
    var fade = Math.max(.25, 1 - scrollY / (H * 2));
    var now = performance.now();
    if (!still && now > nextAt) {
      nextAt = now + 220 + Math.random() * 260;
      var c = items.filter(function (o) {
        if (o.f || o.x < 30 || o.x > W - 30) return false;
        return !items.some(function (p) { return p.f && p.a > .3 && Math.hypot(p.x - o.x, p.y - o.y) < 200; });
      });
      if (c.length) c[Math.floor(Math.random() * c.length)].f = true;
    }
    items.forEach(function (it) {
      if (!still) {
        it.x += it.s * it.d; if (it.up) { it.a = Math.min(1, it.a + .03); if (it.a >= 1) it.up = false; }
       
        if (it.f) { if (it.tk < 1) it.tk = Math.min(1, it.tk + .03); else if (it.h < 60) it.h++; else { it.a -= .025; if (it.a <= 0) respawn(it); } }
        if ((it.d > 0 && it.x > W + 40) || (it.d < 0 && it.x < -40)) respawn(it);
      }
      var k = it.tk * it.tk * (3 - 2 * it.tk), sz = it.w * (1 + .2 * Math.sin(Math.PI * it.tk)), y = it.y + Math.sin(it.p + t * 2) * 2;
      cx.save(); cx.globalAlpha = fade * it.a; cx.translate(it.x, y);
      cx.strokeStyle = "rgba(" + Math.round(82 - 37 * k) + "," + Math.round(101 + 39 * k) + "," + Math.round(127 + 128 * k) + "," + (.25 + .5 * k) + ")";
      cx.fillStyle = "rgba(45,140,255," + .2 * k + ")"; cx.lineWidth = 1.2;
      cx.beginPath(); cx.roundRect(-sz / 2, -sz / 2, sz, sz, 5); cx.fill(); cx.stroke();
      if (k > 0) {
        cx.lineWidth = 2.2; cx.lineCap = "round"; cx.beginPath(); cx.moveTo(-4, 0);
        if (k < .5) cx.lineTo(-4 + 3 * k * 2, 3.5 * k * 2);
        else { var q = (k - .5) * 2; cx.lineTo(-1, 3.5); cx.lineTo(-1 + 5.5 * q, 3.5 - 7 * q); }
        cx.stroke();
      }
      cx.restore();
    });
    t += .0016; if (!still) requestAnimationFrame(frame);
  }
  frame();

  /* Synapic demo loop */
  var demo = document.getElementById("demo"), typed = document.getElementById("typed"),
      cur = document.getElementById("cur"), cnt = document.getElementById("cnt"), tm = document.getElementById("tm"),
      text = "Machine learning has two main types. Supervised learning trains on labeled data. Unsupervised learning finds patterns in unlabeled data.";
  var tabs = demo.querySelectorAll(".tabs span");
  function goTo(el) { var r = el.getBoundingClientRect(), b = demo.getBoundingClientRect(); cur.style.left = (r.left - b.left + r.width * .55) + "px"; cur.style.top = (r.top - b.top + r.height * .55) + "px"; }
  function click() { cur.classList.remove("k"); void cur.offsetWidth; cur.classList.add("k"); }
  var gen = 0;
  function wait(ms) { var g = gen; return new Promise(function (r) { setTimeout(function () { if (g === gen) r(); }, ms); }); }
  async function loop() {
    for (;;) {
      demo.dataset.step = 0; cur.style.left = "92%"; cur.style.top = "105%"; typed.textContent = ""; cnt.textContent = "0 cards generated"; tm.textContent = "0.0s";
      for (var i = 1; i <= text.length; i++) { typed.textContent = text.slice(0, i); await wait(still ? 0 : 22); }
      await wait(500); demo.dataset.step = 1;
      for (var t = 0; t <= 24; t++) { tm.textContent = (t / 10).toFixed(1) + "s"; await wait(still ? 0 : 60); }
      demo.dataset.step = 2; cnt.textContent = "6 cards generated"; await wait(1800);
      demo.dataset.step = 3; goTo(demo.querySelector(".fc")); await wait(1500);
      click(); demo.dataset.step = 4; await wait(2400);
      goTo(tabs[1]); await wait(1000); click(); demo.dataset.step = 5; cnt.textContent = "Quiz ready"; await wait(4200);
      goTo(tabs[2]); await wait(1000); click(); demo.dataset.step = 6; cnt.textContent = "Summary ready"; await wait(4200);
      cur.style.left = "92%"; cur.style.top = "105%";
    }
  }
  function whenVisible(el, start, stop) {
    var on = false;
    new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      if (!on && e.isIntersecting && (e.intersectionRatio >= .4 || e.intersectionRect.height > innerHeight * .4)) { on = true; start(); }
      else if (on && !e.isIntersecting) { on = false; stop(); }
    }, { threshold: [0, .4] }).observe(el);
  }
  whenVisible(demo.closest(".win"), function () { gen++; loop(); }, function () { gen++; });

  /* Nodefy preview: starts from step 1 each time it scrolls into view */
  var nf = document.getElementById("nf"), timer;
  if (nf) {
    if (still) nf.dataset.s = 3;
    else whenVisible(nf.closest(".win"), function () {
      nf.dataset.s = 1; nf.classList.remove("run"); void nf.offsetWidth; nf.classList.add("run");
      timer = setInterval(function () { nf.dataset.s = (+nf.dataset.s % 3) + 1; }, 2800);
    }, function () { clearInterval(timer); nf.classList.remove("run"); });
  }
})();
