/**
 * Skiper 5: "Things Drag and Scroll" Physics Engine
 * Recreates the physics, momentum, touch/pointer inertia, and grab interactions of Skiper-UI skiper5.
 */
(function (global) {
  "use strict";

  class SkiperScroll {
    constructor(element, options = {}) {
      if (!element) return;
      this.el = element;
      this.options = Object.assign(
        {
          friction: 0.94,           // Inertia decay factor (0.90 = stops quicker, 0.98 = slides longer)
          velocityMultiplier: 1.25, // Kinetic throw boost
          threshold: 6,             // Min movement in px to initiate drag vs click
          arrowScrollRatio: 0.7,    // Viewport width multiplier on arrow click
        },
        options
      );

      this.isDown = false;
      this.startX = 0;
      this.scrollStart = 0;
      this.hasMoved = false;
      this.velocity = 0;
      this.lastX = 0;
      this.lastTime = 0;
      this.rafId = null;

      this.wrapper = this.el.closest(".skiper-scroll-wrapper");
      this.prevBtn = this.wrapper ? this.wrapper.querySelector(".skiper-prev") : null;
      this.nextBtn = this.wrapper ? this.wrapper.querySelector(".skiper-next") : null;

      this.init();
    }

    init() {
      // Bind event listeners with proper this context
      this.onPointerDown = this.handlePointerDown.bind(this);
      this.onPointerMove = this.handlePointerMove.bind(this);
      this.onPointerUp = this.handlePointerUp.bind(this);
      this.onWheel = this.handleWheel.bind(this);
      this.onScroll = this.updateArrows.bind(this);

      this.el.addEventListener("mousedown", this.onPointerDown, { passive: false });
      this.el.addEventListener("touchstart", this.onPointerDown, { passive: true });
      this.el.addEventListener("wheel", this.onWheel, { passive: false });
      this.el.addEventListener("scroll", this.onScroll, { passive: true });

      // Click suppressor on drag
      this.el.addEventListener("click", this.handleClickCapture.bind(this), true);

      // Arrow navigation
      if (this.prevBtn) {
        this.prevBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollByAmount(-1);
        });
      }
      if (this.nextBtn) {
        this.nextBtn.addEventListener("click", (e) => {
          e.preventDefault();
          this.scrollByAmount(1);
        });
      }

      // Initial arrow state
      this.updateArrows();
      window.addEventListener("resize", () => this.updateArrows(), { passive: true });
    }

    handlePointerDown(e) {
      // Ignore right click or clicks on arrow buttons
      if (e.type === "mousedown" && e.button !== 0) return;
      if (e.target.closest(".skiper-arrow")) return;

      this.cancelMomentum();

      this.isDown = true;
      this.hasMoved = false;
      const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
      this.startX = clientX;
      this.lastX = clientX;
      this.scrollStart = this.el.scrollLeft;
      this.lastTime = performance.now();
      this.velocity = 0;

      // Listen for moves and releases on document to prevent dropping when cursor leaves bounds
      document.addEventListener("mousemove", this.onPointerMove, { passive: false });
      document.addEventListener("touchmove", this.onPointerMove, { passive: false });
      document.addEventListener("mouseup", this.onPointerUp);
      document.addEventListener("touchend", this.onPointerUp);
      document.addEventListener("touchcancel", this.onPointerUp);
    }

    handlePointerMove(e) {
      if (!this.isDown) return;

      const clientX = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - this.startX;

      if (!this.hasMoved && Math.abs(deltaX) > this.options.threshold) {
        this.hasMoved = true;
        this.el.classList.add("is-grabbing");
        document.body.classList.add("skiper-active-dragging");
      }

      if (this.hasMoved) {
        // Prevent default scrolling on vertical axis if dragging horizontally
        if (e.cancelable) e.preventDefault();

        // 1:1 responsive physics displacement
        this.el.scrollLeft = this.scrollStart - deltaX;

        // Calculate velocity (pixels / ms)
        const now = performance.now();
        const dt = now - this.lastTime;
        if (dt > 8) {
          const moveDelta = clientX - this.lastX;
          // Normalised to approx 60fps frame displacement
          this.velocity = (moveDelta / dt) * 16.67 * this.options.velocityMultiplier;
          this.lastX = clientX;
          this.lastTime = now;
        }
      }
    }

    handlePointerUp() {
      if (!this.isDown) return;
      this.isDown = false;

      this.el.classList.remove("is-grabbing");
      document.body.classList.remove("skiper-active-dragging");

      document.removeEventListener("mousemove", this.onPointerMove);
      document.removeEventListener("touchmove", this.onPointerMove);
      document.removeEventListener("mouseup", this.onPointerUp);
      document.removeEventListener("touchend", this.onPointerUp);
      document.removeEventListener("touchcancel", this.onPointerUp);

      // If user performed an actual drag gesture, kick off physics momentum glide
      if (this.hasMoved) {
        this.startMomentum();
      }
    }

    startMomentum() {
      this.cancelMomentum();
      if (Math.abs(this.velocity) < 0.8) return;

      const step = () => {
        if (Math.abs(this.velocity) < 0.2) {
          this.cancelMomentum();
          this.updateArrows();
          return;
        }

        // Apply kinetic movement
        this.el.scrollLeft -= this.velocity;
        this.velocity *= this.options.friction;

        this.updateArrows();
        this.rafId = requestAnimationFrame(step);
      };

      this.rafId = requestAnimationFrame(step);
    }

    cancelMomentum() {
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
    }

    handleClickCapture(e) {
      // If user was dragging, suppress the click on cards/links to avoid unwanted navigation
      if (this.hasMoved) {
        e.preventDefault();
        e.stopPropagation();
        this.hasMoved = false;
      }
    }

    handleWheel(e) {
      // If shift is held or deltaX is prominent, let native or horizontal take over
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // Allow smooth horizontal scroll when scrolling mouse wheel over the track
      if (e.deltaY !== 0 && !e.shiftKey) {
        e.preventDefault();
        this.cancelMomentum();
        this.el.scrollBy({
          left: e.deltaY * 1.5,
          behavior: "auto",
        });
        this.updateArrows();
      }
    }

    scrollByAmount(direction) {
      this.cancelMomentum();
      const distance = this.el.clientWidth * this.options.arrowScrollRatio * direction;
      this.el.scrollBy({
        left: distance,
        behavior: "smooth",
      });
      setTimeout(() => this.updateArrows(), 350);
    }

    updateArrows() {
      if (!this.prevBtn && !this.nextBtn) return;
      const tolerance = 6;
      const atStart = this.el.scrollLeft <= tolerance;
      const atEnd = this.el.scrollLeft + this.el.clientWidth >= this.el.scrollWidth - tolerance;

      if (this.prevBtn) {
        this.prevBtn.classList.toggle("is-hidden", atStart);
      }
      if (this.nextBtn) {
        this.nextBtn.classList.toggle("is-hidden", atEnd);
      }
    }
  }

  // Auto-init on page load
  function initAllSkiperScrollers() {
    const targets = document.querySelectorAll(".skiper-scroll, [data-skiper-scroll], #category-scroll");
    targets.forEach((target) => {
      if (!target._skiperInstance) {
        target._skiperInstance = new SkiperScroll(target);
      }
    });
  }

  /**
   * Skiper 47: 3D Perspective Coverflow Carousel Initialization
   * Exact match for skiper-ui.com/v1/skiper47 Carousel_001
   */
  function initSkiper47Carousels() {
    if (typeof Swiper === "undefined") {
      setTimeout(initSkiper47Carousels, 60);
      return;
    }

    const swiperContainers = document.querySelectorAll(".skiper47-swiper");
    swiperContainers.forEach((container) => {
      if (container.swiper) return;

      const slides = container.querySelectorAll(".swiper-slide");
      const slideCount = slides.length;
      if (slideCount === 0) return;

      try {
        new Swiper(container, {
          effect: "coverflow",
          grabCursor: true,
          centeredSlides: true,
          loop: slideCount >= 4,
          loopAdditionalSlides: 2,
          slidesPerView: 1.25,
          spaceBetween: 20,
          coverflowEffect: {
            rotate: 0,
            slideShadows: false,
            stretch: 0,
            depth: 100,
            modifier: 2.5,
          },
          breakpoints: {
            640: {
              slidesPerView: 1.75,
              spaceBetween: 28,
            },
            1024: {
              slidesPerView: 2.43,
              spaceBetween: 36,
            },
          },
          pagination: {
            el: container.querySelector(".skiper47-pagination"),
            clickable: true,
          },
          navigation: {
            nextEl: container.querySelector(".skiper47-btn-next"),
            prevEl: container.querySelector(".skiper47-btn-prev"),
          },
          keyboard: {
            enabled: true,
            onlyInViewport: true,
          },
        });
      } catch (err) {
        console.warn("Skiper 47 Swiper initialization notice:", err);
      }
    });
  }

  /**
   * Category Bar Smooth Navigation & Scroll Spy Synchronization
   */
  function initCategoryBarSync() {
    const catScroll = document.getElementById("category-scroll");
    if (!catScroll) return;

    const categoryMap = {
      all: "section-all",
      beach: "section-beach",
      "amazing-views": "section-views",
      trending: "section-trending",
      cabin: "section-cabins",
      city: "section-cities",
    };

    const pills = catScroll.querySelectorAll(".category-pill");
    pills.forEach((pill) => {
      pill.addEventListener("click", function (e) {
        const cat = pill.getAttribute("data-category");
        const targetId = categoryMap[cat];
        const targetSection = targetId ? document.getElementById(targetId) : null;

        // If current page contains the section (e.g. Home page), smooth scroll instead of page reload
        if (targetSection) {
          e.preventDefault();
          pills.forEach((p) => p.classList.remove("active"));
          pill.classList.add("active");

          const navHeight = 80;
          const targetPos =
            targetSection.getBoundingClientRect().top + window.pageYOffset - navHeight;

          window.scrollTo({
            top: targetPos,
            behavior: "smooth",
          });

          // Refresh swiper perspective layout
          const swiperEl = targetSection.querySelector(".skiper47-swiper");
          if (swiperEl && swiperEl.swiper) {
            swiperEl.swiper.update();
          }
        }
      });
    });

    // IntersectionObserver to sync category bar active pill during scroll
    if ("IntersectionObserver" in window) {
      const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      };

      const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            for (const [cat, id] of Object.entries(categoryMap)) {
              if (id === sectionId) {
                pills.forEach((p) => {
                  const isActive = p.getAttribute("data-category") === cat;
                  p.classList.toggle("active", isActive);
                  if (isActive) {
                    p.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                  }
                });
                break;
              }
            }
          }
        });
      }, observerOptions);

      Object.values(categoryMap).forEach((id) => {
        const sec = document.getElementById(id);
        if (sec) sectionObserver.observe(sec);
      });
    }
  }

  function initAll() {
    initAllSkiperScrollers();
    initSkiper47Carousels();
    initCategoryBarSync();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }

  global.SkiperScroll = SkiperScroll;
  global.initAllSkiperScrollers = initAllSkiperScrollers;
  global.initSkiper47Carousels = initSkiper47Carousels;
  global.initCategoryBarSync = initCategoryBarSync;
})(window);

