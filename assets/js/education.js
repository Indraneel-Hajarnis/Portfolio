// ============================================================
// Education Section
//  1. Starts the circuit-board animation when the timeline is
//     scrolled into view. After that it plays by itself, so the
//     visitor does not need to keep scrolling.
//  2. The navbar "Education" button scrolls straight to the point
//     where the line begins forming, then (re)plays the animation.
// ============================================================
(() => {
  'use strict';

  const section = document.getElementById('education');
  const axis = document.getElementById('edu-axis');
  if (!section || !axis) return;

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let holdActivation = false; // true while the navbar scroll is still travelling

  const activate = () => section.classList.add('edu-active');

  // Old browsers: just show the finished state
  if (!('IntersectionObserver' in window)) {
    activate();
    return;
  }

  // ── 1. Scroll trigger ──────────────────────────────────────
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !holdActivation) {
          activate();
          observer.disconnect();
        }
      });
    },
    { rootMargin: '0px 0px -15% 0px', threshold: 0 }
  );
  observer.observe(axis);

  // ── 2. Navbar button → where the line starts forming ───────
  function targetTop() {
    const nav = document.getElementById('top-menu');
    const navH = nav ? nav.offsetHeight : 70;
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    let top;

    if (isMobile) {
      // Vertical line starts right under the title
      const title = section.querySelector('.edu-title') || section;
      top = title.getBoundingClientRect().top + window.scrollY - navH - 12;
    } else {
      // Horizontal line centred in the visible area, cards above and below
      const r = axis.getBoundingClientRect();
      const axisY = r.top + r.height / 2 + window.scrollY;
      top = axisY - (navH + (window.innerHeight - navH) / 2);
    }

    const max = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(top, max));
  }

  // Calls cb once the page has stopped scrolling
  function afterScroll(cb) {
    let last = window.scrollY;
    let still = 0;
    const start = performance.now();
    (function tick() {
      const y = window.scrollY;
      still = Math.abs(y - last) < 0.5 ? still + 1 : 0;
      last = y;
      if (still >= 6 || performance.now() - start > 2500) {
        cb();
      } else {
        requestAnimationFrame(tick);
      }
    })();
  }

  function goToEducation(instant) {
    const top = targetTop();
    holdActivation = true;

    // Reset so the line forms from the beginning again
    section.classList.remove('edu-active');
    void section.offsetWidth; // restart the CSS animations

    const finish = () => {
      holdActivation = false;
      observer.disconnect();
      activate();
    };

    if (Math.abs(window.scrollY - top) < 2) {
      finish();
      return;
    }

    window.scrollTo({ top, behavior: instant || reduceMotion ? 'auto' : 'smooth' });
    setTimeout(() => afterScroll(finish), 120);
  }

  document.querySelectorAll('.navbar .nav-btn').forEach((btn) => {
    if (btn.textContent.trim().toLowerCase() === 'education') {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        goToEducation(false);
      });
    }
  });

  // Opening the page with #education in the URL (or back/forward)
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#education') goToEducation(true);
  });
  window.addEventListener('load', () => {
    if (window.location.hash === '#education') goToEducation(true);
  });
})();
