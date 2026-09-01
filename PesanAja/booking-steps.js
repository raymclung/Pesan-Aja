/* ============================================================
   PesanAja — Booking Step Components

   Each step has: render(container, ctx) + validate(state).
   ctx = { step, state, config, refresh }

   Registered in window.PA_STEPS keyed by step type.
============================================================ */

(function () {
  "use strict";

  const fmtIDR = window.PA_FMT;
  const HOURS  = window.PA_HOURS;

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────
  function el(html) {
    const t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }
  function pickCard({ id, emoji, title, sub, right, checked }) {
    return `
      <label class="pick-card ${checked ? "is-checked" : ""}" data-id="${id}">
        <span class="pc-icon">${emoji || ""}</span>
        <span class="pc-text"><strong>${title}</strong>${sub ? `<span>${sub}</span>` : ""}</span>
        ${right ? `<span class="pc-right">${right}</span>` : ""}
        <span class="pc-tick">✓</span>
      </label>
    `;
  }
  function attachPick(container, onPick) {
    container.querySelectorAll(".pick-card").forEach(card => {
      card.addEventListener("click", () => {
        container.querySelectorAll(".pick-card").forEach(c => c.classList.remove("is-checked"));
        card.classList.add("is-checked");
        onPick(card.dataset.id);
      });
    });
  }
  function attachMulti(container, onChange) {
    container.querySelectorAll(".pick-card").forEach(card => {
      card.addEventListener("click", () => {
        card.classList.toggle("is-checked");
        onChange(Array.from(container.querySelectorAll(".pick-card.is-checked")).map(c => c.dataset.id));
      });
    });
  }
  function dayChips(days = 7) {
    const out = [];
    const today = new Date();
    const names = ["Min","Sen","Sel","Rab","Kam","Jum","Sab"];
    for (let i = 0; i < days; i++) {
      const d = new Date(today); d.setDate(today.getDate() + i);
      out.push({
        iso: d.toISOString().slice(0,10),
        day: names[d.getDay()],
        date: d.getDate(),
        month: d.toLocaleString("id-ID", { month: "short" })
      });
    }
    return out;
  }

  // ────────────────────────────────────────────────────────────
  // 1. SERVICE — single-select service
  // ────────────────────────────────────────────────────────────
  const stepService = {
    render(c, { state, config, refresh }) {
      const svcs = config.catalog.services;
      c.innerHTML = `<div class="pick-list">` + svcs.map(s => {
        const price = s.price ? fmtIDR(s.price) :
                      s.pricePerKg ? `${fmtIDR(s.pricePerKg)}/kg` :
                      s.hourlyRate ? `${fmtIDR(s.hourlyRate)}/jam` :
                      s.pricePerPair ? `${fmtIDR(s.pricePerPair)}/pasang` : "";
        const sub = `${s.duration ? s.duration + " mnt · " : ""}${s.desc || ""}`;
        return pickCard({
          id: s.id, emoji: s.emoji, title: s.name, sub,
          right: `<span class="pc-price">${price}</span>`,
          checked: state.selections.service && state.selections.service.id === s.id
        });
      }).join("") + `</div>`;
      attachPick(c, (id) => {
        state.selections.service = svcs.find(s => s.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.service ? null : "Pilih satu layanan dulu.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 2. MULTI-SERVICE — pick many, show running total
  // ────────────────────────────────────────────────────────────
  const stepMultiService = {
    render(c, { state, config, refresh }) {
      const svcs = config.catalog.services;
      const picked = new Set((state.selections.services || []).map(x => x.id));
      const list = svcs.map(s =>
        pickCard({
          id: s.id, emoji: s.emoji, title: s.name,
          sub: `${s.duration} mnt · ${s.desc || ""}`,
          right: `<span class="pc-price">${fmtIDR(s.price)}</span>`,
          checked: picked.has(s.id)
        })
      ).join("");
      const total = (state.selections.services || []).reduce((sum, x) => sum + x.price, 0);
      const dur   = (state.selections.services || []).reduce((sum, x) => sum + x.duration, 0);
      c.innerHTML = `
        <div class="pick-list">${list}</div>
        <div class="multi-tally">
          <div><span>Total durasi</span><strong>${dur} menit</strong></div>
          <div><span>Total harga</span><strong>${fmtIDR(total)}</strong></div>
        </div>
      `;
      attachMulti(c.querySelector(".pick-list"), (ids) => {
        state.selections.services = svcs.filter(s => ids.includes(s.id));
        refresh();
      });
    },
    validate(state) {
      const arr = state.selections.services || [];
      return arr.length > 0 ? null : "Pilih minimal 1 layanan.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 3. STAFF — barber / stylist / therapist / cleaner
  // ────────────────────────────────────────────────────────────
  const stepStaff = {
    render(c, { step, state, config, refresh }) {
      const staff = config.catalog.staff;
      c.innerHTML = `<div class="staff-grid">` + staff.map(s => `
        <label class="staff-card ${state.selections.staff && state.selections.staff.id === s.id ? "is-checked" : ""}" data-id="${s.id}">
          <span class="staff-avatar">${s.name.split(" ").map(n => n[0]).join("").slice(0,2)}</span>
          <strong>${s.name}</strong>
          <span class="staff-role">${s.role}</span>
          <span class="staff-meta">⭐ ${s.rating} · ${s.exp}${s.member ? " · " + s.member + " org" : ""}</span>
          <span class="pc-tick">✓</span>
        </label>
      `).join("") + `</div>
      <button type="button" class="any-staff ${state.selections.staff && state.selections.staff.id === "any" ? "is-checked" : ""}" data-id="any">
        🎲 Tidak pilih — siapa saja yang tersedia
      </button>`;
      const onPick = (id) => {
        c.querySelectorAll(".staff-card,.any-staff").forEach(x => x.classList.remove("is-checked"));
        const card = c.querySelector(`[data-id="${id}"]`);
        card.classList.add("is-checked");
        if (id === "any") {
          state.selections.staff = { id: "any", name: `${step.resourceLabel || "Staf"} siapa saja`, role: "" };
        } else {
          state.selections.staff = staff.find(s => s.id === id);
        }
        refresh();
      };
      c.querySelectorAll(".staff-card").forEach(card => card.addEventListener("click", () => onPick(card.dataset.id)));
      c.querySelector(".any-staff").addEventListener("click", () => onPick("any"));
    },
    validate(state) {
      return state.selections.staff ? null : "Pilih staf atau 'siapa saja'.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 4. SCHEDULE — date chips + time slot grid (with fake "booked" slots)
  // ────────────────────────────────────────────────────────────
  const stepSchedule = {
    render(c, { state, refresh }) {
      const days = dayChips(7);
      const sel = state.selections;
      const pickedDate = sel.date || days[0].iso;
      const bookedKey = pickedDate.slice(-2);
      // deterministic "booked" slots based on date so it looks realistic
      const booked = new Set(HOURS.filter((_, i) => ((+bookedKey + i) % 3) === 0));
      c.innerHTML = `
        <div class="day-chips">${days.map(d => `
          <button type="button" class="day-chip ${d.iso === pickedDate ? "on" : ""}" data-iso="${d.iso}">
            <span>${d.day}</span><strong>${d.date}</strong><small>${d.month}</small>
          </button>`).join("")}
        </div>
        <h4 class="sub-h">Pilih Jam</h4>
        <div class="time-grid">${HOURS.map(h => {
          const isBooked = booked.has(h);
          const isOn = sel.time === h && !isBooked;
          return `<button type="button" class="time-slot ${isBooked ? "off" : ""} ${isOn ? "on" : ""}" data-time="${h}" ${isBooked ? "disabled" : ""}>${h}${isBooked ? "<small>terisi</small>" : ""}</button>`;
        }).join("")}</div>
      `;
      c.querySelectorAll(".day-chip").forEach(b => b.addEventListener("click", () => {
        sel.date = b.dataset.iso;
        sel.time = null;
        refresh();
      }));
      c.querySelectorAll(".time-slot:not(.off)").forEach(b => b.addEventListener("click", () => {
        sel.date = pickedDate;
        sel.time = b.dataset.time;
        refresh();
      }));
    },
    validate(state) {
      const s = state.selections;
      if (!s.date) return "Pilih tanggal.";
      if (!s.time) return "Pilih jam yang tersedia.";
      return null;
    }
  };

  // ────────────────────────────────────────────────────────────
  // 5. TIMESLOT GRID — court × hour grid for SportAja
  // ────────────────────────────────────────────────────────────
  const stepTimeslotGrid = {
    render(c, { state, config, refresh }) {
      const sel = state.selections;
      const days = dayChips(5);
      const pickedDate = sel.date || days[0].iso;
      const venueId = sel.venue && sel.venue.id;
      const courts = (config.catalog.courts[venueId] || []);
      const dur = sel.duration || 1;
      // deterministic booked slots per court
      const isBooked = (courtId, h) => {
        const seed = (courtId.length + h.length + +pickedDate.slice(-2)) % 5;
        return seed === 0 || seed === 2;
      };

      c.innerHTML = `
        <div class="day-chips">${days.map(d => `
          <button type="button" class="day-chip ${d.iso === pickedDate ? "on" : ""}" data-iso="${d.iso}">
            <span>${d.day}</span><strong>${d.date}</strong><small>${d.month}</small>
          </button>`).join("")}
        </div>

        <div class="duration-row">
          <span>Durasi:</span>
          ${[1,2,3].map(n => `<button type="button" class="dur-btn ${dur === n ? "on" : ""}" data-dur="${n}">${n} jam</button>`).join("")}
        </div>

        <div class="ts-grid-wrap">
          <table class="ts-grid">
            <thead><tr><th class="ts-corner">Lapangan</th>${HOURS.map(h => `<th>${h}</th>`).join("")}</tr></thead>
            <tbody>${courts.map(ct => `
              <tr>
                <th class="ts-row-h">${ct.name}<br><small>${fmtIDR(ct.pricePerHour)}/jam</small></th>
                ${HOURS.map(h => {
                  const booked = isBooked(ct.id, h);
                  const isOn = sel.court && sel.court.id === ct.id && sel.time === h;
                  return `<td><button type="button" class="ts-cell ${booked ? "off" : ""} ${isOn ? "on" : ""}" data-court="${ct.id}" data-time="${h}" ${booked ? "disabled" : ""}></button></td>`;
                }).join("")}
              </tr>`).join("")}
            </tbody>
          </table>
          <p class="ts-legend">
            <span class="ts-lg avail"></span> Tersedia
            <span class="ts-lg booked"></span> Terisi
            <span class="ts-lg on"></span> Pilihan Anda
          </p>
        </div>
      `;
      c.querySelectorAll(".day-chip").forEach(b => b.addEventListener("click", () => {
        sel.date = b.dataset.iso; sel.time = null; refresh();
      }));
      c.querySelectorAll(".dur-btn").forEach(b => b.addEventListener("click", () => {
        sel.duration = +b.dataset.dur; refresh();
      }));
      c.querySelectorAll(".ts-cell:not(.off)").forEach(b => b.addEventListener("click", () => {
        const courtId = b.dataset.court;
        const courtArr = (config.catalog.courts[venueId] || []);
        sel.court = courtArr.find(x => x.id === courtId);
        sel.time = b.dataset.time;
        sel.date = pickedDate;
        sel.duration = dur;
        refresh();
      }));
    },
    validate(state) {
      const s = state.selections;
      if (!s.court) return "Pilih slot lapangan (klik kotak hijau).";
      if (!s.time) return "Pilih jam.";
      return null;
    }
  };

  // ────────────────────────────────────────────────────────────
  // 6. ADDRESS — alamat untuk pickup / cleaning
  // ────────────────────────────────────────────────────────────
  const stepAddress = {
    render(c, { state, refresh }) {
      const a = state.selections.address || {};
      c.innerHTML = `
        <div class="form-grid">
          <label class="form-field">
            <span>Label Tempat</span>
            <input type="text" id="ad-label" placeholder="Rumah / Kantor / Kos" value="${a.label || ""}">
          </label>
          <label class="form-field">
            <span>Alamat Lengkap</span>
            <textarea id="ad-full" rows="3" placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan, Kecamatan">${a.full || ""}</textarea>
          </label>
          <label class="form-field">
            <span>Kota</span>
            <input type="text" id="ad-city" placeholder="Bandung" value="${a.city || ""}">
          </label>
          <label class="form-field">
            <span>Catatan untuk Tim (opsional)</span>
            <input type="text" id="ad-note" placeholder="Patokan, akses pintu, dll." value="${a.note || ""}">
          </label>
        </div>
      `;
      const sync = () => {
        state.selections.address = {
          label: c.querySelector("#ad-label").value.trim(),
          full:  c.querySelector("#ad-full").value.trim(),
          city:  c.querySelector("#ad-city").value.trim(),
          note:  c.querySelector("#ad-note").value.trim()
        };
        // re-validate footer without re-rendering inputs
        window.PA_BOOKING && window.PA_BOOKING.refresh && requestAnimationFrame(() => {
          const btn = document.getElementById("nextBtn");
          if (btn) {
            const err = stepAddress.validate(state);
            btn.disabled = !!err;
            document.getElementById("footerHint").textContent = err || "";
          }
        });
      };
      c.querySelectorAll("input,textarea").forEach(i => i.addEventListener("input", sync));
    },
    validate(state) {
      const a = state.selections.address;
      if (!a || !a.full || a.full.length < 10) return "Alamat lengkap minimal 10 karakter.";
      if (!a.city) return "Kota wajib diisi.";
      return null;
    }
  };

  // ────────────────────────────────────────────────────────────
  // 7. ROOM SIZE — pick size for CleanAja
  // ────────────────────────────────────────────────────────────
  const stepRoomSize = {
    render(c, { state, config, refresh }) {
      const sizes = config.catalog.sizes;
      c.innerHTML = `<div class="pick-list">` + sizes.map(sz =>
        pickCard({
          id: sz.id, emoji: "🏠", title: sz.name,
          sub: sz.desc + " · " + sz.est,
          right: `<span class="pc-mult">×${sz.multiplier}</span>`,
          checked: state.selections.roomSize && state.selections.roomSize.id === sz.id
        })
      ).join("") + `</div>`;
      attachPick(c, (id) => {
        state.selections.roomSize = sizes.find(s => s.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.roomSize ? null : "Pilih ukuran ruangan.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 8. HOURLY — number of hours stepper (CleanAja)
  // ────────────────────────────────────────────────────────────
  const stepHourly = {
    render(c, { state, refresh }) {
      const hours = state.selections.hours || 2;
      const svc = state.selections.service;
      const sz = state.selections.roomSize;
      const rate = svc ? svc.hourlyRate || 0 : 0;
      const mult = sz ? sz.multiplier : 1;
      const total = hours * rate * mult;
      c.innerHTML = `
        <div class="stepper-row">
          <button type="button" class="step-btn" data-act="-">−</button>
          <div class="stepper-val"><strong>${hours}</strong><span>jam</span></div>
          <button type="button" class="step-btn" data-act="+">+</button>
        </div>
        <div class="stepper-breakdown">
          <div><span>Tarif per jam</span><strong>${fmtIDR(rate)}</strong></div>
          <div><span>Multiplier ukuran</span><strong>×${mult}</strong></div>
          <div class="big"><span>Estimasi total</span><strong>${fmtIDR(total)}</strong></div>
        </div>
      `;
      c.querySelectorAll(".step-btn").forEach(b => b.addEventListener("click", () => {
        let h = state.selections.hours || 2;
        h += b.dataset.act === "+" ? 1 : -1;
        if (h < 1) h = 1;
        if (h > 10) h = 10;
        state.selections.hours = h;
        refresh();
      }));
    },
    validate(state) {
      return state.selections.hours && state.selections.hours >= 1 ? null : "Atur minimal 1 jam.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 9. WEIGHT ESTIMATE — Laundry kg estimator
  // ────────────────────────────────────────────────────────────
  const stepWeight = {
    render(c, { state, config, refresh }) {
      const chips = config.catalog.weightChips;
      const w = state.selections.weight || chips[1];
      const ppk = (state.selections.service && state.selections.service.pricePerKg) || 0;
      c.innerHTML = `
        <div class="weight-chips">${chips.map(n => `
          <button type="button" class="weight-chip ${w === n ? "on" : ""}" data-w="${n}">${n} kg</button>`).join("")}
        </div>
        <label class="form-field">
          <span>Atau atur manual (kg)</span>
          <input type="number" min="1" max="50" id="wManual" value="${w}">
        </label>
        <div class="weight-breakdown">
          <div><span>Estimasi berat</span><strong>${w} kg</strong></div>
          <div><span>Tarif per kg</span><strong>${fmtIDR(ppk)}</strong></div>
          <div class="big"><span>Sub-total cucian</span><strong>${fmtIDR(w * ppk)}</strong></div>
        </div>
      `;
      c.querySelectorAll(".weight-chip").forEach(b => b.addEventListener("click", () => {
        state.selections.weight = +b.dataset.w;
        refresh();
      }));
      c.querySelector("#wManual").addEventListener("change", (e) => {
        let v = parseInt(e.target.value, 10);
        if (!v || v < 1) v = 1;
        if (v > 50) v = 50;
        state.selections.weight = v;
        refresh();
      });
    },
    validate(state) {
      return state.selections.weight && state.selections.weight >= 1 ? null : "Atur estimasi berat (kg).";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 10. PICKUP/DROPOFF — toggle 2 options
  // ────────────────────────────────────────────────────────────
  const stepPickupDropoff = {
    render(c, { state, refresh }) {
      const opt = state.selections.method;
      c.innerHTML = `
        <div class="big-toggle">
          <button type="button" class="bt-card ${opt === "pickup" ? "on" : ""}" data-v="pickup">
            <span class="bt-icon">🛵</span>
            <strong>Pickup</strong>
            <small>Tim kami jemput cucian ke alamat Anda. Gratis ongkir.</small>
          </button>
          <button type="button" class="bt-card ${opt === "dropoff" ? "on" : ""}" data-v="dropoff">
            <span class="bt-icon">🚶</span>
            <strong>Antar Sendiri</strong>
            <small>Antar cucian langsung ke outlet kami.</small>
          </button>
        </div>
      `;
      c.querySelectorAll(".bt-card").forEach(b => b.addEventListener("click", () => {
        state.selections.method = b.dataset.v;
        refresh();
      }));
    },
    validate(state) {
      return state.selections.method ? null : "Pilih pickup atau antar sendiri.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 11. SERVICE TIER — express/regular for Laundry
  // ────────────────────────────────────────────────────────────
  const stepServiceTier = {
    render(c, { state, config, refresh }) {
      const tiers = config.catalog.tiers;
      c.innerHTML = `<div class="pick-list">` + tiers.map(t =>
        pickCard({
          id: t.id, emoji: t.id === "t-kil" ? "⚡" : t.id === "t-exp" ? "🚀" : "🕐",
          title: t.name,
          sub: t.desc,
          right: `<span class="pc-mult">×${t.multiplier}</span>`,
          checked: state.selections.tier && state.selections.tier.id === t.id
        })
      ).join("") + `</div>`;
      attachPick(c, (id) => {
        state.selections.tier = tiers.find(t => t.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.tier ? null : "Pilih kecepatan layanan.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 12. VEHICLE — Wash
  // ────────────────────────────────────────────────────────────
  const stepVehicle = {
    render(c, { state, config, refresh }) {
      const vehicles = config.catalog.vehicles;
      c.innerHTML = `<div class="vehicle-grid">` + vehicles.map(v => `
        <button type="button" class="veh-card ${state.selections.vehicle && state.selections.vehicle.id === v.id ? "on" : ""}" data-id="${v.id}">
          <span class="veh-emoji">${v.emoji}</span>
          <strong>${v.name}</strong>
          <small>${fmtIDR(v.basePrice)}</small>
        </button>
      `).join("") + `</div>`;
      c.querySelectorAll(".veh-card").forEach(b => b.addEventListener("click", () => {
        state.selections.vehicle = vehicles.find(v => v.id === b.dataset.id);
        refresh();
      }));
    },
    validate(state) {
      return state.selections.vehicle ? null : "Pilih jenis kendaraan.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 13. WASH PACKAGE — Wash tier
  // ────────────────────────────────────────────────────────────
  const stepWashPackage = {
    render(c, { state, config, refresh }) {
      const pkgs = config.catalog.packages;
      const v = state.selections.vehicle;
      const base = v ? v.basePrice : 0;
      c.innerHTML = `<div class="pick-list">` + pkgs.map(p =>
        pickCard({
          id: p.id, emoji: p.emoji, title: p.name,
          sub: `${p.duration} mnt · ${p.desc}`,
          right: `<span class="pc-price">${fmtIDR(Math.round(base * p.multiplier))}</span>`,
          checked: state.selections.washPackage && state.selections.washPackage.id === p.id
        })
      ).join("") + `</div>`;
      attachPick(c, (id) => {
        state.selections.washPackage = pkgs.find(p => p.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.washPackage ? null : "Pilih paket cuci.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 14. ADD-ONS — multi-select extras
  // ────────────────────────────────────────────────────────────
  const stepAddOns = {
    render(c, { state, config, refresh }) {
      const addOns = config.catalog.addOns;
      const picked = new Set((state.selections.addOns || []).map(x => x.id));
      c.innerHTML = `<div class="pick-list">` + addOns.map(a =>
        pickCard({
          id: a.id, emoji: a.emoji, title: a.name,
          right: `<span class="pc-price">+${fmtIDR(a.price)}</span>`,
          checked: picked.has(a.id)
        })
      ).join("") + `</div>
      <p class="step-hint">Boleh dilewati. Pilih add-on yang Anda mau.</p>`;
      attachMulti(c.querySelector(".pick-list"), (ids) => {
        state.selections.addOns = addOns.filter(a => ids.includes(a.id));
        refresh();
      });
    },
    validate() { return null; } // optional step
  };

  // ────────────────────────────────────────────────────────────
  // 15. VENUE — SportAja venue pick
  // ────────────────────────────────────────────────────────────
  const stepVenue = {
    render(c, { state, config, refresh }) {
      const venues = config.catalog.venues;
      c.innerHTML = `<div class="vehicle-grid">` + venues.map(v => `
        <button type="button" class="veh-card ${state.selections.venue && state.selections.venue.id === v.id ? "on" : ""}" data-id="${v.id}">
          <span class="veh-emoji">${v.emoji}</span>
          <strong>${v.name}</strong>
          <small>${v.sport} · ${v.description}</small>
        </button>
      `).join("") + `</div>`;
      c.querySelectorAll(".veh-card").forEach(b => b.addEventListener("click", () => {
        state.selections.venue = venues.find(v => v.id === b.dataset.id);
        state.selections.court = null;
        state.selections.time = null;
        refresh();
      }));
    },
    validate(state) {
      return state.selections.venue ? null : "Pilih venue.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 16. COURT — depends on venue
  // ────────────────────────────────────────────────────────────
  const stepCourt = {
    render(c, { state, config, refresh }) {
      const v = state.selections.venue;
      if (!v) { c.innerHTML = `<p class="step-err">Pilih venue terlebih dahulu.</p>`; return; }
      const courts = config.catalog.courts[v.id] || [];
      c.innerHTML = `<div class="pick-list">` + courts.map(ct =>
        pickCard({
          id: ct.id, emoji: "🏟️", title: ct.name,
          right: `<span class="pc-price">${fmtIDR(ct.pricePerHour)}/jam</span>`,
          checked: state.selections.court && state.selections.court.id === ct.id
        })
      ).join("") + `</div>`;
      attachPick(c, (id) => {
        state.selections.court = courts.find(ct => ct.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.court ? null : "Pilih lapangan.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 17. MULTIPLAYER — invite participants (optional)
  // ────────────────────────────────────────────────────────────
  const stepMultiplayer = {
    render(c, { state, refresh }) {
      const players = state.selections.players || [];
      c.innerHTML = `
        <p class="step-hint">Undang teman untuk patungan biaya sewa. Mereka dapat WhatsApp notifikasi.</p>
        <div id="playerList">
          ${players.map((p, i) => `
            <div class="player-row" data-i="${i}">
              <input type="text" placeholder="Nama" value="${p.name || ""}" data-k="name">
              <input type="tel" placeholder="No. WA" value="${p.phone || ""}" data-k="phone">
              <button type="button" class="player-rm" data-rm="${i}">×</button>
            </div>
          `).join("")}
        </div>
        <button type="button" class="player-add">+ Tambah Pemain</button>
        <p class="step-hint">Boleh dilewati jika main sendiri.</p>
      `;
      const sync = () => {
        const rows = c.querySelectorAll(".player-row");
        state.selections.players = Array.from(rows).map(row => ({
          name: row.querySelector('[data-k="name"]').value.trim(),
          phone: row.querySelector('[data-k="phone"]').value.trim()
        })).filter(p => p.name || p.phone);
      };
      c.querySelector(".player-add").addEventListener("click", () => {
        state.selections.players = (state.selections.players || []).concat([{ name: "", phone: "" }]);
        refresh();
      });
      c.querySelectorAll(".player-rm").forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.rm;
        state.selections.players.splice(i, 1);
        refresh();
      }));
      c.querySelectorAll(".player-row input").forEach(i => i.addEventListener("input", sync));
    },
    validate() { return null; }
  };

  // ────────────────────────────────────────────────────────────
  // 18. ROOM ALLOCATION — Spa
  // ────────────────────────────────────────────────────────────
  const stepRoomAllocation = {
    render(c, { state, config, refresh }) {
      const rooms = config.catalog.rooms;
      const isCouple = state.selections.couple === true;
      const filtered = rooms.filter(r => isCouple ? r.capacity >= 2 : true);
      c.innerHTML = `<div class="pick-list">` + filtered.map(r =>
        pickCard({
          id: r.id, emoji: r.type === "Premium" ? "💎" : "🌿",
          title: r.name, sub: `${r.type} · ${r.desc}`,
          right: `<span class="pc-mult">${r.capacity} org</span>`,
          checked: state.selections.room && state.selections.room.id === r.id
        })
      ).join("") + `</div>`;
      if (filtered.length === 0) {
        c.innerHTML += `<p class="step-err">Tidak ada room dengan kapasitas yang cocok.</p>`;
      }
      attachPick(c, (id) => {
        state.selections.room = rooms.find(r => r.id === id);
        refresh();
      });
    },
    validate(state) {
      return state.selections.room ? null : "Pilih room.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // 19. COUPLE BOOKING — toggle (Spa)
  // ────────────────────────────────────────────────────────────
  const stepCoupleBooking = {
    render(c, { state, refresh }) {
      const v = state.selections.couple;
      c.innerHTML = `
        <div class="big-toggle">
          <button type="button" class="bt-card ${v === false ? "on" : ""}" data-v="solo">
            <span class="bt-icon">🙋</span>
            <strong>Solo</strong>
            <small>Booking untuk 1 orang saja.</small>
          </button>
          <button type="button" class="bt-card ${v === true ? "on" : ""}" data-v="couple">
            <span class="bt-icon">💑</span>
            <strong>Couple</strong>
            <small>Booking berpasangan. Otomatis pilih room kapasitas 2 (+Rp 50rb).</small>
          </button>
        </div>
      `;
      c.querySelectorAll(".bt-card").forEach(b => b.addEventListener("click", () => {
        state.selections.couple = b.dataset.v === "couple";
        // reset room if it doesn't fit
        if (state.selections.couple && state.selections.room && state.selections.room.capacity < 2) {
          state.selections.room = null;
        }
        refresh();
      }));
    },
    validate(state) {
      return state.selections.couple === undefined ? "Pilih solo atau couple." : null;
    }
  };

  // ────────────────────────────────────────────────────────────
  // 20. SUMMARY — show all picks + total
  // ────────────────────────────────────────────────────────────
  const stepSummary = {
    render(c, { state, config }) {
      const s = state.selections;
      const rows = [];

      if (s.service) rows.push(["Layanan", `${s.service.emoji || ""} ${s.service.name}`]);
      if (s.services && s.services.length) {
        rows.push(["Layanan", s.services.map(x => `${x.emoji || ""} ${x.name}`).join(", ")]);
        rows.push(["Total durasi", `${s.services.reduce((sum,x)=>sum+x.duration,0)} menit`]);
      }
      if (s.staff) rows.push(["Staf", `${s.staff.name}${s.staff.role ? " · " + s.staff.role : ""}`]);
      if (s.method) rows.push(["Metode", s.method === "pickup" ? "🛵 Pickup di alamat" : "🚶 Antar ke outlet"]);
      if (s.address && s.address.full) rows.push(["Alamat", `${s.address.label || ""} — ${s.address.full}, ${s.address.city}`]);
      if (s.roomSize) rows.push(["Ukuran ruangan", s.roomSize.name]);
      if (s.hours) rows.push(["Lama bersih", `${s.hours} jam`]);
      if (s.weight) rows.push(["Berat cucian", `${s.weight} kg`]);
      if (s.tier) rows.push(["Kecepatan", `${s.tier.name} (×${s.tier.multiplier})`]);
      if (s.vehicle) rows.push(["Kendaraan", `${s.vehicle.emoji} ${s.vehicle.name}`]);
      if (s.washPackage) rows.push(["Paket", `${s.washPackage.emoji} ${s.washPackage.name}`]);
      if (s.addOns && s.addOns.length) rows.push(["Add-on", s.addOns.map(a => a.name).join(", ")]);
      if (s.venue) rows.push(["Venue", `${s.venue.emoji} ${s.venue.name}`]);
      if (s.court) rows.push(["Lapangan", s.court.name]);
      if (s.duration) rows.push(["Durasi sewa", `${s.duration} jam`]);
      if (s.players && s.players.length) rows.push(["Pemain", `${s.players.length + 1} orang`]);
      if (s.room) rows.push(["Room", `${s.room.name} (${s.room.type})`]);
      if (s.couple !== undefined) rows.push(["Mode", s.couple ? "Couple" : "Solo"]);
      if (s.date && s.time) rows.push(["Jadwal", `${s.date} pukul ${s.time}`]);

      const total = window.PA_BOOKING.computeTotal();

      // Show tracking promise for Laundry
      const tracking = config.key === "laundry"
        ? `<div class="track-card">
             <strong>🛰 Tracking otomatis</strong>
             <p>Anda akan mendapat update di setiap tahap: <em>diambil → dicuci → disetrika → siap diantar</em> via WhatsApp.</p>
           </div>` : "";

      c.innerHTML = `
        <div class="summary-card">
          <div class="summary-brand">
            <img src="${config.icon}" alt="${config.name}">
            <div><strong>${config.brandName}</strong><span>${config.name}</span></div>
          </div>
          <dl class="summary-list">
            ${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}
          </dl>
          <div class="summary-total">
            <span>Total Bayar</span>
            <strong>${fmtIDR(total)}</strong>
          </div>
        </div>
        ${tracking}
      `;
    },
    validate() { return null; }
  };

  // ────────────────────────────────────────────────────────────
  // 21. PAYMENT
  // ────────────────────────────────────────────────────────────
  const PAY = [
    { id: "qris",    name: "QRIS",                  emoji: "📱", desc: "Scan QR dari semua e-wallet" },
    { id: "gopay",   name: "GoPay",                 emoji: "🟢", desc: "Bayar via aplikasi GoPay" },
    { id: "ovo",     name: "OVO",                   emoji: "🟣", desc: "Saldo OVO" },
    { id: "dana",    name: "DANA",                  emoji: "🔵", desc: "Saldo DANA" },
    { id: "bca",     name: "Transfer BCA Virtual",  emoji: "🏦", desc: "VA terbentuk otomatis" },
    { id: "cod",     name: "Bayar di Tempat",       emoji: "💵", desc: "Tunai saat layanan datang" }
  ];
  const stepPayment = {
    render(c, { state, refresh }) {
      const m = state.selections.paymentMethod;
      c.innerHTML = `
        <div class="pick-list">` + PAY.map(p =>
          pickCard({
            id: p.id, emoji: p.emoji, title: p.name, sub: p.desc,
            checked: m === p.id
          })
        ).join("") + `</div>
        <p class="step-hint">Total yang akan dibayar: <strong>${fmtIDR(window.PA_BOOKING.computeTotal())}</strong></p>
      `;
      attachPick(c, (id) => {
        state.selections.paymentMethod = id;
        refresh();
      });
    },
    validate(state) {
      return state.selections.paymentMethod ? null : "Pilih metode pembayaran.";
    }
  };

  // ────────────────────────────────────────────────────────────
  // Registry
  // ────────────────────────────────────────────────────────────
  window.PA_STEPS = {
    service:         stepService,
    multi_service:   stepMultiService,
    staff:           stepStaff,
    schedule:        stepSchedule,
    timeslot_grid:   stepTimeslotGrid,
    address:         stepAddress,
    room_size:       stepRoomSize,
    hourly:          stepHourly,
    weight_estimate: stepWeight,
    pickup_dropoff:  stepPickupDropoff,
    service_tier:    stepServiceTier,
    vehicle:         stepVehicle,
    wash_package:    stepWashPackage,
    add_ons:         stepAddOns,
    venue:           stepVenue,
    court:           stepCourt,
    multiplayer:     stepMultiplayer,
    room_allocation: stepRoomAllocation,
    couple_booking:  stepCoupleBooking,
    summary:         stepSummary,
    payment:         stepPayment
  };
})();
