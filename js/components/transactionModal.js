/**
 * Quick Add / Edit / Duplicate Transaction Modal
 */
import { appState } from '../state.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons } from './icons.js';
import { formatRupiah, parseRupiah } from '../utils.js';
import { openReceiptScanModal } from './receiptScanModal.js';
import { openAiModal } from './aiModal.js';
import { openTelegramModal } from './telegramSimulator.js';
import { LicenseService } from '../utils/licenseService.js';
import { openLicenseActivationModal } from './licenseModal.js';

export function openTransactionModal(existingTx = null) {
  // Paywall Check for New Transactions (Requires Active Developer / PRO License)
  if (!existingTx && !LicenseService.isLicensed()) {
    openLicenseActivationModal('Pencatatan Transaksi Baru');
    return;
  }

  const isEdit = !!existingTx;
  let currentType = existingTx ? existingTx.type : 'expense';
  let currentReceiptUrl = existingTx && existingTx.receiptUrl ? existingTx.receiptUrl : null;

  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const members = appState.members;
  const categories = appState.categories.filter(c => !c.isArchived);

  function renderContent(type) {
    const activeCategories = categories.filter(c => c.type === type);
    const defaultDate = existingTx ? existingTx.date : new Date().toISOString().split('T')[0];
    const defaultAmount = existingTx ? existingTx.amount : '';
    const defaultDesc = existingTx ? existingTx.description : '';
    const defaultAccountId = existingTx ? existingTx.accountId : (accounts[0] ? accounts[0].id : '');
    const defaultTargetAccId = existingTx ? existingTx.targetAccountId : (accounts[1] ? accounts[1].id : '');
    const defaultMemberId = existingTx ? existingTx.memberId : appState.currentUser.id;
    const defaultCategoryId = existingTx && existingTx.categoryId ? existingTx.categoryId : (activeCategories[0] ? activeCategories[0].id : '');
    const defaultSubcategory = existingTx && existingTx.subcategory ? existingTx.subcategory : '';
    const defaultNotes = existingTx && existingTx.notes ? existingTx.notes : '';
    const defaultStatus = existingTx && existingTx.status ? existingTx.status : 'verified';

    const selectedCategory = activeCategories.find(c => c.id === defaultCategoryId) || activeCategories[0];
    const subcategories = selectedCategory ? (selectedCategory.subcategories || []) : [];

    return `
      <form id="transaction-form" onsubmit="return false;">
        ${!isEdit ? `
          <!-- Baris Opsi Input Cepat & Cerdas -->
          <div style="background:var(--color-slate-50,#f8fafc);border:1px solid var(--border-subtle,#e2e8f0);border-radius:12px;padding:0.6rem 0.75rem;margin-bottom:1rem;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;flex-wrap:wrap;">
            <span style="font-size:0.75rem;font-weight:700;color:var(--text-muted,#64748b);text-transform:uppercase;letter-spacing:0.04em;">Mode Pintar:</span>
            <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-ocr" style="background:#eff6ff;color:#1d4ed8;border-color:#bfdbfe;padding:0.35rem 0.65rem;font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:0.35rem;" title="Foto atau Scan Nota Belanja">
                ${Icons.camera(14)} Scan Struk AI
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-ai" style="background:#f5f3ff;color:#6d28d9;border-color:#ddd6fe;padding:0.35rem 0.65rem;font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:0.35rem;" title="Ketik Bahasa Santai / Suara">
                ${Icons.sparkles(14)} Catat AI
              </button>
              <button type="button" class="btn btn-secondary btn-sm" id="btn-quick-bot" style="background:#f8fafc;color:#334155;border-color:#cbd5e1;padding:0.35rem 0.65rem;font-size:0.75rem;font-weight:700;display:flex;align-items:center;gap:0.35rem;" title="Simulasi Input via Bot Telegram">
                ${Icons.bot(14)} Bot Telegram
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Type Selection -->
        <div class="type-segmented-control">
          <button type="button" class="segment-btn type-expense ${type === 'expense' ? 'active' : ''}" data-type="expense">
            ${Icons.trendingDown(16)} Pengeluaran
          </button>
          <button type="button" class="segment-btn type-income ${type === 'income' ? 'active' : ''}" data-type="income">
            ${Icons.trendingUp(16)} Pemasukan
          </button>
          <button type="button" class="segment-btn type-transfer ${type === 'transfer' ? 'active' : ''}" data-type="transfer">
            ${Icons.arrowRightLeft(16)} Transfer
          </button>
        </div>

        <!-- Nominal Input -->
        <div class="form-group">
          <label class="form-label">Nominal Transaksi *</label>
          <div class="currency-input-wrapper">
            <span class="currency-prefix">Rp</span>
            <input 
              type="text" 
              id="tx-amount-input" 
              class="form-input currency-input" 
              placeholder="0" 
              value="${defaultAmount ? parseRupiah(defaultAmount).toLocaleString('id-ID') : ''}"
              required 
              autocomplete="off"
            />
          </div>
          <div class="quick-presets">
            <button type="button" class="preset-chip" data-add="10000">+10 rb</button>
            <button type="button" class="preset-chip" data-add="20000">+20 rb</button>
            <button type="button" class="preset-chip" data-add="50000">+50 rb</button>
            <button type="button" class="preset-chip" data-add="100000">+100 rb</button>
            <button type="button" class="preset-chip" data-add="500000">+500 rb</button>
            <button type="button" class="preset-chip" data-add="1000000">+1 jt</button>
          </div>
        </div>

        <!-- Description & Date Row -->
        <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">Deskripsi Transaksi *</label>
            <input 
              type="text" 
              id="tx-desc-input" 
              class="form-input" 
              placeholder="Contoh: Belanja Sayur di Pasar" 
              value="${defaultDesc}" 
              required 
            />
          </div>
          <div class="form-group">
            <label class="form-label">Tanggal *</label>
            <input 
              type="date" 
              id="tx-date-input" 
              class="form-input" 
              value="${defaultDate}" 
              required 
            />
          </div>
        </div>

        ${type !== 'transfer' ? `
          <!-- Category & Subcategory Row -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Kategori *</label>
              <select id="tx-category-select" class="form-select">
                ${activeCategories.map(c => `
                  <option value="${c.id}" ${c.id === defaultCategoryId ? 'selected' : ''}>
                    ${c.name}
                  </option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Subkategori (Opsional)</label>
              <select id="tx-subcategory-select" class="form-select">
                <option value="">-- Pilih Subkategori --</option>
                ${subcategories.map(s => `
                  <option value="${s}" ${s === defaultSubcategory ? 'selected' : ''}>${s}</option>
                `).join('')}
              </select>
            </div>
          </div>
        ` : ''}

        <!-- Accounts Row -->
        <div style="display:grid;grid-template-columns:${type === 'transfer' ? '1fr 1fr' : '1fr'};gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">${type === 'transfer' ? 'Dari Akun (Asal) *' : 'Rekening / Dompet *'}</label>
            <select id="tx-account-select" class="form-select">
              ${accounts.map(a => `
                <option value="${a.id}" ${a.id === defaultAccountId ? 'selected' : ''}>
                  ${a.name} (${formatRupiah(a.currentBalance)})
                </option>
              `).join('')}
            </select>
          </div>

          ${type === 'transfer' ? `
            <div class="form-group">
              <label class="form-label">Ke Akun (Tujuan) *</label>
              <select id="tx-target-account-select" class="form-select">
                ${accounts.map(a => `
                  <option value="${a.id}" ${a.id === defaultTargetAccId ? 'selected' : ''}>
                    ${a.name} (${formatRupiah(a.currentBalance)})
                  </option>
                `).join('')}
              </select>
            </div>
          ` : ''}
        </div>

        <!-- Member & Status Row -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group">
            <label class="form-label">Anggota yang Bertransaksi *</label>
            <select id="tx-member-select" class="form-select">
              ${members.map(m => `
                <option value="${m.id}" ${m.id === defaultMemberId ? 'selected' : ''}>
                  ${m.name} (${m.roleLabel || m.role})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Status Transaksi</label>
            <select id="tx-status-select" class="form-select">
              <option value="verified" ${defaultStatus === 'verified' ? 'selected' : ''}>✓ Terverifikasi</option>
              <option value="cancelled" ${defaultStatus === 'cancelled' ? 'selected' : ''}>✕ Dibatalkan</option>
            </select>
          </div>
        </div>

        <!-- Notes -->
        <div class="form-group">
          <label class="form-label">Catatan Tambahan (Opsional)</label>
          <input 
            type="text" 
            id="tx-notes-input" 
            class="form-input" 
            placeholder="Contoh: Titipan Ibu, Struk tersimpan di lemari" 
            value="${defaultNotes}" 
          />
        </div>

        <!-- Receipt / Struk Image Attachment -->
        <div class="form-group" style="margin-bottom:0.5rem;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.375rem;">
            <label class="form-label" style="margin-bottom:0;">Lampiran Foto Struk / Nota</label>
            <button type="button" id="btn-switch-to-ocr" style="background:none;border:none;color:#2563eb;font-size:0.75rem;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:0.25rem;">
              ${Icons.camera(14)} Pindai Otomatis Pakai AI
            </button>
          </div>
          <div id="receipt-upload-container" style="border:1.5px dashed var(--color-slate-300);border-radius:var(--radius-md);padding:0.75rem;background:var(--color-slate-50);text-align:center;">
            ${currentReceiptUrl ? `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:1rem;background:white;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                  <img src="${currentReceiptUrl}" alt="Struk" style="width:48px;height:48px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);" />
                  <div style="text-align:left;">
                    <div style="font-size:0.8125rem;font-weight:700;color:var(--color-slate-800);">Foto Struk Terlampir</div>
                    <div style="font-size:0.6875rem;color:var(--text-muted);">Siap disimpan bersama transaksi</div>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-remove-receipt" style="color:var(--color-expense);">
                  ${Icons.trash(14)} Hapus
                </button>
              </div>
            ` : `
              <label for="receipt-file-input" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.375rem;padding:0.5rem 0;">
                <span style="color:var(--color-primary-600);">${Icons.image(24)}</span>
                <span style="font-size:0.8125rem;font-weight:700;color:var(--color-slate-700);">Klik untuk Unggah Foto Struk / Bukti Transfer</span>
                <span style="font-size:0.6875rem;color:var(--text-muted);">Format JPG, PNG, atau WebP (Maks. 2MB)</span>
              </label>
              <input type="file" id="receipt-file-input" accept="image/*" style="display:none;" />
            `}
          </div>
        </div>
      </form>
    `;
  }

  function attachListeners() {
    const form = document.getElementById('transaction-form');
    if (!form) return;

    // Type buttons
    form.querySelectorAll('.segment-btn').forEach(btn => {
      btn.onclick = () => {
        currentType = btn.dataset.type;
        const body = document.querySelector('.modal-body');
        if (body) {
          body.innerHTML = renderContent(currentType);
          attachListeners();
        }
      };
    });

    // Amount formatter
    const amountInput = document.getElementById('tx-amount-input');
    if (amountInput) {
      amountInput.oninput = (e) => {
        const raw = parseRupiah(e.target.value);
        e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
      };
    }

    // Quick chips
    form.querySelectorAll('.preset-chip').forEach(chip => {
      chip.onclick = () => {
        const add = parseInt(chip.dataset.add, 10);
        const current = parseRupiah(amountInput.value);
        amountInput.value = (current + add).toLocaleString('id-ID');
      };
    });

    // Category change subcategories updater
    const catSelect = document.getElementById('tx-category-select');
    const subcatSelect = document.getElementById('tx-subcategory-select');
    if (catSelect && subcatSelect) {
      catSelect.onchange = () => {
        const cat = categories.find(c => c.id === catSelect.value);
        const subcats = cat ? (cat.subcategories || []) : [];
        subcatSelect.innerHTML = `
          <option value="">-- Pilih Subkategori --</option>
          ${subcats.map(s => `<option value="${s}">${s}</option>`).join('')}
        `;
      };
    }

    // Receipt File Input Listener
    const receiptInput = document.getElementById('receipt-file-input');
    if (receiptInput) {
      receiptInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
          toast.error('Ukuran file foto maksimal 3MB.');
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          currentReceiptUrl = event.target.result;
          const body = document.querySelector('.modal-body');
          if (body) {
            body.innerHTML = renderContent(currentType);
            attachListeners();
          }
          toast.success('Foto struk berhasil dimuat!');
        };
        reader.readAsDataURL(file);
      };
    }

    // Remove Receipt Button Listener
    const removeReceiptBtn = document.getElementById('btn-remove-receipt');
    if (removeReceiptBtn) {
      removeReceiptBtn.onclick = () => {
        currentReceiptUrl = null;
        const body = document.querySelector('.modal-body');
        if (body) {
          body.innerHTML = renderContent(currentType);
          attachListeners();
        }
      };
    }

    // Switch to OCR Scanner Button
    const switchOcrBtn = document.getElementById('btn-switch-to-ocr');
    if (switchOcrBtn) {
      switchOcrBtn.onclick = () => {
        openReceiptScanModal();
      };
    }

    // Quick Smart Option Buttons (Scan Struk, AI, Telegram)
    const quickOcrBtn = document.getElementById('btn-quick-ocr');
    if (quickOcrBtn) {
      quickOcrBtn.onclick = () => {
        openReceiptScanModal();
      };
    }

    const quickAiBtn = document.getElementById('btn-quick-ai');
    if (quickAiBtn) {
      quickAiBtn.onclick = () => {
        openAiModal();
      };
    }

    const quickBotBtn = document.getElementById('btn-quick-bot');
    if (quickBotBtn) {
      quickBotBtn.onclick = () => {
        openTelegramModal();
      };
    }
  }

  modal.open({
    title: isEdit ? 'Ubah Catatan Transaksi' : 'Catat Transaksi Baru',
    content: renderContent(currentType),
    maxWidth: '560px',
    footerButtons: [
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: isEdit ? 'Simpan Perubahan' : 'Simpan Transaksi',
        className: 'btn-primary',
        onClick: () => {
          const amountRaw = parseRupiah(document.getElementById('tx-amount-input')?.value);
          const desc = document.getElementById('tx-desc-input')?.value;
          const date = document.getElementById('tx-date-input')?.value;
          const accountId = document.getElementById('tx-account-select')?.value;
          const memberId = document.getElementById('tx-member-select')?.value;
          const status = document.getElementById('tx-status-select')?.value;
          const notes = document.getElementById('tx-notes-input')?.value;
          const catSelect = document.getElementById('tx-category-select');
          const subcatSelect = document.getElementById('tx-subcategory-select');
          const targetAccSelect = document.getElementById('tx-target-account-select');

          // Validations
          if (!amountRaw || amountRaw <= 0) {
            toast.error('Harap masukkan nominal transaksi yang valid.');
            return;
          }
          if (!desc || !desc.trim()) {
            toast.error('Deskripsi transaksi wajib diisi.');
            return;
          }
          if (!date) {
            toast.error('Tanggal transaksi wajib dipilih.');
            return;
          }
          if (!accountId) {
            toast.error('Harap pilih akun rekening/dompet.');
            return;
          }
          if (currentType === 'transfer') {
            const targetAccId = targetAccSelect ? targetAccSelect.value : null;
            if (!targetAccId) {
              toast.error('Harap pilih akun tujuan transfer.');
              return;
            }
            if (targetAccId === accountId) {
              toast.error('Akun asal dan akun tujuan transfer tidak boleh sama.');
              return;
            }
          }

          const payload = {
            type: currentType,
            amount: amountRaw,
            description: desc,
            date,
            accountId,
            targetAccountId: currentType === 'transfer' ? targetAccSelect.value : undefined,
            categoryId: currentType !== 'transfer' ? catSelect.value : undefined,
            subcategory: currentType !== 'transfer' && subcatSelect.value ? subcatSelect.value : undefined,
            memberId,
            status,
            notes,
            receiptUrl: currentReceiptUrl || undefined
          };

          if (isEdit) {
            appState.updateTransaction(existingTx.id, payload);
            toast.success('Transaksi berhasil diperbarui!');
          } else {
            appState.addTransaction(payload);
            toast.success('Transaksi berhasil dicatat!');
          }

          modal.close();
        }
      }
    ]
  });

  attachListeners();
}
