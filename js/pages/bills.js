/**
 * Recurring Bills & Bill Reminders Page Module (Dompet Keluarga V2)
 */
import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, parseRupiah, formatDate } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';

export function renderBillsPage() {
  const bills = appState.getRecurringBills();
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const categories = appState.categories;

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const paidBills = bills.filter(b => b.isPaidThisMonth);
  const unpaidBills = bills.filter(b => !b.isPaidThisMonth);
  const totalPaid = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const todayDate = new Date().getDate();

  return `
    <div class="bills-page">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Tagihan Rutin & Pengingat</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Pantau tanggal jatuh tempo dan bayar kewajiban bulanan tepat waktu
          </p>
        </div>

        <button class="btn btn-primary" id="btn-add-bill">
          ${Icons.plus(16)} Tambah Tagihan
        </button>
      </div>

      <!-- Summary Metrics Grid -->
      <div class="metrics-grid" style="margin-bottom:1.5rem;">
        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Total Kewajiban Bulanan</span>
            <div class="metric-icon-box" style="background:#eef2ff;color:#4f46e5;">
              ${Icons.calendarCheck(20)}
            </div>
          </div>
          <div class="metric-value">${formatRupiah(totalMonthlyBills)}</div>
          <div class="metric-footer trend-neutral">
            <span>${bills.length} tagihan terdaftar</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Sudah Dibayar (Bulan Ini)</span>
            <div class="metric-icon-box" style="background:var(--color-income-light);color:var(--color-income);">
              ${Icons.checkCircle(20)}
            </div>
          </div>
          <div class="metric-value" style="color:var(--color-income);">${formatRupiah(totalPaid)}</div>
          <div class="metric-footer trend-up-good">
            <span>${paidBills.length} tagihan lunas</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-card-top">
            <span class="metric-label">Belum Dibayar</span>
            <div class="metric-icon-box" style="background:var(--color-expense-light);color:var(--color-expense);">
              ${Icons.alertTriangle(20)}
            </div>
          </div>
          <div class="metric-value" style="color:${totalUnpaid > 0 ? 'var(--color-expense)' : 'var(--color-income)'};">
            ${formatRupiah(totalUnpaid)}
          </div>
          <div class="metric-footer ${totalUnpaid > 0 ? 'trend-up-bad' : 'trend-neutral'}">
            <span>${unpaidBills.length} tagihan menunggu</span>
          </div>
        </div>
      </div>

      <!-- Bills List Card -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:1.25rem 1.5rem;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
          <div class="card-title">${Icons.zap(18)} Jadwal Jatuh Tempo Tagihan</div>
        </div>

        <div class="transactions-list">
          ${bills.map(bill => {
            const cat = categories.find(c => c.id === bill.categoryId);
            const acc = accounts.find(a => a.id === bill.accountId);
            const catColor = cat ? cat.color : '#6366f1';
            const iconName = cat ? cat.icon : 'zap';

            const daysLeft = bill.dueDay - todayDate;
            let statusBadge = '';
            if (bill.isPaidThisMonth) {
              statusBadge = `<span class="badge" style="background:#dcfce7;color:#15803d;">✓ Lunas (${bill.lastPaidDate ? formatDate(bill.lastPaidDate, 'short') : 'Bulan ini'})</span>`;
            } else if (daysLeft < 0) {
              statusBadge = `<span class="badge" style="background:#fee2e2;color:#b91c1c;">⚠️ Terlewat (Tgl ${bill.dueDay})</span>`;
            } else if (daysLeft <= 3) {
              statusBadge = `<span class="badge" style="background:#fef3c7;color:#b45309;">⏰ Jatuh Tempo (${daysLeft === 0 ? 'Hari Ini' : `${daysLeft} hari lagi`})</span>`;
            } else {
              statusBadge = `<span class="badge" style="background:#f1f5f9;color:#475569;">Jatuh tempo tgl ${bill.dueDay}</span>`;
            }

            return `
              <div class="transaction-item" style="opacity:${bill.isPaidThisMonth ? '0.75' : '1'};">
                <div class="transaction-left">
                  <div class="tx-category-icon" style="background:${catColor}20;color:${catColor};">
                    ${getCategoryIcon(iconName, 20)}
                  </div>
                  <div class="tx-main-info">
                    <div class="tx-desc-row">
                      <span class="tx-desc">${bill.name}</span>
                      ${statusBadge}
                    </div>
                    <div class="tx-meta-row">
                      <span>Kategori: ${cat ? cat.name : 'Tagihan'}</span>
                      <span>• Rekening Default: ${acc ? acc.name : '-'}</span>
                      ${bill.notes ? `<span>• ${bill.notes}</span>` : ''}
                    </div>
                  </div>
                </div>

                <div class="tx-right">
                  <div class="tx-amount-col">
                    <div class="tx-amount expense">${formatRupiah(bill.amount)}</div>
                    <span style="font-size:0.6875rem;color:var(--text-muted);">per bulan</span>
                  </div>

                  <div class="tx-actions-menu">
                    ${!bill.isPaidThisMonth ? `
                      <button class="btn btn-primary btn-sm action-pay-bill" data-id="${bill.id}" data-name="${bill.name}" data-amount="${bill.amount}">
                        ${Icons.checkCircle(14)} Bayar
                      </button>
                    ` : `
                      <button class="btn btn-secondary btn-sm action-unpay-bill" data-id="${bill.id}" title="Tandai Belum Dibayar">
                        ${Icons.refresh(14)}
                      </button>
                    `}
                    <button class="btn btn-secondary btn-icon btn-sm action-delete-bill" data-id="${bill.id}" data-name="${bill.name}" title="Hapus Tagihan" style="color:var(--color-expense);">
                      ${Icons.trash(14)}
                    </button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

export function attachBillsListeners() {
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const categories = appState.categories.filter(c => c.type === 'expense');

  // Add Bill Modal
  const addBtn = document.getElementById('btn-add-bill');
  if (addBtn) {
    addBtn.onclick = () => {
      modal.open({
        title: 'Tambah Tagihan Rutin Baru',
        content: `
          <div class="form-group">
            <label class="form-label">Nama Tagihan / Layanan *</label>
            <input type="text" id="bill-name-input" class="form-input" placeholder="Contoh: Listrik PLN, BPJS, Indihome, SPP Sekolah" required />
          </div>

          <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Nominal Tagihan (Rp) *</label>
              <div class="currency-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <input type="text" id="bill-amount-input" class="form-input currency-input" placeholder="0" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Jatuh Tempo (Tgl)</label>
              <input type="number" id="bill-due-day" class="form-input" min="1" max="31" value="15" required />
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
            <div class="form-group">
              <label class="form-label">Kategori *</label>
              <select id="bill-cat-select" class="form-select">
                ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Rekening Pembayaran</label>
              <select id="bill-acc-select" class="form-select">
                ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Catatan / No. Pelanggan (Opsional)</label>
            <input type="text" id="bill-notes-input" class="form-input" placeholder="Contoh: No Meter 1234-5678" />
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan Tagihan',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('bill-name-input')?.value;
              const amount = parseRupiah(document.getElementById('bill-amount-input')?.value);
              const dueDay = parseInt(document.getElementById('bill-due-day')?.value, 10);
              const categoryId = document.getElementById('bill-cat-select')?.value;
              const accountId = document.getElementById('bill-acc-select')?.value;
              const notes = document.getElementById('bill-notes-input')?.value;

              if (!name || !name.trim()) {
                toast.error('Nama tagihan wajib diisi.');
                return;
              }
              if (!amount || amount <= 0) {
                toast.error('Nominal tagihan harus lebih dari Rp 0.');
                return;
              }

              appState.addRecurringBill({
                name: name.trim(),
                amount,
                dueDay: dueDay || 15,
                categoryId,
                accountId,
                notes
              });

              toast.success(`Tagihan "${name}" berhasil ditambahkan!`);
              modal.close();
            }
          }
        ]
      });

      const input = document.getElementById('bill-amount-input');
      if (input) {
        input.oninput = (e) => {
          const raw = parseRupiah(e.target.value);
          e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
        };
      }
    };
  }

  // Pay Bill Action
  document.querySelectorAll('.action-pay-bill').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const amount = parseInt(btn.dataset.amount, 10);

      modal.open({
        title: `Bayar Tagihan: ${name}`,
        content: `
          <div style="background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-md);margin-bottom:1rem;">
            <div style="font-size:0.8125rem;color:var(--text-muted);">Nominal Pembayaran:</div>
            <div style="font-size:1.5rem;font-weight:800;color:var(--color-expense);">${formatRupiah(amount)}</div>
          </div>

          <div class="form-group">
            <label class="form-label">Bayar Menggunakan Rekening / Dompet *</label>
            <select id="pay-bill-acc-select" class="form-select">
              ${accounts.map(a => `<option value="${a.id}">${a.name} (${formatRupiah(a.currentBalance)})</option>`).join('')}
            </select>
          </div>
          <p style="font-size:0.75rem;color:var(--text-muted);">
            Sistem akan otomatis membuat catatan transaksi pengeluaran dan menandai tagihan bulan ini sebagai lunas.
          </p>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Konfirmasi Pembayaran',
            className: 'btn-primary',
            onClick: () => {
              const accId = document.getElementById('pay-bill-acc-select')?.value;
              const res = appState.payRecurringBill(id, accId);
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
    };
  });

  // Toggle Unpay
  document.querySelectorAll('.action-unpay-bill').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      appState.updateRecurringBill(id, { isPaidThisMonth: false });
      toast.info('Status tagihan diubah menjadi belum dibayar.');
    };
  });

  // Delete Bill
  document.querySelectorAll('.action-delete-bill').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      modal.confirm({
        title: 'Hapus Tagihan Rutin',
        message: `Apakah Anda yakin ingin menghapus tagihan rutin <strong>"${name}"</strong>?`,
        confirmText: 'Ya, Hapus',
        confirmType: 'btn-danger',
        onConfirm: () => {
          appState.deleteRecurringBill(id);
          toast.success('Tagihan rutin telah dihapus.');
        }
      });
    };
  });
}
