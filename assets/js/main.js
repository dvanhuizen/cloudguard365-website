/* CloudGuard365 - Main JavaScript */

'use strict';

// ========================================
// Navigation
// ========================================
(function initNav() {
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  // Scroll effect
  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  // Mobile toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);

      // Animate hamburger
      const spans = navToggle.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
      } else {
        spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      }
    });
  }

  // Active link highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ========================================
// Smooth scroll for anchor links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ========================================
// Intersection Observer - Fade in elements
// ========================================
(function initAnimations() {
  const style = document.createElement('style');
  style.textContent = `
    .animate-on-scroll {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .animate-on-scroll.visible {
      opacity: 1;
      transform: none;
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  // Auto-apply to cards and sections
  document.querySelectorAll('.card, .stat-number, .section-header, .blog-card, .tool-card').forEach(el => {
    el.classList.add('animate-on-scroll');
    observer.observe(el);
  });
})();

// ========================================
// Contact Form
// ========================================
(function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = form.querySelector('[type="submit"]');
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Verzenden...';

    // Collect data
    const data = Object.fromEntries(new FormData(form));

    // Try Formspree if endpoint configured, otherwise open mailto
    const endpoint = form.dataset.endpoint;
    if (endpoint && endpoint !== 'YOUR_FORMSPREE_ID') {
      try {
        const res = await fetch(`https://formspree.io/f/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          showFormSuccess(form);
        } else {
          throw new Error('Server error');
        }
      } catch {
        fallbackMailto(data);
      }
    } else {
      fallbackMailto(data);
    }

    btn.disabled = false;
    btn.textContent = originalText;
  });

  function showFormSuccess(form) {
    const success = document.createElement('div');
    success.className = 'alert alert-info';
    success.style.marginTop = '1rem';
    success.innerHTML = '✓ Bericht ontvangen! We nemen zo snel mogelijk contact op.';
    form.appendChild(success);
    form.reset();
    setTimeout(() => success.remove(), 6000);
  }

  function fallbackMailto(data) {
    const subject = encodeURIComponent(`Contactformulier: ${data.subject || 'Bericht'}`);
    const body = encodeURIComponent(`Naam: ${data.name || ''}\nEmail: ${data.email || ''}\n\n${data.message || ''}`);
    window.location.href = `mailto:info@cloudguard365.nl?subject=${subject}&body=${body}`;
  }
})();

// ========================================
// Stat counter animation
// ========================================
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      el.textContent = current + suffix;
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  }
})();
