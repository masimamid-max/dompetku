/**
 * Transactions List & Search Page Module
 */
import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, formatDate, exportToCSV } from '../utils.js';
import { openTransactionModal } from '../components/transactionModal.js';
import { openReceiptScanModal } from '../components/receiptScanModal.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let filterState = {
  search: '',
  type: 'all',
  categoryId: 'all',
  accountId: 'all',
  memberId: 'all',
  sortBy: 'date-desc',
  page: 1,
  pageSize: 8
};

export function renderTransactionsPage() {
  const accounts = appState.getAccountsWithBalances();
  const categories = appState.categories;
  const members = appState.members;
  const current = appState.currentUser;

  // Build maps for fast lookups
  const categoriesMap = {};
  categories.forEach(c => { categoriesMap[c.id] = c; });
  const accountsMap = {};
  accounts.forEach(a => { accountsMap[a.id] = a; });
  const membersMap = {};
  members.forEach(m => { membersMap[m.id] = m; });

  // Apply filters
  let filtered = appState.transactions.filter(tx => {
    // Search text
    if (filterState.search) {
      const q = filterState.search.toLowerCase();
      const matchDesc = (tx.description || '').toLowerCase().includes(q);
      const matchNotes = (tx.notes || '').toLowerCase().includes(q);
      const matchSub = (tx.subcategory || '').toLowerCase().includes(q);
      if (!matchDesc && !matchNotes && !matchSub) return false;
    }

    // Type
    if (filterState.type !== 'all' && tx.type !== filterState.type) {
      return false;
    }

    // Category
    if (filterState.categoryId !== 'all' && tx.categoryId !== filterState.categoryId) {
      return false;
    }

    // Account
    if (filterState.accountId !== 'all') {
      if (tx.accountId !== filterState.accountId && tx.targetAccountId !== filterState.accountId) {
        return false;
      }
    }

    // Member
    if (filterState.memberId !== 'all' && tx.memberId !== filterState.memberId) {
      return false;
    }

    return true;
  });

  // Sort
  filtered.sort((a, b) => {
    if (filterState.sortBy === 'date-desc') {
      return new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id);
    } else if (filterState.sortBy === 'date-asc') {
      return new Date(a.date) - new Date(b.date) || a.id.localeCompare(b.id);
    } else if (filterState.sortBy === 'amount-desc') {
      return b.amount - a.amount;
    } else if (filterState.sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Pagination
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / filterState.pageSize) || 1;
  if (filterState.page > totalPages) filterState.page = totalPages;
  const startIndex = (filterState.page - 1) * filterState.pageSize;
  const paginatedTransactions = filtered.slice(startIndex, startIndex + filterState.pageSize);

  return `
    <div class="transactions-page">
      <!-- Header -->
      <div class="transactions-header">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Daftar Transaksi</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Total ${totalItems} transaksi ditemukan
          </p>
        </div>
        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <button class="btn btn-secondary" id="btn-scan-receipt-tx" style="background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;">
            ${Icons.camera(16)} Scan Foto Struk
          </button>
          <button class="btn btn-secondary" id="btn-export-csv" title="Unduh CSV">
            ${Icons.download(16)} Ekspor CSV
          </button>
          <button class="btn btn-primary" id="btn-add-tx-page">
            ${Icons.plus(16)} Catat Transaksi
          </button>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="filter-bar">
        <div class="search-input-group">
          <span class="search-icon-inside">${Icons.search(18)}</span>
          <input 
            type="text" 
            id="tx-search-input" 
            class="form-input search-input-field" 
            placeholder="Cari transaksi berdasarkan deskripsi atau catatan..." 
            value="${filterState.search}"
          />
        </div>

        <div class="filters-row">
          <!-- Type Filter -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Jenis</label>
            <select id="filter-type-select" class="form-select" style="padding:0.45rem 0.65rem;font-size:0.8125rem;">
              <option value="all" ${filterState.type === 'all' ? 'selected' : ''}>Semua Jenis</option>
              <option value="expense" ${filterState.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
              <option value="income" ${filterState.type === 'income' ? 'selected' : ''}>Pemasukan</option>
              <option value="transfer" ${filterState.type === 'transfer' ? 'selected' : ''}>Transfer</option>
            </select>
          </div>

          <!-- Category Filter -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Kategori</label>
            <select id="filter-category-select" class="form-select" style="padding:0.45rem 0.65rem;font-size:0.8125rem;">
              <option value="all" ${filterState.categoryId === 'all' ? 'selected' : ''}>Semua Kategori</option>
              ${categories.map(c => `
                <option value="${c.id}" ${c.id === filterState.categoryId ? 'selected' : ''}>${c.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Account Filter -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Akun / Dompet</label>
            <select id="filter-account-select" class="form-select" style="padding:0.45rem 0.65rem;font-size:0.8125rem;">
              <option value="all" ${filterState.accountId === 'all' ? 'selected' : ''}>Semua Akun</option>
              ${accounts.map(a => `
                <option value="${a.id}" ${a.id === filterState.accountId ? 'selected' : ''}>${a.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Member Filter -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Anggota</label>
            <select id="filter-member-select" class="form-select" style="padding:0.45rem 0.65rem;font-size:0.8125rem;">
              <option value="all" ${filterState.memberId === 'all' ? 'selected' : ''}>Semua Anggota</option>
              ${members.map(m => `
                <option value="${m.id}" ${m.id === filterState.memberId ? 'selected' : ''}>${m.name}</option>
              `).join('')}
            </select>
          </div>

          <!-- Sort Filter -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" style="font-size:0.75rem;">Urutkan</label>
            <select id="filter-sort-select" class="form-select" style="padding:0.45rem 0.65rem;font-size:0.8125rem;">
              <option value="date-desc" ${filterState.sortBy === 'date-desc' ? 'selected' : ''}>Tanggal Terbaru</option>
              <option value="date-asc" ${filterState.sortBy === 'date-asc' ? 'selected' : ''}>Tanggal Terlama</option>
              <option value="amount-desc" ${filterState.sortBy === 'amount-desc' ? 'selected' : ''}>Nominal Terbesar</option>
              <option value="amount-asc" ${filterState.sortBy === 'amount-asc' ? 'selected' : ''}>Nominal Terkecil</option>
            </select>
          </div>

          <div style="display:flex;align-items:flex-end;height:100%;padding-top:1.25rem;">
            <button class="btn btn-secondary btn-sm" id="btn-reset-filters" style="width:100%;">
              ${Icons.refresh(14)} Reset
            </button>
          </div>
        </div>
      </div>

      <!-- Transaction List Container -->
      <div class="card" style="padding:0;overflow:hidden;">
        ${paginatedTransactions.length > 0 ? `
          <div class="transactions-list">
            ${paginatedTransactions.map(tx => {
              const cat = categoriesMap[tx.categoryId];
              const acc = accountsMap[tx.accountId];
              const targetAcc = tx.targetAccountId ? accountsMap[tx.targetAccountId] : null;
              const member = membersMap[tx.memberId];
              const iconName = tx.type === 'transfer' ? 'arrowRightLeft' : (cat ? cat.icon : 'tag');
              const catColor = tx.type === 'transfer' ? '#4f46e5' : (cat ? cat.color : '#94a3b8');
              const isAllowedToEdit = appState.canEditTransaction(tx);

              return `
                <div class="transaction-item" data-tx-id="${tx.id}">
                  <div class="transaction-left">
                    <div class="tx-category-icon" style="background:${catColor}20;color:${catColor};">
                      ${getCategoryIcon(iconName, 20)}
                    </div>
                    <div class="tx-main-info">
                      <div class="tx-desc-row">
                        <span class="tx-desc">${tx.description}</span>
                        ${tx.status === 'cancelled' ? '<span class="badge badge-cancelled">Dibatalkan</span>' : ''}
                        ${tx.receiptUrl ? `
                          <button class="badge btn-view-receipt" data-receipt-url="${tx.receiptUrl}" data-desc="${tx.description}" style="background:#fef3c7;color:#b45309;cursor:pointer;border:none;display:inline-flex;align-items:center;gap:0.25rem;">
                            ${Icons.image(12)} Struk
                          </button>
                        ` : ''}
                      </div>
                      <div class="tx-meta-row">
                        <span class="tx-meta-item">${Icons.calendar(12)} ${formatDate(tx.date, 'short')}</span>
                        ${tx.type !== 'transfer' && cat ? `<span class="tx-meta-item">• ${cat.name} ${tx.subcategory ? `(${tx.subcategory})` : ''}</span>` : ''}
                        <span class="tx-meta-item">• ${acc ? acc.name : '-'} ${targetAcc ? `➜ ${targetAcc.name}` : ''}</span>
                        <span class="tx-meta-item" style="color:var(--color-primary-700);font-weight:600;">• Oleh ${member ? member.name : '-'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="tx-right">
                    <div class="tx-amount-col">
                      <div class="tx-amount ${tx.type}">
                        ${tx.type === 'income' ? `+${formatRupiah(tx.amount)}` : tx.type === 'expense' ? `-${formatRupiah(tx.amount)}` : formatRupiah(tx.amount)}
                      </div>
                      <span class="badge badge-${tx.type}" style="font-size:0.625rem;">
                        ${tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'}
                      </span>
                    </div>

                    <div class="tx-actions-menu">
                      <button class="btn btn-secondary btn-icon btn-sm action-duplicate-tx" data-id="${tx.id}" title="Duplikasi Transaksi">
                        ${Icons.copy(15)}
                      </button>
                      ${isAllowedToEdit ? `
                        <button class="btn btn-secondary btn-icon btn-sm action-edit-tx" data-id="${tx.id}" title="Ubah Transaksi">
                          ${Icons.edit(15)}
                        </button>
                        <button class="btn btn-secondary btn-icon btn-sm action-delete-tx" data-id="${tx.id}" title="Hapus Transaksi" style="color:var(--color-expense);">
                          ${Icons.trash(15)}
                        </button>
                      ` : ''}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Pagination Bar -->
          <div class="pagination-container">
            <span style="font-size:0.8125rem;color:var(--text-muted);">
              Menampilkan <strong>${startIndex + 1}</strong> - <strong>${Math.min(startIndex + filterState.pageSize, totalItems)}</strong> dari <strong>${totalItems}</strong> transaksi
            </span>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              <button class="btn btn-secondary btn-sm" id="btn-prev-page" ${filterState.page <= 1 ? 'disabled' : ''}>
                Sebelumnya
              </button>
              <span style="font-size:0.8125rem;font-weight:700;padding:0 0.5rem;">
                ${filterState.page} / ${totalPages}
              </span>
              <button class="btn btn-secondary btn-sm" id="btn-next-page" ${filterState.page >= totalPages ? 'disabled' : ''}>
                Selanjutnya
              </button>
            </div>
          </div>
        ` : `
          <!-- Empty State -->
          <div class="empty-state">
            <div class="empty-state-icon">
              ${Icons.search(32)}
            </div>
            <div class="empty-state-title">Tidak ada transaksi ditemukan</div>
            <div class="empty-state-desc">
              Coba sesuaikan kata kunci pencarian atau ubah filter untuk menemukan transaksi yang Anda cari.
            </div>
            <button class="btn btn-primary btn-sm" id="btn-empty-add-tx">
              ${Icons.plus(14)} Catat Transaksi Baru
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

export function attachTransactionsListeners() {
  // Search input
  const searchInput = document.getElementById('tx-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      filterState.search = e.target.value;
      filterState.page = 1;
      appState.notify();
    };
  }

  // Type filter
  const typeSelect = document.getElementById('filter-type-select');
  if (typeSelect) {
    typeSelect.onchange = (e) => {
      filterState.type = e.target.value;
      filterState.page = 1;
      appState.notify();
    };
  }

  // Category filter
  const catSelect = document.getElementById('filter-category-select');
  if (catSelect) {
    catSelect.onchange = (e) => {
      filterState.categoryId = e.target.value;
      filterState.page = 1;
      appState.notify();
    };
  }

  // Account filter
  const accSelect = document.getElementById('filter-account-select');
  if (accSelect) {
    accSelect.onchange = (e) => {
      filterState.accountId = e.target.value;
      filterState.page = 1;
      appState.notify();
    };
  }

  // Member filter
  const memberSelect = document.getElementById('filter-member-select');
  if (memberSelect) {
    memberSelect.onchange = (e) => {
      filterState.memberId = e.target.value;
      filterState.page = 1;
      appState.notify();
    };
  }

  // Sort filter
  const sortSelect = document.getElementById('filter-sort-select');
  if (sortSelect) {
    sortSelect.onchange = (e) => {
      filterState.sortBy = e.target.value;
      appState.notify();
    };
  }

  // Reset filters
  const resetBtn = document.getElementById('btn-reset-filters');
  if (resetBtn) {
    resetBtn.onclick = () => {
      filterState = {
        search: '',
        type: 'all',
        categoryId: 'all',
        accountId: 'all',
        memberId: 'all',
        sortBy: 'date-desc',
        page: 1,
        pageSize: 8
      };
      appState.notify();
      toast.info('Filter transaksi telah direset.');
    };
  }

  // Add & Scan Transaction Buttons
  const addBtn = document.getElementById('btn-add-tx-page');
  if (addBtn) addBtn.onclick = () => openTransactionModal();
  const scanBtn = document.getElementById('btn-scan-receipt-tx');
  if (scanBtn) scanBtn.onclick = () => openReceiptScanModal();
  const emptyAddBtn = document.getElementById('btn-empty-add-tx');
  if (emptyAddBtn) emptyAddBtn.onclick = () => openTransactionModal();

  // Export CSV
  const exportBtn = document.getElementById('btn-export-csv');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const categoriesMap = {};
      appState.categories.forEach(c => { categoriesMap[c.id] = c; });
      const accountsMap = {};
      appState.accounts.forEach(a => { accountsMap[a.id] = a; });
      const membersMap = {};
      appState.members.forEach(m => { membersMap[m.id] = m; });

      exportToCSV(appState.transactions, categoriesMap, accountsMap, membersMap);
      toast.success('File CSV transaksi berhasil diunduh!');
    };
  }

  // Pagination buttons
  const prevBtn = document.getElementById('btn-prev-page');
  if (prevBtn) {
    prevBtn.onclick = () => {
      if (filterState.page > 1) {
        filterState.page--;
        appState.notify();
      }
    };
  }
  const nextBtn = document.getElementById('btn-next-page');
  if (nextBtn) {
    nextBtn.onclick = () => {
      filterState.page++;
      appState.notify();
    };
  }

  // Item Actions: Duplicate, Edit, Delete
  document.querySelectorAll('.action-duplicate-tx').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const dup = appState.duplicateTransaction(id);
      if (dup) {
        toast.success(`Transaksi "${dup.description}" berhasil diduplikasi!`);
      }
    };
  });

  document.querySelectorAll('.action-edit-tx').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const tx = appState.transactions.find(t => t.id === id);
      if (tx) {
        openTransactionModal(tx);
      }
    };
  });

  document.querySelectorAll('.action-delete-tx').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const tx = appState.transactions.find(t => t.id === id);
      if (tx) {
        modal.confirm({
          title: 'Hapus Transaksi',
          message: `Apakah Anda yakin ingin menghapus catatan transaksi <strong>"${tx.description}"</strong> sebesar <strong>${formatRupiah(tx.amount)}</strong>? Saldo akun akan diperbarui otomatis.`,
          confirmText: 'Hapus Transaksi',
          confirmType: 'btn-danger',
          onConfirm: () => {
            appState.deleteTransaction(id);
            toast.success('Catatan transaksi telah dihapus.');
          }
        });
      }
    };
  });

  // View Receipt Modal
  document.querySelectorAll('.btn-view-receipt').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const receiptUrl = btn.dataset.receiptUrl;
      const desc = btn.dataset.desc;
      if (receiptUrl) {
        modal.open({
          title: `Foto Struk: ${desc}`,
          content: `
            <div style="text-align:center;padding:0.5rem 0;">
              <img src="${receiptUrl}" alt="Struk ${desc}" style="max-width:100%;max-height:70vh;border-radius:var(--radius-md);box-shadow:var(--shadow-md);object-fit:contain;" />
            </div>
          `,
          footerButtons: [
            {
              label: 'Tutup',
              className: 'btn-primary',
              onClick: () => modal.close()
            }
          ]
        });
      }
    };
  });
}
