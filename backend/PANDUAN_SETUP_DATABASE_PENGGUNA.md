# 📊 Panduan Setup Database Pengguna & Telemetri Login (Khusus Developer / Pemilik Aplikasi)

Panduan ini digunakan oleh Anda sebagai **Pemilik Produk / Pengembang** untuk mengumpulkan data semua orang yang login dan mengakses aplikasi Dompetku secara otomatis dan *real-time* di Google Sheets pribadi Anda.

---

## 🎯 Data yang Otomatis Tercatat di Spreadsheet Anda:
1. **No** (Urutan pendaftaran)
2. **Waktu Terdaftar** (Tanggal & jam pertama kali login)
3. **Nama Lengkap** (Sesuai profil akun Google pengguna)
4. **Alamat Email** (Email Google pengguna)
5. **Foto Profil** (URL foto avatar Google pengguna)
6. **Nama Buku Kas / Keluarga** (Misal: *Keluarga Pratama*)
7. **Perangkat & Browser** (Contoh: *📱 Android Phone*, *💻 Apple Mac*, *💻 PC Windows*)
8. **Total Kali Login** (Menghitung berapa kali pengguna aktif membuka aplikasi)
9. **Versi Aplikasi** (Contoh: `v3.16.1`)
10. **Status Lisensi** (*Aktif (Baru)*, *VIP / Pembeli*, *Trial*, *Expired*)
11. **Login Terakhir** (Tanggal & jam aktivitas terakhir pengguna)
12. **Catatan Pengembang (Admin)** (Kolom bebas untuk Anda memberi catatan, misal: *Sudah transfer via BCA*)

---

## ⚙️ Langkah 1: Buat Spreadsheet Baru di Akun Google Anda

1. Buka browser dan kunjungi: **[sheets.new](https://sheets.new)**
2. Beri judul spreadsheet Anda, contoh: `Dompetku - Database Pelanggan & Pengguna`

---

## 💻 Langkah 2: Pasang Skrip Backend Developer

1. Di Google Sheets tersebut, klik menu atas: **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus semua teks default di editor kode.
3. Buka file **`backend/DeveloperTelemetry.gs`** di folder proyek Anda, salin seluruh kodenya, lalu tempelkan (*paste*) ke editor Apps Script.
4. Klik ikon **Save / Simpan** (💾) atau tekan `Ctrl + S` / `Cmd + S`.

---

## 🚀 Langkah 3: Deploy sebagai Web App

1. Klik tombol biru **Deploy** (di pojok kanan atas) > pilih **New deployment (Penerapan baru)**.
2. Di sebelah kiri tulisan *Select type*, klik ikon gerigi ⚙️ lalu pilih **Web app**.
3. Isi konfigurasi sebagai berikut (SANGAT PENTING):
   - **Description:** `Backend Telemetri Pengguna v2.0`
   - **Execute as:** **`Me (emailanda@gmail.com)`** *(Wajib pilih Me)*
   - **Who has access:** **`Anyone`** *(Wajib pilih Anyone)*
4. Klik **Deploy**.
5. Jika Google meminta izin otorisasi:
   - Klik **Authorize access**.
   - Pilih akun Google Anda.
   - Klik **Advanced (Lanjutan)** di bagian kiri bawah > klik **Go to Untitled project (unsafe)**.
   - Klik **Allow (Izinkan)**.
6. Salin **Web app URL** yang muncul (format: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Langkah 4: Hubungkan ke Aplikasi Frontend Anda

1. Buka file **`js/auth-access.js`** di proyek Anda.
2. Pada baris ke-5, ganti nilai `ACCESS_API_URL` dengan Web App URL yang baru saja Anda salin:

```javascript
const ACCESS_API_URL = 'https://script.google.com/macros/s/AKfycb...URL_MILIK_ANDA.../exec';
```

3. Jalankan build ulang:
```bash
python3 build_bundle.py && cp js/bundle.js bundle.js
```

---

## 🛡️ Jaminan Privasi & Keamanan Pelanggan
- Data keuangan (nominal saldo kas/bank, riwayat transaksi belanja, anggaran bulanan) **TIDAK PERNAH** dikirim ke database developer.
- Hanya data identitas login (nama, email, perangkat, waktu aktif) yang dikirim ke sistem telemetri ini untuk keperluan aktivasi lisensi dan manajemen pelanggan komersial.
