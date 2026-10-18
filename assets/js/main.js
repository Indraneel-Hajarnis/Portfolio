// ============================================================
// Hero Section – Sci-Fi Scanner Animations
// ============================================================

(() => {
  'use strict';

  // Intro is skipped for returning visitors (.intro-skip set by loading.js)
  // and animations are toned down for users who prefer reduced motion.
  const skipIntro = document.documentElement.classList.contains('intro-skip');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const skipAnimations = skipIntro || reduceMotion;

  // ── Typing effect for the name ──────────────────────────────
  const nameEl = document.getElementById('hero-name');
  if (nameEl && !skipAnimations) {
    const fullText = nameEl.textContent;
    nameEl.textContent = '';
    nameEl.style.borderRight = '2px solid var(--hud-cyan, #00e5ff)';

    let charIdx = 0;
    const typeSpeed = 80; // ms per character

    function typeName() {
      if (charIdx < fullText.length) {
        nameEl.textContent += fullText.charAt(charIdx);
        charIdx++;
        setTimeout(typeName, typeSpeed);
      } else {
        // Blink cursor a few times then remove it
        let blinks = 0;
        const blinkInterval = setInterval(() => {
          nameEl.style.borderRightColor =
            blinks % 2 === 0 ? 'transparent' : 'var(--hud-cyan, #00e5ff)';
          blinks++;
          if (blinks > 6) {
            clearInterval(blinkInterval);
            nameEl.style.borderRight = 'none';
          }
        }, 400);
      }
    }

    // Start typing after the hero info panel entrance animation finishes (around 3.0s)
    setTimeout(typeName, 3400);
  }

  // ── Sequential reveal for tagline & links ──────────────────
  const tagline = document.getElementById('hero-tagline');
  const links   = document.getElementById('hero-links');

  if (tagline && !skipAnimations) {
    tagline.style.opacity = '0';
    tagline.style.transform = 'translateY(8px)';
    tagline.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      tagline.style.opacity = '1';
      tagline.style.transform = 'translateY(0)';
    }, 4400);
  }

  if (links && !skipAnimations) {
    links.style.opacity = '0';
    links.style.transform = 'translateY(8px)';
    links.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    setTimeout(() => {
      links.style.opacity = '1';
      links.style.transform = 'translateY(0)';
    }, 4800);
  }

  // ── Glow pulse on scanner when mouse enters ────────────────
  const scanner = document.getElementById('hero-scanner');
  if (scanner) {
    scanner.addEventListener('mouseenter', () => {
      scanner.style.filter = 'drop-shadow(0 0 18px rgba(0,229,255,0.55))';
    });
    scanner.addEventListener('mouseleave', () => {
      scanner.style.filter = '';
    });
  }

  // ── Subtle parallax tilt on the scanner ────────────────────
  const hero = document.querySelector('.hero');
  if (hero && scanner && !reduceMotion) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2; // -1 → 1
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
      const tiltX = y * -4; // degrees
      const tiltY = x *  4;
      scanner.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    hero.addEventListener('mouseleave', () => {
      scanner.style.transform = '';
    });
  }

  // ── Floating HUD data – randomized numbers ────────────────
  const topData    = document.querySelector('.hud-data--top');
  const bottomData = document.querySelector('.hud-data--bottom');

  function scrambleText(el, final, duration) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const steps = 12;
    let step = 0;

    const interval = setInterval(() => {
      let text = '';
      for (let i = 0; i < final.length; i++) {
        if (i < (step / steps) * final.length) {
          text += final[i];
        } else {
          text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
      }
      el.textContent = text;
      step++;
      if (step > steps) {
        el.textContent = final;
        clearInterval(interval);
      }
    }, duration / steps);
  }

  if (topData && !skipAnimations)    setTimeout(() => scrambleText(topData,    'SCAN COMPLETE', 900), 1800);
  if (bottomData && !skipAnimations) setTimeout(() => scrambleText(bottomData, 'ID VERIFIED',  900), 2600);

  // ── Resume Modal Interactions ────────────────────────────────
  const resumeModal = document.getElementById('resume-modal');
  const openResumeBtn = document.getElementById('view-resume-btn');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const downloadResumeBtn = document.getElementById('download-resume-btn');

  if (openResumeBtn && resumeModal && closeResumeBtn) {
    openResumeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resumeModal.classList.add('active');
    });

    closeResumeBtn.addEventListener('click', () => {
      resumeModal.classList.remove('active');
    });

    // Close on click outside
    resumeModal.addEventListener('click', (e) => {
      if (e.target === resumeModal) {
        resumeModal.classList.remove('active');
      }
    });
  }

  // Force download to bypass browser PDF viewers
  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const originalText = downloadResumeBtn.querySelector('span').textContent;
      downloadResumeBtn.querySelector('span').textContent = 'Downloading...';
      downloadResumeBtn.style.pointerEvents = 'none';
      
      try {
        const response = await fetch(downloadResumeBtn.href);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = downloadResumeBtn.getAttribute('download');
        document.body.appendChild(a);
        
        a.click();
        
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (error) {
        console.error('Download failed, falling back to direct link', error);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = downloadResumeBtn.href;
        a.download = downloadResumeBtn.getAttribute('download');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } finally {
        downloadResumeBtn.querySelector('span').textContent = originalText;
        downloadResumeBtn.style.pointerEvents = 'auto';
      }
    });
  }

  // ── About Section – scroll-reveal (slide down from top) ─────
  const aboutPanel = document.querySelector('.about-panel');
  const aboutSection = document.getElementById('about');

  function revealAbout() {
    if (aboutPanel && !aboutPanel.classList.contains('visible')) {
      aboutPanel.classList.add('visible');
    }
  }

  if (aboutPanel) {
    // 1. Trigger immediately on any downward scroll
    const onScroll = () => {
      if (window.scrollY > 30) {
        revealAbout();
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. IntersectionObserver trigger
    if ('IntersectionObserver' in window) {
      const aboutObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealAbout();
              aboutObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0, rootMargin: '0px 0px 80px 0px' }
      );
      if (aboutSection) {
        aboutObserver.observe(aboutSection);
      } else {
        aboutObserver.observe(aboutPanel);
      }
    }

    // 3. Check on initial load & hash change
    if (window.scrollY > 30 || window.location.hash === '#about') {
      revealAbout();
    }
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#about') {
        revealAbout();
      }
    });

    // 4. Smooth scrolling for nav buttons
    document.querySelectorAll('.navbar .nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const text = btn.textContent.trim().toLowerCase();
        if (text === 'education') return; // handled in education.js
        const target = document.getElementById(text);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
          if (text === 'about') {
            revealAbout();
          }
        }
      });
    });
  }

  // ── Navigation: active-section indicator & mobile menu ─────
  const navBar = document.getElementById('top-menu');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navButtons = Array.from(document.querySelectorAll('.navbar .nav-btn'));

  function setActiveNav(id) {
    navButtons.forEach((btn) => {
      const isActive = btn.textContent.trim().toLowerCase() === id;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const navSections = ['hero', 'about', 'education', 'skills', 'projects', 'certifications', 'blog', 'contact']
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // Thin band around the middle of the viewport decides the "current" section
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveNav(entry.target.id === 'hero' ? '' : entry.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    navSections.forEach((section) => navObserver.observe(section));
  }

  function setMenuOpen(open) {
    if (!navToggle || !navLinks) return;
    navLinks.classList.toggle('open', open);
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  }

  if (navToggle && navLinks) {
    const isOpen = () => navLinks.classList.contains('open');

    navToggle.addEventListener('click', () => setMenuOpen(!isOpen()));

    // Close after choosing a section
    navButtons.forEach((btn) => btn.addEventListener('click', () => setMenuOpen(false)));

    // Escape closes the menu and returns focus to the toggle
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });

    // Click outside closes the menu
    document.addEventListener('click', (e) => {
      if (isOpen() && navBar && !navBar.contains(e.target)) {
        setMenuOpen(false);
      }
    });

    // Reset when resizing back to the desktop layout
    const desktopQuery = window.matchMedia('(min-width: 1201px)');
    desktopQuery.addEventListener('change', (e) => {
      if (e.matches) setMenuOpen(false);
    });
  }

})();
