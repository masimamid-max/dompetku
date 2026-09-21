# 💰 Dompet Keluarga V2 - Arsitektur Frontend, Docker & Backend Serverless

Aplikasi Manajemen & Pencatatan Keuangan Keluarga Kolaboratif berbasis Web yang **100% Siap Pakai, Bebas Biaya Server Bulanan, dan Terkunci Stabil (Production-Ready)**.

---

## ⚡ CARA JALANKAN CEPAT (TINGGAL TEMPEL & RUN)

### Opsi A: Menggunakan Docker (Rekomendasi 1-Klik)
Cukup jalankan perintah berikut di terminal:
```bash
docker compose up -d --build
```
Aplikasi langsung berjalan di 👉 **`http://localhost:3000`**

Untuk mematikan:
```bash
docker compose down
```

---

### Opsi B: Menggunakan Local Python Server (Tanpa Docker)
```bash
python3 dev_server.py
```
Buka browser di 👉 **`http://localhost:3000`**

---

## 📁 Struktur File Lengkap
```text
dompet-keluarga/
├── Dockerfile                    # Container Nginx Alpine super ringan (<25MB)
├── docker-compose.yml            # Konfigurasi 1-klik deploy Docker port 3000
├── nginx.conf                    # Web server config dengan Gzip, Cache & Security
├── .dockerignore                 # Ignore file untuk docker build
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD otomatis ke GitHub Pages
├── backend/
│   ├── Code.gs                   # Backend Google Apps Script lengkap (REST API & Sheets DB)
│   └── README_GOOGLE_APPS_SCRIPT.md # Panduan langkah demi langkah setup GAS
├── css/
│   ├── tokens.css                # Palet warna, typography, radii, shadows
│   ├── layout.css                # Grid responsif & sidebar/bottom-nav
│   ├── components.css            # Modals, buttons, cards, badges, toast
│   └── pages.css                 # Styling dashboard, laporan, anggaran, scanner
├── js/
│   ├── initialData.js            # Mock master data awal (Keluarga Santoso)
│   ├── state.js                  # State store & reactivity (localStorage + Cloud Sync)
│   ├── utils.js                  # Formatter Rupiah, tanggal, filter
│   ├── utils/
│   │   ├── aiParser.js           # Indonesian NLP financial text parser
│   │   ├── receiptScanner.js     # Smart OCR vision scanner
│   │   └── cloudSync.js          # Layanan HTTP fetch sync ke Google Apps Script
│   ├── components/               # Komponen UI (Navbar, Modal, Toast, Scanner, Bot Simulator)
│   ├── pages/                    # Halaman (Dashboard, Transaksi, Anggaran, Impian, Tagihan, Pengaturan)
│   ├── app.js                    # Router & inisialisasi aplikasi
│   └── bundle.js                 # Production single-file bundle (v2.3.0)
├── _headers                      # Header konfigurasi keamanan & cache untuk Cloudflare Pages
├── _redirects                    # Routing SPA fallback
├── build_bundle.py               # Script otomatis pembuatan bundle.js
├── dev_server.py                 # Local development server dengan no-cache header
├── index.html                    # Entry point aplikasi
└── README.md                     # Dokumentasi utama proyek
```

---

## 🚀 SETUP BACKEND GOOGLE APPS SCRIPT (Google Sheets Database)

Backend menggunakan **Google Sheets** sebagai database gratis dan **Google Apps Script** sebagai REST API.

### Langkah Singkat:
1. Buka [Google Sheets Baru](https://sheets.new).
2. Beri nama Spreadsheet: **"Database Dompet Keluarga"**.
3. Di menu atas, pilih **Extensions (Ekstensi)** > **Apps Script**.
4. Hapus seluruh isi default `Code.gs`, lalu salin seluruh isi dari file [`backend/Code.gs`](backend/Code.gs) ke editor Apps Script.
5. Klik **Deploy (Terapkan)** di kanan atas > pilih **New deployment (Penerapan baru)**.
6. Pilih tipe **Web app**:
   - **Execute as**: `Me` (Email Google Anda)
   - **Who has access**: **`Anyone` (Siapa saja)** ⚠️ *(Wajib dipilih agar aplikasi web frontend dapat menyimpan data)*
7. Klik **Deploy** dan berikan izin otorisasi (*Authorize access* > pilih akun Google > *Advanced* > *Go to Untitled Project (unsafe)* > *Allow*).
8. Salin **Web App URL** yang didapat (format: `https://script.google.com/macros/s/AKfycb.../exec`).
9. Di aplikasi Dompet Keluarga, buka menu **Pengaturan** > tab **☁️ Google Sheets Cloud DB** > tempelkan URL tersebut > klik **Inisialisasi Otomatis Tabel Sheets**.

---

## 🌐 DEPLOY FRONTEND KE CLOUDFLARE PAGES (Gratis + Domain Custom)

1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/) (Gratis).
2. Pilih menu **Workers & Pages** > **Create application** > tab **Pages**.
3. Hubungkan akun GitHub Anda (`Connect to Git`) dan pilih repository `dompet-keluarga`.
4. Pada pengaturan build:
   - **Framework preset**: `None`
   - **Build output directory**: `.` (Root)
5. Klik **Save and Deploy**. Website langsung live dengan HTTPS gratis di domain `*.pages.dev`.

---

## 🐙 DEPLOY FRONTEND KE GITHUB PAGES (Otomatis)

1. Push ke repository GitHub Anda:
   ```bash
   git init
   git add .
   git commit -m "feat: Dompet Keluarga V2.3.0 Production Ready"
   git branch -M main
   git remote add origin https://github.com/USERNAME/dompet-keluarga.git
   git push -u origin main
   ```
2. Di repository GitHub > **Settings** > **Pages** > pada **Source**, pilih **`GitHub Actions`**.
3. Otomatis online di: `https://USERNAME.github.io/dompet-keluarga/`

---

## 🔒 STATUS KUNCI VERSI (V2.3.0 STABLE)
Aplikasi saat ini telah dikunci pada versi stabil **V2.3.0** dengan seluruh fitur utama yang sudah teruji:
- ✅ Dashboard Arus Kas Realtime & Grafik Komposisi Pengeluaran
- ✅ Input Transaksi Manual, AI Natural Text Chat, & **Scan Foto Struk (OCR & Konfirmasi)**
- ✅ Manajemen Anggaran Bulanan Dinamis per Kategori (dengan peringatan overbudget)
- ✅ Manajemen Multi-Anggota Keluarga (Super Akses/Pemilik, Admin, Anggota + Login Mandiri & Switch Role)
- ✅ Custom Kategori & Subkategori (Tambah, Edit, Arsip Aman)
- ✅ Tabungan Impian Bersama (*Family Goals*) & Pengingat Tagihan Rutin (*Bills Tracker*)
- ✅ Integrasi Cloud Sync Realtime ke Google Sheets Backend
- ✅ Docker Container & Cloud Hosting Ready (Cloudflare / GitHub Pages)
