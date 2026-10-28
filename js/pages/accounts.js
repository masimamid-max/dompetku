/**
 * Accounts & Kantong Keuangan Page Component
 * Dedicated page for managing accounts & shifting balances between financial pockets
 */
import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, parseRupiah } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderAccountsPage() {
  const accounts = appState.getAccountsWithBalances();
  const activeAccounts = accounts.filter(a => !a.isArchived);
  const archivedAccounts = accounts.filter(a => a.isArchived);
  const canManage = appState.canManageFinances();

  // Calculate totals
  let totalNetBalance = 0;
  let totalCash = 0;
  let totalBank = 0;
  let totalEwallet = 0;

  activeAccounts.forEach(acc => {
    totalNetBalance += (acc.currentBalance || 0);
    if (acc.type === 'cash') totalCash += (acc.currentBalance || 0);
    else if (acc.type === 'bank') totalBank += (acc.currentBalance || 0);
    else if (acc.type === 'ewallet') totalEwallet += (acc.currentBalance || 0);
  });

  return `
    <div class="accounts-page" style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Page Header -->
      <div class="dashboard-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);letter-spacing:-0.02em;">
            Akun & Rekening Keuangan
          </h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Kelola seluruh kantong kas, rekening bank, & e-wallet keluarga serta geser dana antar kantong dengan mudah
          </p>
        </div>

        <div style="display:flex;gap:0.625rem;flex-wrap:wrap;">
          <button class="btn btn-primary" id="btn-accounts-shift-balance" style="display:inline-flex;align-items:center;gap:0.4rem;border-radius:var(--radius-full);font-weight:700;">
            <span style="font-size:1.1rem;">🔁</span>
            <span>Geser / Pindah Saldo</span>
          </button>
          ${canManage ? `
            <button class="btn btn-secondary" id="btn-accounts-add-account" style="display:inline-flex;align-items:center;gap:0.4rem;border-radius:var(--radius-full);font-weight:700;">
              ${Icons.plus(16)}
              <span>Tambah Akun</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- Total Wealth & Kantong Summary Metric Cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
        <!-- Total Net Balance -->
        <div class="card" style="background:var(--primary-gradient-subtle, #ecfdf5);border:1.5px solid var(--color-primary-200);position:relative;overflow:hidden;">
          <div style="font-size:0.75rem;font-weight:800;color:var(--color-primary-800);text-transform:uppercase;letter-spacing:0.04em;">
            Total Saldo Seluruh Kantong
          </div>
          <div style="font-size:1.65rem;font-weight:800;color:var(--color-primary-700);margin-top:0.35rem;letter-spacing:-0.02em;">
            ${formatRupiah(totalNetBalance)}
          </div>
          <div style="font-size:0.75rem;color:var(--color-slate-600);margin-top:0.35rem;">
            ${activeAccounts.length} akun aktif terpantau
          </div>
        </div>

        <!-- Bank Balance -->
        <div class="card" style="border:1px solid var(--border-subtle);">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.35rem;">
            <span>🏦</span> Rekening Bank
          </div>
          <div style="font-size:1.35rem;font-weight:800;color:var(--color-slate-900);margin-top:0.35rem;">
            ${formatRupiah(totalBank)}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">
            Tabungan & operasional bank
          </div>
        </div>

        <!-- Cash Balance -->
        <div class="card" style="border:1px solid var(--border-subtle);">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.35rem;">
            <span>💵</span> Uang Tunai (Kas)
          </div>
          <div style="font-size:1.35rem;font-weight:800;color:var(--color-slate-900);margin-top:0.35rem;">
            ${formatRupiah(totalCash)}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">
            Dompet fisik harian
          </div>
        </div>

        <!-- E-Wallet Balance -->
        <div class="card" style="border:1px solid var(--border-subtle);">
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.35rem;">
            <span>📱</span> Dompet Digital (E-Wallet)
          </div>
          <div style="font-size:1.35rem;font-weight:800;color:${totalEwallet < 0 ? 'var(--color-expense)' : 'var(--color-slate-900)'};margin-top:0.35rem;">
            ${formatRupiah(totalEwallet)}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">
            ShopeePay, GoPay, OVO, dll.
          </div>
        </div>
      </div>

      <!-- Drag & Drop Interactive Notice -->
      <div style="padding:0.75rem 1rem;background:white;border:1px dashed var(--color-primary-300);border-radius:var(--radius-md);display:flex;align-items:center;gap:0.75rem;color:var(--color-primary-800);font-size:0.8125rem;">
        <span style="font-size:1.25rem;">💡</span>
        <span>
          <strong>Fitur Geser Saldo Cepat:</strong> Klik tombol <strong>"🔁 Geser Saldo"</strong> pada kartu akun, atau tarik kartu (drag & drop) ke kartu akun lain untuk langsung memindahkan dana secara seketika!
        </span>
      </div>

      <!-- Active Accounts Grid -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.creditCard(18)} Daftar Kantong & Rekening Aktif (${activeAccounts.length})</div>
            <div class="card-subtitle">Saldo berjalan dihitung otomatis dari saldo awal dan riwayat mutasi transaksi</div>
          </div>
        </div>

        <div class="accounts-cards-grid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(320px, 1fr));gap:1.25rem;">
          ${activeAccounts.map(acc => {
            const isNegative = (acc.currentBalance || 0) < 0;
            return `
              <div class="account-kantong-card" data-account-id="${acc.id}" draggable="true" style="background:white;border:1.5px solid var(--border-subtle);border-radius:var(--radius-lg);padding:1.25rem;display:flex;flex-direction:column;gap:1rem;position:relative;transition:all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);box-shadow:var(--shadow-xs);cursor:grab;">
                
                <!-- Card Header -->
                <div style="display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                  <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
                    <div style="width:44px;height:44px;border-radius:14px;background:${acc.color}20;color:${acc.color};display:grid;place-items:center;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                      ${getCategoryIcon(acc.icon || 'wallet', 22)}
                    </div>
                    <div style="min-width:0;">
                      <div style="font-size:1rem;font-weight:800;color:var(--color-slate-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${acc.name}
                      </div>
                      <span class="badge" style="background:#f1f5f9;color:var(--color-slate-700);font-size:0.6875rem;margin-top:0.2rem;">
                        ${acc.typeLabel || acc.type}
                      </span>
                    </div>
                  </div>

                  <!-- Quick Action Icons -->
                  ${canManage ? `
                    <div style="display:flex;gap:0.35rem;align-items:center;">
                      <button class="btn btn-secondary btn-icon btn-sm action-edit-account" data-id="${acc.id}" title="Ubah Nama/Saldo Awal Akun">
                        ${Icons.edit(14)}
                      </button>
                      <button class="btn btn-secondary btn-icon btn-sm action-delete-account" data-id="${acc.id}" title="Hapus Akun" style="color:var(--color-expense);">
                        ${Icons.trash(14)}
                      </button>
                    </div>
                  ` : ''}
                </div>

                <!-- Balance Display -->
                <div style="background:var(--color-slate-50);padding:0.85rem 1rem;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
                  <div style="font-size:0.6875rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">
                    Saldo Tersedia
                  </div>
                  <div style="font-size:1.35rem;font-weight:800;color:${isNegative ? 'var(--color-expense)' : 'var(--color-slate-900)'};margin-top:0.2rem;">
                    ${formatRupiah(acc.currentBalance)}
                  </div>
                  <div style="font-size:0.6875rem;color:var(--text-muted);margin-top:0.3rem;">
                    Saldo Awal: ${formatRupiah(acc.initialBalance)}
                  </div>
                </div>

                <!-- Footer Quick Transfer Button -->
                <button class="btn btn-primary btn-sm action-quick-shift" data-id="${acc.id}" style="width:100%;border-radius:var(--radius-full);font-weight:700;display:flex;align-items:center;justify-content:center;gap:0.4rem;">
                  <span>🔁</span>
                  <span>Geser Saldo dari Akun Ini</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Archived Accounts Section (if any) -->
      ${archivedAccounts.length > 0 ? `
        <div class="card" style="opacity:0.85;">
          <div class="card-header">
            <div class="card-title">📁 Akun & Rekening yang Diarsipkan (${archivedAccounts.length})</div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:1rem;">
            ${archivedAccounts.map(acc => `
              <div style="padding:1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;">
                <div>
                  <div style="font-weight:700;color:var(--color-slate-800);">${acc.name}</div>
                  <div style="font-size:0.75rem;color:var(--text-muted);">Saldo Terakhir: ${formatRupiah(acc.currentBalance)}</div>
                </div>
                <div style="display:flex;gap:0.35rem;">
                  <button class="btn btn-secondary btn-sm action-restore-account" data-id="${acc.id}" style="color:#059669;font-weight:700;" title="Aktifkan Kembali">
                    ${Icons.refresh(14)} Pulihkan
                  </button>
                  <button class="btn btn-secondary btn-icon btn-sm action-delete-account" data-id="${acc.id}" style="color:var(--color-expense);" title="Hapus Permanen">
                    ${Icons.trash(14)}
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Interactive Modal for Shifting / Moving Balance between Pockets (Accounts)
 */
export function openShiftBalanceModal(initialSourceId = null, initialTargetId = null) {
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  if (accounts.length < 2) {
    toast.error('Anda membutuhkan minimal 2 akun aktif untuk dapat menggeser saldo.');
    return;
  }

  let sourceId = initialSourceId || accounts[0].id;
  let targetId = initialTargetId || (accounts.find(a => a.id !== sourceId)?.id || accounts[1].id);

  function getModalContent(srcId, dstId, nominal = '', note = '') {
    const srcAcc = accounts.find(a => a.id === srcId) || accounts[0];
    const dstAcc = accounts.find(a => a.id === dstId) || accounts[1];
    const maxBalance = Math.max(0, srcAcc.currentBalance || 0);

    return `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <!-- Visual Transfer Flow Cards -->
        <div style="display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:0.75rem;background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-lg);border:1px solid var(--border-subtle);">
          
          <!-- Source Pocket -->
          <div style="display:flex;flex-direction:column;gap:0.35rem;">
            <label style="font-size:0.6875rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">
              Dari Kantong (Sumber)
            </label>
            <select id="shift-source-select" class="form-select" style="font-weight:700;border-radius:10px;padding:0.5rem;">
              ${accounts.map(a => `
                <option value="${a.id}" ${a.id === srcAcc.id ? 'selected' : ''}>
                  ${a.name} (${formatRupiah(a.currentBalance)})
                </option>
              `).join('')}
            </select>
            <div style="font-size:0.75rem;color:var(--color-primary-700);font-weight:600;margin-top:0.15rem;">
              Sisa Saldo: <strong>${formatRupiah(srcAcc.currentBalance)}</strong>
            </div>
          </div>

          <!-- Swap Direction Button -->
          <button id="btn-shift-swap" type="button" class="btn btn-secondary btn-icon" style="width:36px;height:36px;border-radius:50%;margin-top:1.25rem;flex-shrink:0;" title="Tukar Arah Penggeseran">
            ⇄
          </button>

          <!-- Destination Pocket -->
          <div style="display:flex;flex-direction:column;gap:0.35rem;">
            <label style="font-size:0.6875rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;">
              Ke Kantong (Tujuan)
            </label>
            <select id="shift-target-select" class="form-select" style="font-weight:700;border-radius:10px;padding:0.5rem;">
              ${accounts.map(a => `
                <option value="${a.id}" ${a.id === dstAcc.id ? 'selected' : ''}>
                  ${a.name} (${formatRupiah(a.currentBalance)})
                </option>
              `).join('')}
            </select>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-top:0.15rem;">
              Saldo Sekarang: <strong>${formatRupiah(dstAcc.currentBalance)}</strong>
            </div>
          </div>
        </div>

        <!-- Amount Input & Quick Slider -->
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label" style="font-weight:800;">Jumlah Dana yang Digeser (Nominal) *</label>
          <div class="currency-input-wrapper">
            <span class="currency-prefix">Rp</span>
            <input type="text" id="shift-amount-input" class="form-input currency-input" placeholder="0" value="${nominal}" required autofocus />
          </div>

          <!-- Quick Nominal Preset Chips -->
          <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-top:0.6rem;">
            <button type="button" class="preset-chip btn-preset-val" data-val="50000">+50rb</button>
            <button type="button" class="preset-chip btn-preset-val" data-val="100000">+100rb</button>
            <button type="button" class="preset-chip btn-preset-val" data-val="250000">+250rb</button>
            <button type="button" class="preset-chip btn-preset-val" data-val="500000">+500rb</button>
            <button type="button" class="preset-chip btn-preset-val" data-val="1000000">+1 Jt</button>
            ${maxBalance > 0 ? `
              <button type="button" class="preset-chip btn-preset-all" data-val="${maxBalance}" style="background:var(--color-primary-50);color:var(--color-primary-700);border-color:var(--color-primary-300);font-weight:700;">
                Semua Saldo (${formatRupiah(maxBalance)})
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Notes / Suggestions -->
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Keperluan / Keterangan Transfer</label>
          <input type="text" id="shift-desc-input" class="form-input" placeholder="Contoh: Tarik tunai dari ATM ke kas tunai" value="${note}" />
          
          <!-- Suggestion Chips -->
          <div style="display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.5rem;">
            <span class="preset-chip chip-note-suggest" data-text="Tarik Tunai ATM">Tarik Tunai ATM</span>
            <span class="preset-chip chip-note-suggest" data-text="Top Up E-Wallet">Top Up E-Wallet</span>
            <span class="preset-chip chip-note-suggest" data-text="Setor Tunai ke Bank">Setor Tunai</span>
            <span class="preset-chip chip-note-suggest" data-text="Sisihkan ke Tabungan">Tabungan</span>
            <span class="preset-chip chip-note-suggest" data-text="Pindah Saldo Operasional">Operasional</span>
          </div>
        </div>

        <!-- Date Picker -->
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Tanggal Penggeseran</label>
          <input type="date" id="shift-date-input" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      </div>
    `;
  }

  modal.open({
    title: '🔁 Geser Saldo Antar Kantong Keuangan',
    content: getModalContent(sourceId, targetId),
    maxWidth: '560px',
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: '🚀 Geser & Pindahkan Saldo',
        className: 'btn-primary',
        onClick: () => {
          const srcSelect = document.getElementById('shift-source-select');
          const dstSelect = document.getElementById('shift-target-select');
          const amountInput = document.getElementById('shift-amount-input');
          const descInput = document.getElementById('shift-desc-input');
          const dateInput = document.getElementById('shift-date-input');

          const fromId = srcSelect?.value;
          const toId = dstSelect?.value;
          const amount = parseRupiah(amountInput?.value);
          const desc = descInput?.value?.trim() || '';
          const date = dateInput?.value || new Date().toISOString().split('T')[0];

          if (!fromId || !toId) {
            toast.error('Pilih kantong sumber dan tujuan.');
            return;
          }
          if (fromId === toId) {
            toast.error('Kantong sumber dan tujuan tidak boleh sama.');
            return;
          }
          if (!amount || amount <= 0) {
            toast.error('Masukkan nominal dana yang ingin digeser.');
            return;
          }

          const fromAcc = accounts.find(a => a.id === fromId);
          const toAcc = accounts.find(a => a.id === toId);

          // Add transfer transaction
          appState.addTransaction({
            type: 'transfer',
            accountId: fromId,
            targetAccountId: toId,
            amount: amount,
            description: desc || `Pindah saldo dari ${fromAcc.name} ke ${toAcc.name}`,
            date: date,
            notes: 'Geser saldo antar kantong'
          });

          toast.success(`🎉 Berhasil menggeser saldo ${formatRupiah(amount)} dari ${fromAcc.name} ke ${toAcc.name}!`);
          modal.close();
          appState.notify();
        }
      }
    ]
  });

  // Attach event handlers inside modal
  function bindModalEvents() {
    const amountInput = document.getElementById('shift-amount-input');
    if (amountInput) {
      amountInput.oninput = (e) => {
        const val = parseRupiah(e.target.value);
        e.target.value = val > 0 ? val.toLocaleString('id-ID') : '';
      };
    }

    // Preset Value Chips
    document.querySelectorAll('.btn-preset-val').forEach(btn => {
      btn.onclick = () => {
        const addVal = parseInt(btn.dataset.val, 10);
        const curVal = parseRupiah(amountInput.value) || 0;
        const total = curVal + addVal;
        amountInput.value = total.toLocaleString('id-ID');
      };
    });

    // Preset All Balance
    const presetAll = document.querySelector('.btn-preset-all');
    if (presetAll) {
      presetAll.onclick = () => {
        const allVal = parseInt(presetAll.dataset.val, 10);
        amountInput.value = allVal.toLocaleString('id-ID');
      };
    }

    // Note suggestion chips
    document.querySelectorAll('.chip-note-suggest').forEach(chip => {
      chip.onclick = () => {
        const descInput = document.getElementById('shift-desc-input');
        if (descInput) descInput.value = chip.dataset.text;
      };
    });

    // Swap Direction Button
    const swapBtn = document.getElementById('btn-shift-swap');
    if (swapBtn) {
      swapBtn.onclick = () => {
        const srcSelect = document.getElementById('shift-source-select');
        const dstSelect = document.getElementById('shift-target-select');
        const oldSrc = srcSelect.value;
        const oldDst = dstSelect.value;
        srcSelect.value = oldDst;
        dstSelect.value = oldSrc;
      };
    }
  }

  bindModalEvents();
}

/**
 * Open Modal to Add a New Account
 */
export function openAddAccountModal() {
  modal.open({
    title: 'Tambah Rekening / Dompet Baru',
    content: `
      <div class="form-group">
        <label class="form-label">Nama Akun / Bank *</label>
        <input type="text" id="acc-name-input" class="form-input" placeholder="Contoh: Bank Jago Tabungan" required />
      </div>
      <div class="form-group">
        <label class="form-label">Jenis Akun *</label>
        <select id="acc-type-select" class="form-select">
          <option value="bank">Rekening Bank</option>
          <option value="cash">Uang Tunai</option>
          <option value="ewallet">Dompet Digital (E-Wallet)</option>
          <option value="savings">Tabungan Khusus</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Saldo Awal (IDR) *</label>
        <div class="currency-input-wrapper">
          <span class="currency-prefix">Rp</span>
          <input type="text" id="acc-init-balance" class="form-input currency-input" placeholder="0" />
        </div>
        <span class="form-hint">Saldo berjalan selanjutnya dihitung otomatis dari transaksi</span>
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: 'Tambah Akun',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('acc-name-input')?.value;
          const type = document.getElementById('acc-type-select')?.value;
          const initBalance = parseRupiah(document.getElementById('acc-init-balance')?.value);
          if (!name || !name.trim()) {
            toast.error('Nama akun wajib diisi.');
            return;
          }
          const typeLabels = { bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet', savings: 'Tabungan' };
          const colors = { bank: '#3b82f6', cash: '#10b981', ewallet: '#06b6d4', savings: '#6366f1' };

          appState.addAccount({
            name: name.trim(),
            type,
            typeLabel: typeLabels[type] || 'Akun',
            initialBalance: initBalance,
            color: colors[type] || '#3b82f6',
            icon: type === 'cash' ? 'wallet' : 'creditCard'
          });

          toast.success(`Akun "${name}" berhasil ditambahkan!`);
          modal.close();
          appState.notify();
        }
      }
    ]
  });

  const initBalInput = document.getElementById('acc-init-balance');
  if (initBalInput) {
    initBalInput.oninput = (e) => {
      const val = parseRupiah(e.target.value);
      e.target.value = val > 0 ? val.toLocaleString('id-ID') : '';
    };
  }
}

/**
 * Open Modal to Edit an Existing Account
 */
export function openEditAccountModal(accountId) {
  const acc = appState.getAccountById(accountId);
  if (!acc) return;

  modal.open({
    title: `Ubah Akun: ${acc.name}`,
    content: `
      <div class="form-group">
        <label class="form-label">Nama Akun / Bank *</label>
        <input type="text" id="edit-acc-name-input" class="form-input" value="${acc.name}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Jenis Akun *</label>
        <select id="edit-acc-type-select" class="form-select">
          <option value="bank" ${acc.type === 'bank' ? 'selected' : ''}>Rekening Bank</option>
          <option value="cash" ${acc.type === 'cash' ? 'selected' : ''}>Uang Tunai</option>
          <option value="ewallet" ${acc.type === 'ewallet' ? 'selected' : ''}>Dompet Digital (E-Wallet)</option>
          <option value="savings" ${acc.type === 'savings' ? 'selected' : ''}>Tabungan Khusus</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label">Saldo Awal (IDR) *</label>
        <div class="currency-input-wrapper">
          <span class="currency-prefix">Rp</span>
          <input type="text" id="edit-acc-init-balance" class="form-input currency-input" value="${(acc.initialBalance || 0).toLocaleString('id-ID')}" />
        </div>
        <span class="form-hint">Saldo berjalan: ${formatRupiah(acc.currentBalance)}</span>
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: 'Simpan Perubahan',
        className: 'btn-primary',
        onClick: () => {
          const name = document.getElementById('edit-acc-name-input')?.value;
          const type = document.getElementById('edit-acc-type-select')?.value;
          const initBalance = parseRupiah(document.getElementById('edit-acc-init-balance')?.value);

          if (!name || !name.trim()) {
            toast.error('Nama akun wajib diisi.');
            return;
          }

          const typeLabels = { bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet', savings: 'Tabungan' };
          const colors = { bank: '#3b82f6', cash: '#10b981', ewallet: '#06b6d4', savings: '#6366f1' };

          appState.updateAccount(accountId, {
            name: name.trim(),
            type,
            typeLabel: typeLabels[type] || 'Akun',
            initialBalance: initBalance,
            color: colors[type] || acc.color,
            icon: type === 'cash' ? 'wallet' : 'creditCard'
          });

          toast.success(`Akun "${name}" berhasil diperbarui!`);
          modal.close();
          appState.notify();
        }
      }
    ]
  });

  const initBalInput = document.getElementById('edit-acc-init-balance');
  if (initBalInput) {
    initBalInput.oninput = (e) => {
      const val = parseRupiah(e.target.value);
      e.target.value = val > 0 ? val.toLocaleString('id-ID') : '';
    };
  }
}

/**
 * Delete or Archive Account with safety confirmation
 */
export function openDeleteAccountModal(accountId) {
  const acc = appState.getAccountById(accountId);
  if (!acc) return;

  const inUse = appState.isAccountInUse(accountId);
  if (inUse && !acc.isArchived) {
    modal.open({
      title: 'Hapus / Arsipkan Akun',
      content: `
        <p style="font-size:0.875rem;color:var(--color-slate-700);line-height:1.5;margin-bottom:1rem;">
          Akun <strong>"${acc.name}"</strong> memiliki riwayat transaksi terkait.
        </p>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:0.75rem;font-size:0.8125rem;color:#991b1b;margin-bottom:1rem;">
          ⚠️ <strong>Pilihan Tindakan:</strong><br>
          • <strong>Arsipkan</strong>: Sembunyikan akun dari pilihan transaksi baru, riwayat saldo lama tetap aman.<br>
          • <strong>Hapus Permanen</strong>: Hapus akun secara total dari daftar.
        </div>
      `,
      footerButtons: [
        { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
        {
          label: 'Arsipkan Akun',
          className: 'btn-secondary',
          onClick: () => {
            const res = appState.deleteAccount(accountId, false);
            toast.info(res.message);
            modal.close();
            appState.notify();
          }
        },
        {
          label: 'Hapus Permanen',
          className: 'btn-danger',
          onClick: () => {
            const res = appState.deleteAccountPermanently(accountId);
            toast.success(res.message);
            modal.close();
            appState.notify();
          }
        }
      ]
    });
  } else {
    modal.confirm({
      title: 'Hapus Akun',
      message: `Apakah Anda yakin ingin menghapus akun <strong>"${acc.name}"</strong> secara permanen?`,
      confirmText: 'Ya, Hapus Akun',
      confirmType: 'btn-danger',
      onConfirm: () => {
        const res = appState.deleteAccountPermanently(accountId);
        toast.success(res.message);
        appState.notify();
      }
    });
  }
}

/**
 * Attach listeners & Drag-and-Drop for Accounts page
 */
export function attachAccountsListeners(navigateToTab) {
  // Main Top Buttons
  const shiftBtn = document.getElementById('btn-accounts-shift-balance');
  if (shiftBtn) {
    shiftBtn.onclick = () => openShiftBalanceModal();
  }

  const addAccBtn = document.getElementById('btn-accounts-add-account');
  if (addAccBtn) {
    addAccBtn.onclick = () => openAddAccountModal();
  }

  // Quick Shift Buttons on Cards
  document.querySelectorAll('.action-quick-shift').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      openShiftBalanceModal(id);
    };
  });

  // Edit Account Buttons
  document.querySelectorAll('.action-edit-account').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      openEditAccountModal(id);
    };
  });

  // Delete Account Buttons
  document.querySelectorAll('.action-delete-account').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      openDeleteAccountModal(id);
    };
  });

  // Restore Account Buttons
  document.querySelectorAll('.action-restore-account').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      appState.toggleArchiveAccount(id);
      toast.success('Akun telah diaktifkan kembali!');
      appState.notify();
    };
  });

  // Drag and Drop: Drag Card A onto Card B to shift balance!
  let draggedCardId = null;
  const cards = document.querySelectorAll('.account-kantong-card');

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      draggedCardId = card.getAttribute('data-account-id');
      card.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', draggedCardId);
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      cards.forEach(c => {
        c.style.borderColor = 'var(--border-subtle)';
        c.style.transform = '';
      });
    });

    card.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const targetId = card.getAttribute('data-account-id');
      if (draggedCardId && targetId !== draggedCardId) {
        card.style.borderColor = 'var(--color-primary-500)';
        card.style.transform = 'scale(1.02)';
      }
    });

    card.addEventListener('dragleave', () => {
      card.style.borderColor = 'var(--border-subtle)';
      card.style.transform = '';
    });

    card.addEventListener('drop', (e) => {
      e.preventDefault();
      card.style.borderColor = 'var(--border-subtle)';
      card.style.transform = '';
      const targetId = card.getAttribute('data-account-id');
      if (draggedCardId && targetId && draggedCardId !== targetId) {
        openShiftBalanceModal(draggedCardId, targetId);
      }
    });
  });
}
