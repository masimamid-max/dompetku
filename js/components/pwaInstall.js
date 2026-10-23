/**
 * PWA Install & Add to Home Screen (A2HS) Management
 */
import { modal } from './modal.js';
import { toast } from './toast.js';
import { Icons } from './icons.js';

export function isAppInstalled() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
  );
}

export function getDeviceInfo() {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isChrome = /Chrome|CriOS/.test(ua) && !/Edge|Edg|OPR/.test(ua);
  const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS|OPR/.test(ua);
  return { isIOS, isAndroid, isChrome, isSafari };
}

export async function triggerPwaInstall() {
  if (isAppInstalled()) {
    toast.success('Aplikasi Dompet Keluarga sudah terpasang di perangkat Anda!');
    return;
  }

  // 1. If standard beforeinstallprompt was captured
  if (window.deferredInstallPrompt) {
    try {
      window.deferredInstallPrompt.prompt();
      const choice = await window.deferredInstallPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        toast.success('Selamat! Dompet Keluarga berhasil dipasang di layar utama.');
        window.deferredInstallPrompt = null;
        dismissPwaBanner();
        return;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  }

  // 2. Fallback to guided modal for iOS / Android / Chrome
  openPwaInstallModal();
}

export function openPwaInstallModal() {
  const { isIOS } = getDeviceInfo();

  let guideHTML = '';

  if (isIOS) {
    guideHTML = `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;display:flex;align-items:center;gap:0.875rem;">
          <img src="icons/icon-192.png" width="48" height="48" style="border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" alt="Dompetku">
          <div>
            <div style="font-weight:800;font-size:1rem;color:#065f46;">Dompet Keluarga (iOS Safari)</div>
            <div style="font-size:0.75rem;color:#047857;margin-top:0.25rem;">Pasang langsung tanpa perlu App Store</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.875rem;">
          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">1</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Buka di Safari & Ketuk Tombol Share</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Ketuk ikon <strong>Bagikan (Share)</strong> <span style="font-size:1rem;display:inline-block;vertical-align:middle;">⎋ / 📤</span> di bar bawah layar browser Safari.
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">2</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Pilih 'Tambahkan ke Layar Utama'</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Gulir ke bawah pada menu pop-up, lalu pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen ⊞)</strong>.
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">3</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Ketuk 'Tambah' (Add) di Kanan Atas</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Konfirmasi nama aplikasi, lalu ketuk tombol <strong>Tambah</strong>. Ikon Dompet Keluarga akan langsung muncul di beranda HP Anda!
              </div>
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary" id="btn-modal-close-ios" style="width:100%;font-weight:700;">
          Saya Mengerti 👍
        </button>
      </div>
    `;
  } else {
    // Android or Desktop
    guideHTML = `
      <div style="display:flex;flex-direction:column;gap:1.25rem;">
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:1rem;display:flex;align-items:center;gap:0.875rem;">
          <img src="icons/icon-192.png" width="48" height="48" style="border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.15);" alt="Dompetku">
          <div>
            <div style="font-weight:800;font-size:1rem;color:#065f46;">Dompet Keluarga (Android / Chrome)</div>
            <div style="font-size:0.75rem;color:#047857;margin-top:0.25rem;">Install instan hemat kuota & layar penuh</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.875rem;">
          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">1</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Buka Menu Titik Tiga (⋮) di Browser</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Ketuk ikon <strong>titik tiga (⋮)</strong> di sudut kanan atas browser Google Chrome / Edge / Samsung Internet.
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">2</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Pilih 'Install Aplikasi' / 'Tambahkan ke Layar Utama'</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Cari dan ketuk pilihan <strong>"Install Aplikasi"</strong> (atau <em>"Tambahkan ke Layar Utama" / "Add to Home Screen"</em>).
              </div>
            </div>
          </div>

          <div style="display:flex;align-items:flex-start;gap:0.75rem;background:#f8fafc;padding:0.875rem;border-radius:10px;border:1px solid #e2e8f0;">
            <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.875rem;flex-shrink:0;">3</div>
            <div>
              <div style="font-weight:700;font-size:0.875rem;color:#1e293b;">Ketuk 'Install' / 'Pasang'</div>
              <div style="font-size:0.775rem;color:#64748b;margin-top:0.25rem;line-height:1.4;">
                Selesai! Aplikasi akan terpasang di daftar aplikasi HP Anda dan bisa dibuka langsung tanpa mengetik URL lagi.
              </div>
            </div>
          </div>
        </div>

        <div style="display:flex;gap:0.75rem;">
          <button type="button" class="btn btn-secondary" id="btn-modal-close-android" style="flex:1;font-weight:700;">
            Tutup
          </button>
          <button type="button" class="btn btn-primary" id="btn-modal-retry-pwa" style="flex:1.5;font-weight:700;">
            📲 Coba Install Otomatis
          </button>
        </div>
      </div>
    `;
  }

  modal.open({
    title: '📲 Pasang Aplikasi di HP',
    maxWidth: '460px',
    content: guideHTML
  });

  const iosCloseBtn = document.getElementById('btn-modal-close-ios');
  if (iosCloseBtn) {
    iosCloseBtn.onclick = () => modal.close();
  }

  const androidCloseBtn = document.getElementById('btn-modal-close-android');
  if (androidCloseBtn) {
    androidCloseBtn.onclick = () => modal.close();
  }

  const retryBtn = document.getElementById('btn-modal-retry-pwa');
  if (retryBtn) {
    retryBtn.onclick = () => {
      if (window.deferredInstallPrompt) {
        modal.close();
        triggerPwaInstall();
      } else {
        toast.info('Gunakan menu titik tiga (⋮) pada browser Anda lalu pilih "Tambahkan ke Layar Utama"');
      }
    };
  }
}

export function renderPwaBannerHTML() {
  if (isAppInstalled()) return '';
  if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('dk_pwa_banner_closed') === '1') return '';

  return `
    <div id="pwa-install-banner" class="pwa-install-banner-wrap" style="background:linear-gradient(135deg, #065f46 0%, #047857 100%);color:#fff;border-radius:14px;padding:0.875rem 1.125rem;display:flex;align-items:center;justify-content:space-between;gap:0.75rem;box-shadow:0 6px 18px rgba(5,150,105,0.22);margin-bottom:1.25rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;min-width:0;">
        <img src="icons/icon-192.png" width="42" height="42" style="border-radius:10px;background:#fff;padding:2px;box-shadow:0 2px 6px rgba(0,0,0,0.2);flex-shrink:0;" alt="Icon">
        <div style="min-width:0;">
          <div style="font-weight:800;font-size:0.9375rem;line-height:1.2;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Pasang Aplikasi di HP 📲
          </div>
          <div style="font-size:0.75rem;color:#d1fae5;margin-top:0.2rem;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Buka instan dari layar utama & hemat kuota
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0;">
        <button type="button" id="btn-pwa-banner-install" class="btn btn-sm" style="background:#ffffff;color:#047857;font-weight:800;border:none;border-radius:8px;padding:0.4rem 0.85rem;font-size:0.8125rem;box-shadow:0 2px 6px rgba(0,0,0,0.15);cursor:pointer;">
          Install
        </button>
        <button type="button" id="btn-pwa-banner-close" style="background:transparent;border:none;color:#a7f3d0;font-size:1.125rem;cursor:pointer;padding:0.25rem 0.4rem;line-height:1;" title="Tutup">
          ✕
        </button>
      </div>
    </div>
  `;
}

export function initPwaBannerEvents() {
  const installBtn = document.getElementById('btn-pwa-banner-install');
  if (installBtn) {
    installBtn.onclick = () => triggerPwaInstall();
  }

  const closeBtn = document.getElementById('btn-pwa-banner-close');
  if (closeBtn) {
    closeBtn.onclick = () => dismissPwaBanner();
  }
}

export function dismissPwaBanner() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('dk_pwa_banner_closed', '1');
  }
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    banner.style.opacity = '0';
    banner.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      banner.remove();
    }, 260);
  }
}
