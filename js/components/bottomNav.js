/**
 * Mobile Bottom Navigation & Desktop Sidebar Component
 */
import { appState } from '../state.js';
import { Icons } from './icons.js';
import { openTransactionModal } from './transactionModal.js';
import { openAiModal } from './aiModal.js';
import { openReceiptScanModal } from './receiptScanModal.js';
import { openTelegramModal } from './telegramSimulator.js';
import { modal } from './modal.js';
import { toast } from './toast.js';
import { triggerPwaInstall, isAppInstalled } from './pwaInstall.js';

export function renderSidebar() {
  const current = appState.currentUser;
  const activeTab = appState.activeTab;

  return `
    <!-- Mobile Sidebar Backdrop Overlay -->
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

    <aside class="app-sidebar" id="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-wrapper">
          <div class="brand-icon">
            ${Icons.wallet(20)}
          </div>
          <div class="brand-text">
            <div class="brand-title">Dompetku</div>
            <div class="brand-subtitle">Keuangan Harmonis</div>
          </div>
        </div>
        <button class="sidebar-close-btn" id="sidebar-close-btn" title="Sembunyikan Sidebar">
          ${Icons.x ? Icons.x(16) : '✕'}
        </button>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
          ${Icons.pieChart(19)}
          <span>Dashboard</span>
        </a>
        <a class="nav-item ${activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">
          ${Icons.arrowRightLeft(19)}
          <span>Transaksi</span>
        </a>
        <a class="nav-item ${activeTab === 'budgets' ? 'active' : ''}" data-tab="budgets">
          ${Icons.target(19)}
          <span>Anggaran</span>
        </a>
        <a class="nav-item ${activeTab === 'goals' ? 'active' : ''}" data-tab="goals">
          ${Icons.sparkles(19)}
          <span>Celengan Impian</span>
        </a>
        <a class="nav-item ${activeTab === 'bills' ? 'active' : ''}" data-tab="bills">
          ${Icons.calendar(19)}
          <span>Tagihan Rutin</span>
        </a>
        <a class="nav-item ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
          ${Icons.trendingUp(19)}
          <span>Laporan</span>
        </a>
        <a class="nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
          ${Icons.settings(19)}
          <span>Pengaturan</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-badge">
          <div class="user-avatar">
            ${current.avatarText || 'DK'}
          </div>
          <div class="user-info">
            <div class="user-name">${current.name}</div>
            <div class="user-role-tag role-${current.role}">${current.role === 'owner' ? 'Pemilik' : current.role === 'admin' ? 'Admin' : 'Anggota'}</div>
          </div>
        </div>
        <button class="sidebar-logout-btn" id="sidebar-btn-logout" title="Keluar dari Akun">
          ${Icons.logOut ? Icons.logOut(15) : '🚪'}
          <span>Keluar (Logout)</span>
        </button>
      </div>
    </aside>
  `;
}

export function renderBottomNav() {
  const activeTab = appState.activeTab;
  const isMenuTabActive = ['goals', 'bills', 'reports', 'settings'].includes(activeTab);

  return `
    <nav class="mobile-bottom-nav">
      <a class="bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
        ${Icons.pieChart(20)}
        <span>Beranda</span>
      </a>
      <a class="bottom-nav-item ${activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">
        ${Icons.arrowRightLeft(20)}
        <span>Transaksi</span>
      </a>

      <!-- Center Floating Add Button -->
      <div class="mobile-add-btn-wrapper">
        <button class="mobile-fab-add" id="mobile-fab-add-tx" title="Catat Transaksi Cepat">
          ${Icons.plus(24)}
        </button>
      </div>

      <a class="bottom-nav-item ${activeTab === 'budgets' ? 'active' : ''}" data-tab="budgets">
        ${Icons.target(20)}
        <span>Anggaran</span>
      </a>
      <a class="bottom-nav-item ${isMenuTabActive ? 'active' : ''}" id="btn-mobile-more-menu">
        ${Icons.grid(20)}
        <span>Menu</span>
      </a>
    </nav>
  `;
}

export function openMobileMenuSheet(onTabChange) {
  const current = appState.currentUser || { name: 'Kepala Keluarga', role: 'owner' };
  const license = window.LicenseService?.getLicense?.();
  const isPro = license && license.status === 'active';
  const activeTab = appState.activeTab;

  const initials = (current.name || 'U').split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'DK';

  modal.open({
    title: 'Menu & Navigasi',
    maxWidth: '480px',
    content: `
      <div class="mobile-nav-sheet-wrapper">
        <!-- Profile Header Card -->
        <div class="mobile-nav-sheet-profile">
          <div class="mobile-sheet-avatar">
            ${initials}
          </div>
          <div class="mobile-sheet-user-info">
            <div class="mobile-sheet-user-name">${current.name || 'Pengguna Dompetku'}</div>
            <div class="mobile-sheet-user-sub">
              <span>${current.email || (appState.familySettings?.name ? 'Keluarga ' + appState.familySettings.name : 'Buku Kas Keluarga')}</span>
              <span class="mobile-sheet-badge-pro">${isPro ? '👑 PRO Lifetime' : '✨ Aktif'}</span>
            </div>
          </div>
          <button type="button" class="btn btn-secondary btn-icon btn-sm" id="sheet-btn-quick-settings" title="Pengaturan" style="width:34px;height:34px;border-radius:10px;flex-shrink:0;">
            ${Icons.settings(16)}
          </button>
        </div>

        <!-- Section 1: Fitur Unggulan (AI & OCR) -->
        <div>
          <div class="mobile-nav-sheet-section-title">Fitur Cerdas</div>
          <div class="mobile-sheet-features-grid">
            <div class="mobile-sheet-feature-card card-ai" id="sheet-btn-ai">
              <div class="mobile-sheet-feature-icon" style="background:#ede9fe;color:#7c3aed;">
                ${Icons.sparkles(20)}
              </div>
              <div class="mobile-sheet-feature-info">
                <div class="mobile-sheet-feature-title">Catat AI</div>
                <div class="mobile-sheet-feature-desc">Teks bebas / Voice</div>
              </div>
            </div>

            <div class="mobile-sheet-feature-card card-scan" id="sheet-btn-scan">
              <div class="mobile-sheet-feature-icon" style="background:#dbeafe;color:#2563eb;">
                ${Icons.camera(20)}
              </div>
              <div class="mobile-sheet-feature-info">
                <div class="mobile-sheet-feature-title">Scan Struk</div>
                <div class="mobile-sheet-feature-desc">Deteksi Foto OCR</div>
              </div>
            </div>
          </div>
        </div>

        ${!isAppInstalled() ? `
        <!-- Section PWA: Pasang Aplikasi di HP -->
        <div id="sheet-pwa-wrap">
          <div class="mobile-sheet-feature-card" id="sheet-btn-install-app" style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);border:1px solid #a7f3d0;cursor:pointer;padding:0.75rem 0.875rem;">
            <div class="mobile-sheet-feature-icon" style="background:#059669;color:#ffffff;box-shadow:0 3px 8px rgba(5,150,105,0.3);">
              📲
            </div>
            <div class="mobile-sheet-feature-info" style="min-width:0;flex:1;">
              <div class="mobile-sheet-feature-title" style="color:#065f46;display:flex;align-items:center;gap:0.4rem;">
                <span>Pasang Aplikasi di HP</span>
                <span class="badge" style="background:#059669;color:#fff;font-size:0.625rem;padding:0.15rem 0.35rem;border-radius:4px;">GRATIS</span>
              </div>
              <div class="mobile-sheet-feature-desc" style="color:#047857;">Akses instan dari layar utama & offline</div>
            </div>
          </div>
        </div>
        ` : ''}

        <!-- Section 2: Navigasi Menu Lengkap -->
        <div>
          <div class="mobile-nav-sheet-section-title">Navigasi Keuangan</div>
          <div class="mobile-nav-sheet-grid">
            <div class="mobile-nav-sheet-item ${activeTab === 'dashboard' ? 'is-active' : ''}" data-sheet-tab="dashboard">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);color:#059669;">
                ${Icons.pieChart(22)}
              </div>
              <div class="mobile-nav-sheet-label">Dashboard</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'transactions' ? 'is-active' : ''}" data-sheet-tab="transactions">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);color:#2563eb;">
                ${Icons.arrowRightLeft(22)}
              </div>
              <div class="mobile-nav-sheet-label">Transaksi</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'budgets' ? 'is-active' : ''}" data-sheet-tab="budgets">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);color:#d97706;">
                ${Icons.target(22)}
              </div>
              <div class="mobile-nav-sheet-label">Anggaran</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'goals' ? 'is-active' : ''}" data-sheet-tab="goals">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%);color:#7c3aed;">
                ${Icons.sparkles(22)}
              </div>
              <div class="mobile-nav-sheet-label">Celengan</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'bills' ? 'is-active' : ''}" data-sheet-tab="bills">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);color:#dc2626;">
                ${Icons.calendar(22)}
              </div>
              <div class="mobile-nav-sheet-label">Tagihan</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'reports' ? 'is-active' : ''}" data-sheet-tab="reports">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);color:#0284c7;">
                ${Icons.trendingUp(22)}
              </div>
              <div class="mobile-nav-sheet-label">Laporan</div>
            </div>

            <div class="mobile-nav-sheet-item ${activeTab === 'settings' ? 'is-active' : ''}" data-sheet-tab="settings">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);color:#475569;">
                ${Icons.settings(22)}
              </div>
              <div class="mobile-nav-sheet-label">Pengaturan</div>
            </div>

            <div class="mobile-nav-sheet-item" id="sheet-btn-sync">
              <div class="mobile-nav-sheet-icon" style="background:linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);color:#16a34a;">
                ${Icons.cloud ? Icons.cloud(22) : Icons.refresh(22)}
              </div>
              <div class="mobile-nav-sheet-label">Sinkron Cloud</div>
            </div>
          </div>
        </div>

        <!-- Section 3: Akun & Panduan -->
        <div style="padding-top:0.25rem;display:flex;flex-direction:column;gap:0.5rem;">
          <a href="./PANDUAN_PENGGUNA_DOMPET_KELUARGA.pdf" download="PANDUAN_PENGGUNA_DOMPET_KELUARGA.pdf" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:0.75rem 1rem;background:#fee2e2;border:1px solid #fca5a5;border-radius:12px;font-size:0.8125rem;font-weight:700;color:#991b1b;text-decoration:none;">
            <span>📕</span>
            <span>Download Buku Panduan Pengguna (PDF)</span>
          </a>
          <button type="button" class="mobile-sheet-logout-btn" id="sheet-btn-logout">
            ${Icons.logOut ? Icons.logOut(18) : '🚪'}
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </div>
    `,
    footerButtons: [
      {
        label: 'Tutup',
        className: 'btn-secondary',
        onClick: () => modal.close()
      }
    ]
  });

  document.querySelectorAll('[data-sheet-tab]').forEach(el => {
    el.onclick = () => {
      const tab = el.dataset.sheetTab;
      modal.close();
      if (tab && onTabChange) {
        onTabChange(tab);
      }
    };
  });

  const quickSettingsBtn = document.getElementById('sheet-btn-quick-settings');
  if (quickSettingsBtn) {
    quickSettingsBtn.onclick = () => {
      modal.close();
      if (onTabChange) onTabChange('settings');
    };
  }

  const aiBtn = document.getElementById('sheet-btn-ai');
  if (aiBtn) {
    aiBtn.onclick = () => {
      modal.close();
      openAiModal();
    };
  }

  const scanBtn = document.getElementById('sheet-btn-scan');
  if (scanBtn) {
    scanBtn.onclick = () => {
      modal.close();
      openReceiptScanModal();
    };
  }

  const pwaInstallBtn = document.getElementById('sheet-btn-install-app');
  if (pwaInstallBtn) {
    pwaInstallBtn.onclick = () => {
      modal.close();
      setTimeout(() => {
        triggerPwaInstall();
      }, 250);
    };
  }

  const syncBtn = document.getElementById('sheet-btn-sync');
  if (syncBtn) {
    syncBtn.onclick = async () => {
      modal.close();
      const navBtn = document.getElementById('btn-header-sync');
      if (navBtn) {
        navBtn.click();
      } else {
        toast.info('Menyinkronkan data...');
        try {
          const { CloudSyncService } = await import('../utils/cloudSync.js');
          const conf = CloudSyncService.getConfig();
          if (!conf.gasUrl) {
            toast.info('URL Google Apps Script belum diisi di Pengaturan');
            return;
          }
          await CloudSyncService.pullFullState(conf.gasUrl);
          toast.success('Data berhasil disinkronkan!');
          appState.notify();
        } catch (e) {
          toast.error('Sinkronisasi gagal: ' + e.message);
        }
      }
    };
  }

  const sheetLogoutBtn = document.getElementById('sheet-btn-logout');
  if (sheetLogoutBtn) {
    sheetLogoutBtn.onclick = () => {
      modal.close();
      triggerAppLogout();
    };
  }
}

function triggerAppLogout() {
  modal.confirm({
    title: 'Keluar dari Akun',
    message: 'Apakah Anda yakin ingin keluar dari akun saat ini? Data yang tersimpan di perangkat Anda tetap aman.',
    confirmText: 'Ya, Keluar',
    confirmType: 'btn-danger',
    onConfirm: () => {
      if (window.AuthAccess && typeof window.AuthAccess.logout === 'function') {
        window.AuthAccess.logout();
      } else {
        sessionStorage.removeItem('dk_google_session_v2');
        location.reload();
      }
    }
  });
}

export function attachNavListeners(onTabChange) {
  // Sidebar Logout Button
  const sidebarLogoutBtn = document.getElementById('sidebar-btn-logout');
  if (sidebarLogoutBtn) {
    sidebarLogoutBtn.onclick = () => {
      closeMobileSidebar();
      triggerAppLogout();
    };
  }

  // Navigation tabs
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      const tab = el.dataset.tab;
      closeMobileSidebar();
      if (tab) {
        onTabChange(tab);
      }
    };
  });

  // FAB button
  const fab = document.getElementById('mobile-fab-add-tx');
  if (fab) {
    fab.onclick = () => openTransactionModal();
  }

  // Mobile More Menu button
  const moreBtn = document.getElementById('btn-mobile-more-menu');
  if (moreBtn) {
    moreBtn.onclick = () => openMobileMenuSheet(onTabChange);
  }

  // Mobile Sidebar Backdrop & Close Button
  const backdrop = document.getElementById('sidebar-backdrop');
  if (backdrop) {
    backdrop.onclick = () => closeMobileSidebar();
  }

  const closeBtn = document.getElementById('sidebar-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      toggleSidebar(false);
    };
  }
}

export function toggleSidebar(forceOpen = null) {
  const shell = document.getElementById('app-shell');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const isMobile = window.innerWidth <= 1024;

  if (isMobile) {
    if (forceOpen === true || (forceOpen === null && !sidebar?.classList.contains('open'))) {
      if (sidebar) sidebar.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
    } else {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
    }
  } else {
    // Desktop Mode
    if (forceOpen === true) {
      if (shell) shell.classList.remove('sidebar-collapsed');
      localStorage.setItem('dk_sidebar_collapsed', 'false');
    } else if (forceOpen === false) {
      if (shell) shell.classList.add('sidebar-collapsed');
      localStorage.setItem('dk_sidebar_collapsed', 'true');
    } else {
      const isCollapsed = shell?.classList.toggle('sidebar-collapsed');
      localStorage.setItem('dk_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
  }
}

export function openMobileSidebar() {
  toggleSidebar(true);
}

export function closeMobileSidebar() {
  toggleSidebar(false);
}
