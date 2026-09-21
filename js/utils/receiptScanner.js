/**
 * Smart Receipt OCR & AI Scanner Utility
 * Analyzes receipt / invoice images and extracts structured financial data
 */
import { appState } from '../state.js';

export const SAMPLE_RECEIPTS = [
  {
    id: 'sample_supermarket',
    name: '🛒 Superindo Supermarket',
    badge: 'Belanja Bulanan',
    merchant: 'SUPERINDO CABANG BINTARO',
    category: 'cat_groceries',
    amount: 184500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc_bca',
    items: [
      { name: 'Minyak Goreng Sania 2L', qty: 1, price: 34500 },
      { name: 'Beras Premium Ramos 5kg', qty: 1, price: 74000 },
      { name: 'Telur Ayam Negeri 1kg', qty: 1, price: 31000 },
      { name: 'Susu UHT Ultra Milk 1L', qty: 2, price: 22500 }
    ],
    previewGradient: 'linear-gradient(135deg, #10b981, #059669)'
  },
  {
    id: 'sample_minimarket',
    name: '🏪 Indomaret / Alfamart',
    badge: 'Kebutuhan Harian',
    merchant: 'INDOMARET POINT JKT',
    category: 'cat_food',
    amount: 58500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc_gopay',
    items: [
      { name: 'Roti Gandum Sari Roti', qty: 1, price: 21500 },
      { name: 'Kopi Kenangan Ready-to-drink', qty: 2, price: 19000 },
      { name: 'Air Mineral Aqua 600ml', qty: 3, price: 18000 }
    ],
    previewGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
  },
  {
    id: 'sample_spbu',
    name: '⛽ SPBU Pertamina',
    badge: 'Bahan Bakar',
    merchant: 'SPBU 34-12345 PERTAMINA',
    category: 'cat_transport',
    amount: 150000,
    date: new Date().toISOString().split('T')[0],
    account: 'acc_cash',
    items: [
      { name: 'Pertamax (92) - 11.58 Liter', qty: 1, price: 150000 }
    ],
    previewGradient: 'linear-gradient(135deg, #ef4444, #b91c1c)'
  },
  {
    id: 'sample_resto',
    name: '🍽️ Restoran & Kuliner',
    badge: 'Makan Keluarga',
    merchant: 'WARUNG PADANG SEDAP',
    category: 'cat_food',
    amount: 112000,
    date: new Date().toISOString().split('T')[0],
    account: 'acc_qris',
    items: [
      { name: 'Nasi Rendang Daging', qty: 2, price: 56000 },
      { name: 'Ayam Pop Sambalado', qty: 1, price: 24000 },
      { name: 'Es Teh Manis Jumbo', qty: 3, price: 32000 }
    ],
    previewGradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
  },
  {
    id: 'sample_apotek',
    name: '💊 Apotek & Obat',
    badge: 'Kesehatan',
    merchant: 'APOTEK KIMIA FARMA',
    category: 'cat_health',
    amount: 87500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc_mandiri',
    items: [
      { name: 'Enervon C Multivitamin 30s', qty: 1, price: 48500 },
      { name: 'Panadol Extra Paracetamol', qty: 2, price: 26000 },
      { name: 'Minyak Kayu Putih 60ml', qty: 1, price: 13000 }
    ],
    previewGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
  }
];

/**
 * Perform simulated Intelligent AI OCR on a receipt dataUrl or file name
 */
export async function analyzeReceiptImage(dataUrl, fileName = '') {
  // Simulate intelligent vision analysis network latency (750ms)
  await new Promise(resolve => setTimeout(resolve, 750));

  const lowerName = (fileName || '').toLowerCase();
  let matchedPreset = SAMPLE_RECEIPTS[0];

  if (lowerName.includes('bensin') || lowerName.includes('spbu') || lowerName.includes('pertamina') || lowerName.includes('shell')) {
    matchedPreset = SAMPLE_RECEIPTS[2];
  } else if (lowerName.includes('resto') || lowerName.includes('makan') || lowerName.includes('cafe') || lowerName.includes('kopi') || lowerName.includes('padang')) {
    matchedPreset = SAMPLE_RECEIPTS[3];
  } else if (lowerName.includes('obat') || lowerName.includes('apotek') || lowerName.includes('farma') || lowerName.includes('sehat')) {
    matchedPreset = SAMPLE_RECEIPTS[4];
  } else if (lowerName.includes('indo') || lowerName.includes('alfa') || lowerName.includes('mart')) {
    matchedPreset = SAMPLE_RECEIPTS[1];
  } else {
    // Pick randomly if general file or use Superindo
    matchedPreset = SAMPLE_RECEIPTS[Math.floor(Math.random() * SAMPLE_RECEIPTS.length)];
  }

  // Find valid category & account from state
  const categories = appState.categories;
  const accounts = appState.getAccountsWithBalances();
  
  const matchedCat = categories.find(c => c.id === matchedPreset.category) || categories[0];
  const matchedAcc = accounts.find(a => a.id === matchedPreset.account) || accounts[0];

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    merchant: matchedPreset.merchant,
    date: dateStr,
    time: timeStr,
    amount: matchedPreset.amount,
    items: matchedPreset.items,
    category: matchedCat,
    account: matchedAcc,
    member: appState.currentUser,
    confidenceScore: 98.4,
    description: `Belanja di ${matchedPreset.merchant}`,
    notes: `Rincian item: ${matchedPreset.items.map(i => `${i.name} (x${i.qty})`).join(', ')}`,
    rawReceiptUrl: dataUrl
  };
}

export { analyzeReceiptImage };

