/**
 * Google Apps Script Cloud Sync Utility for Dompet Keluarga
 */
import { appState } from '../state.js';
import { ToastManager } from '../components/toast.js';

const CLOUD_CONFIG_KEY = 'dompet_keluarga_cloud_config';

export class CloudSyncService {
  static _pollerInterval = null;
  static _isSyncing = false;
  static _debounceTimer = null;

  static getConfig() {
    try {
      const saved = localStorage.getItem(CLOUD_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      gasUrl: '',
      autoSync: true,
      lastSynced: null,
      status: 'offline' // 'connected', 'offline', 'syncing', 'error'
    };
  }

  static saveConfig(config) {
    localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
    if (config && config.gasUrl) {
      this.syncGasUrlToAccount(config.gasUrl);
    }
  }

  /**
   * Menautkan URL Spreadsheet pribadi ke Akun Developer agar otomatis terpasang di HP/PC lain
   */
  static async syncGasUrlToAccount(gasUrl) {
    if (!gasUrl) return;
    try {
      const session = (window.AuthAccess && typeof window.AuthAccess.getSession === 'function') 
        ? window.AuthAccess.getSession() 
        : null;
      let userAccount = null;
      try { userAccount = JSON.parse(localStorage.getItem('dk_user_account_v1') || 'null'); } catch (_) {}
      let license = null;
      try { license = JSON.parse(localStorage.getItem('dk_app_license_v1') || 'null'); } catch (_) {}

      const email = session?.email || userAccount?.email || license?.email || '';
      const phone = session?.phone || userAccount?.phone || license?.phone || '';
      const licenseKey = license?.key || '';

      if (!email && !phone && !licenseKey) return;

      const apiUrl = (window.AuthAccess && typeof window.AuthAccess.getApiUrl === 'function')
        ? window.AuthAccess.getApiUrl()
        : 'https://script.google.com/macros/s/AKfycbwywRn2AgS94Qsh1VEFijrexDroXrb1zDhnvgQwqn6YsEcw24gNk89Yrts-DFSTb5p5HQ/exec';

      fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'save_gas_url',
          email,
          phone,
          licenseKey,
          gasUrl: gasUrl.trim()
        })
      }).then(r => r.json()).then(res => {
        if (res && res.success) {
          console.log('✅ URL Spreadsheet berhasil ditautkan ke akun cloud developer');
        }
      }).catch(err => console.warn('Sync gasUrl to account notice:', err));
    } catch (e) {}
  }

  /**
   * Mengambil URL Spreadsheet dari Akun Developer jika perangkat baru belum memilikinya
   */
  static async fetchRemoteGasUrl() {
    const config = this.getConfig();
    if (config.gasUrl) return config.gasUrl;

    try {
      const session = (window.AuthAccess && typeof window.AuthAccess.getSession === 'function') 
        ? window.AuthAccess.getSession() 
        : null;
      let userAccount = null;
      try { userAccount = JSON.parse(localStorage.getItem('dk_user_account_v1') || 'null'); } catch (_) {}
      let license = null;
      try { license = JSON.parse(localStorage.getItem('dk_app_license_v1') || 'null'); } catch (_) {}

      const email = session?.email || userAccount?.email || license?.email || '';
      const phone = session?.phone || userAccount?.phone || license?.phone || '';
      const licenseKey = license?.key || '';

      if (!email && !phone && !licenseKey) return null;

      const apiUrl = (window.AuthAccess && typeof window.AuthAccess.getApiUrl === 'function')
        ? window.AuthAccess.getApiUrl()
        : 'https://script.google.com/macros/s/AKfycbwywRn2AgS94Qsh1VEFijrexDroXrb1zDhnvgQwqn6YsEcw24gNk89Yrts-DFSTb5p5HQ/exec';

      const res = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'get_user_gas_url',
          email,
          phone,
          licenseKey
        })
      });

      const data = await res.json();
      if (data && data.success && data.gasUrl) {
        config.gasUrl = data.gasUrl;
        config.status = 'connected';
        localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
        console.log('✅ URL Spreadsheet berhasil dipulihkan dari akun cloud:', data.gasUrl);
        return data.gasUrl;
      }
    } catch (e) {
      console.warn('fetchRemoteGasUrl error:', e);
    }
    return null;
  }

  /**
   * Menghapus tautan URL Spreadsheet dari Akun Developer (Reset / Ganti Spreadsheet)
   */
  static async clearRemoteGasUrl() {
    try {
      const session = (window.AuthAccess && typeof window.AuthAccess.getSession === 'function') 
        ? window.AuthAccess.getSession() 
        : null;
      let userAccount = null;
      try { userAccount = JSON.parse(localStorage.getItem('dk_user_account_v1') || 'null'); } catch (_) {}
      let license = null;
      try { license = JSON.parse(localStorage.getItem('dk_app_license_v1') || 'null'); } catch (_) {}

      const email = session?.email || userAccount?.email || license?.email || '';
      const phone = session?.phone || userAccount?.phone || license?.phone || '';
      const licenseKey = license?.key || '';

      const apiUrl = (window.AuthAccess && typeof window.AuthAccess.getApiUrl === 'function')
        ? window.AuthAccess.getApiUrl()
        : 'https://script.google.com/macros/s/AKfycbwywRn2AgS94Qsh1VEFijrexDroXrb1zDhnvgQwqn6YsEcw24gNk89Yrts-DFSTb5p5HQ/exec';

      const res = await fetch(apiUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'delete_gas_url',
          email,
          phone,
          licenseKey,
          gasUrl: ''
        })
      });
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('clearRemoteGasUrl notice:', e);
      return { success: false, message: e.message };
    }
  }

  /**
   * Ping / Test Connection to Google Apps Script Web App
   */
  static async testConnection(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) {
      throw new Error('URL Web App Google Apps Script belum diisi');
    }

    const testEndpoint = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
    const response = await fetch(testEndpoint, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    if (json && json.success) {
      const current = this.getConfig();
      current.gasUrl = targetUrl;
      current.status = 'connected';
      this.saveConfig(current);
      return json;
    } else {
      throw new Error(json.message || 'Respon tidak valid dari Google Apps Script');
    }
  }

  /**
   * Initialize Database on Google Sheets (Creates all sheets and master headers)
   */
  static async initDatabaseOnSheets(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) throw new Error('URL Web App belum diisi');

    const payload = {
      action: 'initDatabase',
      defaultData: {
        family: appState.family,
        currentUser: appState.currentUser,
        members: appState.members,
        accounts: appState.accounts,
        categories: appState.categories,
        transactions: appState.transactions,
        budgets: appState.budgets,
        goals: appState.goals,
        recurringBills: appState.recurringBills
      }
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.message || 'Gagal inisialisasi sheet');

    const config = this.getConfig();
    config.gasUrl = targetUrl;
    config.lastSynced = new Date().toISOString();
    config.status = 'connected';
    this.saveConfig(config);

    return json;
  }

  /**
   * Upload / Push full state to Google Sheets
   */
  static async pushFullState(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) throw new Error('URL Web App belum diisi');

    const payload = {
      action: 'syncFullState',
      data: {
        family: appState.family,
        currentUser: appState.currentUser,
        members: appState.members,
        accounts: appState.accounts,
        categories: appState.categories,
        transactions: appState.transactions,
        budgets: appState.budgets,
        goals: appState.goals,
        recurringBills: appState.recurringBills
      }
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const json = await response.json();
    if (!json.success) throw new Error(json.message || 'Gagal sinkronisasi');

    const config = this.getConfig();
    config.lastSynced = new Date().toISOString();
    config.status = 'connected';
    this.saveConfig(config);

    return json;
  }

  /**
   * Debounced push for state mutations (e.g. edit / delete)
   */
  static pushFullStateDebounced(delay = 1500) {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      const config = this.getConfig();
      if (config.gasUrl && config.autoSync) {
        this.pushFullState(config.gasUrl).catch(e => console.warn('Debounced push notice:', e));
      }
    }, delay);
  }

  /**
   * Download / Pull full state from Google Sheets
   * Supports both POST (preferred, bypasses browser caching & uses existing doPost handler)
   * and GET fallback.
   */
  static async pullFullState(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) throw new Error('URL Web App belum diisi');

    let json = null;

    // 1. Coba POST terlebih dahulu
    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'getFullState' }),
        redirect: 'follow'
      });
      if (response.ok) {
        json = await response.json();
      }
    } catch (postErr) {
      console.warn('POST pullFullState failed, attempting GET fallback:', postErr);
    }

    // 2. Fallback GET jika POST gagal
    if (!json || !json.success) {
      try {
        const endpoint = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=getFullState&_t=${Date.now()}`;
        const response = await fetch(endpoint, {
          method: 'GET',
          mode: 'cors',
          redirect: 'follow'
        });
        if (response.ok) {
          json = await response.json();
        }
      } catch (getErr) {
        console.warn('GET pullFullState failed:', getErr);
      }
    }

    if (!json || !json.success || !json.data) {
      throw new Error((json && json.message) || 'Gagal mengunduh data dari Google Sheets');
    }

    const data = json.data;
    let hasChanges = false;

    // 1. Transactions
    if (data.transactions && Array.isArray(data.transactions)) {
      const parsedTransactions = data.transactions
        .filter(t => t && t.id && String(t.id).trim() !== '')
        .map(t => ({
          ...t,
          amount: typeof t.amount === 'number' ? t.amount : (parseFloat(String(t.amount).replace(/[^0-9.-]+/g, '')) || 0),
          status: t.status || 'verified',
          date: t.date ? String(t.date).slice(0, 10) : new Date().toISOString().slice(0, 10)
        }));

      // Sort descending (newest first)
      parsedTransactions.sort((a, b) => {
        const da = new Date(a.date || a.createdAt || 0).getTime();
        const db = new Date(b.date || b.createdAt || 0).getTime();
        return db - da;
      });

      const currentIds = (appState.transactions || []).map(t => `${t.id}-${t.amount}-${t.date}`).join('|');
      const newIds = parsedTransactions.map(t => `${t.id}-${t.amount}-${t.date}`).join('|');
      if (currentIds !== newIds) {
        appState.transactions = parsedTransactions;
        hasChanges = true;
      }
    }

    // 2. Accounts
    if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
      const parsedAccounts = data.accounts
        .filter(a => a && a.id)
        .map(a => ({
          ...a,
          initialBalance: typeof a.initialBalance === 'number' ? a.initialBalance : (parseFloat(String(a.initialBalance).replace(/[^0-9.-]+/g, '')) || 0),
          isArchived: String(a.isArchived) === 'true' || a.isArchived === true
        }));
      if (JSON.stringify(parsedAccounts) !== JSON.stringify(appState.accounts)) {
        appState.accounts = parsedAccounts;
        hasChanges = true;
      }
    }

    // 3. Categories
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      const parsedCategories = data.categories
        .filter(c => c && c.id)
        .map(c => ({
          ...c,
          isArchived: String(c.isArchived) === 'true' || c.isArchived === true
        }));
      if (JSON.stringify(parsedCategories) !== JSON.stringify(appState.categories)) {
        appState.categories = parsedCategories;
        hasChanges = true;
      }
    }

    // 4. Members
    if (data.members && Array.isArray(data.members) && data.members.length > 0) {
      const validMembers = data.members.filter(m => m && m.id);
      if (JSON.stringify(validMembers) !== JSON.stringify(appState.members)) {
        appState.members = validMembers;
        hasChanges = true;
      }
    }

    // 5. Budgets
    if (data.budgets && Array.isArray(data.budgets)) {
      const parsedBudgets = data.budgets
        .filter(b => b && b.id)
        .map(b => ({
          ...b,
          amount: typeof b.amount === 'number' ? b.amount : (parseFloat(String(b.amount).replace(/[^0-9.-]+/g, '')) || 0),
          month: Number(b.month) || 1,
          year: Number(b.year) || new Date().getFullYear()
        }));
      if (JSON.stringify(parsedBudgets) !== JSON.stringify(appState.budgets)) {
        appState.budgets = parsedBudgets;
        hasChanges = true;
      }
    }

    // 6. Goals
    if (data.goals && Array.isArray(data.goals)) {
      const parsedGoals = data.goals
        .filter(g => g && g.id)
        .map(g => ({
          ...g,
          targetAmount: typeof g.targetAmount === 'number' ? g.targetAmount : (parseFloat(String(g.targetAmount).replace(/[^0-9.-]+/g, '')) || 0),
          currentAmount: typeof g.currentAmount === 'number' ? g.currentAmount : (parseFloat(String(g.currentAmount).replace(/[^0-9.-]+/g, '')) || 0)
        }));
      if (JSON.stringify(parsedGoals) !== JSON.stringify(appState.goals)) {
        appState.goals = parsedGoals;
        hasChanges = true;
      }
    }

    // 7. Recurring Bills
    if (data.recurringBills && Array.isArray(data.recurringBills)) {
      const parsedBills = data.recurringBills
        .filter(r => r && r.id)
        .map(r => ({
          ...r,
          amount: typeof r.amount === 'number' ? r.amount : (parseFloat(String(r.amount).replace(/[^0-9.-]+/g, '')) || 0),
          dueDay: Number(r.dueDay) || 1,
          isPaidThisMonth: String(r.isPaidThisMonth) === 'true' || r.isPaidThisMonth === true
        }));
      if (JSON.stringify(parsedBills) !== JSON.stringify(appState.recurringBills)) {
        appState.recurringBills = parsedBills;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      appState.saveState();
    }

    const config = this.getConfig();
    config.lastSynced = new Date().toISOString();
    config.status = 'connected';
    this.saveConfig(config);

    return { success: true, hasChanges, data: json.data };
  }

  /**
   * Start intelligent auto-sync poller (background & on-focus)
   */
  static startAutoSyncPoller(intervalMs = 15000) {
    if (this._pollerInterval) {
      clearInterval(this._pollerInterval);
    }

    const runSync = async () => {
      const config = this.getConfig();
      if (!config.gasUrl || !config.autoSync || this._isSyncing) return;
      if (typeof document !== 'undefined' && document.hidden) return;

      this._isSyncing = true;
      this.updateSyncUI(true);

      try {
        await this.pullFullState(config.gasUrl);
      } catch (err) {
        console.warn('Auto-sync poller notice:', err);
      } finally {
        this._isSyncing = false;
        this.updateSyncUI(false);
      }
    };

    this._pollerInterval = setInterval(runSync, intervalMs);

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', runSync);
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          runSync();
        }
      });
    }
  }

  static updateSyncUI(isSyncing) {
    const icon = document.getElementById('nav-sync-icon');
    if (icon) {
      if (isSyncing) {
        icon.style.animation = 'spin 1s linear infinite';
      } else {
        icon.style.animation = '';
      }
    }
  }

  /**
   * Non-blocking auto-sync for a single added transaction
   */
  static async syncTransactionAsync(tx) {
    const config = this.getConfig();
    if (!config.gasUrl || !config.autoSync) return;

    try {
      fetch(config.gasUrl, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'addTransaction',
          transaction: tx
        }),
        redirect: 'follow'
      }).then(r => r.json()).then(res => {
        if (res.success) {
          console.log('✅ Auto-synced transaction to Google Sheets:', tx.id);
          const current = this.getConfig();
          current.lastSynced = new Date().toISOString();
          this.saveConfig(current);
        }
      }).catch(err => {
        console.warn('⚠️ Auto-sync background notice:', err);
      });
    } catch (e) {}
  }
}
