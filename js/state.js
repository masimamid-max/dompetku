/**
 * State Management & Data Store for Dompet Keluarga
 */
import { INITIAL_DATA } from './initialData.js';

const STORAGE_KEY = 'dompet_keluarga_db_v1';

class AppState {
  constructor() {
    this.listeners = [];
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.family = parsed.family || INITIAL_DATA.family;
        this.currentUser = parsed.currentUser || INITIAL_DATA.currentUser;
        this.members = parsed.members || INITIAL_DATA.members;
        this.accounts = parsed.accounts || INITIAL_DATA.accounts;
        this.categories = parsed.categories || INITIAL_DATA.categories;
        this.transactions = parsed.transactions || INITIAL_DATA.transactions;
        this.budgets = parsed.budgets || INITIAL_DATA.budgets;
        this.goals = parsed.goals || INITIAL_DATA.goals;
        this.recurringBills = parsed.recurringBills || INITIAL_DATA.recurringBills;
      } else {
        this.resetToInitialData();
      }
    } catch (e) {
      console.error('Failed to load state from localStorage, falling back to initial data', e);
      this.resetToInitialData();
    }

    // Default filters: prioritize month of latest transaction or current date
    const now = new Date();
    if (this.transactions && this.transactions.length > 0) {
      const latestTx = this.transactions[0];
      const d = new Date(latestTx.date);
      if (!isNaN(d.getTime())) {
        this.selectedMonth = d.getMonth() + 1;
        this.selectedYear = d.getFullYear();
      } else {
        this.selectedMonth = now.getMonth() + 1;
        this.selectedYear = now.getFullYear();
      }
    } else {
      this.selectedMonth = now.getMonth() + 1;
      this.selectedYear = now.getFullYear();
    }
    this.activeTab = 'dashboard';
  }

  saveState() {
    try {
      const payload = {
        family: this.family,
        currentUser: this.currentUser,
        members: this.members,
        accounts: this.accounts,
        categories: this.categories,
        transactions: this.transactions,
        budgets: this.budgets,
        goals: this.goals,
        recurringBills: this.recurringBills
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
    this.notify();
  }

  resetToInitialData() {
    this.family = JSON.parse(JSON.stringify(INITIAL_DATA.family));
    this.currentUser = JSON.parse(JSON.stringify(INITIAL_DATA.currentUser));
    this.members = JSON.parse(JSON.stringify(INITIAL_DATA.members));
    this.accounts = JSON.parse(JSON.stringify(INITIAL_DATA.accounts));
    this.categories = JSON.parse(JSON.stringify(INITIAL_DATA.categories));
    this.transactions = JSON.parse(JSON.stringify(INITIAL_DATA.transactions));
    this.budgets = JSON.parse(JSON.stringify(INITIAL_DATA.budgets));
    this.goals = JSON.parse(JSON.stringify(INITIAL_DATA.goals));
    this.recurringBills = JSON.parse(JSON.stringify(INITIAL_DATA.recurringBills));
    this.saveState();
  }

  resetToCleanData() {
    const session = (window.AuthAccess && typeof window.AuthAccess.getSession === 'function')
      ? window.AuthAccess.getSession()
      : null;

    const ownerName = session?.fullName || (this.currentUser?.name && this.currentUser.name !== 'Budi Santoso' ? this.currentUser.name : 'Keluarga');
    const ownerEmail = session?.email || (this.currentUser?.email && this.currentUser.email !== 'budi@keluarga.id' ? this.currentUser.email : '');
    const avatar = ownerName.split(' ').map(v => v[0]).join('').slice(0, 2).toUpperCase() || 'DK';

    this.family = {
      id: 'fam_' + Date.now(),
      name: `Keluarga ${ownerName !== 'Keluarga' ? ownerName.split(' ')[0] : 'Harmonis'}`,
      currency: 'IDR',
      currencySymbol: 'Rp',
      inviteCode: 'DK-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date().toISOString()
    };

    const ownerId = 'mem_owner_' + Date.now();
    this.currentUser = {
      id: ownerId,
      name: ownerName,
      email: ownerEmail,
      role: 'owner',
      roleLabel: 'Kepala Keluarga',
      avatarText: avatar
    };

    this.members = [
      {
        id: ownerId,
        name: ownerName,
        email: ownerEmail,
        role: 'owner',
        roleLabel: 'Kepala Keluarga',
        avatarText: avatar
      }
    ];

    // Buat 2 akun standar awal dengan saldo Rp 0
    this.accounts = [
      {
        id: 'acc_kas_utama',
        familyId: this.family.id,
        name: 'Dompet Tunai (Kas Utama)',
        type: 'cash',
        typeLabel: 'Tunai',
        accountNumber: '-',
        initialBalance: 0,
        color: '#10b981',
        icon: 'wallet',
        isArchived: false
      },
      {
        id: 'acc_bank_utama',
        familyId: this.family.id,
        name: 'Rekening Bank Utama',
        type: 'bank',
        typeLabel: 'Bank',
        accountNumber: '-',
        initialBalance: 0,
        color: '#0ea5e9',
        icon: 'creditCard',
        isArchived: false
      }
    ];

    // Gunakan template kategori bawaan agar langsung siap pakai
    this.categories = JSON.parse(JSON.stringify(INITIAL_DATA.categories || []));

    // Riwayat transaksi bersih (0 transaksi)
    this.transactions = [];

    // Anggaran, tabungan, dan tagihan bersih
    this.budgets = [];
    this.goals = [];
    this.recurringBills = [];

    this.saveState();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn());
  }

  // User / Role Switching (Simulator for testing role-based access)
  setCurrentUser(userId) {
    const user = this.members.find(m => m.id === userId);
    if (user) {
      this.currentUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarText: user.avatarText
      };
      this.saveState();
    }
  }

  // Permission Check
  canManageFamily() {
    return this.currentUser.role === 'owner';
  }

  canManageFinances() {
    return this.currentUser.role === 'owner' || this.currentUser.role === 'admin';
  }

  canEditTransaction(transaction) {
    if (this.canManageFinances()) return true;
    // Member can only edit their own transaction
    return transaction.recordedBy === this.currentUser.id || transaction.memberId === this.currentUser.id;
  }

  // Accounts with Running Balance Calculation
  getAccountsWithBalances() {
    return this.accounts.map(acc => {
      let balance = acc.initialBalance || 0;

      this.transactions.forEach(tx => {
        if (tx.status === 'cancelled') return;

        if (tx.type === 'income' && tx.accountId === acc.id) {
          balance += tx.amount;
        } else if (tx.type === 'expense' && tx.accountId === acc.id) {
          balance -= tx.amount;
        } else if (tx.type === 'transfer') {
          if (tx.accountId === acc.id) {
            balance -= tx.amount; // Outgoing transfer
          }
          if (tx.targetAccountId === acc.id) {
            balance += tx.amount; // Incoming transfer
          }
        }
      });

      return {
        ...acc,
        currentBalance: balance
      };
    });
  }

  getAccountById(id) {
    return this.getAccountsWithBalances().find(a => a.id === id);
  }

  addAccount(accData) {
    const newAcc = {
      id: `acc-${Date.now()}`,
      familyId: this.family.id,
      name: accData.name,
      type: accData.type || 'bank',
      typeLabel: accData.typeLabel || 'Bank',
      initialBalance: Number(accData.initialBalance) || 0,
      color: accData.color || '#3b82f6',
      icon: accData.icon || 'creditCard',
      isArchived: false
    };
    this.accounts.push(newAcc);
    this.saveState();
    return newAcc;
  }

  updateAccount(id, updates) {
    const index = this.accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      this.accounts[index] = { ...this.accounts[index], ...updates };
      this.saveState();
    }
  }

  toggleArchiveAccount(id) {
    const acc = this.accounts.find(a => a.id === id);
    if (acc) {
      acc.isArchived = !acc.isArchived;
      this.saveState();
    }
  }

  // Categories
  getCategories(type = null) {
    let cats = this.categories.filter(c => !c.isArchived);
    if (type) {
      cats = cats.filter(c => c.type === type);
    }
    return cats;
  }

  getCategoryById(id) {
    return this.categories.find(c => c.id === id);
  }

  addCategory(catData) {
    const newCat = {
      id: `cat-${catData.type === 'income' ? 'inc' : 'exp'}-${Date.now()}`,
      familyId: this.family.id,
      name: catData.name,
      type: catData.type || 'expense',
      icon: catData.icon || 'tag',
      color: catData.color || '#6366f1',
      subcategories: catData.subcategories || [],
      isDefault: false,
      isArchived: false
    };
    this.categories.push(newCat);
    this.saveState();
    return newCat;
  }

  updateCategory(id, updates) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = { ...this.categories[index], ...updates };
      this.saveState();
    }
  }

  isCategoryInUse(categoryId) {
    return this.transactions.some(tx => tx.categoryId === categoryId);
  }

  deleteOrArchiveCategory(id) {
    if (this.isCategoryInUse(id)) {
      // Archive instead of delete to protect historical data integrity
      const cat = this.categories.find(c => c.id === id);
      if (cat) {
        cat.isArchived = true;
        this.saveState();
      }
      return { status: 'archived', message: 'Kategori sedang digunakan oleh transaksi, sehingga diarsipkan.' };
    } else {
      this.categories = this.categories.filter(c => c.id !== id);
      this.saveState();
      return { status: 'deleted', message: 'Kategori berhasil dihapus.' };
    }
  }

  // Transactions CRUD
  addTransaction(data) {
    const nowISO = new Date().toISOString();
    const newTx = {
      id: `tx-${Date.now()}`,
      familyId: this.family.id,
      date: data.date || new Date().toISOString().split('T')[0],
      type: data.type, // 'income' | 'expense' | 'transfer'
      amount: Number(data.amount),
      description: data.description.trim(),
      categoryId: data.type !== 'transfer' ? data.categoryId : undefined,
      subcategory: data.subcategory || undefined,
      accountId: data.accountId,
      targetAccountId: data.type === 'transfer' ? data.targetAccountId : undefined,
      memberId: data.memberId || this.currentUser.id,
      recordedBy: this.currentUser.id,
      notes: data.notes ? data.notes.trim() : '',
      status: data.status || 'verified',
      createdAt: nowISO,
      updatedAt: nowISO
    };

    this.transactions.unshift(newTx);
    this.saveState();

    try {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('transaction:added', { detail: newTx }));
      }
    } catch (e) {}

    return newTx;
  }

  updateTransaction(id, data) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const existing = this.transactions[index];
      this.transactions[index] = {
        ...existing,
        ...data,
        updatedBy: this.currentUser.id,
        updatedAt: new Date().toISOString()
      };
      this.saveState();
      return this.transactions[index];
    }
    return null;
  }

  duplicateTransaction(id) {
    const orig = this.transactions.find(t => t.id === id);
    if (!orig) return null;

    const copy = {
      ...orig,
      id: `tx-${Date.now()}`,
      description: `${orig.description} (Salinan)`,
      date: new Date().toISOString().split('T')[0],
      recordedBy: this.currentUser.id,
      updatedBy: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.transactions.unshift(copy);
    this.saveState();
    return copy;
  }

  deleteTransaction(id) {
    this.transactions = this.transactions.filter(t => t.id !== id);
    this.saveState();
  }

  // Monthly Metrics & Analytics
  getMonthlyMetrics(month = this.selectedMonth, year = this.selectedYear) {
    const currentMonthTx = this.transactions.filter(tx => {
      if (tx.status === 'cancelled') return false;
      const d = new Date(tx.date);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    });

    // Previous month for comparison
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const prevMonthTx = this.transactions.filter(tx => {
      if (tx.status === 'cancelled') return false;
      const d = new Date(tx.date);
      return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let transactionCount = currentMonthTx.length;

    currentMonthTx.forEach(tx => {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') totalExpense += tx.amount;
    });

    let prevIncome = 0;
    let prevExpense = 0;
    prevMonthTx.forEach(tx => {
      if (tx.type === 'income') prevIncome += tx.amount;
      if (tx.type === 'expense') prevExpense += tx.amount;
    });

    const netSavings = totalIncome - totalExpense;

    // Monthly Budgets Comparison
    const currentBudgets = this.budgets.filter(b => b.month === month && b.year === year);
    const totalBudget = currentBudgets.reduce((sum, b) => sum + b.amount, 0);
    const budgetUsedPercent = totalBudget > 0 ? Math.round((totalExpense / totalBudget) * 100) : 0;

    // Expense percentage comparison vs previous month
    let expenseDiffPercent = 0;
    if (prevExpense > 0) {
      expenseDiffPercent = Math.round(((totalExpense - prevExpense) / prevExpense) * 100);
    }

    // Top 5 Expenses
    const topExpenses = currentMonthTx
      .filter(tx => tx.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Expenses by Category
    const categoryExpensesMap = {};
    currentMonthTx.filter(tx => tx.type === 'expense').forEach(tx => {
      const cat = this.getCategoryById(tx.categoryId);
      const catId = tx.categoryId || 'unknown';
      const catName = cat ? cat.name : 'Lainnya';
      const catColor = cat ? cat.color : '#94a3b8';
      const catIcon = cat ? cat.icon : 'tag';

      if (!categoryExpensesMap[catId]) {
        categoryExpensesMap[catId] = {
          id: catId,
          label: catName,
          value: 0,
          color: catColor,
          icon: catIcon
        };
      }
      categoryExpensesMap[catId].value += tx.amount;
    });

    const categoryBreakdown = Object.values(categoryExpensesMap).sort((a, b) => b.value - a.value);

    // Daily Expenses
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyExpenses = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTotal = currentMonthTx
        .filter(tx => tx.type === 'expense' && tx.date === dateStr)
        .reduce((sum, tx) => sum + tx.amount, 0);

      dailyExpenses.push({
        day,
        date: dateStr,
        amount: dayTotal
      });
    }

    return {
      month,
      year,
      totalIncome,
      totalExpense,
      netSavings,
      transactionCount,
      totalBudget,
      budgetUsedPercent,
      prevIncome,
      prevExpense,
      expenseDiffPercent,
      topExpenses,
      categoryBreakdown,
      dailyExpenses
    };
  }

  // Budgets
  getCategoryBudgetsWithProgress(month = this.selectedMonth, year = this.selectedYear) {
    const expenseCategories = this.getCategories('expense');
    const monthlyBudgets = this.budgets.filter(b => b.month === month && b.year === year);
    const metrics = this.getMonthlyMetrics(month, year);
    const catSpentMap = {};

    metrics.categoryBreakdown.forEach(c => {
      catSpentMap[c.id] = c.value;
    });

    return expenseCategories.map(cat => {
      const budgetEntry = monthlyBudgets.find(b => b.categoryId === cat.id);
      const budgetAmount = budgetEntry ? budgetEntry.amount : 0;
      const spentAmount = catSpentMap[cat.id] || 0;
      const remainingAmount = budgetAmount - spentAmount;
      const percent = budgetAmount > 0 ? Math.round((spentAmount / budgetAmount) * 100) : 0;

      let status = 'safe'; // < 80%
      if (percent >= 100) {
        status = 'danger'; // Over budget
      } else if (percent >= 80) {
        status = 'warning'; // 80 - 99%
      }

      return {
        categoryId: cat.id,
        category: cat,
        budgetAmount,
        spentAmount,
        remainingAmount,
        percent,
        status,
        budgetId: budgetEntry ? budgetEntry.id : null
      };
    });
  }

  setBudget(categoryId, amount, month = this.selectedMonth, year = this.selectedYear) {
    const existing = this.budgets.find(b => b.categoryId === categoryId && b.month === month && b.year === year);
    if (existing) {
      existing.amount = Number(amount);
    } else {
      this.budgets.push({
        id: `b-${Date.now()}`,
        familyId: this.family.id,
        categoryId,
        amount: Number(amount),
        month,
        year
      });
    }
    this.saveState();
  }

  copyBudgetsFromPreviousMonth(targetMonth = this.selectedMonth, targetYear = this.selectedYear) {
    let prevMonth = targetMonth - 1;
    let prevYear = targetYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = targetYear - 1;
    }

    const prevBudgets = this.budgets.filter(b => b.month === prevMonth && b.year === prevYear);
    if (prevBudgets.length === 0) {
      return { count: 0, message: 'Tidak ada anggaran di bulan sebelumnya untuk disalin.' };
    }

    let copiedCount = 0;
    prevBudgets.forEach(pb => {
      const exists = this.budgets.find(b => b.categoryId === pb.categoryId && b.month === targetMonth && b.year === targetYear);
      if (exists) {
        exists.amount = pb.amount;
      } else {
        this.budgets.push({
          id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          familyId: this.family.id,
          categoryId: pb.categoryId,
          amount: pb.amount,
          month: targetMonth,
          year: targetYear
        });
      }
      copiedCount++;
    });

    this.saveState();
    return { count: copiedCount, message: `Berhasil menyalin ${copiedCount} alokasi anggaran dari bulan sebelumnya!` };
  }

  // Members Management & Super Access Control
  addMember(name, email, role = 'member', password = '123') {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AG';
    const roleLabels = {
      owner: 'Super Akses (Pemilik)',
      admin: 'Admin (Pengelola)',
      member: 'Anggota Keluarga'
    };

    const newMember = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email ? email.trim() : `user${Date.now()}@email.com`,
      password: password || '123',
      role,
      roleLabel: roleLabels[role] || 'Anggota',
      avatarText: initials,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    this.members.push(newMember);
    this.saveState();
    return newMember;
  }

  updateMember(userId, updates) {
    const member = this.members.find(m => m.id === userId);
    if (!member) return null;

    const roleLabels = {
      owner: 'Super Akses (Pemilik)',
      admin: 'Admin (Pengelola)',
      member: 'Anggota Keluarga'
    };

    if (updates.name) {
      member.name = updates.name.trim();
      member.avatarText = member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || 'AG';
    }
    if (updates.email) {
      member.email = updates.email.trim();
    }
    if (updates.password) {
      member.password = updates.password;
    }
    if (updates.role) {
      member.role = updates.role;
      member.roleLabel = roleLabels[updates.role] || updates.role;
    }

    // If updating current active user, sync session
    if (this.currentUser.id === userId) {
      this.currentUser = {
        ...this.currentUser,
        name: member.name,
        email: member.email,
        role: member.role,
        avatarText: member.avatarText
      };
    }

    this.saveState();
    return member;
  }

  deleteMember(userId) {
    const member = this.members.find(m => m.id === userId);
    if (!member) {
      return { success: false, message: 'Anggota tidak ditemukan.' };
    }

    if (member.role === 'owner') {
      const ownerCount = this.members.filter(m => m.role === 'owner').length;
      if (ownerCount <= 1) {
        return { success: false, message: 'Tidak dapat menghapus Pemilik/Super Akses utama ruang keluarga.' };
      }
    }

    this.members = this.members.filter(m => m.id !== userId);

    // If current active user was deleted, fallback to the first available owner
    if (this.currentUser.id === userId) {
      const fallback = this.members.find(m => m.role === 'owner') || this.members[0];
      if (fallback) {
        this.setCurrentUser(fallback.id);
      }
    }

    this.saveState();
    return { success: true, message: `Anggota ${member.name} berhasil dihapus dari ruang keluarga.` };
  }

  updateMemberRole(userId, newRole) {
    return this.updateMember(userId, { role: newRole });
  }

  loginUser(email, password) {
    const user = this.members.find(m => m.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'Email tidak terdaftar dalam ruang keluarga ini.' };
    }
    if (user.password && user.password !== password) {
      return { success: false, message: 'Kata sandi salah.' };
    }
    this.setCurrentUser(user.id);
    return { success: true, user, message: `Selamat datang kembali, ${user.name}!` };
  }

  // ==========================================
  // Financial Goals / Celengan Digital
  // ==========================================
  getGoals() {
    return (this.goals || []).map(g => {
      const progress = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const remaining = Math.max(0, g.targetAmount - g.currentAmount);
      return {
        ...g,
        progress,
        remaining
      };
    });
  }

  getGoalById(id) {
    return this.getGoals().find(g => g.id === id);
  }

  addGoal(data) {
    const newGoal = {
      id: `goal-${Date.now()}`,
      familyId: this.family.id,
      name: data.name.trim(),
      targetAmount: Number(data.targetAmount) || 0,
      currentAmount: Number(data.initialAmount) || 0,
      targetDate: data.targetDate || '',
      category: data.category || 'Investasi & Tabungan',
      accountId: data.accountId || (this.accounts[0] ? this.accounts[0].id : ''),
      color: data.color || '#059669',
      icon: data.icon || 'target',
      notes: (data.notes || '').trim(),
      createdAt: new Date().toISOString().split('T')[0]
    };
    if (!this.goals) this.goals = [];
    this.goals.push(newGoal);
    this.saveState();
    return newGoal;
  }

  updateGoal(id, updates) {
    const idx = (this.goals || []).findIndex(g => g.id === id);
    if (idx !== -1) {
      this.goals[idx] = { ...this.goals[idx], ...updates };
      this.saveState();
      return this.goals[idx];
    }
    return null;
  }

  depositToGoal(goalId, amount, sourceAccountId) {
    const goal = (this.goals || []).find(g => g.id === goalId);
    if (!goal) return { success: false, message: 'Target tabungan tidak ditemukan.' };
    
    const depositAmount = Number(amount);
    if (depositAmount <= 0) return { success: false, message: 'Nominal setoran harus lebih dari Rp 0.' };

    goal.currentAmount = (goal.currentAmount || 0) + depositAmount;

    // Record as transfer / expense transaction
    this.addTransaction({
      type: 'expense',
      amount: depositAmount,
      description: `Setoran Celengan: ${goal.name}`,
      date: new Date().toISOString().split('T')[0],
      accountId: sourceAccountId,
      categoryId: undefined,
      notes: `Alokasi dana target ${goal.name}`,
      status: 'verified'
    });

    this.saveState();
    return { success: true, message: `Berhasil menyetor dana sebesar ${depositAmount.toLocaleString('id-ID')} ke ${goal.name}!` };
  }

  deleteGoal(id) {
    this.goals = (this.goals || []).filter(g => g.id !== id);
    this.saveState();
    return { success: true, message: 'Target tabungan berhasil dihapus.' };
  }

  // ==========================================
  // Recurring Bills & Reminders
  // ==========================================
  getRecurringBills() {
    return this.recurringBills || [];
  }

  getBillById(id) {
    return (this.recurringBills || []).find(b => b.id === id);
  }

  addRecurringBill(data) {
    const newBill = {
      id: `bill-${Date.now()}`,
      familyId: this.family.id,
      name: data.name.trim(),
      amount: Number(data.amount) || 0,
      dueDay: Number(data.dueDay) || 1,
      categoryId: data.categoryId || (this.categories[0] ? this.categories[0].id : ''),
      accountId: data.accountId || (this.accounts[0] ? this.accounts[0].id : ''),
      isPaidThisMonth: !!data.isPaidThisMonth,
      lastPaidDate: data.isPaidThisMonth ? new Date().toISOString().split('T')[0] : undefined,
      notes: (data.notes || '').trim()
    };
    if (!this.recurringBills) this.recurringBills = [];
    this.recurringBills.push(newBill);
    this.saveState();
    return newBill;
  }

  updateRecurringBill(id, updates) {
    const idx = (this.recurringBills || []).findIndex(b => b.id === id);
    if (idx !== -1) {
      this.recurringBills[idx] = { ...this.recurringBills[idx], ...updates };
      this.saveState();
      return this.recurringBills[idx];
    }
    return null;
  }

  payRecurringBill(billId, accountId = null) {
    const bill = (this.recurringBills || []).find(b => b.id === billId);
    if (!bill) return { success: false, message: 'Tagihan tidak ditemukan.' };

    const useAccount = accountId || bill.accountId;
    const nowStr = new Date().toISOString().split('T')[0];

    // Create automatic expense transaction
    this.addTransaction({
      type: 'expense',
      amount: bill.amount,
      description: `Bayar Tagihan: ${bill.name}`,
      date: nowStr,
      accountId: useAccount,
      categoryId: bill.categoryId,
      notes: bill.notes || 'Pembayaran rutin bulanan',
      status: 'verified'
    });

    bill.isPaidThisMonth = true;
    bill.lastPaidDate = nowStr;
    this.saveState();

    return { success: true, message: `Tagihan "${bill.name}" berhasil dibayar dan dicatat ke transaksi!` };
  }

  deleteRecurringBill(id) {
    this.recurringBills = (this.recurringBills || []).filter(b => b.id !== id);
    this.saveState();
    return { success: true, message: 'Tagihan rutin berhasil dihapus.' };
  }

  updateFamilyInfo(name) {
    this.family.name = name.trim();
    this.saveState();
  }

  // ==========================================
  // Backup, Restore & CSV Export
  // ==========================================
  exportFullBackupJSON() {
    try {
      const backupData = {
        app: 'Dompet Keluarga',
        version: '3.17.0',
        exportedAt: new Date().toISOString(),
        family: this.family,
        currentUser: this.currentUser,
        members: this.members,
        accounts: this.accounts,
        categories: this.categories,
        transactions: this.transactions,
        budgets: this.budgets,
        goals: this.goals,
        recurringBills: this.recurringBills
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const nowStr = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `dompetku_backup_${nowStr}_${Date.now().toString().slice(-4)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Failed to export JSON backup', e);
      return false;
    }
  }

  exportAllTransactionsCSV() {
    try {
      const headers = ['ID', 'Tanggal', 'Tipe', 'Deskripsi', 'Kategori', 'Subkategori', 'Jumlah (IDR)', 'Rekening Asal', 'Rekening Tujuan', 'Dicatat Oleh', 'Catatan', 'Status'];
      const rows = [headers];

      const accountMap = new Map((this.accounts || []).map(a => [a.id, a.name]));
      const categoryMap = new Map((this.categories || []).map(c => [c.id, c.name]));
      const memberMap = new Map((this.members || []).map(m => [m.id, m.name]));

      (this.transactions || []).forEach(tx => {
        const typeLabel = tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer Antar Rekening';
        const catName = categoryMap.get(tx.categoryId) || '-';
        const subCat = tx.subcategory || '-';
        const accSource = accountMap.get(tx.accountId) || '-';
        const accTarget = tx.targetAccountId ? (accountMap.get(tx.targetAccountId) || '-') : '-';
        const recorder = memberMap.get(tx.recordedBy || tx.memberId) || 'Saya';
        const statusLabel = tx.status === 'verified' ? 'Terverifikasi' : tx.status === 'cancelled' ? 'Dibatalkan' : 'Pending';

        const row = [
          `"${tx.id || ''}"`,
          `"${tx.date || ''}"`,
          `"${typeLabel}"`,
          `"${(tx.description || '').replace(/"/g, '""')}"`,
          `"${catName}"`,
          `"${subCat}"`,
          tx.amount || 0,
          `"${accSource}"`,
          `"${accTarget}"`,
          `"${recorder}"`,
          `"${(tx.notes || '').replace(/"/g, '""')}"`,
          `"${statusLabel}"`
        ];
        rows.push(row);
      });

      const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const nowStr = new Date().toISOString().split('T')[0];
      const a = document.createElement('a');
      a.href = url;
      a.download = `dompetku_transaksi_${nowStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.error('Failed to export transactions CSV', e);
      return false;
    }
  }

  importFullBackupJSON(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Format data cadangan tidak valid.' };
      }

      if (data.family) this.family = data.family;
      if (data.currentUser) this.currentUser = data.currentUser;
      if (Array.isArray(data.members)) this.members = data.members;
      if (Array.isArray(data.accounts)) this.accounts = data.accounts;
      if (Array.isArray(data.categories)) this.categories = data.categories;
      if (Array.isArray(data.transactions)) this.transactions = data.transactions;
      if (Array.isArray(data.budgets)) this.budgets = data.budgets;
      if (Array.isArray(data.goals)) this.goals = data.goals;
      if (Array.isArray(data.recurringBills)) this.recurringBills = data.recurringBills;

      this.saveState();
      return { 
        success: true, 
        message: `Cadangan berhasil dipulihkan! (${this.transactions.length} transaksi dimuat).` 
      };
    } catch (e) {
      console.error('Failed to restore backup', e);
      return { success: false, message: 'Gagal memproses file: ' + e.message };
    }
  }
}

export const appState = new AppState();
