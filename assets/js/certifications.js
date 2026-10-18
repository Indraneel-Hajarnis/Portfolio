// ============================================================
// Badges and Certifications
//  • cards are built from certifications-data.js (any number)
//  • auto-rotates every 3 seconds, centre card sits in the highlight box,
//    cards leaving one side come back from the other
//  • each certificate can work in one of two ways (chosen in certifications-data.js):
//      – pop-up: clicking opens the image in a pop-up (Close button,
//        Escape key or a click outside also close it)
//      – link:   clicking opens the credential page (e.g. Coursera) in a new tab
// ============================================================
(() => {
  'use strict';

  const section = document.getElementById('certifications');
  const slider = document.getElementById('certs-slider');
  const track = document.getElementById('certs-track');
  const template = document.getElementById('cert-card-template');
  if (!section || !slider || !track || !template) return;

  const INTERVAL = 3000; // ms between automatic steps
  const ACTIVE_SCALE = 1.2; // size of the card in the centre box (matches the CSS)

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const mod = (a, n) => ((a % n) + n) % n;
  const num = (v) => parseFloat(v) || 0;
  const pad = (n) => String(n).padStart(2, '0');
  const text = (v, fallback) =>
    v === undefined || v === null || String(v).trim() === '' ? fallback : String(v);

  // ── Build the cards from the data file ──
  const data = Array.isArray(window.CERTIFICATIONS) && window.CERTIFICATIONS.length
    ? window.CERTIFICATIONS
    : [{}];

  function buildCard(cert, i) {
    const li = template.content.firstElementChild.cloneNode(true);
    const c = cert || {};
    li.dataset.i = i;

    // the card shows the short / alternate name when there is one, otherwise the full title
    const title = text(c.title, 'To be added');
    const shortTitle = text(c.shortTitle, '');
    li.querySelector('.cert-card-title').textContent = shortTitle || title;
    li.querySelector('.cert-card-sub').textContent = text(c.subtitle, 'To be added');
    let cardBtn = li.querySelector('.cert-card-btn');
    cardBtn.setAttribute('aria-label', 'View ' + title);
    cardBtn.title = title; // hovering shows the full name

    // How does this card behave when clicked?
    //   url + (openAs: 'link' or not set)  → opens the credential page in a new tab
    //   openAs: 'popup', or no url         → opens the image pop-up
    const url = text(c.url, '');
    const mode = text(c.openAs, '').toLowerCase();
    const validUrl = /^https?:\/\//i.test(url); // only normal web links are accepted
    if (validUrl && mode !== 'popup') {
      const link = document.createElement('a');
      link.className = cardBtn.className;
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', 'View credential for ' + title + ' (opens in a new tab)');
      link.title = title + ' — opens the credential in a new tab';
      while (cardBtn.firstChild) link.appendChild(cardBtn.firstChild);
      cardBtn.replaceWith(link);
      cardBtn = link;
      li.classList.add('is-link');

      // small "opens another site" badge on the picture
      const badge = document.createElement('span');
      badge.className = 'cert-card-ext';
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = '<svg viewBox="0 0 24 24"><line x1="7" y1="17" x2="17" y2="7" /><polyline points="8 7 17 7 17 16" /></svg>';
      link.querySelector('.cert-card-img').appendChild(badge);
    }

    const src = text(c.image, '');
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      const frame = li.querySelector('.cert-card-img');
      const placeholder = li.querySelector('.cert-card-placeholder');
      img.addEventListener('load', () => { placeholder.hidden = true; });
      img.addEventListener('error', () => img.remove()); // keep the placeholder
      frame.insertBefore(img, placeholder);
    }
    return li;
  }

  track.textContent = '';
  const originals = data.map((c, i) => {
    const li = buildCard(c, i);
    track.appendChild(li);
    return li;
  });
  const N0 = originals.length;

  const prevBtn = document.getElementById('certs-prev');
  const nextBtn = document.getElementById('certs-next');
  const pauseBtn = document.getElementById('certs-pause');
  const countEl = document.getElementById('certs-count');
  const controls = section.querySelector('.certs-controls');
  const selector = slider.querySelector('.certs-selector');

  if (N0 < 2 && controls) controls.hidden = true;

  let items = [];
  let T = 0; // total cards on the track (originals + repeats)
  let half = 0;
  let step = 0; // px between card centres
  let index = 0; // which card is in the centre
  let timer = null;

  // auto-rotation is off by default for users who prefer reduced motion
  let playing = !reduceMotion && N0 > 1;
  let hovering = false;
  let visible = false;
  let modalOpen = false;

  // ── Repeat the list until it always fills the screen ──
  function build() {
    const cs = getComputedStyle(slider);
    step = num(cs.getPropertyValue('--card-w')) + num(cs.getPropertyValue('--gap'));

    const needed = Math.ceil(slider.clientWidth / step) + 4;
    const reps = Math.max(1, Math.ceil(needed / N0));

    track.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    for (let r = 1; r < reps; r++) {
      originals.forEach((o) => {
        const c = o.cloneNode(true);
        c.dataset.clone = '1';
        track.appendChild(c);
      });
    }

    items = Array.from(track.children);
    T = items.length;
    half = Math.floor(T / 2);
    items.forEach((it) => { it._p = undefined; });
  }

  // ── Place every card relative to the centre ──
  function layout(instant) {
    const jumpers = [];

    items.forEach((it, i) => {
      const p = mod(i - index + half, T) - half;
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
      it.setAttribute('aria-hidden', d === 0 ? 'false' : 'true');
      const btn = it.querySelector('.cert-card-btn');
      if (btn) btn.tabIndex = d === 0 ? 0 : -1;
      it._p = p;
    });

    if (jumpers.length) {
      void track.offsetWidth; // apply the instant move
      jumpers.forEach((it) => { it.style.transition = ''; });
    }
  }

  function updateCount() {
    if (countEl) countEl.textContent = pad(mod(index, N0) + 1) + ' / ' + pad(N0);
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
    updateCount();
    flash();
    if (!fromTimer) refresh(); // restart the 3-second countdown after manual moves
  }

  // ── Auto-rotation ──
  function refresh() {
    clearInterval(timer);
    timer = null;
    if (playing && !hovering && !modalOpen && visible && !document.hidden) {
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

  // ============================================================
  // Pop-up
  // ============================================================
  const modal = document.getElementById('cert-modal');
  const modalImg = document.getElementById('cert-modal-img');
  const modalPlaceholder = document.getElementById('cert-modal-placeholder');
  const modalName = document.getElementById('cert-modal-name');
  const modalBox = modal ? modal.querySelector('.modal-content') : null;
  const closeBtn = document.getElementById('cert-modal-close');
  let opener = null;

  function showModalImage(ok) {
    modalImg.hidden = !ok;
    modalPlaceholder.hidden = ok;
  }

  function openModal(i, from, truncated) {
    if (!modal) return;
    const cert = data[i] || {};
    const src = text(cert.image, '');

    // Full name under the image — only when the card could not show it in full
    const fullName = text(cert.title, '');
    const shortName = text(cert.shortTitle, '');
    const showName = fullName !== '' && ((shortName !== '' && shortName !== fullName) || !!truncated);
    if (modalName) {
      modalName.textContent = fullName;
      modalName.hidden = !showName;
    }
    if (modalBox) modalBox.classList.toggle('has-name', showName);

    modal.setAttribute('aria-label', text(cert.title, 'Certificate preview'));
    showModalImage(false);

    if (src) {
      modalImg.onload = () => showModalImage(true);
      modalImg.onerror = () => showModalImage(false);
      modalImg.alt = text(cert.imageAlt, text(cert.title, 'Certificate'));
      modalImg.removeAttribute('src');
      modalImg.src = src;
      if (modalImg.complete && modalImg.naturalWidth) showModalImage(true);
    } else {
      modalImg.removeAttribute('src');
    }

    opener = from || null;
    modalOpen = true;
    refresh(); // pause the rotation while the pop-up is open
    document.documentElement.classList.add('cert-modal-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('active');
    focusClose(10);
  }

  // The pop-up is hidden until its fade-in starts, so retry for a moment
  function focusClose(tries) {
    if (!closeBtn || !modalOpen) return;
    closeBtn.focus({ preventScroll: true });
    if (document.activeElement !== closeBtn && tries > 0) {
      setTimeout(() => focusClose(tries - 1), 40);
    }
  }

  function closeModal() {
    if (!modal || !modalOpen) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('cert-modal-open');
    modalOpen = false;
    refresh();
    if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    opener = null;
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  if (modal) {
    // click outside the pop-up
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (!modalOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        closeModal();
      } else if (e.key === 'Tab') {
        e.preventDefault(); // Close is the only control: keep focus on it
        if (closeBtn) closeBtn.focus();
      }
    });
  }

  // click a pop-up card → open its image
  track.addEventListener('click', (e) => {
    const btn = e.target.closest('.cert-card-btn');
    if (!btn) return;
    if (btn.tagName === 'A') return; // link cards: the browser opens the credential page
    const card = btn.closest('.cert-card');
    // was the name cut off on the card?
    const titleEl = btn.querySelector('.cert-card-title');
    const truncated = !!titleEl && titleEl.scrollHeight > titleEl.clientHeight + 1;
    openModal(parseInt(card.dataset.i, 10) || 0, btn, truncated);
  });

  // ── Controls ──
  if (prevBtn) prevBtn.addEventListener('click', () => go(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => go(1));
  if (pauseBtn) pauseBtn.addEventListener('click', () => setPlaying(!playing));

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
  updateCount();
  setPlaying(playing);

  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        visible = entry.isIntersecting;
        if (visible) section.classList.add('certs-active');
        refresh();
      });
    }, { threshold: 0.25 }).observe(slider);
  } else {
    visible = true;
    section.classList.add('certs-active');
    refresh();
  }
})();
