/**
 * Header & Navbar Component
 */
import { appState } from '../state.js';
import { Icons } from './icons.js';
import { openTransactionModal } from './transactionModal.js';
import { openAiModal } from './aiModal.js';
import { openTelegramModal } from './telegramSimulator.js';
import { openReceiptScanModal } from './receiptScanModal.js';
import { modal } from './modal.js';
import { toast } from './toast.js';

export function renderNavbar() {
  const family = appState.family;
  const members = appState.members;
  const current = appState.currentUser;

  return `
    <header class="app-header">
      <div class="header-left">
        <div class="header-family-selector" id="family-profile-trigger" title="Klik untuk info keluarga">
          <span class="family-home-icon">${Icons.home(18)}</span>
          <span class="header-family-name">${family.name}</span>
          <span class="badge" style="background:#e0f2fe;color:#0369a1;font-size:0.6875rem;">IDR</span>
        </div>
      </div>

      <div class="header-right">
        <!-- PWA Install App Button -->
        <button class="btn btn-secondary btn-sm" id="btn-install-pwa" style="display:none;background:#ecfdf5;color:#059669;border-color:#a7f3d0;font-weight:700;" title="Install Aplikasi di Layar Utama">
          📲 <span class="hide-on-mobile">Install App</span>
        </button>

        <!-- Role Switcher Simulator for quick role & permission testing -->
        <div class="role-switcher-container" title="Simulasi Akses Peran Keluarga">
          <label class="role-switcher-label">
            ${Icons.users(14)}
            <span>Peran:</span>
          </label>
          <select id="user-role-switcher" class="role-select">
            ${members.map(m => `
              <option value="${m.id}" ${m.id === current.id ? 'selected' : ''}>
                ${m.name} (${m.roleLabel || m.role})
              </option>
            `).join('')}
          </select>
        </div>

        <button class="btn-header-add" id="header-btn-add-tx">
          ${Icons.plus(18)} <span class="hide-on-mobile">Catat Transaksi</span>
        </button>

        <div class="user-avatar" style="cursor:pointer;" id="user-avatar-trigger" title="${current.name} (${current.role})">
          ${current.avatarText || 'DK'}
        </div>
      </div>
    </header>
  `;
}

export function attachNavbarListeners() {
  const pwaBtn = document.getElementById('btn-install-pwa');
  if (pwaBtn) {
    pwaBtn.onclick = async () => {
      if (window.deferredInstallPrompt) {
        window.deferredInstallPrompt.prompt();
        const { outcome } = await window.deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          toast.success('Aplikasi Dompet Keluarga berhasil dipasang di layar utama!');
        }
        window.deferredInstallPrompt = null;
        pwaBtn.style.display = 'none';
      } else {
        toast.info('Untuk menginstall di HP: Buka menu browser (titik tiga atau tombol Share) lalu pilih "Tambahkan ke Layar Utama / Add to Home Screen"');
      }
    };
  }

  const addBtn = document.getElementById('header-btn-add-tx');
  if (addBtn) {
    addBtn.onclick = () => openTransactionModal();
  }

  const scanBtn = document.getElementById('header-btn-scan-receipt');
  if (scanBtn) {
    scanBtn.onclick = () => openReceiptScanModal();
  }

  const aiBtn = document.getElementById('header-btn-ai');
  if (aiBtn) {
    aiBtn.onclick = () => openAiModal();
  }

  const botBtn = document.getElementById('header-btn-bot');
  if (botBtn) {
    botBtn.onclick = () => openTelegramModal();
  }

  const roleSwitcher = document.getElementById('user-role-switcher');
  if (roleSwitcher) {
    roleSwitcher.onchange = (e) => {
      appState.setCurrentUser(e.target.value);
      const user = appState.members.find(m => m.id === e.target.value);
      toast.info(`Beralih ke akun: ${user ? user.name : ''} (${user ? user.roleLabel : ''})`);
    };
  }

  const famTrigger = document.getElementById('family-profile-trigger');
  if (famTrigger) {
    famTrigger.onclick = () => {
      modal.open({
        title: 'Info Ruang Keluarga',
        content: `
          <div style="display:flex;flex-direction:column;gap:1rem;">
            <div style="text-align:center;padding:1rem 0;">
              <div style="width:56px;height:56px;border-radius:var(--radius-full);background:var(--color-primary-100);color:var(--color-primary-700);display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem auto;">
                ${Icons.home(28)}
              </div>
              <h3 style="font-size:1.125rem;font-weight:800;color:var(--color-slate-900);">${appState.family.name}</h3>
              <p style="font-size:0.8125rem;color:var(--text-muted);margin-top:0.25rem;">Mata uang utama: Rupiah Indonesia (Rp)</p>
            </div>
            
            <div style="background:var(--color-slate-50);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1rem;">
              <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:0.375rem;">Kode Undangan Anggota</div>
              <div style="display:flex;align-items:center;justify-content:space-between;background:white;padding:0.5rem 0.75rem;border-radius:var(--radius-sm);border:1px solid var(--color-slate-200);">
                <code style="font-size:1rem;font-weight:800;color:var(--color-primary-700);letter-spacing:0.08em;">${appState.family.inviteCode}</code>
                <button class="btn btn-secondary btn-sm" id="btn-copy-invite-code">
                  ${Icons.copy(14)} Salin
                </button>
              </div>
              <p style="font-size:0.75rem;color:var(--text-muted);margin-top:0.5rem;">
                Bagikan kode ini atau tautan kepada anggota keluarga agar dapat bergabung ke ruang keluarga ini.
              </p>
            </div>
          </div>
        `,
        footerButtons: [
          {
            label: 'Tutup',
            className: 'btn-primary',
            onClick: () => modal.close()
          }
        ]
      });

      const copyBtn = document.getElementById('btn-copy-invite-code');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(appState.family.inviteCode);
          toast.success('Kode undangan disalin ke clipboard!');
        };
      }
    };
  }
}
