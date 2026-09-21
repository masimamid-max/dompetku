/**
 * Financial Goals / Celengan Digital Page Module (Dompet Keluarga V2)
 */
import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, parseRupiah, formatDate } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderGoalsPage() {
  const goals = appState.getGoals();
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const totalTargetAll = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCollectedAll = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTargetAll > 0 ? Math.round((totalCollectedAll / totalTargetAll) * 100) : 0;

  return `
    <div class="goals-page">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Tujuan Keuangan & Celengan Digital</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Rencanakan target tabungan masa depan keluarga secara kolaboratif
          </p>
        </div>

        <button class="btn btn-primary" id="btn-add-goal">
          ${Icons.plus(16)} Buat Target Baru
        </button>
      </div>

      <!-- Overall Goals Progress Card -->
      <div class="card" style="margin-bottom:1.5rem;background:linear-gradient(135deg, #ffffff, #f0fdf4);border-color:#a7f3d0;">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1.5rem;margin-bottom:1.25rem;">
          <div>
            <div style="font-size:0.8125rem;font-weight:700;color:var(--color-primary-700);text-transform:uppercase;">
              Total Dana Impian Terkumpul
            </div>
            <div style="font-size:1.875rem;font-weight:800;color:var(--color-slate-900);margin-top:0.25rem;">
              ${formatRupiah(totalCollectedAll)}
            </div>
            <div style="font-size:0.8125rem;color:var(--text-muted);margin-top:0.25rem;">
              Dari total target: <strong>${formatRupiah(totalTargetAll)}</strong> (${goals.length} target impian)
            </div>
          </div>

          <div style="text-align:right;">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Tingkat Pencapaian</div>
            <div style="font-size:2rem;font-weight:800;color:var(--color-primary-700);">${overallProgress}%</div>
          </div>
        </div>

        <div class="progress-bar-bg" style="height:14px;background:#e2e8f0;">
          <div class="progress-bar-fill progress-safe" style="width:${Math.min(overallProgress, 100)}%;"></div>
        </div>
      </div>

      <!-- Goals Grid -->
      <div class="budget-cards-grid">
        ${goals.map(goal => {
          const acc = accounts.find(a => a.id === goal.accountId);
          const isDone = goal.progress >= 100;

          return `
            <div class="budget-card" style="border-top:4px solid ${goal.color};">
              <div class="budget-card-header">
                <div class="budget-category-info">
                  <div class="budget-cat-icon" style="background:${goal.color}20;color:${goal.color};">
                    ${getCategoryIcon(goal.icon || 'target', 20)}
                  </div>
                  <div>
                    <div class="budget-cat-title">${goal.name}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">${goal.category} • Target: ${goal.targetDate ? formatDate(goal.targetDate, 'medium') : 'Tanpa batas'}</div>
                  </div>
                </div>

                <span class="badge" style="background:${isDone ? '#dcfce7' : '#e0f2fe'};color:${isDone ? '#15803d' : '#0369a1'};">
                  ${isDone ? '🎉 Tercapai' : `${goal.progress}%`}
                </span>
              </div>

              <!-- Progress Bar -->
              <div class="progress-bar-bg" style="height:10px;">
                <div 
                  class="progress-bar-fill" 
                  style="width:${goal.progress}%;background:${goal.color};"
                ></div>
              </div>

              <div class="budget-amounts-row">
                <div>
                  <span>Terkumpul: </span>
                  <span style="font-weight:800;color:var(--color-slate-900);">${formatRupiah(goal.currentAmount)}</span>
                </div>
                <div>
                  <span>Target: </span>
                  <span style="font-weight:700;color:var(--text-muted);">${formatRupiah(goal.targetAmount)}</span>
                </div>
              </div>

              <div class="budget-remaining">
                <span style="color:var(--text-muted);">Akun Penyimpan:</span>
                <span style="font-weight:700;color:var(--color-slate-800);">${acc ? acc.name : 'Kas Keluarga'}</span>
              </div>

              ${goal.notes ? `
                <div style="font-size:0.75rem;color:var(--text-muted);font-style:italic;">
                  "${goal.notes}"
                </div>
              ` : ''}

              <div style="display:flex;gap:0.375rem;margin-top:0.5rem;">
                <button class="btn btn-primary btn-sm action-deposit-goal" data-id="${goal.id}" data-name="${goal.name}" style="flex:1;">
                  ${Icons.plus(14)} Setor Dana
                </button>
                <button class="btn btn-secondary btn-icon btn-sm action-edit-goal" data-id="${goal.id}" title="Edit Target">
                  ${Icons.edit(14)}
                </button>
                <button class="btn btn-secondary btn-icon btn-sm action-delete-goal" data-id="${goal.id}" data-name="${goal.name}" title="Hapus Target" style="color:var(--color-expense);">
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

export function attachGoalsListeners() {
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);

  // Add Goal Modal
  const addBtn = document.getElementById('btn-add-goal');
  if (addBtn) {
    addBtn.onclick = () => {
      modal.open({
        title: 'Buat Target Tabungan / Celengan Baru',
        content: `
          <div class="form-group">
            <label class="form-label">Nama Target Finansial *</label>
            <input type="text" id="goal-name-input" class="form-input" placeholder="Contoh: Dana Darurat 6 Bulan, Liburan Akhir Tahun, Beli Laptop" required />
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Target Nominal (Rp) *</label>
              <div class="currency-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <input type="text" id="goal-target-amount" class="form-input currency-input" placeholder="0" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Setoran Awal (Opsional)</label>
              <div class="currency-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <input type="text" id="goal-init-amount" class="form-input currency-input" placeholder="0" />
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Target Tercapai (Tanggal)</label>
              <input type="date" id="goal-date-input" class="form-input" value="2026-12-31" />
            </div>
            <div class="form-group">
              <label class="form-label">Simpan di Rekening / Dompet</label>
              <select id="goal-account-select" class="form-select">
                ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Catatan / Rencana Target</label>
            <input type="text" id="goal-notes-input" class="form-input" placeholder="Contoh: Disisihkan Rp 1 Juta dari gaji tiap bulan" />
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan Target',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('goal-name-input')?.value;
              const targetAmount = parseRupiah(document.getElementById('goal-target-amount')?.value);
              const initAmount = parseRupiah(document.getElementById('goal-init-amount')?.value);
              const targetDate = document.getElementById('goal-date-input')?.value;
              const accountId = document.getElementById('goal-account-select')?.value;
              const notes = document.getElementById('goal-notes-input')?.value;

              if (!name || !name.trim()) {
                toast.error('Nama target wajib diisi.');
                return;
              }
              if (!targetAmount || targetAmount <= 0) {
                toast.error('Target nominal harus lebih dari Rp 0.');
                return;
              }

              appState.addGoal({
                name: name.trim(),
                targetAmount,
                initialAmount: initAmount,
                targetDate,
                accountId,
                notes
              });

              toast.success(`Target tabungan "${name}" berhasil dibuat!`);
              modal.close();
            }
          }
        ]
      });

      ['goal-target-amount', 'goal-init-amount'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.oninput = (e) => {
            const raw = parseRupiah(e.target.value);
            e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
          };
        }
      });
    };
  }

  // Deposit to Goal Modal
  document.querySelectorAll('.action-deposit-goal').forEach(btn => {
    btn.onclick = () => {
      const goalId = btn.dataset.id;
      const goal = appState.getGoalById(goalId);
      if (!goal) return;

      modal.open({
        title: `Setor Dana: ${goal.name}`,
        content: `
          <div class="form-group">
            <label class="form-label">Nominal Setoran (IDR) *</label>
            <div class="currency-input-wrapper">
              <span class="currency-prefix">Rp</span>
              <input type="text" id="deposit-amount-input" class="form-input currency-input" placeholder="0" />
            </div>
            <div class="quick-presets" style="margin-top:0.75rem;">
              <button type="button" class="preset-chip" data-val="100000">+100 rb</button>
              <button type="button" class="preset-chip" data-val="500000">+500 rb</button>
              <button type="button" class="preset-chip" data-val="1000000">+1 jt</button>
              <button type="button" class="preset-chip" data-val="2000000">+2 jt</button>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Sumber Dana (Rekening / Dompet) *</label>
            <select id="deposit-account-select" class="form-select">
              ${accounts.map(a => `
                <option value="${a.id}">${a.name} (${formatRupiah(a.currentBalance)})</option>
              `).join('')}
            </select>
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Konfirmasi Setoran',
            className: 'btn-primary',
            onClick: () => {
              const amount = parseRupiah(document.getElementById('deposit-amount-input')?.value);
              const accId = document.getElementById('deposit-account-select')?.value;

              if (!amount || amount <= 0) {
                toast.error('Masukkan nominal setoran yang valid.');
                return;
              }

              const res = appState.depositToGoal(goalId, amount, accId);
              if (res.success) {
                toast.success(res.message);
                modal.close();
              } else {
                toast.error(res.message);
              }
            }
          }
        ]
      });

      const input = document.getElementById('deposit-amount-input');
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
    };
  });

  // Delete Goal
  document.querySelectorAll('.action-delete-goal').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      modal.confirm({
        title: 'Hapus Target Tabungan',
        message: `Apakah Anda yakin ingin menghapus target tabungan <strong>"${name}"</strong>?`,
        confirmText: 'Ya, Hapus',
        confirmType: 'btn-danger',
        onConfirm: () => {
          appState.deleteGoal(id);
          toast.success('Target tabungan telah dihapus.');
        }
      });
    };
  });
}
