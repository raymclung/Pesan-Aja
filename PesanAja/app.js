/* ============================================================
   PesanAja — App / Dashboard Scripts
============================================================ */
(function () {
  'use strict';

  // ---------- Section switcher (hash-based routing) ----------
  const navItems  = document.querySelectorAll('.nav-item');
  const sections  = document.querySelectorAll('.app-section');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    today:     'Hari Ini',
    calendar:  'Kalender',
    customers: 'Pelanggan',
    services:  'Layanan',
    promos:    'Promo & Voucher',
    staff:     'Staf',
    reports:   'Laporan',
    hours:     'Jam Operasional',
    settings:  'Pengaturan'
  };

  function show(section) {
    if (!titles[section]) section = 'today';
    sections.forEach(s => {
      const isMatch = s.id === 'sec-' + section;
      s.hidden = !isMatch;
      if (isMatch) s.classList.add('on'); else s.classList.remove('on');
    });
    navItems.forEach(n => n.classList.toggle('on', n.dataset.section === section));
    pageTitle.textContent = titles[section];
    document.getElementById('sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sec = item.dataset.section;
      history.replaceState(null, '', '#' + sec);
      show(sec);
    });
  });

  // Initial routing from hash
  const initialHash = (location.hash || '#today').replace('#', '');
  show(initialHash);

  // ---------- Calendar grid generator with click-to-detail ----------
  // May 2026: 1st = Friday. 31 days.
  const calGrid = document.getElementById('calGrid');
  if (calGrid) {
    const firstDayOfWeek = 5; // Mei 2026: 1 = Jumat (0=Min, 5=Jum)
    const daysInMonth = 31;
    const prevDays = 30; // April 30
    const today = 15;

    // Detailed booking data per day — populated with realistic salon bookings
    const bookings = {
      4: [
        { time:'09:00', cust:'Andi Pratama',   svc:'Cuci & Potong',     staff:'Eko',   tag:'Reguler',  status:'done',     price:75000 },
        { time:'11:00', cust:'Siti Rahma',     svc:'Creambath',         staff:'Linda', tag:'Reguler',  status:'done',     price:120000 }
      ],
      6: [
        { time:'14:00', cust:'Reservasi Group', svc:'Booking acara kantor (8 orang)', staff:'Tim', tag:'Reservasi', status:'done', price:0 }
      ],
      8: [
        { time:'10:00', cust:'Maya Putri',     svc:'Hair Coloring',    staff:'Linda', tag:'Booking',  status:'done',    price:250000 },
        { time:'13:00', cust:'Dewi Anggraini', svc:'Facial',           staff:'Sari',  tag:'Booking',  status:'done',    price:150000 },
        { time:'16:00', cust:'Rina Wahyu',     svc:'Manicure',         staff:'Sari',  tag:'Booking',  status:'done',    price:100000 }
      ],
      11: [
        { time:'08:00-17:00', cust:'Wedding — Bu Indah',  svc:'Hair & Makeup paket wedding (3 pax)', staff:'Tim',   tag:'Wedding',  status:'done',  price:3500000 }
      ],
      13: [
        { time:'10:00', cust:'Bu Ayu Kartika', svc:'VIP package: Smoothing + Spa + Facial', staff:'Linda', tag:'VIP', status:'done', price:1200000 }
      ],
      15: [
        { time:'09:00', cust:'Andi Pratama',   svc:'Cuci & Potong',     staff:'Eko',   tag:'Reguler',   status:'done',     price:75000 },
        { time:'09:30', cust:'Siti Rahma',     svc:'Creambath',         staff:'Linda', tag:'Reguler',   status:'done',     price:120000 },
        { time:'10:00', cust:'Bu Dini',        svc:'Smoothing (Medium)',staff:'Linda', tag:'Booking',   status:'ongoing',  price:650000 },
        { time:'10:30', cust:'Budi Santoso',   svc:'Potong Rambut Pria',staff:'Eko',   tag:'Reguler',   status:'done',     price:60000 },
        { time:'11:00', cust:'Dewi Anggraini', svc:'Manicure',          staff:'Sari',  tag:'Reguler',   status:'done',     price:100000 },
        { time:'12:00', cust:'Citra Dewi',     svc:'Hair Coloring',     staff:'Linda', tag:'Booking',   status:'ongoing',  price:250000 },
        { time:'13:00', cust:'Maya Putri',     svc:'Facial',            staff:'Sari',  tag:'Booking',   status:'upcoming', price:150000 },
        { time:'14:00', cust:'Rina Wahyu',     svc:'Hair Spa',          staff:'Linda', tag:'Reguler',   status:'upcoming', price:180000 },
        { time:'14:30', cust:'Ray',            svc:'Cuci & Potong',     staff:'Linda', tag:'Marketplace', status:'upcoming', price:75000 },
        { time:'15:30', cust:'Pak Aji',        svc:'Potong Rambut Pria',staff:'Eko',   tag:'Reguler',   status:'upcoming', price:60000 },
        { time:'16:30', cust:'Bu Sari',        svc:'Creambath + Facial',staff:'Linda', tag:'VIP',       status:'upcoming', price:270000 },
        { time:'18:00', cust:'Rudi Hartono',   svc:'Manicure',          staff:'Sari',  tag:'Reguler',   status:'upcoming', price:100000 }
      ],
      17: [
        { time:'10:00-19:00', cust:'PROMO DAY — Walk-in', svc:'Diskon 30% semua layanan (acara khusus)', staff:'Semua', tag:'Promo', status:'done', price:0 }
      ],
      20: [
        { time:'09:00', cust:'Anita Sari',     svc:'Hair Coloring',     staff:'Linda', tag:'Hair Color',status:'upcoming', price:250000 },
        { time:'11:00', cust:'Bu Lina',        svc:'Hair Coloring + Treatment', staff:'Linda', tag:'Hair Color', status:'upcoming', price:380000 },
        { time:'14:00', cust:'Sari Wulandari', svc:'Hair Color (Long)', staff:'Linda', tag:'Hair Color',status:'upcoming', price:350000 },
        { time:'16:30', cust:'Dinda Pratiwi',  svc:'Highlight',         staff:'Linda', tag:'Hair Color',status:'upcoming', price:280000 }
      ],
      22: [
        { time:'13:00-17:00', cust:'Workshop Internal — Tim Stylist', svc:'Training pewarnaan rambut (event)', staff:'Linda + trainer', tag:'Workshop', status:'upcoming', price:0 }
      ],
      25: [
        { time:'10:00', cust:'Pak Bambang',    svc:'Potong Rambut Pria', staff:'Eko',  tag:'Booking',  status:'upcoming', price:60000 },
        { time:'14:00', cust:'Maya Putri',     svc:'Manicure + Pedicure',staff:'Sari', tag:'Booking',  status:'upcoming', price:180000 }
      ],
      28: [
        { time:'09:00-18:00', cust:'FAMILY DAY — Diskon 50%', svc:'Khusus keluarga (min. 3 orang)', staff:'Semua', tag:'Family Day', status:'upcoming', price:0 }
      ],
      30: [
        { time:'10:00-17:00', cust:'PROMO WEEKEND — Walk-in', svc:'Free hair treatment dengan setiap potong rambut', staff:'Semua', tag:'Promo', status:'upcoming', price:0 }
      ]
    };

    // Color-coded tags
    const tagClass = {
      'Reguler':'blue', 'Booking':'orange', 'Reservasi':'blue',
      'Wedding':'teal', 'VIP':'orange', 'Promo':'orange',
      'Hair Color':'blue', 'Workshop':'teal', 'Family Day':'orange',
      'Marketplace':'rose'
    };

    function getTopTag(d){
      const list = bookings[d];
      if (!list || list.length === 0) return null;
      // Get most common tag, or special tag
      const counts = {};
      list.forEach(b => counts[b.tag] = (counts[b.tag] || 0) + 1);
      const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
      return sorted[0][0];
    }

    let html = '';
    // Previous month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      html += `<div class="cal-cell muted"><span class="date">${prevDays - i}</span></div>`;
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const list = bookings[d] || [];
      const cls = d === today ? 'cal-cell today' : 'cal-cell';
      const clickable = list.length > 0 ? 'has-bookings' : '';
      let evts = '';
      if (list.length > 0) {
        const topTag = getTopTag(d);
        if (d === today) {
          // Today: show count badge
          evts = `<span class="cal-evt orange">${list.length} booking</span>`;
        } else if (list.length === 1) {
          evts = `<span class="cal-evt ${tagClass[topTag] || 'blue'}">${topTag}</span>`;
        } else {
          evts = `<span class="cal-evt ${tagClass[topTag] || 'blue'}">${topTag}</span><span class="cal-evt">+${list.length - 1}</span>`;
        }
      }
      html += `<div class="${cls} ${clickable}" data-day="${d}" role="button" tabindex="0"><span class="date">${d}</span>${evts}</div>`;
    }
    // Fill trailing
    const totalUsed = firstDayOfWeek + daysInMonth;
    const tail = (7 - (totalUsed % 7)) % 7;
    for (let i = 1; i <= tail; i++) {
      html += `<div class="cal-cell muted"><span class="date">${i}</span></div>`;
    }
    calGrid.innerHTML = html;

    // Day click → open modal with detail
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dows   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

    function openDayModal(day){
      const list = bookings[day];
      if (!list || list.length === 0) return;
      const dayOfWeek = (firstDayOfWeek + day - 1) % 7;
      const dateStr = `${dows[dayOfWeek]}, ${day} Mei 2026`;
      const isToday = (day === today);

      const totalOmzet = list.reduce((s,b) => s + (b.price || 0), 0);
      const counts = list.reduce((acc,b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc; }, {});
      const done = counts.done || 0;
      const ongoing = counts.ongoing || 0;
      const upcoming = counts.upcoming || 0;
      const total = list.length;

      const fmt = n => 'Rp ' + n.toLocaleString('id-ID');

      // Map status → dm-tag class (same as "Hari Ini" section)
      const tagFor = s => ({done:'ok', ongoing:'now', upcoming:'soon', cancel:'cancel'}[s] || 'soon');
      const tagLabel = s => ({done:'Selesai', ongoing:'Sedang berlangsung', upcoming:'Terjadwal', cancel:'Dibatalkan'}[s] || 'Terjadwal');

      // Build the dm-list with EXACT same structure as "Hari Ini"
      const rowsHTML = list.map(b => {
        const isMarket = b.tag === 'Marketplace';
        return `
          <div class="dm-row ${b.status === 'done' ? 'done' : b.status === 'ongoing' ? 'now' : ''}">
            <span class="dm-time">${b.time}</span>
            <div class="dm-info">
              <strong>${b.cust}${isMarket ? ' <span class="mp-tag">🛒 marketplace</span>' : ''}</strong>
              <span>${b.svc} • dengan ${b.staff}${b.price > 0 ? ' · ' + fmt(b.price) : ''}</span>
            </div>
            <span class="dm-tag ${tagFor(b.status)}">${tagLabel(b.status)}</span>
          </div>
        `;
      }).join('');

      // Build the full day view that REPLACES calendar section
      const calSection = document.getElementById('sec-calendar');
      if (!calSection) return;

      // Save the original calendar HTML for restoration
      if (!calSection.dataset.originalHtml) {
        calSection.dataset.originalHtml = calSection.innerHTML;
      }

      calSection.innerHTML = `
        <div class="day-detail-head">
          <button class="back-to-cal" onclick="window.PA_backToCal()">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Kembali ke Kalender
          </button>
          <div class="day-detail-title">
            <small>${dateStr}${isToday ? ' · HARI INI' : ''}</small>
            <h2>Jadwal ${isToday ? 'Hari Ini' : day + ' Mei 2026'}</h2>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-card">
            <div class="stat-icon ic-blue"><svg class="ic"><use href="#i-today"/></svg></div>
            <div class="stat-meta">
              <span>Total Booking</span>
              <strong>${total}</strong>
              <small class="muted">${list[0].tag === 'Promo' || list[0].tag === 'Wedding' || list[0].tag === 'Workshop' || list[0].tag === 'Family Day' ? 'Event spesial' : 'Booking reguler'}</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ic-green"><svg class="ic"><use href="#i-check"/></svg></div>
            <div class="stat-meta">
              <span>Selesai</span>
              <strong>${done}</strong>
              <small class="muted">${total > 0 ? Math.round(done/total*100) : 0}% dari total</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ic-orange"><svg class="ic"><use href="#i-bell"/></svg></div>
            <div class="stat-meta">
              <span>${ongoing > 0 ? 'Berlangsung' : 'Akan Datang'}</span>
              <strong>${ongoing > 0 ? ongoing : upcoming}</strong>
              <small class="${ongoing > 0 ? 'warn' : 'up'}">${ongoing > 0 ? 'Sedang dilayani' : upcoming + ' booking pending'}</small>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon ic-teal"><svg class="ic"><use href="#i-chart"/></svg></div>
            <div class="stat-meta">
              <span>Total Omzet</span>
              <strong>${totalOmzet > 0 ? fmt(totalOmzet).replace('Rp ', 'Rp ').replace(/\.000$/,'rb').replace(/\.000\.000$/,'jt') : 'Rp 0'}</strong>
              <small class="up">Estimasi</small>
            </div>
          </div>
        </div>

        <div class="grid-2-1">
          <section class="panel">
            <div class="panel-head">
              <h2>Jadwal · ${dateStr}</h2>
              <div class="seg">
                <button class="on" data-filter="all">Semua (${total})</button>
                <button data-filter="done">Selesai (${done})</button>
                <button data-filter="ongoing">Berlangsung (${ongoing})</button>
                <button data-filter="upcoming">Terjadwal (${upcoming})</button>
              </div>
            </div>
            <div class="dm-list" id="dayDmList">
              ${rowsHTML}
            </div>
          </section>

          <aside class="stack">
            <section class="panel">
              <div class="panel-head"><h2>Ringkasan Hari</h2></div>
              <div class="dm-list small">
                <div class="dm-row" style="cursor:default">
                  <span class="dm-time" style="font-size:11px">JAM</span>
                  <div class="dm-info">
                    <strong>${list[0]?.time?.split('-')[0] || '-'} – ${list[list.length-1]?.time?.split('-')[1] || list[list.length-1]?.time || '-'}</strong>
                    <span>Jam operasi salon</span>
                  </div>
                </div>
                <div class="dm-row" style="cursor:default">
                  <span class="dm-time" style="font-size:11px">STAF</span>
                  <div class="dm-info">
                    <strong>${[...new Set(list.map(b => b.staff))].filter(s => s !== 'Tim' && s !== 'Semua').length || 'Semua'} stylist</strong>
                    <span>${[...new Set(list.map(b => b.staff))].slice(0,3).join(', ')}${[...new Set(list.map(b => b.staff))].length > 3 ? '...' : ''}</span>
                  </div>
                </div>
                <div class="dm-row" style="cursor:default">
                  <span class="dm-time" style="font-size:11px">TIPE</span>
                  <div class="dm-info">
                    <strong>${list[0].tag}</strong>
                    <span>${[...new Set(list.map(b => b.tag))].length} kategori event</span>
                  </div>
                </div>
              </div>
            </section>
            <section class="panel">
              <div class="panel-head"><h2>Aksi Cepat</h2></div>
              <div class="dm-list small">
                <button class="btn btn-primary full" style="margin:8px 0"><svg class="ic"><use href="#i-plus"/></svg>Tambah Booking</button>
                <button class="btn btn-ghost full" style="margin:8px 0">Export PDF</button>
                <button class="btn btn-ghost full" style="margin:8px 0">Cetak Jadwal</button>
              </div>
            </section>
          </aside>
        </div>
      `;

      // Wire filter buttons
      calSection.querySelectorAll('.seg button[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => {
          calSection.querySelectorAll('.seg button').forEach(b => b.classList.remove('on'));
          btn.classList.add('on');
          const f = btn.dataset.filter;
          calSection.querySelectorAll('#dayDmList .dm-row').forEach(row => {
            if (f === 'all') { row.style.display = ''; return; }
            const isDone = row.classList.contains('done');
            const isNow = row.classList.contains('now');
            const isUpcoming = !isDone && !isNow;
            if (f === 'done' && isDone) row.style.display = '';
            else if (f === 'ongoing' && isNow) row.style.display = '';
            else if (f === 'upcoming' && isUpcoming) row.style.display = '';
            else row.style.display = 'none';
          });
        });
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Expose restore function globally
    window.PA_backToCal = function(){
      const calSection = document.getElementById('sec-calendar');
      if (calSection && calSection.dataset.originalHtml) {
        calSection.innerHTML = calSection.dataset.originalHtml;
        delete calSection.dataset.originalHtml;
        // Re-bind: trigger calendar re-render
        window.location.reload(); // Simple but reliable
      }
    };

    // Inject styles for clickable cells + modal
    if (!document.getElementById('cal-modal-style')) {
      const s = document.createElement('style');
      s.id = 'cal-modal-style';
      s.textContent = `
        .cal-cell.has-bookings{cursor:pointer;transition:background .15s,transform .12s,box-shadow .15s}
        .cal-cell.has-bookings:hover{background:rgba(31,79,217,.05);transform:translateY(-1px);box-shadow:0 4px 12px rgba(31,79,217,.10)}
        .cal-cell.has-bookings:focus-visible{outline:2px solid var(--c-primary);outline-offset:-2px}

        /* Day Detail view (replaces calendar when day clicked) */
        .day-detail-head{
          display:flex;align-items:center;gap:16px;
          padding:6px 0 22px;margin-bottom:8px;
          border-bottom:1px solid var(--c-line-2);
        }
        .back-to-cal{
          display:inline-flex;align-items:center;gap:7px;
          padding:9px 14px 9px 11px;
          background:var(--c-bg-soft);color:var(--c-primary);
          border-radius:99px;border:none;cursor:pointer;
          font-family:inherit;font-weight:700;font-size:13px;
          transition:background .15s;
        }
        .back-to-cal:hover{background:rgba(31,79,217,.16)}
        .day-detail-title{flex:1}
        .day-detail-title small{
          display:block;font-size:11.5px;color:var(--c-muted);
          font-weight:700;letter-spacing:.04em;margin-bottom:3px;
        }
        .day-detail-title h2{margin:0;font-size:22px;font-weight:800;color:var(--c-ink)}

        /* Marketplace badge inline in dm-info */
        .mp-tag{
          display:inline-block;background:var(--c-bg-soft);color:var(--c-primary);
          font-size:9.5px;font-weight:800;padding:1px 6px;border-radius:99px;
          letter-spacing:.04em;margin-left:4px;vertical-align:middle;
        }

        /* Reuse dm-tag.cancel if missing */
        .dm-tag.cancel{background:#FEE2E2;color:#B91C1C}

        .day-modal{
          position:fixed;inset:0;background:rgba(11,23,38,.55);backdrop-filter:blur(6px);
          z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;
          opacity:0;pointer-events:none;transition:opacity .22s ease;
        }
        .day-modal.on{opacity:1;pointer-events:auto}
        .day-modal-inner{
          background:#fff;border-radius:20px;max-width:680px;width:100%;
          max-height:88vh;display:flex;flex-direction:column;
          transform:scale(.94) translateY(8px);transition:transform .25s ease;
          box-shadow:0 24px 64px rgba(11,23,38,.30);
        }
        .day-modal.on .day-modal-inner{transform:scale(1) translateY(0)}
        .day-modal-head{
          display:flex;justify-content:space-between;align-items:flex-start;gap:16px;
          padding:20px 22px 16px;border-bottom:1px solid var(--c-line-2);
        }
        .day-modal-head small{
          display:block;font-size:11.5px;color:var(--c-muted);
          letter-spacing:.04em;text-transform:uppercase;font-weight:700;margin-bottom:4px;
        }
        .day-modal-head h3{margin:0;font-size:18px;font-weight:800;color:var(--c-ink)}
        .day-close{
          width:34px;height:34px;border-radius:50%;background:var(--c-bg-alt);
          color:var(--c-ink-2);display:flex;align-items:center;justify-content:center;
          font-size:18px;border:none;cursor:pointer;transition:background .15s;flex-shrink:0;
        }
        .day-close:hover{background:var(--c-line)}

        .day-stats-bar{
          display:flex;flex-wrap:wrap;gap:8px;padding:14px 22px;
          background:var(--c-bg-alt);border-bottom:1px solid var(--c-line-2);
        }
        .day-stat-pill{
          font-size:11.5px;font-weight:700;padding:5px 11px;border-radius:99px;
        }
        .day-stat-pill.blue{background:#DBEAFE;color:#1D4ED8}
        .day-stat-pill.orange{background:#FFE9DA;color:#C2410C}
        .day-stat-pill.green{background:#DCFCE7;color:#15803D}
        .day-stat-pill.red{background:#FEE2E2;color:#B91C1C}
        .day-stat-pill.omzet{background:#fff;color:var(--c-ink);border:1px solid var(--c-line)}

        .day-modal-body{
          flex:1;overflow-y:auto;padding:14px 22px;
          display:flex;flex-direction:column;gap:8px;
        }
        .day-booking-row{
          display:grid;grid-template-columns:90px 1fr auto;gap:14px;align-items:center;
          padding:12px 14px;background:#fff;border:1px solid var(--c-line-2);border-radius:12px;
          transition:transform .12s ease,box-shadow .15s ease,border-color .15s;
        }
        .day-booking-row:hover{transform:translateX(2px);box-shadow:0 4px 14px rgba(11,23,38,.06);border-color:var(--c-primary)}
        .day-booking-row.ongoing{border-left:3px solid var(--c-accent);background:rgba(255,122,45,.03)}
        .day-booking-row.upcoming{border-left:3px solid var(--c-primary)}
        .day-booking-row.done{opacity:.7}

        .dbr-time strong{font-size:14px;color:var(--c-ink);font-weight:800;font-variant-numeric:tabular-nums}
        .dbr-cust{display:flex;gap:11px;align-items:center;min-width:0}
        .dbr-avatar{
          width:38px;height:38px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--c-primary),#3A78E0);
          color:#fff;display:flex;align-items:center;justify-content:center;
          font-weight:800;font-size:13px;
        }
        .dbr-info{min-width:0}
        .dbr-info strong{display:block;font-size:13.5px;color:var(--c-ink);font-weight:700}
        .dbr-info span{display:block;font-size:12px;color:var(--c-ink-2);margin-top:1px}
        .dbr-info small{display:block;font-size:11px;color:var(--c-muted);margin-top:2px}
        .dbr-info .mp-flag{
          font-size:9.5px;font-weight:800;padding:1px 6px;border-radius:99px;
          background:rgba(31,79,217,.10);color:var(--c-primary);letter-spacing:.04em;margin-left:4px;
        }
        .dbr-side{display:flex;flex-direction:column;align-items:flex-end;gap:4px}
        .dbr-status{
          font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px;
          letter-spacing:.04em;text-transform:uppercase;
        }
        .dbr-status.upcoming{background:#DBEAFE;color:#1D4ED8}
        .dbr-status.ongoing{background:#FFE9DA;color:#C2410C}
        .dbr-status.done{background:#DCFCE7;color:#15803D}
        .dbr-status.cancel{background:#FEE2E2;color:#B91C1C}
        .dbr-price{font-size:13px;font-weight:800;color:var(--c-primary)}

        .day-modal-foot{
          display:flex;gap:10px;justify-content:flex-end;
          padding:14px 22px;border-top:1px solid var(--c-line-2);
        }
        .day-modal-foot button{
          padding:10px 18px;border-radius:99px;font-family:inherit;
          font-weight:800;font-size:13px;cursor:pointer;border:none;
        }
        .day-modal-foot .btn-secondary{background:var(--c-bg-alt);color:var(--c-ink-2)}
        .day-modal-foot .btn-primary{background:var(--c-primary);color:#fff}
        .day-modal-foot .btn-primary:hover{background:var(--c-primary-600)}

        @media (max-width:640px){
          .day-modal{padding:0;align-items:flex-end}
          .day-modal-inner{border-radius:20px 20px 0 0;max-height:90vh}
          .day-booking-row{grid-template-columns:60px 1fr;grid-template-rows:auto auto;gap:8px 12px}
          .dbr-side{grid-column:2;align-items:flex-start;flex-direction:row}
        }
      `;
      document.head.appendChild(s);
    }

    // Expose globally so inline handlers / debugging works
    window.PA_openDayDetail = openDayModal;

    // Bind clicks (event delegation)
    calGrid.addEventListener('click', e => {
      const cell = e.target.closest('.cal-cell');
      if (!cell) return;
      const day = parseInt(cell.dataset.day, 10);
      if (!day || !bookings[day]) return;
      openDayModal(day);
    });
    calGrid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const cell = e.target.closest('.cal-cell');
      if (!cell) return;
      e.preventDefault();
      const day = parseInt(cell.dataset.day, 10);
      if (day && bookings[day]) openDayModal(day);
    });

    // Also re-bind delegation on document (fallback if calGrid replaced)
    if (!window.__paCalDelegate) {
      window.__paCalDelegate = true;
      document.addEventListener('click', e => {
        const cell = e.target.closest('.cal-cell.has-bookings');
        if (!cell) return;
        const day = parseInt(cell.dataset.day, 10);
        if (day && window.PA_openDayDetail) window.PA_openDayDetail(day);
      });
    }
  }

  // ---------- Copy share URL ----------
  window.copyShare = function () {
    const url = document.getElementById('shareUrl').textContent.trim();
    const full = 'https://' + url;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(full).then(() => toast('Link booking disalin ke clipboard.'));
    } else {
      toast('Salin: ' + full);
    }
  };

  // ---------- Tiny toast ----------
  function toast(msg) {
    let t = document.getElementById('app-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'app-toast';
      Object.assign(t.style, {
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        background: '#0B1726',
        color: '#fff',
        padding: '12px 18px',
        borderRadius: '10px',
        fontSize: '.9rem',
        fontWeight: '600',
        boxShadow: '0 10px 30px rgba(0,0,0,.25)',
        opacity: '0',
        transition: 'opacity .2s ease, transform .25s ease',
        zIndex: '9999',
        pointerEvents: 'none'
      });
      document.body.appendChild(t);
    }
    t.textContent = msg;
    requestAnimationFrame(() => {
      t.style.opacity = '1';
      t.style.transform = 'translateX(-50%) translateY(0)';
    });
    clearTimeout(t._h);
    t._h = setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 2400);
  }

  // ---------- Confirm/decline buttons (pending bookings) ----------
  document.querySelectorAll('.action-pair button').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.dm-row');
      if (!row) return;
      const text = btn.textContent.trim();
      toast(text === 'Setuju' ? 'Booking dikonfirmasi & notifikasi terkirim.' : 'Booking ditolak.');
      row.style.transition = 'opacity .25s ease, transform .25s ease';
      row.style.opacity = '0';
      row.style.transform = 'translateX(20px)';
      setTimeout(() => row.remove(), 280);
    });
  });

  // ---------- Settings nav (inert links, just visual) ----------
  document.querySelectorAll('.settings-nav a').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.settings-nav a').forEach(x => x.classList.remove('on'));
      a.classList.add('on');
    });
  });

  // ============================================================
  // SYNC: customer marketplace orders → owner dashboard
  // ============================================================
  // Read orders saved by booking-flow / payment.html into localStorage
  // and inject them into "Hari Ini" section if relevant for this salon.
  function syncCustomerOrders() {
    const orders = JSON.parse(localStorage.getItem('pesanaja-orders') || '[]');
    if (orders.length === 0) return;

    // Filter orders for this business (Salon Melati demo dashboard)
    const myBiz = 'Salon Melati';
    const newOrders = orders.filter(o =>
      o.biz === myBiz && (o.status === 'upcoming' || o.status === 'ongoing')
    );
    if (newOrders.length === 0) return;

    // Find the "Hari Ini" booking table or panel
    const todayPanel = document.getElementById('todayBookings') ||
                       document.querySelector('#sec-today .panel:first-child');
    if (!todayPanel) return;

    // Add notification badge on bell icon (top-right)
    const bell = document.querySelector('.app-topbar [aria-label="Notifikasi"], .topbar [aria-label="Notifikasi"]');
    if (bell && !bell.querySelector('.notif-badge')) {
      const badge = document.createElement('span');
      badge.className = 'notif-badge';
      badge.style.cssText = 'position:absolute;top:6px;right:6px;width:9px;height:9px;background:var(--c-accent);border-radius:50%;border:2px solid #fff;';
      badge.title = newOrders.length + ' booking baru dari marketplace';
      bell.style.position = 'relative';
      bell.appendChild(badge);
    }

    // Inject "New from marketplace" toast notification (top of page once)
    if (!sessionStorage.getItem('pesanaja-toast-shown')) {
      const toast = document.createElement('div');
      toast.style.cssText = `
        position:fixed;top:20px;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#1F4FD9,#1A45BF);color:#fff;
        padding:12px 18px;border-radius:12px;
        font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;
        box-shadow:0 12px 30px rgba(0,0,0,.20);z-index:1000;
        display:flex;align-items:center;gap:10px;cursor:pointer;
        animation:slideIn .35s ease;max-width:90%;
      `;
      toast.innerHTML = `
        <span style="font-size:18px">🛎️</span>
        <div>
          <div><strong>${newOrders.length} booking baru</strong> dari marketplace</div>
          <small style="opacity:.85;font-size:11px">Pelanggan: ${newOrders[0].customerName || 'Customer'} · ${newOrders[0].date || ''}</small>
        </div>
        <span style="margin-left:10px;font-size:18px;opacity:.7">×</span>
      `;
      toast.onclick = () => toast.remove();
      document.body.appendChild(toast);
      sessionStorage.setItem('pesanaja-toast-shown', '1');
      setTimeout(() => toast.remove(), 8000);
    }

    // Inject orders into "Today" booking list if there's a known container
    const bookingList = document.querySelector('#sec-today .booking-list, #sec-today [data-bookings], .schedule-list');
    if (bookingList) {
      newOrders.slice(0,3).forEach(o => {
        const row = document.createElement('div');
        row.className = 'booking-row from-marketplace';
        row.style.cssText = 'border-left:3px solid var(--c-accent);background:rgba(255,122,45,.04);';
        const svcName = (o.services && o.services[0]?.name) || 'Booking baru';
        row.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;border-bottom:1px solid var(--c-line-2);">
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;color:var(--c-accent-600);font-weight:700;margin-bottom:3px">
                🛒 Dari marketplace
              </div>
              <strong style="font-size:13.5px;color:var(--c-ink)">${o.customerName || 'Customer'} · ${svcName}</strong>
              <div style="font-size:11.5px;color:var(--c-muted);margin-top:2px">
                ${o.date || ''} · ${o.time || ''} · ${o.staff || '-'}
              </div>
            </div>
            <span style="background:#DBEAFE;color:#1D4ED8;font-size:10px;font-weight:800;padding:3px 9px;border-radius:99px">
              ${o.status === 'upcoming' ? 'BARU' : 'AKTIF'}
            </span>
          </div>
        `;
        bookingList.insertBefore(row, bookingList.firstChild);
      });
    }
  }

  // Add slideIn animation if not yet defined
  if (!document.querySelector('#pa-anim-style')) {
    const s = document.createElement('style');
    s.id = 'pa-anim-style';
    s.textContent = '@keyframes slideIn{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
    document.head.appendChild(s);
  }

  // Run sync after DOM is fully ready
  if (document.readyState === 'complete') {
    syncCustomerOrders();
  } else {
    window.addEventListener('load', syncCustomerOrders);
  }

  // ============================================================
  // PROMO MANAGEMENT (Owner side)
  // ============================================================
  const promoStorageKey = 'pesanaja-owner-promos';
  function loadPromos(){
    const saved = localStorage.getItem(promoStorageKey);
    if (saved) return JSON.parse(saved);
    // Default sample
    return [
      { id:'p1', title:'Diskon 30% Smoothing',  code:'SMOOTH30',  type:'percent', value:30, bg:'orange',
        services:'Smoothing', minOrder:300000, expires:'2026-05-31', uses:8, status:'active',
        desc:'Min. transaksi Rp 300.000. Berlaku Senin–Jumat.' },
      { id:'p2', title:'Cashback Rp 25rb', code:'CB25', type:'cashback', value:25000, bg:'teal',
        services:'Semua layanan', minOrder:100000, expires:'2026-06-15', uses:24, status:'active',
        desc:'Cashback otomatis ke wallet pelanggan. Min. Rp 100rb.' },
      { id:'p3', title:'Buy 1 Get 1 Manicure', code:'BOGO-NAIL', type:'bogo', value:0, bg:'purple',
        services:'Manicure / Pedicure', minOrder:0, expires:'2026-05-25', uses:3, status:'paused',
        desc:'Khusus weekday. Tidak berlaku saat hari libur.' }
    ];
  }
  function savePromos(list){ localStorage.setItem(promoStorageKey, JSON.stringify(list)); }

  let promos = loadPromos();

  function renderPromos(){
    const list = document.getElementById('promoList');
    if (!list) return;
    const activeCount = promos.filter(p => p.status === 'active').length;
    const countEl = document.getElementById('promoCount');
    if (countEl) countEl.textContent = activeCount + ' aktif';

    if (promos.length === 0) {
      list.innerHTML = `<div class="promo-empty">
        <div class="pe-ic">🎁</div>
        <h3>Belum ada promo</h3>
        <p>Buat promo pertamamu untuk menarik lebih banyak pelanggan.</p>
        <button class="btn btn-primary" onclick="openPromoModal()">+ Buat Promo Baru</button>
      </div>`;
      return;
    }

    const fmt = n => 'Rp ' + n.toLocaleString('id-ID');
    list.innerHTML = promos.map(p => {
      const value = p.type === 'percent' ? p.value + '%' :
                    p.type === 'cashback' ? fmt(p.value) :
                    p.type === 'bogo' ? 'BOGO' : p.value;
      const label = p.type === 'percent' ? 'OFF' :
                    p.type === 'cashback' ? 'CASHBACK' : 'DEAL';
      const exp = new Date(p.expires);
      const daysLeft = Math.ceil((exp - new Date()) / 86400000);
      const expText = daysLeft > 0 ? `${daysLeft} hari lagi` : 'Sudah berakhir';
      const expired = daysLeft <= 0;

      return `
        <div class="promo-row ${p.status} ${expired ? 'expired' : ''}">
          <div class="pr-img bg-${p.bg}">
            <div class="pr-pct">${value}</div>
            <div class="pr-lbl">${label}</div>
          </div>
          <div class="pr-body">
            <h4>${p.title}</h4>
            <p>${p.desc}</p>
            <div class="pr-meta">
              <span class="pr-code">${p.code}</span>
              <span class="pr-chip ${expired ? 'red' : 'orange'}">⏱ ${expText}</span>
              <span class="pr-chip blue">${p.uses}× digunakan</span>
              <span class="pr-chip ${p.status === 'active' ? 'green' : 'grey'}">${p.status === 'active' ? '● Aktif' : '⏸ Dijeda'}</span>
            </div>
          </div>
          <div class="pr-actions">
            <button class="pr-btn" title="${p.status === 'active' ? 'Jeda' : 'Aktifkan'}" onclick="togglePromo('${p.id}')">${p.status === 'active' ? '⏸' : '▶'}</button>
            <button class="pr-btn" title="Edit" onclick="editPromo('${p.id}')">✎</button>
            <button class="pr-btn danger" title="Hapus" onclick="deletePromo('${p.id}')">🗑</button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.openPromoModal = function(promoId){
    const editing = promoId ? promos.find(p => p.id === promoId) : null;
    let modal = document.getElementById('promoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'promoModal';
      modal.className = 'pa-modal';
      document.body.appendChild(modal);
    }
    const e = editing || { id:'', title:'', code:'', type:'percent', value:10, bg:'orange', services:'Semua layanan', minOrder:0, expires:new Date(Date.now()+7*86400000).toISOString().slice(0,10), uses:0, status:'active', desc:'' };
    modal.innerHTML = `
      <div class="pa-modal-inner">
        <header class="pa-modal-head">
          <h3>${editing ? '✎ Edit Promo' : '🎁 Buat Promo Baru'}</h3>
          <button class="pa-close" onclick="document.getElementById('promoModal').classList.remove('on')">✕</button>
        </header>
        <div class="pa-modal-body">
          <div class="pa-form">
            <label>Nama Promo</label>
            <input id="pmTitle" type="text" placeholder="Contoh: Diskon 30% Hari Spesial" value="${e.title}" />

            <div class="pa-grid-2">
              <div><label>Kode Voucher</label><input id="pmCode" type="text" placeholder="DISC30" value="${e.code}" /></div>
              <div><label>Tipe Diskon</label>
                <select id="pmType">
                  <option value="percent" ${e.type==='percent'?'selected':''}>Persen (%)</option>
                  <option value="cashback" ${e.type==='cashback'?'selected':''}>Cashback (Rp)</option>
                  <option value="bogo" ${e.type==='bogo'?'selected':''}>Buy 1 Get 1</option>
                </select>
              </div>
            </div>

            <div class="pa-grid-2">
              <div><label>Nilai Diskon</label><input id="pmValue" type="number" value="${e.value}" /></div>
              <div><label>Warna Banner</label>
                <select id="pmBg">
                  <option value="orange" ${e.bg==='orange'?'selected':''}>🟠 Oranye</option>
                  <option value="blue" ${e.bg==='blue'?'selected':''}>🔵 Biru</option>
                  <option value="teal" ${e.bg==='teal'?'selected':''}>🟢 Tosca</option>
                  <option value="purple" ${e.bg==='purple'?'selected':''}>🟣 Ungu</option>
                  <option value="rose" ${e.bg==='rose'?'selected':''}>🌸 Pink</option>
                </select>
              </div>
            </div>

            <label>Layanan yang Berlaku</label>
            <input id="pmServices" type="text" placeholder="Contoh: Smoothing, Hair Color" value="${e.services}" />

            <div class="pa-grid-2">
              <div><label>Min. Transaksi (Rp)</label><input id="pmMin" type="number" value="${e.minOrder}" /></div>
              <div><label>Berlaku Sampai</label><input id="pmExp" type="date" value="${e.expires}" /></div>
            </div>

            <label>Deskripsi / Syarat &amp; Ketentuan</label>
            <textarea id="pmDesc" rows="2" placeholder="Min. transaksi, hari berlaku, dll">${e.desc}</textarea>
          </div>
        </div>
        <footer class="pa-modal-foot">
          <button class="btn btn-ghost" onclick="document.getElementById('promoModal').classList.remove('on')">Batal</button>
          <button class="btn btn-primary" onclick="savePromo('${e.id}')">${editing ? 'Simpan' : 'Buat Promo'}</button>
        </footer>
      </div>
    `;
    requestAnimationFrame(() => modal.classList.add('on'));
    modal.onclick = (ev) => { if (ev.target === modal) modal.classList.remove('on'); };
  };

  window.savePromo = function(id){
    const data = {
      id: id || ('p' + Date.now()),
      title:    document.getElementById('pmTitle').value.trim(),
      code:     document.getElementById('pmCode').value.trim().toUpperCase(),
      type:     document.getElementById('pmType').value,
      value:    parseInt(document.getElementById('pmValue').value) || 0,
      bg:       document.getElementById('pmBg').value,
      services: document.getElementById('pmServices').value.trim(),
      minOrder: parseInt(document.getElementById('pmMin').value) || 0,
      expires:  document.getElementById('pmExp').value,
      desc:     document.getElementById('pmDesc').value.trim(),
      uses:     id ? (promos.find(p=>p.id===id)?.uses || 0) : 0,
      status:   id ? (promos.find(p=>p.id===id)?.status || 'active') : 'active'
    };
    if (!data.title || !data.code) { alert('Nama promo dan kode voucher wajib diisi'); return; }
    if (id) {
      const idx = promos.findIndex(p => p.id === id);
      promos[idx] = data;
    } else {
      promos.unshift(data);
    }
    savePromos(promos);
    renderPromos();
    document.getElementById('promoModal').classList.remove('on');
    showOwnerToast(id ? '✓ Promo berhasil diupdate' : '🎉 Promo baru berhasil dibuat!');
  };

  window.editPromo   = function(id){ openPromoModal(id); };
  window.togglePromo = function(id){
    const p = promos.find(x => x.id === id);
    if (!p) return;
    p.status = p.status === 'active' ? 'paused' : 'active';
    savePromos(promos);
    renderPromos();
    showOwnerToast(p.status === 'active' ? '▶ Promo diaktifkan' : '⏸ Promo dijeda');
  };
  window.deletePromo = function(id){
    if (!confirm('Yakin ingin menghapus promo ini?')) return;
    promos = promos.filter(p => p.id !== id);
    savePromos(promos);
    renderPromos();
    showOwnerToast('🗑 Promo dihapus');
  };

  function showOwnerToast(msg){
    let t = document.getElementById('ownerToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'ownerToast';
      t.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#16A34A,#15803D);color:#fff;padding:12px 22px;border-radius:99px;font-weight:700;font-size:13.5px;box-shadow:0 10px 28px rgba(0,0,0,.25);z-index:300;opacity:0;transition:opacity .25s,transform .25s;font-family:inherit';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(-10px)'; }, 2200);
  }

  // ============================================================
  // OPERATING HOURS + CLOSED DAYS
  // ============================================================
  const hoursStorageKey = 'pesanaja-owner-hours';
  const holidayStorageKey = 'pesanaja-owner-holidays';
  const days = [
    { k:'mon', n:'Senin' }, { k:'tue', n:'Selasa' }, { k:'wed', n:'Rabu' },
    { k:'thu', n:'Kamis' }, { k:'fri', n:'Jumat' }, { k:'sat', n:'Sabtu' }, { k:'sun', n:'Minggu' }
  ];
  function loadHours(){
    const saved = localStorage.getItem(hoursStorageKey);
    if (saved) return JSON.parse(saved);
    return {
      mon:{open:true,from:'09:00',to:'21:00'}, tue:{open:true,from:'09:00',to:'21:00'},
      wed:{open:true,from:'09:00',to:'21:00'}, thu:{open:true,from:'09:00',to:'21:00'},
      fri:{open:true,from:'09:00',to:'21:00'}, sat:{open:true,from:'09:00',to:'22:00'},
      sun:{open:true,from:'10:00',to:'20:00'}
    };
  }
  function loadHolidays(){
    const saved = localStorage.getItem(holidayStorageKey);
    if (saved) return JSON.parse(saved);
    return [
      { date:'2026-05-29', label:'Cuti Idul Fitri' },
      { date:'2026-06-05', label:'Renovasi salon' }
    ];
  }
  let hours = loadHours();
  let holidays = loadHolidays();

  function renderHours(){
    const grid = document.getElementById('hoursGrid');
    if (!grid) return;
    grid.innerHTML = days.map(d => {
      const h = hours[d.k];
      return `
        <div class="hour-row ${h.open ? 'open' : 'closed'}">
          <div class="hr-day"><strong>${d.n}</strong>${(d.k === 'sat' || d.k === 'sun') ? '<small>(Weekend)</small>' : ''}</div>
          <label class="hr-toggle">
            <input type="checkbox" ${h.open?'checked':''} onchange="toggleHourDay('${d.k}',this.checked)" />
            <span class="hr-switch"></span>
            <span class="hr-label">${h.open ? 'Buka' : 'Tutup'}</span>
          </label>
          <div class="hr-times" ${h.open ? '' : 'style="opacity:.4;pointer-events:none"'}>
            <input type="time" value="${h.from}" onchange="updateHour('${d.k}','from',this.value)" />
            <span>—</span>
            <input type="time" value="${h.to}" onchange="updateHour('${d.k}','to',this.value)" />
          </div>
        </div>
      `;
    }).join('');
  }

  function renderHolidays(){
    const list = document.getElementById('holidayList');
    if (!list) return;
    const countEl = document.getElementById('holidayCount');
    if (countEl) countEl.textContent = holidays.length + ' hari';

    if (holidays.length === 0) {
      list.innerHTML = '<p class="muted small" style="padding:20px;text-align:center">Belum ada tanggal tutup khusus. Tambah saat ada cuti, renovasi, atau libur nasional.</p>';
      return;
    }

    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    const dows = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

    list.innerHTML = holidays.sort((a,b) => a.date.localeCompare(b.date)).map((h,i) => {
      const d = new Date(h.date);
      const dateStr = `${dows[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      return `
        <div class="holiday-row">
          <div class="hl-cal">
            <div class="hl-month">${months[d.getMonth()].toUpperCase()}</div>
            <div class="hl-day">${d.getDate()}</div>
          </div>
          <div class="hl-info">
            <strong>${h.label}</strong>
            <small>${dateStr}</small>
          </div>
          <button class="pr-btn danger" onclick="removeHoliday(${i})" title="Hapus">🗑</button>
        </div>
      `;
    }).join('');
  }

  window.toggleHourDay = function(k, open){
    hours[k].open = open;
    localStorage.setItem(hoursStorageKey, JSON.stringify(hours));
    renderHours();
  };
  window.updateHour = function(k, key, val){
    hours[k][key] = val;
    localStorage.setItem(hoursStorageKey, JSON.stringify(hours));
  };
  window.removeHoliday = function(i){
    if (!confirm('Hapus tanggal tutup ini?')) return;
    holidays.splice(i, 1);
    localStorage.setItem(holidayStorageKey, JSON.stringify(holidays));
    renderHolidays();
    showOwnerToast('Tanggal tutup dihapus');
  };
  window.openHolidayModal = function(){
    let modal = document.getElementById('holidayModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'holidayModal';
      modal.className = 'pa-modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="pa-modal-inner" style="max-width:420px">
        <header class="pa-modal-head">
          <h3>📅 Tambah Tanggal Tutup</h3>
          <button class="pa-close" onclick="document.getElementById('holidayModal').classList.remove('on')">✕</button>
        </header>
        <div class="pa-modal-body">
          <div class="pa-form">
            <label>Tanggal Tutup</label>
            <input id="hlDate" type="date" value="${new Date().toISOString().slice(0,10)}" />
            <label>Alasan / Keterangan</label>
            <input id="hlLabel" type="text" placeholder="Contoh: Cuti tahunan, Renovasi, Libur nasional" />
            <p class="muted small" style="margin-top:8px">💡 Tip: Pelanggan tidak bisa booking di tanggal tutup. Mereka akan lihat info "Salon tutup hari ini" di halaman booking.</p>
          </div>
        </div>
        <footer class="pa-modal-foot">
          <button class="btn btn-ghost" onclick="document.getElementById('holidayModal').classList.remove('on')">Batal</button>
          <button class="btn btn-primary" onclick="addHoliday()">Simpan</button>
        </footer>
      </div>
    `;
    requestAnimationFrame(() => modal.classList.add('on'));
    modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('on'); };
  };
  window.addHoliday = function(){
    const date = document.getElementById('hlDate').value;
    const label = document.getElementById('hlLabel').value.trim() || 'Tutup';
    if (!date) { alert('Tanggal wajib diisi'); return; }
    if (holidays.some(h => h.date === date)) { alert('Tanggal ini sudah ditandai tutup'); return; }
    holidays.push({ date, label });
    localStorage.setItem(holidayStorageKey, JSON.stringify(holidays));
    document.getElementById('holidayModal').classList.remove('on');
    renderHolidays();
    showOwnerToast('✓ Tanggal tutup berhasil ditambahkan');
  };

  // Inject styles
  if (!document.getElementById('owner-mod-style')) {
    const s = document.createElement('style');
    s.id = 'owner-mod-style';
    s.textContent = `
      .promo-list{display:flex;flex-direction:column;gap:12px;padding:6px 0}
      .promo-empty{text-align:center;padding:60px 30px;color:var(--c-muted)}
      .promo-empty .pe-ic{font-size:60px;margin-bottom:12px}
      .promo-empty h3{margin:0 0 6px;color:var(--c-ink)}
      .promo-empty p{margin:0 0 18px}
      .promo-row{display:grid;grid-template-columns:120px 1fr auto;gap:14px;background:#fff;border:1px solid var(--c-line-2);border-radius:14px;overflow:hidden;transition:box-shadow .15s,transform .12s}
      .promo-row:hover{box-shadow:0 8px 20px rgba(11,23,38,.08)}
      .promo-row.paused{opacity:.7}
      .promo-row.expired{opacity:.5;background:#FAFBFC}
      .pr-img{padding:18px 12px;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
      .pr-img.bg-orange{background:linear-gradient(135deg,#FF8A3D,#E65520)}
      .pr-img.bg-blue{background:linear-gradient(135deg,#3A78E0,#1F4FD9)}
      .pr-img.bg-teal{background:linear-gradient(135deg,#2DD4BF,#0F9E89)}
      .pr-img.bg-purple{background:linear-gradient(135deg,#A78BFA,#7C3AED)}
      .pr-img.bg-rose{background:linear-gradient(135deg,#FB7185,#E11D48)}
      .pr-pct{font-size:24px;font-weight:900;line-height:1;letter-spacing:-.02em}
      .pr-lbl{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;opacity:.95;margin-top:4px}
      .pr-body{padding:14px 12px 14px 0;display:flex;flex-direction:column;justify-content:center;min-width:0}
      .pr-body h4{margin:0 0 4px;font-size:14.5px;font-weight:700;color:var(--c-ink)}
      .pr-body p{margin:0 0 8px;font-size:12px;color:var(--c-muted);line-height:1.4}
      .pr-meta{display:flex;flex-wrap:wrap;gap:6px}
      .pr-code{font-family:'Courier New',monospace;font-size:11px;font-weight:800;background:var(--c-bg-soft);color:var(--c-primary);padding:3px 8px;border-radius:5px;border:1px dashed var(--c-primary)}
      .pr-chip{font-size:10.5px;font-weight:700;padding:3px 8px;border-radius:99px}
      .pr-chip.orange{background:#FFE9DA;color:#C2410C}
      .pr-chip.blue{background:#DBEAFE;color:#1D4ED8}
      .pr-chip.green{background:#DCFCE7;color:#15803D}
      .pr-chip.grey{background:#F1F5F9;color:#475569}
      .pr-chip.red{background:#FEE2E2;color:#B91C1C}
      .pr-actions{display:flex;flex-direction:column;gap:4px;padding:10px;justify-content:center;border-left:1px solid var(--c-line-2)}
      .pr-btn{width:36px;height:36px;border-radius:8px;background:var(--c-bg-alt);color:var(--c-ink-2);cursor:pointer;border:none;font-size:14px;transition:background .15s}
      .pr-btn:hover{background:var(--c-line)}
      .pr-btn.danger{color:var(--c-danger)}
      .pr-btn.danger:hover{background:#FEE2E2}

      .hours-grid{display:flex;flex-direction:column;gap:8px}
      .hour-row{display:grid;grid-template-columns:120px 130px 1fr;gap:14px;align-items:center;padding:14px 16px;background:#fff;border:1px solid var(--c-line-2);border-radius:12px}
      .hour-row.closed{background:#FAFBFC;border-color:var(--c-line)}
      .hr-day strong{display:block;font-size:13.5px;font-weight:700;color:var(--c-ink)}
      .hr-day small{font-size:11px;color:var(--c-muted);font-weight:500}
      .hr-toggle{display:flex;align-items:center;gap:8px;cursor:pointer}
      .hr-toggle input{display:none}
      .hr-switch{width:36px;height:20px;background:var(--c-line);border-radius:99px;position:relative;transition:background .2s}
      .hr-switch::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.2)}
      .hr-toggle input:checked + .hr-switch{background:var(--c-ok)}
      .hr-toggle input:checked + .hr-switch::after{transform:translateX(16px)}
      .hr-label{font-size:12.5px;font-weight:700;color:var(--c-muted)}
      .hr-toggle input:checked ~ .hr-label{color:var(--c-ok)}
      .hr-times{display:flex;align-items:center;gap:8px;justify-content:flex-end}
      .hr-times input[type=time]{padding:7px 10px;border:1px solid var(--c-line);border-radius:8px;font-family:inherit;font-size:13px;color:var(--c-ink);width:110px}
      .hr-times input[type=time]:focus{border-color:var(--c-primary);outline:none}
      .hr-times span{color:var(--c-muted-2);font-weight:600}

      .holiday-list{display:flex;flex-direction:column;gap:8px}
      .holiday-row{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:center;padding:12px;background:#fff;border:1px solid var(--c-line-2);border-radius:12px}
      .hl-cal{width:60px;text-align:center;background:linear-gradient(135deg,var(--c-danger),#991B1B);color:#fff;border-radius:10px;padding:6px 4px}
      .hl-month{font-size:10px;font-weight:800;letter-spacing:.06em;background:rgba(255,255,255,.20);border-radius:3px;padding:1px 4px;margin-bottom:2px}
      .hl-day{font-size:22px;font-weight:800;line-height:1}
      .hl-info strong{display:block;font-size:13.5px;color:var(--c-ink);font-weight:700;margin-bottom:2px}
      .hl-info small{font-size:11.5px;color:var(--c-muted)}

      .pa-modal{position:fixed;inset:0;background:rgba(11,23,38,.55);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .22s ease}
      .pa-modal.on{opacity:1;pointer-events:auto}
      .pa-modal-inner{background:#fff;border-radius:18px;max-width:560px;width:100%;max-height:90vh;display:flex;flex-direction:column;transform:scale(.94);transition:transform .25s;box-shadow:0 24px 64px rgba(11,23,38,.30)}
      .pa-modal.on .pa-modal-inner{transform:scale(1)}
      .pa-modal-head{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--c-line-2)}
      .pa-modal-head h3{margin:0;font-size:17px;font-weight:800}
      .pa-close{width:34px;height:34px;border-radius:50%;background:var(--c-bg-alt);font-size:18px;cursor:pointer;border:none;color:var(--c-ink-2)}
      .pa-modal-body{flex:1;overflow-y:auto;padding:18px 22px}
      .pa-modal-foot{display:flex;gap:10px;justify-content:flex-end;padding:14px 22px;border-top:1px solid var(--c-line-2)}
      .pa-form{display:flex;flex-direction:column;gap:6px}
      .pa-form label{font-size:12.5px;font-weight:700;color:var(--c-ink-2);margin-top:10px}
      .pa-form input,.pa-form select,.pa-form textarea{padding:11px 14px;border:1.5px solid var(--c-line);border-radius:10px;font-family:inherit;font-size:13.5px;outline:none;color:var(--c-ink);background:#fff;transition:border-color .15s}
      .pa-form input:focus,.pa-form select:focus,.pa-form textarea:focus{border-color:var(--c-primary);box-shadow:0 0 0 3px rgba(31,79,217,.10)}
      .pa-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    `;
    document.head.appendChild(s);
  }

  // Initial render
  renderPromos();
  renderHours();
  renderHolidays();
})();
