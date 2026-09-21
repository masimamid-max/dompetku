/**
 * Interactive Export Modal Dialog for Dompet Keluarga
 */
import { appState } from '../state.js';
import { Icons } from './icons.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { formatRupiah, getMonthName } from '../utils.js';
import { ReportExporter } from '../utils/exporter.js';

export function openExportModal() {
  const family = appState.family;
  const currentMonth = appState.selectedMonth;
  const currentYear = appState.selectedYear;
  const categories = appState.categories;
  const accounts = appState.getAccountsWithBalances();
  const members = appState.members;

  modal.open({
    title: '📊 Ekspor Laporan & Buku Kas Keuangan',
    content: `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <!-- Format Selection Grid -->
        <div>
          <label class="form-label" style="font-weight:700;margin-bottom:0.5rem;display:block;">Pilih Format & Jenis Laporan *</label>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:0.75rem;">
            
            <label style="border:2px solid #059669;background:#ecfdf5;border-radius:10px;padding:0.875rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.75rem;transition:.2s;" id="label-type-pdf">
              <input type="radio" name="export-type" value="pdf" checked style="margin-top:0.25rem;accent-color:#059669;" />
              <div>
                <div style="font-weight:800;font-size:0.875rem;color:#065f46;">📑 Laporan Lengkap (PDF / Cetak)</div>
                <div style="font-size:0.75rem;color:#047857;margin-top:0.25rem;line-height:1.4;">
                  Dilengkapi kop keluarga, ringkasan arus kas, grafik, tabel realisasi anggaran & tanda tangan.
                </div>
              </div>
            </label>

            <label style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:0.875rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.75rem;transition:.2s;" id="label-type-csv-tx">
              <input type="radio" name="export-type" value="csv-tx" style="margin-top:0.25rem;accent-color:#059669;" />
              <div>
                <div style="font-weight:800;font-size:0.875rem;color:#1e293b;">📊 Buku Kas Transaksi (Excel / CSV)</div>
                <div style="font-size:0.75rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                  Data mentah seluruh transaksi, rincian struk, kategori, dan akun rekening.
                </div>
              </div>
            </label>

            <label style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:0.875rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.75rem;transition:.2s;" id="label-type-csv-budget">
              <input type="radio" name="export-type" value="csv-budget" style="margin-top:0.25rem;accent-color:#059669;" />
              <div>
                <div style="font-weight:800;font-size:0.875rem;color:#1e293b;">🎯 Realisasi Anggaran (Excel)</div>
                <div style="font-size:0.75rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                  Perbandingan batas anggaran vs pengeluaran riil per kategori.
                </div>
              </div>
            </label>

            <label style="border:1px solid #cbd5e1;background:#f8fafc;border-radius:10px;padding:0.875rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.75rem;transition:.2s;" id="label-type-csv-member">
              <input type="radio" name="export-type" value="csv-member" style="margin-top:0.25rem;accent-color:#059669;" />
              <div>
                <div style="font-weight:800;font-size:0.875rem;color:#1e293b;">👥 Kontribusi Anggota (Excel)</div>
                <div style="font-size:0.75rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                  Total belanja dan porsi pengeluaran masing-masing anggota keluarga.
                </div>
              </div>
            </label>

          </div>
        </div>

        <!-- Filter Period -->
        <div style="background:var(--color-slate-50);padding:1rem;border-radius:8px;">
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label class="form-label" style="font-weight:700;">Rentang Waktu</label>
            <select id="export-period-select" class="form-select">
              <option value="current_month" selected>Bulan Ini (${getMonthName(currentMonth)} ${currentYear})</option>
              <option value="last_3_months">3 Bulan Terakhir</option>
              <option value="current_year">Tahun Berjalan (${currentYear})</option>
              <option value="all_time">Semua Riwayat (All Time)</option>
              <option value="custom">Kustom Rentang Tanggal</option>
            </select>
          </div>

          <!-- Custom Date Range Picker (hidden by default) -->
          <div id="export-custom-dates" style="display:none;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:0.75rem;">
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Dari Tanggal</label>
              <input type="date" id="export-start-date" class="form-input" value="${currentYear}-${String(currentMonth).padStart(2, '0')}-01" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-size:0.75rem;">Sampai Tanggal</label>
              <input type="date" id="export-end-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
        </div>

        <!-- Filter Account & Category -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
          <div class="form-group">
            <label class="form-label" style="font-size:0.8125rem;">Filter Akun / Rekening</label>
            <select id="export-account-filter" class="form-select">
              <option value="all">Semua Rekening & Dompet</option>
              ${accounts.map(a => `<option value="${a.id}">${a.name}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-size:0.8125rem;">Filter Kategori</label>
            <select id="export-category-filter" class="form-select">
              <option value="all">Semua Kategori</option>
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
        </div>

        <!-- Live Summary Box -->
        <div id="export-summary-box" style="background:#f1f5f9;border:1px dashed #cbd5e1;padding:0.75rem 1rem;border-radius:8px;font-size:0.8125rem;color:#475569;display:flex;justify-content:space-between;align-items:center;">
          <span>📦 Menghitung data yang akan diekspor...</span>
        </div>
      </div>
    `,
    footerButtons: [
      { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
      {
        label: '🚀 Ekspor Sekarang',
        className: 'btn-primary',
        onClick: () => {
          executeExport();
        }
      }
    ]
  });

  // Setup interaction within the modal
  setupModalInteractions();
}

function setupModalInteractions() {
  const radios = document.querySelectorAll('input[name="export-type"]');
  radios.forEach(radio => {
    radio.onchange = () => {
      document.querySelectorAll('label[id^="label-type-"]').forEach(lbl => {
        lbl.style.borderColor = '#cbd5e1';
        lbl.style.background = '#f8fafc';
      });
      const selectedLabel = document.getElementById(`label-type-${radio.value}`);
      if (selectedLabel) {
        selectedLabel.style.borderColor = '#059669';
        selectedLabel.style.background = '#ecfdf5';
      }
    };
  });

  const periodSelect = document.getElementById('export-period-select');
  const customDates = document.getElementById('export-custom-dates');
  if (periodSelect) {
    periodSelect.onchange = () => {
      if (customDates) {
        customDates.style.display = periodSelect.value === 'custom' ? 'grid' : 'none';
      }
      updateSummaryBox();
    };
  }

  const accFilter = document.getElementById('export-account-filter');
  const catFilter = document.getElementById('export-category-filter');
  const startDate = document.getElementById('export-start-date');
  const endDate = document.getElementById('export-end-date');

  if (accFilter) accFilter.onchange = updateSummaryBox;
  if (catFilter) catFilter.onchange = updateSummaryBox;
  if (startDate) startDate.onchange = updateSummaryBox;
  if (endDate) endDate.onchange = updateSummaryBox;

  updateSummaryBox();
}

function getFilteredExportTransactions() {
  let txs = [...appState.transactions];
  const period = document.getElementById('export-period-select')?.value || 'current_month';
  const currentMonth = appState.selectedMonth;
  const currentYear = appState.selectedYear;

  // Filter Date Range
  if (period === 'current_month') {
    txs = txs.filter(t => {
      const d = new Date(t.date);
      return (d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear;
    });
  } else if (period === 'last_3_months') {
    const end = new Date(currentYear, currentMonth, 0);
    const start = new Date(currentYear, currentMonth - 3, 1);
    txs = txs.filter(t => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  } else if (period === 'current_year') {
    txs = txs.filter(t => new Date(t.date).getFullYear() === currentYear);
  } else if (period === 'custom') {
    const startVal = document.getElementById('export-start-date')?.value;
    const endVal = document.getElementById('export-end-date')?.value;
    if (startVal) txs = txs.filter(t => t.date >= startVal);
    if (endVal) txs = txs.filter(t => t.date <= endVal);
  }

  // Filter Account
  const accVal = document.getElementById('export-account-filter')?.value;
  if (accVal && accVal !== 'all') {
    txs = txs.filter(t => t.accountId === accVal || (t.account && t.account.id === accVal));
  }

  // Filter Category
  const catVal = document.getElementById('export-category-filter')?.value;
  if (catVal && catVal !== 'all') {
    txs = txs.filter(t => t.categoryId === catVal || (t.category && t.category.id === catVal));
  }

  return txs;
}

function updateSummaryBox() {
  const summaryBox = document.getElementById('export-summary-box');
  if (!summaryBox) return;

  const filtered = getFilteredExportTransactions();
  const totalAmount = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);

  summaryBox.innerHTML = `
    <div>
      Siap diekspor: <strong>${filtered.length} Transaksi</strong>
    </div>
    <div style="font-weight:700;color:var(--color-primary-700);">
      Total Nominal: ${formatRupiah(totalAmount)}
    </div>
  `;
}

function executeExport() {
  const selectedType = document.querySelector('input[name="export-type"]:checked')?.value || 'pdf';
  const period = document.getElementById('export-period-select')?.value || 'current_month';
  const currentMonth = appState.selectedMonth;
  const currentYear = appState.selectedYear;

  let periodLabel = `${getMonthName(currentMonth)} ${currentYear}`;
  if (period === 'last_3_months') periodLabel = '3 Bulan Terakhir';
  if (period === 'current_year') periodLabel = `Tahun ${currentYear}`;
  if (period === 'all_time') periodLabel = 'Semua Periode';
  if (period === 'custom') {
    const s = document.getElementById('export-start-date')?.value || '';
    const e = document.getElementById('export-end-date')?.value || '';
    periodLabel = `${s} s/d ${e}`;
  }

  const transactions = getFilteredExportTransactions();
  const family = appState.family;
  const metrics = appState.getMonthlyMetrics(currentMonth, currentYear);
  const accounts = appState.getAccountsWithBalances();
  const members = appState.members;
  const categories = appState.categories;

  if (selectedType === 'pdf') {
    toast.info('Menyiapkan dokumen cetak PDF...');
    ReportExporter.printFinancialStatement({
      family,
      periodLabel,
      metrics,
      accounts,
      transactions,
      members,
      categories
    });
    modal.close();
    toast.success('Pratinjau PDF siap dicetak / disimpan!');
  } else if (selectedType === 'csv-tx') {
    toast.info('Mengunduh file Excel/CSV Transaksi...');
    ReportExporter.exportTransactionsToCSV(transactions, {
      familyName: family.name,
      periodLabel
    });
    modal.close();
    toast.success('File CSV Transaksi berhasil diunduh!');
  } else if (selectedType === 'csv-budget') {
    toast.info('Mengunduh Laporan Anggaran...');
    ReportExporter.exportBudgetReportToCSV(appState.budgets, metrics, categories, {
      familyName: family.name,
      periodLabel
    });
    modal.close();
    toast.success('File Laporan Anggaran berhasil diunduh!');
  } else if (selectedType === 'csv-member') {
    toast.info('Mengunduh Laporan Anggota...');
    ReportExporter.exportMemberContributionToCSV(members, transactions, {
      familyName: family.name,
      periodLabel
    });
    modal.close();
    toast.success('File Laporan Anggota berhasil diunduh!');
  }
}
