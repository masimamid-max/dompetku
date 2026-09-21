/**
 * AI Natural Language Financial Parser for Indonesian Text
 */
import { appState } from '../state.js';

export function parseNaturalLanguageTransaction(text) {
  if (!text || !text.trim()) {
    return null;
  }

  const cleanText = text.trim();
  const lower = cleanText.toLowerCase();

  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const categories = appState.categories.filter(c => !c.isArchived);
  const members = appState.members;

  // 1. Detect Type (Income, Expense, Transfer)
  let type = 'expense';
  if (lower.includes('transfer') || lower.includes('pindah') || lower.includes('kirim ke')) {
    type = 'transfer';
  } else if (
    lower.includes('gaji') || 
    lower.includes('pendapatan') || 
    lower.includes('terima') || 
    lower.includes('dapat uang') || 
    lower.includes('bonus') ||
    lower.includes('masuk') ||
    lower.includes('hasil jualan') ||
    lower.includes('freelance') ||
    lower.includes('omset')
  ) {
    type = 'income';
  }

  // 2. Extract Amount
  let amount = 0;
  // Match "1.5jt", "2,5 juta", "2jt", "500rb", "50 ribu", "45k", "Rp 45.000", "45000"
  const jtMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:jt|juta)/);
  const rbMatch = lower.match(/(\d+(?:[.,]\d+)?)\s*(?:rb|ribu|k\b)/);
  const rawNumMatch = lower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d{4,9})/);

  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000000);
  } else if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(',', '.'));
    amount = Math.round(val * 1000);
  } else if (rawNumMatch) {
    amount = parseInt(rawNumMatch[1].replace(/\./g, ''), 10);
  }

  // 3. Match Account(s)
  let detectedAccountId = accounts[0] ? accounts[0].id : '';
  let detectedTargetAccountId = accounts[1] ? accounts[1].id : '';

  accounts.forEach(acc => {
    const accLower = acc.name.toLowerCase();
    const typeLower = acc.type.toLowerCase();

    if (accLower.includes('bca') && lower.includes('bca')) detectedAccountId = acc.id;
    else if (accLower.includes('mandiri') && lower.includes('mandiri')) detectedAccountId = acc.id;
    else if (accLower.includes('gopay') && (lower.includes('gopay') || lower.includes('shopee') || lower.includes('ovo'))) detectedAccountId = acc.id;
    else if ((accLower.includes('tunai') || accLower.includes('cash') || accLower.includes('dompet')) && (lower.includes('tunai') || lower.includes('cash') || lower.includes('dompet'))) detectedAccountId = acc.id;
    else if (accLower.includes('tabungan') && lower.includes('tabungan')) detectedAccountId = acc.id;
  });

  if (type === 'transfer') {
    // Check if target account mentioned
    accounts.forEach(acc => {
      const accLower = acc.name.toLowerCase();
      if (acc.id !== detectedAccountId) {
        if (lower.includes('ke ' + accLower) || (accLower.includes('mandiri') && lower.includes('ke mandiri')) || (accLower.includes('tabungan') && lower.includes('ke tabungan'))) {
          detectedTargetAccountId = acc.id;
        }
      }
    });
  }

  // 4. Match Member
  let detectedMemberId = appState.currentUser.id;
  members.forEach(m => {
    const mName = m.name.toLowerCase();
    if (lower.includes(mName) || 
       (m.role === 'owner' && (lower.includes('ayah') || lower.includes('bapak') || lower.includes('budi'))) ||
       (m.role === 'admin' && (lower.includes('ibu') || lower.includes('mama') || lower.includes('siti'))) ||
       (m.role === 'member' && (lower.includes('anak') || lower.includes('rafi')))) {
      detectedMemberId = m.id;
    }
  });

  // 5. Match Category
  let detectedCategoryId = '';
  let detectedSubcategory = '';

  const availableCategories = categories.filter(c => c.type === (type === 'income' ? 'income' : 'expense'));

  // Keyword dictionary for smart category matching
  const categoryKeywords = {
    'makan': 'cat-exp-1',
    'kuliner': 'cat-exp-1',
    'soto': 'cat-exp-1',
    'bakso': 'cat-exp-1',
    'resto': 'cat-exp-1',
    'kopi': 'cat-exp-1',
    'pasar': 'cat-exp-1',
    'sayur': 'cat-exp-1',
    'daging': 'cat-exp-1',
    'snack': 'cat-exp-1',
    'minum': 'cat-exp-1',
    'galon': 'cat-exp-1',

    'belanja': 'cat-exp-2',
    'sabun': 'cat-exp-2',
    'dapur': 'cat-exp-2',
    'shampoo': 'cat-exp-2',
    'supermarket': 'cat-exp-2',
    'perabot': 'cat-exp-2',

    'listrik': 'cat-exp-3',
    'pln': 'cat-exp-3',
    'token': 'cat-exp-3',
    'wifi': 'cat-exp-3',
    'indihome': 'cat-exp-3',
    'pulsa': 'cat-exp-3',
    'kuota': 'cat-exp-3',
    'pdam': 'cat-exp-3',
    'air': 'cat-exp-3',
    'ipl': 'cat-exp-3',
    'tagihan': 'cat-exp-3',

    'bensin': 'cat-exp-4',
    'pertamax': 'cat-exp-4',
    'pertalite': 'cat-exp-4',
    'toll': 'cat-exp-4',
    'tol': 'cat-exp-4',
    'parkir': 'cat-exp-4',
    'ojek': 'cat-exp-4',
    'gojek': 'cat-exp-4',
    'grab': 'cat-exp-4',
    'servis': 'cat-exp-4',
    'mobil': 'cat-exp-4',
    'motor': 'cat-exp-4',

    'sekolah': 'cat-exp-5',
    'spp': 'cat-exp-5',
    'buku': 'cat-exp-5',
    'les': 'cat-exp-5',
    'kursus': 'cat-exp-5',
    'seragam': 'cat-exp-5',
    'ujian': 'cat-exp-5',

    'obat': 'cat-exp-6',
    'dokter': 'cat-exp-6',
    'klinik': 'cat-exp-6',
    'apotek': 'cat-exp-6',
    'vitamin': 'cat-exp-6',
    'bpjs': 'cat-exp-6',
    'gigi': 'cat-exp-6',

    'bioskop': 'cat-exp-7',
    'nonton': 'cat-exp-7',
    'jalan-jalan': 'cat-exp-7',
    'liburan': 'cat-exp-7',
    'streaming': 'cat-exp-7',
    'game': 'cat-exp-7',

    'zakat': 'cat-exp-8',
    'sedekah': 'cat-exp-8',
    'infaq': 'cat-exp-8',
    'sumbangan': 'cat-exp-8',

    'gaji': 'cat-inc-1',
    'tunjangan': 'cat-inc-1',
    'freelance': 'cat-inc-2',
    'proyek': 'cat-inc-2',
    'jualan': 'cat-inc-2',
    'katering': 'cat-inc-2',
    'investasi': 'cat-inc-3',
    'dividen': 'cat-inc-3',
    'bunga': 'cat-inc-3'
  };

  for (const [kw, catId] of Object.entries(categoryKeywords)) {
    if (lower.includes(kw)) {
      const match = categories.find(c => c.id === catId);
      if (match) {
        detectedCategoryId = match.id;
        break;
      }
    }
  }

  // Fallback category
  if (!detectedCategoryId && availableCategories.length > 0) {
    detectedCategoryId = availableCategories[0].id;
  }

  // 6. Generate Clean Description
  let description = cleanText
    .replace(/(?:sebesar|nominal|seharga|total|bayar pakai|lewat|dari akun|via|ke akun)\s+[^\s]+/gi, '')
    .replace(/\b(?:rp\.?\s*\d+[\d.,]*|\d+\s*(?:jt|juta|rb|ribu|k))\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!description || description.length < 3) {
    description = cleanText;
  }

  // Capitalize first letter
  description = description.charAt(0).toUpperCase() + description.slice(1);

  return {
    rawPrompt: cleanText,
    type,
    amount: amount || 50000,
    description,
    categoryId: type !== 'transfer' ? detectedCategoryId : undefined,
    subcategory: detectedSubcategory || undefined,
    accountId: detectedAccountId,
    targetAccountId: type === 'transfer' ? detectedTargetAccountId : undefined,
    memberId: detectedMemberId,
    date: new Date().toISOString().split('T')[0],
    confidenceScore: amount > 0 ? 0.95 : 0.7
  };
}
