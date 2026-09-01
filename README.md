# PesanAja

Prototipe aplikasi pemesanan layanan — salon, spa, laundry, barbershop, cuci kendaraan,
sport.

[Lihat demo](https://raymclung.github.io/Pesan-Aja/)

Dibuat sebagai tugas kuliah. Ini prototipe antarmuka: belum ada server maupun basis data,
seluruh data disimpan sementara di browser lewat `localStorage`, dan pemesanan tidak
benar-benar terkirim ke mitra mana pun.

## Isinya

Dua puluh halaman yang saling terhubung, mencakup alur lengkap dari mencari layanan
sampai memberi ulasan:

beranda, daftar bisnis, detail bisnis, pemesanan bertahap, pembayaran, riwayat pesanan,
detail pesanan, ulasan, dompet, promo, voucher, kotak pesan, profil, edit profil, masuk,
tentang, dan halaman 404. Ditambah dua halaman untuk sisi mitra: ajakan bergabung dan
dasbor pengelolaan.

Seluruhnya HTML, CSS, dan JavaScript murni. Tanpa framework, tanpa langkah build. Total
16.706 baris.

## Beberapa keputusan

**Mobile-first, dengan tata letak desktop tersendiri.** Di bawah 520px aplikasinya
memakai lebar 480px seperti tampilan ponsel. Mulai 1024px ke atas ada breakpoint
terpisah yang melebarkannya sampai 1280px, jadi di layar besar tampilannya tidak
sekadar kolom sempit yang dipusatkan.

**Token desain lewat CSS custom properties.** Warna, bayangan, dan tipografi
didefinisikan sekali di `:root`, lalu dipakai ulang di semua halaman:

```css
:root{
  --c-primary:#1F4FD9;  --c-accent:#FF7A2D;  --c-teal:#15B79E;
  --c-ink:#0B1726;      --c-muted:#5B6B7E;   --c-line:#E6EAF0;
  --shadow-md:0 12px 32px rgba(11,23,38,.08);
}
```

**PWA dengan service worker.** Strateginya berbeda per jenis berkas — HTML pakai
network-first supaya selalu dapat versi terbaru, aset lain pakai cache-first supaya
cepat. Aplikasinya bisa dipasang ke layar utama dan dibuka offline.

**Alur pemesanan dipecah tiga berkas.** `booking-engine.js` untuk perhitungan intinya,
`booking-steps.js` untuk perpindahan antar langkah, `booking-modules.js` untuk data
layanan dan bisnis.

## Menjalankan

```bash
git clone https://github.com/raymclung/Pesan-Aja.git
cd Pesan-Aja
python -m http.server 8000
```

Lalu buka `http://localhost:8000`.

Membuka `index.html` dengan dobel-klik juga bisa, tapi service worker-nya tidak akan
aktif karena protokol `file://` tidak mengizinkannya.

## Soal CSS-nya

Setiap halaman punya blok `<style>` sendiri, dan lama saya menganggap itu utang besar —
pasti banyak aturan yang ditulis ulang di mana-mana.

Ternyata setelah diukur, dugaan itu keliru. Dari 954 selector, hanya 27 yang muncul di
tiga halaman atau lebih, dan 19 di antaranya justru punya isi berbeda — memang sengaja
khusus per halaman. Yang benar-benar duplikat persis cuma 2% dari 119 KB.

Jadi yang saya satukan hanya bagian yang memang layak: **37 token desain** — warna,
bayangan, tipografi — yang tadinya dideklarasikan ulang di 13 halaman plus dua berkas
CSS. Semuanya kini ada di `tokens.css`, dimuat paling awal di setiap halaman. Nilainya
sudah identik sejak awal, jadi penyatuan ini tidak mengubah tampilan sama sekali;
saya bandingkan tangkapan layar 20 halaman sebelum dan sesudah untuk memastikannya.

Sisa CSS per halaman saya biarkan. Memindahkannya ke berkas bersama justru akan
memperbesar unduhan tiap halaman tanpa menghilangkan pengulangan apa pun — karena
pengulangannya memang tidak ada.

## Yang belum dikerjakan

- Belum ada backend, jadi data hilang kalau browser dibersihkan
- Halaman masuk masih simulasi, belum ada autentikasi sungguhan
- Daftar bisnisnya masih ditulis langsung di dalam kode
- Pembayaran belum terhubung ke payment gateway mana pun

## Lisensi

[MIT](LICENSE)
