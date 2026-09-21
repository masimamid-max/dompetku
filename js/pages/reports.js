import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, getMonthName, renderCashflowTrendSVG, exportToCSV, parseRupiah } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { openExportModal } from '../components/exportModal.js';

export function renderReportsPage() {
  const currentMonth = appState.selectedMonth;
  const currentYear = appState.selectedYear;
  const metrics = appState.getMonthlyMetrics(currentMonth, currentYear);
  const categories = appState.categories;

  // Generate 6-month historical trend data
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    if (m <= 0) {
      m += 12;
      y -= 1;
    }
    const monthMetrics = appState.getMonthlyMetrics(m, y);
    trendData.push({
      label: `${getMonthName(m).substring(0, 3)} ${String(y).substring(2)}`,
      month: m,
      year: y,
      income: monthMetrics.totalIncome,
      expense: monthMetrics.totalExpense
    });
  }

  const months = [
    { num: 1, name: 'Januari' }, { num: 2, name: 'Februari' }, { num: 3, name: 'Maret' },
    { num: 4, name: 'April' }, { num: 5, name: 'Mei' }, { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' }, { num: 8, name: 'Agustus' }, { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' }, { num: 11, name: 'November' }, { num: 12, name: 'Desember' }
  ];

  return `
    <div class="reports-page">
      <!-- Header -->
      <div class="dashboard-header no-print">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Laporan Keuangan</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Analisis arus kas, distribusi belanja, dan ekspor dokumen PDF / Excel
          </p>
        </div>

        <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap;">
          <div class="month-year-picker">
            <span style="color:var(--color-primary-600);">${Icons.calendar(18)}</span>
            <select id="report-month-select" class="month-select">
              ${months.map(m => `
                <option value="${m.num}" ${m.num === appState.selectedMonth ? 'selected' : ''}>
                  ${m.name}
                </option>
              `).join('')}
            </select>
            <select id="report-year-select" class="year-select">
              <option value="2025" ${appState.selectedYear === 2025 ? 'selected' : ''}>2025</option>
              <option value="2026" ${appState.selectedYear === 2026 ? 'selected' : ''}>2026</option>
              <option value="2027" ${appState.selectedYear === 2027 ? 'selected' : ''}>2027</option>
            </select>
          </div>

          <button class="btn btn-secondary" id="btn-import-csv" title="Impor Data dari CSV">
            ${Icons.upload(16)} Impor CSV
          </button>
          <button class="btn btn-primary" id="btn-open-export-modal" style="box-shadow:0 4px 12px rgba(5, 150, 105, 0.25);">
            ${Icons.download(16)} Ekspor & Cetak PDF / Excel
          </button>
        </div>
      </div>

      <!-- Printable Report Header (Visible only on print) -->
      <div class="print-only-header" style="display:none;margin-bottom:1.5rem;">
        <h2 style="font-size:1.5rem;font-weight:800;color:#0f172a;">Laporan Keuangan: ${appState.family.name}</h2>
        <p style="font-size:0.875rem;color:#475569;">Periode: ${getMonthName(currentMonth)} ${currentYear} • Dicetak pada: ${new Date().toLocaleDateString('id-ID')}</p>
        <hr style="margin:1rem 0;border:0;border-top:1px solid #cbd5e1;" />
      </div>

      <!-- Cashflow Summary Table / Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">
            ${Icons.trendingUp(18)} Ringkasan Arus Kas (${getMonthName(currentMonth)} ${currentYear})
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:1rem;">
          <div style="background:var(--color-slate-50);padding:1.25rem;border-radius:var(--radius-md);border-left:4px solid var(--color-income);">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Total Pemasukan</div>
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-income);margin-top:0.25rem;">
              ${formatRupiah(metrics.totalIncome)}
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.375rem;">
              Bulan lalu: ${formatRupiah(metrics.prevIncome)}
            </div>
          </div>

          <div style="background:var(--color-slate-50);padding:1.25rem;border-radius:var(--radius-md);border-left:4px solid var(--color-expense);">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Total Pengeluaran</div>
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-expense);margin-top:0.25rem;">
              ${formatRupiah(metrics.totalExpense)}
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.375rem;">
              Bulan lalu: ${formatRupiah(metrics.prevExpense)}
            </div>
          </div>

          <div style="background:var(--color-slate-50);padding:1.25rem;border-radius:var(--radius-md);border-left:4px solid ${metrics.netSavings >= 0 ? 'var(--color-primary-600)' : 'var(--color-expense)'};">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Surplus / (Defisit) Bersih</div>
            <div style="font-size:1.375rem;font-weight:800;color:${metrics.netSavings >= 0 ? 'var(--color-primary-700)' : 'var(--color-expense)'};margin-top:0.25rem;">
              ${formatRupiah(metrics.netSavings)}
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.375rem;">
              ${metrics.netSavings >= 0 ? 'Kondisi surplus finansial' : 'Pengeluaran melebihi pemasukan'}
            </div>
          </div>
        </div>
      </div>

      <!-- 6-Month Trend Card -->
      <div class="card" style="margin-bottom:1.5rem;">
        <div class="card-header">
          <div class="card-title">
            ${Icons.pieChart(18)} Tren Arus Kas 6 Bulan Terakhir
          </div>
          <div class="card-subtitle">Perbandingan pemasukan vs pengeluaran dari waktu ke waktu</div>
        </div>
        ${renderCashflowTrendSVG(trendData, 220)}
      </div>

      <!-- Category Breakdown Table -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">
            ${Icons.tag(18)} Rincian Pengeluaran per Kategori
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table class="report-table">
            <thead>
              <tr>
                <th style="width:40px;">No</th>
                <th>Kategori</th>
                <th>Realisasi Pengeluaran</th>
                <th>Porsi (%)</th>
                <th>Target Anggaran</th>
                <th>Selisih Anggaran</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.categoryBreakdown.length > 0 ? metrics.categoryBreakdown.map((catItem, idx) => {
                const budgetEntry = appState.budgets.find(b => b.categoryId === catItem.id && b.month === currentMonth && b.year === currentYear);
                const budgetAmount = budgetEntry ? budgetEntry.amount : 0;
                const diff = budgetAmount - catItem.value;
                const percentOfExpense = metrics.totalExpense > 0 ? Math.round((catItem.value / metrics.totalExpense) * 100) : 0;

                return `
                  <tr>
                    <td style="font-weight:700;color:var(--color-slate-400);">${idx + 1}</td>
                    <td>
                      <div style="display:flex;align-items:center;gap:0.625rem;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${catItem.color};display:inline-block;"></span>
                        <span style="font-weight:700;color:var(--color-slate-800);">${catItem.label}</span>
                      </div>
                    </td>
                    <td style="font-weight:700;color:var(--color-expense);">${formatRupiah(catItem.value)}</td>
                    <td>
                      <span class="badge" style="background:var(--color-slate-100);color:var(--color-slate-700);">
                        ${percentOfExpense}%
                      </span>
                    </td>
                    <td>${formatRupiah(budgetAmount)}</td>
                    <td style="font-weight:700;color:${diff >= 0 ? 'var(--color-income)' : 'var(--color-expense)'};">
                      ${diff >= 0 ? `+${formatRupiah(diff)}` : formatRupiah(diff)}
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr>
                  <td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">
                    Belum ada catatan pengeluaran pada bulan ini.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export function attachReportsListeners() {
  const monthSelect = document.getElementById('report-month-select');
  const yearSelect = document.getElementById('report-year-select');

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

  const importBtn = document.getElementById('btn-import-csv');
  if (importBtn) {
    importBtn.onclick = () => {
      let importedRows = [];
      modal.open({
        title: 'Impor Data Transaksi dari CSV',
        content: `
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <p style="font-size:0.875rem;color:var(--text-muted);">
              Unggah file CSV dengan kolom: <strong>ID, Tanggal, Jenis, Kategori, Subkategori, Akun, Nominal, Anggota, Catatan</strong>. Format yang cocok dengan ekspor Dompet Keluarga.
            </p>
            <div style="border:2px dashed var(--color-slate-300);border-radius:var(--radius-md);padding:1.5rem;text-align:center;background:var(--color-slate-50);">
              <label for="csv-file-input" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
                <span style="color:var(--color-primary-600);">${Icons.upload(32)}</span>
                <span style="font-size:0.875rem;font-weight:700;color:var(--color-slate-800);">Pilih File CSV</span>
                <span style="font-size:0.75rem;color:var(--text-muted);" id="csv-file-name-label">Klik untuk memilih file .csv dari perangkat</span>
              </label>
              <input type="file" id="csv-file-input" accept=".csv" style="display:none;" />
            </div>
            <div id="csv-preview-container" style="display:none;background:white;padding:0.75rem;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);max-height:180px;overflow-y:auto;font-size:0.75rem;"></div>
          </div>
        `,
        footerButtons: [
          {
            label: 'Batal',
            className: 'btn-secondary',
            onClick: () => modal.close()
          },
          {
            label: 'Impor Transaksi',
            className: 'btn-primary',
            onClick: () => {
              if (importedRows.length === 0) {
                toast.error('Pilih file CSV yang valid terlebih dahulu.');
                return;
              }
              let count = 0;
              importedRows.forEach(row => {
                appState.addTransaction(row);
                count++;
              });
              toast.success(`Berhasil mengimpor ${count} data transaksi!`);
              modal.close();
            }
          }
        ]
      });

      const fileInput = document.getElementById('csv-file-input');
      const nameLabel = document.getElementById('csv-file-name-label');
      const previewBox = document.getElementById('csv-preview-container');

      if (fileInput) {
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          nameLabel.textContent = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
          
          const reader = new FileReader();
          reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            if (lines.length <= 1) {
              toast.error('File CSV kosong atau tidak memiliki baris data.');
              return;
            }

            const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
            const rows = [];
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map(c => c.replace(/"/g, '').trim());
              if (cols.length >= 6) {
                // Heuristic map
                const date = cols[1] || new Date().toISOString().split('T')[0];
                const typeStr = (cols[2] || 'Pengeluaran').toLowerCase();
                const type = typeStr.includes('masuk') || typeStr.includes('income') ? 'income' : typeStr.includes('transfer') ? 'transfer' : 'expense';
                const catName = cols[3] || '';
                const desc = cols[4] || catName || 'Impor CSV';
                const accName = cols[5] || '';
                const amount = parseRupiah(cols[6] || cols[5] || '0') || 50000;
                
                // Match category & account
                const matchedCat = appState.categories.find(c => c.name.toLowerCase() === catName.toLowerCase()) || appState.categories[0];
                const matchedAcc = appState.accounts.find(a => a.name.toLowerCase() === accName.toLowerCase()) || appState.accounts[0];

                rows.push({
                  date,
                  type,
                  description: desc,
                  amount,
                  categoryId: matchedCat ? matchedCat.id : 'cat_food',
                  accountId: matchedAcc ? matchedAcc.id : 'acc_cash',
                  memberId: appState.currentUser.id,
                  notes: 'Diimpor dari file CSV',
                  status: 'verified'
                });
              }
            }

            importedRows = rows;
            if (previewBox) {
              previewBox.style.display = 'block';
              previewBox.innerHTML = `
                <div style="font-weight:700;margin-bottom:0.375rem;color:var(--color-slate-800);">Pratinjau Data (${rows.length} transaksi siap diimpor):</div>
                <ul style="padding-left:1.25rem;color:var(--text-muted);">
                  ${rows.slice(0, 5).map(r => `<li>${r.date}: <strong>${r.description}</strong> - ${formatRupiah(r.amount)} (${r.type})</li>`).join('')}
                  ${rows.length > 5 ? `<li>...dan ${rows.length - 5} baris lainnya</li>` : ''}
                </ul>
              `;
            }
            toast.success(`Ditemukan ${rows.length} transaksi dalam file CSV!`);
          };
          reader.readAsText(file);
        };
      }
    };
  }

  const exportModalBtn = document.getElementById('btn-open-export-modal');
  if (exportModalBtn) {
    exportModalBtn.onclick = () => openExportModal();
  }

  const printBtn = document.getElementById('btn-print-report');
  if (printBtn) {
    printBtn.onclick = () => openExportModal();
  }

  const csvBtn = document.getElementById('btn-download-report-csv');
  if (csvBtn) {
    csvBtn.onclick = () => openExportModal();
  }
}
