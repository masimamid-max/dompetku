/**
 * Mock initial data for Indonesian family financial management MVP
 */

export const INITIAL_DATA = {
  currentUser: {
    id: 'user-1',
    name: 'Budi Santoso',
    email: 'budi.santoso@email.com',
    role: 'owner',
    avatarText: 'BS'
  },
  
  family: {
    id: 'fam-1',
    name: 'Keluarga Santoso',
    currency: 'IDR',
    currencySymbol: 'Rp',
    inviteCode: 'SANTOSO-2026',
    ownerId: 'user-1',
    createdAt: '2026-01-01'
  },

  members: [
    {
      id: 'user-1',
      name: 'Budi Santoso',
      role: 'owner',
      roleLabel: 'Super Akses (Pemilik)',
      email: 'budi.santoso@email.com',
      password: '123',
      avatarText: 'BS',
      joinedAt: '2026-01-01'
    },
    {
      id: 'user-2',
      name: 'Siti Rahma',
      role: 'admin',
      roleLabel: 'Admin (Pengelola)',
      email: 'siti.rahma@email.com',
      password: '123',
      avatarText: 'SR',
      joinedAt: '2026-01-02'
    },
    {
      id: 'user-3',
      name: 'Rafi Santoso',
      role: 'member',
      roleLabel: 'Anggota Keluarga',
      email: 'rafi.santoso@email.com',
      password: '123',
      avatarText: 'RS',
      joinedAt: '2026-02-15'
    }
  ],

  accounts: [
    {
      id: 'acc-1',
      familyId: 'fam-1',
      name: 'Kas Dompet Tunai',
      type: 'cash',
      typeLabel: 'Tunai',
      initialBalance: 750000,
      color: '#10b981',
      icon: 'wallet',
      isArchived: false
    },
    {
      id: 'acc-2',
      familyId: 'fam-1',
      name: 'BCA Utama Keluarga',
      type: 'bank',
      typeLabel: 'Bank',
      initialBalance: 18500000,
      color: '#3b82f6',
      icon: 'creditCard',
      isArchived: false
    },
    {
      id: 'acc-3',
      familyId: 'fam-1',
      name: 'Bank Mandiri (Tabungan)',
      type: 'savings',
      typeLabel: 'Tabungan',
      initialBalance: 32000000,
      color: '#6366f1',
      icon: 'wallet',
      isArchived: false
    },
    {
      id: 'acc-4',
      familyId: 'fam-1',
      name: 'GoPay & ShopeePay',
      type: 'ewallet',
      typeLabel: 'E-Wallet',
      initialBalance: 1200000,
      color: '#06b6d4',
      icon: 'creditCard',
      isArchived: false
    }
  ],

  categories: [
    // Expense Categories
    {
      id: 'cat-exp-1',
      familyId: 'fam-1',
      name: 'Makanan & Kuliner',
      type: 'expense',
      icon: 'utensils',
      color: '#f43f5e',
      subcategories: ['Belanja Pasar', 'Restoran & Cafe', 'Camilan & Kopi', 'Air Minum Galon'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-2',
      familyId: 'fam-1',
      name: 'Rumah Tangga & Belanja',
      type: 'expense',
      icon: 'shoppingBag',
      color: '#f59e0b',
      subcategories: ['Sabun & Kebersihan', 'Perabotan', 'Peralatan Masak', 'Pakaian'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-3',
      familyId: 'fam-1',
      name: 'Tagihan & Utilitas',
      type: 'expense',
      icon: 'zap',
      color: '#6366f1',
      subcategories: ['Listrik PLN', 'PDAM Air', 'Internet Wifi', 'IPL Lingkungan', 'Pulsa & Kuota'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-4',
      familyId: 'fam-1',
      name: 'Transportasi',
      type: 'expense',
      icon: 'car',
      color: '#0284c7',
      subcategories: ['Bensin Mobil/Motor', 'E-Toll & Parkir', 'Ojek Online', 'Servis Kendaraan'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-5',
      familyId: 'fam-1',
      name: 'Pendidikan Anak',
      type: 'expense',
      icon: 'bookOpen',
      color: '#10b981',
      subcategories: ['SPP Bulanan', 'Buku & Seragam', 'Les & Kursus', 'Uang Saku'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-6',
      familyId: 'fam-1',
      name: 'Kesehatan & Obat',
      type: 'expense',
      icon: 'heartPulse',
      color: '#ef4444',
      subcategories: ['Dokter & Klinik', 'Vitamin & Obat', 'Asuransi / BPJS', 'Perawatan Gigi'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-7',
      familyId: 'fam-1',
      name: 'Hiburan & Rekreasi',
      type: 'expense',
      icon: 'smile',
      color: '#8b5cf6',
      subcategories: ['Nonton Bioskop', 'Jalan-jalan Akhir Pekan', 'Langganan Streaming'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-exp-8',
      familyId: 'fam-1',
      name: 'Sosial & Sedekah',
      type: 'expense',
      icon: 'heartPulse',
      color: '#ec4899',
      subcategories: ['Zakat & Sedekah', 'Sumbangan Warga', 'Kado & Hadiah', 'Keluarga Besar'],
      isDefault: true,
      isArchived: false
    },

    // Income Categories
    {
      id: 'cat-inc-1',
      familyId: 'fam-1',
      name: 'Gaji Utama',
      type: 'income',
      icon: 'briefcase',
      color: '#059669',
      subcategories: ['Gaji Ayah', 'Gaji Ibu', 'Tunjangan & Bonus'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-inc-2',
      familyId: 'fam-1',
      name: 'Usaha & Freelance',
      type: 'income',
      icon: 'dollarSign',
      color: '#0d9488',
      subcategories: ['Hasil Toko Online', 'Proyek Desain/Web', 'Katering Ibu'],
      isDefault: true,
      isArchived: false
    },
    {
      id: 'cat-inc-3',
      familyId: 'fam-1',
      name: 'Investasi & Bunga',
      type: 'income',
      icon: 'trendingUp',
      color: '#2563eb',
      subcategories: ['Dividen Saham', 'Bunga Tabungan', 'Imbal Hasil Reksadana'],
      isDefault: true,
      isArchived: false
    }
  ],

  budgets: [
    { id: 'b-1', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-1', amount: 4500000 },
    { id: 'b-2', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-2', amount: 3000000 },
    { id: 'b-3', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-3', amount: 2200000 },
    { id: 'b-4', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-4', amount: 1500000 },
    { id: 'b-5', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-5', amount: 2500000 },
    { id: 'b-6', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-6', amount: 1000000 },
    { id: 'b-7', familyId: 'fam-1', month: 9, year: 2026, categoryId: 'cat-exp-7', amount: 1200000 },
    
    // August budgets for comparison
    { id: 'b-old-1', familyId: 'fam-1', month: 8, year: 2026, categoryId: 'cat-exp-1', amount: 4500000 },
    { id: 'b-old-2', familyId: 'fam-1', month: 8, year: 2026, categoryId: 'cat-exp-2', amount: 3000000 },
    { id: 'b-old-3', familyId: 'fam-1', month: 8, year: 2026, categoryId: 'cat-exp-3', amount: 2200000 }
  ],

  transactions: [
    // Current Month (September 2026)
    {
      id: 'tx-1',
      familyId: 'fam-1',
      date: '2026-09-01',
      type: 'income',
      amount: 17500000,
      description: 'Gaji Bulanan Ayah PT Teknologi',
      categoryId: 'cat-inc-1',
      subcategory: 'Gaji Ayah',
      accountId: 'acc-2',
      memberId: 'user-1',
      recordedBy: 'user-1',
      notes: 'Gaji bersih setelah potongan asuransi',
      status: 'verified',
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z'
    },
    {
      id: 'tx-2',
      familyId: 'fam-1',
      date: '2026-09-01',
      type: 'transfer',
      amount: 5000000,
      description: 'Alokasi Tabungan Bulanan',
      accountId: 'acc-2',
      targetAccountId: 'acc-3',
      memberId: 'user-1',
      recordedBy: 'user-1',
      notes: 'Transfer rutin awal bulan',
      status: 'verified',
      createdAt: '2026-09-01T08:15:00Z',
      updatedAt: '2026-09-01T08:15:00Z'
    },
    {
      id: 'tx-3',
      familyId: 'fam-1',
      date: '2026-09-02',
      type: 'expense',
      amount: 1850000,
      description: 'SPP Sekolah Rafi Bulan September',
      categoryId: 'cat-exp-5',
      subcategory: 'SPP Bulanan',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      notes: 'Bayar via virtual account BCA',
      status: 'verified',
      createdAt: '2026-09-02T10:30:00Z',
      updatedAt: '2026-09-02T10:30:00Z'
    },
    {
      id: 'tx-4',
      familyId: 'fam-1',
      date: '2026-09-03',
      type: 'expense',
      amount: 850000,
      description: 'Listrik PLN & Token Tambahan',
      categoryId: 'cat-exp-3',
      subcategory: 'Listrik PLN',
      accountId: 'acc-4',
      memberId: 'user-2',
      recordedBy: 'user-2',
      notes: 'Tagihan bulan berjalan',
      status: 'verified',
      createdAt: '2026-09-03T11:00:00Z',
      updatedAt: '2026-09-03T11:00:00Z'
    },
    {
      id: 'tx-5',
      familyId: 'fam-1',
      date: '2026-09-04',
      type: 'expense',
      amount: 450000,
      description: 'Wifi Indihome Rumah',
      categoryId: 'cat-exp-3',
      subcategory: 'Internet Wifi',
      accountId: 'acc-2',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-09-04T09:00:00Z',
      updatedAt: '2026-09-04T09:00:00Z'
    },
    {
      id: 'tx-6',
      familyId: 'fam-1',
      date: '2026-09-05',
      type: 'expense',
      amount: 1250000,
      description: 'Belanja Mingguan Sayur & Daging Supermarket',
      categoryId: 'cat-exp-1',
      subcategory: 'Belanja Pasar',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-09-05T14:20:00Z',
      updatedAt: '2026-09-05T14:20:00Z'
    },
    {
      id: 'tx-7',
      familyId: 'fam-1',
      date: '2026-09-07',
      type: 'expense',
      amount: 350000,
      description: 'Bensin Pertamax Mobil Ayah',
      categoryId: 'cat-exp-4',
      subcategory: 'Bensin Mobil/Motor',
      accountId: 'acc-1',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-09-07T16:00:00Z',
      updatedAt: '2026-09-07T16:00:00Z'
    },
    {
      id: 'tx-8',
      familyId: 'fam-1',
      date: '2026-09-09',
      type: 'income',
      amount: 3200000,
      description: 'Hasil Pesanan Katering Arisan Ibu',
      categoryId: 'cat-inc-2',
      subcategory: 'Katering Ibu',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-09-09T18:00:00Z',
      updatedAt: '2026-09-09T18:00:00Z'
    },
    {
      id: 'tx-9',
      familyId: 'fam-1',
      date: '2026-09-11',
      type: 'expense',
      amount: 550000,
      description: 'Makan Malam Keluarga di Resto Padang',
      categoryId: 'cat-exp-1',
      subcategory: 'Restoran & Cafe',
      accountId: 'acc-4',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-09-11T20:00:00Z',
      updatedAt: '2026-09-11T20:00:00Z'
    },
    {
      id: 'tx-10',
      familyId: 'fam-1',
      date: '2026-09-13',
      type: 'expense',
      amount: 320000,
      description: 'Vitamin C & Suplemen Kesehatan',
      categoryId: 'cat-exp-6',
      subcategory: 'Vitamin & Obat',
      accountId: 'acc-4',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-09-13T13:00:00Z',
      updatedAt: '2026-09-13T13:00:00Z'
    },
    {
      id: 'tx-11',
      familyId: 'fam-1',
      date: '2026-09-14',
      type: 'expense',
      amount: 250000,
      description: 'Buku Tulis & Alat Sekolah Rafi',
      categoryId: 'cat-exp-5',
      subcategory: 'Buku & Seragam',
      accountId: 'acc-1',
      memberId: 'user-3',
      recordedBy: 'user-3',
      notes: 'Buku persiapan ujian semester',
      status: 'verified',
      createdAt: '2026-09-14T15:30:00Z',
      updatedAt: '2026-09-14T15:30:00Z'
    },
    {
      id: 'tx-12',
      familyId: 'fam-1',
      date: '2026-09-16',
      type: 'expense',
      amount: 720000,
      description: 'Belanja Sabun, Minyak & Kebutuhan Dapur',
      categoryId: 'cat-exp-2',
      subcategory: 'Sabun & Kebersihan',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-09-16T11:15:00Z',
      updatedAt: '2026-09-16T11:15:00Z'
    },
    {
      id: 'tx-13',
      familyId: 'fam-1',
      date: '2026-09-17',
      type: 'expense',
      amount: 450000,
      description: 'Nonton Bioskop & Popcorn Akhir Pekan',
      categoryId: 'cat-exp-7',
      subcategory: 'Nonton Bioskop',
      accountId: 'acc-4',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-09-17T19:45:00Z',
      updatedAt: '2026-09-17T19:45:00Z'
    },
    {
      id: 'tx-14',
      familyId: 'fam-1',
      date: '2026-09-18',
      type: 'expense',
      amount: 300000,
      description: 'Sedekah Jumat Masjid Lingkungan',
      categoryId: 'cat-exp-8',
      subcategory: 'Zakat & Sedekah',
      accountId: 'acc-1',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-09-18T12:30:00Z',
      updatedAt: '2026-09-18T12:30:00Z'
    },

    // Previous Month (August 2026) for comparative analysis
    {
      id: 'tx-old-1',
      familyId: 'fam-1',
      date: '2026-08-01',
      type: 'income',
      amount: 17500000,
      description: 'Gaji Bulanan Ayah Agustus',
      categoryId: 'cat-inc-1',
      subcategory: 'Gaji Ayah',
      accountId: 'acc-2',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-08-01T08:00:00Z',
      updatedAt: '2026-08-01T08:00:00Z'
    },
    {
      id: 'tx-old-2',
      familyId: 'fam-1',
      date: '2026-08-05',
      type: 'expense',
      amount: 2200000,
      description: 'Belanja Bulanan Swalayan',
      categoryId: 'cat-exp-2',
      subcategory: 'Sabun & Kebersihan',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-08-05T10:00:00Z',
      updatedAt: '2026-08-05T10:00:00Z'
    },
    {
      id: 'tx-old-3',
      familyId: 'fam-1',
      date: '2026-08-10',
      type: 'expense',
      amount: 1950000,
      description: 'Makanan & Makan Luar Agustus',
      categoryId: 'cat-exp-1',
      subcategory: 'Restoran & Cafe',
      accountId: 'acc-4',
      memberId: 'user-1',
      recordedBy: 'user-1',
      status: 'verified',
      createdAt: '2026-08-10T19:00:00Z',
      updatedAt: '2026-08-10T19:00:00Z'
    },
    {
      id: 'tx-old-4',
      familyId: 'fam-1',
      date: '2026-08-15',
      type: 'expense',
      amount: 1200000,
      description: 'Tagihan Listrik & Air Agustus',
      categoryId: 'cat-exp-3',
      subcategory: 'Listrik PLN',
      accountId: 'acc-2',
      memberId: 'user-2',
      recordedBy: 'user-2',
      status: 'verified',
      createdAt: '2026-08-15T11:00:00Z',
      updatedAt: '2026-08-15T11:00:00Z'
    }
  ],

  goals: [
    {
      id: 'goal-1',
      familyId: 'fam-1',
      name: 'Dana Darurat Keluarga (6 Bulan)',
      targetAmount: 30000000,
      currentAmount: 18500000,
      targetDate: '2026-12-31',
      category: 'Investasi & Tabungan',
      accountId: 'acc-3', // Mandiri Tabungan
      color: '#059669',
      icon: 'shield',
      notes: 'Disimpan di rekening tabungan khusus dengan bunga kompetitif.',
      createdAt: '2026-01-01'
    },
    {
      id: 'goal-2',
      familyId: 'fam-1',
      name: 'Liburan Akhir Tahun ke Yogyakarta',
      targetAmount: 8000000,
      currentAmount: 5200000,
      targetDate: '2026-11-30',
      category: 'Hiburan & Liburan',
      accountId: 'acc-2', // BCA
      color: '#3b82f6',
      icon: 'smile',
      notes: 'Tiket kereta api & sewa homestay keluarga 4 hari 3 malam.',
      createdAt: '2026-03-15'
    },
    {
      id: 'goal-3',
      familyId: 'fam-1',
      name: 'Ganti Laptop Belajar Rafi',
      targetAmount: 12000000,
      currentAmount: 4000000,
      targetDate: '2027-02-28',
      category: 'Pendidikan Anak',
      accountId: 'acc-3',
      color: '#8b5cf6',
      icon: 'bookOpen',
      notes: 'Untuk kebutuhan tugas multimedia & coding sekolah SMA.',
      createdAt: '2026-06-01'
    }
  ],

  recurringBills: [
    {
      id: 'bill-1',
      familyId: 'fam-1',
      name: 'Listrik PLN Pasca-bayar',
      amount: 850000,
      dueDay: 15,
      categoryId: 'cat-exp-3',
      accountId: 'acc-2',
      isPaidThisMonth: true,
      lastPaidDate: '2026-09-03',
      notes: 'No meter: 5412-8890-1234'
    },
    {
      id: 'bill-2',
      familyId: 'fam-1',
      name: 'Wifi Internet Indihome 50 Mbps',
      amount: 450000,
      dueDay: 20,
      categoryId: 'cat-exp-3',
      accountId: 'acc-2',
      isPaidThisMonth: true,
      lastPaidDate: '2026-09-04',
      notes: 'ID Pelanggan: 1224-9008-7761'
    },
    {
      id: 'bill-3',
      familyId: 'fam-1',
      name: 'Iuran Pengelolaan Lingkungan (IPL)',
      amount: 350000,
      dueDay: 25,
      categoryId: 'cat-exp-3',
      accountId: 'acc-1',
      isPaidThisMonth: false,
      lastPaidDate: '2026-08-25',
      notes: 'Keamanan, sampah, dan kebersihan RT 04'
    },
    {
      id: 'bill-4',
      familyId: 'fam-1',
      name: 'BPJS Kesehatan Mandiri (4 Anggota)',
      amount: 600000,
      dueDay: 10,
      categoryId: 'cat-exp-6',
      accountId: 'acc-2',
      isPaidThisMonth: true,
      lastPaidDate: '2026-09-08',
      notes: 'Kelas 1 untuk 4 anggota keluarga'
    }
  ]
};
