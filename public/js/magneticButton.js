/**
 * Unlumen UI: Magnetic Button Physics Engine
 * Recreates @unlumen-ui/magnetic-button
 * Per-element isolated pointer physics, zero global listeners.
 */
(function (global) {
  "use strict";

  class MagneticButton {
    constructor(element, options = {}) {
      if (!element || element._magneticInstance) return;
      this.el = element;
      this.el._magneticInstance = this;

      this.strength = parseFloat(options.strength || 0.35);
      this.maxDist = parseFloat(options.maxDist || 20);

      this.init();
    }

    init() {
      this.el.addEventListener("pointermove", (e) => {
        const rect = this.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * this.strength;
        const deltaY = (e.clientY - centerY) * this.strength;

        const clampedX = Math.max(-this.maxDist, Math.min(this.maxDist, deltaX));
        const clampedY = Math.max(-this.maxDist, Math.min(this.maxDist, deltaY));

        this.el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
      });

      this.el.addEventListener("pointerleave", () => {
        this.el.style.transform = "translate3d(0, 0, 0)";
      });
    }
  }

  function initAll() {
    const targets = document.querySelectorAll(
      "[data-magnetic], .btn-magnetic, .hs-submit, .filter-trigger-btn, .nav-skiper58-trigger, .skiper47-btn"
    );
    targets.forEach((el) => new MagneticButton(el));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.MagneticButton = MagneticButton;
})(window);

