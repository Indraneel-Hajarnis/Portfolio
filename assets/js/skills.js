// ============================================================
// Skills Section – character-select style slider
//  • auto-rotates one skill at a time; the skill in the centre
//    sits inside the highlight box
//  • elements that leave one side come back from the other side
//  • pause / previous / next buttons, arrow keys, swipe and
//    click-on-a-skill, pauses while hovered or off-screen
// ============================================================
(() => {
  'use strict';

  const section = document.getElementById('skills');
  const slider = document.getElementById('skills-slider');
  const track = document.getElementById('skills-track');
  if (!section || !slider || !track) return;

  const originals = Array.from(track.children);
  const N0 = originals.length;
  if (!N0) return;

  const nameEl = document.getElementById('skills-current-name');
  const countEl = document.getElementById('skills-count');
  const prevBtn = document.getElementById('skills-prev');
  const nextBtn = document.getElementById('skills-next');
  const pauseBtn = document.getElementById('skills-pause');
  const selector = slider.querySelector('.skills-selector');

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const INTERVAL = 2400; // ms between automatic steps
  const ACTIVE_SCALE = 1.25; // size of the skill in the centre box

  let items = [];
  let T = 0; // total compartments (originals + clones)
  let half = 0;
  let step = 0; // px between compartment centres
  let index = 0; // which compartment is in the centre
  let timer = null;

  // auto-rotation is off by default for users who prefer reduced motion
  let playing = !reduceMotion;
  let hovering = false;
  let visible = false;

  const mod = (a, n) => ((a % n) + n) % n;
  const num = (v) => parseFloat(v) || 0;
  const pad = (n) => String(n).padStart(2, '0');

  // ── Skill pictures: show a placeholder frame while a picture is missing ──
  function markPicture(img, ok) {
    const card = img.closest('.skill-card');
    if (card) card.classList.toggle('is-missing', !ok);
  }
  // load / error do not bubble, so listen in the capture phase (also covers the repeated cards)
  track.addEventListener('error', (e) => { if (e.target.tagName === 'IMG') markPicture(e.target, false); }, true);
  track.addEventListener('load', (e) => { if (e.target.tagName === 'IMG') markPicture(e.target, true); }, true);
  // pictures that already finished (or failed) before this script ran
  track.querySelectorAll('img').forEach((img) => {
    if (img.complete) markPicture(img, img.naturalWidth > 0);
  });

  // ── Build: repeat the list until it always fills the screen ──
  function build() {
    const cs = getComputedStyle(slider);
    step = num(cs.getPropertyValue('--card')) + num(cs.getPropertyValue('--gap'));

    const needed = Math.ceil(slider.clientWidth / step) + 4;
    const reps = Math.max(1, Math.ceil(needed / N0));

    track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    for (let r = 1; r < reps; r++) {
      originals.forEach((o) => {
        const c = o.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.dataset.clone = '1';
        track.appendChild(c);
      });
    }

    items = Array.from(track.children);
    T = items.length;
    half = Math.floor(T / 2);
    items.forEach((it) => { it._p = undefined; });
  }

  // ── Place every compartment relative to the centre ──
  function layout(instant) {
    const jumpers = [];

    items.forEach((it, i) => {
      const p = mod(i - index + half, T) - half; // -half … +half-1
      const d = Math.abs(p);
      const wrapped = it._p !== undefined && Math.abs(p - it._p) > T / 2;
      const scale = d === 0 ? ACTIVE_SCALE : d === 1 ? 0.92 : d === 2 ? 0.84 : 0.78;
      const opacity = d === 0 ? 1 : d === 1 ? 0.8 : d === 2 ? 0.55 : 0.35;

      // wrapping from one end to the other must not be animated
      if (instant || wrapped) {
        it.style.transition = 'none';
        jumpers.push(it);
      }

      it.style.transform = 'translateX(' + p * step + 'px) scale(' + scale + ')';
      it.style.opacity = opacity;
      it.style.zIndex = d === 0 ? 2 : 1;
      it.classList.toggle('is-active', d === 0);
      it._p = p;
    });

    if (jumpers.length) {
      void track.offsetWidth; // apply the instant move
      jumpers.forEach((it) => { it.style.transition = ''; });
    }
  }

  function updateReadout() {
    const i = mod(index, N0);
    const label = originals[i].querySelector('.skill-name');
    if (nameEl) {
      nameEl.textContent = label ? label.textContent.trim() : '';
      nameEl.classList.remove('swap');
      void nameEl.offsetWidth;
      nameEl.classList.add('swap');
    }
    if (countEl) countEl.textContent = pad(i + 1) + ' / ' + pad(N0);
  }

  function flash() {
    if (!selector) return;
    selector.classList.remove('flash');
    void selector.offsetWidth;
    selector.classList.add('flash');
  }

  // ── Moving ──
  function go(delta, fromTimer) {
    index += delta;
    layout(false);
    updateReadout();
    flash();
    if (!fromTimer) refresh(); // restart the countdown after manual moves
  }

  // ── Auto-rotation ──
  function refresh() {
    clearInterval(timer);
    timer = null;
    if (playing && !hovering && visible && !document.hidden) {
      timer = setInterval(() => go(1, true), INTERVAL);
    }
  }

  function setPlaying(on) {
    playing = on;
    if (pauseBtn) {
      pauseBtn.classList.toggle('is-paused', !on);
      pauseBtn.setAttribute('aria-pressed', String(!on));
      pauseBtn.setAttribute('aria-label', on ? 'Pause automatic rotation' : 'Play automatic rotation');
    }
    refresh();
  }

  // ── Controls ──
  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));
  if (pauseBtn) pauseBtn.addEventListener('click', () => setPlaying(!playing));

  // click a skill to bring it into the box
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.skill-card');
    if (card && card._p) go(card._p);
  });

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });

  // pause while a mouse is over the slider
  slider.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') { hovering = true; refresh(); }
  });
  slider.addEventListener('pointerleave', (e) => {
    if (e.pointerType === 'mouse') { hovering = false; refresh(); }
  });

  // swipe on touch screens
  let touchX = null;
  slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('visibilitychange', refresh);

  // keep it filled when the window is resized
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const current = mod(index, N0);
      build();
      index = current;
      layout(true);
    }, 150);
  });

  // ── Start ──
  build();
  layout(true);
  updateReadout();
  setPlaying(playing);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) section.classList.add('skills-active');
        refresh();
      });
    }, { threshold: 0.25 }).observe(slider);
  } else {
    visible = true;
    section.classList.add('skills-active');
    refresh();
  }
})();
