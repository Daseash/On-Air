/**
 * Unlumen UI: Animated Spring Highlight Tracking Component
 * Recreates @unlumen-ui/highlight
 * Safe, zero-recursion, event-driven implementation.
 */
(function (global) {
  "use strict";

  class UnlumenHighlightTrack {
    constructor(container) {
      if (!container || container._unlumenHighlightInstance) return;
      this.container = container;
      this.container._unlumenHighlightInstance = this;

      // Find or create single floating highlight pill
      this.pill = this.container.querySelector(".unlumen-highlight-pill");
      if (!this.pill) {
        this.pill = document.createElement("div");
        this.pill.className = "unlumen-highlight-pill";
        this.pill.setAttribute("aria-hidden", "true");
        this.container.prepend(this.pill);
      }

      this.items = Array.from(
        this.container.querySelectorAll(".category-pill, .unlumen-highlight-item")
      );

      this.activeItem = null;
      this.hoveredItem = null;

      this.init();
    }

    init() {
      this.updateActiveItem();

      // Bind hover events to items
      this.items.forEach((item) => {
        item.addEventListener("pointerenter", () => {
          this.hoveredItem = item;
          this.movePillTo(item);
        });

        item.addEventListener("click", () => {
          this.items.forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
          this.activeItem = item;
          this.movePillTo(item);
        });
      });

      // When pointer leaves the container, glide back to active item
      this.container.addEventListener("pointerleave", () => {
        this.hoveredItem = null;
        this.updateActiveItem();
        if (this.activeItem) {
          this.movePillTo(this.activeItem);
        } else {
          this.pill.classList.remove("is-active");
        }
      });

      // Update position on window resize
      window.addEventListener("resize", () => this.syncToCurrent(), { passive: true });

      // Staged initial positioning after render
      setTimeout(() => this.syncToCurrent(), 60);
      setTimeout(() => this.syncToCurrent(), 220);
    }

    updateActiveItem() {
      this.activeItem =
        this.items.find((item) => item.classList.contains("active")) ||
        this.items[0] ||
        null;
      return this.activeItem;
    }

    movePillTo(target) {
      if (!target || !this.pill) return;

      const left = target.offsetLeft;
      const top = target.offsetTop;
      const width = target.offsetWidth;
      const height = target.offsetHeight;

      this.pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      this.pill.style.width = `${width}px`;
      this.pill.style.height = `${height}px`;
      this.pill.classList.add("is-active");
    }

    syncToCurrent() {
      const target = this.hoveredItem || this.updateActiveItem();
      if (target) {
        this.movePillTo(target);
      }
    }
  }

  function initAll() {
    const containers = document.querySelectorAll(
      "[data-unlumen-highlight], .categories-scroll, .unlumen-highlight-track"
    );
    containers.forEach((c) => new UnlumenHighlightTrack(c));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.UnlumenHighlight = {
    initAll,
    Track: UnlumenHighlightTrack,
  };
})(window);

