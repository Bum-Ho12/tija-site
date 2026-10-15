// Tija site behaviour: theme toggle, mobile menu, "On this page" contents,
// copy buttons, FAQ filter and scroll reveal. Every feature is optional:
// pages work without JavaScript.
(function () {
  "use strict";

  var root = document.documentElement;

  function storedTheme() {
    try { return localStorage.getItem("tija-theme"); } catch (e) { return null; }
  }

  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Theme toggle. The early inline script in <head> applies the saved choice
  // before first paint; this only handles clicks.
  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme") || (systemDark() ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try {
        // Forget the override when it matches the system, so later system
        // changes are followed again.
        if ((next === "dark") === systemDark()) localStorage.removeItem("tija-theme");
        else localStorage.setItem("tija-theme", next);
      } catch (e) { /* storage unavailable: the choice lasts for this page */ }
    });
  });
  if (!storedTheme()) root.removeAttribute("data-theme");

  // Mobile menu.
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) {
        nav.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.focus();
      }
    });
  }

  // Guide sidebar: open on wide screens, collapsed into a menu on phones.
  var sidebar = document.querySelector(".guide-sidebar details");
  if (sidebar && window.matchMedia) {
    var wide = window.matchMedia("(min-width: 960px)");
    var syncSidebar = function () { sidebar.open = wide.matches; };
    syncSidebar();
    if (wide.addEventListener) wide.addEventListener("change", syncSidebar);
  }

  // "On this page" contents, built from the article's h2 headings.
  var toc = document.querySelector(".toc ul");
  var article = document.querySelector(".prose");
  if (toc && article) {
    var headings = article.querySelectorAll("h2[id]");
    headings.forEach(function (h) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      toc.appendChild(li);
    });
    if (!headings.length) toc.closest(".toc").hidden = true;

    if ("IntersectionObserver" in window && headings.length) {
      var links = toc.querySelectorAll("a");
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (l) {
            l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, { rootMargin: "0px 0px -70% 0px" });
      headings.forEach(function (h) { spy.observe(h); });
    }
  }

  // Copy buttons on code blocks.
  document.querySelectorAll(".code-block").forEach(function (block) {
    var pre = block.querySelector("pre");
    if (!pre || !navigator.clipboard) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Copy";
    btn.addEventListener("click", function () {
      navigator.clipboard.writeText(pre.innerText.trim()).then(function () {
        btn.textContent = "Copied";
        setTimeout(function () { btn.textContent = "Copy"; }, 1600);
      }, function () {
        btn.textContent = "Press Ctrl+C";
      });
    });
    block.appendChild(btn);
  });

  // FAQ filter.
  var search = document.getElementById("faq-search");
  if (search) {
    var items = document.querySelectorAll(".faq details");
    var empty = document.getElementById("faq-empty");
    var status = document.getElementById("faq-status");
    search.hidden = false;
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        item.hidden = !match;
        if (match) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = q ? shown + (shown === 1 ? " question" : " questions") + " found" : "";
    });
    // Open the question linked from another page.
    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target && target.tagName === "DETAILS") target.open = true;
    }
  }

  // Gentle reveal on scroll.
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }
})();
