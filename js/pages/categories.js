/**
 * Dedicated Categories & Subcategories Page for Dompet Keluarga
 * Provides full management for expense and income categories, subcategories, colors, and icons.
 */

import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

let currentFilter = 'all'; // 'all' | 'expense' | 'income' | 'archived'
let searchQuery = '';

export function renderCategoriesPage() {
  const categories = appState.categories || [];
  const transactions = appState.transactions || [];
  const canManage = appState.currentUser ? appState.canManageSettings(appState.currentUser.id) : true;

  const expenseCats = categories.filter(c => c.type === 'expense' && !c.isArchived);
  const incomeCats = categories.filter(c => c.type === 'income' && !c.isArchived);
  const archivedCats = categories.filter(c => c.isArchived);

  // Count total subcategories
  const totalSubcategories = categories.reduce((acc, cat) => acc + (cat.subcategories || []).length, 0);

  // Filter categories based on selection and search
  let filtered = categories.slice();

  if (currentFilter === 'expense') {
    filtered = filtered.filter(c => c.type === 'expense' && !c.isArchived);
  } else if (currentFilter === 'income') {
    filtered = filtered.filter(c => c.type === 'income' && !c.isArchived);
  } else if (currentFilter === 'archived') {
    filtered = filtered.filter(c => c.isArchived);
  } else {
    // 'all' active categories
    filtered = filtered.filter(c => !c.isArchived);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(c => {
      const nameMatch = (c.name || '').toLowerCase().includes(q);
      const subMatch = (c.subcategories || []).some(sub => (sub || '').toLowerCase().includes(q));
      return nameMatch || subMatch;
    });
  }

  // Pre-calculate transaction count per category for insights
  const txCountByCat = {};
  transactions.forEach(tx => {
    if (tx.categoryId) {
      txCountByCat[tx.categoryId] = (txCountByCat[tx.categoryId] || 0) + 1;
    }
  });

  return `
    <div class="page-container page-categories" style="padding-bottom: 5rem;">
      <!-- Page Header -->
      <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;margin-bottom:1.5rem;">
        <div>
          <h1 class="page-title" style="display:flex;align-items:center;gap:0.625rem;font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">
            ${Icons.tag(24)} Kategori & Subkategori
          </h1>
          <p class="page-subtitle" style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Kelola pos pengeluaran, sumber pemasukan, dan rincian subkategori transaksi keluarga Anda
          </p>
        </div>

        <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;">
          ${canManage ? `
            <button id="btn-add-category" class="btn btn-primary" style="display:flex;align-items:center;gap:0.5rem;box-shadow:var(--shadow-sm);">
              ${Icons.plus(16)}
              <span>Tambah Kategori</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="metrics-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1rem;margin-bottom:1.5rem;">
        <div class="metric-card card" style="padding:1rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:44px;height:44px;border-radius:12px;background:#eef2ff;color:#6366f1;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.tag(22)}
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.025em;">Total Kategori</div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--color-slate-900);">${categories.filter(c => !c.isArchived).length} Kategori</div>
          </div>
        </div>

        <div class="metric-card card" style="padding:1rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:44px;height:44px;border-radius:12px;background:#fef2f2;color:#ef4444;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.trendingDown(22)}
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.025em;">Pengeluaran</div>
            <div style="font-size:1.25rem;font-weight:800;color:#ef4444;">${expenseCats.length} Pos Belanja</div>
          </div>
        </div>

        <div class="metric-card card" style="padding:1rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:44px;height:44px;border-radius:12px;background:#ecfdf5;color:#10b981;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.trendingUp(22)}
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.025em;">Pemasukan</div>
            <div style="font-size:1.25rem;font-weight:800;color:#10b981;">${incomeCats.length} Sumber Dana</div>
          </div>
        </div>

        <div class="metric-card card" style="padding:1rem;display:flex;align-items:center;gap:1rem;">
          <div style="width:44px;height:44px;border-radius:12px;background:#f0fdf4;color:#059669;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${Icons.copy(22)}
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:0.025em;">Total Subkategori</div>
            <div style="font-size:1.25rem;font-weight:800;color:var(--color-slate-900);">${totalSubcategories} Rincian</div>
          </div>
        </div>
      </div>

      <!-- Controls: Filter Tabs & Search Bar -->
      <div class="card" style="padding:0.875rem 1rem;margin-bottom:1.5rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;">
        <!-- Filter Tabs -->
        <div style="display:flex;align-items:center;gap:0.375rem;overflow-x:auto;padding-bottom:2px;" class="custom-scrollbar">
          <button class="btn btn-sm btn-filter-cat ${currentFilter === 'all' ? 'btn-primary' : 'btn-secondary'}" data-filter="all" style="border-radius:20px;padding:0.35rem 0.85rem;white-space:nowrap;">
            Semua (${categories.filter(c => !c.isArchived).length})
          </button>
          <button class="btn btn-sm btn-filter-cat ${currentFilter === 'expense' ? 'btn-primary' : 'btn-secondary'}" data-filter="expense" style="border-radius:20px;padding:0.35rem 0.85rem;white-space:nowrap;">
            ${Icons.trendingDown(14)} Pengeluaran (${expenseCats.length})
          </button>
          <button class="btn btn-sm btn-filter-cat ${currentFilter === 'income' ? 'btn-primary' : 'btn-secondary'}" data-filter="income" style="border-radius:20px;padding:0.35rem 0.85rem;white-space:nowrap;">
            ${Icons.trendingUp(14)} Pemasukan (${incomeCats.length})
          </button>
          ${archivedCats.length > 0 ? `
            <button class="btn btn-sm btn-filter-cat ${currentFilter === 'archived' ? 'btn-primary' : 'btn-secondary'}" data-filter="archived" style="border-radius:20px;padding:0.35rem 0.85rem;white-space:nowrap;">
              ${Icons.trash(14)} Arsip (${archivedCats.length})
            </button>
          ` : ''}
        </div>

        <!-- Search Input -->
        <div style="position:relative;min-width:240px;flex:1;max-width:360px;">
          <span style="position:absolute;left:0.75rem;top:50%;transform:translateY(-50%);color:var(--text-muted);display:flex;align-items:center;">
            ${Icons.search(16)}
          </span>
          <input 
            type="text" 
            id="cat-search-input" 
            class="form-input" 
            placeholder="Cari kategori / subkategori..." 
            value="${searchQuery}" 
            style="padding-left:2.35rem;padding-right:2rem;height:38px;font-size:0.875rem;border-radius:20px;"
          />
          ${searchQuery ? `
            <button id="cat-search-clear" style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0;font-size:1rem;line-height:1;">
              ✕
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Categories Cards Grid -->
      ${filtered.length === 0 ? `
        <div class="card" style="padding:3.5rem 1.5rem;text-align:center;color:var(--text-muted);">
          <div style="width:64px;height:64px;border-radius:50%;background:var(--color-slate-100);display:flex;align-items:center;justify-content:center;margin:0 auto 1rem;color:var(--color-slate-400);">
            ${Icons.tag(32)}
          </div>
          <div style="font-size:1.125rem;font-weight:700;color:var(--color-slate-800);margin-bottom:0.35rem;">
            ${searchQuery ? 'Tidak ada kategori yang cocok' : 'Belum ada kategori'}
          </div>
          <p style="font-size:0.875rem;max-width:400px;margin:0 auto 1.25rem;">
            ${searchQuery ? `Tidak ditemukan kategori atau subkategori dengan kata kunci "${searchQuery}". Coba kata kunci lain.` : 'Mulai tambahkan pos kategori pengeluaran atau pemasukan untuk mengelola keuangan keluarga.'}
          </p>
          ${canManage ? `
            <button id="btn-add-category-empty" class="btn btn-primary" style="display:inline-flex;align-items:center;gap:0.5rem;">
              ${Icons.plus(16)} Tambah Kategori Baru
            </button>
          ` : ''}
        </div>
      ` : `
        <div class="categories-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:1.25rem;">
          ${filtered.map(cat => {
            const isExpense = cat.type === 'expense';
            const catColor = cat.color || (isExpense ? '#ef4444' : '#10b981');
            const subcats = cat.subcategories || [];
            const txCount = txCountByCat[cat.id] || 0;

            return `
              <div class="card category-item-card" data-id="${cat.id}" style="display:flex;flex-direction:column;justify-content:space-between;border-top:4px solid ${catColor};position:relative;opacity:${cat.isArchived ? '0.75' : '1'};">
                <!-- Card Header -->
                <div>
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;margin-bottom:0.875rem;">
                    <div style="display:flex;align-items:center;gap:0.75rem;">
                      <div style="width:44px;height:44px;border-radius:12px;background:${catColor}18;color:${catColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                        ${getCategoryIcon(cat.icon || 'tag', 22)}
                      </div>
                      <div>
                        <div style="font-size:1rem;font-weight:800;color:var(--color-slate-900);line-height:1.2;">
                          ${cat.name}
                        </div>
                        <div style="display:flex;align-items:center;gap:0.35rem;margin-top:0.25rem;">
                          <span class="badge ${isExpense ? 'badge-danger' : 'badge-success'}" style="font-size:0.6875rem;padding:0.15rem 0.5rem;font-weight:700;">
                            ${isExpense ? 'Pengeluaran' : 'Pemasukan'}
                          </span>
                          ${cat.isArchived ? `
                            <span class="badge" style="background:#fef2f2;color:#ef4444;border:1px solid #fecaca;font-size:0.6875rem;padding:0.15rem 0.5rem;">
                              Arsip
                            </span>
                          ` : ''}
                          <span style="font-size:0.75rem;color:var(--text-muted);">
                            • ${txCount} Transaksi
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Action buttons -->
                    ${canManage ? `
                      <div style="display:flex;gap:0.25rem;flex-shrink:0;">
                        <button class="btn btn-secondary btn-icon btn-sm action-edit-cat" data-id="${cat.id}" title="Ubah Kategori" style="width:32px;height:32px;padding:0;">
                          ${Icons.edit(14)}
                        </button>
                        ${cat.isArchived ? `
                          <button class="btn btn-secondary btn-icon btn-sm action-restore-cat" data-id="${cat.id}" title="Aktifkan Kembali Kategori" style="width:32px;height:32px;padding:0;color:#059669;">
                            ${Icons.arrowRightLeft(14)}
                          </button>
                          <button class="btn btn-secondary btn-icon btn-sm action-delete-cat" data-id="${cat.id}" title="Hapus Permanen Kategori" style="width:32px;height:32px;padding:0;color:var(--color-expense);">
                            ${Icons.trash(14)}
                          </button>
                        ` : `
                          <button class="btn btn-secondary btn-icon btn-sm action-delete-cat" data-id="${cat.id}" title="Hapus / Arsipkan Kategori" style="width:32px;height:32px;padding:0;color:var(--color-expense);">
                            ${Icons.trash(14)}
                          </button>
                        `}
                      </div>
                    ` : ''}
                  </div>

                  <!-- Subcategories Section -->
                  <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px dashed var(--color-slate-200);">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                      <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.025em;">
                        Subkategori (${subcats.length})
                      </span>
                      ${canManage && !cat.isArchived ? `
                        <button class="btn-link action-quick-add-subcat" data-id="${cat.id}" style="font-size:0.75rem;color:var(--color-primary);font-weight:600;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;gap:0.25rem;">
                          ${Icons.plus(12)} Tambah Sub
                        </button>
                      ` : ''}
                    </div>

                    <div style="display:flex;flex-wrap:wrap;gap:0.35rem;min-height:32px;">
                      ${subcats.length > 0 ? subcats.map(sub => `
                        <span class="subcat-chip" style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.25rem 0.6rem;background:var(--color-slate-100);border-radius:12px;font-size:0.75rem;color:var(--color-slate-800);font-weight:600;">
                          ${sub}
                        </span>
                      `).join('') : `
                        <span style="font-size:0.75rem;color:var(--color-slate-400);font-style:italic;">
                          Belum ada subkategori
                        </span>
                      `}
                    </div>
                  </div>
                </div>

                <!-- Footer Quick Info -->
                <div style="margin-top:1rem;display:flex;justify-content:space-between;align-items:center;font-size:0.6875rem;color:var(--text-muted);">
                  <span>Warna tema: <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${catColor};vertical-align:middle;margin-left:2px;"></span></span>
                  <span style="color:${catColor};font-weight:700;">${isExpense ? 'Pengeluaran' : 'Pemasukan'}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

export function attachCategoriesListeners(navigateToTab) {
  const canManage = appState.currentUser ? appState.canManageSettings(appState.currentUser.id) : true;

  // Filter category buttons
  document.querySelectorAll('.btn-filter-cat').forEach(btn => {
    btn.onclick = () => {
      currentFilter = btn.dataset.filter || 'all';
      if (typeof navigateToTab === 'function') {
        navigateToTab('categories');
      }
    };
  });

  // Search input
  const searchInput = document.getElementById('cat-search-input');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      // Debounce or re-render
      clearTimeout(window.__catSearchTimer);
      window.__catSearchTimer = setTimeout(() => {
        if (typeof navigateToTab === 'function') {
          navigateToTab('categories');
        }
      }, 250);
    };
  }

  const searchClear = document.getElementById('cat-search-clear');
  if (searchClear) {
    searchClear.onclick = () => {
      searchQuery = '';
      if (typeof navigateToTab === 'function') {
        navigateToTab('categories');
      }
    };
  }

  // Add Category Buttons
  const addBtn = document.getElementById('btn-add-category');
  if (addBtn) {
    addBtn.onclick = () => openAddCategoryModal(currentFilter === 'income' ? 'income' : 'expense', navigateToTab);
  }

  const addEmptyBtn = document.getElementById('btn-add-category-empty');
  if (addEmptyBtn) {
    addEmptyBtn.onclick = () => openAddCategoryModal(currentFilter === 'income' ? 'income' : 'expense', navigateToTab);
  }

  // Edit Category
  document.querySelectorAll('.action-edit-cat').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.id;
      openEditCategoryModal(catId, navigateToTab);
    };
  });

  // Quick Add Subcategory
  document.querySelectorAll('.action-quick-add-subcat').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.id;
      openAddSubcategoryModal(catId, navigateToTab);
    };
  });

  // Restore Archived Category
  document.querySelectorAll('.action-restore-cat').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      appState.updateCategory(id, { isArchived: false });
      toast.success('Kategori berhasil diaktifkan kembali!');
      if (typeof navigateToTab === 'function') {
        navigateToTab('categories');
      }
    };
  });

  // Delete Category
  document.querySelectorAll('.action-delete-cat').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      openDeleteCategoryModal(id, navigateToTab);
    };
  });
}

/**
 * Open Modal to Add Category
 */
export function openAddCategoryModal(defaultType = 'expense', navigateToTab) {
  modal.open({
    title: 'Tambah Kategori Baru',
    content: `
      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Tipe Kategori *</label>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
          <label style="display:flex;align-items:center;gap:0.5rem;padding:0.75rem;border:1.5px solid var(--color-slate-200);border-radius:10px;cursor:pointer;font-weight:600;font-size:0.875rem;" id="label-type-expense">
            <input type="radio" name="modal-cat-type" value="expense" ${defaultType === 'expense' ? 'checked' : ''} />
            <span style="color:#ef4444;display:flex;align-items:center;gap:0.25rem;">${Icons.trendingDown(16)} Pengeluaran</span>
          </label>
          <label style="display:flex;align-items:center;gap:0.5rem;padding:0.75rem;border:1.5px solid var(--color-slate-200);border-radius:10px;cursor:pointer;font-weight:600;font-size:0.875rem;" id="label-type-income">
            <input type="radio" name="modal-cat-type" value="income" ${defaultType === 'income' ? 'checked' : ''} />
            <span style="color:#10b981;display:flex;align-items:center;gap:0.25rem;">${Icons.trendingUp(16)} Pemasukan</span>
          </label>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Nama Kategori *</label>
        <input type="text" id="cat-name-input" class="form-input" placeholder="Contoh: Belanja Bulanan, Donasi, Transportasi" required />
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Subkategori (Pisahkan dengan koma)</label>
        <input type="text" id="cat-subcats-input" class="form-input" placeholder="Contoh: Sayur & Buah, Daging, Bumbu Dapur" />
        <div style="font-size:0.6875rem;color:var(--text-muted);margin-top:0.25rem;">
          💡 Masukkan rincian spesifik agar pencatatan transaksi lebih presisi.
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Warna Kategori</label>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <input type="color" id="cat-color-input" class="form-input" value="${defaultType === 'income' ? '#059669' : '#e11d48'}" style="width:52px;height:42px;padding:3px;border-radius:8px;cursor:pointer;" />
          <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
            ${['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#ec4899'].map(c => `
              <button type="button" class="btn-color-preset" data-color="${c}" style="width:24px;height:24px;border-radius:50%;background:${c};border:none;cursor:pointer;outline:none;" title="${c}"></button>
            `).join('')}
          </div>
        </div>
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: 'Simpan Kategori',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('cat-name-input')?.value;
          const typeRadios = document.getElementsByName('modal-cat-type');
          let selectedType = 'expense';
          typeRadios.forEach(r => { if (r.checked) selectedType = r.value; });

          const subcatsRaw = document.getElementById('cat-subcats-input')?.value || '';
          const color = document.getElementById('cat-color-input')?.value || '#6366f1';

          if (!name || !name.trim()) {
            toast.error('Nama kategori wajib diisi.');
            return;
          }

          const subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
          appState.addCategory({
            name: name.trim(),
            type: selectedType,
            color,
            subcategories,
            icon: 'tag'
          });

          toast.success(`Kategori "${name}" berhasil ditambahkan!`);
          modal.close();
          if (typeof navigateToTab === 'function') {
            navigateToTab('categories');
          }
        }
      }
    ]
  });

  // Color preset buttons
  document.querySelectorAll('.btn-color-preset').forEach(btn => {
    btn.onclick = () => {
      const colorInput = document.getElementById('cat-color-input');
      if (colorInput) colorInput.value = btn.dataset.color;
    };
  });
}

/**
 * Open Modal to Edit Category
 */
export function openEditCategoryModal(categoryId, navigateToTab) {
  const cat = appState.getCategoryById(categoryId);
  if (!cat) return;

  modal.open({
    title: `Ubah Kategori "${cat.name}"`,
    content: `
      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Nama Kategori *</label>
        <input type="text" id="edit-cat-name" class="form-input" value="${cat.name}" required />
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Tipe Kategori</label>
        <select id="edit-cat-type" class="form-input">
          <option value="expense" ${cat.type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
          <option value="income" ${cat.type === 'income' ? 'selected' : ''}>Pemasukan</option>
        </select>
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Subkategori (Pisahkan dengan koma)</label>
        <textarea id="edit-cat-subcats" class="form-input" rows="3" placeholder="Contoh: Sayur & Buah, Daging, Bumbu Dapur">${(cat.subcategories || []).join(', ')}</textarea>
        <div style="font-size:0.6875rem;color:var(--text-muted);margin-top:0.25rem;">
          Anda dapat menambah atau mengurangi subkategori dengan memisahkannya menggunakan tanda koma (,).
        </div>
      </div>

      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Warna Kategori</label>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <input type="color" id="edit-cat-color" class="form-input" value="${cat.color || '#6366f1'}" style="width:52px;height:42px;padding:3px;border-radius:8px;cursor:pointer;" />
          <div style="display:flex;gap:0.35rem;flex-wrap:wrap;">
            ${['#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#ec4899'].map(c => `
              <button type="button" class="btn-color-preset" data-color="${c}" style="width:24px;height:24px;border-radius:50%;background:${c};border:none;cursor:pointer;outline:none;" title="${c}"></button>
            `).join('')}
          </div>
        </div>
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: 'Simpan Perubahan',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('edit-cat-name')?.value;
          const type = document.getElementById('edit-cat-type')?.value;
          const color = document.getElementById('edit-cat-color')?.value;
          const subcatsRaw = document.getElementById('edit-cat-subcats')?.value || '';

          if (!name || !name.trim()) {
            toast.error('Nama kategori tidak boleh kosong.');
            return;
          }

          const subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);

          appState.updateCategory(categoryId, {
            name: name.trim(),
            type,
            color,
            subcategories
          });

          toast.success(`Kategori "${name}" berhasil diperbarui!`);
          modal.close();
          if (typeof navigateToTab === 'function') {
            navigateToTab('categories');
          }
        }
      }
    ]
  });

  document.querySelectorAll('.btn-color-preset').forEach(btn => {
    btn.onclick = () => {
      const colorInput = document.getElementById('edit-cat-color');
      if (colorInput) colorInput.value = btn.dataset.color;
    };
  });
}

/**
 * Quick Add Subcategory Modal
 */
export function openAddSubcategoryModal(categoryId, navigateToTab) {
  const cat = appState.getCategoryById(categoryId);
  if (!cat) return;

  modal.open({
    title: `Tambah Subkategori: ${cat.name}`,
    content: `
      <div class="form-group" style="margin-bottom:1rem;">
        <label class="form-label">Nama Subkategori Baru</label>
        <input type="text" id="quick-subcat-name" class="form-input" placeholder="Contoh: Kopi / Snack Sore" required autofocus />
      </div>
      <div style="font-size:0.8125rem;color:var(--text-muted);background:var(--color-slate-50);padding:0.75rem;border-radius:8px;">
        <strong>Subkategori yang sudah ada:</strong><br>
        ${(cat.subcategories || []).length > 0 ? cat.subcategories.join(', ') : 'Belum ada'}
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: 'Tambah Subkategori',
        className: 'btn-primary',
        onClick: () => {
          const subName = document.getElementById('quick-subcat-name')?.value;
          if (!subName || !subName.trim()) {
            toast.error('Nama subkategori tidak boleh kosong.');
            return;
          }

          const trimmed = subName.trim();
          const currentSubs = cat.subcategories ? [...cat.subcategories] : [];

          if (currentSubs.includes(trimmed)) {
            toast.warning(`Subkategori "${trimmed}" sudah ada.`);
            return;
          }

          currentSubs.push(trimmed);
          appState.updateCategory(categoryId, { subcategories: currentSubs });
          toast.success(`Subkategori "${trimmed}" ditambahkan ke "${cat.name}"!`);
          modal.close();
          if (typeof navigateToTab === 'function') {
            navigateToTab('categories');
          }
        }
      }
    ]
  });
}

/**
 * Delete or Archive Category Modal
 */
export function openDeleteCategoryModal(categoryId, navigateToTab) {
  const cat = appState.getCategoryById(categoryId);
  if (!cat) return;

  const inUse = appState.isCategoryInUse(categoryId);

  if (inUse && !cat.isArchived) {
    modal.open({
      title: 'Hapus / Arsipkan Kategori',
      content: `
        <p style="font-size:0.875rem;color:var(--color-slate-700);line-height:1.5;margin-bottom:1rem;">
          Kategori <strong>"${cat.name}"</strong> memiliki riwayat transaksi terkait.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:0.75rem;font-size:0.8125rem;color:#991b1b;margin-bottom:1rem;">
          ⚠️ <strong>Pilihan Tindakan:</strong><br>
          • <strong>Arsipkan</strong>: Sembunyikan kategori dari pilihan pencatatan baru, riwayat lama tetap aman.<br>
          • <strong>Hapus Permanen</strong>: Hapus kategori secara total dari daftar.
        </div>
      `,
      footerButtons: [
        { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
        {
          label: 'Arsipkan Kategori',
          className: 'btn-secondary',
          onClick: () => {
            const res = appState.deleteOrArchiveCategory(categoryId, false);
            toast.info(res.message);
            modal.close();
            if (typeof navigateToTab === 'function') {
              navigateToTab('categories');
            }
          }
        },
        {
          label: 'Hapus Permanen',
          className: 'btn-danger',
          onClick: () => {
            const res = appState.deleteCategoryPermanently(categoryId);
            toast.success(res.message);
            modal.close();
            if (typeof navigateToTab === 'function') {
              navigateToTab('categories');
            }
          }
        }
      ]
    });
  } else {
    modal.confirm({
      title: 'Hapus Kategori',
      message: `Apakah Anda yakin ingin menghapus kategori <strong>"${cat.name}"</strong> secara permanen?`,
      confirmText: 'Ya, Hapus Kategori',
      confirmType: 'btn-danger',
      onConfirm: () => {
        const res = appState.deleteCategoryPermanently(categoryId);
        toast.success(res.message);
        if (typeof navigateToTab === 'function') {
          navigateToTab('categories');
        }
      }
    });
  }
}
