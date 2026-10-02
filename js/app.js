/**
 * Main Application Orchestrator & Router
 */
import { appState } from './state.js';
import { renderNavbar, attachNavbarListeners } from './components/navbar.js';
import { renderSidebar, renderBottomNav, attachNavListeners } from './components/bottomNav.js';
import { renderDashboardPage, attachDashboardListeners } from './pages/dashboard.js';
import { renderTransactionsPage, attachTransactionsListeners } from './pages/transactions.js';
import { renderBudgetsPage, attachBudgetsListeners } from './pages/budgets.js';
import { renderGoalsPage, attachGoalsListeners } from './pages/goals.js';
import { renderBillsPage, attachBillsListeners } from './pages/bills.js';
import { renderReportsPage, attachReportsListeners } from './pages/reports.js';
import { renderSettingsPage, attachSettingsListeners } from './pages/settings.js';
import { CloudSyncService } from './utils/cloudSync.js';

class DompetKeluargaApp {
  constructor() {
    this.appShell = document.getElementById('app-shell');
    this.authenticatedInitialized = false;
    this.init();
  }

  init() {
    const session = window.AuthAccess?.getSession();
    if (window.AuthAccess && !session) {
      window.AuthAccess.render(this.appShell, authenticatedSession => this.startAuthenticatedApp(authenticatedSession));
      return;
    }
    this.startAuthenticatedApp(session);
  }

  startAuthenticatedApp(session) {
    if (session) {
      const member = appState.members.find(m => (m.email || '').toLowerCase() === session.email.toLowerCase());
      if (member && (member.id !== appState.currentUser.id || !appState.currentUser.roleLabel)) appState.setCurrentUser(member.id);
      if (!member) {
        appState.currentUser = { ...appState.currentUser, name: session.fullName, email: session.email, avatarText: session.fullName.split(' ').map(v => v[0]).join('').slice(0, 2).toUpperCase() };
      }
    }
    if (this.authenticatedInitialized) {
      this.render();
      return;
    }
    this.authenticatedInitialized = true;

    // Listen to auto-sync transactions
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('transaction:added', (e) => {
        if (e.detail) {
          CloudSyncService.syncTransactionAsync(e.detail);
        }
      });
    }

    // Subscribe to state changes for seamless UI updates
    appState.subscribe(() => {
      this.render();
    });

    // Initial render
    this.render();

    // Check Onboarding Wizard for new user (only on fresh first-time install)
    const onboardingDone = localStorage.getItem('dk_onboarding_completed');
    const hasCustomData = localStorage.getItem('dompet_keluarga_db_v1');

    if (!onboardingDone && !hasCustomData) {
      setTimeout(() => {
        if (typeof openOnboardingWizardModal === 'function') {
          openOnboardingWizardModal(false);
        }
      }, 400);
    } else if (!onboardingDone && hasCustomData) {
      // User already has existing configured state, mark completed silently
      localStorage.setItem('dk_onboarding_completed', 'true');
    }
  }

  navigate(tabName) {
    if (appState.activeTab !== tabName) {
      appState.activeTab = tabName;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  render() {
    if (!this.appShell) return;

    let pageContent = '';
    switch (appState.activeTab) {
      case 'dashboard':
        pageContent = renderDashboardPage();
        break;
      case 'transactions':
        pageContent = renderTransactionsPage();
        break;
      case 'budgets':
        pageContent = renderBudgetsPage();
        break;
      case 'goals':
        pageContent = renderGoalsPage();
        break;
      case 'bills':
        pageContent = renderBillsPage();
        break;
      case 'reports':
        pageContent = renderReportsPage();
        break;
      case 'settings':
        pageContent = renderSettingsPage();
        break;
      default:
        pageContent = renderDashboardPage();
    }

    this.appShell.innerHTML = `
      ${renderSidebar()}
      <div class="app-main">
        ${renderNavbar()}
        <main class="content-viewport">
          ${pageContent}
        </main>
      </div>
      ${renderBottomNav()}
    `;

    // Attach listeners for interactive elements
    attachNavbarListeners();
    attachNavListeners((tab) => this.navigate(tab));

    switch (appState.activeTab) {
      case 'dashboard':
        attachDashboardListeners((tab) => this.navigate(tab));
        break;
      case 'transactions':
        attachTransactionsListeners();
        break;
      case 'budgets':
        attachBudgetsListeners();
        break;
      case 'goals':
        attachGoalsListeners();
        break;
      case 'bills':
        attachBillsListeners();
        break;
      case 'reports':
        attachReportsListeners();
        break;
      case 'settings':
        attachSettingsListeners();
        break;
    }
  }
}

// Bootstrap on DOM Content Loaded or immediately if already loaded
function startApp() {
  try {
    window.app = new DompetKeluargaApp();
  } catch (err) {
    console.error('Error starting DompetKeluargaApp:', err);
    const shell = document.getElementById('app-shell');
    if (shell) {
      shell.innerHTML = `
        <div style="padding:2rem;text-align:center;font-family:sans-serif;color:#dc2626;">
          <h2>Terjadi Kendala Memuat Aplikasi</h2>
          <p style="color:#64748b;margin:1rem 0;">${err.message}</p>
          <button onclick="localStorage.clear();location.reload();" style="padding:0.75rem 1.5rem;background:#059669;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">
            Reset Data & Muat Ulang
          </button>
        </div>
      `;
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}

