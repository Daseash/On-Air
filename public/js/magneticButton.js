/**
 * Unlumen UI: Magnetic Button Physics Engine
 * Faithfully recreates @unlumen-ui/magnetic-button with damped harmonic spring physics
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
      this.radius = parseFloat(
        element.getAttribute("data-magnetic-radius") ||
          options.radius ||
          100
      );
      this.strength = parseFloat(
        element.getAttribute("data-magnetic-strength") ||
          options.strength ||
          0.45
      );
      this.stiffness = parseFloat(
        element.getAttribute("data-magnetic-stiffness") ||
          options.stiffness ||
          160
      );
      this.damping = parseFloat(
        element.getAttribute("data-magnetic-damping") ||
          options.damping ||
          15
      );
      this.mass = parseFloat(
        element.getAttribute("data-magnetic-mass") ||
          options.mass ||
          0.1
      );

      // Max allowable translation in px to prevent breaking layouts
      this.maxDist = parseFloat(
        element.getAttribute("data-magnetic-max") ||
          options.maxDist ||
          28
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
      this.rect = null;
      this.isHovered = false;

      this.step = this.step.bind(this);
      this.updateRect();
    }

    updateRect() {
      if (!this.el.isConnected) return null;
      this.rect = this.el.getBoundingClientRect();
      return this.rect;
    }

    onPointerMove(clientX, clientY) {
      if (isTouchDevice()) return;

      if (!this.rect) {
        this.updateRect();
        if (!this.rect) return;
      }

      const centerX = this.rect.left + this.rect.width / 2;
      const centerY = this.rect.top + this.rect.height / 2;
      const dx = clientX - centerX;
      const dy = clientY - centerY;
      const distSq = dx * dx + dy * dy;

      // Effective activation radius: either explicit radius or bounds + margin
      const effectiveRadius = Math.max(
        this.radius,
        Math.max(this.rect.width, this.rect.height) * 0.75
      );

      if (distSq < effectiveRadius * effectiveRadius) {
        const dist = Math.sqrt(distSq);
        // Magnetic pull factor: strongest at center, smoothly decaying towards boundary
        const pull = 1 - (dist / effectiveRadius) * 0.35;
        let pullX = dx * this.strength * pull;
        let pullY = dy * this.strength * pull;

        // Clamp to max distance
        const pullDist = Math.hypot(pullX, pullY);
        if (pullDist > this.maxDist) {
          const ratio = this.maxDist / pullDist;
          pullX *= ratio;
          pullY *= ratio;
        }

        this.targetX = pullX;
        this.targetY = pullY;
        this.isHovered = true;
        this.startSpring();
      } else if (this.isHovered) {
        this.isHovered = false;
        this.targetX = 0;
        this.targetY = 0;
        this.startSpring();
      }
    }

    onPointerLeave() {
      this.isHovered = false;
      this.targetX = 0;
      this.targetY = 0;
      this.startSpring();
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
        Math.abs(this.currentX - this.targetX) < 0.08 &&
        Math.abs(this.currentY - this.targetY) < 0.08 &&
        Math.abs(this.vx) < 0.08 &&
        Math.abs(this.vy) < 0.08;

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

    destroy() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      this.el.style.transform = "";
      delete this.el._magneticInstance;
    }
  }

  // Global Manager
  const instances = new Set();
  let rectUpdateTimer = null;

  function register(element, options) {
    if (!element || element._magneticInstance) return;
    const instance = new MagneticButtonInstance(element, options);
    instances.add(instance);
  }

  function refreshAllRects() {
    instances.forEach((inst) => {
      if (!inst.el.isConnected) {
        inst.destroy();
        instances.delete(inst);
      } else {
        inst.updateRect();
      }
    });
  }

  function handlePointerMove(e) {
    if (isTouchDevice()) return;
    const x = e.clientX;
    const y = e.clientY;
    instances.forEach((inst) => inst.onPointerMove(x, y));
  }

  function handlePointerLeave() {
    instances.forEach((inst) => inst.onPointerLeave());
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

    refreshAllRects();
  }

  // Event Listeners
  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("mouseleave", handlePointerLeave, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      if (!rectUpdateTimer) {
        rectUpdateTimer = setTimeout(() => {
          refreshAllRects();
          rectUpdateTimer = null;
        }, 120);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", refreshAllRects, { passive: true });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.MagneticButton = {
    register,
    initAll,
    refreshAllRects,
  };
})(window);
