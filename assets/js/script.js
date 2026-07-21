/* Personal site interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Footer year ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Header shadow on scroll ---
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // --- Mobile nav toggle ---
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    var closeMenu = function () {
      menu.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close menu when a link is tapped
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMenu);
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        closeMenu();
        toggle.focus();
      }
    });
    // Close when tapping outside the header
    document.addEventListener("click", function (e) {
      if (menu.classList.contains("open") && !e.target.closest(".site-header")) {
        closeMenu();
      }
    });
  }

  // --- Count-up animation for hero stats ---
  var animateCount = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (isNaN(target)) return;
    var suffix = (el.textContent.match(/[^\d]+$/) || [""])[0]; // e.g. "+" or "%"
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null;
    var duration = 1100;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // --- Reveal on scroll (+ trigger count-up when hero stats appear) ---
  var revealEls = document.querySelectorAll(".reveal");
  var onReveal = function (el) {
    el.classList.add("in");
    el.querySelectorAll("strong[data-count]").forEach(animateCount);
  };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            onReveal(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(onReveal);
  }

  // --- Scrollspy: highlight the nav link for the section in view ---
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".nav-menu a[href^='#']")
  );
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var setActive = function (id) {
      navLinks.forEach(function (a) {
        if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    };
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (s) { spy.observe(s); });
  }

  // --- Email reveal (basic obfuscation against scrapers) ---
  var emailUser = "zhenia.steger";
  var emailDomain = "gmail.com";
  var emailBtn = document.getElementById("email-btn");
  if (emailBtn) {
    emailBtn.addEventListener("click", function (e) {
      e.preventDefault();
      var address = emailUser + "@" + emailDomain;
      emailBtn.textContent = address;
      emailBtn.setAttribute("href", "mailto:" + address);
      emailBtn.removeAttribute("id");
    });
  }
})();
