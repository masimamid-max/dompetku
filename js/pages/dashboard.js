import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, getMonthName, renderDonutChartSVG, renderDailyBarChartSVG } from '../utils.js';
import { openTransactionModal } from '../components/transactionModal.js';
import { openReceiptScanModal } from '../components/receiptScanModal.js';
import { openAiModal } from '../components/aiModal.js';
import { openTelegramModal } from '../components/telegramSimulator.js';
import { openExportModal } from '../components/exportModal.js';

export function renderDashboardPage() {
  const metrics = appState.getMonthlyMetrics();
  const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
  const categories = appState.categories;

  // Comparison insight text
  let insightBannerClass = 'summary-alert-banner';
  let insightIcon = Icons.trendingUp(20);
  let insightText = '';

  if (metrics.expenseDiffPercent > 0) {
    insightBannerClass += ' warning';
    insightIcon = Icons.alertTriangle(20);
    insightText = `Pengeluaran bulan ini meningkat <strong>${metrics.expenseDiffPercent}%</strong> dibanding bulan ${getMonthName(metrics.month === 1 ? 12 : metrics.month - 1)}. Pastikan cek anggaran kategori utama Anda.`;
  } else if (metrics.expenseDiffPercent < 0) {
    insightIcon = Icons.checkCircle(20);
    insightText = `Bagus! Pengeluaran bulan ini lebih hemat <strong>${Math.abs(metrics.expenseDiffPercent)}%</strong> dibanding bulan lalu. Pertahankan ritme menabung Anda.`;
  } else {
    insightText = `Kondisi keuangan bulan <strong>${getMonthName(metrics.month)} ${metrics.year}</strong> terpantau stabil. Anggaran terpakai: <strong>${metrics.budgetUsedPercent}%</strong>.`;
  }

  const months = [
    { num: 1, name: 'Januari' }, { num: 2, name: 'Februari' }, { num: 3, name: 'Maret' },
    { num: 4, name: 'April' }, { num: 5, name: 'Mei' }, { num: 6, name: 'Juni' },
    { num: 7, name: 'Juli' }, { num: 8, name: 'Agustus' }, { num: 9, name: 'September' },
    { num: 10, name: 'Oktober' }, { num: 11, name: 'November' }, { num: 12, name: 'Desember' }
  ];

  return `
    <div class="dashboard-page">
      <!-- Top Title & Month Picker -->
      <div class="dashboard-header">
        <div class="dashboard-title-group">
          <h1>Dashboard Keuangan</h1>
          <p>Ringkasan arus kas dan kesehatan finansial keluarga</p>
        </div>

        <div class="month-year-picker">
          <span style="color:var(--color-primary-600);">${Icons.calendar(18)}</span>
          <select id="dash-month-select" class="month-select">
            ${months.map(m => `
              <option value="${m.num}" ${m.num === appState.selectedMonth ? 'selected' : ''}>
                ${m.name}
              </option>
            `).join('')}
          </select>
          <select id="dash-year-select" class="year-select">
            <option value="2025" ${appState.selectedYear === 2025 ? 'selected' : ''}>2025</option>
            <option value="2026" ${appState.selectedYear === 2026 ? 'selected' : ''}>2026</option>
            <option value="2027" ${appState.selectedYear === 2027 ? 'selected' : ''}>2027</option>
          </select>
        </div>
      </div>

      <!-- Insight Alert Banner -->
      <div class="${insightBannerClass}">
        <div class="summary-alert-icon">
          ${insightIcon}
        </div>
        <div class="summary-alert-text">
          ${insightText}
        </div>
      </div>

      <!-- 4 Key Metric Tiles -->
      <div class="metrics-grid">
        <!-- Income Metric -->
        <div class="metric-card metric-income">
          <div class="metric-card-top">
            <span class="metric-label">Total Pemasukan</span>
            <div class="metric-icon-box">
              ${Icons.trendingUp(20)}
            </div>
          </div>
          <div class="metric-value">${formatRupiah(metrics.totalIncome)}</div>
          <div class="metric-footer trend-up-good">
            <span>Bulan lalu: ${formatRupiah(metrics.prevIncome)}</span>
          </div>
        </div>

        <!-- Expense Metric -->
        <div class="metric-card metric-expense">
          <div class="metric-card-top">
            <span class="metric-label">Total Pengeluaran</span>
            <div class="metric-icon-box">
              ${Icons.trendingDown(20)}
            </div>
          </div>
          <div class="metric-value">${formatRupiah(metrics.totalExpense)}</div>
          <div class="metric-footer ${metrics.expenseDiffPercent > 0 ? 'trend-up-bad' : 'trend-down-good'}">
            <span>${metrics.expenseDiffPercent > 0 ? `▲ Naik ${metrics.expenseDiffPercent}%` : metrics.expenseDiffPercent < 0 ? `▼ Turun ${Math.abs(metrics.expenseDiffPercent)}%` : 'Sama seperti bulan lalu'}</span>
          </div>
        </div>

        <!-- Net Balance Metric -->
        <div class="metric-card metric-balance">
          <div class="metric-card-top">
            <span class="metric-label">Sisa Saldo Bulan Ini</span>
            <div class="metric-icon-box">
              ${Icons.wallet(20)}
            </div>
          </div>
          <div class="metric-value" style="color:${metrics.netSavings >= 0 ? 'var(--color-primary-700)' : 'var(--color-expense)'};">
            ${formatRupiah(metrics.netSavings)}
          </div>
          <div class="metric-footer trend-neutral">
            <span>${metrics.transactionCount} transaksi tercatat</span>
          </div>
        </div>

        <!-- Budget Usage Metric -->
        <div class="metric-card metric-budget">
          <div class="metric-card-top">
            <span class="metric-label">Pemakaian Anggaran</span>
            <div class="metric-icon-box">
              ${Icons.target(20)}
            </div>
          </div>
          <div class="metric-value">${metrics.budgetUsedPercent}%</div>
          <div class="metric-footer trend-neutral">
            <span>Dari total limit: ${formatRupiah(metrics.totalBudget)}</span>
          </div>
        </div>
      </div>

      <!-- Charts 2-Column Grid -->
      <div class="dashboard-grid-2">
        <!-- Daily Expense Trend Bar Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">
                ${Icons.trendingDown(18)} Grafik Pengeluaran Harian
              </div>
              <div class="card-subtitle">Pola pengeluaran sepanjang bulan ${getMonthName(metrics.month)} ${metrics.year}</div>
            </div>
          </div>
          ${renderDailyBarChartSVG(metrics.dailyExpenses, 560, 200)}
        </div>

        <!-- Category Expenses Donut Chart -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">
                ${Icons.pieChart(18)} Kategori Pengeluaran
              </div>
              <div class="card-subtitle">Porsi belanja per kategori</div>
            </div>
          </div>
          ${renderDonutChartSVG(metrics.categoryBreakdown, 220)}
        </div>
      </div>

      <!-- Bottom Grid: Top 5 Expenses & Accounts Balances -->
      <div class="dashboard-grid-2">
        <!-- Top 5 Expenses -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              ${Icons.trendingDown(18)} 5 Pengeluaran Terbesar
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-view-all-tx">
              Lihat Semua
            </button>
          </div>

          <div class="top-expenses-list">
            ${metrics.topExpenses.length > 0 ? metrics.topExpenses.map((tx, idx) => {
              const cat = categories.find(c => c.id === tx.categoryId);
              const iconName = cat ? cat.icon : 'tag';
              const catColor = cat ? cat.color : '#94a3b8';
              return `
                <div class="top-expense-item">
                  <div class="top-expense-left">
                    <span class="top-expense-rank">#${idx + 1}</span>
                    <div class="top-expense-icon" style="background:${catColor}20;color:${catColor};">
                      ${getCategoryIcon(iconName, 18)}
                    </div>
                    <div class="top-expense-info">
                      <div class="top-expense-title">${tx.description}</div>
                      <div class="top-expense-meta">${cat ? cat.name : '-'} • ${tx.date}</div>
                    </div>
                  </div>
                  <div class="top-expense-amount">
                    -${formatRupiah(tx.amount)}
                  </div>
                </div>
              `;
            }).join('') : `
              <div class="empty-state" style="padding:1.5rem 0;">
                <p style="color:var(--text-muted);font-size:0.875rem;">Belum ada data pengeluaran di bulan ini.</p>
              </div>
            `}
          </div>
        </div>

        <!-- Account Balances Summary -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              ${Icons.creditCard(18)} Saldo Setiap Akun
            </div>
            <button class="btn btn-primary btn-sm" id="btn-quick-record-tx">
              ${Icons.plus(14)} Catat
            </button>
          </div>

          <div class="accounts-summary-grid">
            ${accounts.map(acc => `
              <div class="account-pill-card">
                <div class="account-pill-top">
                  <div class="account-pill-name">
                    <span class="account-dot" style="background:${acc.color};"></span>
                    ${acc.name}
                  </div>
                  <span class="badge" style="background:#f1f5f9;color:var(--color-slate-700);font-size:0.6875rem;">
                    ${acc.typeLabel || acc.type}
                  </span>
                </div>
                <div class="account-pill-balance">
                  ${formatRupiah(acc.currentBalance)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachDashboardListeners(navigateToTab) {
  const monthSelect = document.getElementById('dash-month-select');
  const yearSelect = document.getElementById('dash-year-select');

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

  const viewAllBtn = document.getElementById('btn-view-all-tx');
  if (viewAllBtn) {
    viewAllBtn.onclick = () => navigateToTab('transactions');
  }

  const quickRecordBtn = document.getElementById('btn-quick-record-tx');
  if (quickRecordBtn) {
    quickRecordBtn.onclick = () => openTransactionModal();
  }
}
