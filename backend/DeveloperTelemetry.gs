/**
 * ============================================================================
 * DOMPETKU - BACKEND TELEMETRI, LISENSI & DATABASE PELANGGAN (v3.0)
 * ============================================================================
 * Skrip ini dipasang di Google Spreadsheet PRIBADI MILIK DEVELOPER / PEMILIK APLIKASI.
 * Berfungsi untuk:
 * 1. Mengumpulkan Database Nomor WhatsApp / HP Pelanggan untuk Marketing.
 * 2. Mengatur & Memvalidasi Kunci Lisensi Unik Pelanggan (1 Lisensi per Pembeli).
 * 3. Telemetri pengguna & statistik login aktif secara realtime.
 * ============================================================================
 */

const SHEET_USERS = 'Database_Pelanggan';
const SHEET_LICENSES = 'Master_Lisensi';

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('👑 Dompetku Admin')
    .addItem('🔑 Buat 10 Kunci Lisensi Unik Baru', 'menuGenerate10Keys')
    .addItem('🔑 Buat 50 Kunci Lisensi Unik Baru', 'menuGenerate50Keys')
    .addSeparator()
    .addItem('📱 Format & Bersihkan Nomor WhatsApp', 'formatAllPhoneNumbers')
    .addItem('⚙️ Inisialisasi Ulang Header Sheet', 'initializeSheets')
    .addToUi();
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  
  if (action === 'get_stats') {
    return handleGetStats();
  }

  return handleResponse({
    success: true,
    message: 'Backend Lisensi & Database Pelanggan Dompetku Online',
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

    if (action === 'verify_license' || action === 'activate_license') {
      return handleActivateLicense(payload);
    }

    if (action === 'get_stats') {
      return handleGetStats();
    }

    return handleResponse({ success: false, message: 'Action tidak dikenali: ' + action });
  } catch (err) {
    return handleResponse({ success: false, error: err.toString(), stack: err.stack });
  }
}

/**
 * Mencatat Data Login Pengguna & Sinkronisasi Akun Lintas Perangkat (Multi-Device)
 */
function handleRecordLogin(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) sheet = initializeUsersSheet(ss);

  const rawIdent = (payload.identifier || payload.email || payload.phone || '').trim().toLowerCase();
  const isEmail = rawIdent.includes('@');
  const email = (isEmail ? rawIdent : (payload.email || '')).trim().toLowerCase();
  const phone = cleanPhoneNumber(payload.phone || (!isEmail ? rawIdent : ''));
  const fullName = (payload.fullName || payload.name || 'Pengguna').trim();
  const password = payload.password || '';
  const familyName = payload.familyName || payload.family || '-';
  const userAgent = payload.userAgent || payload.device || '-';
  const appVersion = payload.appVersion || '3.18.5';
  const licenseKey = payload.licenseKey || '';
  const now = new Date();
  const timeFormatted = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

  if (!email && !phone) {
    return handleResponse({ success: false, message: 'Harap masukkan nomor WhatsApp atau email' });
  }

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const rowEmail = String(data[i][3]).toLowerCase().trim();
    const rowPhone = cleanPhoneNumber(data[i][4]);
    
    if ((email && rowEmail === email) || (phone && rowPhone && rowPhone === phone)) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > 0) {
    // Pengguna Ditemukan - Update waktu login & telemetri
    const currentLogins = parseInt(sheet.getRange(rowIndex, 9).getValue() || 1, 10);
    const newLogins = currentLogins + 1;

    sheet.getRange(rowIndex, 2).setValue(timeFormatted); // Terakhir Aktif
    if (fullName && fullName !== 'Pengguna' && !sheet.getRange(rowIndex, 3).getValue()) {
      sheet.getRange(rowIndex, 3).setValue(fullName);
    }
    if (phone && !sheet.getRange(rowIndex, 5).getValue()) {
      sheet.getRange(rowIndex, 5).setValue(phone);
    }
    if (licenseKey && !sheet.getRange(rowIndex, 6).getValue()) {
      sheet.getRange(rowIndex, 6).setValue(licenseKey);
    }
    sheet.getRange(rowIndex, 8).setValue(parseDevice(userAgent));
    sheet.getRange(rowIndex, 9).setValue(newLogins);
    sheet.getRange(rowIndex, 10).setValue(appVersion);

    const savedName = sheet.getRange(rowIndex, 3).getValue() || fullName;
    const savedEmail = sheet.getRange(rowIndex, 4).getValue() || email;
    const savedPhone = sheet.getRange(rowIndex, 5).getValue() || phone;
    const savedKey = sheet.getRange(rowIndex, 6).getValue() || licenseKey;
    const existingStatus = String(sheet.getRange(rowIndex, 7).getValue() || 'Aktif');
    const isPro = existingStatus.includes('PRO') || (savedKey && savedKey !== '-');

    return handleResponse({
      success: true,
      isNewUser: false,
      message: 'Login berhasil terverifikasi untuk: ' + (savedEmail || savedPhone),
      user: {
        name: savedName,
        email: savedEmail,
        phone: savedPhone,
        licenseKey: savedKey && savedKey !== '-' ? savedKey : '',
        isPro: isPro
      },
      access: { 
        authorized: true, 
        status: isPro ? 'active' : 'trial',
        plan: isPro ? 'Dompetku PRO Lifetime' : 'Mode Uji Coba'
      }
    });

  } else {
    // Pengguna Baru (atau login pertama kali di perangkat baru sebelum registrasi offline)
    const newNo = data.length;
    const device = parseDevice(userAgent);
    const initialStatus = licenseKey ? 'Aktif (PRO)' : 'Aktif (Baru)';
    const registeredEmail = email || (phone + '@dompetku.local');
    const registeredPhone = phone || '-';

    sheet.appendRow([
      newNo,
      timeFormatted,       // B: Waktu Terdaftar
      fullName,            // C: Nama Lengkap
      registeredEmail,     // D: Email
      registeredPhone,     // E: Nomor WhatsApp (HP)
      licenseKey || '-',   // F: Kode Lisensi
      initialStatus,       // G: Status Lisensi
      device,              // H: Perangkat
      1,                   // I: Total Login
      appVersion,          // J: Versi App
      familyName,          // K: Nama Keluarga
      password ? 'PIN tersimpan' : '' // L: Catatan
    ]);

    return handleResponse({
      success: true,
      isNewUser: true,
      message: 'Akun berhasil disinkronkan: ' + (registeredEmail || registeredPhone),
      user: {
        name: fullName,
        email: registeredEmail,
        phone: registeredPhone,
        licenseKey: licenseKey || '',
        isPro: !!licenseKey
      },
      access: { authorized: true, status: licenseKey ? 'active' : 'trial', plan: licenseKey ? 'Dompetku PRO Lifetime' : 'Mode Uji Coba' }
    });
  }
}

/**
 * Validasi dan Aktivasi Kunci Lisensi Unik + Simpan Nomor WhatsApp
 */
function handleActivateLicense(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let userSheet = ss.getSheetByName(SHEET_USERS);
  if (!userSheet) userSheet = initializeUsersSheet(ss);

  let licSheet = ss.getSheetByName(SHEET_LICENSES);
  if (!licSheet) licSheet = initializeLicenseSheet(ss);

  const rawKey = (payload.key || payload.licenseKey || '').trim().toUpperCase();
  const email = (payload.email || '').trim().toLowerCase();
  const fullName = (payload.fullName || payload.name || 'Pelanggan').trim();
  const phone = cleanPhoneNumber(payload.phone || payload.phoneNumber || '');
  const now = new Date();
  const timeFormatted = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');

  if (!rawKey) {
    return handleResponse({ success: false, message: 'Kode kunci lisensi wajib diisi.' });
  }

  // 1. Cek Master Keys Global Developer
  const masterKeys = ['DKPRO-LIFETIME-2026', 'DOMPETKU-PRO-VIP', 'DOMPETKU-PRO-8899', 'DK-SUPER-ACCESS'];
  let isMasterKey = masterKeys.includes(rawKey);

  // 2. Cek di Sheet Master_Lisensi (Kunci Unik per Pelanggan)
  const licData = licSheet.getDataRange().getValues();
  let foundLicIndex = -1;
  let licPlan = 'Dompetku PRO Lifetime';
  let isUniqueKeyMatch = false;

  for (let i = 1; i < licData.length; i++) {
    const sheetKey = String(licData[i][1]).trim().toUpperCase();
    if (sheetKey === rawKey) {
      foundLicIndex = i + 1;
      const assignedEmail = String(licData[i][3]).toLowerCase().trim();
      const status = String(licData[i][5]).trim();
      licPlan = String(licData[i][2]).trim() || licPlan;

      // Jika kunci sudah terikat ke email lain
      if (assignedEmail && assignedEmail !== email && assignedEmail !== '-') {
        return handleResponse({
          success: false,
          message: 'Kode lisensi ini sudah digunakan oleh akun email lain (' + assignedEmail + ').'
        });
      }

      isUniqueKeyMatch = true;
      break;
    }
  }

  // 3. Fallback jika format cocok dengan pola serial resmi (DK-XXXX-YYYY-ZZZZ)
  const isPatternValid = isMasterKey || isUniqueKeyMatch || /^DK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(rawKey) || (rawKey.startsWith('DKPRO-') && rawKey.length >= 10);

  if (!isPatternValid) {
    return handleResponse({
      success: false,
      message: 'Kunci lisensi tidak valid atau belum terdaftar. Silakan hubungi admin di WhatsApp untuk pembelian lisensi resmi.'
    });
  }

  // Jika kunci unik terdaftar di sheet Master_Lisensi, tandai sebagai Terpakai
  if (foundLicIndex > 0) {
    licSheet.getRange(foundLicIndex, 4).setValue(email);          // Terikat Email
    licSheet.getRange(foundLicIndex, 5).setValue(phone || '-');    // Terikat No WA
    licSheet.getRange(foundLicIndex, 6).setValue('Terpakai (Aktif)');
    licSheet.getRange(foundLicIndex, 7).setValue(timeFormatted);  // Waktu Aktivasi
  }

  // Simpan / Perbarui nomor WhatsApp dan status di Database_Pelanggan
  const usersData = userSheet.getDataRange().getValues();
  let userRow = -1;

  for (let i = 1; i < usersData.length; i++) {
    if (String(usersData[i][3]).toLowerCase().trim() === email) {
      userRow = i + 1;
      break;
    }
  }

  if (userRow > 0) {
    if (phone) userSheet.getRange(userRow, 5).setValue(phone);
    userSheet.getRange(userRow, 6).setValue(rawKey);
    userSheet.getRange(userRow, 7).setValue('Aktif (PRO)');
    userSheet.getRange(userRow, 2).setValue(timeFormatted);
  } else {
    userSheet.appendRow([
      usersData.length,
      timeFormatted,
      fullName,
      email,
      phone || '-',
      rawKey,
      'Aktif (PRO)',
      '🌐 Web App',
      1,
      '3.17.1',
      '-',
      'Aktivasi Mandiri via Aplikasi'
    ]);
  }

  return handleResponse({
    success: true,
    message: '🎉 Lisensi Dompetku PRO Berhasil Diaktifkan! Semua fitur pencatatan dan sinkronisasi telah terbuka.',
    license: {
      status: 'active',
      plan: licPlan,
      key: rawKey,
      email: email,
      phone: phone,
      activatedAt: timeFormatted,
      validUntil: 'Selamanya (Lifetime)'
    }
  });
}

/**
 * Menu Spreadsheet: Generate Kunci Lisensi Unik
 */
function menuGenerate10Keys() { generateLicenseKeys(10); }
function menuGenerate50Keys() { generateLicenseKeys(50); }

function generateLicenseKeys(count = 10) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LICENSES);
  if (!sheet) sheet = initializeLicenseSheet(ss);

  const now = new Date();
  const timeFormatted = Utilities.formatDate(now, ss.getSpreadsheetTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
  const existingData = sheet.getDataRange().getValues();
  const currentCount = existingData.length - 1;

  const rows = [];
  for (let i = 0; i < count; i++) {
    const num = currentCount + i + 1;
    const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const part3 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `DK-${part1}-${part2}-${part3}`;

    rows.push([
      num,
      key,
      'Dompetku PRO Lifetime',
      '-', // Email (Kosong, diisi saat user aktivasi)
      '-', // No WhatsApp (Kosong, diisi saat user aktivasi)
      'Tersedia (Belum Terpakai)',
      '-', // Tanggal Aktivasi
      timeFormatted // Tanggal Dibuat
    ]);
  }

  if (rows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    sheet.getRange(startRow, 1, rows.length, 8).setValues(rows);
    SpreadsheetApp.getUi().alert(`✅ Berhasil membuat ${count} Kunci Lisensi Unik baru di sheet "${SHEET_LICENSES}"!`);
  }
}

/**
 * Inisialisasi Sheet Database Pelanggan
 */
function initializeUsersSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) sheet = ss.insertSheet(SHEET_USERS, 0);

  const headers = [
    'No',
    'Terakhir Aktif',
    'Nama Pelanggan',
    'Email Google',
    'Nomor WhatsApp (HP)',
    'Kode Lisensi',
    'Status Akses',
    'Perangkat',
    'Total Login',
    'Versi App',
    'Nama Buku Kas',
    'Catatan Marketing'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#0f766e');
  hRange.setFontColor('#ffffff');
  hRange.setFontWeight('bold');
  hRange.setHorizontalAlignment('center');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 45);   // No
  sheet.setColumnWidth(2, 150);  // Waktu
  sheet.setColumnWidth(3, 170);  // Nama
  sheet.setColumnWidth(4, 220);  // Email
  sheet.setColumnWidth(5, 160);  // No WhatsApp
  sheet.setColumnWidth(6, 170);  // Kode Lisensi
  sheet.setColumnWidth(7, 130);  // Status
  sheet.setColumnWidth(8, 160);  // Perangkat
  sheet.setColumnWidth(9, 80);   // Total Login
  sheet.setColumnWidth(10, 80);  // Versi
  sheet.setColumnWidth(11, 150); // Nama Keluarga
  sheet.setColumnWidth(12, 200); // Catatan

  return sheet;
}

/**
 * Inisialisasi Sheet Master Lisensi
 */
function initializeLicenseSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_LICENSES);
  if (!sheet) sheet = ss.insertSheet(SHEET_LICENSES, 1);

  const headers = [
    'No',
    'Kode Lisensi Unik',
    'Paket Lisensi',
    'Terikat Email',
    'Nomor WhatsApp',
    'Status Kunci',
    'Waktu Diaktivasi',
    'Waktu Dibuat'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  const hRange = sheet.getRange(1, 1, 1, headers.length);
  hRange.setBackground('#1e293b');
  hRange.setFontColor('#ffffff');
  hRange.setFontWeight('bold');
  hRange.setHorizontalAlignment('center');
  sheet.setRowHeight(1, 38);
  sheet.setFrozenRows(1);

  sheet.setColumnWidth(1, 45);
  sheet.setColumnWidth(2, 200);
  sheet.setColumnWidth(3, 170);
  sheet.setColumnWidth(4, 220);
  sheet.setColumnWidth(5, 160);
  sheet.setColumnWidth(6, 160);
  sheet.setColumnWidth(7, 160);
  sheet.setColumnWidth(8, 160);

  return sheet;
}

function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  initializeUsersSheet(ss);
  initializeLicenseSheet(ss);
  SpreadsheetApp.getUi().alert('✅ Inisialisasi seluruh tabel header sheet berhasil!');
}

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let str = String(phone).replace(/[^0-9+]/g, '');
  if (str.startsWith('08')) str = '628' + str.slice(2);
  if (str.startsWith('+62')) str = '62' + str.slice(3);
  return str;
}

function formatAllPhoneNumbers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const range = sheet.getRange(2, 5, lastRow - 1, 1);
  const values = range.getValues();

  for (let i = 0; i < values.length; i++) {
    if (values[i][0]) {
      values[i][0] = cleanPhoneNumber(values[i][0]);
    }
  }

  range.setValues(values);
  SpreadsheetApp.getUi().alert('✅ Seluruh nomor WhatsApp berhasil diformat ke standar internasional (628...)!');
}

function handleGetStats() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_USERS);
  if (!sheet) return handleResponse({ totalUsers: 0 });

  const rows = sheet.getLastRow() - 1;
  return handleResponse({
    success: true,
    totalUsers: Math.max(0, rows),
    checkedAt: new Date().toISOString()
  });
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
