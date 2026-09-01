/* ============================================================
   PesanAja — Landing Page Scripts
============================================================ */

(function () {
  'use strict';

  // ---------- Sticky navbar shadow on scroll ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 8) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- Mobile nav toggle ----------
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // close menu when a link is clicked
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ---------- Reveal on scroll ----------
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ---------- Smooth anchor offset (header height) ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- CTA form (demo only) ----------
  const ctaForm = document.querySelector('.cta-form');
  const ctaMsg = document.getElementById('cta-msg');
  if (ctaForm && ctaMsg) {
    ctaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      ctaMsg.classList.add('on');
      const input = ctaForm.querySelector('input');
      if (input) input.value = '';
    });
  }

  // ---------- FAQ: keep only one open at a time (optional UX) ----------
  const faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(d => {
    d.addEventListener('toggle', () => {
      if (d.open) {
        faqItems.forEach(o => { if (o !== d) o.open = false; });
      }
    });
  });
})();
