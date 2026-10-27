/**
 * Smart Receipt Scan, OCR Analysis & Confirmation Modal Component
 * Dompet Keluarga V3.18.7
 */
import { appState } from '../state.js';
import { analyzeReceiptImage, SAMPLE_RECEIPTS, getGeminiApiKey, setGeminiApiKey, hasGeminiApiKey, verifyGeminiApiKey, DEFAULT_DEVELOPER_GEMINI_KEY } from '../utils/receiptScanner.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons, getCategoryIcon } from './icons.js';
import { formatRupiah, parseRupiah } from '../utils.js';
import { LicenseService } from '../utils/licenseService.js';
import { openLicenseActivationModal } from './licenseModal.js';

/**
 * Modal Popup untuk Memasang / Mengelola Kunci Google Gemini AI Vision
 */
export function openGeminiKeyModal(onSuccess) {
  const currentKey = getGeminiApiKey();
  const isDevKey = currentKey === DEFAULT_DEVELOPER_GEMINI_KEY;
  const statusBadge = currentKey 
    ? (isDevKey ? '● Kunci Developer Aktif (Bawaan Sistem)' : '● Kunci Pribadi Aktif')
    : '○ Belum Diatur';

  const content = `
    <div style="display:flex;flex-direction:column;gap:1.25rem;">
      <div style="background:linear-gradient(135deg, #eff6ff, #f5f3ff);border:1px solid #c7d2fe;border-radius:var(--radius-lg);padding:1rem 1.25rem;display:flex;align-items:flex-start;gap:0.875rem;">
        <div style="width:40px;height:40px;border-radius:var(--radius-full);background:white;color:#4f46e5;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(79,70,229,0.2);flex-shrink:0;font-size:1.25rem;">
          ✨
        </div>
        <div>
          <div style="font-size:0.9375rem;font-weight:800;color:var(--color-slate-900);">Google Gemini Flash Vision AI</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.2rem;line-height:1.4;">
            Aplikasi telah terhubung dengan Google Gemini Vision AI developer untuk pembacaan struk instan. Anda juga dapat menggunakan API Key pribadi sendiri dari Google AI Studio.
          </div>
        </div>
      </div>

      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label" for="input-gemini-key" style="font-size:0.8125rem;font-weight:700;display:flex;justify-content:space-between;">
          <span>Kunci API Google Gemini (API Key)</span>
          <span style="color:${currentKey ? '#059669' : '#d97706'};font-size:0.7rem;font-weight:700;">
            ${statusBadge}
          </span>
        </label>
        <div style="position:relative;">
          <input 
            type="password" 
            id="input-gemini-key" 
            class="form-input" 
            placeholder="AIzaSy..." 
            value="${currentKey}" 
            style="font-family:monospace;font-size:0.85rem;padding-right:75px;"
          />
          <button 
            type="button" 
            id="btn-toggle-gemini-key-vis" 
            style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:#64748b;font-size:0.75rem;font-weight:700;cursor:pointer;padding:4px 8px;"
          >
            Lihat
          </button>
        </div>
        <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.35rem;">
          Kunci disimpan aman di memori lokal peramban Anda (localStorage) dan langsung dipakai untuk menghubungi API resmi Google.
        </p>
      </div>

      <!-- Quick 1-Click Guide -->
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:0.875rem 1rem;">
        <div style="font-size:0.75rem;font-weight:800;color:var(--color-slate-800);margin-bottom:0.35rem;display:flex;align-items:center;gap:0.35rem;">
          💡 Cara Dapatkan Kunci Gratis dalam 1 Menit:
        </div>
        <ol style="margin:0;padding-left:1.2rem;font-size:0.75rem;color:#475569;line-height:1.5;">
          <li>Klik tombol biru di bawah untuk membuka <strong>Google AI Studio</strong>.</li>
          <li>Login dengan Akun Google Anda, lalu klik tombol <strong>"Create API Key"</strong>.</li>
          <li>Salin kuncinya (diawali <code>AIzaSy...</code>) dan tempel di formulir atas, lalu klik <strong>Uji & Simpan</strong>.</li>
        </ol>

        <div style="margin-top:0.75rem;">
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn btn-secondary btn-sm" 
            style="display:inline-flex;align-items:center;gap:0.375rem;font-size:0.75rem;color:#2563eb;border-color:#93c5fd;background:#eff6ff;text-decoration:none;font-weight:700;"
          >
            🚀 Buka Google AI Studio (Dapatkan Kunci Gratis) ↗
          </a>
        </div>
      </div>
    </div>
  `;

  modal.open({
    title: 'Pengaturan Kunci Google Gemini AI Vision',
    content: content,
    maxWidth: '520px',
    footerButtons: [
      ...(currentKey ? [
        {
          label: 'Hapus Kunci',
          className: 'btn-secondary',
          style: 'color:#dc2626;',
          onClick: () => {
            setGeminiApiKey('');
            toast.info('Kunci Google Gemini AI telah dihapus.');
            modal.close();
            if (onSuccess) onSuccess();
          }
        }
      ] : []),
      {
        label: 'Batal',
        className: 'btn-secondary',
        onClick: () => modal.close()
      },
      {
        label: '⚡ Uji & Simpan Kunci',
        className: 'btn-primary',
        onClick: async () => {
          const input = document.getElementById('input-gemini-key');
          const keyVal = input ? input.value.trim() : '';

          if (!keyVal) {
            toast.error('Harap masukkan kunci API Gemini Anda.');
            return;
          }

          toast.info('Menguji koneksi ke server Google AI...');
          const verify = await verifyGeminiApiKey(keyVal);

          if (!verify.success) {
            toast.error(`Kunci tidak valid: ${verify.message}`);
            return;
          }

          setGeminiApiKey(keyVal);
          toast.success('✨ Kunci Google Gemini AI aktif & berhasil diverifikasi!');
          modal.close();
          if (onSuccess) onSuccess();
        }
      }
    ]
  });

  const toggleBtn = document.getElementById('btn-toggle-gemini-key-vis');
  const inputEl = document.getElementById('input-gemini-key');
  if (toggleBtn && inputEl) {
    toggleBtn.onclick = () => {
      if (inputEl.type === 'password') {
        inputEl.type = 'text';
        toggleBtn.textContent = 'Sembunyikan';
      } else {
        inputEl.type = 'password';
        toggleBtn.textContent = 'Lihat';
      }
    };
  }
}

export function openReceiptScanModal() {
  if (!LicenseService.isLicensed()) {
    openLicenseActivationModal('AI Scan Struk / Nota');
    return;
  }

  let currentStep = 'upload'; // 'upload' | 'scanning' | 'confirm'
  let currentImageDataUrl = null;
  let analysisResult = null;
  let scanStatusText = hasGeminiApiKey() ? 'Menghubungi Google Gemini Vision AI...' : 'Menganalisis foto struk...';
  let scanProgressPct = 20;

  function renderModalContent() {
    const categories = appState.categories.filter(c => c.type === 'expense');
    const accounts = appState.getAccountsWithBalances().filter(a => !a.isArchived);
    const members = appState.members;

    if (currentStep === 'upload') {
      const isAiActive = hasGeminiApiKey();

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

          <!-- Gemini AI Engine Status Bar -->
          <div style="background:${isAiActive ? '#ecfdf5' : 'linear-gradient(135deg, #eff6ff, #f5f3ff)'};border:1px solid ${isAiActive ? '#6ee7b7' : '#c7d2fe'};border-radius:var(--radius-lg);padding:0.75rem 1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.625rem;">
              <span style="font-size:1.25rem;">${isAiActive ? '✨' : '🤖'}</span>
              <div>
                <div style="font-size:0.8125rem;font-weight:800;color:${isAiActive ? '#065f46' : '#1e40af'};">
                  ${isAiActive ? 'Google Gemini Flash Vision AI Aktif' : 'Mode AI Vision Siap Pakai'}
                </div>
                <div style="font-size:0.7rem;color:${isAiActive ? '#047857' : '#4338ca'};">
                  ${isAiActive ? 'Akurasi 99% • Nama toko, nominal & kategori akurat otomatis' : 'Pasang kunci Gemini gratis untuk akurasi foto maksimal'}
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-gemini-config" style="font-size:0.75rem;padding:0.3rem 0.65rem;font-weight:700;color:${isAiActive ? '#065f46' : '#4338ca'};border-color:${isAiActive ? '#a7f3d0' : '#c7d2fe'};background:white;">
              ${isAiActive ? '⚙️ Kunci AI' : '🔑 Kunci AI Gratis'}
            </button>
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
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1rem;gap:1.25rem;text-align:center;">
          <div style="position:relative;width:220px;height:220px;border-radius:var(--radius-lg);overflow:hidden;border:2px solid #3b82f6;box-shadow:0 8px 24px rgba(59,130,246,0.25);background:#0f172a;">
            <img src="${currentImageDataUrl}" alt="Struk Scanned" style="width:100%;height:100%;object-fit:cover;opacity:0.8;" />
            <!-- Glowing Laser Line -->
            <div style="position:absolute;top:0;left:0;right:0;height:4px;background:#60a5fa;box-shadow:0 0 14px #3b82f6, 0 0 24px #93c5fd;animation:laserScan 1.6s ease-in-out infinite;"></div>
          </div>

          <div style="width:100%;max-width:320px;">
            <div style="font-size:1rem;font-weight:800;color:var(--color-slate-900);display:flex;align-items:center;justify-content:center;gap:0.5rem;">
              <span style="color:#2563eb;">${Icons.sparkles(20)}</span> Memindai Teks Struk...
            </div>
            
            <div style="width:100%;height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;margin:0.75rem auto 0.35rem;">
              <div id="scan-progress-bar" style="width:${scanProgressPct}%;height:100%;background:linear-gradient(90deg, #3b82f6, #10b981);transition:width 0.25s ease;"></div>
            </div>

            <div id="scan-status-text" style="font-size:0.8125rem;font-weight:700;color:#2563eb;">
              ${scanStatusText}
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.35rem;">
              Membaca nama merchant, nominal, tanggal, dan mencocokkan kategori keuangan secara otomatis.
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
      const isGeminiEngine = res.engineUsed === 'gemini';

      return `
        <form id="receipt-confirm-form" onsubmit="return false;" style="display:flex;flex-direction:column;gap:1.25rem;">
          <!-- Engine Analysis Status Banner -->
          <div style="background:${isGeminiEngine ? '#ecfdf5' : '#fffbeb'};border:1px solid ${isGeminiEngine ? '#6ee7b7' : '#fde68a'};border-radius:var(--radius-md);padding:0.75rem 1rem;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;color:${isGeminiEngine ? '#065f46' : '#92400e'};font-size:0.8125rem;font-weight:700;">
              ${isGeminiEngine ? Icons.checkCircle(18) : Icons.alertCircle(18)} 
              <div>
                <div>${isGeminiEngine ? '✨ Dianalisis Cerdas oleh ' + (res.engineLabel || 'Google Gemini AI') : '⚠️ Menggunakan ' + (res.engineLabel || 'Pembaca Teks Cadangan')} (Akurasi ${res.confidenceScore}%)</div>
                ${!isGeminiEngine ? '<div style="font-size:0.7rem;font-weight:500;color:#b45309;margin-top:0.15rem;">Mohon periksa kembali nominal di bawah ini. Untuk akurasi 99% otomatis, pastikan setelan akses Apps Script diset "Siapa saja".</div>' : ''}
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              ${!hasGeminiApiKey() ? `
                <button type="button" class="btn btn-secondary btn-sm" id="btn-upgrade-ai-key" style="font-size:0.72rem;padding:0.25rem 0.5rem;color:#4338ca;border-color:#c7d2fe;background:#eef2ff;">
                  ✨ Kunci Gemini
                </button>
              ` : ''}
              <button type="button" class="btn btn-secondary btn-sm" id="btn-re-scan" style="font-size:0.75rem;padding:0.25rem 0.5rem;">
                ${Icons.camera(12)} Ganti Foto
              </button>
            </div>
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
                  value="${(res.amount || 0).toLocaleString('id-ID')}" 
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

            <!-- Category & Account with Reason Badge & Quick Chips -->
            <div style="display:flex;flex-direction:column;gap:0.75rem;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label" style="font-size:0.8125rem;display:flex;justify-content:space-between;">
                    <span>Kategori Pengeluaran *</span>
                    <span style="color:#059669;font-weight:700;font-size:0.7rem;">AI Auto-Match</span>
                  </label>
                  <select id="confirm-tx-cat" class="form-select" style="font-weight:700;color:#0f172a;border-color:#10b981;">
                    ${categories.map(c => `
                      <option value="${c.id}" ${c.id === (res.category ? res.category.id : '') ? 'selected' : ''}>
                        ${c.name}
                      </option>
                    `).join('')}
                  </select>
                  <div style="font-size:0.7rem;color:#059669;margin-top:0.25rem;font-weight:600;">
                    ✨ ${res.categoryReason || 'Kategori terdeteksi otomatis'}
                  </div>
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

              <!-- Quick Category Chips -->
              <div>
                <div style="font-size:0.7rem;font-weight:700;color:var(--text-muted);margin-bottom:0.35rem;">Ganti Kategori Cepat (1 Klik):</div>
                <div style="display:flex;flex-wrap:wrap;gap:0.35rem;">
                  ${categories.slice(0, 6).map(c => `
                    <button type="button" class="btn-quick-cat" data-cat-id="${c.id}" style="padding:0.25rem 0.6rem;background:${c.id === (res.category ? res.category.id : '') ? '#ecfdf5' : '#f8fafc'};border:1px solid ${c.id === (res.category ? res.category.id : '') ? '#10b981' : '#cbd5e1'};color:${c.id === (res.category ? res.category.id : '') ? '#065f46' : '#475569'};font-size:0.72rem;font-weight:700;border-radius:99px;cursor:pointer;">
                      ${c.name}
                    </button>
                  `).join('')}
                </div>
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

            <!-- OCR Raw Text Transparency (Collapsible) -->
            <details style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:0.5rem 0.75rem;font-size:0.75rem;color:#64748b;margin-top:0.25rem;">
              <summary style="cursor:pointer;font-weight:700;color:#334155;">🔍 Lihat Teks Asli yang Terbaca dari Struk (OCR)</summary>
              <pre style="white-space:pre-wrap;font-family:monospace;font-size:0.7rem;margin:0.5rem 0 0;max-height:110px;overflow-y:auto;background:#ffffff;padding:0.5rem;border-radius:6px;border:1px solid #cbd5e1;color:#1e293b;">${res.rawText || '(Teks tidak terbaca jelas atau struk sampel)'}</pre>
            </details>
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
    ctx.fillText(sample.date + '  12:30 WIB', 200, 70);
    ctx.fillText('----------------------------------------', 200, 90);

    // Items
    let y = 120;
    ctx.textAlign = 'left';
    ctx.font = '13px sans-serif';

    sample.items.forEach(item => {
      ctx.fillStyle = '#1e293b';
      ctx.fillText(`${item.name}`, 30, y);
      ctx.fillStyle = '#64748b';
      ctx.fillText(`x${item.qty}`, 250, y);
      ctx.textAlign = 'right';
      ctx.fillText(`Rp ${item.price.toLocaleString('id-ID')}`, 370, y);
      ctx.textAlign = 'left';
      y += 28;
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
    scanStatusText = 'Memuat model AI OCR...';
    scanProgressPct = 20;
    updateModal();

    try {
      analysisResult = await analyzeReceiptImage(dataUrl, fileName, (msg, pct) => {
        scanStatusText = msg;
        scanProgressPct = pct;
        const bar = document.getElementById('scan-progress-bar');
        const textEl = document.getElementById('scan-status-text');
        if (bar) bar.style.width = `${pct}%`;
        if (textEl) textEl.textContent = msg;
      });

      currentStep = 'confirm';
      updateModal();
      toast.success('Struk berhasil dianalisis! Silakan periksa dan konfirmasi.');
    } catch (e) {
      console.error('Scan error:', e);
      toast.error('Gagal membaca struk, silakan coba foto lain atau masukkan manual.');
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

      // Gemini AI Key Config Button
      const geminiConfigBtn = document.getElementById('btn-modal-gemini-config');
      if (geminiConfigBtn) {
        geminiConfigBtn.onclick = () => {
          openGeminiKeyModal(() => {
            updateModal();
          });
        };
      }
    }

    if (currentStep === 'confirm') {
      const upgradeAiBtn = document.getElementById('btn-upgrade-ai-key');
      if (upgradeAiBtn) {
        upgradeAiBtn.onclick = () => {
          openGeminiKeyModal(() => {
            updateModal();
          });
        };
      }

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

      // Quick Category Chips Click Listener
      document.querySelectorAll('.btn-quick-cat').forEach(chip => {
        chip.onclick = () => {
          const catId = chip.dataset.catId;
          const select = document.getElementById('confirm-tx-cat');
          if (select) {
            select.value = catId;
          }
          document.querySelectorAll('.btn-quick-cat').forEach(c => {
            const isMatch = c.dataset.catId === catId;
            c.style.background = isMatch ? '#ecfdf5' : '#f8fafc';
            c.style.borderColor = isMatch ? '#10b981' : '#cbd5e1';
            c.style.color = isMatch ? '#065f46' : '#475569';
          });
        };
      });
    }
  }

  // Initial Open
  updateModal();
}

export const openReceiptScanner = openReceiptScanModal;
