/**
 * Advanced Financial Reports Exporter (PDF, Excel, CSV) for Dompet Keluarga
 */
import { formatRupiah, getMonthName } from '../utils.js';

export class ReportExporter {
  /**
   * Export Transactions to Excel/CSV with UTF-8 BOM
   */
  static exportTransactionsToCSV(transactions, options = {}) {
    const familyName = options.familyName || 'Keluarga';
    const periodLabel = options.periodLabel || 'Semua Periode';
    
    // Headers
    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Tipe Transaksi',
      'Deskripsi',
      'Kategori',
      'Subkategori',
      'Akun / Rekening',
      'Pencatat (Anggota)',
      'Jumlah (IDR)',
      'Status',
      'Catatan / Rincian Struk',
      'Waktu Dibuat'
    ];

    const rows = transactions.map(tx => {
      const typeLabel = tx.type === 'income' ? 'Pemasukan' : (tx.type === 'expense' ? 'Pengeluaran' : 'Transfer');
      const catName = tx.category ? (tx.category.name || tx.category) : (tx.categoryId || '-');
      const accName = tx.account ? (tx.account.name || tx.account) : (tx.accountId || '-');
      const memberName = tx.member ? (tx.member.name || tx.member) : (tx.memberId || '-');
      
      return [
        `"${tx.id}"`,
        `"${tx.date}"`,
        `"${typeLabel}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
        `"${catName}"`,
        `"${tx.subcategory || '-'}"`,
        `"${accName}"`,
        `"${memberName}"`,
        tx.amount || 0,
        `"${tx.status || 'verified'}"`,
        `"${(tx.notes || '').replace(/"/g, '""')}"`,
        `"${tx.createdAt || ''}"`
      ].join(',');
    });

    const metadata = [
      `"LAPORAN BUKU KAS TRANSAKSI - ${familyName.toUpperCase()}"`,
      `"Periode: ${periodLabel}"`,
      `"Total Transaksi: ${transactions.length}"`,
      `"Diekspor Pada: ${new Date().toLocaleString('id-ID')}"`,
      ''
    ];

    const csvContent = '\uFEFF' + metadata.join('\n') + '\n' + headers.join(',') + '\n' + rows.join('\n');
    const filename = `Laporan_Transaksi_${familyName.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.csv`;
    
    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export Budget vs Actual Variance Report
   */
  static exportBudgetReportToCSV(budgets, monthlyMetrics, categories, options = {}) {
    const familyName = options.familyName || 'Keluarga';
    const periodLabel = options.periodLabel || 'Bulan Ini';

    const headers = [
      'Kategori',
      'Batas Anggaran (Rp)',
      'Realisasi Pengeluaran (Rp)',
      'Sisa Anggaran (Rp)',
      'Persentase Terpakai (%)',
      'Status Anggaran'
    ];

    const budgetStatusList = monthlyMetrics.budgetStatus || [];
    const rows = budgetStatusList.map(b => {
      const remaining = Math.max(0, b.limit - b.spent);
      const isOver = b.spent > b.limit;
      const statusText = isOver ? 'OVERBUDGET (Melebihi Batas)' : (b.percentage >= 80 ? 'Waspada (>80%)' : 'Aman');

      return [
        `"${b.category ? b.category.name : b.categoryId}"`,
        b.limit,
        b.spent,
        remaining,
        `${b.percentage.toFixed(1)}%`,
        `"${statusText}"`
      ].join(',');
    });

    const metadata = [
      `"LAPORAN REALISASI ANGGARAN - ${familyName.toUpperCase()}"`,
      `"Periode: ${periodLabel}"`,
      `"Total Anggaran: Rp ${monthlyMetrics.totalBudgetLimit || 0}"`,
      `"Total Terpakai: Rp ${monthlyMetrics.totalBudgetSpent || 0}"`,
      `"Diekspor Pada: ${new Date().toLocaleString('id-ID')}"`,
      ''
    ];

    const csvContent = '\uFEFF' + metadata.join('\n') + '\n' + headers.join(',') + '\n' + rows.join('\n');
    const filename = `Laporan_Anggaran_${familyName.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.csv`;

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Export Member Spending Contribution Report
   */
  static exportMemberContributionToCSV(members, transactions, options = {}) {
    const familyName = options.familyName || 'Keluarga';
    const periodLabel = options.periodLabel || 'Semua Periode';

    const totalExpenseAll = transactions
      .filter(t => t.type === 'expense' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncomeAll = transactions
      .filter(t => t.type === 'income' && t.status !== 'cancelled')
      .reduce((sum, t) => sum + t.amount, 0);

    const headers = [
      'ID Anggota',
      'Nama Anggota',
      'Peran (Role)',
      'Email / Akun',
      'Total Pengeluaran (Rp)',
      'Kontribusi Pengeluaran (%)',
      'Total Pemasukan (Rp)',
      'Jumlah Transaksi Dicatat'
    ];

    const rows = members.map(m => {
      const memberExpenses = transactions
        .filter(t => t.type === 'expense' && (t.memberId === m.id || (t.member && t.member.id === m.id)))
        .reduce((sum, t) => sum + t.amount, 0);

      const memberIncomes = transactions
        .filter(t => t.type === 'income' && (t.memberId === m.id || (t.member && t.member.id === m.id)))
        .reduce((sum, t) => sum + t.amount, 0);

      const txCount = transactions.filter(t => t.memberId === m.id || (t.member && t.member.id === m.id)).length;
      const expensePct = totalExpenseAll > 0 ? ((memberExpenses / totalExpenseAll) * 100).toFixed(1) : '0.0';

      return [
        `"${m.id}"`,
        `"${m.name}"`,
        `"${m.roleLabel || m.role}"`,
        `"${m.email || '-'}"`,
        memberExpenses,
        `${expensePct}%`,
        memberIncomes,
        txCount
      ].join(',');
    });

    const metadata = [
      `"LAPORAN KONTRIBUSI KEUANGAN ANGGOTA KELUARGA - ${familyName.toUpperCase()}"`,
      `"Periode: ${periodLabel}"`,
      `"Total Pengeluaran Keluarga: Rp ${totalExpenseAll}"`,
      `"Diekspor Pada: ${new Date().toLocaleString('id-ID')}"`,
      ''
    ];

    const csvContent = '\uFEFF' + metadata.join('\n') + '\n' + headers.join(',') + '\n' + rows.join('\n');
    const filename = `Laporan_Anggota_${familyName.replace(/\s+/g, '_')}_${periodLabel.replace(/\s+/g, '_')}.csv`;

    this.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
  }

  /**
   * Open Print Window with Styled Financial Report (Print to PDF)
   */
  static printFinancialStatement(data) {
    const {
      family,
      periodLabel,
      metrics,
      accounts,
      transactions,
      members,
      categories
    } = data;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan pop-up browser untuk mencetak PDF');
      return;
    }

    const netCashflow = metrics.netSavings;
    const isSurplus = netCashflow >= 0;

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Keuangan - ${family.name} (${periodLabel})</title>
        <style>
          @page {
            size: A4;
            margin: 1.5cm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
            background: #fff;
            padding: 24px;
            font-size: 11pt;
            line-height: 1.4;
          }
          .header-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #059669;
            padding-bottom: 16px;
            margin-bottom: 20px;
          }
          .family-title {
            font-size: 20pt;
            font-weight: 800;
            color: #065f46;
          }
          .period-subtitle {
            font-size: 11pt;
            color: #64748b;
            font-weight: 600;
            margin-top: 4px;
          }
          .meta-box {
            text-align: right;
            font-size: 9pt;
            color: #64748b;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .summary-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
          }
          .summary-label {
            font-size: 8pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
          }
          .summary-value {
            font-size: 13pt;
            font-weight: 800;
            margin-top: 4px;
          }
          .val-income { color: #059669; }
          .val-expense { color: #e11d48; }
          .val-surplus { color: #0284c7; }
          
          h3 {
            font-size: 12pt;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 10px;
            border-left: 3px solid #059669;
            padding-left: 8px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            font-size: 9pt;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #cbd5e1;
          }
          td {
            padding: 7px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          tr:nth-child(even) td {
            background: #fafafa;
          }
          .text-right { text-align: right; }
          .badge-in { color: #059669; font-weight: 700; }
          .badge-out { color: #e11d48; font-weight: 700; }
          .footer-sign {
            display: flex;
            justify-content: space-between;
            margin-top: 36px;
            padding-top: 20px;
            page-break-inside: avoid;
          }
          .sign-box {
            text-align: center;
            width: 200px;
          }
          .sign-line {
            border-bottom: 1px solid #334155;
            margin-top: 50px;
            margin-bottom: 4px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <div class="family-title">${family.name}</div>
            <div class="period-subtitle">Laporan Arus Kas & Keuangan Keluarga • ${periodLabel}</div>
          </div>
          <div class="meta-box">
            <div>Mata Uang: <strong>IDR (Rp)</strong></div>
            <div>Dicetak Pada: <strong>${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            <div>Status: <strong>Final / Terverifikasi</strong></div>
          </div>
        </div>

        <!-- Summary Grid -->
        <div class="summary-grid">
          <div class="summary-card" style="border-left:3px solid #059669;">
            <div class="summary-label">Total Pemasukan</div>
            <div class="summary-value val-income">${formatRupiah(metrics.totalIncome)}</div>
          </div>
          <div class="summary-card" style="border-left:3px solid #e11d48;">
            <div class="summary-label">Total Pengeluaran</div>
            <div class="summary-value val-expense">${formatRupiah(metrics.totalExpense)}</div>
          </div>
          <div class="summary-card" style="border-left:3px solid #0284c7;">
            <div class="summary-label">${isSurplus ? 'Surplus (Sisa Kas)' : 'Defisit Bersih'}</div>
            <div class="summary-value val-surplus">${formatRupiah(Math.abs(netCashflow))}</div>
          </div>
          <div class="summary-card" style="border-left:3px solid #4f46e5;">
            <div class="summary-label">Tabungan Terkumpul</div>
            <div class="summary-value" style="color:#4f46e5;">${metrics.savingsRate.toFixed(1)}%</div>
          </div>
        </div>

        <!-- Budget Realization Section -->
        ${(metrics.budgetStatus || []).length > 0 ? `
          <h3>Realisasi Anggaran Kategori</h3>
          <table>
            <thead>
              <tr>
                <th>Kategori</th>
                <th class="text-right">Batas Anggaran</th>
                <th class="text-right">Pengeluaran Riil</th>
                <th class="text-right">Sisa Anggaran</th>
                <th class="text-right">Terpakai (%)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${metrics.budgetStatus.map(b => {
                const isOver = b.spent > b.limit;
                return `
                  <tr>
                    <td><strong>${b.category ? b.category.name : b.categoryId}</strong></td>
                    <td class="text-right">${formatRupiah(b.limit)}</td>
                    <td class="text-right">${formatRupiah(b.spent)}</td>
                    <td class="text-right">${formatRupiah(Math.max(0, b.limit - b.spent))}</td>
                    <td class="text-right">${b.percentage.toFixed(1)}%</td>
                    <td><span style="color:${isOver ? '#e11d48' : '#059669'};font-weight:700;">${isOver ? 'Melebihi Target' : 'Terkendali'}</span></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        ` : ''}

        <!-- Top Transactions Table -->
        <h3>Rincian Transaksi Keuangan (${transactions.length} Catatan)</h3>
        <table>
          <thead>
            <tr>
              <th style="width:85px;">Tanggal</th>
              <th>Deskripsi Transaksi</th>
              <th>Kategori</th>
              <th>Rekening / Kas</th>
              <th>Pencatat</th>
              <th class="text-right">Jumlah (Rp)</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.length === 0 ? `
              <tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:16px;">Tidak ada transaksi pada periode ini</td></tr>
            ` : transactions.map(t => {
              const isInc = t.type === 'income';
              const catName = t.category ? (t.category.name || t.category) : '-';
              const accName = t.account ? (t.account.name || t.account) : '-';
              const memName = t.member ? (t.member.name || t.member) : '-';
              return `
                <tr>
                  <td>${t.date}</td>
                  <td>
                    <strong>${t.description}</strong>
                    ${t.notes ? `<br><small style="color:#64748b;font-size:7.5pt;">${t.notes}</small>` : ''}
                  </td>
                  <td>${catName}</td>
                  <td>${accName}</td>
                  <td>${memName}</td>
                  <td class="text-right ${isInc ? 'badge-in' : 'badge-out'}">
                    ${isInc ? '+' : '-'} ${formatRupiah(t.amount)}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <!-- Signatures / Footer -->
        <div class="footer-sign">
          <div class="sign-box">
            <div>Diverifikasi Oleh:</div>
            <div class="sign-line"></div>
            <div><strong>${members.find(m => m.role === 'owner')?.name || 'Kepala Keluarga'}</strong></div>
            <div style="font-size:8pt;color:#64748b;">Super Akses / Pemilik</div>
          </div>
          <div class="sign-box">
            <div>Dikelola Bersama:</div>
            <div class="sign-line"></div>
            <div><strong>${members.find(m => m.role === 'admin')?.name || 'Pengelola Keuangan'}</strong></div>
            <div style="font-size:8pt;color:#64748b;">Admin Keuangan Keluarga</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  /**
   * Browser File Download Trigger
   */
  static downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
