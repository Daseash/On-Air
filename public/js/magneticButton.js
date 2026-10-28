/**
 * Unlumen UI: Magnetic Button Physics Engine
 * Faithfully recreates @unlumen-ui/magnetic-button with damped harmonic spring physics
 * Ultra-performant, zero-overhead, event-isolated implementation.
 */
(function (global) {
  "use strict";

  // Check if touch device with coarse pointer (mobile / tablet)
  const isTouchDevice = () =>
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

  class MagneticButtonInstance {
    constructor(element, options = {}) {
      if (!element || element._magneticInstance) return;
      this.el = element;
      this.el._magneticInstance = this;

      // Unlumen UI properties
      this.strength = parseFloat(
        element.getAttribute("data-magnetic-strength") ||
          options.strength ||
          0.38
      );
      this.stiffness = parseFloat(
        element.getAttribute("data-magnetic-stiffness") ||
          options.stiffness ||
          180
      );
      this.damping = parseFloat(
        element.getAttribute("data-magnetic-damping") ||
          options.damping ||
          16
      );
      this.mass = parseFloat(
        element.getAttribute("data-magnetic-mass") ||
          options.mass ||
          0.1
      );
      this.maxDist = parseFloat(
        element.getAttribute("data-magnetic-max") ||
          options.maxDist ||
          22
      );

      // Spring state
      this.currentX = 0;
      this.currentY = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.vx = 0;
      this.vy = 0;
      this.lastTime = 0;
      this.rafId = null;

      this.step = this.step.bind(this);
      this.bindEvents();
    }

    bindEvents() {
      if (isTouchDevice()) return;

      this.el.addEventListener("pointermove", (e) => {
        const rect = this.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        let pullX = dx * this.strength;
        let pullY = dy * this.strength;

        // Clamp to max distance
        const pullDist = Math.hypot(pullX, pullY);
        if (pullDist > this.maxDist) {
          const ratio = this.maxDist / pullDist;
          pullX *= ratio;
          pullY *= ratio;
        }

        this.targetX = pullX;
        this.targetY = pullY;
        this.startSpring();
      });

      this.el.addEventListener("pointerleave", () => {
        this.targetX = 0;
        this.targetY = 0;
        this.startSpring();
      });
    }

    startSpring() {
      if (!this.rafId) {
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.step);
      }
    }

    step(now) {
      const dt = Math.min((now - this.lastTime) / 1000, 0.033);
      this.lastTime = now;

      // Damped harmonic oscillator simulation
      const fx =
        -this.stiffness * (this.currentX - this.targetX) -
        this.damping * this.vx;
      const ax = fx / this.mass;
      this.vx += ax * dt;
      this.currentX += this.vx * dt;

      const fy =
        -this.stiffness * (this.currentY - this.targetY) -
        this.damping * this.vy;
      const ay = fy / this.mass;
      this.vy += ay * dt;
      this.currentY += this.vy * dt;

      // Apply GPU-accelerated transform
      this.el.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;

      // Check if settled at rest
      const isAtRest =
        Math.abs(this.currentX - this.targetX) < 0.1 &&
        Math.abs(this.currentY - this.targetY) < 0.1 &&
        Math.abs(this.vx) < 0.1 &&
        Math.abs(this.vy) < 0.1;

      if (isAtRest) {
        this.currentX = this.targetX;
        this.currentY = this.targetY;
        this.vx = 0;
        this.vy = 0;
        if (this.targetX === 0 && this.targetY === 0) {
          this.el.style.transform = "";
        } else {
          this.el.style.transform = `translate3d(${this.targetX.toFixed(2)}px, ${this.targetY.toFixed(2)}px, 0)`;
        }
        this.rafId = null;
        return;
      }

      this.rafId = requestAnimationFrame(this.step);
    }
  }

  function register(element, options) {
    if (!element || element._magneticInstance) return;
    new MagneticButtonInstance(element, options);
  }

  function initAll() {
    const selector = [
      ".btn",
      ".magnetic-btn",
      "[data-magnetic]",
      ".nav-skiper58-trigger",
      ".nav-menu-btn",
      ".nav-icon-btn",
      ".nav-host-link",
      ".hs-submit",
      ".skiper47-btn",
      ".wishlist-btn",
      ".skiper58-close-btn",
      ".rag-chat-pill",
      ".rag-chat-fab",
      "#nav-search-btn",
    ].join(", ");

    const targets = document.querySelectorAll(selector);
    targets.forEach((target) => register(target));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.MagneticButton = {
    register,
    initAll,
  };
})(window);
