// ============================================================
// Contact Section
//  • validates the form with themed messages
//  • sends the message through EmailJS → the owner's Gmail inbox
//    (settings live in contact-config.js)
//  • shows sending / success / error states
// ============================================================
(() => {
  'use strict';

  const section = document.getElementById('contact');
  const form = document.getElementById('contact-form');
  if (!section || !form) return;

  const fields = {
    name: document.getElementById('contact-name'),
    email: document.getElementById('contact-email'),
    service: document.getElementById('contact-service'),
    message: document.getElementById('contact-message')
  };
  const honeypot = document.getElementById('contact-website');
  const submitBtn = document.getElementById('contact-submit');
  const submitLabel = submitBtn.querySelector('.contact-submit-label');
  const statusEl = document.getElementById('contact-status');
  const counter = document.getElementById('contact-counter');
  const fieldset = form.querySelector('fieldset');

  const ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send';
  const COOLDOWN_MS = 30000; // minimum wait between two messages
  const COOLDOWN_KEY = 'portfolioContactLastSent';
  const MIN_MESSAGE = 10;
  const MAX_MESSAGE = 2000;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  // ── Messages ──
  const rules = {
    name: (v) => (v.trim().length < 2 ? 'Please enter your name.' : ''),
    email: (v) => (EMAIL_RE.test(v.trim()) ? '' : 'Please enter a valid email address.'),
    service: (v) => (v ? '' : 'Please choose a service.'),
    message: (v) => (v.trim().length < MIN_MESSAGE ? 'Please write at least ' + MIN_MESSAGE + ' characters.' : '')
  };

  function setError(key, msg) {
    const input = fields[key];
    const wrap = input.closest('.contact-field');
    const errEl = document.getElementById('contact-' + key + '-error');
    wrap.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    errEl.textContent = msg;
  }

  function validateField(key) {
    const msg = rules[key](fields[key].value);
    setError(key, msg);
    return !msg;
  }

  function validateAll() {
    let firstBad = null;
    Object.keys(fields).forEach((key) => {
      if (!validateField(key) && !firstBad) firstBad = fields[key];
    });
    return firstBad;
  }

  // validate when leaving a field, and clear the error as soon as it is fixed
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener('blur', () => validateField(key));
    const clear = () => {
      if (fields[key].closest('.contact-field').classList.contains('has-error')) validateField(key);
    };
    fields[key].addEventListener('input', clear);
    fields[key].addEventListener('change', clear);
  });

  // ── Message counter ──
  function updateCounter() {
    counter.textContent = fields.message.value.length + ' / ' + MAX_MESSAGE;
  }
  fields.message.addEventListener('input', updateCounter);
  updateCounter();

  // ── Status line ──
  function setStatus(type, msg) {
    statusEl.className = 'contact-status' + (type ? ' is-' + type : '');
    statusEl.textContent = msg;
    if (msg) {
      void statusEl.offsetWidth; // restart the little entrance animation
      statusEl.classList.add('is-show');
    }
  }

  function setSending(on) {
    fieldset.disabled = on;
    submitBtn.classList.toggle('is-sending', on);
    submitBtn.setAttribute('aria-busy', String(on));
    submitLabel.textContent = on ? 'Transmitting…' : 'Submit';
  }

  // ── Cooldown (stops accidental double sends and simple spam) ──
  function secondsLeft() {
    try {
      const last = parseInt(localStorage.getItem(COOLDOWN_KEY), 10) || 0;
      return Math.max(0, Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000));
    } catch (e) {
      return 0;
    }
  }

  const oneLine = (s) => s.replace(/[\r\n]+/g, ' ').trim(); // no line breaks in header-like fields

  // ── Submit ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    setStatus('', '');

    // bots fill the hidden field; pretend everything worked
    if (honeypot && honeypot.value) {
      setStatus('success', 'Message sent. Thank you!');
      form.reset();
      updateCounter();
      return;
    }

    const bad = validateAll();
    if (bad) {
      bad.focus();
      setStatus('error', 'Please check the highlighted fields.');
      return;
    }

    const wait = secondsLeft();
    if (wait > 0) {
      setStatus('error', 'Please wait ' + wait + ' seconds before sending another message.');
      return;
    }

    const cfg = window.CONTACT_CONFIG || {};
    if (!cfg.serviceId || !cfg.templateId || !cfg.publicKey) {
      console.warn('Contact form: fill in serviceId, templateId and publicKey in contact-config.js');
      setStatus('error', 'The contact form is not connected yet. Please try again later.');
      return;
    }

    const name = oneLine(fields.name.value);
    const email = oneLine(fields.email.value);
    const service = fields.service.value;
    const message = fields.message.value.trim().slice(0, MAX_MESSAGE);

    const params = {
      from_name: name,
      from_email: email,
      reply_to: email,
      service: service,
      subject: 'New message from ' + name + ' — ' + service,
      message: message,
      sent_at: new Date().toLocaleString()
    };
    if (cfg.toEmail) params.to_email = cfg.toEmail;

    setSending(true);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: cfg.serviceId,
          template_id: cfg.templateId,
          user_id: cfg.publicKey,
          template_params: params
        }),
        signal: controller.signal
      });

      if (!res.ok) throw new Error('EmailJS responded with ' + res.status);

      try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch (err) { /* storage blocked */ }
      form.reset();
      updateCounter();
      Object.keys(fields).forEach((key) => setError(key, ''));
      setStatus('success', 'Message sent. Thank you — I will get back to you soon!');
    } catch (err) {
      console.error('Contact form:', err);
      setStatus('error', 'Sorry, the message could not be sent. Please try again in a moment.');
    } finally {
      clearTimeout(timeout);
      setSending(false);
    }
  });

  // ── Reveal when the section scrolls into view ──
  const panel = section.querySelector('.contact-panel');
  if ('IntersectionObserver' in window && panel) {
    new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add('contact-active');
          obs.disconnect();
        }
      });
    }, { threshold: 0.1 }).observe(panel);
  } else {
    section.classList.add('contact-active');
  }
})();
