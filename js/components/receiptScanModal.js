/**
 * Smart Receipt Scan, OCR Analysis & Confirmation Modal Component
 * Dompet Keluarga V2
 */
import { appState } from '../state.js';
import { analyzeReceiptImage, SAMPLE_RECEIPTS } from '../utils/receiptScanner.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons, getCategoryIcon } from './icons.js';
import { formatRupiah, parseRupiah } from '../utils.js';

export function openReceiptScanModal() {
  let currentStep = 'upload'; // 'upload' | 'scanning' | 'confirm'
  let currentImageDataUrl = null;
  let analysisResult = null;

  function renderModalContent() {
    const categories = appState.categories.filter(c => c.type === 'expense');
    const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
    const members = appState.members;

    if (currentStep === 'upload') {
      return `
        <div style="display:flex;flex-direction:column;gap:1.25rem;">
          <!-- Top Description Banner -->
          <div style="background:linear-gradient(135deg, #eff6ff, #f0fdf4);border:1px solid #bfdbfe;border-radius:var(--radius-lg);padding:1rem 1.25rem;display:flex;align-items:center;gap:0.875rem;">
            <div style="width:40px;height:40px;border-radius:var(--radius-full);background:white;color:#2563eb;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(37,99,235,0.2);flex-shrink:0;">
              ${Icons.camera(22)}
            </div>
            <div>
              <div style="font-size:0.9375rem;font-weight:800;color:var(--color-slate-900);">AI Analisis Struk & Nota Pembayaran</div>
              <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.15rem;">
                Foto atau unggah struk belanjaan, AI otomatis membaca toko, nominal, item belanja, lalu Anda tinggal konfirmasi.
              </div>
            </div>
          </div>

          <!-- Dropzone Upload Area -->
          <div id="receipt-dropzone" style="border:2px dashed #93c5fd;border-radius:var(--radius-lg);background:#f8fafc;padding:2rem 1rem;text-align:center;cursor:pointer;transition:all 0.2s ease;">
            <label for="receipt-file-picker" style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:0.625rem;">
              <div style="width:52px;height:52px;border-radius:50%;background:#dbeafe;color:#1d4ed8;display:flex;align-items:center;justify-content:center;">
                ${Icons.uploadCloud(26)}
              </div>
              <div>
                <div style="font-size:0.9375rem;font-weight:800;color:var(--color-slate-800);">Pilih atau Jepret Foto Struk</div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">Format JPG, PNG, atau WebP (Kamera HP / Komputer)</div>
              </div>
            </label>
            <input type="file" id="receipt-file-picker" accept="image/*" capture="environment" style="display:none;" />
          </div>

          <!-- Quick Sample Receipts for Fast Testing -->
          <div>
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.625rem;display:flex;align-items:center;gap:0.375rem;">
              ${Icons.sparkles(14)} Atau Coba Contoh Struk Simulasi:
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:0.625rem;">
              ${SAMPLE_RECEIPTS.map(s => `
                <button type="button" class="btn-sample-receipt" data-sample-id="${s.id}" style="background:white;border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:0.625rem 0.75rem;text-align:left;cursor:pointer;display:flex;flex-direction:column;gap:0.25rem;transition:all 0.15s ease;">
                  <div style="display:flex;justify-content:space-between;align-items:center;">
                    <span style="font-size:0.8125rem;font-weight:800;color:var(--color-slate-800);">${s.name}</span>
                  </div>
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:0.6875rem;color:var(--text-muted);">
                    <span>${s.badge}</span>
                    <span style="font-weight:700;color:var(--color-slate-900);">${formatRupiah(s.amount)}</span>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    if (currentStep === 'scanning') {
      return `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2.5rem 1rem;gap:1.5rem;text-align:center;">
          <div style="position:relative;width:240px;height:240px;border-radius:var(--radius-lg);overflow:hidden;border:2px solid #3b82f6;box-shadow:0 8px 24px rgba(59,130,246,0.25);background:#0f172a;">
            <img src="${currentImageDataUrl}" alt="Struk Scanned" style="width:100%;height:100%;object-fit:cover;opacity:0.75;" />
            
            <!-- Glowing Laser Line -->
            <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#60a5fa;box-shadow:0 0 14px #3b82f6, 0 0 24px #93c5fd;animation:laserScan 1.6s ease-in-out infinite;"></div>
          </div>

          <div>
            <div style="font-size:1.125rem;font-weight:800;color:var(--color-slate-900);display:flex;align-items:center;justify-content:center;gap:0.5rem;">
              <span style="color:#2563eb;">${Icons.sparkles(20)}</span> AI Sedang Menganalisis Struk...
            </div>
            <p style="font-size:0.8125rem;color:var(--text-muted);margin-top:0.375rem;">
              Mengekstrak nama toko, rincian barang belanjaan, tanggal transaksi, dan total pembayaran.
            </p>
          </div>

          <style>
            @keyframes laserScan {
              0% { top: 5%; }
              50% { top: 92%; }
              100% { top: 5%; }
            }
          </style>
        </div>
      `;
    }

    if (currentStep === 'confirm' && analysisResult) {
      const res = analysisResult;
      return `
        <form id="receipt-confirm-form" onsubmit="return false;" style="display:flex;flex-direction:column;gap:1.25rem;">
          <!-- Success AI Banner -->
          <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:var(--radius-md);padding:0.75rem 1rem;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:0.5rem;color:#065f46;font-size:0.8125rem;font-weight:700;">
              ${Icons.checkCircle(18)} Hasil Analisis AI Berhasil (Akurasi ${res.confidenceScore}%)
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-re-scan" style="font-size:0.75rem;padding:0.25rem 0.5rem;">
              ${Icons.camera(12)} Ganti Foto
            </button>
          </div>

          <!-- Struk Preview & Items Breakdown -->
          <div style="display:grid;grid-template-columns:140px 1fr;gap:1rem;background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
            <!-- Image Thumbnail -->
            <div style="text-align:center;">
              <img src="${currentImageDataUrl}" alt="Foto Struk" style="width:100%;height:140px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid var(--border-subtle);box-shadow:var(--shadow-xs);" />
              <span class="badge" style="background:#e0f2fe;color:#0369a1;margin-top:0.375rem;font-size:0.6875rem;">Struk Terlampir</span>
            </div>

            <!-- Items Table from OCR -->
            <div style="overflow-y:auto;max-height:150px;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.375rem;">
                Rincian Barang Terbaca (${res.items.length} item):
              </div>
              <div style="display:flex;flex-direction:column;gap:0.375rem;font-size:0.8125rem;">
                ${res.items.map(item => `
                  <div style="display:flex;justify-content:space-between;background:white;padding:0.375rem 0.5rem;border-radius:var(--radius-sm);border:1px solid var(--color-slate-200);">
                    <span style="font-weight:600;color:var(--color-slate-800);">${item.name} <small style="color:var(--text-muted);">(x${item.qty})</small></span>
                    <span style="font-weight:700;color:var(--color-slate-900);">${formatRupiah(item.price)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Editable Confirmation Form -->
          <div style="display:flex;flex-direction:column;gap:0.875rem;">
            <!-- Total Nominal -->
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.8125rem;font-weight:700;">Total Nominal Transaksi *</label>
              <div class="currency-input-wrapper">
                <span class="currency-prefix">Rp</span>
                <input 
                  type="text" 
                  id="confirm-tx-amount" 
                  class="form-input currency-input" 
                  value="${res.amount.toLocaleString('id-ID')}" 
                  style="font-size:1.125rem;font-weight:800;color:var(--color-expense);"
                  required 
                />
              </div>
            </div>

            <!-- Description & Date -->
            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:0.75rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Deskripsi Transaksi *</label>
                <input 
                  type="text" 
                  id="confirm-tx-desc" 
                  class="form-input" 
                  value="${res.description}" 
                  required 
                />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Tanggal *</label>
                <input 
                  type="date" 
                  id="confirm-tx-date" 
                  class="form-input" 
                  value="${res.date}" 
                  required 
                />
              </div>
            </div>

            <!-- Category & Account -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Kategori Pengeluaran *</label>
                <select id="confirm-tx-cat" class="form-select">
                  ${categories.map(c => `
                    <option value="${c.id}" ${c.id === (res.category ? res.category.id : '') ? 'selected' : ''}>
                      ${c.name}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Rekening / Dompet Asal *</label>
                <select id="confirm-tx-acc" class="form-select">
                  ${accounts.map(a => `
                    <option value="${a.id}" ${a.id === (res.account ? res.account.id : '') ? 'selected' : ''}>
                      ${a.name} (${formatRupiah(a.currentBalance)})
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <!-- Member & Notes -->
            <div style="display:grid;grid-template-columns:1fr 1.5fr;gap:0.75rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Anggota Keluarga *</label>
                <select id="confirm-tx-member" class="form-select">
                  ${members.map(m => `
                    <option value="${m.id}" ${m.id === appState.currentUser.id ? 'selected' : ''}>
                      ${m.name} (${m.roleLabel || m.role})
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.8125rem;">Catatan Item</label>
                <input 
                  type="text" 
                  id="confirm-tx-notes" 
                  class="form-input" 
                  value="${res.notes}" 
                />
              </div>
            </div>
          </div>
        </form>
      `;
    }

    return '';
  }

  function getFooterButtons() {
    if (currentStep === 'upload') {
      return [
        {
          label: 'Tutup',
          className: 'btn-secondary',
          onClick: () => modal.close()
        }
      ];
    }

    if (currentStep === 'scanning') {
      return [];
    }

    if (currentStep === 'confirm') {
      return [
        {
          label: 'Batal',
          className: 'btn-secondary',
          onClick: () => modal.close()
        },
        {
          label: '✓ Konfirmasi & Catat Transaksi',
          className: 'btn-primary',
          onClick: () => {
            const amountInput = document.getElementById('confirm-tx-amount');
            const descInput = document.getElementById('confirm-tx-desc');
            const dateInput = document.getElementById('confirm-tx-date');
            const catSelect = document.getElementById('confirm-tx-cat');
            const accSelect = document.getElementById('confirm-tx-acc');
            const memberSelect = document.getElementById('confirm-tx-member');
            const notesInput = document.getElementById('confirm-tx-notes');

            const amountRaw = parseRupiah(amountInput ? amountInput.value : '0');
            const desc = descInput ? descInput.value.trim() : '';
            const date = dateInput ? dateInput.value : '';
            const categoryId = catSelect ? catSelect.value : '';
            const accountId = accSelect ? accSelect.value : '';
            const memberId = memberSelect ? memberSelect.value : appState.currentUser.id;
            const notes = notesInput ? notesInput.value.trim() : '';

            if (!amountRaw || amountRaw <= 0) {
              toast.error('Harap masukkan nominal yang valid.');
              return;
            }
            if (!desc) {
              toast.error('Deskripsi transaksi wajib diisi.');
              return;
            }

            // Save transaction with attached receipt photo
            appState.addTransaction({
              type: 'expense',
              amount: amountRaw,
              description: desc,
              date: date || new Date().toISOString().split('T')[0],
              categoryId,
              accountId,
              memberId,
              notes,
              receiptUrl: currentImageDataUrl,
              status: 'verified'
            });

            toast.success(`Transaksi "${desc}" sebesar ${formatRupiah(amountRaw)} berhasil dicatat!`);
            modal.close();
          }
        }
      ];
    }
    return [];
  }

  function updateModal() {
    modal.open({
      title: currentStep === 'confirm' ? 'Konfirmasi Hasil Analisis Struk' : 'Scan & Analisis Foto Struk (AI OCR)',
      content: renderModalContent(),
      maxWidth: currentStep === 'confirm' ? '600px' : '520px',
      footerButtons: getFooterButtons()
    });
    attachStepListeners();
  }

  function createSyntheticReceiptImage(sample) {
    // Generate a clean simulated receipt dataUrl using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 520);

    // Header styling
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sample.merchant, 200, 45);

    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Tanggal: ${sample.date}  •  Kasir: #04`, 200, 70);
    ctx.fillText('========================================', 200, 90);

    // Items
    let y = 120;
    ctx.textAlign = 'left';
    sample.items.forEach(item => {
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(item.name, 30, y);
      
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Rp ${item.price.toLocaleString('id-ID')}`, 370, y);
      ctx.textAlign = 'left';
      y += 26;
    });

    ctx.fillStyle = '#64748b';
    ctx.fillText('----------------------------------------', 200, y);
    y += 28;

    // Total
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('TOTAL :', 30, y);
    ctx.textAlign = 'right';
    ctx.fillText(`Rp ${sample.amount.toLocaleString('id-ID')}`, 370, y);

    y += 35;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.fillText('*** TERIMA KASIH ATAS KUNJUNGAN ANDA ***', 200, y);

    return canvas.toDataURL('image/png');
  }

  async function processImage(dataUrl, fileName = '') {
    currentImageDataUrl = dataUrl;
    currentStep = 'scanning';
    updateModal();

    try {
      analysisResult = await analyzeReceiptImage(dataUrl, fileName);
      currentStep = 'confirm';
      updateModal();
      toast.success('Struk berhasil dianalisis! Silakan periksa dan konfirmasi.');
    } catch (e) {
      toast.error('Gagal menganalisis struk, silakan coba foto lain.');
      currentStep = 'upload';
      updateModal();
    }
  }

  function attachStepListeners() {
    if (currentStep === 'upload') {
      const fileInput = document.getElementById('receipt-file-picker');
      if (fileInput) {
        fileInput.onchange = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => {
            processImage(event.target.result, file.name);
          };
          reader.readAsDataURL(file);
        };
      }

      // Sample receipt buttons
      document.querySelectorAll('.btn-sample-receipt').forEach(btn => {
        btn.onclick = () => {
          const sampleId = btn.dataset.sampleId;
          const sample = SAMPLE_RECEIPTS.find(s => s.id === sampleId) || SAMPLE_RECEIPTS[0];
          const syntheticDataUrl = createSyntheticReceiptImage(sample);
          processImage(syntheticDataUrl, sample.merchant);
        };
      });
    }

    if (currentStep === 'confirm') {
      const reScanBtn = document.getElementById('btn-re-scan');
      if (reScanBtn) {
        reScanBtn.onclick = () => {
          currentStep = 'upload';
          currentImageDataUrl = null;
          analysisResult = null;
          updateModal();
        };
      }

      const amountInput = document.getElementById('confirm-tx-amount');
      if (amountInput) {
        amountInput.oninput = (e) => {
          const raw = parseRupiah(e.target.value);
          e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
        };
      }
    }
  }

  // Initial Open
  updateModal();
}

export const openReceiptScanner = openReceiptScanModal;
