/* ============================================================
   PesanAja — Booking Engine

   Reads a module config (booking-modules.js) and renders one
   step at a time. State is tracked in `state.selections`.
   Step components are registered in window.PA_STEPS.

   Public entry: PA_BOOKING.init() called on DOMContentLoaded.
============================================================ */

(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const state = {
    moduleKey: null,
    config: null,
    flow: [],           // resolved (after applying showIf)
    stepIndex: 0,
    selections: {}      // { service, staff, schedule, address, ... }
  };

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  // ─── Flow resolution: filters out steps whose showIf returns false ───
  function resolveFlow() {
    state.flow = state.config.flow.filter((step) => {
      if (typeof step.showIf === "function") {
        return step.showIf(state.selections);
      }
      return true;
    });
  }

  // ─── Cover / brand header ───
  function renderShell() {
    const cfg = state.config;
    const cover = $("#cover");
    cover.className = "book-cover hue-" + (cfg.brandHue || "blue");
    cover.innerHTML = `
      <a class="back-btn" href="index.html" aria-label="Kembali ke marketplace">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      </a>
      <div class="cover-icon-wrap">
        <img src="${cfg.icon}" alt="${cfg.name}" />
      </div>
      <div class="cover-text">
        <span class="cover-tag">${cfg.name}</span>
        <h1>${cfg.brandName}</h1>
        <p>${cfg.brandSubtitle}</p>
        <div class="meta-row">
          <span>📍 ${cfg.meta.location}</span>
          <span>⭐ ${cfg.meta.rating}</span>
          <span>🕐 ${cfg.meta.hours}</span>
        </div>
      </div>
    `;
  }

  function renderProgress() {
    const bar = $("#progress");
    const total = state.flow.length;
    const idx = state.stepIndex;
    bar.innerHTML = state.flow.map((s, i) => {
      const cls = i < idx ? "done" : (i === idx ? "active" : "");
      return `<span class="pg-dot ${cls}" title="${s.title}"></span>`;
    }).join("");
    $("#stepCounter").textContent = `Langkah ${idx + 1} dari ${total}`;
  }

  function renderStep() {
    resolveFlow();
    if (state.stepIndex >= state.flow.length) state.stepIndex = state.flow.length - 1;
    if (state.stepIndex < 0) state.stepIndex = 0;

    const step = state.flow[state.stepIndex];
    const renderer = (window.PA_STEPS || {})[step.type];
    if (!renderer) {
      $("#stepBody").innerHTML = `<p class="step-err">⚠ Step type "${step.type}" belum diimplementasikan.</p>`;
      return;
    }

    renderProgress();
    $("#stepTitle").textContent = step.title;
    $("#stepSubtitle").textContent = step.subtitle || "";

    const body = $("#stepBody");
    body.innerHTML = "";
    renderer.render(body, { step, state, config: state.config, refresh: renderStep });

    updateFooter(step, renderer);
  }

  function updateFooter(step, renderer) {
    const btn = $("#nextBtn");
    const back = $("#backBtn");
    const isLast = state.stepIndex === state.flow.length - 1;
    back.disabled = state.stepIndex === 0;
    btn.textContent = isLast ? "Konfirmasi Pesanan" : "Lanjutkan →";

    const validation = renderer.validate ? renderer.validate(state) : null;
    btn.disabled = !!validation;
    btn.dataset.reason = validation || "";
    $("#footerHint").textContent = validation ? validation : "";
  }

  function next() {
    const step = state.flow[state.stepIndex];
    const renderer = window.PA_STEPS[step.type];
    const err = renderer.validate ? renderer.validate(state) : null;
    if (err) {
      $("#footerHint").textContent = err;
      return;
    }
    if (state.stepIndex >= state.flow.length - 1) {
      submitBooking();
    } else {
      state.stepIndex++;
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderStep();
    }
  }

  function back() {
    if (state.stepIndex > 0) {
      state.stepIndex--;
      window.scrollTo({ top: 0, behavior: "smooth" });
      renderStep();
    }
  }

  function submitBooking() {
    const cfg = state.config;
    const sel = state.selections;
    const total = computeTotal();

    // Build services array from selections
    const services = [];
    if (sel.service) services.push({
      name: sel.service.name || cfg.name,
      price: sel.service.price || 0,
      dur: sel.service.duration || 45
    });
    if (sel.services && sel.services.length) {
      sel.services.forEach(s => services.push({
        name: s.name, price: s.price || 0, dur: s.duration || 45
      }));
    }
    // SportAja — build a court/venue line so payment & order detail
    // show the actual booked court instead of a generic "SportAja".
    if (sel.court) {
      const dur = sel.duration || 1;
      services.push({
        name: (sel.venue ? sel.venue.name + " — " : "") + sel.court.name + " · " + dur + " jam",
        price: (sel.court.pricePerHour || 0) * dur,
        dur: dur * 60
      });
    }
    if (services.length === 0) {
      services.push({ name: cfg.name, price: total, dur: 45 });
    }

    // Save pending order — payment.html will pick this up
    const pending = {
      biz: cfg.brandName || cfg.name,
      services: services,
      date: sel.date || '-',
      time: sel.time || '-',
      // staff = the "resource" the booking is tied to: staff, or court for SportAja
      staff: sel.staff?.name || sel.court?.name || sel.staffName || '-',
      verticalKey: cfg.key
    };
    sessionStorage.setItem('pesanaja-pending', JSON.stringify(pending));
    sessionStorage.setItem('pesanaja-biz', pending.biz);

    // Redirect to payment instead of showing inline success
    window.location.href = 'payment.html';
  }

  // ─── Total price calculator (used by summary + submit) ───
  function computeTotal() {
    const sel = state.selections;
    let total = 0;

    if (sel.service && sel.service.price) total += sel.service.price;
    if (sel.services && sel.services.length) total += sel.services.reduce((s, x) => s + (x.price || 0), 0);

    if (sel.weight && sel.service && sel.service.pricePerKg) {
      total += sel.weight * sel.service.pricePerKg;
      if (sel.tier && sel.tier.multiplier) total = Math.round(total * sel.tier.multiplier);
    }

    if (sel.hours && sel.service && sel.service.hourlyRate) {
      const mult = (sel.roomSize && sel.roomSize.multiplier) || 1;
      total += sel.hours * sel.service.hourlyRate * mult;
    }

    if (sel.vehicle && sel.washPackage) {
      total += Math.round(sel.vehicle.basePrice * sel.washPackage.multiplier);
    }
    if (sel.addOns && sel.addOns.length) {
      total += sel.addOns.reduce((s, a) => s + a.price, 0);
    }

    if (sel.court && sel.duration) total += sel.court.pricePerHour * sel.duration;

    if (sel.room && sel.couple) total += 50000; // couple surcharge

    return total;
  }

  // ─── Public API ───
  window.PA_BOOKING = {
    state,
    next,
    back,
    refresh: renderStep,
    computeTotal,
    init() {
      const key = (qs("vertical") || "salon").toLowerCase();
      const mod = window.PA_MODULES[key];
      if (!mod) {
        document.body.innerHTML = `<div style="padding:40px;text-align:center;font-family:sans-serif">
          <h2>Vertikal "${key}" tidak ditemukan</h2>
          <p><a href="index.html">← Kembali ke marketplace</a></p>
        </div>`;
        return;
      }
      state.moduleKey = key;
      state.config = mod;
      state.stepIndex = 0;
      state.selections = {};
      document.title = `Booking ${mod.name} — PesanAja`;

      renderShell();
      renderStep();

      $("#nextBtn").addEventListener("click", next);
      $("#backBtn").addEventListener("click", back);
    }
  };
})();
