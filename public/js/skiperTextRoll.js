/**
 * Skiper 58: Text Roll Navigation & Staggered Character Roll Engine
 * Faithfully recreates Skiper UI skiper58 (skiper-ui.com/v1/skiper58)
 */
(function (global) {
  "use strict";

  const STAGGER = 0.035; // 35ms stagger per character (exact Skiper 58 parameter)

  /**
   * Transforms an element's text into dual-layer staggered character rolls
   * @param {HTMLElement} element
   * @param {Object} options
   */
  function createTextRoll(element, options = {}) {
    if (!element || element._textRollInitialized) return;
    element._textRollInitialized = true;

    const rawText = (
      element.getAttribute("data-text-roll") ||
      element.textContent ||
      ""
    ).trim();

    if (!rawText) return;

    const isCenter =
      options.center !== undefined
        ? options.center
        : element.getAttribute("data-center") === "true";

    const letters = rawText.split("");
    const len = letters.length;
    const centerPoint = (len - 1) / 2;

    element.classList.add("skiper58-roll");
    element.setAttribute("aria-label", rawText);

    // Front track (visible by default, rolls up on hover)
    const frontTrack = document.createElement("span");
    frontTrack.className = "roll-track roll-front";
    frontTrack.setAttribute("aria-hidden", "true");

    // Back track (hidden below by default, rolls up into view on hover)
    const backTrack = document.createElement("span");
    backTrack.className = "roll-track roll-back";
    backTrack.setAttribute("aria-hidden", "true");

    letters.forEach((char, i) => {
      const delay = isCenter
        ? STAGGER * Math.abs(i - centerPoint)
        : STAGGER * i;

      const delayStyle = `transition-delay: ${delay.toFixed(4)}s;`;

      // Front character
      const frontSpan = document.createElement("span");
      frontSpan.className = "roll-letter" + (char === " " ? " is-space" : "");
      frontSpan.style.cssText = delayStyle;
      frontSpan.innerHTML = char === " " ? "&nbsp;" : char;
      frontTrack.appendChild(frontSpan);

      // Back character
      const backSpan = document.createElement("span");
      backSpan.className = "roll-letter" + (char === " " ? " is-space" : "");
      backSpan.style.cssText = delayStyle;
      backSpan.innerHTML = char === " " ? "&nbsp;" : char;
      backTrack.appendChild(backSpan);
    });

    // Screen reader accessible copy
    const srOnly = document.createElement("span");
    srOnly.className = "visually-hidden";
    srOnly.textContent = rawText;

    // Clear original text and mount tracks
    element.innerHTML = "";
    element.appendChild(frontTrack);
    element.appendChild(backTrack);
    element.appendChild(srOnly);
  }

  /**
   * Initializes all matching text roll targets in document
   */
  function initAllTextRolls() {
    const targets = document.querySelectorAll("[data-text-roll], .text-roll");
    targets.forEach((target) => {
      const isCenter = target.getAttribute("data-center") === "true";
      createTextRoll(target, { center: isCenter });
    });
  }

  /**
   * Manages the Skiper 58 Fullscreen Navigation Overlay
   */
  function initSkiper58Overlay() {
    const overlay = document.getElementById("skiper58-overlay");
    if (!overlay) return;

    const openBtns = document.querySelectorAll("[data-skiper58-open]");
    const closeBtns = document.querySelectorAll("[data-skiper58-close]");

    function openOverlay() {
      overlay.classList.add("is-active");
      document.body.classList.add("skiper58-overlay-open");
      const firstLink = overlay.querySelector(".skiper58-link");
      if (firstLink) firstLink.focus();
    }

    function closeOverlay() {
      overlay.classList.remove("is-active");
      document.body.classList.remove("skiper58-overlay-open");
    }

    openBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openOverlay();
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        closeOverlay();
      });
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlay.classList.contains("is-active")) {
        closeOverlay();
      }
    });

    // Backdrop click to close
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        closeOverlay();
      }
    });
  }

  function init() {
    initAllTextRolls();
    initSkiper58Overlay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.Skiper58 = {
    createTextRoll,
    initAllTextRolls,
    initSkiper58Overlay,
  };
})(window);
