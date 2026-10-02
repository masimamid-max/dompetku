/**
 * ============================================================================
 * DOMPETKU - BACKEND TELEMETRI & DATABASE PENGGUNA (DEVELOPER EDITION v2.0)
 * ============================================================================
 * Skrip ini dipasang di Google Spreadsheet PRIBADI MILIK DEVELOPER / PEMILIK APLIKASI.
 * Berfungsi untuk mencatat otomatis setiap orang yang login dan mengakses aplikasi.
 * 
 * Privasi Data:
 * - Hanya mencatat nama, email, waktu login, dan tipe perangkat.
 * - Transaksi keuangan & saldo pelanggan TIDAK dikirim ke sini (tetap di Spreadsheet pelanggan).
 * ============================================================================
 */

const SHEET_NAME = 'Data Pengguna';

function doGet(e) {
  return handleResponse({
    success: true,
    message: 'Backend Telemetri Pengguna Dompetku Aktif & Online',
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : '';
    if (!rawData) {
      return handleResponse({ success: false, message: 'Tidak ada data POST diterima' });
    }

    const payload = JSON.parse(rawData);
    const action = payload.action || 'record_login';

    if (action === 'record_login' || action === 'checkAccess') {
      return handleRecordLogin(payload);
    }

    if (action === 'get_stats') {
      return handleGetStats();
    }

    return handleResponse({ success: false, message: 'Action tidak dikenali: ' + action });
  } catch (err) {
    return handleResponse({ success: false, error: err.toString(), stack: err.stack });
  }
}

function handleRecordLogin(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = initializeUserSheet(ss);
  }

  const email = (payload.email || '').trim().toLowerCase();
  const fullName = (payload.fullName || payload.name || 'Pengguna').trim();
  const picture = payload.picture || '';
  const familyName = payload.familyName || payload.family || '-';
  const userAgent = payload.userAgent || '-';
  const appVersion = payload.appVersion || '3.16.1';
  const accessType = payload.accessType || 'Google Identity';
  const now = new Date();
  const timeFormatted = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

  if (!email) {
    return handleResponse({ success: false, message: 'Email tidak boleh kosong' });
  }

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  // Cari apakah email sudah pernah terdaftar sebelumnya (kolom D = indeks 3)
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]).toLowerCase().trim() === email) {
      rowIndex = i + 1; // 1-indexed baris sheet
      break;
    }
  }

  if (rowIndex > 0) {
    // Pengguna Lama (Update waktu login terakhir & hitung total login)
    const currentLogins = parseInt(sheet.getRange(rowIndex, 8).getValue() || 1, 10);
    const newLogins = currentLogins + 1;

    sheet.getRange(rowIndex, 2).setValue(timeFormatted); // Terakhir Aktif
    if (fullName) sheet.getRange(rowIndex, 3).setValue(fullName);
    if (familyName && familyName !== '-') sheet.getRange(rowIndex, 6).setValue(familyName);
    sheet.getRange(rowIndex, 7).setValue(parseDevice(userAgent)); // Perangkat
    sheet.getRange(rowIndex, 8).setValue(newLogins); // Total Login
    sheet.getRange(rowIndex, 9).setValue(appVersion);

    return handleResponse({
      success: true,
      isNewUser: false,
      message: 'Login diperbarui untuk: ' + email,
      totalLogins: newLogins,
      access: { authorized: true, status: 'active', message: 'Akses aktif' }
    });

  } else {
    // Pengguna Baru (Tambahkan baris baru)
    const newNo = data.length; // Baris setelah header
    const device = parseDevice(userAgent);
    const initialStatus = 'Aktif (Baru)';

    sheet.appendRow([
      newNo,
      timeFormatted,       // B: Tanggal & Waktu Terdaftar
      fullName,            // C: Nama Lengkap
      email,               // D: Email Google
      picture,             // E: URL Foto Profil
      familyName,          // F: Nama Keluarga / Buku Kas
      device,              // G: Perangkat & Browser
      1,                   // H: Total Kali Login
      appVersion,          // I: Versi Aplikasi
      initialStatus,       // J: Status Lisensi
      timeFormatted,       // K: Waktu Login Terakhir
      ''                   // L: Catatan Khusus Pengembang
    ]);

    // Format sel foto jika ada URL
    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 12).setVerticalAlignment('middle');

    return handleResponse({
      success: true,
      isNewUser: true,
      message: 'Pengguna baru berhasil dicatat: ' + email,
      access: { authorized: true, status: 'active', message: 'Selamat datang pengguna baru' }
    });
  }
}

function handleGetStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return handleResponse({ totalUsers: 0 });

  const rows = sheet.getLastRow() - 1;
  return handleResponse({
    success: true,
    totalUsers: Math.max(0, rows),
    checkedAt: new Date().toISOString()
  });
}

function initializeUserSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME, 0);
  }

  const headers = [
    'No',
    'Waktu Terdaftar',
    'Nama Lengkap',
    'Alamat Email',
    'Foto Profil',
    'Nama Buku Kas / Keluarga',
    'Perangkat & Browser',
    'Total Login',
    'Versi App',
    'Status Lisensi / Akses',
    'Login Terakhir',
    'Catatan Pengembang (Admin)'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Styling Header Modern (Emerald Green Theme)
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#059669');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 40);

  // Freeze Baris Header
  sheet.setFrozenRows(1);

  // Set lebar kolom yang ideal
  sheet.setColumnWidth(1, 50);   // No
  sheet.setColumnWidth(2, 160);  // Waktu
  sheet.setColumnWidth(3, 180);  // Nama
  sheet.setColumnWidth(4, 230);  // Email
  sheet.setColumnWidth(5, 120);  // Foto
  sheet.setColumnWidth(6, 180);  // Keluarga
  sheet.setColumnWidth(7, 200);  // Perangkat
  sheet.setColumnWidth(8, 90);   // Total Login
  sheet.setColumnWidth(9, 90);   // Versi
  sheet.setColumnWidth(10, 150); // Status
  sheet.setColumnWidth(11, 160); // Login Terakhir
  sheet.setColumnWidth(12, 220); // Catatan

  return sheet;
}

function parseDevice(ua) {
  if (!ua || ua === '-') return 'Desktop / Web';
  if (/Android/i.test(ua)) return '📱 Android Phone';
  if (/iPhone|iPad|iPod/i.test(ua)) return '📱 Apple iOS (iPhone/iPad)';
  if (/Macintosh|Mac OS X/i.test(ua)) return '💻 Apple Mac (macOS)';
  if (/Windows/i.test(ua)) return '💻 PC Windows';
  if (/Linux/i.test(ua)) return '💻 Linux Desktop';
  return '🌐 Web Browser';
}

function handleResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
