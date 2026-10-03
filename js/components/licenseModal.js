/**
 * ============================================================================
 * DOMPETKU - LICENSE ACTIVATION MODAL (PAYWALL & LEAD CAPTURE POPUP v3.0)
 * ============================================================================
 * Menampilkan popup aktivasi lisensi PRO saat pengguna mencoba mengakses
 * fitur pencatatan transaksi jika belum memiliki lisensi resmi.
 * Dilengkapi input Nomor WhatsApp aktif untuk database marketing & validasi lisensi unik.
 */
import { Icons } from './icons.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { LicenseService } from '../utils/licenseService.js';

export function openLicenseActivationModal(featureName = 'Pencatatan Transaksi') {
  const currentLicense = LicenseService.getLicense();
  const isCurrentlyPro = LicenseService.isLicensed();
  const session = window.AuthAccess?.getSession() || {};

  const contentHtml = `
    <div class="license-modal-wrap" style="text-align:center;padding:0.5rem 0.25rem;">
      <!-- Hero Icon / Badge -->
      <div style="width:68px;height:68px;margin:0 auto 1.25rem;border-radius:20px;background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);border:2px solid #f59e0b;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 25px -5px rgba(245, 158, 11, 0.3);">
        <span style="color:#d97706;display:inline-flex;">
          ${Icons.sparkles ? Icons.sparkles(34) : Icons.checkCircle(34)}
        </span>
      </div>

      <h3 style="font-size:1.35rem;font-weight:800;color:var(--color-slate-900,#0f172a);margin:0 0 0.5rem;letter-spacing:-0.02em;">
        ${isCurrentlyPro ? 'Status Lisensi Dompetku PRO' : 'Aktifkan Lisensi Dompetku PRO'}
      </h3>

      <p style="font-size:0.92rem;color:var(--color-slate-600,#475569);line-height:1.55;margin:0 auto 1.25rem;max-width:420px;">
        ${isCurrentlyPro 
          ? 'Aplikasi Anda telah berstatus PRO resmi. Semua fitur pencatatan dan sinkronisasi aktif selamanya.'
          : `Fitur <strong style="color:var(--color-emerald-700,#047857);">${featureName}</strong> membutuhkan <strong>Lisensi Khusus Developer</strong> untuk digunakan secara penuh.`}
      </p>

      <!-- Benefits List Card -->
      <div style="background:var(--color-slate-50,#f8fafc);border:1px solid var(--color-slate-200,#e2e8f0);border-radius:14px;padding:1rem 1.15rem;text-align:left;margin-bottom:1.25rem;">
        <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--color-slate-500,#64748b);margin-bottom:0.65rem;">
          Keuntungan Akses Dompetku PRO:
        </div>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:0.5rem;font-size:0.875rem;color:var(--color-slate-800,#1e293b);">
          <li style="display:flex;align-items:center;gap:0.6rem;">
            <span style="color:#10b981;flex-shrink:0;">${Icons.checkCircle(16)}</span>
            <span><strong>Catat Transaksi Tanpa Batas</strong> (Pemasukan, Pengeluaran & Transfer)</span>
          </li>
          <li style="display:flex;align-items:center;gap:0.6rem;">
            <span style="color:#10b981;flex-shrink:0;">${Icons.checkCircle(16)}</span>
            <span><strong>AI OCR Scan Struk & Asisten Cerdas</strong> otomatis</span>
          </li>
          <li style="display:flex;align-items:center;gap:0.6rem;">
            <span style="color:#10b981;flex-shrink:0;">${Icons.checkCircle(16)}</span>
            <span><strong>Sinkronisasi Realtime Google Spreadsheet</strong> pribadi</span>
          </li>
          <li style="display:flex;align-items:center;gap:0.6rem;">
            <span style="color:#10b981;flex-shrink:0;">${Icons.checkCircle(16)}</span>
            <span><strong>Ekspor Laporan Keuangan</strong> Excel, CSV & PDF Lengkap</span>
          </li>
        </ul>
      </div>

      <!-- Activation Input Area (Lead Capture + License Key) -->
      <div style="background:#ffffff;border:1.5px dashed var(--color-emerald-400,#34d399);border-radius:14px;padding:1.15rem;margin-bottom:1.25rem;text-align:left;">
        
        <!-- Nomor WhatsApp Input (Marketing & Ownership) -->
        <div style="margin-bottom:0.85rem;">
          <label for="license-phone-input" style="display:block;font-size:0.82rem;font-weight:700;color:var(--color-slate-800,#1e293b);margin-bottom:0.35rem;">
            📱 Nomor WhatsApp Aktif (Wajib):
          </label>
          <input 
            type="tel" 
            id="license-phone-input" 
            placeholder="Contoh: 081234567890"
            value="${currentLicense?.phone || session.phone || ''}"
            style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid var(--color-slate-300,#cbd5e1);border-radius:8px;font-size:0.95rem;font-weight:600;color:var(--color-slate-900,#0f172a);background:var(--color-slate-50,#f8fafc);"
          />
          <div style="font-size:0.75rem;color:var(--color-slate-500,#64748b);margin-top:0.25rem;">
            Digunakan untuk validasi hak kepemilikan lisensi resmi & info pembaruan fitur.
          </div>
        </div>

        <!-- Kode Lisensi Input -->
        <div style="margin-bottom:0.5rem;">
          <label for="license-key-input" style="display:block;font-size:0.82rem;font-weight:700;color:var(--color-slate-800,#1e293b);margin-bottom:0.35rem;">
            🔑 Kode Serial Lisensi PRO:
          </label>
          <div style="display:flex;gap:0.5rem;">
            <input 
              type="text" 
              id="license-key-input" 
              placeholder="Contoh: DK-XXXX-YYYY-ZZZZ"
              value="${currentLicense?.key || ''}"
              style="flex:1;padding:0.65rem 0.85rem;border:1px solid var(--color-slate-300,#cbd5e1);border-radius:8px;font-family:monospace;font-size:0.95rem;font-weight:600;text-transform:uppercase;color:var(--color-slate-900,#0f172a);background:var(--color-slate-50,#f8fafc);"
            />
            <button 
              type="button" 
              id="btn-do-activate-license" 
              class="btn btn-primary"
              style="background:linear-gradient(135deg, #059669 0%, #047857 100%);border:none;padding:0.65rem 1.25rem;font-weight:700;white-space:nowrap;border-radius:8px;cursor:pointer;box-shadow:0 4px 12px rgba(5, 150, 105, 0.25);"
            >
              Aktivasi
            </button>
          </div>
        </div>

        <div id="license-msg-box" style="margin-top:0.5rem;font-size:0.82rem;line-height:1.4;"></div>
      </div>

      <!-- Purchase WhatsApp CTA -->
      <div style="display:flex;flex-direction:column;gap:0.6rem;">
        <a 
          href="${LicenseService.getBuyWhatsAppUrl(featureName)}" 
          target="_blank" 
          rel="noopener noreferrer"
          class="btn"
          style="display:flex;align-items:center;justify-content:center;gap:0.6rem;background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;font-size:0.95rem;padding:0.75rem 1.25rem;border-radius:10px;box-shadow:0 4px 14px rgba(37, 211, 102, 0.35);transition:transform 0.15s ease;"
          onmouseover="this.style.transform='translateY(-1px)'"
          onmouseout="this.style.transform='translateY(0)'"
        >
          <span>${Icons.send ? Icons.send(18) : '💬'}</span>
          <span>Beli / Minta Kunci Lisensi via WhatsApp</span>
        </a>

        ${isCurrentlyPro ? `
          <button 
            type="button" 
            id="btn-deactivate-license" 
            style="background:transparent;border:none;color:var(--color-expense,#ef4444);font-size:0.8rem;font-weight:600;cursor:pointer;padding:0.4rem;text-decoration:underline;"
          >
            Hapus / Ganti Lisensi di Perangkat Ini
          </button>
        ` : ''}
      </div>
    </div>
  `;

  modal.open({
    title: isCurrentlyPro ? '✨ Lisensi Dompetku PRO' : '🔒 Akses Fitur Terkunci (Lisensi PRO)',
    content: contentHtml,
    maxWidth: '480px',
    footerButtons: [
      {
        label: 'Tutup',
        className: 'btn-secondary',
        onClick: () => modal.close()
      }
    ]
  });

  // Attach event handlers
  setTimeout(() => {
    const keyInput = document.getElementById('license-key-input');
    const phoneInput = document.getElementById('license-phone-input');
    const btnActivate = document.getElementById('btn-do-activate-license');
    const msgBox = document.getElementById('license-msg-box');
    const btnDeactivate = document.getElementById('btn-deactivate-license');

    if (btnActivate && keyInput) {
      btnActivate.onclick = async () => {
        const rawKey = keyInput.value.trim();
        const rawPhone = phoneInput ? phoneInput.value.trim() : '';

        if (!rawPhone || rawPhone.length < 9) {
          msgBox.innerHTML = '<span style="color:#ef4444;font-weight:600;">Harap masukkan Nomor WhatsApp aktif Anda (minimal 9 digit).</span>';
          if (phoneInput) phoneInput.focus();
          return;
        }

        if (!rawKey) {
          msgBox.innerHTML = '<span style="color:#ef4444;font-weight:600;">Harap ketik kode kunci lisensi terlebih dahulu.</span>';
          keyInput.focus();
          return;
        }

        btnActivate.disabled = true;
        btnActivate.innerText = 'Memverifikasi...';
        msgBox.innerHTML = '<span style="color:#0284c7;font-weight:600;">Sedang memvalidasi lisensi & menyimpan nomor WhatsApp...</span>';

        try {
          const userAccount = JSON.parse(localStorage.getItem('dk_user_account_v1') || 'null') || {};
          const currentEmail = session.email || userAccount.email || '';
          const res = await LicenseService.activate(rawKey, currentEmail, rawPhone);
          if (res.success) {
            msgBox.innerHTML = `<span style="color:#10b981;font-weight:700;">${res.message}</span>`;
            toast.show(res.message, 'success');
            setTimeout(() => {
              modal.close();
              if (window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('license-updated', { detail: res.license }));
              }
            }, 1200);
          } else {
            msgBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">${res.message}</span>`;
            toast.show(res.message, 'error');
            btnActivate.disabled = false;
            btnActivate.innerText = 'Aktivasi';
          }
        } catch (err) {
          msgBox.innerHTML = `<span style="color:#ef4444;font-weight:600;">Gagal aktivasi: ${err.message || err}</span>`;
          btnActivate.disabled = false;
          btnActivate.innerText = 'Aktivasi';
        }
      };
    }

    if (btnDeactivate) {
      btnDeactivate.onclick = () => {
        if (confirm('Apakah Anda yakin ingin menghapus lisensi PRO dari perangkat ini?')) {
          LicenseService.deactivate();
          toast.show('Lisensi dinonaktifkan.', 'info');
          modal.close();
          if (window.dispatchEvent) {
            window.dispatchEvent(new CustomEvent('license-updated', { detail: null }));
          }
        }
      };
    }
  }, 100);
}

// Make accessible on window object
if (typeof window !== 'undefined') {
  window.openLicenseActivationModal = openLicenseActivationModal;
}
