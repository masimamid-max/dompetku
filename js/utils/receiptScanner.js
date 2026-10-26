/**
 * ============================================================================
 * REAL SMART RECEIPT OCR & AI SCANNER ENGINE (v3.18.7)
 * ============================================================================
 * 1. Membaca teks asli dari foto struk / nota menggunakan Tesseract.js (Client OCR).
 * 2. Ekstraksi otomatis: Nama Toko/Merchant, Total Pembayaran, Tanggal, Item.
 * 3. Klasifikasi Kategori Finansial Cerdas Berbasis Kamus Kata Kunci Indonesia.
 * 4. Fallback transparan & aman jika foto buram / offline.
 * ============================================================================
 */
import { appState } from '../state.js';

export const SAMPLE_RECEIPTS = [
  {
    id: 'sample_supermarket',
    name: '🛒 Superindo Supermarket',
    badge: 'Belanja Bulanan',
    merchant: 'SUPERINDO CABANG BINTARO',
    category: 'cat-exp-2', // Rumah Tangga & Belanja
    amount: 184500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc-2', // BCA
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
    category: 'cat-exp-2', // Rumah Tangga & Belanja
    amount: 58500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc-4', // GoPay
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
    category: 'cat-exp-4', // Transportasi
    amount: 150000,
    date: new Date().toISOString().split('T')[0],
    account: 'acc-1', // Kas Tunai
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
    category: 'cat-exp-1', // Makanan & Kuliner
    amount: 112000,
    date: new Date().toISOString().split('T')[0],
    account: 'acc-4', // GoPay/QRIS
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
    category: 'cat-exp-6', // Kesehatan & Medis
    amount: 87500,
    date: new Date().toISOString().split('T')[0],
    account: 'acc-2', // BCA
    items: [
      { name: 'Enervon C Multivitamin 30s', qty: 1, price: 48500 },
      { name: 'Panadol Extra Paracetamol', qty: 2, price: 26000 },
      { name: 'Minyak Kayu Putih 60ml', qty: 1, price: 13000 }
    ],
    previewGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)'
  }
];

// Indonesian Keyword Dictionary for Smart Receipt Categorization
const CATEGORY_RULES = [
  {
    id: 'cat-exp-1',
    name: 'Makanan & Kuliner',
    keywords: [
      'makan', 'minum', 'resto', 'restaurant', 'cafe', 'kafe', 'kopi', 'coffee', 'teh', 'tea',
      'ayam', 'nasi', 'soto', 'bakso', 'mie', 'burger', 'pizza', 'roti', 'bakery', 'daging',
      'sayur', 'ikan', 'seafood', 'snack', 'biskuit', 'chiki', 'kuliner', 'kitchen', 'bistro',
      'warung', 'warkop', 'gacoan', 'kfc', 'mcdonald', 'mcd', 'solaria', 'hokben', 'richeese',
      'dcrepes', 'jco', 'chatime', 'starbucks', 'kenangan', 'janji jiwa', 'fore', 'mixue',
      'haus', 'teguk', 'padang', 'sederhana', 'ampera', 'steak', 'donat', 'cake', 'piring',
      'sambal', 'lele', 'bebek', 'gorengan', 'martabak', 'pempek', 'siomay', 'dimsum', 'food'
    ],
    weight: 1.2
  },
  {
    id: 'cat-exp-2',
    name: 'Rumah Tangga & Belanja',
    keywords: [
      'superindo', 'indomaret', 'alfamart', 'alfamidi', 'hypermart', 'transmart', 'lotte',
      'swalayan', 'minimarket', 'supermarket', 'mart', 'sabun', 'shampoo', 'deterjen', 'pewangi',
      'rinso', 'molto', 'daia', 'soklin', 'downy', 'tisu', 'tissue', 'odol', 'pepsodent',
      'sikat gigi', 'minyak goreng', 'beras', 'gula', 'garam', 'bumbu', 'dapur', 'perabot',
      'piring', 'wajan', 'panci', 'hardware', 'diy', 'miniso', 'informa', 'ace', 'mr diy',
      'uniqlo', 'zara', 'h&m', 'pakaian', 'baju', 'celana', 'kaos', 'belanja', 'toko kelontong'
    ],
    weight: 1.0
  },
  {
    id: 'cat-exp-3',
    name: 'Tagihan & Utilitas',
    keywords: [
      'pln', 'listrik', 'token', 'pdam', 'air', 'wifi', 'indihome', 'biznet', 'first media',
      'myrepublic', 'pulsa', 'kuota', 'telkomsel', 'indosat', 'xl', 'tri', 'smartfren',
      'tagihan', 'ipl', 'iuran', 'bpjs', 'pajak', 'pbb', 'retribusi', 'keamanan', 'kebersihan'
    ],
    weight: 1.3
  },
  {
    id: 'cat-exp-4',
    name: 'Transportasi',
    keywords: [
      'spbu', 'pertamina', 'shell', 'bp akr', 'vivo', 'pertamax', 'pertalite', 'solar',
      'dexlite', 'bensin', 'bbm', 'liter', 'parkir', 'parking', 'toll', 'etoll', 'e-toll',
      'tarif tol', 'jasa marga', 'gojek', 'gocar', 'goride', 'grab', 'grabcar', 'ojek',
      'taxi', 'bluebird', 'servis', 'bengkel', 'oli', 'ban', 'tambal', 'cuci mobil', 'cuci motor'
    ],
    weight: 1.3
  },
  {
    id: 'cat-exp-5',
    name: 'Pendidikan Anak',
    keywords: [
      'sekolah', 'spp', 'buku', 'gramedia', 'alat tulis', 'pensil', 'pulpen', 'kursus',
      'les', 'kumon', 'seragam', 'biaya ujian', 'kuliah', 'kampus', 'pendidikan', 'formulir'
    ],
    weight: 1.3
  },
  {
    id: 'cat-exp-6',
    name: 'Kesehatan & Medis',
    keywords: [
      'apotek', 'apotik', 'pharmacy', 'kimia farma', 'k24', 'k-24', 'century', 'guardian',
      'watsons', 'obat', 'paracetamol', 'panadol', 'bodrex', 'vitamin', 'enervon', 'stimuno',
      'imboost', 'sanmol', 'betadine', 'plester', 'masker', 'dokter', 'klinik', 'rumah sakit',
      'rs', 'puskesmas', 'laboratorium', 'prodia', 'resep', 'medis', 'tensi', 'termometer'
    ],
    weight: 1.3
  },
  {
    id: 'cat-exp-7',
    name: 'Hiburan & Liburan',
    keywords: [
      'bioskop', 'cinema', 'xxi', 'cgv', 'cinepolis', 'tiket', 'taman', 'wisata', 'ancol',
      'dufan', 'kebun binatang', 'museum', 'hotel', 'resort', 'villa', 'staycation',
      'tiket.com', 'traveloka', 'netflix', 'spotify', 'game', 'playstation', 'karaoke'
    ],
    weight: 1.2
  },
  {
    id: 'cat-exp-8',
    name: 'Donasi & Sosial',
    keywords: [
      'zakat', 'sedekah', 'infaq', 'donasi', 'kitabisa', 'baznas', 'dompet dhuafa',
      'masjid', 'musholla', 'panti', 'yayasan', 'amal', 'qurban', 'kurban'
    ],
    weight: 1.3
  }
];

// Known Brand Signatures for Instant Identification
const KNOWN_MERCHANTS = [
  { pattern: /indomaret/i, name: 'Indomaret', catId: 'cat-exp-2' },
  { pattern: /alfamart/i, name: 'Alfamart', catId: 'cat-exp-2' },
  { pattern: /alfamidi/i, name: 'Alfamidi', catId: 'cat-exp-2' },
  { pattern: /super\s*indo/i, name: 'Super Indo Supermarket', catId: 'cat-exp-2' },
  { pattern: /hypermart/i, name: 'Hypermart', catId: 'cat-exp-2' },
  { pattern: /transmart/i, name: 'Transmart', catId: 'cat-exp-2' },
  { pattern: /pertamina|spbu/i, name: 'SPBU Pertamina', catId: 'cat-exp-4' },
  { pattern: /shell/i, name: 'SPBU Shell', catId: 'cat-exp-4' },
  { pattern: /kfc/i, name: 'KFC Restaurant', catId: 'cat-exp-1' },
  { pattern: /mcdonald|mcd/i, name: "McDonald's", catId: 'cat-exp-1' },
  { pattern: /pizza\s*hut/i, name: 'Pizza Hut', catId: 'cat-exp-1' },
  { pattern: /burger\s*king/i, name: 'Burger King', catId: 'cat-exp-1' },
  { pattern: /solaria/i, name: 'Solaria Resto', catId: 'cat-exp-1' },
  { pattern: /hokben/i, name: 'HokBen Bento', catId: 'cat-exp-1' },
  { pattern: /mie\s*gacoan/i, name: 'Mie Gacoan', catId: 'cat-exp-1' },
  { pattern: /starbucks/i, name: 'Starbucks Coffee', catId: 'cat-exp-1' },
  { pattern: /kopi\s*kenangan/i, name: 'Kopi Kenangan', catId: 'cat-exp-1' },
  { pattern: /janji\s*jiwa/i, name: 'Kopi Janji Jiwa', catId: 'cat-exp-1' },
  { pattern: /fore\s*coffee/i, name: 'Fore Coffee', catId: 'cat-exp-1' },
  { pattern: /kimia\s*farma/i, name: 'Apotek Kimia Farma', catId: 'cat-exp-6' },
  { pattern: /k-?24|k\s*24/i, name: 'Apotek K-24', catId: 'cat-exp-6' },
  { pattern: /guardian/i, name: 'Guardian Pharmacy', catId: 'cat-exp-6' },
  { pattern: /watsons/i, name: 'Watsons', catId: 'cat-exp-6' },
  { pattern: /century/i, name: 'Apotek Century', catId: 'cat-exp-6' },
  { pattern: /cinema\s*xxi|xxi/i, name: 'Cinema XXI', catId: 'cat-exp-7' },
  { pattern: /cgv/i, name: 'CGV Cinemas', catId: 'cat-exp-7' },
  { pattern: /gramedia/i, name: 'Toko Buku Gramedia', catId: 'cat-exp-5' },
  { pattern: /pln/i, name: 'Tagihan Listrik PLN', catId: 'cat-exp-3' }
];

let tesseractLoadingPromise = null;

/**
 * Memuat library Tesseract OCR dari CDN secara dinamis
 */
function loadTesseract() {
  if (typeof window !== 'undefined' && window.Tesseract) {
    return Promise.resolve(window.Tesseract);
  }
  if (tesseractLoadingPromise) return tesseractLoadingPromise;

  tesseractLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
    script.async = true;
    script.onload = () => {
      resolve(window.Tesseract);
    };
    script.onerror = (err) => {
      console.warn('Gagal memuat Tesseract dari CDN:', err);
      reject(err);
    };
    document.head.appendChild(script);
  });

  return tesseractLoadingPromise;
}

/**
 * Optimasi gambar struk di canvas (Grayscale & Contrast Boost) untuk hasil OCR maksimal
 */
function preprocessImage(dataUrl, maxWidth = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Gambar dasar
      ctx.drawImage(img, 0, 0, width, height);

      // Tingkatkan kontras untuk teks struk
      try {
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
          // Grayscale luminance
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
          // Kontras biner lembut
          const contrasted = gray > 140 ? Math.min(255, gray * 1.15) : Math.max(0, gray * 0.85);
          data[i] = contrasted;
          data[i + 1] = contrasted;
          data[i + 2] = contrasted;
        }
        ctx.putImageData(imgData, 0, 0);
      } catch (_) {}

      resolve(canvas);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Mengekstrak teks dari foto struk menggunakan mesin OCR
 */
async function performOCR(dataUrl, onProgress) {
  try {
    if (onProgress) onProgress('Memuat mesin OCR AI...', 15);
    const Tesseract = await loadTesseract();

    if (onProgress) onProgress('Mengoptimalkan kualitas gambar struk...', 30);
    const preprocessedCanvas = await preprocessImage(dataUrl);

    if (onProgress) onProgress('Membaca tulisan pada struk belanja...', 45);

    const result = await Tesseract.recognize(preprocessedCanvas, 'ind+eng', {
      logger: (m) => {
        if (m.status === 'recognizing text' && onProgress) {
          const pct = 45 + Math.round((m.progress || 0) * 45);
          onProgress(`Membaca karakter teks (${Math.min(90, pct)}%)...`, pct);
        }
      }
    });

    return result?.data?.text || '';
  } catch (err) {
    console.warn('OCR processing notice (fallback triggered):', err);
    return '';
  }
}

/**
 * Engine Utama: Parse Teks Struk & Klasifikasikan Data Finansial Secara Cerdas
 */
export function parseReceiptText(rawText, fileName = '') {
  const text = (rawText || '').replace(/\r/g, '');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const lowerText = text.toLowerCase();
  const lowerFile = (fileName || '').toLowerCase();

  // 1. Deteksi Nama Toko / Merchant
  let detectedMerchant = '';
  let merchantCatId = '';

  for (const km of KNOWN_MERCHANTS) {
    if (km.pattern.test(text) || km.pattern.test(fileName)) {
      detectedMerchant = km.name;
      merchantCatId = km.catId;
      break;
    }
  }

  // Jika belum cocok dengan brand terkenal, ambil baris pertama yang bermakna
  if (!detectedMerchant) {
    for (let i = 0; i < Math.min(4, lines.length); i++) {
      const candidate = lines[i].replace(/[^a-zA-Z0-9\s.,&'-]/g, '').trim();
      // Lewati jika hanya angka, tanggal, atau nomor telepon
      if (candidate.length >= 3 && !/^\d+$/.test(candidate) && !/\d{2}[\/-]\d{2}/.test(candidate)) {
        detectedMerchant = candidate;
        break;
      }
    }
  }

  if (!detectedMerchant) {
    detectedMerchant = 'Struk Pembelian';
  }

  // 2. Ekstraksi Total Nominal Pembayaran
  let detectedAmount = 0;
  const amountCandidates = [];

  // Cari baris yang mengandung kata kunci total
  lines.forEach((line) => {
    const lLower = line.toLowerCase();
    const isTotalLine = lLower.includes('total') || lLower.includes('grand') || lLower.includes('jumlah') || 
                        lLower.includes('bayar') || lLower.includes('tunai') || lLower.includes('cash') ||
                        lLower.includes('subtotal') || lLower.includes('tagihan');

    // Regex ekstraksi angka nominal Rupiah (misal: 184.500, 184,500, 50000, Rp 45.000)
    const matches = line.match(/(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,9})/gi);
    if (matches) {
      matches.forEach(m => {
        const clean = m.replace(/[^0-9]/g, '');
        const val = parseInt(clean, 10);
        // Validasi batas wajar transaksi keluarga (Rp 500 s/d Rp 100.000.000)
        if (val >= 500 && val <= 100000000) {
          amountCandidates.push({
            value: val,
            priority: isTotalLine ? 10 : 1,
            line: line
          });
        }
      });
    }
  });

  if (amountCandidates.length > 0) {
    // Sortir: Prioritas baris TOTAL tertinggi, kemudian nominal terbesar
    amountCandidates.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.value - a.value;
    });
    detectedAmount = amountCandidates[0].value;
  }

  // 3. Ekstraksi Tanggal Transaksi
  let detectedDate = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/(?:\b(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})\b)|(?:\b(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})\b)/);
  if (dateMatch) {
    try {
      if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
        let day = parseInt(dateMatch[1], 10);
        let month = parseInt(dateMatch[2], 10);
        let year = parseInt(dateMatch[3], 10);
        if (year < 100) year += 2000;
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2010 && year <= 2050) {
          detectedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    } catch (_) {}
  }

  // 4. Ekstraksi Item Belanjaan
  const detectedItems = [];
  lines.forEach(line => {
    // Baris item biasanya mengandung teks nama barang dan harga
    const itemMatch = line.match(/^([a-zA-Z0-9\s.,&-]{3,30})\s+(?:(\d+)\s*[xX]\s*)?(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,8})$/i);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const qty = parseInt(itemMatch[2] || '1', 10);
      const price = parseInt(itemMatch[3].replace(/[^0-9]/g, ''), 10);
      if (name.length > 2 && !name.toLowerCase().includes('total') && price > 0) {
        detectedItems.push({ name, qty, price });
      }
    }
  });

  if (detectedItems.length === 0) {
    detectedItems.push({
      name: detectedMerchant,
      qty: 1,
      price: detectedAmount || 0
    });
  }

  // 5. Klasifikasi Kategori Pintar Berdasarkan Skor Frekuensi Kata Kunci
  const categories = appState.categories.filter(c => c.type === 'expense');
  let bestCategoryId = merchantCatId || '';
  let bestScore = merchantCatId ? 5 : 0;
  let matchedKeyword = '';

  const fullCorpus = `${lowerText} ${lowerFile} ${detectedMerchant.toLowerCase()}`;

  CATEGORY_RULES.forEach(rule => {
    let score = 0;
    let foundKw = '';

    rule.keywords.forEach(kw => {
      if (fullCorpus.includes(kw)) {
        score += rule.weight;
        if (!foundKw) foundKw = kw;
      }
    });

    if (score > bestScore) {
      bestScore = score;
      bestCategoryId = rule.id;
      matchedKeyword = foundKw;
    }
  });

  // Fallback kategori jika teks tidak memiliki kata kunci jelas
  if (!bestCategoryId) {
    bestCategoryId = 'cat-exp-2'; // Default ke Rumah Tangga & Belanja
  }

  const matchedCat = categories.find(c => c.id === bestCategoryId) || categories[0];

  // 6. Pilih Akun Default (Tunai / Rekening Utama)
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  let matchedAcc = accounts[0];
  if (lowerText.includes('bca') || lowerText.includes('debit bca')) {
    matchedAcc = accounts.find(a => a.name.toLowerCase().includes('bca')) || matchedAcc;
  } else if (lowerText.includes('mandiri')) {
    matchedAcc = accounts.find(a => a.name.toLowerCase().includes('mandiri')) || matchedAcc;
  } else if (lowerText.includes('qris') || lowerText.includes('gopay') || lowerText.includes('ovo') || lowerText.includes('shopee')) {
    matchedAcc = accounts.find(a => a.type === 'ewallet' || a.name.toLowerCase().includes('gopay')) || matchedAcc;
  } else if (lowerText.includes('cash') || lowerText.includes('tunai')) {
    matchedAcc = accounts.find(a => a.type === 'cash') || matchedAcc;
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return {
    merchant: detectedMerchant,
    date: detectedDate,
    time: timeStr,
    amount: detectedAmount,
    items: detectedItems,
    category: matchedCat,
    categoryReason: matchedKeyword ? `Kata kunci terdeteksi: "${matchedKeyword}"` : `Kategori disesuaikan: ${matchedCat.name}`,
    account: matchedAcc,
    member: appState.currentUser,
    confidenceScore: bestScore > 0 ? Math.min(99, Math.round(75 + bestScore * 5)) : 70,
    description: `Belanja di ${detectedMerchant}`,
    notes: `Rincian: ${detectedItems.slice(0, 4).map(i => `${i.name} (x${i.qty})`).join(', ')}`,
    rawText: text
  };
}

/**
 * Pipeline Lengkap: Menganalisis Foto Struk (OCR Asli + Parsing Semantik)
 */
export async function analyzeReceiptImage(dataUrl, fileName = '', onProgress) {
  // Jika pengguna memilih salah satu sampel simulasi, gunakan data sampel yang sudah tepat
  const sample = SAMPLE_RECEIPTS.find(s => s.merchant.toLowerCase() === (fileName || '').toLowerCase());
  if (sample) {
    if (onProgress) onProgress('Memproses contoh struk...', 80);
    await new Promise(r => setTimeout(r, 400));
    const categories = appState.categories.filter(c => c.type === 'expense');
    const accounts = appState.getAccountsWithBalances();
    const cat = categories.find(c => c.id === sample.category) || categories[0];
    const acc = accounts.find(a => a.id === sample.account) || accounts[0];

    return {
      merchant: sample.merchant,
      date: sample.date,
      time: '12:00',
      amount: sample.amount,
      items: sample.items,
      category: cat,
      categoryReason: `Contoh struk resmi: ${cat.name}`,
      account: acc,
      member: appState.currentUser,
      confidenceScore: 99,
      description: `Belanja di ${sample.merchant}`,
      notes: `Rincian: ${sample.items.map(i => `${i.name} (x${i.qty})`).join(', ')}`,
      rawReceiptUrl: dataUrl
    };
  }

  // Jika pengguna mengunggah foto asli dari kamera / galeri HP:
  let recognizedText = '';
  try {
    recognizedText = await performOCR(dataUrl, onProgress);
  } catch (err) {
    console.warn('OCR fallback:', err);
  }

  if (onProgress) onProgress('Mengklasifikasi kategori dan item belanja...', 95);

  const parsed = parseReceiptText(recognizedText, fileName);
  parsed.rawReceiptUrl = dataUrl;

  return parsed;
}
