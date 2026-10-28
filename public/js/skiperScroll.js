/**
 * Native Smooth Scroller for Horizontal Lists
 * Lightweight, 100% native scrolling, zero wheel hijacking, zero freezing.
 */
(function () {
  "use strict";

  function initScrollers() {
    const wrappers = document.querySelectorAll(".skiper-scroll-wrapper, .categories");

    wrappers.forEach((wrapper) => {
      const track = wrapper.querySelector(".skiper-scroll, .categories-scroll");
      if (!track) return;

      const prevBtn = wrapper.querySelector(".skiper-prev");
      const nextBtn = wrapper.querySelector(".skiper-next");

      function updateArrows() {
        if (!prevBtn && !nextBtn) return;
        const tolerance = 6;
        const atStart = track.scrollLeft <= tolerance;
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - tolerance;

        if (prevBtn) {
          prevBtn.classList.toggle("is-hidden", atStart);
        }
        if (nextBtn) {
          nextBtn.classList.toggle("is-hidden", atEnd);
        }
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", (e) => {
          e.preventDefault();
          track.scrollBy({
            left: -Math.max(track.clientWidth * 0.7, 300),
            behavior: "smooth",
          });
          setTimeout(updateArrows, 350);
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", (e) => {
          e.preventDefault();
          track.scrollBy({
            left: Math.max(track.clientWidth * 0.7, 300),
            behavior: "smooth",
          });
          setTimeout(updateArrows, 350);
        });
      }

      track.addEventListener("scroll", updateArrows, { passive: true });
      window.addEventListener("resize", updateArrows, { passive: true });
      updateArrows();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initScrollers);
  } else {
    initScrollers();
  }
})();
