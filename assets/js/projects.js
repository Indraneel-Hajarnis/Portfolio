// ============================================================
// Projects Section – card carousel
//  • centre card shows the project; neighbours peek in at the sides
//  • previous / next buttons, ← → keys and swipe all do the same
//  • loops: every card is shown once before any card comes round again
// ============================================================
(() => {
  'use strict';

  const section = document.getElementById('projects');
  const slider = document.getElementById('projects-slider');
  const track = document.getElementById('projects-track');
  if (!section || !slider || !track) return;

  // ── Build the cards from projects-data.js (one template, any number of projects) ──
  const template = document.getElementById('project-card-template');
  const data = Array.isArray(window.PROJECTS) && window.PROJECTS.length ? window.PROJECTS : [{}];

  function text(value, fallback) {
    return value === undefined || value === null || String(value).trim() === '' ? fallback : String(value);
  }

  function buildCard(project) {
    const card = template.content.firstElementChild.cloneNode(true);
    const p = project || {};

    card.querySelector('.project-title').textContent = text(p.title, 'To be added');
    card.querySelector('.project-subtitle').textContent = text(p.subtitle, 'To be added');

    // tech stack: a list ['HTML', 'Flask', ...] or a comma-separated text
    const techList = card.querySelector('.project-tech');
    if (techList) {
      const stack = (Array.isArray(p.techStack) ? p.techStack : String(p.techStack || '').split(','))
        .map((t) => String(t).trim())
        .filter(Boolean);
      (stack.length ? stack : ['To be added']).forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        if (!stack.length) li.className = 'is-placeholder';
        techList.appendChild(li);
      });
    }

    // description: one text, or a list of texts (one paragraph each)
    const desc = card.querySelector('.project-desc');
    const paragraphs = Array.isArray(p.description) ? p.description : [p.description];
    paragraphs.forEach((t) => {
      const para = document.createElement('p');
      para.textContent = text(t, 'To be added');
      desc.appendChild(para);
    });

    // button
    const link = card.querySelector('.project-link');
    card.querySelector('.project-link-label').textContent = text(p.linkLabel, 'View Project');
    const url = text(p.url, '');
    if (url) {
      link.href = url;
      if (/^https?:\/\//i.test(url)) { // other sites open in a new tab
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
    }

    // image (falls back to the placeholder if the file is missing)
    const src = text(p.image, '');
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = text(p.imageAlt, text(p.title, 'Project image'));
      img.decoding = 'async';
      const frame = card.querySelector('.project-image-frame');
      const placeholder = card.querySelector('.project-image-placeholder');
      img.addEventListener('load', () => {
        placeholder.hidden = true;
        frame.classList.add('has-image'); // frame wraps the whole picture
        scheduleFit();
      });
      img.addEventListener('error', () => img.remove());
      frame.insertBefore(img, placeholder);
    }

    return card;
  }

  if (template) {
    track.textContent = '';
    data.forEach((project) => track.appendChild(buildCard(project)));
  }

  const items = Array.from(track.children);
  const N = items.length;
  if (!N) return;

  const prevBtn = document.getElementById('projects-prev');
  const nextBtn = document.getElementById('projects-next');
  const countEl = document.getElementById('projects-count');
  const controls = slider.parentElement && section.querySelector('.projects-controls');

  // nothing to browse with a single project
  if (N < 2 && controls) controls.hidden = true;

  const SIDE_SCALE = 0.82; // size of the neighbouring cards
  const first = -Math.floor((N - 1) / 2); // lowest slot (left-most card)
  let index = 0; // which card is in the centre
  let visible = false; // is the section on screen?

  const mod = (a, n) => ((a % n) + n) % n;
  const pad = (n) => String(n).padStart(2, '0');

  // ── Number the cards ──
  items.forEach((card, i) => {
    const tag = card.querySelector('.project-index');
    if (tag) tag.textContent = 'PRJ-' + pad(i + 1);
    card.setAttribute('aria-label', 'Project ' + (i + 1) + ' of ' + N);
  });

  // ── Make every card tall enough for its text and the whole picture ──
  let fitFrame = null;
  function fitHeights() {
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    let tallest = 0;
    items.forEach((card) => {
      card.style.height = 'auto'; // measure the natural height at the current width
      tallest = Math.max(tallest, card.offsetHeight);
      card.style.height = '';
    });
    const h = mobile ? tallest : Math.min(Math.max(tallest, 400), 760);
    slider.style.setProperty('--card-h', Math.ceil(h) + 2 + 'px');
  }

  function scheduleFit() { // pictures and fonts arrive after the page is built
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => { fitHeights(); layout(true); });
  }

  // ── Place every card relative to the centre ──
  function layout(instant) {
    const W = items[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(slider).getPropertyValue('--card-gap')) || 28;
    const off = (W * (1 + SIDE_SCALE)) / 2 + gap;

    const snapped = [];
    const fadeIn = [];

    items.forEach((card, i) => {
      const p = mod(i - index - first, N) + first;
      const d = Math.abs(p);
      const sign = p < 0 ? -1 : 1;

      let x, scale, opacity, z;
      if (d === 0) { x = 0; scale = 1; opacity = 1; z = 3; }
      else if (d === 1) { x = sign * off; scale = SIDE_SCALE; opacity = 0.6; z = 2; }
      else { x = sign * (off + (d - 1) * W * 0.25); scale = 0.65; opacity = 0; z = 1; }

      const oldD = card._p === undefined ? null : Math.abs(card._p);
      const wrapped = card._p !== undefined && Math.abs(p - card._p) > N / 2;
      // a card going round to the other side while hidden is moved instantly
      const snap = instant || (wrapped && (d > 1 || oldD > 1));

      if (snap) {
        card.style.transition = 'none';
        snapped.push(card);
      }

      card.style.transform = 'translateX(' + x + 'px) scale(' + scale + ')';
      card.style.zIndex = z;

      if (snap && !instant && d <= 1 && oldD > 1) {
        fadeIn.push([card, opacity]); // appear at the other side, then fade in
      } else {
        card.style.opacity = opacity;
      }

      const active = d === 0;
      card.classList.toggle('is-active', active);
      card.classList.toggle('is-hidden', d > 1);
      card.setAttribute('aria-hidden', active ? 'false' : 'true');
      card.querySelectorAll('a, button').forEach((el) => {
        el.tabIndex = active ? 0 : -1;
      });
      card._p = p;
    });

    if (snapped.length) {
      void track.offsetWidth; // apply the instant moves
      snapped.forEach((c) => { c.style.transition = ''; });
      fadeIn.forEach(([c, o]) => { c.style.opacity = o; });
    }

    if (countEl) countEl.textContent = pad(mod(index, N) + 1) + ' / ' + pad(N);
  }

  function go(delta) {
    index += delta;
    layout(false);
  }

  // ── Buttons ──
  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));

  // click a neighbouring card to bring it to the centre
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (card && card._p && Math.abs(card._p) === 1) go(card._p);
  });

  // ── Keyboard: ← → do exactly what the buttons do ──
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (!visible) return;

    const t = e.target;
    if (t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], #skills-slider, #certs-slider')) return;
    if (document.querySelector('.modal-overlay.active')) return;

    e.preventDefault();
    const forward = e.key === 'ArrowRight';
    const btn = forward ? nextBtn : prevBtn;
    if (btn) {
      btn.classList.add('pressed'); // same visual feedback as a click
      setTimeout(() => btn.classList.remove('pressed'), 150);
    }
    go(forward ? 1 : -1);
  });

  // ── Swipe on touch screens ──
  let touchX = null;
  slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend', (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  }, { passive: true });

  // ── Keep positions right when the window changes size ──
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { fitHeights(); layout(true); }, 120);
  });

  // ── Start ──
  fitHeights();
  layout(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleFit);

  if ('IntersectionObserver' in window) {
    // reveal when the cards come into view
    new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('projects-active');
          obs.disconnect();
        }
      });
    }, { threshold: 0.2 }).observe(slider);

    // arrow keys only act while the section is on screen
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => { visible = entry.isIntersecting; });
    }, { threshold: 0.25 }).observe(section);
  } else {
    visible = true;
    section.classList.add('projects-active');
  }
})();
