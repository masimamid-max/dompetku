# 🚀 Panduan Setup Backend Google Apps Script (Google Sheets Database)

Dompet Keluarga V2 menggunakan **Google Sheets** sebagai database gratis, aman, dan tanpa biaya server bulanan (*serverless*), yang dikontrol melalui **Google Apps Script (GAS)**.

---

## 📋 Langkah-langkah Setup (Hanya 3 Menit):

### Langkah 1: Buat Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet Anda, contoh: **"Database Dompet Keluarga"**.

---

### Langkah 2: Buka Apps Script Editor
1. Pada menu atas Google Sheets, klik **Extensions (Ekstensi)** > **Apps Script**.
2. Hapus semua kode default di dalam editor `Code.gs`.
3. Buka file [`backend/Code.gs`](file:///Users/azbopulangsejahtera/.gemini/antigravity-ide/scratch/dompet-keluarga/backend/Code.gs), salin seluruh isinya, lalu tempelkan (*paste*) ke editor Apps Script.
4. Klik icon **Save (Simpan)** 💾 atau tekan `Ctrl + S` / `Cmd + S`.

---

### Langkah 3: Deploy sebagai Web App
1. Klik tombol **Deploy (Terapkan)** berwarna biru di pojok kanan atas > pilih **New deployment (Penerapan baru)**.
2. Klik ikon gerigi ⚙️ di samping "Select type" > pilih **Web app**.
3. Isi konfigurasi berikut:
   - **Description**: `Dompet Keluarga API V2`
   - **Execute as (Jalankan sebagai)**: `Me (email Anda)`
   - **Who has access (Siapa yang memiliki akses)**: **`Anyone (Siapa saja)`** ⚠️ *(Wajib dipilih agar aplikasi web frontend dapat mengirim data)*
4. Klik tombol **Deploy**.
5. Google akan meminta izin otorisasi akses (*Authorize access*):
   - Klik **Authorize access**.
   - Pilih akun Google Anda.
   - Jika muncul peringatan *"Google hasn't verified this app"*, klik **Advanced (Tingkat Lanjut)** > klik **Go to Untitled project (unsafe)**.
   - Klik **Allow (Izinkan)**.
6. Salin **Web App URL** yang dihasilkan (contoh: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

### Langkah 4: Hubungkan ke Aplikasi Dompet Keluarga
1. Buka aplikasi Dompet Keluarga di browser Anda.
2. Masuk ke menu **Pengaturan (Settings)** > bagian **☁️ Integrasi Google Sheets (Cloud Database)**.
3. Tempelkan (*paste*) **Web App URL** Anda ke kolom yang disediakan.
4. Klik tombol **"Test & Inisialisasi Database"**.
   - Sistem akan otomatis membuat semua sheet (`Transactions`, `Accounts`, `Categories`, `Members`, `Budgets`, `Goals`, `Bills`) lengkap dengan format warna dan kolom yang rapi!
5. Aktifkan **Auto-Sync** agar setiap transaksi baru otomatis terkirim ke Google Sheets Anda secara real-time.

---

## 📊 Struktur Sheet yang Dibuat Otomatis
- **`Transactions`**: Menyimpan riwayat pengeluaran, pemasukan, item struk, dan foto bukti.
- **`Accounts`**: Rekening bank, dompet fisik, e-wallet (BCA, Mandiri, GoPay, Tunai, dll).
- **`Categories`**: Kategori pengeluaran & pemasukan (termasuk custom category).
- **`Members`**: Daftar anggota keluarga & hak akses login / PIN.
- **`Budgets`**: Rencana batas anggaran bulanan per kategori.
- **`Goals`**: Tabungan impian keluarga & progres pencapaian.
- **`Bills`**: Pengingat tagihan rutin bulanan (Listrik, Wifi, Air, dll).
