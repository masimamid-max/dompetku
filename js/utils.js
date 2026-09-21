/**
 * Formatting, Date, CSV Export, and SVG Data Visualizations Helper
 */

export function formatRupiah(amount, withSymbol = true) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  const formatted = Math.abs(Math.round(amount)).toLocaleString('id-ID');
  const sign = amount < 0 ? '-' : '';
  return withSymbol ? `${sign}Rp ${formatted}` : `${sign}${formatted}`;
}

export function parseRupiah(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const cleaned = val.toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function formatDate(dateString, style = 'medium') {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const monthsIndo = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthsIndoShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (style === 'short') {
    return `${day} ${monthsIndoShort[month]}`;
  } else if (style === 'medium') {
    return `${day} ${monthsIndo[month]} ${year}`;
  } else if (style === 'full') {
    const daysIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${daysIndo[date.getDay()]}, ${day} ${monthsIndo[month]} ${year}`;
  }
  return `${day}/${month + 1}/${year}`;
}

export function getMonthName(monthIndex) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return months[monthIndex - 1] || '';
}

/**
 * Export Transactions array to standard CSV
 */
export function exportToCSV(transactions, categoriesMap, accountsMap, membersMap, filename = 'transaksi-dompet-keluarga.csv') {
  const headers = ['ID', 'Tanggal', 'Jenis', 'Nominal (IDR)', 'Deskripsi', 'Kategori', 'Subkategori', 'Akun Asal', 'Akun Tujuan', 'Anggota', 'Status', 'Catatan'];
  
  const rows = transactions.map(tx => {
    const cat = categoriesMap[tx.categoryId] ? categoriesMap[tx.categoryId].name : '-';
    const acc = accountsMap[tx.accountId] ? accountsMap[tx.accountId].name : '-';
    const targetAcc = tx.targetAccountId && accountsMap[tx.targetAccountId] ? accountsMap[tx.targetAccountId].name : '-';
    const member = membersMap[tx.memberId] ? membersMap[tx.memberId].name : '-';
    
    return [
      `"${tx.id}"`,
      `"${tx.date}"`,
      `"${tx.type.toUpperCase()}"`,
      tx.amount,
      `"${(tx.description || '').replace(/"/g, '""')}"`,
      `"${cat.replace(/"/g, '""')}"`,
      `"${(tx.subcategory || '-').replace(/"/g, '""')}"`,
      `"${acc.replace(/"/g, '""')}"`,
      `"${targetAcc.replace(/"/g, '""')}"`,
      `"${member.replace(/"/g, '""')}"`,
      `"${tx.status}"`,
      `"${(tx.notes || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Interactive Donut Chart SVG Generator
 */
export function renderDonutChartSVG(data, size = 240) {
  if (!data || data.length === 0) {
    return `<div class="empty-chart" style="height:${size}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.875rem;">Belum ada pengeluaran di bulan ini</div>`;
  }

  const total = data.reduce((acc, item) => acc + item.value, 0);
  if (total === 0) {
    return `<div class="empty-chart" style="height:${size}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.875rem;">Total pengeluaran Rp 0</div>`;
  }

  const radius = size * 0.38;
  const strokeWidth = size * 0.16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  let paths = '';

  data.forEach((slice) => {
    const percent = slice.value / total;
    const strokeDasharray = `${percent * circumference} ${circumference}`;
    const strokeDashoffset = -(accumulatedPercent * circumference);
    accumulatedPercent += percent;

    paths += `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        fill="transparent"
        stroke="${slice.color}"
        stroke-width="${strokeWidth}"
        stroke-dasharray="${strokeDasharray}"
        stroke-dashoffset="${strokeDashoffset}"
        style="transition: stroke-width 0.2s; cursor: pointer;"
        transform="rotate(-90 ${center} ${center})"
      >
        <title>${slice.label}: ${formatRupiah(slice.value)} (${Math.round(percent * 100)}%)</title>
      </circle>
    `;
  });

  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
      <div style="position:relative;width:${size}px;height:${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="${strokeWidth}" />
          ${paths}
        </svg>
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;">
          <div style="font-size:0.6875rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Total Keluar</div>
          <div style="font-size:0.9375rem;font-weight:800;color:var(--color-slate-900);">${formatRupiah(total)}</div>
        </div>
      </div>
      <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.5rem 1rem;max-width:320px;">
        ${data.slice(0, 5).map(slice => `
          <div style="display:flex;align-items:center;gap:0.375rem;font-size:0.75rem;font-weight:600;color:var(--color-slate-700);">
            <span style="width:8px;height:8px;border-radius:50%;background:${slice.color};display:inline-block;"></span>
            <span>${slice.label}</span>
            <span style="color:var(--text-muted);">(${Math.round((slice.value / total) * 100)}%)</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Daily Expenses Trend SVG Bar Chart
 */
export function renderDailyBarChartSVG(daysData, width = 600, height = 180) {
  if (!daysData || daysData.length === 0) {
    return `<div style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:0.875rem;">Tidak ada transaksi harian</div>`;
  }

  const maxVal = Math.max(...daysData.map(d => d.amount), 100000);
  const paddingBottom = 24;
  const chartHeight = height - paddingBottom;
  const barWidth = Math.max(4, Math.min(18, (width - 40) / daysData.length - 4));
  const totalW = daysData.length * (barWidth + 4);

  let bars = '';
  daysData.forEach((day, index) => {
    const barH = (day.amount / maxVal) * (chartHeight - 20);
    const x = index * (barWidth + 4) + 10;
    const y = chartHeight - barH;

    bars += `
      <g style="cursor:pointer;">
        <rect
          x="${x}"
          y="${y}"
          width="${barWidth}"
          height="${Math.max(barH, 2)}"
          rx="2"
          fill="${day.amount > 0 ? '#f43f5e' : '#e2e8f0'}"
          opacity="${day.amount > 0 ? '0.85' : '0.4'}"
        >
          <title>Tgl ${day.day}: ${formatRupiah(day.amount)}</title>
        </rect>
        ${index % 3 === 0 || index === daysData.length - 1 ? `
          <text x="${x + barWidth / 2}" y="${height - 6}" font-size="9" fill="#94a3b8" text-anchor="middle" font-weight="600">
            ${day.day}
          </text>
        ` : ''}
      </g>
    `;
  });

  return `
    <div style="width:100%;overflow-x:auto;">
      <svg width="100%" height="${height}" viewBox="0 0 ${Math.max(width, totalW + 20)} ${height}" preserveAspectRatio="none" style="min-width:320px;">
        <line x1="0" y1="${chartHeight}" x2="${Math.max(width, totalW + 20)}" y2="${chartHeight}" stroke="#e2e8f0" stroke-width="1" />
        ${bars}
      </svg>
    </div>
  `;
}

/**
 * 6 Months Cashflow Comparison Chart (Income vs Expense)
 */
export function renderCashflowTrendSVG(trendData, height = 220) {
  if (!trendData || trendData.length === 0) {
    return `<div style="height:${height}px;display:flex;align-items:center;justify-content:center;color:var(--text-muted);">Data tren belum mencukupi</div>`;
  }

  const maxVal = Math.max(...trendData.map(d => Math.max(d.income, d.expense)), 1000000);
  const chartHeight = height - 40;

  return `
    <div style="width:100%;">
      <div style="display:flex;justify-content:flex-end;gap:1rem;margin-bottom:0.75rem;font-size:0.75rem;font-weight:700;">
        <div style="display:flex;align-items:center;gap:0.375rem;"><span style="width:10px;height:10px;background:var(--color-income);border-radius:2px;"></span> Pemasukan</div>
        <div style="display:flex;align-items:center;gap:0.375rem;"><span style="width:10px;height:10px;background:var(--color-expense);border-radius:2px;"></span> Pengeluaran</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(${trendData.length}, 1fr);gap:0.75rem;height:${chartHeight}px;align-items:flex-end;border-bottom:1px solid var(--border-subtle);padding-bottom:8px;">
        ${trendData.map(item => {
          const incH = Math.max((item.income / maxVal) * (chartHeight - 20), 4);
          const expH = Math.max((item.expense / maxVal) * (chartHeight - 20), 4);
          return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end;" title="${item.label}: Masuk ${formatRupiah(item.income)}, Keluar ${formatRupiah(item.expense)}">
              <div style="display:flex;gap:4px;align-items:flex-end;height:100%;">
                <div style="width:16px;height:${incH}px;background:var(--color-income);border-radius:3px 3px 0 0;" title="Pemasukan: ${formatRupiah(item.income)}"></div>
                <div style="width:16px;height:${expH}px;background:var(--color-expense);border-radius:3px 3px 0 0;" title="Pengeluaran: ${formatRupiah(item.expense)}"></div>
              </div>
              <span style="font-size:0.6875rem;font-weight:700;color:var(--color-slate-600);white-space:nowrap;">${item.label}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}
