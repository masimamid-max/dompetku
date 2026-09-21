/**
 * =========================================================================
 * DOMPET KELUARGA V2 - BACKEND GOOGLE APPS SCRIPT (GAS)
 * =========================================================================
 * Backend API Serverless berbasis Google Spreadsheet untuk Dompet Keluarga.
 * 
 * Fitur:
 * 1. Otomatis inisialisasi tab & header tabel (Transactions, Accounts, Categories, Members, Budgets, Goals, Bills).
 * 2. Mendukung RESTful JSON API via doGet & doPost dengan penanganan CORS lengkap.
 * 3. Fitur Full Sync (Upload & Download State) dan Individual CRUD (Tambah/Edit/Hapus Transaksi).
 * 4. Otomatis backup riwayat transaksi ke Google Sheets dengan format mata uang & tanggal rapi.
 * =========================================================================
 */

// Nama-nama Sheet / Tabel Database
var SHEET_TRANSACTIONS = 'Transactions';
var SHEET_ACCOUNTS     = 'Accounts';
var SHEET_CATEGORIES   = 'Categories';
var SHEET_MEMBERS      = 'Members';
var SHEET_BUDGETS      = 'Budgets';
var SHEET_GOALS        = 'Goals';
var SHEET_BILLS        = 'Bills';
var SHEET_SETTINGS     = 'FamilySettings';

/**
 * Handle HTTP GET Requests
 * Contoh endpoint:
 * ?action=ping
 * ?action=getFullState
 * ?action=getTransactions
 */
function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var action = params.action || 'ping';

    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Dompet Keluarga Backend Google Apps Script Aktif & Siap!',
        timestamp: new Date().toISOString(),
        version: '2.2.0'
      });
    }

    if (action === 'getFullState') {
      var state = readFullDatabase();
      return jsonResponse({
        success: true,
        data: state,
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'getTransactions') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName(SHEET_TRANSACTIONS);
      var data = sheet ? getSheetDataAsObjects(sheet) : [];
      return jsonResponse({
        success: true,
        count: data.length,
        data: data
      });
    }

    return jsonResponse({
      success: false,
      message: 'Aksi GET tidak dikenali: ' + action
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Handle HTTP POST Requests
 * Menerima payload JSON di e.postData.contents
 */
function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (err) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    var action = payload.action || 'ping';

    // 1. Inisialisasi / Buat Ulang Struktur Tabel
    if (action === 'initDatabase') {
      initDatabaseSheets(payload.defaultData);
      return jsonResponse({
        success: true,
        message: 'Semua Sheet Database berhasil diinisialisasi dengan rapi!'
      });
    }

    // 2. Full State Sync (Menyimpan seluruh database dari aplikasi frontend)
    if (action === 'syncFullState') {
      if (!payload.data) {
        return jsonResponse({ success: false, message: 'Data state kosong' });
      }
      saveFullDatabase(payload.data);
      return jsonResponse({
        success: true,
        message: 'Sinkronisasi Full State ke Google Sheets Berhasil!',
        timestamp: new Date().toISOString()
      });
    }

    // 3. Tambah Transaksi Satuan (Instant Record)
    if (action === 'addTransaction') {
      var tx = payload.transaction;
      if (!tx) {
        return jsonResponse({ success: false, message: 'Objek transaksi tidak valid' });
      }
      var added = appendSingleTransaction(tx);
      return jsonResponse({
        success: true,
        message: 'Transaksi berhasil dicatat ke Google Sheets!',
        data: added
      });
    }

    // 4. Update Saldo Akun
    if (action === 'updateAccountBalance') {
      updateAccountBalance(payload.accountId, payload.newBalance);
      return jsonResponse({
        success: true,
        message: 'Saldo akun berhasil diperbarui!'
      });
    }

    return jsonResponse({
      success: false,
      message: 'Aksi POST tidak dikenali: ' + action
    });

  } catch (error) {
    return jsonResponse({
      success: false,
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Helper untuk format response JSON dengan header CORS
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Inisialisasi Semua Sheet dan Header Kolom
 */
function initDatabaseSheets(defaultData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var schemas = [
    {
      name: SHEET_TRANSACTIONS,
      headers: ['ID', 'Tanggal', 'Tipe', 'Deskripsi', 'Jumlah (Rp)', 'Kategori ID', 'Nama Kategori', 'Akun ID', 'Nama Akun', 'Pencatat ID', 'Nama Pencatat', 'Catatan / Item', 'Foto Bukti', 'Created At'],
      bg: '#059669'
    },
    {
      name: SHEET_ACCOUNTS,
      headers: ['ID', 'Nama Akun', 'Tipe', 'Nomor Rekening', 'Pemilik ID', 'Saldo Awal', 'Warna/Gradien', 'Icon'],
      bg: '#2563eb'
    },
    {
      name: SHEET_CATEGORIES,
      headers: ['ID', 'Nama Kategori', 'Tipe', 'Icon', 'Warna', 'Is Custom'],
      bg: '#7c3aed'
    },
    {
      name: SHEET_MEMBERS,
      headers: ['ID', 'Nama', 'Peran (Role)', 'Email / Login', 'Avatar', 'Warna', 'PIN / Password Hash'],
      bg: '#ea580c'
    },
    {
      name: SHEET_BUDGETS,
      headers: ['ID', 'Kategori ID', 'Batas Anggaran (Rp)', 'Bulan', 'Tahun'],
      bg: '#0891b2'
    },
    {
      name: SHEET_GOALS,
      headers: ['ID', 'Nama Impian', 'Target (Rp)', 'Terkumpul (Rp)', 'Target Tanggal', 'Kategori', 'Icon', 'Color'],
      bg: '#db2777'
    },
    {
      name: SHEET_BILLS,
      headers: ['ID', 'Nama Tagihan', 'Jumlah (Rp)', 'Tanggal Jatuh Tempo', 'Kategori ID', 'Akun Pembayaran ID', 'Status', 'Pengingat'],
      bg: '#4f46e5'
    },
    {
      name: SHEET_SETTINGS,
      headers: ['Key', 'Value', 'Updated At'],
      bg: '#475569'
    }
  ];

  schemas.forEach(function(s) {
    var sheet = ss.getSheetByName(s.name);
    if (!sheet) {
      sheet = ss.insertSheet(s.name);
    }
    
    // Set Headers jika belum ada
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(s.headers);
      var range = sheet.getRange(1, 1, 1, s.headers.length);
      range.setBackground(s.bg);
      range.setFontColor('#ffffff');
      range.setFontWeight('bold');
      range.setFontFamily('Plus Jakarta Sans');
      sheet.setFrozenRows(1);
    }
  });

  // Hapus 'Sheet1' bawaan jika masih ada
  var defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(e){}
  }

  // Jika menyertakan defaultData, simpan langsung
  if (defaultData) {
    saveFullDatabase(defaultData);
  }
}

/**
 * Simpan Seluruh State ke Google Sheets (Full Sync)
 */
function saveFullDatabase(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Transactions
  if (data.transactions && Array.isArray(data.transactions)) {
    var txSheet = getOrInitSheet(ss, SHEET_TRANSACTIONS, [
      'ID', 'Tanggal', 'Tipe', 'Deskripsi', 'Jumlah (Rp)', 'Kategori ID', 'Nama Kategori', 'Akun ID', 'Nama Akun', 'Pencatat ID', 'Nama Pencatat', 'Catatan / Item', 'Foto Bukti', 'Created At'
    ], '#059669');
    
    clearSheetDataExceptHeader(txSheet);
    
    var rows = data.transactions.map(function(t) {
      return [
        t.id || '',
        t.date || '',
        t.type || '',
        t.description || '',
        t.amount || 0,
        t.category ? (t.category.id || t.category) : '',
        t.category ? (t.category.name || '') : '',
        t.account ? (t.account.id || t.account) : '',
        t.account ? (t.account.name || '') : '',
        t.member ? (t.member.id || t.member) : '',
        t.member ? (t.member.name || '') : '',
        t.notes || '',
        t.rawReceiptUrl || t.receiptImage || '',
        t.createdAt || new Date().toISOString()
      ];
    });
    
    if (rows.length > 0) {
      txSheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      // Format kolom jumlah sebagai mata uang
      txSheet.getRange(2, 5, rows.length, 1).setNumberFormat('#,##0');
    }
  }

  // 2. Accounts
  if (data.accounts && Array.isArray(data.accounts)) {
    var accSheet = getOrInitSheet(ss, SHEET_ACCOUNTS, [
      'ID', 'Nama Akun', 'Tipe', 'Nomor Rekening', 'Pemilik ID', 'Saldo Awal', 'Warna/Gradien', 'Icon'
    ], '#2563eb');
    clearSheetDataExceptHeader(accSheet);
    var accRows = data.accounts.map(function(a) {
      return [a.id || '', a.name || '', a.type || '', a.accountNumber || '', a.ownerId || '', a.initialBalance || 0, a.color || '', a.icon || ''];
    });
    if (accRows.length > 0) {
      accSheet.getRange(2, 1, accRows.length, accRows[0].length).setValues(accRows);
      accSheet.getRange(2, 6, accRows.length, 1).setNumberFormat('#,##0');
    }
  }

  // 3. Categories
  if (data.categories && Array.isArray(data.categories)) {
    var catSheet = getOrInitSheet(ss, SHEET_CATEGORIES, [
      'ID', 'Nama Kategori', 'Tipe', 'Icon', 'Warna', 'Is Custom'
    ], '#7c3aed');
    clearSheetDataExceptHeader(catSheet);
    var catRows = data.categories.map(function(c) {
      return [c.id || '', c.name || '', c.type || '', c.icon || '', c.color || '', c.isCustom ? 'TRUE' : 'FALSE'];
    });
    if (catRows.length > 0) {
      catSheet.getRange(2, 1, catRows.length, catRows[0].length).setValues(catRows);
    }
  }

  // 4. Members
  if (data.members && Array.isArray(data.members)) {
    var memSheet = getOrInitSheet(ss, SHEET_MEMBERS, [
      'ID', 'Nama', 'Peran (Role)', 'Email / Login', 'Avatar', 'Warna', 'PIN / Password Hash'
    ], '#ea580c');
    clearSheetDataExceptHeader(memSheet);
    var memRows = data.members.map(function(m) {
      return [m.id || '', m.name || '', m.role || '', m.email || '', m.avatarText || '', m.color || '', m.pin || ''];
    });
    if (memRows.length > 0) {
      memSheet.getRange(2, 1, memRows.length, memRows[0].length).setValues(memRows);
    }
  }

  // 5. Budgets
  if (data.budgets && Array.isArray(data.budgets)) {
    var budSheet = getOrInitSheet(ss, SHEET_BUDGETS, [
      'ID', 'Kategori ID', 'Batas Anggaran (Rp)', 'Bulan', 'Tahun'
    ], '#0891b2');
    clearSheetDataExceptHeader(budSheet);
    var budRows = data.budgets.map(function(b) {
      return [b.id || '', b.categoryId || '', b.limit || 0, b.month || 9, b.year || 2026];
    });
    if (budRows.length > 0) {
      budSheet.getRange(2, 1, budRows.length, budRows[0].length).setValues(budRows);
      budSheet.getRange(2, 3, budRows.length, 1).setNumberFormat('#,##0');
    }
  }

  // 6. Goals
  if (data.goals && Array.isArray(data.goals)) {
    var goalSheet = getOrInitSheet(ss, SHEET_GOALS, [
      'ID', 'Nama Impian', 'Target (Rp)', 'Terkumpul (Rp)', 'Target Tanggal', 'Kategori', 'Icon', 'Color'
    ], '#db2777');
    clearSheetDataExceptHeader(goalSheet);
    var goalRows = data.goals.map(function(g) {
      return [g.id || '', g.name || '', g.targetAmount || 0, g.currentAmount || 0, g.targetDate || '', g.category || '', g.icon || '', g.color || ''];
    });
    if (goalRows.length > 0) {
      goalSheet.getRange(2, 1, goalRows.length, goalRows[0].length).setValues(goalRows);
      goalSheet.getRange(2, 3, goalRows.length, 2).setNumberFormat('#,##0');
    }
  }

  // 7. Bills
  if (data.recurringBills && Array.isArray(data.recurringBills)) {
    var billSheet = getOrInitSheet(ss, SHEET_BILLS, [
      'ID', 'Nama Tagihan', 'Jumlah (Rp)', 'Tanggal Jatuh Tempo', 'Kategori ID', 'Akun Pembayaran ID', 'Status', 'Pengingat'
    ], '#4f46e5');
    clearSheetDataExceptHeader(billSheet);
    var billRows = data.recurringBills.map(function(r) {
      return [r.id || '', r.name || '', r.amount || 0, r.dueDate || '', r.categoryId || '', r.accountId || '', r.status || '', r.reminderDays || 3];
    });
    if (billRows.length > 0) {
      billSheet.getRange(2, 1, billRows.length, billRows[0].length).setValues(billRows);
      billSheet.getRange(2, 3, billRows.length, 1).setNumberFormat('#,##0');
    }
  }
}

/**
 * Baca Seluruh Data dari Google Sheets untuk Dikirim ke Frontend
 */
function readFullDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var txSheet   = ss.getSheetByName(SHEET_TRANSACTIONS);
  var accSheet  = ss.getSheetByName(SHEET_ACCOUNTS);
  var catSheet  = ss.getSheetByName(SHEET_CATEGORIES);
  var memSheet  = ss.getSheetByName(SHEET_MEMBERS);
  var budSheet  = ss.getSheetByName(SHEET_BUDGETS);
  var goalSheet = ss.getSheetByName(SHEET_GOALS);
  var billSheet = ss.getSheetByName(SHEET_BILLS);

  var transactions = txSheet ? parseTransactionsFromSheet(txSheet) : [];
  var accounts     = accSheet ? parseAccountsFromSheet(accSheet) : [];
  var categories   = catSheet ? parseCategoriesFromSheet(catSheet) : [];
  var members      = memSheet ? parseMembersFromSheet(memSheet) : [];
  var budgets      = budSheet ? parseBudgetsFromSheet(budSheet) : [];
  var goals        = goalSheet ? parseGoalsFromSheet(goalSheet) : [];
  var recurringBills = billSheet ? parseBillsFromSheet(billSheet) : [];

  return {
    transactions: transactions,
    accounts: accounts,
    categories: categories,
    members: members,
    budgets: budgets,
    goals: goals,
    recurringBills: recurringBills,
    syncedAt: new Date().toISOString()
  };
}

/**
 * Tambah single transaksi ke baris paling bawah sheet Transactions
 */
function appendSingleTransaction(t) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrInitSheet(ss, SHEET_TRANSACTIONS, [
    'ID', 'Tanggal', 'Tipe', 'Deskripsi', 'Jumlah (Rp)', 'Kategori ID', 'Nama Kategori', 'Akun ID', 'Nama Akun', 'Pencatat ID', 'Nama Pencatat', 'Catatan / Item', 'Foto Bukti', 'Created At'
  ], '#059669');

  var row = [
    t.id || ('tx_' + Date.now()),
    t.date || new Date().toISOString().split('T')[0],
    t.type || 'expense',
    t.description || '',
    t.amount || 0,
    t.category ? (t.category.id || t.category) : '',
    t.category ? (t.category.name || '') : '',
    t.account ? (t.account.id || t.account) : '',
    t.account ? (t.account.name || '') : '',
    t.member ? (t.member.id || t.member) : '',
    t.member ? (t.member.name || '') : '',
    t.notes || '',
    t.rawReceiptUrl || t.receiptImage || '',
    t.createdAt || new Date().toISOString()
  ];

  sheet.appendRow(row);
  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 5).setNumberFormat('#,##0');
  
  return { id: row[0], success: true };
}

// =========================================================================
// HELPER PARSERS
// =========================================================================

function getOrInitSheet(ss, name, headers, bg) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setBackground(bg || '#059669');
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function clearSheetDataExceptHeader(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow > 1 && lastCol > 0) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }
}

function parseTransactionsFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      date: formatSheetDate(r[1]),
      type: String(r[2] || 'expense'),
      description: String(r[3] || ''),
      amount: Number(r[4]) || 0,
      category: { id: String(r[5] || ''), name: String(r[6] || '') },
      account: { id: String(r[7] || ''), name: String(r[8] || '') },
      member: { id: String(r[9] || ''), name: String(r[10] || '') },
      notes: String(r[11] || ''),
      rawReceiptUrl: String(r[12] || ''),
      createdAt: String(r[13] || '')
    };
  });
}

function parseAccountsFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      type: String(r[2] || 'bank'),
      accountNumber: String(r[3] || ''),
      ownerId: String(r[4] || ''),
      initialBalance: Number(r[5]) || 0,
      color: String(r[6] || ''),
      icon: String(r[7] || '')
    };
  });
}

function parseCategoriesFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      type: String(r[2] || 'expense'),
      icon: String(r[3] || ''),
      color: String(r[4] || ''),
      isCustom: String(r[5]).toUpperCase() === 'TRUE'
    };
  });
}

function parseMembersFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      role: String(r[2] || 'member'),
      email: String(r[3] || ''),
      avatarText: String(r[4] || ''),
      color: String(r[5] || ''),
      pin: String(r[6] || '')
    };
  });
}

function parseBudgetsFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      categoryId: String(r[1] || ''),
      limit: Number(r[2]) || 0,
      month: Number(r[3]) || 9,
      year: Number(r[4]) || 2026
    };
  });
}

function parseGoalsFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      targetAmount: Number(r[2]) || 0,
      currentAmount: Number(r[3]) || 0,
      targetDate: formatSheetDate(r[4]),
      category: String(r[5] || ''),
      icon: String(r[6] || ''),
      color: String(r[7] || '')
    };
  });
}

function parseBillsFromSheet(sheet) {
  var data = getSheetValues(sheet);
  return data.map(function(r) {
    return {
      id: String(r[0] || ''),
      name: String(r[1] || ''),
      amount: Number(r[2]) || 0,
      dueDate: formatSheetDate(r[3]),
      categoryId: String(r[4] || ''),
      accountId: String(r[5] || ''),
      status: String(r[6] || 'unpaid'),
      reminderDays: Number(r[7]) || 3
    };
  });
}

function getSheetValues(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];
  return sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
}

function formatSheetDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd');
  }
  return String(val);
}
