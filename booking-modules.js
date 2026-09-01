/* ============================================================
   PesanAja — Module Configs (7 vertical booking flows)

   Schema-driven: each module defines its catalog + flow steps.
   The booking engine reads this config and renders the right
   step components dynamically. No vertical-specific HTML pages.
============================================================ */

const fmtIDR = (n) => "Rp " + (n || 0).toLocaleString("id-ID");

// ─── Shared time slots (used by schedule + queue_slot steps) ───
const HOURS = [
  "09:00","10:00","11:00","12:00","13:00","14:00",
  "15:00","16:00","17:00","18:00","19:00","20:00"
];

// =============================================================
// 1. BARBERAJA  —  service → barber → schedule → payment
// =============================================================
const BARBER = {
  key: "barber",
  name: "BarberAja",
  brandName: "Barbershop Klasik",
  brandSubtitle: "Booking barber profesional, langsung dapat jam.",
  brandHue: "orange",
  icon: "assets/business/barberaja.jpeg",
  meta: { location: "Jl. Riau No. 45, Bandung", rating: 4.8, hours: "09:00 – 21:00" },
  catalog: {
    services: [
      { id: "b-cut",     name: "Potong Rambut",          duration: 30, price: 55000,  emoji: "✂️", desc: "Cut, wash, styling" },
      { id: "b-shave",   name: "Shaving Premium",        duration: 25, price: 45000,  emoji: "🪒", desc: "Cukur + facial mini" },
      { id: "b-pomade",  name: "Cut + Pomade Styling",   duration: 45, price: 90000,  emoji: "💇‍♂️", desc: "Hair cut + pomade premium" },
      { id: "b-color",   name: "Hair Color",             duration: 90, price: 250000, emoji: "🎨", desc: "Pewarnaan rambut" },
      { id: "b-massage", name: "Hair Massage & Tonic",   duration: 30, price: 60000,  emoji: "💆‍♂️", desc: "Pijat kepala + tonic" }
    ],
    staff: [
      { id: "s-eko",   name: "Eko",   role: "Senior Barber",    rating: 4.9, exp: "6 thn" },
      { id: "s-rian",  name: "Rian",  role: "Master Barber",    rating: 4.9, exp: "8 thn" },
      { id: "s-dani",  name: "Dani",  role: "Junior Barber",    rating: 4.7, exp: "2 thn" },
      { id: "s-fajar", name: "Fajar", role: "Senior Barber",    rating: 4.8, exp: "5 thn" }
    ]
  },
  flow: [
    { id: "service",  type: "service",  title: "Pilih Layanan" },
    { id: "barber",   type: "staff",    title: "Pilih Barber",    resourceLabel: "Barber" },
    { id: "schedule", type: "schedule", title: "Pilih Tanggal & Jam" },
    { id: "summary",  type: "summary",  title: "Ringkasan Pesanan" },
    { id: "payment",  type: "payment",  title: "Pembayaran" }
  ]
};

// =============================================================
// 2. SALONAJA  —  service → stylist → multi-service → duration → payment
// =============================================================
const SALON = {
  key: "salon",
  name: "SalonAja",
  brandName: "Salon Melati",
  brandSubtitle: "Salon kecantikan dengan layanan lengkap. Berdiri sejak 2018.",
  brandHue: "pink",
  icon: "assets/business/salonaja.jpeg",
  meta: { location: "Jl. Sukajadi No. 22, Bandung", rating: 4.9, hours: "09:00 – 20:00" },
  catalog: {
    services: [
      { id: "sl-cut",     name: "Potong Rambut",           duration: 45,  price: 75000,  emoji: "💇", desc: "Cuci + potong + blow" },
      { id: "sl-cream",   name: "Creambath",               duration: 60,  price: 120000, emoji: "💆", desc: "Pijat & nutrisi rambut" },
      { id: "sl-smooth",  name: "Smoothing",               duration: 120, price: 450000, emoji: "✨", desc: "Rambut lurus alami" },
      { id: "sl-mani",    name: "Manicure",                duration: 45,  price: 90000,  emoji: "💅", desc: "Perawatan kuku tangan" },
      { id: "sl-pedi",    name: "Pedicure",                duration: 45,  price: 95000,  emoji: "🦶", desc: "Perawatan kuku kaki" },
      { id: "sl-facial",  name: "Facial Premium",          duration: 75,  price: 200000, emoji: "🧖", desc: "Pembersihan wajah lengkap" },
      { id: "sl-makeup",  name: "Makeup Acara",            duration: 90,  price: 350000, emoji: "💄", desc: "Makeup pesta / wedding" },
      { id: "sl-color",   name: "Hair Coloring",           duration: 120, price: 380000, emoji: "🎨", desc: "Pewarnaan rambut" }
    ],
    staff: [
      { id: "ss-linda", name: "Linda", role: "Senior Stylist", rating: 4.9, exp: "10 thn" },
      { id: "ss-sari",  name: "Sari",  role: "Nail Artist",    rating: 4.8, exp: "5 thn" },
      { id: "ss-rika",  name: "Rika",  role: "Makeup Artist",  rating: 4.9, exp: "7 thn" },
      { id: "ss-novi",  name: "Novi",  role: "Junior Stylist", rating: 4.7, exp: "3 thn" }
    ]
  },
  flow: [
    { id: "stylist",       type: "staff",         title: "Pilih Stylist",      resourceLabel: "Stylist" },
    { id: "services",      type: "multi_service", title: "Pilih Layanan (bisa lebih dari 1)" },
    { id: "schedule",      type: "schedule",      title: "Pilih Tanggal & Jam" },
    { id: "summary",       type: "summary",       title: "Ringkasan & Total Durasi" },
    { id: "payment",       type: "payment",       title: "Pembayaran" }
  ]
};

// =============================================================
// 3. SPAAJA  —  treatment → therapist → room → couple → payment
// =============================================================
const SPA = {
  key: "spa",
  name: "SpaAja",
  brandName: "Asana Bali Spa",
  brandSubtitle: "Spa dengan nuansa Bali. Pijat tradisional & modern.",
  brandHue: "rose",
  icon: "assets/business/cleanaja.jpeg", // (using placeholder icon; design has SpaAja in marketplace)
  meta: { location: "Jl. Dago No. 88, Bandung", rating: 4.7, hours: "10:00 – 22:00" },
  catalog: {
    services: [
      { id: "sp-bali",   name: "Balinese Massage 60'", duration: 60, price: 180000, emoji: "💆", desc: "Pijat tradisional Bali" },
      { id: "sp-aroma",  name: "Aromatherapy 90'",     duration: 90, price: 250000, emoji: "🪔", desc: "Pijat dengan minyak aromaterapi" },
      { id: "sp-hot",    name: "Hot Stone 75'",        duration: 75, price: 280000, emoji: "🌋", desc: "Pijat batu hangat" },
      { id: "sp-foot",   name: "Foot Reflexology 45'", duration: 45, price: 120000, emoji: "🦶", desc: "Refleksi kaki" },
      { id: "sp-couple", name: "Couple Massage 90'",   duration: 90, price: 450000, emoji: "💑", desc: "Pijat berpasangan" }
    ],
    staff: [
      { id: "sp-wayan",  name: "Wayan",  role: "Senior Therapist",  rating: 4.9, exp: "12 thn" },
      { id: "sp-made",   name: "Made",   role: "Senior Therapist",  rating: 4.9, exp: "9 thn" },
      { id: "sp-komang", name: "Komang", role: "Master Therapist",  rating: 5.0, exp: "15 thn" },
      { id: "sp-nyoman", name: "Nyoman", role: "Junior Therapist",  rating: 4.7, exp: "3 thn" }
    ],
    rooms: [
      { id: "r-1", name: "Tirta Room",     type: "Standard",  capacity: 1, desc: "Aroma terapi & musik tradisional" },
      { id: "r-2", name: "Bunga Room",     type: "Standard",  capacity: 1, desc: "View taman dalam" },
      { id: "r-3", name: "Padma Suite",    type: "Premium",   capacity: 2, desc: "Untuk couple, dengan bathtub" },
      { id: "r-4", name: "Lotus Suite",    type: "Premium",   capacity: 2, desc: "Dengan jacuzzi & steam" }
    ]
  },
  flow: [
    { id: "treatment",  type: "service",         title: "Pilih Treatment" },
    { id: "therapist",  type: "staff",           title: "Pilih Therapist",      resourceLabel: "Therapist" },
    { id: "couple",     type: "couple_booking",  title: "Booking Pasangan?" },
    { id: "room",       type: "room_allocation", title: "Pilih Room" },
    { id: "schedule",   type: "schedule",        title: "Pilih Tanggal & Jam" },
    { id: "summary",    type: "summary",         title: "Ringkasan Pesanan" },
    { id: "payment",    type: "payment",         title: "Pembayaran" }
  ]
};

// =============================================================
// 4. CLEANAJA  —  service → address → room size → cleaner → hours → payment
// =============================================================
const CLEAN = {
  key: "clean",
  name: "CleanAja",
  brandName: "CleanAja Sparkle",
  brandSubtitle: "Cleaning service profesional. Rumah, kantor, kos.",
  brandHue: "blue",
  icon: "assets/business/cleanaja.jpeg",
  meta: { location: "Layanan area Bandung Raya", rating: 4.8, hours: "08:00 – 19:00" },
  catalog: {
    services: [
      { id: "cl-general", name: "General Cleaning",  duration: 120, hourlyRate: 50000,  emoji: "🧹", desc: "Bersih-bersih umum (sapu, pel, lap)" },
      { id: "cl-deep",    name: "Deep Cleaning",     duration: 240, hourlyRate: 80000,  emoji: "🧼", desc: "Bersih menyeluruh + sudut sulit" },
      { id: "cl-move",    name: "Move-in / Move-out",duration: 360, hourlyRate: 90000,  emoji: "📦", desc: "Sebelum/sesudah pindahan" },
      { id: "cl-kitchen", name: "Kitchen Deep Clean",duration: 120, hourlyRate: 75000,  emoji: "🍳", desc: "Khusus dapur (degrease)" },
      { id: "cl-bath",    name: "Bathroom Sanitize", duration: 90,  hourlyRate: 70000,  emoji: "🚿", desc: "Disinfeksi kamar mandi" }
    ],
    staff: [
      { id: "c-budi",  name: "Tim Budi",  role: "Cleaner Pro",    rating: 4.8, exp: "4 thn", member: 2 },
      { id: "c-tono",  name: "Tim Tono",  role: "Cleaner Pro",    rating: 4.9, exp: "6 thn", member: 2 },
      { id: "c-sari",  name: "Tim Sari",  role: "Cleaner Senior", rating: 5.0, exp: "8 thn", member: 3 }
    ],
    sizes: [
      { id: "sz-s", name: "Kecil (< 50 m²)",    multiplier: 1,   est: "1-2 jam",  desc: "Studio / 1 kamar" },
      { id: "sz-m", name: "Sedang (50-100 m²)", multiplier: 1.5, est: "2-3 jam",  desc: "Apartemen 2 kamar" },
      { id: "sz-l", name: "Besar (100-200 m²)", multiplier: 2.2, est: "3-5 jam",  desc: "Rumah 3 kamar" },
      { id: "sz-xl",name: "Sangat Besar (>200 m²)", multiplier: 3,   est: "5+ jam",   desc: "Rumah besar / kantor" }
    ]
  },
  flow: [
    { id: "service",  type: "service",   title: "Jenis Cleaning" },
    { id: "address",  type: "address",   title: "Alamat Lokasi" },
    { id: "size",     type: "room_size", title: "Ukuran Ruangan" },
    { id: "cleaner",  type: "staff",     title: "Pilih Tim Cleaner", resourceLabel: "Tim Cleaner" },
    { id: "hours",    type: "hourly",    title: "Estimasi Lama Bersih" },
    { id: "schedule", type: "schedule",  title: "Jadwal Kedatangan" },
    { id: "summary",  type: "summary",   title: "Ringkasan Pesanan" },
    { id: "payment",  type: "payment",   title: "Pembayaran" }
  ]
};

// =============================================================
// 5. LAUNDRYAJA  —  pickup/dropoff → address → weight → tier → tracking → payment
// =============================================================
const LAUNDRY = {
  key: "laundry",
  name: "LaundryAja",
  brandName: "LaundryAja Sebening",
  brandSubtitle: "Laundry kiloan dengan pickup & delivery gratis.",
  brandHue: "indigo",
  icon: "assets/business/laundryaja.jpeg",
  meta: { location: "Jl. Cihampelas No. 12, Bandung", rating: 4.9, hours: "07:00 – 22:00" },
  catalog: {
    services: [
      { id: "l-reg",  name: "Cuci + Setrika", duration: 0, pricePerKg: 12000, emoji: "🧺", desc: "Tarif kiloan standar" },
      { id: "l-only", name: "Cuci Saja",      duration: 0, pricePerKg: 8000,  emoji: "💧", desc: "Tanpa setrika" },
      { id: "l-iron", name: "Setrika Saja",   duration: 0, pricePerKg: 7000,  emoji: "🧽", desc: "Bersih, tinggal setrika" },
      { id: "l-shoe", name: "Cuci Sepatu",    duration: 0, pricePerPair: 35000,emoji: "👟", desc: "Per pasang" }
    ],
    tiers: [
      { id: "t-reg", name: "Regular",  durationHours: 48, multiplier: 1,   desc: "Selesai dalam 2 hari" },
      { id: "t-exp", name: "Express",  durationHours: 24, multiplier: 1.5, desc: "Selesai dalam 1 hari" },
      { id: "t-kil", name: "Same Day", durationHours: 8,  multiplier: 2,   desc: "Selesai hari ini (max 8 jam)" }
    ],
    weightChips: [3, 5, 7, 10, 15]
  },
  flow: [
    { id: "service",   type: "service",         title: "Jenis Layanan Laundry" },
    { id: "method",    type: "pickup_dropoff",  title: "Pickup atau Antar Sendiri?" },
    { id: "address",   type: "address",         title: "Alamat Pickup",  showIf: (s) => s.method === "pickup" },
    { id: "weight",    type: "weight_estimate", title: "Estimasi Berat" },
    { id: "tier",      type: "service_tier",    title: "Pilih Kecepatan" },
    { id: "schedule",  type: "schedule",        title: "Jadwal Pickup / Antar" },
    { id: "summary",   type: "summary",         title: "Ringkasan + Tracking" },
    { id: "payment",   type: "payment",         title: "Pembayaran" }
  ]
};

// =============================================================
// 6. WASHAJA  —  vehicle → package → queue slot → add-ons → payment
// =============================================================
const WASH = {
  key: "wash",
  name: "WashAja",
  brandName: "WashAja Auto Care",
  brandSubtitle: "Cuci kendaraan profesional. Antri online, hemat waktu.",
  brandHue: "purple",
  icon: "assets/business/cleanaja.jpeg", // share icon
  meta: { location: "Jl. Asia Afrika No. 100, Bandung", rating: 4.7, hours: "07:00 – 21:00" },
  catalog: {
    vehicles: [
      { id: "v-motor",  name: "Motor",       emoji: "🏍️", basePrice: 15000  },
      { id: "v-sedan",  name: "Mobil Sedan", emoji: "🚗", basePrice: 50000  },
      { id: "v-suv",    name: "Mobil SUV",   emoji: "🚙", basePrice: 65000  },
      { id: "v-mpv",    name: "Mobil MPV",   emoji: "🚐", basePrice: 70000  },
      { id: "v-truck",  name: "Truk / Pickup", emoji: "🚚", basePrice: 90000 }
    ],
    packages: [
      { id: "p-basic",   name: "Basic Wash",    duration: 30, multiplier: 1,    desc: "Cuci luar + lap kering",   emoji: "💦" },
      { id: "p-full",    name: "Full Wash",     duration: 45, multiplier: 1.5,  desc: "Luar + dalam + vacuum",    emoji: "🧴" },
      { id: "p-premium", name: "Premium Detail",duration: 90, multiplier: 2.5,  desc: "Full + wax & polish",       emoji: "💎" }
    ],
    addOns: [
      { id: "a-engine",  name: "Cuci Mesin",     price: 35000, emoji: "🔧" },
      { id: "a-interior",name: "Detail Interior",price: 50000, emoji: "🪑" },
      { id: "a-wax",     name: "Wax Premium",    price: 75000, emoji: "✨" },
      { id: "a-tire",    name: "Tire Shine",     price: 20000, emoji: "🛞" },
      { id: "a-fragrance",name: "Pengharum",     price: 15000, emoji: "🌸" }
    ]
  },
  flow: [
    { id: "vehicle",  type: "vehicle",      title: "Jenis Kendaraan" },
    { id: "package",  type: "wash_package", title: "Paket Cuci" },
    { id: "addons",   type: "add_ons",      title: "Add-on (opsional)" },
    { id: "schedule", type: "schedule",     title: "Pilih Slot Antrian",   subtitle: "Slot antrian real-time" },
    { id: "summary",  type: "summary",      title: "Ringkasan Pesanan" },
    { id: "payment",  type: "payment",      title: "Pembayaran" }
  ]
};

// =============================================================
// 7. SPORTAJA  —  venue → court → timeslot grid → multiplayer → payment
// =============================================================
const SPORT = {
  key: "sport",
  name: "SportAja",
  brandName: "SportAja Arena",
  brandSubtitle: "Sewa lapangan futsal, badminton, padel — real-time slot.",
  brandHue: "teal",
  icon: "assets/business/sportaja.jpeg",
  meta: { location: "Jl. Soekarno-Hatta No. 50, Bandung", rating: 4.8, hours: "06:00 – 23:00" },
  catalog: {
    venues: [
      { id: "ven-fut", name: "Futsal Arena",     emoji: "⚽", description: "3 lapangan vinyl, indoor",        sport: "Futsal" },
      { id: "ven-bad", name: "Badminton Hall",   emoji: "🏸", description: "4 lapangan karpet PVC, indoor",  sport: "Badminton" },
      { id: "ven-pad", name: "Padel Court",      emoji: "🎾", description: "2 lapangan padel outdoor",        sport: "Padel" },
      { id: "ven-bas", name: "Basket Court",     emoji: "🏀", description: "1 lapangan basket indoor",        sport: "Basket" }
    ],
    courts: {
      "ven-fut": [
        { id: "c-f1", name: "Lapangan 1", pricePerHour: 180000 },
        { id: "c-f2", name: "Lapangan 2", pricePerHour: 180000 },
        { id: "c-f3", name: "Lapangan 3 (VIP)", pricePerHour: 220000 }
      ],
      "ven-bad": [
        { id: "c-b1", name: "Court A", pricePerHour: 80000 },
        { id: "c-b2", name: "Court B", pricePerHour: 80000 },
        { id: "c-b3", name: "Court C", pricePerHour: 80000 },
        { id: "c-b4", name: "Court D (Pro)", pricePerHour: 100000 }
      ],
      "ven-pad": [
        { id: "c-p1", name: "Padel Court 1", pricePerHour: 250000 },
        { id: "c-p2", name: "Padel Court 2", pricePerHour: 250000 }
      ],
      "ven-bas": [
        { id: "c-bk1", name: "Basket Court", pricePerHour: 200000 }
      ]
    }
  },
  flow: [
    { id: "venue",      type: "venue",          title: "Pilih Venue" },
    { id: "court",      type: "court",          title: "Pilih Lapangan" },
    { id: "slot",       type: "timeslot_grid",  title: "Slot Real-Time" },
    { id: "players",    type: "multiplayer",    title: "Undang Pemain (opsional)" },
    { id: "summary",    type: "summary",        title: "Ringkasan Booking" },
    { id: "payment",    type: "payment",        title: "Pembayaran" }
  ]
};

// =============================================================
// MODULE REGISTRY
// =============================================================
const MODULES = {
  barber:  BARBER,
  salon:   SALON,
  spa:     SPA,
  clean:   CLEAN,
  laundry: LAUNDRY,
  wash:    WASH,
  sport:   SPORT
};

window.PA_MODULES = MODULES;
window.PA_HOURS   = HOURS;
window.PA_FMT     = fmtIDR;
