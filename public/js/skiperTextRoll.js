/**
 * Skiper 58: Text Roll Navigation Engine
 * Recreates staggered character animations from skiper-ui.com/v1/skiper58
 */
(function (global) {
  "use strict";

  const STAGGER = 0.032;

  function initTextRollElements() {
    const targets = document.querySelectorAll(".text-roll, [data-text-roll]");

    targets.forEach((el) => {
      if (el._textRollInitialized) return;
      el._textRollInitialized = true;

      const text = el.getAttribute("data-text-roll") || el.textContent.trim();
      if (!text) return;

      const isCentered = el.hasAttribute("data-center") || el.classList.contains("text-roll-center");
      const len = text.length;

      let html = "";
      for (let i = 0; i < len; i++) {
        const char = text[i];
        const displayChar = char === " " ? "&nbsp;" : char;
        const delay = isCentered
          ? STAGGER * Math.abs(i - (len - 1) / 2)
          : STAGGER * i;

        html += `<span class="text-roll-char" style="--roll-delay: ${delay.toFixed(3)}s">` +
          `<span class="text-roll-current">${displayChar}</span>` +
          `<span class="text-roll-clone">${displayChar}</span>` +
          `</span>`;
      }

      el.innerHTML = html;
    });
  }

  function initOverlayEvents() {
    const overlay = document.getElementById("skiper58-overlay");
    if (!overlay) return;

    const openBtns = document.querySelectorAll("[data-skiper58-open]");
    const closeBtns = document.querySelectorAll("[data-skiper58-close]");

    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        overlay.classList.add("is-open");
        document.body.style.overflow = "hidden";
      });
    });

    const closeOverlay = () => {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    };

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", closeOverlay);
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        closeOverlay();
      }
    });
  }

  function initAll() {
    initTextRollElements();
    initOverlayEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.initTextRoll = initTextRollElements;
})(window);

