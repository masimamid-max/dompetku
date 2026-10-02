# Handoff Proyek Dompetku

## Versi saat ini

- Frontend: 3.16.0 (Zero-Knowledge Privacy & Clean Data Reset)
- Backend Google Apps Script: 2.0.0 (Private Standalone / Zero-Knowledge)
- Produksi: https://masimamid-max.github.io/dompetku/?build=3160
- Repository: https://github.com/masimamid-max/dompetku

## Arsitektur Privasi Penuh (Zero-Knowledge / Client-Owned Data)

- **Frontend Statis (PWA):** Berjalan di browser pelanggan dan dapat di-host gratis di GitHub Pages / Cloudflare Pages.
- **Penyimpanan Lokal (Local-First):** Data transaksi disimpan 100% di perangkat pelanggan (`localStorage`).
- **Data Bersih vs Data Demo:**
  - Opsi *Mulai dari Nol (Data Bersih)*: 0 transaksi, 2 rekening kas/bank Rp 0, siap untuk penggunaan riil pelanggan.
  - Opsi *Muat Data Demo*: Simulasi Keluarga Santoso + 18 transaksi untuk belajar.
- **Cadangan & Pemulihan Mandiri (Backup & Restore):**
  - Unduh file JSON cadangan lengkap & ekspor CSV Excel.
  - Pulihkan data dari file JSON cadangan kapan saja.
- **Google Sheets Cloud DB (Privasi 100% Mandiri):**
  - Pelanggan memasang skrip backend (`backend/Code.gs`) di Google Spreadsheet akun Google miliknya sendiri.
  - **TIDAK PERLU membagikan spreadsheet ke email pengembang (`masimamid@gmail.com` atau lainnya).**
  - Developer/pengembang memiliki NOL AKSES ke spreadsheet dan data finansial pelanggan.

## Berkas penting

- `index.html`: entry point aplikasi.
- `js/bundle.js`: kode aplikasi utama yang digunakan online.
- `bundle.js`: fallback lama; harus selalu disamakan dengan `js/bundle.js`.
- `js/auth-access.js`: login Google dan sesi pengguna.
- `css/`: seluruh gaya dan responsive mobile.
- `sw.js`: service worker; naikkan nama cache setiap rilis.
- `backend/Code.gs`: backend Google Apps Script privat mandiri (v2.0.0).
- `backend/README_GOOGLE_APPS_SCRIPT.md`: panduan backend.

## Alur Google Sheets Mandiri

1. Pengguna membuka Google Sheets baru di `sheets.new`.
2. Pengguna membuka Ekstensi > Apps Script, lalu menempelkan skrip `backend/Code.gs` (tersedia tombol salin 1-klik di aplikasi).
3. Pengguna mendeploy sebagai Web App (Execute as: Me, Access: Anyone).
4. Pengguna menempelkan URL Web App ke Pengaturan > Google Sheets Cloud DB dan menekan `Hubungkan & Inisialisasi Database`.
5. Seluruh tabel data Dompetku otomatis dibuat di spreadsheet pelanggan.

## Instruksi untuk AI penerus

Pelajari seluruh proyek sebelum mengubah kode. Pertahankan antarmuka berbahasa Indonesia, desain mobile-friendly, isolasi data per pelanggan, dan privasi penuh tanpa perantara email pengembang. Jelaskan perubahan dan uji sebelum rilis.

