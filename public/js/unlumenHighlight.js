/**
 * Unlumen UI: Highlight Component Engine
 * Recreates the animated highlight component that tracks elements with smooth spring animations.
 * (unlumen-ui-docs.vercel.app/docs/ui/unlumen/highlight)
 */
(function (global) {
  "use strict";

  class UnlumenHighlightTrack {
    constructor(container) {
      if (!container || container._unlumenHighlightInstance) return;
      this.container = container;
      this.container._unlumenHighlightInstance = this;

      // Ensure single floating highlight pill
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
      this.observer = null;

      this.init();
    }

    init() {
      this.updateActiveItem();

      // Bind events to each item
      this.items.forEach((item) => {
        item.addEventListener("pointerenter", () => this.handleItemEnter(item));
        item.addEventListener("focus", () => this.handleItemEnter(item));
      });

      // Pointer leaves the track container -> spring back to active item
      this.container.addEventListener("pointerleave", () => this.handleTrackLeave());
      this.container.addEventListener("focusout", (e) => {
        if (!this.container.contains(e.relatedTarget)) {
          this.handleTrackLeave();
        }
      });

      // MutationObserver watches for external active class changes (e.g. scrollspy, click handlers)
      if ("MutationObserver" in window) {
        this.observer = new MutationObserver(() => {
          this.updateActiveItem();
          if (!this.hoveredItem) {
            this.syncToCurrent();
          }
        });

        this.items.forEach((item) => {
          this.observer.observe(item, {
            attributes: true,
            attributeFilter: ["class"],
          });
        });
      }

      // Sync on resize and horizontal scroll
      window.addEventListener("resize", () => this.syncToCurrent(), { passive: true });
      this.container.addEventListener("scroll", () => this.syncToCurrent(), { passive: true });

      // Staged initial positioning to account for webfont rendering
      requestAnimationFrame(() => this.syncToCurrent());
      setTimeout(() => this.syncToCurrent(), 60);
      setTimeout(() => this.syncToCurrent(), 250);
    }

    updateActiveItem() {
      this.activeItem =
        this.items.find((item) => item.classList.contains("active")) ||
        this.items[0] ||
        null;
      return this.activeItem;
    }

    handleItemEnter(item) {
      this.hoveredItem = item;
      this.movePillTo(item);
    }

    handleTrackLeave() {
      this.hoveredItem = null;
      this.updateActiveItem();
      if (this.activeItem) {
        this.movePillTo(this.activeItem);
      } else {
        this.hidePill();
      }
    }

    movePillTo(target) {
      if (!target) return;

      const left = target.offsetLeft;
      const top = target.offsetTop;
      const width = target.offsetWidth;
      const height = target.offsetHeight;

      this.pill.style.transform = `translate3d(${left}px, ${top}px, 0)`;
      this.pill.style.width = `${width}px`;
      this.pill.style.height = `${height}px`;
      this.pill.classList.add("is-active");

      // Set highlighted class on target, remove from others
      this.items.forEach((item) => {
        item.classList.toggle("is-highlighted", item === target);
      });
    }

    hidePill() {
      this.pill.classList.remove("is-active");
      this.items.forEach((item) => item.classList.remove("is-highlighted"));
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

  function updateAll() {
    const containers = document.querySelectorAll(
      "[data-unlumen-highlight], .categories-scroll, .unlumen-highlight-track"
    );
    containers.forEach((c) => {
      if (c._unlumenHighlightInstance) {
        c._unlumenHighlightInstance.updateActiveItem();
        c._unlumenHighlightInstance.syncToCurrent();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.UnlumenHighlight = {
    initAll,
    updateAll,
    Track: UnlumenHighlightTrack,
  };
})(window);
