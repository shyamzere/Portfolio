(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- hero entrance, once ---- */
  var heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    if (reduceMotion) {
      heroTitle.classList.add("is-in");
    } else {
      requestAnimationFrame(function () {
        setTimeout(function () { heroTitle.classList.add("is-in"); }, 80);
      });
    }
  }

  /* ---- scroll reveal for sections/cards ---- */
  var revealEls = document.querySelectorAll("[data-reveal]:not(.hero-title)");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---- active nav link + thread dot position ---- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);
  var thread = document.querySelector(".thread");

  function setActive(index) {
    navLinks.forEach(function (link, i) {
      link.classList.toggle("is-active", i === index);
    });
    if (thread && navLinks[index]) {
      var railNav = document.querySelector(".rail-nav");
      var linkTop = navLinks[index].offsetTop + navLinks[index].offsetHeight / 2;
      thread.style.setProperty("--dot-y", linkTop + "px");
      thread.style.setProperty("--_dot", "1");
      var style = document.getElementById("dot-style") || document.createElement("style");
      style.id = "dot-style";
      style.textContent = ".thread::after{ top:" + linkTop + "px; }";
      document.head.appendChild(style);
    }
  }

  if (sections.length && "IntersectionObserver" in window) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var idx = sections.indexOf(entry.target);
            if (idx > -1) setActive(idx);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
    setActive(0);
  }

  /* ---- cursor glow, desktop pointer only, ignored on touch/reduced motion ---- */
  var glow = document.querySelector(".glow");
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (glow && canHover && !reduceMotion) {
    var raf = null;
    window.addEventListener("mousemove", function (e) {
      glow.classList.add("is-active");
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        glow.style.left = e.clientX + "px";
        glow.style.top = e.clientY + "px";
      });
    });
    window.addEventListener("mouseleave", function () {
      glow.classList.remove("is-active");
    });
  }
})();
