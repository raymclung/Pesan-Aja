/* =========================================================
   PesanAja — App Polish (shared bundle)
   Splash · Dark mode · Page transitions · PWA · Search index
   ========================================================= */
(function () {
  'use strict';

  const STORAGE_THEME = 'pa-theme';
  const SESSION_SPLASH = 'pa-splash-shown';
  const SPLASH_DURATION = 1600; // ms — total tampil
  const TRANSITION_OUT = 180;   // ms — fade out sebelum navigate

  // =====================================================
  // DARK MODE — apply paling awal supaya tidak ada FOUC
  // =====================================================
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    // Update theme-color meta untuk address bar
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'dark' ? '#070E1A' : '#1F4FD9');
  }
  function getStoredTheme() {
    try { return localStorage.getItem(STORAGE_THEME) || 'light'; } catch { return 'light'; }
  }
  function setTheme(theme) {
    try { localStorage.setItem(STORAGE_THEME, theme); } catch {}
    applyTheme(theme);
  }
  function toggleTheme() {
    setTheme(getStoredTheme() === 'dark' ? 'light' : 'dark');
  }
  // Apply segera (sebelum body render)
  applyTheme(getStoredTheme());

  // =====================================================
  // SPLASH SCREEN — hanya sekali per session
  // =====================================================
  function shouldShowSplash() {
    // Hanya di index.html (home) saat pertama kali sesi
    const path = location.pathname.split('/').pop() || 'index.html';
    if (path !== '' && path !== 'index.html') return false;
    try {
      if (sessionStorage.getItem(SESSION_SPLASH)) return false;
      sessionStorage.setItem(SESSION_SPLASH, '1');
    } catch {}
    return true;
  }
  function mountSplash() {
    if (!shouldShowSplash()) return;
    const el = document.createElement('div');
    el.className = 'pa-splash';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'Memuat PesanAja');
    el.innerHTML =
      '<div class="pa-logo">' +
        '<img src="assets/logo.jpg" onerror="this.onerror=null;this.src=\'assets/logo.svg\'" alt="" />' +
      '</div>' +
      '<div class="pa-title">Pesan<span class="ac">Aja</span></div>' +
      '<div class="pa-tag">Mau pesan apa hari ini?</div>' +
      '<div class="pa-spin" aria-hidden="true"></div>';
    document.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('pa-fade');
      setTimeout(() => el.remove(), 400);
    }, SPLASH_DURATION);
  }

  // =====================================================
  // PAGE TRANSITIONS — fade in/out antar halaman
  // =====================================================
  function setupTransitions() {
    document.body.classList.add('pa-fx');
    requestAnimationFrame(() => document.body.classList.add('pa-ready'));

    // Intercept link internal
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;
      // skip: anchor only, javascript:, mailto/tel/wa, external, target=_blank, download, modifier keys
      if (
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        /^https?:\/\//i.test(href) ||
        a.target === '_blank' ||
        a.hasAttribute('download') ||
        e.metaKey || e.ctrlKey || e.shiftKey || e.altKey
      ) return;

      e.preventDefault();
      document.body.classList.add('pa-leaving');
      setTimeout(() => { window.location.href = href; }, TRANSITION_OUT);
    });

    // Saat user balik via tombol back, pastikan fade-in lagi
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.body.classList.remove('pa-leaving');
        document.body.classList.add('pa-ready');
      }
    });
  }

  // =====================================================
  // PWA — register service worker
  // =====================================================
  function setupPWA() {
    if (!('serviceWorker' in navigator)) return;
    // Hanya register kalau dilayani via http/https, bukan file://
    if (location.protocol !== 'http:' && location.protocol !== 'https:') return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => { /* abaikan */ });
    });

    // Tangkap install prompt — simpan supaya bisa dipanggil dari menu
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.PesanAja.installPrompt = e;
    });
  }

  // =====================================================
  // SEARCH INDEX — dipakai oleh home search bar
  // =====================================================
  const SEARCH_INDEX = [
    { id:'salon-melati',         name:'Salon Melati',           cat:'salon',   emoji:'💇', dist:1.2, area:'Cihampelas',  price:75000  },
    { id:'glamoria',             name:'Hair Studio Aurora',     cat:'salon',   emoji:'💇', dist:1.8, area:'Setiabudi',   price:120000 },
    { id:'belle',                name:'Belle Beauty Lounge',    cat:'salon',   emoji:'💇', dist:2.4, area:'Kuningan',    price:95000  },
    { id:'laundry-sebening',     name:'Laundry Sebening',       cat:'laundry', emoji:'👕', dist:0.8, area:'24 jam',      price:15000  },
    { id:'express24',            name:'Laundry Express 24',     cat:'laundry', emoji:'👕', dist:1.5, area:'24 jam',      price:18000  },
    { id:'barber-klasik',        name:'Barbershop Klasik',      cat:'barber',  emoji:'✂️', dist:2.0, area:'Riau',        price:48000  },
    { id:'asana-bali',           name:'Asana Bali Spa',         cat:'spa',     emoji:'💆', dist:2.4, area:'Dago',        price:175000 },
    { id:'zen-spa',              name:'Zen Spa & Reflexology',  cat:'spa',     emoji:'💆', dist:2.8, area:'Pasteur',     price:95000  },
    { id:'cleanaja',             name:'CleanAja Home Service',  cat:'clean',   emoji:'🧹', dist:0.5, area:'Datang ke lokasi', price:80000 },
    { id:'sportaja',             name:'SportAja Arena',         cat:'sport',   emoji:'⚽', dist:3.5, area:'Bandung Selatan',  price:80000 },
    { id:'washaja-cihampelas',   name:'WashAja Cuci Mobil',     cat:'wash',    emoji:'🚗', dist:1.4, area:'Cihampelas',  price:45000  }
  ];
  function rupiah(n){ return 'Rp ' + n.toLocaleString('id-ID'); }

  function setupSearch() {
    const bar = document.querySelector('.search-bar');
    if (!bar) return;
    const input = bar.querySelector('input');
    if (!input) return;

    const box = document.createElement('div');
    box.className = 'pa-search-results';
    bar.appendChild(box);

    function render(q) {
      const query = q.trim().toLowerCase();
      box.innerHTML = '';
      if (!query) return;
      const hits = SEARCH_INDEX.filter((b) =>
        b.name.toLowerCase().includes(query) ||
        b.cat.toLowerCase().includes(query) ||
        b.area.toLowerCase().includes(query)
      ).slice(0, 8);

      if (hits.length === 0) {
        box.innerHTML =
          '<div class="pa-sr-empty"><span class="pa-sr-emoji">🔎</span>Tidak ada hasil untuk "<b>' +
          escapeHtml(q) + '</b>"</div>';
        return;
      }
      hits.forEach((b) => {
        const a = document.createElement('a');
        a.className = 'pa-sr-item';
        a.href = 'detail-bisnis.html?id=' + encodeURIComponent(b.id) + '&cat=' + encodeURIComponent(b.cat);
        a.innerHTML =
          '<div class="pa-sr-ic">' + b.emoji + '</div>' +
          '<div>' + escapeHtml(b.name) +
            '<div class="pa-sr-meta">' + escapeHtml(b.area) + ' · ' + b.dist + ' km · ' + rupiah(b.price) + '</div>' +
          '</div>';
        box.appendChild(a);
      });
    }

    input.addEventListener('input', (e) => render(e.target.value));
    input.addEventListener('focus', (e) => { if (e.target.value) render(e.target.value); });
    // Tutup saat klik di luar
    document.addEventListener('click', (e) => {
      if (!bar.contains(e.target)) box.innerHTML = '';
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { input.value = ''; box.innerHTML = ''; input.blur(); }
      if (e.key === 'Enter') {
        const first = box.querySelector('.pa-sr-item');
        if (first) window.location.href = first.getAttribute('href');
      }
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => (
      { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
    ));
  }

  // =====================================================
  // PUBLIC API
  // =====================================================
  window.PesanAja = window.PesanAja || {};
  Object.assign(window.PesanAja, {
    setTheme,
    getTheme: getStoredTheme,
    toggleTheme,
    SEARCH_INDEX,
    rupiah
  });

  // =====================================================
  // BOOTSTRAP
  // =====================================================
  function init() {
    mountSplash();
    setupTransitions();
    setupSearch();
    setupPWA();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
