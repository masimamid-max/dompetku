/**
 * Interactive Telegram Bot Simulator Component for Dompet Keluarga V2
 */
import { appState } from '../state.js';
import { parseNaturalLanguageTransaction } from '../utils/aiParser.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons } from './icons.js';
import { formatRupiah, getMonthName } from '../utils.js';

export function openTelegramBotSimulator() {
  const family = appState.family;
  const current = appState.currentUser;

  let messages = [
    {
      sender: 'bot',
      time: '08:00',
      text: `👋 Halo <b>${current.name}</b>! Saya adalah <b>Bot Telegram Dompet Keluarga</b> untuk ruang <i>${family.name}</i>.\n\nKetik pesan seperti:\n• <code>/catat Beli soto 35rb pakai gopay</code>\n• <code>/saldo</code> (Cek saldo seluruh akun)\n• <code>/anggaran</code> (Cek status anggaran)\n• <code>/laporan</code> (Ringkasan bulan ini)`
    }
  ];

  function renderTelegramChat() {
    return `
      <div style="display:flex;flex-direction:column;height:460px;background:#eef2f5;border-radius:var(--radius-lg);overflow:hidden;border:1px solid var(--border-subtle);">
        <!-- Telegram Header -->
        <div style="background:#2481cc;color:white;padding:0.75rem 1rem;display:flex;align-items:center;gap:0.75rem;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <div style="width:36px;height:36px;border-radius:var(--radius-full);background:white;color:#2481cc;display:flex;align-items:center;justify-content:center;font-weight:800;">
            ${Icons.bot(20)}
          </div>
          <div>
            <div style="font-size:0.875rem;font-weight:700;">Dompet Keluarga Bot</div>
            <div style="font-size:0.6875rem;opacity:0.85;">bot • selalu online</div>
          </div>
          <span class="badge" style="margin-left:auto;background:rgba(255,255,255,0.2);color:white;font-size:0.6875rem;">
            SIMULASI V2
          </span>
        </div>

        <!-- Chat Messages Container -->
        <div id="tg-messages-box" style="flex:1;padding:1rem;overflow-y:auto;display:flex;flex-direction:column;gap:0.75rem;">
          ${messages.map(m => `
            <div style="display:flex;justify-content:${m.sender === 'user' ? 'flex-end' : 'flex-start'};">
              <div style="max-width:85%;padding:0.625rem 0.875rem;border-radius:12px;background:${m.sender === 'user' ? '#effdde' : '#ffffff'};box-shadow:0 1px 2px rgba(0,0,0,0.08);font-size:0.8125rem;color:#1e293b;line-height:1.45;">
                <div>${m.text.replace(/\n/g, '<br/>')}</div>
                <div style="font-size:0.625rem;color:#94a3b8;text-align:right;margin-top:0.25rem;">${m.time}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Quick Action Bar -->
        <div style="padding:0.35rem 0.75rem;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;gap:0.35rem;overflow-x:auto;">
          <button type="button" class="preset-chip tg-quick-btn" data-cmd="/saldo">💳 /saldo</button>
          <button type="button" class="preset-chip tg-quick-btn" data-cmd="/anggaran">🎯 /anggaran</button>
          <button type="button" class="preset-chip tg-quick-btn" data-cmd="/laporan">📊 /laporan</button>
          <button type="button" class="preset-chip tg-quick-btn" data-cmd="/catat Makan siang bakso 30rb">🍜 /catat Makan 30rb</button>
        </div>

        <!-- Telegram Input Bar -->
        <div style="padding:0.625rem;background:white;border-top:1px solid #e2e8f0;display:flex;gap:0.5rem;align-items:center;">
          <input 
            type="text" 
            id="tg-chat-input" 
            class="form-input" 
            placeholder="Tulis perintah atau /catat transaksi..." 
            style="border-radius:var(--radius-full);padding:0.5rem 1rem;font-size:0.8125rem;"
            autocomplete="off"
          />
          <button type="button" id="tg-send-btn" class="btn btn-primary" style="border-radius:var(--radius-full);padding:0.5rem 0.875rem;">
            ${Icons.send(16)}
          </button>
        </div>
      </div>
    `;
  }

  function handleCommand(cmdText) {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    messages.push({ sender: 'user', time, text: cmdText });

    const lower = cmdText.toLowerCase().trim();
    let botReply = '';

    if (lower === '/saldo') {
      const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
      const totalAll = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
      botReply = `💰 <b>Saldo Rekening & Dompet:</b>\n` + 
        accounts.map(a => `• ${a.name}: <b>${formatRupiah(a.currentBalance)}</b>`).join('\n') +
        `\n\n💵 <b>Total Saldo Kas: ${formatRupiah(totalAll)}</b>`;
    } else if (lower === '/anggaran') {
      const budgetList = appState.getCategoryBudgetsWithProgress();
      const totalBudget = budgetList.reduce((s, b) => s + b.budgetAmount, 0);
      const totalSpent = budgetList.reduce((s, b) => s + b.spentAmount, 0);
      const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
      botReply = `🎯 <b>Status Anggaran Bulan ${getMonthName(appState.selectedMonth)}:</b>\n` +
        `• Total Target: ${formatRupiah(totalBudget)}\n` +
        `• Terpakai: ${formatRupiah(totalSpent)} (<b>${pct}%</b>)\n` +
        `• Sisa Alokasi: <b>${formatRupiah(totalBudget - totalSpent)}</b>\n\n` +
        budgetList.slice(0, 4).map(b => `• ${b.category.name}: ${formatRupiah(b.spentAmount)} / ${formatRupiah(b.budgetAmount)} (${b.percent}%)`).join('\n');
    } else if (lower === '/laporan') {
      const metrics = appState.getMonthlyMetrics();
      botReply = `📊 <b>Laporan Arus Kas (${getMonthName(metrics.month)} ${metrics.year}):</b>\n` +
        `• Pemasukan: <b>${formatRupiah(metrics.totalIncome)}</b>\n` +
        `• Pengeluaran: <b>${formatRupiah(metrics.totalExpense)}</b>\n` +
        `• Sisa Surplus: <b>${formatRupiah(metrics.netSavings)}</b>\n` +
        `• Total Transaksi: <b>${metrics.transactionCount}</b> transaksi.`;
    } else if (lower.startsWith('/catat') || lower.startsWith('catat')) {
      const textToParse = cmdText.replace(/^\/?catat\s*/i, '').trim();
      if (!textToParse) {
        botReply = `❓ Harap sertakan detail transaksi.\nContoh: <code>/catat Beli soto ayam 45.000 bayar pakai gopay</code>`;
      } else {
        const parsed = parseNaturalLanguageTransaction(textToParse);
        if (parsed) {
          appState.addTransaction({
            type: parsed.type,
            amount: parsed.amount,
            description: parsed.description,
            date: parsed.date,
            accountId: parsed.accountId,
            targetAccountId: parsed.targetAccountId,
            categoryId: parsed.categoryId,
            memberId: appState.currentUser.id,
            notes: `Dicatat via Bot Telegram: "${textToParse}"`,
            status: 'verified'
          });

          const cat = appState.getCategoryById(parsed.categoryId);
          const acc = appState.getAccountById(parsed.accountId);

          botReply = `✅ <b>Transaksi Berhasil Dicatat!</b>\n\n` +
            `• Deskripsi: <b>${parsed.description}</b>\n` +
            `• Nominal: <b>${formatRupiah(parsed.amount)}</b>\n` +
            `• Jenis: ${parsed.type.toUpperCase()}\n` +
            `• Kategori: ${cat ? cat.name : '-'}\n` +
            `• Akun: ${acc ? acc.name : '-'}\n` +
            `• Oleh: ${appState.currentUser.name}`;
          
          toast.success(`Transaksi dicatat via Telegram: ${parsed.description}`);
        }
      }
    } else {
      botReply = `Perintah tidak dikenali. Gunakan:\n• <code>/catat [kalimat transaksi]</code>\n• <code>/saldo</code>\n• <code>/anggaran</code>\n• <code>/laporan</code>`;
    }

    setTimeout(() => {
      messages.push({ sender: 'bot', time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), text: botReply });
      const body = document.querySelector('.modal-body');
      if (body) {
        body.innerHTML = renderTelegramChat();
        attachChatListeners();
        const box = document.getElementById('tg-messages-box');
        if (box) box.scrollTop = box.scrollHeight;
      }
    }, 400);

    const body = document.querySelector('.modal-body');
    if (body) {
      body.innerHTML = renderTelegramChat();
      attachChatListeners();
      const box = document.getElementById('tg-messages-box');
      if (box) box.scrollTop = box.scrollHeight;
    }
  }

  function attachChatListeners() {
    const input = document.getElementById('tg-chat-input');
    const sendBtn = document.getElementById('tg-send-btn');

    if (sendBtn && input) {
      sendBtn.onclick = () => {
        if (input.value.trim()) {
          const val = input.value.trim();
          input.value = '';
          handleCommand(val);
        }
      };

      input.onkeydown = (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          const val = input.value.trim();
          input.value = '';
          handleCommand(val);
        }
      };
    }

    document.querySelectorAll('.tg-quick-btn').forEach(btn => {
      btn.onclick = () => {
        const cmd = btn.dataset.cmd;
        handleCommand(cmd);
      };
    });
  }

  modal.open({
    title: '💬 Simulator Bot Telegram Dompet Keluarga',
    content: renderTelegramChat(),
    maxWidth: '520px',
    footerButtons: [
      {
        label: 'Tutup',
        className: 'btn-secondary',
        onClick: () => modal.close()
      }
    ]
  });

  attachChatListeners();
}

export function openTelegramModal() {
  return openTelegramBotSimulator();
}

