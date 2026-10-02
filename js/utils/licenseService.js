/**
 * ============================================================================
 * DOMPETKU - COMMERCIAL LICENSE & PAYWALL SERVICE
 * ============================================================================
 * Mengatur hak akses fitur PRO, validasi kunci lisensi pelanggan, dan proteksi paywall.
 */

const LICENSE_STORAGE_KEY = 'dk_app_license_v1';
const DEFAULT_DEVELOPER_WA = '6281234567890'; // Dapat disesuaikan pemilik produk

export class LicenseService {
  /**
   * Mengambil data lisensi yang tersimpan
   */
  static getLicense() {
    try {
      const stored = localStorage.getItem(LICENSE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (_) {}

    // Default status jika belum aktivasi: Trial / Unlicensed
    return {
      status: 'trial', // 'active' (PRO) | 'trial' (Belum Aktivasi)
      plan: 'Mode Uji Coba (Fitur Input Terkunci)',
      key: '',
      email: '',
      activatedAt: null,
      validUntil: null
    };
  }

  /**
   * Cek apakah aplikasi sudah berlisensi PRO aktif
   */
  static isLicensed() {
    const license = this.getLicense();
    return license && license.status === 'active';
  }

  /**
   * Simpan status lisensi
   */
  static saveLicense(licenseData) {
    try {
      localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(licenseData));
    } catch (_) {}
  }

  /**
   * Verifikasi dan Aktivasi Kunci Lisensi
   * Mendukung validasi online via Backend Developer & Master Key Offline
   */
  static async activate(rawKey, userEmail = '') {
    const key = (rawKey || '').trim().toUpperCase();
    if (!key) {
      return { success: false, message: 'Harap masukkan kode kunci lisensi.' };
    }

    const email = userEmail || (window.AuthAccess?.getSession()?.email) || 'pelanggan@email.com';

    // 1. Cek Offline Master Keys (Untuk kemudahan aktivasi developer langsung)
    const masterKeys = [
      'DKPRO-LIFETIME-2026',
      'DOMPETKU-PRO-VIP',
      'DOMPETKU-PRO-8899',
      'DK-SUPER-ACCESS'
    ];

    if (masterKeys.includes(key) || key.startsWith('DKPRO-') && key.length >= 12) {
      const license = {
        status: 'active',
        plan: 'Dompetku PRO (Akses Penuh Selamanya)',
        key: key,
        email: email,
        activatedAt: new Date().toISOString(),
        validUntil: 'Selamanya (Lifetime)'
      };
      this.saveLicense(license);
      this.notifyServerOfActivation(license);
      return {
        success: true,
        message: '🎉 Lisensi Dompetku PRO Berhasil Diaktifkan! Semua fitur pencatatan telah terbuka penuh.',
        license
      };
    }

    // 2. Cek Online Verification ke Spreadsheet Backend Developer (jika ada)
    const apiUrl = window.AuthAccess?.getApiUrl?.() || 'https://script.google.com/macros/s/AKfycbxYmS0CU2kekjbOvAnRHB2axnojysBvGHbA30fUoRWiRAsNflhBnucN5XWHUU_j78DqJg/exec';
    
    try {
      if (apiUrl && apiUrl.startsWith('http')) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'verify_license',
            key: key,
            email: email,
            timestamp: new Date().toISOString()
          })
        });

        const data = await res.json();
        if (data && data.success) {
          const license = {
            status: 'active',
            plan: data.plan || 'Dompetku PRO Lifetime',
            key: key,
            email: email,
            activatedAt: new Date().toISOString(),
            validUntil: data.validUntil || 'Selamanya (Lifetime)'
          };
          this.saveLicense(license);
          return {
            success: true,
            message: data.message || '🎉 Lisensi Dompetku PRO Berhasil Diverifikasi & Diaktifkan!',
            license
          };
        } else if (data && data.message) {
          return { success: false, message: data.message };
        }
      }
    } catch (err) {
      console.warn('Online license check fallback to pattern:', err);
    }

    // 3. Fallback Pattern Validation: Jika format kode memenuhi standar serial (DK-XXXX-XXXX-XXXX)
    if (/^DK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
      const license = {
        status: 'active',
        plan: 'Dompetku PRO (Serial Terverifikasi)',
        key: key,
        email: email,
        activatedAt: new Date().toISOString(),
        validUntil: 'Selamanya (Lifetime)'
      };
      this.saveLicense(license);
      this.notifyServerOfActivation(license);
      return {
        success: true,
        message: '🎉 Kunci Lisensi Terverifikasi! Semua fitur transaksi terbuka.',
        license
      };
    }

    return {
      success: false,
      message: 'Kunci lisensi tidak valid atau belum terdaftar. Silakan hubungi admin untuk mendapatkan kunci lisensi resmi.'
    };
  }

  /**
   * Hapus / Nonaktifkan Lisensi
   */
  static deactivate() {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }

  /**
   * Kirim catatan aktivasi ke spreadsheet developer
   */
  static notifyServerOfActivation(license) {
    try {
      const session = window.AuthAccess?.getSession() || {};
      const payload = {
        action: 'record_login',
        email: session.email || license.email,
        fullName: session.fullName || 'Pengguna PRO',
        licenseKey: license.key,
        licensePlan: license.plan,
        licenseStatus: 'PRO Aktif',
        timestamp: new Date().toISOString()
      };
      const apiUrl = window.AuthAccess?.getApiUrl?.();
      if (apiUrl) {
        fetch(apiUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (_) {}
  }

  /**
   * Link WhatsApp Pembelian Lisensi
   */
  static getBuyWhatsAppUrl() {
    const text = encodeURIComponent('Halo Admin Dompetku, saya ingin membeli Kunci Lisensi Dompetku PRO untuk membuka akses pencatatan keuangan.');
    return `https://wa.me/${DEFAULT_DEVELOPER_WA}?text=${text}`;
  }
}
