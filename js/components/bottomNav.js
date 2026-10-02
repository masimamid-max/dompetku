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
  modal.open({
    title: 'Menu & Fitur Lengkap',
    content: `
      <div class="mobile-nav-sheet-grid">
        <div class="mobile-nav-sheet-item" data-sheet-tab="dashboard">
          <div class="mobile-nav-sheet-icon" style="background:#ecfdf5;color:#059669;">
            ${Icons.pieChart(24)}
          </div>
          <div class="mobile-nav-sheet-label">Dashboard</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="transactions">
          <div class="mobile-nav-sheet-icon" style="background:#eff6ff;color:#2563eb;">
            ${Icons.arrowRightLeft(24)}
          </div>
          <div class="mobile-nav-sheet-label">Transaksi</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="budgets">
          <div class="mobile-nav-sheet-icon" style="background:#fef3c7;color:#d97706;">
            ${Icons.target(24)}
          </div>
          <div class="mobile-nav-sheet-label">Anggaran</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="goals">
          <div class="mobile-nav-sheet-icon" style="background:#f5f3ff;color:#7c3aed;">
            ${Icons.sparkles(24)}
          </div>
          <div class="mobile-nav-sheet-label">Celengan</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="bills">
          <div class="mobile-nav-sheet-icon" style="background:#fee2e2;color:#dc2626;">
            ${Icons.calendar(24)}
          </div>
          <div class="mobile-nav-sheet-label">Tagihan</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="reports">
          <div class="mobile-nav-sheet-icon" style="background:#e0f2fe;color:#0284c7;">
            ${Icons.trendingUp(24)}
          </div>
          <div class="mobile-nav-sheet-label">Laporan</div>
        </div>

        <div class="mobile-nav-sheet-item" data-sheet-tab="settings">
          <div class="mobile-nav-sheet-icon" style="background:#f1f5f9;color:#475569;">
            ${Icons.settings(24)}
          </div>
          <div class="mobile-nav-sheet-label">Pengaturan</div>
        </div>

        <div class="mobile-nav-sheet-item" id="sheet-btn-ai">
          <div class="mobile-nav-sheet-icon" style="background:#ede9fe;color:#6d28d9;">
            ${Icons.sparkles(24)}
          </div>
          <div class="mobile-nav-sheet-label">Catat AI</div>
        </div>

        <div class="mobile-nav-sheet-item" id="sheet-btn-scan">
          <div class="mobile-nav-sheet-icon" style="background:#dbeafe;color:#1d4ed8;">
            ${Icons.camera(24)}
          </div>
          <div class="mobile-nav-sheet-label">Scan Struk</div>
        </div>

        <div class="mobile-nav-sheet-item" id="sheet-btn-logout" style="color:#dc2626;">
          <div class="mobile-nav-sheet-icon" style="background:#fee2e2;color:#dc2626;">
            ${Icons.logOut ? Icons.logOut(24) : '🚪'}
          </div>
          <div class="mobile-nav-sheet-label" style="color:#dc2626;font-weight:700;">Keluar</div>
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
