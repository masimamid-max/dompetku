# Backend Google Sheets — Dompet Keluarga

Backend MVP ini menyimpan data keuangan setiap keluarga pada spreadsheet milik keluarga tersebut. Kata sandi tidak disimpan di spreadsheet.

## Yang perlu disiapkan

1. Satu akun Google untuk pengembangan.
2. Satu Google Sheet uji coba.
3. File `Code.gs` dari folder ini.

## Instalasi

1. Buka `https://sheets.new` dan beri nama `Dompet Keluarga - Uji Coba`.
2. Pilih **Extensions → Apps Script**.
3. Hapus contoh kode yang ada, lalu salin seluruh isi `Code.gs`.
4. Simpan dan jalankan fungsi `setupDompetKeluarga` satu kali.
5. Berikan izin yang diminta Google. Spreadsheet akan mempunyai tab family, members, accounts, categories, transactions, budgets, goals, dan recurringBills.
6. Pilih **Deploy → New deployment → Web app**.
7. Untuk tahap uji lokal, pilih **Execute as: Me** dan **Who has access: Anyone**.
8. Salin URL Web App yang berakhiran `/exec`.
9. Di aplikasi buka **Pengaturan → Google Sheets Cloud DB**, tempel URL, lalu pilih **Tes Koneksi** dan **Inisialisasi Database**.

## Batasan dan keamanan

- Deployment `Anyone` cocok untuk prototipe, belum untuk pelanggan berbayar.
- Sebelum produksi, autentikasi Google dan validasi identitas anggota harus diaktifkan.
- Jangan pernah memasukkan kata sandi, OTP, token Google, atau data kartu pembayaran ke spreadsheet.
- Apps Script mempunyai kuota harian. Pantau penggunaan sebelum pelanggan bertambah banyak.
- Setiap keluarga sebaiknya mempunyai spreadsheet sendiri untuk isolasi dan kepemilikan data.

## Arsitektur produksi yang dituju

- Login: Google Identity Services.
- Lisensi dan status pelanggan: spreadsheet pusat milik pengelola.
- Data keuangan: spreadsheet terpisah milik setiap keluarga.
- Keanggotaan: undangan email sekali pakai, kemudian dicocokkan dengan email Google.
- Peran: owner, admin, member.
