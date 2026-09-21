/**
 * Budgets Page Module
 */
import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, parseRupiah, getMonthName } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderBudgetsPage() {
  const budgetProgressList = appState.getCategoryBudgetsWithProgress();
  const totalBudget = budgetProgressList.reduce((sum, b) => sum + b.budgetAmount, 0);
  const totalSpent = budgetProgressList.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const warningCount = budgetProgressList.filter(b => b.status === 'warning').length;
  const dangerCount = budgetProgressList.filter(b => b.status === 'danger').length;

  const months = [
    { num: 1, name: 'Januari' }, { num: 2, name: 'Februari' }, { num: 3, name: 'Maret' },
    { num: 4, name: 'April' }, { num: 5, name: 'Mei' }, { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' }, { num: 8, name: 'Agustus' }, { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' }, { num: 11, name: 'November' }, { num: 12, name: 'Desember' }
  ];

  return `
    <div class="budgets-page">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Anggaran Bulanan</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Rencanakan dan kendalikan pengeluaran keluarga per kategori
          </p>
        </div>

        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <div class="month-year-picker">
            <span style="color:var(--color-primary-600);">${Icons.calendar(18)}</span>
            <select id="budget-month-select" class="month-select">
              ${months.map(m => `
                <option value="${m.num}" ${m.num === appState.selectedMonth ? 'selected' : ''}>
                  ${m.name}
                </option>
              `).join('')}
            </select>
            <select id="budget-year-select" class="year-select">
              <option value="2025" ${appState.selectedYear === 2025 ? 'selected' : ''}>2025</option>
              <option value="2026" ${appState.selectedYear === 2026 ? 'selected' : ''}>2026</option>
              <option value="2027" ${appState.selectedYear === 2027 ? 'selected' : ''}>2027</option>
            </select>
          </div>

          <button class="btn btn-secondary" id="btn-copy-prev-budget">
            ${Icons.copy(16)} Salin Bulan Lalu
          </button>

          <button class="btn btn-primary" id="btn-add-budget-header">
            ${Icons.plus(16)} Atur Anggaran Kategori
          </button>
        </div>
      </div>

      <!-- Overall Budget Summary Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1.5rem;margin-bottom:1.25rem;">
          <div>
            <span style="font-size:0.8125rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">
              Total Anggaran Bulan ${getMonthName(appState.selectedMonth)} ${appState.selectedYear}
            </span>
            <div style="font-size:1.75rem;font-weight:800;color:var(--color-slate-900);margin-top:0.25rem;">
              ${formatRupiah(totalBudget)}
            </div>
          </div>

          <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
            <div>
              <div style="font-size:0.75rem;font-weight:600;color:var(--text-muted);">Terpakai</div>
              <div style="font-size:1.125rem;font-weight:800;color:var(--color-expense);">${formatRupiah(totalSpent)}</div>
            </div>
            <div>
              <div style="font-size:0.75rem;font-weight:600;color:var(--text-muted);">Sisa Anggaran</div>
              <div style="font-size:1.125rem;font-weight:800;color:${totalRemaining >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                ${formatRupiah(totalRemaining)}
              </div>
            </div>
            <div>
              <div style="font-size:0.75rem;font-weight:600;color:var(--text-muted);">Realisasi Total</div>
              <div style="font-size:1.125rem;font-weight:800;color:var(--color-slate-800);">${overallPercent}%</div>
            </div>
          </div>
        </div>

        <div class="progress-bar-bg" style="height:12px;">
          <div 
            class="progress-bar-fill ${overallPercent >= 100 ? 'progress-danger' : overallPercent >= 80 ? 'progress-warning' : 'progress-safe'}"
            style="width: ${Math.min(overallPercent, 100)}%;"
          ></div>
        </div>

        ${dangerCount > 0 || warningCount > 0 ? `
          <div style="display:flex;gap:1rem;margin-top:1rem;padding-top:0.75rem;border-top:1px solid var(--border-subtle);flex-wrap:wrap;font-size:0.8125rem;font-weight:600;">
            ${dangerCount > 0 ? `
              <span style="color:var(--color-expense);display:inline-flex;align-items:center;gap:0.35rem;">
                ${Icons.alertTriangle(15)} <strong>${dangerCount} kategori</strong> telah melebihi batas anggaran (≥100%)
              </span>
            ` : ''}
            ${warningCount > 0 ? `
              <span style="color:var(--color-warning);display:inline-flex;align-items:center;gap:0.35rem;">
                ${Icons.alertTriangle(15)} <strong>${warningCount} kategori</strong> mendekati batas (80%-99%)
              </span>
            ` : ''}
          </div>
        ` : ''}
      </div>

      <!-- Category Budget Cards Grid -->
      <div class="budget-cards-grid">
        ${budgetProgressList.map(item => {
          const cat = item.category;
          const statusClass = item.status === 'danger' ? 'budget-status-danger' : item.status === 'warning' ? 'budget-status-warning' : 'budget-status-safe';
          const statusLabel = item.status === 'danger' ? 'Melebihi Batas' : item.status === 'warning' ? 'Waspada (≥80%)' : item.budgetAmount === 0 ? 'Belum Diatur' : 'Aman';

          return `
            <div class="budget-card">
              <div class="budget-card-header">
                <div class="budget-category-info">
                  <div class="budget-cat-icon" style="background:${cat.color}20;color:${cat.color};">
                    ${getCategoryIcon(cat.icon, 20)}
                  </div>
                  <div>
                    <div class="budget-cat-title">${cat.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${item.percent}% terpakai</div>
                  </div>
                </div>

                <span class="budget-status-pill ${statusClass}">
                  ${statusLabel}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="progress-bar-bg">
                <div 
                  class="progress-bar-fill ${item.status === 'danger' ? 'progress-danger' : item.status === 'warning' ? 'progress-warning' : 'progress-safe'}"
                  style="width: ${Math.min(item.percent, 100)}%;"
                ></div>
              </div>

              <div class="budget-amounts-row">
                <div>
                  <span>Terpakai: </span>
                  <span class="budget-spent">${formatRupiah(item.spentAmount)}</span>
                </div>
                <div>
                  <span>Target: </span>
                  <span style="font-weight:700;color:var(--color-slate-900);">${formatRupiah(item.budgetAmount)}</span>
                </div>
              </div>

              <div class="budget-remaining">
                <span style="color:var(--text-muted);">Sisa alokasi:</span>
                <span style="font-weight:800;color:${item.remainingAmount >= 0 ? 'var(--color-primary-700)' : 'var(--color-expense)'};">
                  ${formatRupiah(item.remainingAmount)}
                </span>
              </div>

              <!-- Action Buttons Row -->
              <div style="display:flex;gap:0.375rem;align-items:center;margin-top:0.25rem;">
                <button class="btn btn-secondary btn-sm action-set-budget" data-cat-id="${cat.id}" data-current="${item.budgetAmount}" style="flex:1;">
                  ${Icons.edit(14)} Atur Target
                </button>
                <button class="btn btn-secondary btn-icon btn-sm action-edit-cat-from-budget" data-cat-id="${cat.id}" title="Edit Detail Kategori (${cat.name})">
                  ${Icons.settings(14)}
                </button>
                ${item.budgetAmount > 0 ? `
                  <button class="btn btn-secondary btn-icon btn-sm action-clear-budget" data-cat-id="${cat.id}" data-name="${cat.name}" title="Nolkan Anggaran Bulan Ini" style="color:var(--color-expense);">
                    ${Icons.x(14)}
                  </button>
                ` : ''}
                <button class="btn btn-secondary btn-icon btn-sm action-delete-cat-from-budget" data-cat-id="${cat.id}" data-name="${cat.name}" title="Hapus / Arsipkan Kategori" style="color:var(--color-expense);">
                  ${Icons.trash(14)}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

// Modal for Creating New Custom Category (e.g. Investasi)
function openCreateCategoryModal(prefillType = 'expense', onCreatedCallback = null) {
  modal.open({
    title: 'Tambah Kategori Kustom Baru',
    content: `
      <div class="form-group">
        <label class="form-label">Nama Kategori *</label>
        <input 
          type="text" 
          id="custom-cat-name-input" 
          class="form-input" 
          placeholder="Contoh: Investasi & Reksadana, Tabungan Haji, Zakat" 
          required 
        />
      </div>

      <div class="form-group">
        <label class="form-label">Jenis Kategori *</label>
        <select id="custom-cat-type-select" class="form-select">
          <option value="expense" ${prefillType === 'expense' ? 'selected' : ''}>Pengeluaran / Anggaran Belanja</option>
          <option value="income" ${prefillType === 'income' ? 'selected' : ''}>Pemasukan</option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Subkategori (Pisahkan dengan tanda koma)</label>
        <input 
          type="text" 
          id="custom-cat-subcats-input" 
          class="form-input" 
          placeholder="Contoh: Saham, Reksadana Pasar Uang, Emas Batangan, P2P" 
        />
        <span class="form-hint">Opsional. Membantu merinci pencatatan transaksi lebih spesifik.</span>
      </div>

      <div class="form-group">
        <label class="form-label">Pilihan Warna Kategori</label>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <input 
            type="color" 
            id="custom-cat-color-input" 
            class="form-input" 
            value="#0284c7" 
            style="width:54px;height:42px;padding:2px;cursor:pointer;" 
          />
          <span style="font-size:0.8125rem;color:var(--text-muted);">Pilih warna tema untuk grafik & kartu anggaran</span>
        </div>
      </div>
    `,
    footerButtons: [
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: 'Simpan Kategori Baru',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('custom-cat-name-input')?.value;
          const type = document.getElementById('custom-cat-type-select')?.value || 'expense';
          const subcatsRaw = document.getElementById('custom-cat-subcats-input')?.value || '';
          const color = document.getElementById('custom-cat-color-input')?.value || '#0284c7';

          if (!name || !name.trim()) {
            toast.error('Nama kategori wajib diisi.');
            return;
          }

          const subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
          const newCat = appState.addCategory({
            name: name.trim(),
            type,
            color,
            subcategories,
            icon: type === 'expense' ? 'target' : 'trendingUp'
          });

          toast.success(`Kategori kustom "${newCat.name}" berhasil ditambahkan!`);
          modal.close();

          if (onCreatedCallback) {
            onCreatedCallback(newCat);
          }
        }
      }
    ]
  });
}

// Modal for Editing Existing Category Metadata (Name, Color, Subcategories)
function openEditCategoryModal(catId) {
  const cat = appState.getCategoryById(catId);
  if (!cat) return;

  modal.open({
    title: `Edit Kategori: ${cat.name}`,
    content: `
      <div class="form-group">
        <label class="form-label">Nama Kategori *</label>
        <input type="text" id="edit-cat-name-input" class="form-input" value="${cat.name}" required />
      </div>

      <div class="form-group">
        <label class="form-label">Subkategori (Pisahkan dengan koma)</label>
        <input 
          type="text" 
          id="edit-cat-subcats-input" 
          class="form-input" 
          value="${(cat.subcategories || []).join(', ')}" 
        />
      </div>

      <div class="form-group">
        <label class="form-label">Warna Kategori</label>
        <div style="display:flex;align-items:center;gap:0.75rem;">
          <input 
            type="color" 
            id="edit-cat-color-input" 
            class="form-input" 
            value="${cat.color || '#6366f1'}" 
            style="width:54px;height:42px;padding:2px;cursor:pointer;" 
          />
          <span style="font-size:0.8125rem;color:var(--text-muted);">Pilih warna kartu anggaran & grafik</span>
        </div>
      </div>
    `,
    footerButtons: [
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: 'Simpan Perubahan',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('edit-cat-name-input')?.value;
          const subcatsRaw = document.getElementById('edit-cat-subcats-input')?.value || '';
          const color = document.getElementById('edit-cat-color-input')?.value || cat.color;

          if (!name || !name.trim()) {
            toast.error('Nama kategori wajib diisi.');
            return;
          }

          const subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
          appState.updateCategory(catId, {
            name: name.trim(),
            color,
            subcategories
          });

          toast.success(`Kategori "${name}" berhasil diperbarui!`);
          modal.close();
        }
      }
    ]
  });
}

function openCategoryBudgetModal(selectedCatId = null) {
  const expenseCats = appState.getCategories('expense');
  const defaultCatId = selectedCatId || (expenseCats[0] ? expenseCats[0].id : '');
  const existingBudget = appState.budgets.find(b => b.categoryId === defaultCatId && b.month === appState.selectedMonth && b.year === appState.selectedYear);
  const currentVal = existingBudget ? existingBudget.amount : 0;

  modal.open({
    title: 'Rencanakan & Atur Anggaran Kategori',
    content: `
      <div class="form-group">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.25rem;">
          <label class="form-label" style="margin-bottom:0;">Pilih Kategori Pengeluaran *</label>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-create-cat" style="font-size:0.75rem;padding:0.2rem 0.5rem;">
            ${Icons.plus(12)} + Tambah Kategori Baru
          </button>
        </div>
        <select id="modal-cat-select" class="form-select">
          ${expenseCats.map(c => `
            <option value="${c.id}" ${c.id === defaultCatId ? 'selected' : ''}>${c.name}</option>
          `).join('')}
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">Alokasi Anggaran Bulan ${getMonthName(appState.selectedMonth)} ${appState.selectedYear} (IDR) *</label>
        <div class="currency-input-wrapper">
          <span class="currency-prefix">Rp</span>
          <input 
            type="text" 
            id="modal-budget-input" 
            class="form-input currency-input" 
            value="${currentVal > 0 ? currentVal.toLocaleString('id-ID') : ''}" 
            placeholder="0" 
            autocomplete="off"
          />
        </div>
        <div class="quick-presets" style="margin-top:0.75rem;">
          <button type="button" class="preset-chip" data-val="500000">+500 rb</button>
          <button type="button" class="preset-chip" data-val="1000000">+1 jt</button>
          <button type="button" class="preset-chip" data-val="2000000">+2 jt</button>
          <button type="button" class="preset-chip" data-val="3500000">+3.5 jt</button>
          <button type="button" class="preset-chip" data-val="5000000">+5 jt</button>
        </div>
      </div>
    `,
    footerButtons: [
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: 'Hapus / Nolkan',
        className: 'btn-secondary',
        onClick: () => {
          const catSelect = document.getElementById('modal-cat-select');
          const catId = catSelect ? catSelect.value : defaultCatId;
          const cat = appState.getCategoryById(catId);
          appState.setBudget(catId, 0, appState.selectedMonth, appState.selectedYear);
          toast.info(`Anggaran ${cat ? cat.name : 'kategori'} dinolkan.`);
          modal.close();
        }
      },
      {
        label: 'Simpan Anggaran',
        className: 'btn-primary',
        onClick: () => {
          const catSelect = document.getElementById('modal-cat-select');
          const catId = catSelect ? catSelect.value : defaultCatId;
          const input = document.getElementById('modal-budget-input');
          const val = parseRupiah(input?.value);
          const cat = appState.getCategoryById(catId);

          appState.setBudget(catId, val, appState.selectedMonth, appState.selectedYear);
          toast.success(`Anggaran ${cat ? cat.name : 'kategori'} berhasil disimpan: ${formatRupiah(val)}`);
          modal.close();
        }
      }
    ]
  });

  // Quick create category button inside budget modal
  const quickCreateCatBtn = document.getElementById('btn-quick-create-cat');
  if (quickCreateCatBtn) {
    quickCreateCatBtn.onclick = () => {
      openCreateCategoryModal('expense', (newCat) => {
        // Automatically reopen budget modal selecting newly created category!
        openCategoryBudgetModal(newCat.id);
      });
    };
  }

  const catSelect = document.getElementById('modal-cat-select');
  const input = document.getElementById('modal-budget-input');

  if (catSelect && input) {
    catSelect.onchange = () => {
      const b = appState.budgets.find(b => b.categoryId === catSelect.value && b.month === appState.selectedMonth && b.year === appState.selectedYear);
      input.value = b && b.amount > 0 ? b.amount.toLocaleString('id-ID') : '';
    };
  }

  if (input) {
    input.oninput = (e) => {
      const raw = parseRupiah(e.target.value);
      e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
    };
  }

  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.onclick = () => {
      const val = parseInt(chip.dataset.val, 10);
      input.value = val.toLocaleString('id-ID');
    };
  });
}

export function attachBudgetsListeners() {
  const monthSelect = document.getElementById('budget-month-select');
  const yearSelect = document.getElementById('budget-year-select');

  if (monthSelect) {
    monthSelect.onchange = (e) => {
      appState.selectedMonth = parseInt(e.target.value, 10);
      appState.notify();
    };
  }

  if (yearSelect) {
    yearSelect.onchange = (e) => {
      appState.selectedYear = parseInt(e.target.value, 10);
      appState.notify();
    };
  }

  // Copy previous month budget
  const copyBtn = document.getElementById('btn-copy-prev-budget');
  if (copyBtn) {
    copyBtn.onclick = () => {
      modal.confirm({
        title: 'Salin Anggaran Bulan Sebelumnya',
        message: `Apakah Anda ingin menyalin seluruh target anggaran kategori dari bulan ${getMonthName(appState.selectedMonth === 1 ? 12 : appState.selectedMonth - 1)} ke bulan <strong>${getMonthName(appState.selectedMonth)} ${appState.selectedYear}</strong>?`,
        confirmText: 'Ya, Salin Anggaran',
        confirmType: 'btn-primary',
        onConfirm: () => {
          const res = appState.copyBudgetsFromPreviousMonth(appState.selectedMonth, appState.selectedYear);
          if (res.count > 0) {
            toast.success(res.message);
          } else {
            toast.info(res.message);
          }
        }
      });
    };
  }

  // Header Add / Set Budget button
  const addHeaderBtn = document.getElementById('btn-add-budget-header');
  if (addHeaderBtn) {
    addHeaderBtn.onclick = () => openCategoryBudgetModal();
  }

  // Set Budget for single category card
  document.querySelectorAll('.action-set-budget').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.catId;
      openCategoryBudgetModal(catId);
    };
  });

  // Edit Category details directly from card
  document.querySelectorAll('.action-edit-cat-from-budget').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.catId;
      openEditCategoryModal(catId);
    };
  });

  // Clear / Zero budget for category this month
  document.querySelectorAll('.action-clear-budget').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.catId;
      const catName = btn.dataset.name;
      modal.confirm({
        title: 'Nolkan Anggaran Kategori',
        message: `Apakah Anda yakin ingin menonaktifkan / menolkan target anggaran untuk kategori <strong>"${catName}"</strong> pada bulan ${getMonthName(appState.selectedMonth)} ${appState.selectedYear}?`,
        confirmText: 'Ya, Nolkan Target',
        confirmType: 'btn-secondary',
        onConfirm: () => {
          appState.setBudget(catId, 0, appState.selectedMonth, appState.selectedYear);
          toast.info(`Anggaran "${catName}" telah dinolkan.`);
        }
      });
    };
  });

  // Delete / Archive Category directly from card
  document.querySelectorAll('.action-delete-cat-from-budget').forEach(btn => {
    btn.onclick = () => {
      const catId = btn.dataset.catId;
      const catName = btn.dataset.name;
      modal.confirm({
        title: 'Hapus / Arsipkan Kategori',
        message: `Apakah Anda yakin ingin menghapus kategori <strong>"${catName}"</strong>? Jika kategori ini sudah memiliki riwayat transaksi, sistem akan mengarsipkannya agar laporan keuangan tetap aman.`,
        confirmText: 'Ya, Lanjutkan',
        confirmType: 'btn-danger',
        onConfirm: () => {
          const res = appState.deleteOrArchiveCategory(catId);
          toast.info(res.message);
        }
      });
    };
  });
}


