import { appState } from '../state.js';
import { Icons, getCategoryIcon } from '../components/icons.js';
import { formatRupiah, parseRupiah } from '../utils.js';
import { modal } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { CloudSyncService } from '../utils/cloudSync.js';
import { LicenseService } from '../utils/licenseService.js';
import { openLicenseActivationModal } from '../components/licenseModal.js';

let settingsSubTab = 'family'; // 'family' | 'accounts' | 'categories' | 'cloud' | 'license' | 'system'

export function renderSettingsPage() {
  const family = appState.family;
  const members = appState.members;
  const accounts = appState.getAccountsWithBalances();
  const categories = appState.categories;
  const current = appState.currentUser;
  const isOwner = appState.canManageFamily();
  const canManage = appState.canManageFinances();
  const isPro = LicenseService.isLicensed();

  return `
    <div class="settings-page">
      <!-- Header -->
      <div class="dashboard-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
        <div>
          <h1 style="font-size:1.5rem;font-weight:800;color:var(--color-slate-900);">Pengaturan</h1>
          <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.25rem;">
            Kelola ruang keluarga, hak akses anggota, akun rekening, lisensi developer, dan integrasi Google Sheets
          </p>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-settings-logout" style="color:#dc2626;border-color:#fecaca;background:#fff5f5;font-weight:700;display:flex;align-items:center;gap:0.375rem;" title="Keluar dari Akun">
          ${Icons.logOut ? Icons.logOut(16) : '🚪'} Keluar (Logout)
        </button>
      </div>

      <!-- Settings Sub-Tabs -->
      <div class="settings-tabs">
        <button class="settings-tab-btn ${settingsSubTab === 'family' ? 'active' : ''}" data-subtab="family">
          ${Icons.users(16)} Ruang Keluarga & Anggota
        </button>
        <button class="settings-tab-btn ${settingsSubTab === 'accounts' ? 'active' : ''}" data-subtab="accounts">
          ${Icons.creditCard(16)} Akun & Rekening (${accounts.length})
        </button>
        <button class="settings-tab-btn ${settingsSubTab === 'categories' ? 'active' : ''}" data-subtab="categories">
          ${Icons.tag(16)} Kategori & Subkategori (${categories.length})
        </button>
        <button class="settings-tab-btn ${settingsSubTab === 'cloud' ? 'active' : ''}" data-subtab="cloud">
          ☁️ Google Sheets Cloud DB
        </button>
        <button class="settings-tab-btn ${settingsSubTab === 'license' ? 'active' : ''}" data-subtab="license">
          ${isPro ? '✨ Lisensi PRO (Aktif)' : '🔒 Lisensi Developer & PRO'}
        </button>
        <button class="settings-tab-btn ${settingsSubTab === 'system' ? 'active' : ''}" data-subtab="system">
          ${Icons.refresh(16)} Data & Reset
        </button>
      </div>

      <!-- Tab Content Area -->
      ${settingsSubTab === 'family' ? renderFamilyTab(family, members, isOwner) : ''}
      ${settingsSubTab === 'accounts' ? renderAccountsTab(accounts, canManage) : ''}
      ${settingsSubTab === 'categories' ? renderCategoriesTab(categories, canManage) : ''}
      ${settingsSubTab === 'cloud' ? renderCloudTab() : ''}
      ${settingsSubTab === 'license' ? renderLicenseTab() : ''}
      ${settingsSubTab === 'system' ? renderSystemTab() : ''}
    </div>
  `;
}

function renderFamilyTab(family, members, isOwner) {
  const current = appState.currentUser;

  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Family Info Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">${Icons.home(18)} Informasi Ruang Keluarga</div>
          ${isOwner ? `
            <button class="btn btn-secondary btn-sm" id="btn-edit-family-name">
              ${Icons.edit(14)} Ubah Nama
            </button>
          ` : ''}
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:1rem;">
          <div style="background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-md);">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Nama Ruang Keluarga</div>
            <div style="font-size:1.125rem;font-weight:800;color:var(--color-slate-900);margin-top:0.25rem;">${family.name}</div>
          </div>

          <div style="background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-md);">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Mata Uang Utama</div>
            <div style="font-size:1.125rem;font-weight:800;color:var(--color-primary-700);margin-top:0.25rem;">IDR - Rupiah (Rp)</div>
          </div>

          <div style="background:var(--color-slate-50);padding:1rem;border-radius:var(--radius-md);">
            <div style="font-size:0.75rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Kode Undangan</div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:0.25rem;">
              <code style="font-size:1.125rem;font-weight:800;color:var(--color-primary-700);">${family.inviteCode}</code>
              <button class="btn btn-secondary btn-sm" id="btn-copy-code-settings">${Icons.copy(14)} Salin</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Members List Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.users(18)} Anggota Keluarga & Hak Akses (${members.length})</div>
            <div class="card-subtitle">Super Akses (Pemilik), Admin (Pengelola), dan Anggota Keluarga</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;">
            <button class="btn btn-secondary btn-sm" id="btn-login-modal-trigger">
              ${Icons.wallet(14)} Login Mandiri
            </button>
            ${isOwner ? `
              <button class="btn btn-primary btn-sm" id="btn-invite-member">
                ${Icons.plus(14)} Tambah Anggota
              </button>
            ` : ''}
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:0.75rem;">
          ${members.map(m => {
            const isSelf = current.id === m.id;
            const roleClass = m.role === 'owner' ? 'role-owner' : m.role === 'admin' ? 'role-admin' : 'role-member';

            return `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--color-slate-50);border-radius:var(--radius-md);border:1px solid var(--border-subtle);flex-wrap:wrap;gap:0.75rem;">
                <div style="display:flex;align-items:center;gap:0.875rem;">
                  <div class="user-avatar" style="width:42px;height:42px;font-size:0.9375rem;">${m.avatarText || 'AG'}</div>
                  <div>
                    <div style="font-size:0.9375rem;font-weight:700;color:var(--color-slate-900);display:flex;align-items:center;gap:0.5rem;">
                      ${m.name}
                      ${isSelf ? '<span class="badge" style="background:#dcfce7;color:#15803d;font-size:0.625rem;">(Sesi Anda)</span>' : ''}
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-muted);">
                      ${m.email} • Kata Sandi: <code>${m.password || '123'}</code> • Bergabung: ${m.joinedAt}
                    </div>
                  </div>
                </div>

                <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                  <span class="user-role-tag ${roleClass}">${m.roleLabel || m.role}</span>
                  
                  <!-- Switch user / login quickly -->
                  ${!isSelf ? `
                    <button class="btn btn-secondary btn-sm action-switch-to-member" data-id="${m.id}" data-name="${m.name}" title="Masuk / Gunakan Akun Ini">
                      Masuk
                    </button>
                  ` : ''}

                  <!-- Edit member -->
                  ${isOwner || isSelf ? `
                    <button class="btn btn-secondary btn-icon btn-sm action-edit-member-details" data-id="${m.id}" title="Edit Data Anggota">
                      ${Icons.edit(14)}
                    </button>
                  ` : ''}

                  <!-- Delete member (Only owner can delete, cannot delete sole owner) -->
                  ${isOwner && m.role !== 'owner' ? `
                    <button class="btn btn-secondary btn-icon btn-sm action-delete-member" data-id="${m.id}" data-name="${m.name}" title="Hapus Anggota" style="color:var(--color-expense);">
                      ${Icons.trash(14)}
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAccountsTab(accounts, canManage) {
  return `
    <div class="card">
      <div class="card-header">
        <div>
          <div class="card-title">${Icons.creditCard(18)} Daftar Akun & Rekening Keuangan</div>
          <div class="card-subtitle">Saldo berjalan dihitung otomatis dari saldo awal dan riwayat transaksi</div>
        </div>
        ${canManage ? `
          <button class="btn btn-primary btn-sm" id="btn-add-account">
            ${Icons.plus(14)} Tambah Akun
          </button>
        ` : ''}
      </div>

      <div class="settings-grid-list">
        ${accounts.map(acc => `
          <div class="setting-item-card" style="opacity:${acc.isArchived ? '0.6' : '1'};">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="width:38px;height:38px;border-radius:var(--radius-md);background:${acc.color}20;color:${acc.color};display:flex;align-items:center;justify-content:center;">
                ${getCategoryIcon(acc.icon || 'wallet', 20)}
              </div>
              <div>
                <div style="font-size:0.9375rem;font-weight:700;color:var(--color-slate-900);">
                  ${acc.name} ${acc.isArchived ? '<span style="font-size:0.6875rem;color:#ef4444;">(Diarsipkan)</span>' : ''}
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);">
                  Saldo Awal: ${formatRupiah(acc.initialBalance)} • <strong>Saldo: ${formatRupiah(acc.currentBalance)}</strong>
                </div>
              </div>
            </div>

            ${canManage ? `
              <div style="display:flex;gap:0.375rem;">
                <button class="btn btn-secondary btn-icon btn-sm action-edit-account" data-id="${acc.id}" title="Ubah Akun">
                  ${Icons.edit(14)}
                </button>
                <button class="btn btn-secondary btn-icon btn-sm action-archive-account" data-id="${acc.id}" title="${acc.isArchived ? 'Aktifkan Akun' : 'Arsipkan Akun'}">
                  ${acc.isArchived ? Icons.refresh(14) : Icons.x(14)}
                </button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderCategoriesTab(categories, canManage) {
  const expenseCats = categories.filter(c => c.type === 'expense');
  const incomeCats = categories.filter(c => c.type === 'income');

  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Expense Categories -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.trendingDown(18)} Kategori Pengeluaran (${expenseCats.length})</div>
            <div class="card-subtitle">Kategori untuk mencatat arus keluar belanja & tagihan</div>
          </div>
          ${canManage ? `
            <button class="btn btn-primary btn-sm action-add-category-btn" data-type="expense">
              ${Icons.plus(14)} Tambah Kategori
            </button>
          ` : ''}
        </div>

        <div class="settings-grid-list">
          ${expenseCats.map(cat => `
            <div class="setting-item-card" style="opacity:${cat.isArchived ? '0.6' : '1'};">
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="width:36px;height:36px;border-radius:var(--radius-md);background:${cat.color}20;color:${cat.color};display:flex;align-items:center;justify-content:center;">
                  ${getCategoryIcon(cat.icon, 18)}
                </div>
                <div>
                  <div style="font-size:0.875rem;font-weight:700;color:var(--color-slate-900);">
                    ${cat.name} ${cat.isArchived ? '<span style="font-size:0.6875rem;color:#ef4444;">(Arsip)</span>' : ''}
                  </div>
                  <div style="font-size:0.6875rem;color:var(--text-muted);">
                    ${(cat.subcategories || []).length} Subkategori
                  </div>
                </div>
              </div>

              ${canManage ? `
                <div style="display:flex;gap:0.25rem;">
                  <button class="btn btn-secondary btn-icon btn-sm action-edit-category" data-id="${cat.id}">
                    ${Icons.edit(14)}
                  </button>
                  <button class="btn btn-secondary btn-icon btn-sm action-delete-category" data-id="${cat.id}" style="color:var(--color-expense);">
                    ${Icons.trash(14)}
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Income Categories -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.trendingUp(18)} Kategori Pemasukan (${incomeCats.length})</div>
            <div class="card-subtitle">Kategori untuk mencatat sumber pemasukan keluarga</div>
          </div>
          ${canManage ? `
            <button class="btn btn-primary btn-sm action-add-category-btn" data-type="income">
              ${Icons.plus(14)} Tambah Kategori
            </button>
          ` : ''}
        </div>

        <div class="settings-grid-list">
          ${incomeCats.map(cat => `
            <div class="setting-item-card" style="opacity:${cat.isArchived ? '0.6' : '1'};">
              <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="width:36px;height:36px;border-radius:var(--radius-md);background:${cat.color}20;color:${cat.color};display:flex;align-items:center;justify-content:center;">
                  ${getCategoryIcon(cat.icon, 18)}
                </div>
                <div>
                  <div style="font-size:0.875rem;font-weight:700;color:var(--color-slate-900);">
                    ${cat.name} ${cat.isArchived ? '<span style="font-size:0.6875rem;color:#ef4444;">(Arsip)</span>' : ''}
                  </div>
                  <div style="font-size:0.6875rem;color:var(--text-muted);">
                    ${(cat.subcategories || []).length} Subkategori
                  </div>
                </div>
              </div>

              ${canManage ? `
                <div style="display:flex;gap:0.25rem;">
                  <button class="btn btn-secondary btn-icon btn-sm action-edit-category" data-id="${cat.id}">
                    ${Icons.edit(14)}
                  </button>
                  <button class="btn btn-secondary btn-icon btn-sm action-delete-category" data-id="${cat.id}" style="color:var(--color-expense);">
                    ${Icons.trash(14)}
                  </button>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCloudTab() {
  const config = CloudSyncService.getConfig();
  const isConnected = !!config.gasUrl && config.status === 'connected';

  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Cloud Status Banner -->
      <div class="card" style="border-left: 4px solid ${isConnected ? 'var(--color-primary-600)' : '#f59e0b'};">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
          <div style="display:flex;align-items:center;gap:1rem;">
            <div style="width:48px;height:48px;border-radius:var(--radius-md);background:${isConnected ? '#ecfdf5' : '#fffbeb'};color:${isConnected ? '#059669' : '#d97706'};display:flex;align-items:center;justify-content:center;font-size:24px;">
              ${isConnected ? '☁️' : '📡'}
            </div>
            <div>
              <div style="font-size:1.125rem;font-weight:800;color:var(--color-slate-900);">
                Status Cloud: ${isConnected ? '<span style="color:#059669;">Terhubung ke Google Sheets</span>' : '<span style="color:#d97706;">Belum Terhubung / Offline</span>'}
              </div>
              <div style="font-size:0.8125rem;color:var(--text-muted);margin-top:0.25rem;">
                ${config.lastSynced ? `Terakhir disinkronkan: <strong>${new Date(config.lastSynced).toLocaleString('id-ID')}</strong>` : 'Belum pernah melakukan sinkronisasi'}
              </div>
            </div>
          </div>

          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-secondary btn-sm" id="btn-cloud-guide-modal">
              📖 Panduan Setup GAS
            </button>
            <button class="btn btn-primary btn-sm" id="btn-test-cloud-ping">
              ⚡ Test Koneksi (Ping)
            </button>
          </div>
        </div>
      </div>

      <!-- Cloud Configuration Form -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">⚙️ Konfigurasi URL Google Apps Script</div>
            <div class="card-subtitle">Masukkan Web App URL yang didapatkan setelah mendeploy script di Google Sheets</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1.25rem;">
          <div class="form-group">
            <label class="form-label">Google Apps Script Web App URL *</label>
            <input type="url" id="input-gas-url" class="form-input" placeholder="https://script.google.com/macros/s/AKfycbx.../exec" value="${config.gasUrl || ''}" />
            <small style="color:var(--text-muted);font-size:0.75rem;margin-top:0.375rem;display:block;">
              Pastikan deployment diset ke: <strong>Execute as: Me</strong> dan <strong>Who has access: Anyone</strong>.
            </small>
          </div>

          <div style="display:flex;align-items:center;justify-content:space-between;padding:1rem;background:var(--color-slate-50);border-radius:var(--radius-md);">
            <div>
              <div style="font-size:0.875rem;font-weight:700;color:var(--color-slate-900);">Auto-Sync Realtime</div>
              <div style="font-size:0.75rem;color:var(--text-muted);">Otomatis kirim setiap transaksi baru & scan struk ke Google Sheets di latar belakang</div>
            </div>
            <label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;">
              <input type="checkbox" id="check-auto-sync" ${config.autoSync ? 'checked' : ''} style="opacity:0;width:0;height:0;" />
              <span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:${config.autoSync ? '#059669' : '#cbd5e1'};transition:.3s;border-radius:24px;"></span>
              <span style="position:absolute;height:18px;width:18px;left:${config.autoSync ? '23px' : '3px'};bottom:3px;background-color:white;transition:.3s;border-radius:50%;"></span>
            </label>
          </div>

          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
            <button class="btn btn-primary" id="btn-save-cloud-config">
              💾 Simpan URL Konfigurasi
            </button>
            <button class="btn btn-secondary" id="btn-init-sheets-db">
              ✨ Inisialisasi Otomatis Tabel Sheets
            </button>
          </div>
        </div>
      </div>

      <!-- Cloud Sync Actions -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🔄 Aksi Sinkronisasi Data</div>
            <div class="card-subtitle">Upload seluruh data lokal ke Google Sheets atau unduh data terbaru dari Sheets</div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:1rem;">
          <div style="border:1px solid var(--color-slate-200);border-radius:var(--radius-md);padding:1.25rem;background:#fafafa;">
            <div style="font-size:1rem;font-weight:700;color:var(--color-slate-900);margin-bottom:0.375rem;">
              ⬆️ Upload ke Google Sheets (Backup)
            </div>
            <p style="font-size:0.8125rem;color:var(--text-muted);line-height:1.5;margin-bottom:1rem;">
              Mengirim seluruh data saat ini (transaksi, rekening, anggota, anggaran, tabungan) ke Google Sheets Anda.
            </p>
            <button class="btn btn-primary btn-sm" id="btn-push-to-cloud" style="width:100%;">
              ⬆️ Upload Data Sekarang
            </button>
          </div>

          <div style="border:1px solid var(--color-slate-200);border-radius:var(--radius-md);padding:1.25rem;background:#fafafa;">
            <div style="font-size:1rem;font-weight:700;color:var(--color-slate-900);margin-bottom:0.375rem;">
              ⬇️ Download dari Google Sheets (Restore)
            </div>
            <p style="font-size:0.8125rem;color:var(--text-muted);line-height:1.5;margin-bottom:1rem;">
              Mengambil data terbaru yang tercatat di Google Sheets dan menyinkronkannya ke perangkat ini.
            </p>
            <button class="btn btn-secondary btn-sm" id="btn-pull-from-cloud" style="width:100%;">
              ⬇️ Download Data Terbaru
            </button>
          </div>
        </div>
      </div>

      <!-- Hosting Guide Quick Card -->
      <div class="card" style="background:linear-gradient(135deg, #0f172a, #1e293b);color:#fff;">
        <div style="font-size:1.125rem;font-weight:800;margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;">
          🌐 Gratis Hosting di GitHub Pages & Cloudflare Pages
        </div>
        <p style="font-size:0.875rem;color:#cbd5e1;line-height:1.6;margin-bottom:1.25rem;">
          Frontend aplikasi ini adalah <strong>Pure Static Web App</strong> yang 100% siap di-deploy secara gratis tanpa biaya langganan server di:
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:0.75rem;font-size:0.8125rem;">
          <div style="background:rgba(255,255,255,0.08);padding:0.75rem 1rem;border-radius:8px;">
            <strong>GitHub Pages:</strong> Otomatis deploy via workflow di <code>.github/workflows/deploy.yml</code>
          </div>
          <div style="background:rgba(255,255,255,0.08);padding:0.75rem 1rem;border-radius:8px;">
            <strong>Cloudflare Pages:</strong> Koneksikan repo GitHub Anda, pilih Build Output: <code>.</code> (Root)
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderLicenseTab() {
  const license = LicenseService.getLicense();
  const isPro = LicenseService.isLicensed();

  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Hero Status Card -->
      <div class="card" style="border-left: 5px solid ${isPro ? '#10b981' : '#f59e0b'}; background: ${isPro ? 'linear-gradient(to right, #ecfdf5, #ffffff)' : 'linear-gradient(to right, #fffbeb, #ffffff)'};">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:1rem;">
          <div style="display:flex;gap:1rem;align-items:center;">
            <div style="width:52px;height:52px;border-radius:14px;background:${isPro ? '#d1fae5' : '#fef3c7'};color:${isPro ? '#059669' : '#d97706'};display:flex;align-items:center;justify-content:center;font-size:1.5rem;flex-shrink:0;">
              ${isPro ? '👑' : '🔒'}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
                <h3 style="font-size:1.25rem;font-weight:800;color:var(--color-slate-900);margin:0;">
                  ${isPro ? 'Lisensi Dompetku PRO Aktif' : 'Status: Mode Uji Coba (Unlicensed)'}
                </h3>
                <span class="badge" style="background:${isPro ? '#059669' : '#d97706'};color:#ffffff;font-weight:700;padding:0.25rem 0.65rem;border-radius:999px;font-size:0.75rem;">
                  ${isPro ? 'PRO LIFETIME' : 'FITUR TERKUNCI'}
                </span>
              </div>
              <p style="font-size:0.875rem;color:var(--color-slate-600);margin:0.25rem 0 0;">
                ${isPro 
                  ? 'Semua fitur pencatatan transaksi, AI Assistant, OCR nota, dan sinkronisasi Google Sheets terbuka penuh.' 
                  : 'Pencatatan transaksi baru & asisten AI terkunci. Aktifkan lisensi resmi untuk membuka semua fitur selamanya.'}
              </p>
            </div>
          </div>

          <button class="btn btn-primary" id="btn-open-license-popup" style="background:${isPro ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)'};white-space:nowrap;font-weight:700;">
            ${isPro ? '✨ Kelola Lisensi' : '🚀 Aktifkan Lisensi Sekarang'}
          </button>
        </div>

        <!-- License Key Details -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:0.75rem;margin-top:1.25rem;padding-top:1rem;border-top:1px solid ${isPro ? '#a7f3d0' : '#fde68a'};">
          <div>
            <div style="font-size:0.725rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Paket Lisensi</div>
            <div style="font-size:0.95rem;font-weight:800;color:var(--color-slate-800);margin-top:0.2rem;">${license.plan || 'Dompetku Standard'}</div>
          </div>
          <div>
            <div style="font-size:0.725rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Kode Serial Lisensi</div>
            <div style="font-size:0.95rem;font-weight:800;color:var(--color-primary-700);font-family:monospace;margin-top:0.2rem;">
              ${license.key ? license.key : '<span style="color:#94a3b8;font-weight:500;">(Belum Diaktivasi)</span>'}
            </div>
          </div>
          <div>
            <div style="font-size:0.725rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">No. WhatsApp Terdaftar</div>
            <div style="font-size:0.95rem;font-weight:800;color:var(--color-slate-800);margin-top:0.2rem;">
              ${license.phone ? license.phone : '<span style="color:#94a3b8;font-weight:500;">-</span>'}
            </div>
          </div>
          <div>
            <div style="font-size:0.725rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;">Masa Berlaku</div>
            <div style="font-size:0.95rem;font-weight:800;color:var(--color-slate-800);margin-top:0.2rem;">${license.validUntil || (isPro ? 'Selamanya (Lifetime)' : 'Terbatas')}</div>
          </div>
        </div>
      </div>

      <!-- In-Page Activation Box -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">🔑 Masukkan / Ganti Kunci Lisensi</div>
            <div class="card-subtitle">Verifikasi instan online atau master key offline yang diberikan oleh developer</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem;max-width:560px;">
          <!-- Field Nomor WhatsApp Pelanggan -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="settings-license-phone-input">📱 Nomor WhatsApp Aktif (Wajib):</label>
            <input 
              type="tel" 
              id="settings-license-phone-input" 
              class="form-input" 
              placeholder="Contoh: 081234567890"
              value="${license.phone || ''}"
              style="font-size:0.95rem;font-weight:600;"
            />
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;">
              Nomor WhatsApp digunakan untuk pencatatan hak kepemilikan lisensi resmi & database pembaruan fitur.
            </div>
          </div>

          <!-- Field Kunci Lisensi -->
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label" for="settings-license-key-input">🔑 Kunci Serial Lisensi (Lisensi Developer):</label>
            <div style="display:flex;gap:0.5rem;">
              <input 
                type="text" 
                id="settings-license-key-input" 
                class="form-input" 
                placeholder="Contoh: DK-XXXX-YYYY-ZZZZ"
                value="${license.key || ''}"
                style="font-family:monospace;text-transform:uppercase;font-weight:700;font-size:0.95rem;"
              />
              <button class="btn btn-primary" id="btn-settings-activate-key" style="white-space:nowrap;font-weight:700;">
                Aktivasi Kunci
              </button>
            </div>
            <div id="settings-license-feedback" style="font-size:0.825rem;margin-top:0.4rem;"></div>
          </div>

          <div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:wrap;padding-top:0.5rem;">
            <a 
              href="${LicenseService.getBuyWhatsAppUrl('Menu Pengaturan Lisensi')}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn" 
              style="background:#25D366;color:#ffffff;text-decoration:none;font-weight:700;font-size:0.875rem;display:inline-flex;align-items:center;gap:0.5rem;padding:0.6rem 1rem;border-radius:8px;"
            >
              <span>${Icons.send ? Icons.send(16) : '💬'}</span>
              <span>Hubungi Developer via WhatsApp</span>
            </a>

            ${isPro ? `
              <button class="btn btn-secondary btn-sm" id="btn-settings-remove-license" style="color:#ef4444;border-color:#fecaca;">
                Hapus Lisensi di Perangkat Ini
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Feature Comparison & Benefits -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">📋 Matriks Fitur & Hak Akses</div>
            <div class="card-subtitle">Perbandingan fitur antara Mode Uji Coba dan Lisensi PRO Developer</div>
          </div>
        </div>

        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;font-size:0.875rem;">
            <thead>
              <tr style="border-bottom:2px solid #e2e8f0;text-align:left;color:var(--color-slate-600);">
                <th style="padding:0.75rem 1rem;">Fitur Dompetku</th>
                <th style="padding:0.75rem 1rem;text-align:center;width:140px;">Mode Uji Coba</th>
                <th style="padding:0.75rem 1rem;text-align:center;width:160px;color:#059669;font-weight:800;">PRO Developer</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:0.75rem 1rem;font-weight:600;">Lihat Dashboard & Ringkasan Keuangan</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;">✅ Terbuka</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Terbuka</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                <td style="padding:0.75rem 1rem;font-weight:600;">Pencatatan Transaksi Baru (Pemasukan/Pengeluaran/Transfer)</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#ef4444;font-weight:700;">🔒 Terkunci</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Unlimited</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:0.75rem 1rem;font-weight:600;">AI OCR Scan Struk & Nota Pembayaran</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#ef4444;font-weight:700;">🔒 Terkunci</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Aktif</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                <td style="padding:0.75rem 1rem;font-weight:600;">Asisten AI Natural Language Input</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#ef4444;font-weight:700;">🔒 Terkunci</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Aktif</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:0.75rem 1rem;font-weight:600;">Sinkronisasi Realtime Google Spreadsheet Cloud DB</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;">✅ Terbuka</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Terbuka</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;background:#f8fafc;">
                <td style="padding:0.75rem 1rem;font-weight:600;">Ekspor Laporan PDF, Excel & CSV</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;">✅ Terbuka</td>
                <td style="padding:0.75rem 1rem;text-align:center;color:#10b981;font-weight:700;">✅ Terbuka</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderSystemTab() {
  const txCount = appState.transactions ? appState.transactions.length : 0;
  const accCount = appState.accounts ? appState.accounts.length : 0;
  const memberCount = appState.members ? appState.members.length : 0;
  const budgetCount = appState.budgets ? appState.budgets.length : 0;
  const goalCount = appState.goals ? appState.goals.length : 0;
  const billCount = appState.recurringBills ? appState.recurringBills.length : 0;
  const familyName = appState.family?.name || 'Keluarga';

  return `
    <div style="display:flex;flex-direction:column;gap:1.5rem;">
      <!-- Ringkasan Status Database Lokal & Privasi -->
      <div class="card">
        <div class="card-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.75rem;">
          <div>
            <div class="card-title">${Icons.database ? Icons.database(18) : '💾'} Status Database & Privasi Mandiri</div>
            <div class="card-subtitle">Data tersimpan 100% di browser perangkat Anda dengan isolasi penuh (Zero-Knowledge)</div>
          </div>
          <span class="badge" style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;font-weight:700;padding:0.35rem 0.75rem;border-radius:999px;font-size:0.75rem;">
            🛡️ 100% Privasi Terisolasi
          </span>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:0.75rem;margin-top:0.75rem;">
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:0.875rem 1rem;text-align:center;">
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-slate-800);">${txCount}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-top:0.25rem;">Total Transaksi</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:0.875rem 1rem;text-align:center;">
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-slate-800);">${accCount}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-top:0.25rem;">Akun & Dompet</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:0.875rem 1rem;text-align:center;">
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-slate-800);">${memberCount}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-top:0.25rem;">Anggota</div>
          </div>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:0.875rem 1rem;text-align:center;">
            <div style="font-size:1.375rem;font-weight:800;color:var(--color-slate-800);">${budgetCount + goalCount + billCount}</div>
            <div style="font-size:0.75rem;color:var(--text-muted);font-weight:600;margin-top:0.25rem;">Target & Anggaran</div>
          </div>
        </div>
      </div>

      <!-- Kartu Panduan Setup Awal (Onboarding Wizard) -->
      <div class="card" style="border-left:4px solid #3b82f6;background:linear-gradient(to right, #eff6ff, #ffffff);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
          <div style="flex:1;min-width:240px;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">
              <span style="font-size:1.25rem;">🚀</span>
              <strong style="font-size:1rem;color:#1e40af;">Panduan Setup Awal (Onboarding Wizard)</strong>
            </div>
            <p style="font-size:0.8125rem;color:#1e3a8a;line-height:1.45;margin:0;">
              Jalankan kembali panduan interaktif untuk mengatur nama keluarga, nominal kas & rekening bank awal, serta memilih mode mulai dari awal.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-open-onboarding-wizard" style="background:#2563eb;border-color:#2563eb;white-space:nowrap;">
            🚀 Buka Panduan Setup Awal
          </button>
        </div>
      </div>

      <!-- Kartu Reset & Mode Database -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.refresh(18)} Reset & Mode Database</div>
            <div class="card-subtitle">Pilih mode data bersih untuk mulai mencatat keuangan asli, atau muat simulasi untuk belajar</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:0.5rem;">
          <!-- Opsi 1: Mulai dari Nol (Bersih / 0 Transaksi) -->
          <div style="background:#f0fdfa;border:1.5px solid #5eead4;border-radius:var(--radius-md);padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
              <div style="font-size:1rem;font-weight:800;color:#0f766e;">
                🟢 Mulai dari Nol (Data Bersih / 0 Transaksi)
              </div>
              <span class="badge" style="background:#ccfbf1;color:#0f766e;font-weight:700;padding:0.25rem 0.625rem;border-radius:6px;font-size:0.75rem;">
                Rekomendasi Pelanggan Asli
              </span>
            </div>
            <p style="font-size:0.8125rem;color:#115e59;line-height:1.5;margin-bottom:1rem;">
              Mengosongkan seluruh riwayat transaksi (0 transaksi), menyiapkan 2 akun kas & rekening utama dengan saldo awal Rp 0, serta membersihkan simulasi sehingga siap untuk mencatat keuangan nyata Anda.
            </p>
            <button class="btn btn-primary" id="btn-reset-clean-db" style="background:#0f766e;border-color:#0f766e;">
              ${Icons.plus(16)} Kosongkan & Mulai dari Nol (0 Transaksi)
            </button>
          </div>

          <!-- Opsi 2: Muat Data Demo (Keluarga Santoso) -->
          <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:var(--radius-md);padding:1.25rem;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:0.5rem;margin-bottom:0.5rem;">
              <div style="font-size:0.9375rem;font-weight:700;color:#92400e;">
                🔵 Muat Data Simulasi Demo (Keluarga Santoso)
              </div>
              <span class="badge" style="background:#fef3c7;color:#92400e;font-weight:700;padding:0.25rem 0.625rem;border-radius:6px;font-size:0.75rem;">
                Untuk Demonstrasi & Belajar
              </span>
            </div>
            <p style="font-size:0.8125rem;color:#b45309;line-height:1.5;margin-bottom:1rem;">
              Mengisi database dengan data contoh Keluarga Santoso (3 anggota, rekening bank, kategori, anggaran bulanan, dan 18+ transaksi contoh) untuk memudahkan pengujian dan mempelajari seluruh laporan.
            </p>
            <button class="btn btn-secondary" id="btn-reset-demo-db" style="color:#92400e;border-color:#fcd34d;">
              ${Icons.refresh(16)} Muat Data Demo
            </button>
          </div>
        </div>
      </div>

      <!-- Kartu Cadangan & Pemulihan (Backup & Restore Mandiri) -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${Icons.download ? Icons.download(18) : '📥'} Cadangan & Pemulihan Mandiri (Backup & Restore)</div>
            <div class="card-subtitle">Unduh atau pulihkan database Anda kapan saja dengan kendali dan kepemilikan 100% milik Anda</div>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:1rem;margin-top:0.5rem;">
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius-md);padding:1rem 1.25rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
            <div style="flex:1;min-width:240px;">
              <div style="font-size:0.9375rem;font-weight:700;color:#166534;margin-bottom:0.25rem;">
                💾 Unduh Cadangan Lengkap (.JSON)
              </div>
              <p style="font-size:0.8125rem;color:#15803d;line-height:1.4;margin:0;">
                Simpan seluruh data profil keluarga, akun, transaksi, kategori, anggaran, impian, dan tagihan dalam 1 file cadangan terstruktur.
              </p>
            </div>
            <button class="btn btn-primary" id="btn-backup-json" style="white-space:nowrap;">
              ${Icons.download ? Icons.download(16) : '📥'} Unduh File Backup
            </button>
          </div>

          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:var(--radius-md);padding:1rem 1.25rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
            <div style="flex:1;min-width:240px;">
              <div style="font-size:0.9375rem;font-weight:700;color:var(--color-slate-800);margin-bottom:0.25rem;">
                📊 Unduh Rekap Buku Kas (.CSV / Excel)
              </div>
              <p style="font-size:0.8125rem;color:var(--text-muted);line-height:1.4;margin:0;">
                Ekspor seluruh rincian transaksi buku kas ke format tabel spreadsheet CSV yang siap dibuka di Microsoft Excel / Google Sheets.
              </p>
            </div>
            <button class="btn btn-secondary" id="btn-backup-csv" style="white-space:nowrap;">
              ${Icons.fileText ? Icons.fileText(16) : '📊'} Unduh CSV
            </button>
          </div>

          <div style="background:#fdf4ff;border:1px solid #f0abfc;border-radius:var(--radius-md);padding:1rem 1.25rem;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:1rem;">
            <div style="flex:1;min-width:240px;">
              <div style="font-size:0.9375rem;font-weight:700;color:#86198f;margin-bottom:0.25rem;">
                🔄 Pulihkan Data dari Cadangan (.JSON)
              </div>
              <p style="font-size:0.8125rem;color:#a21caf;line-height:1.4;margin:0;">
                Unggah file JSON cadangan untuk memulihkan seluruh data dan catatan keuangan Anda secara instan di perangkat ini.
              </p>
            </div>
            <div>
              <input type="file" id="input-restore-file" accept=".json,application/json" style="display:none;" />
              <button class="btn btn-secondary" id="btn-trigger-restore" style="white-space:nowrap;color:#86198f;border-color:#d8b4fe;">
                ${Icons.upload ? Icons.upload(16) : '📂'} Pilih File Backup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachSettingsListeners() {
  // Logout Button in Settings Header
  const logoutBtn = document.getElementById('btn-settings-logout');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
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
    };
  }

  // Sub-tabs switcher
  document.querySelectorAll('[data-subtab]').forEach(btn => {
    btn.onclick = () => {
      settingsSubTab = btn.dataset.subtab;
      appState.notify();
    };
  });

  // Copy invite code in settings
  const copyCodeBtn = document.getElementById('btn-copy-code-settings');
  if (copyCodeBtn) {
    copyCodeBtn.onclick = () => {
      navigator.clipboard.writeText(appState.family.inviteCode);
      toast.success('Kode undangan disalin!');
    };
  }

  // Edit Family Name
  const editFamBtn = document.getElementById('btn-edit-family-name');
  if (editFamBtn) {
    editFamBtn.onclick = () => {
      modal.open({
        title: 'Ubah Nama Ruang Keluarga',
        content: `
          <div class="form-group">
            <label class="form-label">Nama Keluarga *</label>
            <input type="text" id="input-edit-fam-name" class="form-input" value="${appState.family.name}" required />
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('input-edit-fam-name')?.value;
              if (name && name.trim()) {
                appState.updateFamilyInfo(name);
                toast.success('Nama keluarga berhasil diubah!');
                modal.close();
              }
            }
          }
        ]
      });
    };
  }

  // Login Mandiri Modal Simulator
  const loginTriggerBtn = document.getElementById('btn-login-modal-trigger');
  if (loginTriggerBtn) {
    loginTriggerBtn.onclick = () => {
      modal.open({
        title: 'Login Mandiri Anggota Keluarga',
        content: `
          <div class="form-group">
            <label class="form-label">Pilih Akun / Email Anggota *</label>
            <select id="login-member-select" class="form-select">
              ${appState.members.map(m => `
                <option value="${m.email}">
                  ${m.name} (${m.roleLabel || m.role}) - ${m.email}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Kata Sandi (Default: <code>123</code>)</label>
            <input type="password" id="login-password-input" class="form-input" value="123" placeholder="Masukkan kata sandi" />
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Masuk Sekarang',
            className: 'btn-primary',
            onClick: () => {
              const email = document.getElementById('login-member-select')?.value;
              const pwd = document.getElementById('login-password-input')?.value;
              const res = appState.loginUser(email, pwd);
              if (res.success) {
                toast.success(res.message);
                modal.close();
              } else {
                toast.error(res.message);
              }
            }
          }
        ]
      });
    };
  }

  // Quick switch to member
  document.querySelectorAll('.action-switch-to-member').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      appState.setCurrentUser(id);
      const user = appState.members.find(m => m.id === id);
      toast.info(`Beralih ke akun ${user ? user.name : ''} (${user ? user.roleLabel : ''})`);
    };
  });

  // Invite / Add Member Modal
  const inviteBtn = document.getElementById('btn-invite-member');
  if (inviteBtn) {
    inviteBtn.onclick = () => {
      modal.open({
        title: 'Tambah & Undang Anggota Keluarga Baru',
        content: `
          <div class="form-group">
            <label class="form-label">Nama Lengkap *</label>
            <input type="text" id="new-member-name" class="form-input" placeholder="Contoh: Anisa Santoso" required />
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Email *</label>
            <input type="email" id="new-member-email" class="form-input" placeholder="anisa@email.com" required />
          </div>
          <div class="form-group">
            <label class="form-label">Kata Sandi Login Awal</label>
            <input type="text" id="new-member-password" class="form-input" value="123" placeholder="Contoh: 123" />
            <span class="form-hint">Digunakan anggota saat login mandiri ke aplikasi</span>
          </div>
          <div class="form-group">
            <label class="form-label">Level Hak Akses / Peran *</label>
            <select id="new-member-role" class="form-select">
              <option value="member">Anggota Keluarga (Mencatat transaksi & melihat dashboard)</option>
              <option value="admin">Admin / Pengelola (Mengelola transaksi, anggaran & kategori)</option>
              <option value="owner">Super Akses / Pemilik (Hak penuh atas seluruh keluarga)</option>
            </select>
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan & Tambahkan',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('new-member-name')?.value;
              const email = document.getElementById('new-member-email')?.value;
              const pwd = document.getElementById('new-member-password')?.value;
              const role = document.getElementById('new-member-role')?.value;
              if (!name || !name.trim()) {
                toast.error('Harap masukkan nama anggota.');
                return;
              }
              appState.addMember(name.trim(), email || '', role, pwd || '123');
              toast.success(`Anggota "${name}" berhasil ditambahkan!`);
              modal.close();
            }
          }
        ]
      });
    };
  }

  // Edit Member Details Modal
  document.querySelectorAll('.action-edit-member-details').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const member = appState.members.find(m => m.id === id);
      if (!member) return;

      const isOwner = appState.canManageFamily();

      modal.open({
        title: `Edit Anggota: ${member.name}`,
        content: `
          <div class="form-group">
            <label class="form-label">Nama Lengkap *</label>
            <input type="text" id="edit-member-name" class="form-input" value="${member.name}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Alamat Email *</label>
            <input type="email" id="edit-member-email" class="form-input" value="${member.email}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Kata Sandi Login</label>
            <input type="text" id="edit-member-password" class="form-input" value="${member.password || '123'}" />
          </div>
          ${isOwner ? `
            <div class="form-group">
              <label class="form-label">Level Hak Akses / Peran *</label>
              <select id="edit-member-role" class="form-select">
                <option value="member" ${member.role === 'member' ? 'selected' : ''}>Anggota Keluarga</option>
                <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin / Pengelola</option>
                <option value="owner" ${member.role === 'owner' ? 'selected' : ''}>Super Akses / Pemilik</option>
              </select>
            </div>
          ` : ''}
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan Perubahan',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('edit-member-name')?.value;
              const email = document.getElementById('edit-member-email')?.value;
              const password = document.getElementById('edit-member-password')?.value;
              const roleSelect = document.getElementById('edit-member-role');
              const role = roleSelect ? roleSelect.value : member.role;

              if (!name || !name.trim()) {
                toast.error('Nama anggota wajib diisi.');
                return;
              }

              appState.updateMember(id, { name, email, password, role });
              toast.success(`Data anggota "${name}" berhasil diperbarui!`);
              modal.close();
            }
          }
        ]
      });
    };
  });

  // Delete Member with Confirmation Modal
  document.querySelectorAll('.action-delete-member').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      modal.confirm({
        title: 'Hapus Anggota Keluarga',
        message: `Apakah Anda yakin ingin menghapus <strong>"${name}"</strong> dari ruang keluarga? Hak akses anggota ini akan dicabut.`,
        confirmText: 'Ya, Hapus Anggota',
        confirmType: 'btn-danger',
        onConfirm: () => {
          const res = appState.deleteMember(id);
          if (res.success) {
            toast.success(res.message);
          } else {
            toast.error(res.message);
          }
        }
      });
    };
  });

  // Add Account Modal
  const addAccBtn = document.getElementById('btn-add-account');
  if (addAccBtn) {
    addAccBtn.onclick = () => {
      modal.open({
        title: 'Tambah Rekening / Dompet Baru',
        content: `
          <div class="form-group">
            <label class="form-label">Nama Akun / Bank *</label>
            <input type="text" id="acc-name-input" class="form-input" placeholder="Contoh: Bank Jago Tabungan" required />
          </div>
          <div class="form-group">
            <label class="form-label">Jenis Akun *</label>
            <select id="acc-type-select" class="form-select">
              <option value="bank">Rekening Bank</option>
              <option value="cash">Uang Tunai</option>
              <option value="ewallet">Dompet Digital (E-Wallet)</option>
              <option value="savings">Tabungan Khusus</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Saldo Awal (IDR) *</label>
            <div class="currency-input-wrapper">
              <span class="currency-prefix">Rp</span>
              <input type="text" id="acc-init-balance" class="form-input currency-input" placeholder="0" />
            </div>
            <span class="form-hint">Saldo berjalan selanjutnya dihitung otomatis dari transaksi</span>
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Tambah Akun',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('acc-name-input')?.value;
              const type = document.getElementById('acc-type-select')?.value;
              const initBalance = parseRupiah(document.getElementById('acc-init-balance')?.value);
              if (!name || !name.trim()) {
                toast.error('Nama akun wajib diisi.');
                return;
              }
              const typeLabels = { bank: 'Bank', cash: 'Tunai', ewallet: 'E-Wallet', savings: 'Tabungan' };
              const colors = { bank: '#3b82f6', cash: '#10b981', ewallet: '#06b6d4', savings: '#6366f1' };

              appState.addAccount({
                name: name.trim(),
                type,
                typeLabel: typeLabels[type] || 'Akun',
                initialBalance: initBalance,
                color: colors[type] || '#3b82f6',
                icon: type === 'cash' ? 'wallet' : 'creditCard'
              });

              toast.success(`Akun "${name}" berhasil ditambahkan!`);
              modal.close();
            }
          }
        ]
      });

      const initBalInput = document.getElementById('acc-init-balance');
      if (initBalInput) {
        initBalInput.oninput = (e) => {
          const val = parseRupiah(e.target.value);
          e.target.value = val > 0 ? val.toLocaleString('id-ID') : '';
        };
      }
    };
  }

  // Toggle Archive Account
  document.querySelectorAll('.action-archive-account').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      appState.toggleArchiveAccount(id);
      toast.info('Status arsip akun telah diperbarui.');
    };
  });

  // Add Category Modal
  document.querySelectorAll('.action-add-category-btn').forEach(btn => {
    btn.onclick = () => {
      const catType = btn.dataset.type || 'expense';
      modal.open({
        title: `Tambah Kategori ${catType === 'income' ? 'Pemasukan' : 'Pengeluaran'}`,
        content: `
          <div class="form-group">
            <label class="form-label">Nama Kategori *</label>
            <input type="text" id="cat-name-input" class="form-input" placeholder="Contoh: Donasi & Kebaikan" required />
          </div>
          <div class="form-group">
            <label class="form-label">Subkategori (Pisahkan dengan koma)</label>
            <input type="text" id="cat-subcats-input" class="form-input" placeholder="Contoh: Panti Asuhan, Korban Bencana, Beasiswa" />
          </div>
          <div class="form-group">
            <label class="form-label">Warna Kategori</label>
            <input type="color" id="cat-color-input" class="form-input" value="${catType === 'income' ? '#059669' : '#e11d48'}" style="height:44px;padding:4px;" />
          </div>
        `,
        footerButtons: [
          { label: 'Batal', className: 'btn-secondary', onClick: () => modal.close() },
          {
            label: 'Simpan Kategori',
            className: 'btn-primary',
            onClick: () => {
              const name = document.getElementById('cat-name-input')?.value;
              const subcatsRaw = document.getElementById('cat-subcats-input')?.value || '';
              const color = document.getElementById('cat-color-input')?.value || '#6366f1';
              if (!name || !name.trim()) {
                toast.error('Nama kategori wajib diisi.');
                return;
              }

              const subcategories = subcatsRaw.split(',').map(s => s.trim()).filter(Boolean);
              appState.addCategory({
                name: name.trim(),
                type: catType,
                color,
                subcategories,
                icon: 'tag'
              });

              toast.success(`Kategori "${name}" berhasil ditambahkan!`);
              modal.close();
            }
          }
        ]
      });
    };
  });

  // Delete / Archive Category with safety protection
  document.querySelectorAll('.action-delete-category').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.id;
      const cat = appState.getCategoryById(id);
      if (!cat) return;

      modal.confirm({
        title: 'Hapus / Arsipkan Kategori',
        message: `Apakah Anda yakin ingin menghapus kategori <strong>"${cat.name}"</strong>? Jika kategori ini sudah memiliki riwayat transaksi, sistem akan mengarsipkannya agar laporan keuangan tetap akurat.`,
        confirmText: 'Ya, Lanjutkan',
        confirmType: 'btn-danger',
        onConfirm: () => {
          const res = appState.deleteOrArchiveCategory(id);
          toast.info(res.message);
        }
      });
    };
  });

  // Buka Panduan Setup Awal (Onboarding Wizard)
  const openWizardBtn = document.getElementById('btn-open-onboarding-wizard');
  if (openWizardBtn) {
    openWizardBtn.onclick = () => {
      if (typeof openOnboardingWizardModal === 'function') {
        openOnboardingWizardModal(true);
      }
    };
  }

  // Reset ke Data Bersih (0 Transaksi)
  const resetCleanBtn = document.getElementById('btn-reset-clean-db');
  if (resetCleanBtn) {
    resetCleanBtn.onclick = () => {
      modal.confirm({
        title: 'Mulai dari Nol (Data Bersih)',
        message: 'Tindakan ini akan mengosongkan seluruh riwayat transaksi (0 transaksi) dan menyiapkan akun kas & bank utama dengan saldo Rp 0 agar Anda dapat mulai mencatat data asli keluarga Anda. Lanjutkan?',
        confirmText: 'Ya, Kosongkan Data',
        confirmType: 'btn-primary',
        onConfirm: () => {
          appState.resetToCleanData();
          toast.success('Database berhasil dikosongkan (0 transaksi). Selamat mencatat!');
          appState.notify();
        }
      });
    };
  }

  // Reset ke Data Demo
  const resetDemoBtn = document.getElementById('btn-reset-demo-db');
  if (resetDemoBtn) {
    resetDemoBtn.onclick = () => {
      modal.confirm({
        title: 'Muat Data Simulasi Demo',
        message: 'Apakah Anda ingin memuat data contoh (Keluarga Santoso beserta 18+ transaksi simulasi)? Data saat ini akan digantikan dengan data simulasi.',
        confirmText: 'Ya, Muat Data Demo',
        confirmType: 'btn-danger',
        onConfirm: () => {
          appState.resetToInitialData();
          toast.success('Data simulasi Keluarga Santoso berhasil dimuat!');
          appState.notify();
        }
      });
    };
  }

  // Unduh Cadangan JSON
  const backupJsonBtn = document.getElementById('btn-backup-json');
  if (backupJsonBtn) {
    backupJsonBtn.onclick = () => {
      const ok = appState.exportFullBackupJSON();
      if (ok) {
        toast.success('File cadangan JSON berhasil diunduh ke perangkat Anda!');
      } else {
        toast.error('Gagal membuat file cadangan.');
      }
    };
  }

  // Unduh Rekap CSV
  const backupCsvBtn = document.getElementById('btn-backup-csv');
  if (backupCsvBtn) {
    backupCsvBtn.onclick = () => {
      const ok = appState.exportAllTransactionsCSV();
      if (ok) {
        toast.success('File rekap transaksi CSV berhasil diunduh!');
      } else {
        toast.error('Gagal mengekspor data transaksi.');
      }
    };
  }

  // Trigger File Picker untuk Restore JSON
  const triggerRestoreBtn = document.getElementById('btn-trigger-restore');
  const restoreFileInput = document.getElementById('input-restore-file');
  if (triggerRestoreBtn && restoreFileInput) {
    triggerRestoreBtn.onclick = () => {
      restoreFileInput.click();
    };

    restoreFileInput.onchange = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target.result;
          const res = appState.importFullBackupJSON(content);
          if (res.success) {
            toast.success(res.message);
            appState.notify();
          } else {
            toast.error(res.message);
          }
        } catch (err) {
          toast.error('Format file tidak valid atau rusak: ' + err.message);
        } finally {
          restoreFileInput.value = '';
        }
      };
      reader.readAsText(file);
    };
  }

  // --- CLOUD SYNC LISTENERS ---
  const saveCloudConfigBtn = document.getElementById('btn-save-cloud-config');
  if (saveCloudConfigBtn) {
    saveCloudConfigBtn.onclick = () => {
      const url = document.getElementById('input-gas-url')?.value.trim();
      const autoSync = document.getElementById('check-auto-sync')?.checked ?? true;
      const config = CloudSyncService.getConfig();
      config.gasUrl = url;
      config.autoSync = autoSync;
      CloudSyncService.saveConfig(config);
      toast.success('Konfigurasi URL Google Apps Script disimpan!');
    };
  }

  const testPingBtn = document.getElementById('btn-test-cloud-ping');
  if (testPingBtn) {
    testPingBtn.onclick = async () => {
      const url = document.getElementById('input-gas-url')?.value.trim() || CloudSyncService.getConfig().gasUrl;
      if (!url) {
        toast.error('Masukkan URL Google Apps Script terlebih dahulu');
        return;
      }

      toast.info('Menghubungi Google Apps Script...');
      try {
        const res = await CloudSyncService.testConnection(url);
        toast.success(`Berhasil terhubung! (${res.message || 'Online'})`);
        appState.notify();
      } catch (err) {
        toast.error(`Koneksi Gagal: ${err.message}`);
      }
    };
  }

  const initSheetsBtn = document.getElementById('btn-init-sheets-db');
  if (initSheetsBtn) {
    initSheetsBtn.onclick = async () => {
      const url = document.getElementById('input-gas-url')?.value.trim() || CloudSyncService.getConfig().gasUrl;
      if (!url) {
        toast.error('Masukkan URL Google Apps Script terlebih dahulu');
        return;
      }

      toast.info('Menginisialisasi seluruh tabel di Google Sheets...');
      try {
        const res = await CloudSyncService.initDatabaseOnSheets(url);
        toast.success(res.message || 'Tabel Google Sheets berhasil dibuat!');
        appState.notify();
      } catch (err) {
        toast.error(`Inisialisasi Gagal: ${err.message}`);
      }
    };
  }

  const pushCloudBtn = document.getElementById('btn-push-to-cloud');
  if (pushCloudBtn) {
    pushCloudBtn.onclick = async () => {
      const url = document.getElementById('input-gas-url')?.value.trim() || CloudSyncService.getConfig().gasUrl;
      if (!url) {
        toast.error('Masukkan URL Google Apps Script terlebih dahulu');
        return;
      }

      toast.info('Mengunggah data ke Google Sheets...');
      try {
        const res = await CloudSyncService.pushFullState(url);
        toast.success(res.message || 'Data berhasil diunggah ke Google Sheets!');
        appState.notify();
      } catch (err) {
        toast.error(`Upload Gagal: ${err.message}`);
      }
    };
  }

  const pullCloudBtn = document.getElementById('btn-pull-from-cloud');
  if (pullCloudBtn) {
    pullCloudBtn.onclick = async () => {
      const url = document.getElementById('input-gas-url')?.value.trim() || CloudSyncService.getConfig().gasUrl;
      if (!url) {
        toast.error('Masukkan URL Google Apps Script terlebih dahulu');
        return;
      }

      modal.confirm({
        title: 'Unduh Data dari Google Sheets',
        message: 'Mengunduh data akan memperbarui data lokal di perangkat ini dengan data terbaru dari Google Sheets. Lanjutkan?',
        confirmText: 'Ya, Unduh Data',
        confirmType: 'btn-primary',
        onConfirm: async () => {
          toast.info('Mengunduh data dari Google Sheets...');
          try {
            await CloudSyncService.pullFullState(url);
            toast.success('Data lokal berhasil disinkronkan dari Google Sheets!');
            appState.notify();
          } catch (err) {
            toast.error(`Gagal Mengunduh: ${err.message}`);
          }
        }
      });
    };
  }

  const guideModalBtn = document.getElementById('btn-cloud-guide-modal');
  if (guideModalBtn) {
    guideModalBtn.onclick = () => {
      modal.open({
        title: '📖 Panduan Setup Backend Google Apps Script',
        content: `
          <div style="font-size:0.875rem;line-height:1.6;color:var(--color-slate-700);">
            <p style="margin-bottom:0.75rem;">Ikuti 4 langkah mudah berikut untuk mengaktifkan database gratis di Google Sheets Anda:</p>
            
            <ol style="padding-left:1.25rem;display:flex;flex-direction:column;gap:0.5rem;margin-bottom:1rem;">
              <li>Buka <a href="https://sheets.new" target="_blank" style="color:var(--color-primary-600);font-weight:700;">Google Sheets Baru (sheets.new)</a></li>
              <li>Klik menu <strong>Extensions</strong> > <strong>Apps Script</strong>.</li>
              <li>Salin kode dari file <code>backend/Code.gs</code> dan paste ke editor Apps Script.</li>
              <li>Klik tombol biru <strong>Deploy</strong> > <strong>New deployment</strong> > Pilih tipe <strong>Web app</strong>:
                <ul style="margin-top:0.25rem;font-size:0.8125rem;">
                  <li>Execute as: <strong>Me</strong></li>
                  <li>Who has access: <strong>Anyone</strong> (Wajib)</li>
                </ul>
              </li>
              <li>Salin <strong>Web App URL</strong> yang diberikan lalu tempelkan ke kolom URL di tab ini.</li>
            </ol>

            <div style="background:var(--color-slate-100);padding:0.75rem;border-radius:6px;font-size:0.8125rem;">
              📁 File panduan lengkap dan skrip tersedia di folder: <code>backend/Code.gs</code> dan <code>backend/README_GOOGLE_APPS_SCRIPT.md</code>
            </div>
          </div>
        `,
        footerButtons: [
          { label: 'Tutup', className: 'btn-secondary', onClick: () => modal.close() }
        ]
      });
    };
  }

  // License Listeners
  const openLicensePopupBtn = document.getElementById('btn-open-license-popup');
  if (openLicensePopupBtn) {
    openLicensePopupBtn.onclick = () => {
      openLicenseActivationModal('Akses Fitur PRO');
    };
  }

  const activateKeyBtn = document.getElementById('btn-settings-activate-key');
  const keyInput = document.getElementById('settings-license-key-input');
  const phoneInput = document.getElementById('settings-license-phone-input');
  const keyFeedback = document.getElementById('settings-license-feedback');

  if (activateKeyBtn && keyInput) {
    activateKeyBtn.onclick = async () => {
      const rawKey = keyInput.value.trim();
      const rawPhone = phoneInput ? phoneInput.value.trim() : '';

      if (!rawPhone || rawPhone.length < 9) {
        if (keyFeedback) keyFeedback.innerHTML = '<span style="color:#ef4444;font-weight:600;">Harap masukkan Nomor WhatsApp aktif Anda (minimal 9 digit).</span>';
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!rawKey) {
        if (keyFeedback) keyFeedback.innerHTML = '<span style="color:#ef4444;font-weight:600;">Harap masukkan kode kunci lisensi.</span>';
        keyInput.focus();
        return;
      }

      activateKeyBtn.disabled = true;
      activateKeyBtn.innerText = 'Memverifikasi...';
      if (keyFeedback) keyFeedback.innerHTML = '<span style="color:#0284c7;font-weight:600;">Sedang memvalidasi lisensi & menyimpan nomor WhatsApp...</span>';

      try {
        const res = await LicenseService.activate(rawKey, '', rawPhone);
        if (res.success) {
          if (keyFeedback) keyFeedback.innerHTML = `<span style="color:#10b981;font-weight:700;">${res.message}</span>`;
          toast.success(res.message);
          setTimeout(() => {
            appState.notify();
          }, 1000);
        } else {
          if (keyFeedback) keyFeedback.innerHTML = `<span style="color:#ef4444;font-weight:600;">${res.message}</span>`;
          toast.error(res.message);
          activateKeyBtn.disabled = false;
          activateKeyBtn.innerText = 'Aktivasi Kunci';
        }
      } catch (err) {
        if (keyFeedback) keyFeedback.innerHTML = `<span style="color:#ef4444;font-weight:600;">Gagal aktivasi: ${err.message || err}</span>`;
        activateKeyBtn.disabled = false;
        activateKeyBtn.innerText = 'Aktivasi Kunci';
      }
    };
  }

  const removeLicenseBtn = document.getElementById('btn-settings-remove-license');
  if (removeLicenseBtn) {
    removeLicenseBtn.onclick = () => {
      modal.confirm({
        title: 'Hapus Lisensi PRO',
        message: 'Apakah Anda yakin ingin menghapus lisensi PRO dari perangkat ini? Fitur pencatatan baru akan terkunci kembali hingga lisensi diaktifkan lagi.',
        confirmText: 'Ya, Hapus Lisensi',
        confirmType: 'btn-danger',
        onConfirm: () => {
          LicenseService.deactivate();
          toast.info('Lisensi PRO berhasil dihapus.');
          appState.notify();
        }
      });
    };
  }
}

