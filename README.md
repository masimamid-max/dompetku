# Dompet Keluarga

Aplikasi web progresif untuk pencatatan keuangan keluarga. Versi ini dapat dijalankan sebagai situs statis tanpa proses build.

## Menjalankan aplikasi

Layani folder ini melalui web server lokal atau unggah seluruh isinya ke hosting statis. Jangan membuka `index.html` langsung melalui alamat `file://`, karena service worker dan beberapa fitur browser membutuhkan HTTP/HTTPS.

Contoh bila Python tersedia:

```sh
python3 -m http.server 4173
```

Lalu buka `http://localhost:4173`.

## Kondisi fitur

- Transaksi, anggaran, tujuan, tagihan, dan pengaturan disimpan di `localStorage` browser.
- Ekspor CSV dan halaman cetak/PDF berjalan di sisi browser.
- Sinkronisasi Google Sheets terhubung ke Google Apps Script dan dilindungi token Google.
- Pemindai struk saat ini adalah simulasi berbasis nama file dan contoh data, belum OCR/AI sungguhan.
- Login menggunakan Google Identity Services; aplikasi tidak menerima atau menyimpan kata sandi pengguna.
- Backend hanya menerima pemilik atau email anggota yang berstatus `active` pada sheet `members`.

## Catatan versi 3.9.0

- Menambahkan gerbang login sebelum aplikasi dapat dibuka.
- Menambahkan pendaftaran dengan nama lengkap, email, nomor HP, dan persetujuan privasi.
- Menambahkan status verifikasi email dan menunggu aktivasi pengelola.
- Menambahkan panel aktivasi demo serta status aktif/nonaktif.
- Menambahkan alur lupa kata sandi yang tidak membocorkan keberadaan akun.
- Menghapus tampilan kata sandi anggota dan simulasi berpindah akun tanpa login.
- Mengubah penambahan anggota menjadi undangan email dengan peran Pemilik, Admin, atau Anggota.
- Menambahkan menu akun dan tombol keluar melalui avatar.

## Catatan versi 3.9.2

- Menambahkan tombol `Keluar Akun` yang jelas di halaman Pengaturan.
- Membuat alur anggota berbasis link undangan sekali pakai.
- Pemilik hanya menentukan nama, email, nomor HP opsional, dan peran; anggota membuat kata sandinya sendiri.
- Menambahkan tombol salin ulang link untuk undangan yang masih menunggu.

## Catatan versi 3.10.0

- Mengaktifkan login Google sungguhan melalui OAuth Client aplikasi web.
- Menambahkan verifikasi ID token dan audiens OAuth pada setiap operasi data backend.
- Menolak pembacaan dan penulisan data bagi email yang belum menjadi anggota aktif.
- Menjadikan akun `masimamid@gmail.com` sebagai pemilik awal untuk proses bootstrap.
- Menghapus akses login demo dan penyimpanan kata sandi lokal.
- Menghubungkan frontend ke deployment Google Apps Script versi 1.1.0.

## Catatan versi 3.11.0

- Menambahkan Spreadsheet Master untuk pelanggan, pemetaan akses, dan permintaan login baru.
- Memisahkan pemeriksaan identitas Google dari izin membuka dashboard.
- Mencatat email baru ke tab `accessRequests` dengan status `pending`.
- Membuka dashboard hanya untuk email pada `accessUsers` yang aktif dan memiliki lisensi aktif.
- Mengarahkan operasi data menggunakan `spreadsheetId` milik masing-masing keluarga.
- Menambahkan pemeriksaan masa berlaku lisensi dan status keluarga.

## Catatan versi 3.15.0

- Pelanggan dapat menghubungkan Google Spreadsheet miliknya sendiri tanpa memasang Apps Script.
- Halaman Cloud DB diganti menjadi panduan tiga langkah: buat spreadsheet, bagikan ke layanan, lalu hubungkan URL.
- Backend memverifikasi bahwa akun Google pelanggan adalah pemilik atau editor spreadsheet.
- Sistem otomatis membuat tabel Dompetku dan menyimpan pemetaan spreadsheet per pelanggan.

## Catatan versi 3.14.0

- Mode uji coba: pengguna cukup login Google lalu langsung masuk dashboard.
- Popup aktivasi, pemeriksaan lisensi, dan penguncian fitur dinonaktifkan sementara.
- Data `CUSTOMERS_ADMIN` tetap dipertahankan untuk tahap aktivasi komersial berikutnya.
- Data uji coba disimpan di perangkat pengguna; sinkronisasi cloud tetap memerlukan aktivasi backend.

## Catatan versi 3.13.0

- Satu tab `CUSTOMERS_ADMIN` menjadi pusat pelanggan, lisensi, aktivasi, dan lokasi database.
- Email aktivasi selalu memakai identitas Google yang sudah diverifikasi; pengguna tidak mengetik ulang email.
- Aktivasi cukup dengan memilih paket dan mencentang kolom `activate`.
- Saat pengguna memeriksa status, backend otomatis membuat database keluarga, ID pelanggan, ID keluarga, masa berlaku, dan memberikan akses.
- Spreadsheet keluarga otomatis dibagikan ke email pemilik keluarga.

## Catatan versi 3.12.0

- Pengguna baru tetap dapat masuk dan melihat antarmuka dalam mode terbatas.
- Seluruh fitur ditutup panel konfirmasi sampai email disetujui pengelola.
- Email Google otomatis dicatat pada `accessRequests`; email tidak dapat dipalsukan melalui isian bebas.
- Pengelola menyetujui akun melalui checkbox `approved` pada Spreadsheet Master.
- Setelah checkbox aktif dan `spreadsheetId` tersedia, backend otomatis membuat pelanggan dan akses pemilik keluarga.

## Backend Google Sheets MVP

Folder `backend` berisi `Code.gs` dan panduan instalasi Google Apps Script. Backend menyediakan pembuatan tabel, tes koneksi, sinkronisasi seluruh data, pengambilan data, penyimpanan transaksi baru, serta pemeriksaan token Google dan status anggota aktif.

## Catatan versi 3.8.0

- Memperbaiki jalur Apple touch icon.
- Menghilangkan permintaan CSS yang sebelumnya salah jalur.
- Menyamakan bundle JavaScript online dengan bundle yang disimpan untuk mode offline.
- Menyamakan versi loader dan cache service worker.
- Mengoptimalkan tampilan ponsel mulai dari lebar 320 px.
- Mencegah halaman melebar dan bergeser secara horizontal.
- Menyederhanakan header, grid, kartu, transaksi, tabel, toast, dan navigasi bawah pada layar kecil.
- Mengubah modal/form menjadi panel bawah yang nyaman digunakan dengan satu tangan.
- Mendukung area aman perangkat serta orientasi portrait dan landscape.
- Memisahkan judul transaksi dari nominal dan tombol aksi pada layar di bawah 900 px.
- Mendukung pembesaran font Android tanpa membuat judul dan nominal saling menimpa.
- Menambahkan versi pada URL stylesheet agar perbaikan tidak tertahan cache lama.
- Memperbesar ikon aksi transaksi dan memberi warna fungsi yang berbeda.
- Menampilkan label `Salin`, `Edit`, dan `Hapus` pada layar ponsel.
- Menambahkan label aksesibilitas dan area sentuh yang lebih nyaman.
- Memindahkan pilihan Scan Struk, Catat Pintar, Manual, dan Bot Telegram dari Dashboard ke formulir Catat Transaksi Baru.
- Menghapus tombol ekspor dari Dashboard dan memusatkan ekspor di halaman Laporan.
- Membuat hasil analisis AI dapat dikoreksi sebelum penyimpanan: jenis, nominal, deskripsi, kategori, rekening, anggota, dan tanggal.
- Menambahkan validasi hasil AI sebelum transaksi disimpan.
- Menambahkan Gambaran Umum dan Rekomendasi Keuangan berbasis data periode pada halaman Laporan.
- Memperbaiki ikon Impor CSV yang sebelumnya dapat menghentikan halaman Laporan.
- Menata navigasi mobile menjadi Beranda, Transaksi, tombol tambah, Anggaran, dan Menu.
- Menambahkan panel Menu Lainnya untuk Celengan Impian, Tagihan Rutin, Laporan, dan Pengaturan.
- Menambahkan penanda jumlah menu serta status aktif ketika pengguna berada di halaman menu lanjutan.
