/**
 * Mobile Bottom Navigation & Desktop Sidebar Component
 */
import { appState } from '../state.js';
import { Icons } from './icons.js';
import { openTransactionModal } from './transactionModal.js';

export function renderSidebar() {
  const current = appState.currentUser;
  const activeTab = appState.activeTab;

  return `
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-icon">
          ${Icons.wallet(22)}
        </div>
        <div>
          <div class="brand-title">Dompet Keluarga</div>
          <div class="brand-subtitle">Keuangan Harmonis</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item ${activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">
          ${Icons.pieChart(20)}
          <span>Dashboard</span>
        </a>
        <a class="nav-item ${activeTab === 'transactions' ? 'active' : ''}" data-tab="transactions">
          ${Icons.arrowRightLeft(20)}
          <span>Transaksi</span>
        </a>
        <a class="nav-item ${activeTab === 'budgets' ? 'active' : ''}" data-tab="budgets">
          ${Icons.target(20)}
          <span>Anggaran</span>
        </a>
        <a class="nav-item ${activeTab === 'goals' ? 'active' : ''}" data-tab="goals">
          ${Icons.sparkles(20)}
          <span>Celengan Impian</span>
        </a>
        <a class="nav-item ${activeTab === 'bills' ? 'active' : ''}" data-tab="bills">
          ${Icons.calendar(20)}
          <span>Tagihan Rutin</span>
        </a>
        <a class="nav-item ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
          ${Icons.trendingUp(20)}
          <span>Laporan</span>
        </a>
        <a class="nav-item ${activeTab === 'settings' ? 'active' : ''}" data-tab="settings">
          ${Icons.settings(20)}
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
      </div>
    </aside>
  `;
}

export function renderBottomNav() {
  const activeTab = appState.activeTab;

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
          ${Icons.plus(26)}
        </button>
      </div>

      <a class="bottom-nav-item ${activeTab === 'budgets' ? 'active' : ''}" data-tab="budgets">
        ${Icons.target(20)}
        <span>Anggaran</span>
      </a>
      <a class="bottom-nav-item ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">
        ${Icons.trendingUp(20)}
        <span>Laporan</span>
      </a>
    </nav>
  `;
}

export function attachNavListeners(onTabChange) {
  document.querySelectorAll('[data-tab]').forEach(el => {
    el.onclick = (e) => {
      e.preventDefault();
      const tab = el.dataset.tab;
      if (tab) {
        onTabChange(tab);
      }
    };
  });

  const fab = document.getElementById('mobile-fab-add-tx');
  if (fab) {
    fab.onclick = () => openTransactionModal();
  }
}
