/**
 * AI Smart Expense Entry Modal Component
 */
import { appState } from '../state.js';
import { parseNaturalLanguageTransaction } from '../utils/aiParser.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons, getCategoryIcon } from './icons.js';
import { formatRupiah } from '../utils.js';
import { LicenseService } from '../utils/licenseService.js';
import { openLicenseActivationModal } from './licenseModal.js';

export function openAIExpenseModal() {
  if (!LicenseService.isLicensed()) {
    openLicenseActivationModal('AI Smart Input Transaksi');
    return;
  }

  let parsedResult = null;

  function renderAIContent() {
    const categoriesMap = {};
    appState.categories.forEach(c => { categoriesMap[c.id] = c; });
    const accountsMap = {};
    appState.accounts.forEach(a => { accountsMap[a.id] = a; });
    const membersMap = {};
    appState.members.forEach(m => { membersMap[m.id] = m; });

    return `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <!-- Header banner -->
        <div style="background:linear-gradient(135deg, #ecfdf5, #f0fdf4);border:1px solid #a7f3d0;border-radius:var(--radius-lg);padding:1rem 1.25rem;display:flex;align-items:center;gap:0.875rem;">
          <div style="width:38px;height:38px;border-radius:var(--radius-full);background:white;color:var(--color-primary-600);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(16,185,129,0.2);flex-shrink:0;">
            ${Icons.sparkles(20)}
          </div>
          <div>
            <div style="font-size:0.9375rem;font-weight:800;color:var(--color-slate-900);">AI Assistant Dompet Keluarga</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.15rem;">
              Ketik kalimat bebas dalam bahasa sehari-hari, AI akan mengekstrak nominal, jenis, kategori, dan rekening otomatis.
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="form-group" style="margin-bottom:0;">
          <label class="form-label">Tulis Transaksi Anda *</label>
          <div style="position:relative;">
            <textarea 
              id="ai-text-input" 
              class="form-textarea" 
              rows="3" 
              placeholder="Contoh: Beli soto ayam dan es teh 45.000 bayar pakai gopay ibu..." 
              style="padding-right:2.5rem;font-size:0.9375rem;line-height:1.5;"
            ></textarea>
            <button type="button" id="btn-ai-parse-trigger" style="position:absolute;right:8px;bottom:8px;background:var(--color-primary-600);color:white;border:none;border-radius:var(--radius-sm);padding:6px 10px;cursor:pointer;display:flex;align-items:center;gap:4px;font-size:0.75rem;font-weight:700;">
              ${Icons.sparkles(14)} Analisis
            </button>
          </div>
        </div>

        <!-- Quick Example Prompts -->
        <div>
          <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.5rem;">Contoh Kalimat Cepat:</div>
          <div style="display:flex;flex-wrap:wrap;gap:0.375rem;">
            <button type="button" class="preset-chip ai-prompt-chip" data-prompt="Makan siang soto ayam 45.000 bayar pakai gopay">
              🍜 Soto ayam 45rb (GoPay)
            </button>
            <button type="button" class="preset-chip ai-prompt-chip" data-prompt="Gaji freelance proyek website 3.5jt masuk bca ayah">
              💼 Freelance 3.5jt (BCA)
            </button>
            <button type="button" class="preset-chip ai-prompt-chip" data-prompt="Isi bensin pertamax mobil 250rb dari kas tunai">
              ⛽ Bensin 250rb (Tunai)
            </button>
            <button type="button" class="preset-chip ai-prompt-chip" data-prompt="Transfer tabungan 2jt dari bca ke mandiri">
              🔄 Transfer 2jt BCA ke Mandiri
            </button>
          </div>
        </div>

        <!-- Live Parsed Result Card -->
        <div id="ai-parsed-preview-container" style="display:none;background:var(--color-slate-50);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:1rem 1.25rem;">
          <!-- Dynamically inserted -->
        </div>
      </div>
    `;
  }

  function updatePreview(parsed) {
    parsedResult = parsed;
    const container = document.getElementById('ai-parsed-preview-container');
    if (!container || !parsed) return;

    const cat = appState.getCategoryById(parsed.categoryId);
    const acc = appState.getAccountById(parsed.accountId);
    const targetAcc = parsed.targetAccountId ? appState.getAccountById(parsed.targetAccountId) : null;
    const member = appState.members.find(m => m.id === parsed.memberId);

    const catColor = cat ? cat.color : '#94a3b8';
    const iconName = parsed.type === 'transfer' ? 'arrowRightLeft' : (cat ? cat.icon : 'tag');

    container.style.display = 'block';
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.875rem;padding-bottom:0.625rem;border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <span style="color:var(--color-primary-600);">${Icons.checkCircle(18)}</span>
          <span style="font-size:0.875rem;font-weight:800;color:var(--color-slate-900);">Hasil Analisis AI (Terdeteksi)</span>
        </div>
        <span class="badge badge-${parsed.type}" style="text-transform:uppercase;">
          ${parsed.type}
        </span>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.8125rem;">
        <div>
          <span style="color:var(--text-muted);">Deskripsi:</span>
          <div style="font-weight:700;color:var(--color-slate-900);">${parsed.description}</div>
        </div>
        <div>
          <span style="color:var(--text-muted);">Nominal:</span>
          <div style="font-weight:800;font-size:1.0625rem;color:${parsed.type === 'income' ? 'var(--color-income)' : parsed.type === 'expense' ? 'var(--color-expense)' : 'var(--color-transfer)'};">
            ${formatRupiah(parsed.amount)}
          </div>
        </div>
        ${parsed.type !== 'transfer' ? `
          <div>
            <span style="color:var(--text-muted);">Kategori:</span>
            <div style="font-weight:700;color:var(--color-slate-900);display:flex;align-items:center;gap:0.375rem;">
              <span style="width:8px;height:8px;border-radius:50%;background:${catColor};"></span>
              ${cat ? cat.name : 'Umum'}
            </div>
          </div>
        ` : ''}
        <div>
          <span style="color:var(--text-muted);">${parsed.type === 'transfer' ? 'Akun Asal ➜ Tujuan:' : 'Rekening / Dompet:'}</span>
          <div style="font-weight:700;color:var(--color-slate-900);">
            ${acc ? acc.name : '-'} ${targetAcc ? `➜ ${targetAcc.name}` : ''}
          </div>
        </div>
        <div>
          <span style="color:var(--text-muted);">Anggota:</span>
          <div style="font-weight:700;color:var(--color-slate-900);">${member ? member.name : '-'}</div>
        </div>
        <div>
          <span style="color:var(--text-muted);">Tanggal:</span>
          <div style="font-weight:700;color:var(--color-slate-900);">${parsed.date}</div>
        </div>
      </div>
    `;
  }

  modal.open({
    title: '✨ Catat Pintar Pakai AI',
    content: renderAIContent(),
    maxWidth: '560px',
    footerButtons: [
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: 'Simpan Transaksi',
        className: 'btn-primary',
        onClick: () => {
          if (!parsedResult) {
            const inputVal = document.getElementById('ai-text-input')?.value;
            if (inputVal && inputVal.trim()) {
              parsedResult = parseNaturalLanguageTransaction(inputVal);
            }
          }

          if (!parsedResult || !parsedResult.amount) {
            toast.error('Harap masukkan kalimat transaksi atau klik Analisis terlebih dahulu.');
            return;
          }

          appState.addTransaction({
            type: parsedResult.type,
            amount: parsedResult.amount,
            description: parsedResult.description,
            date: parsedResult.date,
            accountId: parsedResult.accountId,
            targetAccountId: parsedResult.targetAccountId,
            categoryId: parsedResult.categoryId,
            subcategory: parsedResult.subcategory,
            memberId: parsedResult.memberId,
            notes: `Dicatat via AI Assistant: "${parsedResult.rawPrompt}"`,
            status: 'verified'
          });

          toast.success(`Transaksi "${parsedResult.description}" sebesar ${formatRupiah(parsedResult.amount)} berhasil disimpan via AI!`);
          modal.close();
        }
      }
    ]
  });

  // Attach listeners inside AI modal
  const textarea = document.getElementById('ai-text-input');
  const parseBtn = document.getElementById('btn-ai-parse-trigger');

  if (textarea) {
    textarea.oninput = (e) => {
      if (e.target.value.length > 5) {
        const parsed = parseNaturalLanguageTransaction(e.target.value);
        updatePreview(parsed);
      }
    };
  }

  if (parseBtn && textarea) {
    parseBtn.onclick = () => {
      const parsed = parseNaturalLanguageTransaction(textarea.value);
      if (parsed) {
        updatePreview(parsed);
        toast.info('Analisis kalimat selesai!');
      } else {
        toast.error('Ketik kalimat transaksi terlebih dahulu.');
      }
    };
  }

  document.querySelectorAll('.ai-prompt-chip').forEach(chip => {
    chip.onclick = () => {
      const prompt = chip.dataset.prompt;
      if (textarea) {
        textarea.value = prompt;
        const parsed = parseNaturalLanguageTransaction(prompt);
        updatePreview(parsed);
      }
    };
  });
}

export function openAiModal() {
  return openAIExpenseModal();
}

