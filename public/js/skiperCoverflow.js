/**
 * Skiper 47: 3D Perspective Coverflow Carousel Controller
 * Recreates skiper-ui.com/v1/skiper47 Carousel_001 with Swiper.js
 * 100% native vertical page scrolling preserved.
 */
(function (global) {
  "use strict";

  function initSkiper47Carousels() {
    if (typeof Swiper === "undefined") {
      setTimeout(initSkiper47Carousels, 80);
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
          spaceBetween: 16,
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
              spaceBetween: 24,
            },
            1024: {
              slidesPerView: 2.43,
              spaceBetween: 32,
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSkiper47Carousels);
  } else {
    initSkiper47Carousels();
  }

  global.initSkiper47Carousels = initSkiper47Carousels;
})(window);
