/**
 * Google Apps Script Cloud Sync Utility for Dompet Keluarga
 */
import { appState } from '../state.js';
import { ToastManager } from '../components/toast.js';

const CLOUD_CONFIG_KEY = 'dompet_keluarga_cloud_config';

export class CloudSyncService {
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
  }

  /**
   * Ping / Test Connection to Google Apps Script Web App
   */
  static async testConnection(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) {
      throw new Error('URL Web App Google Apps Script belum diisi');
    }

    const testEndpoint = `${targetUrl}?action=ping&_t=${Date.now()}`;
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
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Avoid complex preflight on GAS
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
   * Download / Pull full state from Google Sheets
   */
  static async pullFullState(url) {
    const targetUrl = url || this.getConfig().gasUrl;
    if (!targetUrl) throw new Error('URL Web App belum diisi');

    const endpoint = `${targetUrl}?action=getFullState&_t=${Date.now()}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.message || 'Gagal mengunduh data dari cloud');
    }

    const data = json.data;
    if (data.transactions && Array.isArray(data.transactions) && data.transactions.length > 0) {
      appState.transactions = data.transactions;
    }
    if (data.accounts && Array.isArray(data.accounts) && data.accounts.length > 0) {
      appState.accounts = data.accounts;
    }
    if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
      appState.categories = data.categories;
    }
    if (data.members && Array.isArray(data.members) && data.members.length > 0) {
      appState.members = data.members;
    }
    if (data.budgets && Array.isArray(data.budgets) && data.budgets.length > 0) {
      appState.budgets = data.budgets;
    }
    if (data.goals && Array.isArray(data.goals) && data.goals.length > 0) {
      appState.goals = data.goals;
    }
    if (data.recurringBills && Array.isArray(data.recurringBills) && data.recurringBills.length > 0) {
      appState.recurringBills = data.recurringBills;
    }

    appState.saveState();

    const config = this.getConfig();
    config.lastSynced = new Date().toISOString();
    config.status = 'connected';
    this.saveConfig(config);

    return json;
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
        }
      }).catch(err => {
        console.warn('⚠️ Auto-sync background notice:', err);
      });
    } catch (e) {}
  }
}
