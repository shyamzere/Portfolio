(function () {
  "use strict";
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* scroll progress */
  var bar = document.getElementById("bar");
  window.addEventListener("scroll", function () {
    var h = document.documentElement;
    bar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100 + "%";
  }, { passive: true });

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

  /* neural network background */
  var cv = document.getElementById("net"), cx = cv.getContext("2d"), pts = [], mouse = { x: -999, y: -999 }, W, H;
  function size() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    var n = Math.min(90, Math.floor(W * H / 16000));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 });
  }
  addEventListener("resize", size); size();
  addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  function draw() {
    cx.clearRect(0, 0, W, H);
    var fade = Math.max(0.25, 1 - scrollY / (H * 2));
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i];
      if (!still) { a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      var dm = Math.hypot(a.x - mouse.x, a.y - mouse.y), hot = dm < 160;
      cx.beginPath(); cx.arc(a.x, a.y, hot ? 3.4 : 2.2, 0, 6.3);
      cx.fillStyle = "rgba(45,140,255," + (hot ? .9 : .5) * fade + ")"; cx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          cx.strokeStyle = "rgba(45,140,255," + (1 - d / 130) * .28 * fade + ")";
          cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(b.x, b.y); cx.stroke();
        }
      }
      if (hot) { cx.strokeStyle = "rgba(23,102,209," + (1 - dm / 160) * .5 + ")"; cx.beginPath(); cx.moveTo(a.x, a.y); cx.lineTo(mouse.x, mouse.y); cx.stroke(); }
    }
    if (!still) requestAnimationFrame(draw);
  }
  draw();

  /* Synapic demo loop */
  var demo = document.getElementById("demo"), typed = document.getElementById("typed"),
      cnt = document.getElementById("cnt"), tm = document.getElementById("tm"),
      text = "Machine learning has two main types. Supervised learning trains on labeled data. Unsupervised learning finds patterns in unlabeled data.";
  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  async function loop() {
    for (;;) {
      demo.dataset.step = 0; typed.textContent = ""; cnt.textContent = "0 cards generated"; tm.textContent = "0.0s";
      for (var i = 1; i <= text.length; i++) { typed.textContent = text.slice(0, i); await wait(still ? 0 : 22); }
      await wait(500); demo.dataset.step = 1;
      for (var t = 0; t <= 24; t++) { tm.textContent = (t / 10).toFixed(1) + "s"; await wait(still ? 0 : 60); }
      demo.dataset.step = 2; cnt.textContent = "6 cards generated"; await wait(1800);
      demo.dataset.step = 3; await wait(2800);
    }
  }
  loop();
})();
