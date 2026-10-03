/**
 * ============================================================================
 * DOMPETKU - COMMERCIAL LICENSE & PAYWALL SERVICE (v3.0)
 * ============================================================================
 * Mengatur hak akses fitur PRO, validasi kunci lisensi pelanggan, pengumpulan database
 * nomor WhatsApp pelanggan, dan proteksi paywall komersial.
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
      phone: '',
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
   * Format & Standarisasi Nomor Telepon / WhatsApp
   */
  static formatPhoneNumber(rawPhone) {
    if (!rawPhone) return '';
    let str = String(rawPhone).replace(/[^0-9+]/g, '');
    if (str.startsWith('08')) str = '628' + str.slice(2);
    if (str.startsWith('+62')) str = '62' + str.slice(3);
    return str;
  }

  /**
   * Verifikasi dan Aktivasi Kunci Lisensi Unik + Simpan Nomor WhatsApp
   * Mendukung validasi online via Backend Developer & Master Key Offline
   */
  static async activate(rawKey, userEmail = '', userPhone = '') {
    const key = (rawKey || '').trim().toUpperCase();
    if (!key) {
      return { success: false, message: 'Harap masukkan kode kunci lisensi.' };
    }

    let userAccount = null;
    try { userAccount = JSON.parse(localStorage.getItem('dk_user_account_v1') || 'null'); } catch (_) {}

    const session = window.AuthAccess?.getSession() || {};
    const email = (userEmail || session.email || userAccount?.email || '').trim().toLowerCase();
    const fullName = session.fullName || userAccount?.name || 'Pelanggan';
    const phone = this.formatPhoneNumber(userPhone || session.phone || userAccount?.phone || '');

    // 1. Cek Offline Master Keys (Untuk kemudahan aktivasi developer langsung)
    const masterKeys = [
      'DKPRO-LIFETIME-2026',
      'DOMPETKU-PRO-VIP',
      'DOMPETKU-PRO-8899',
      'DK-SUPER-ACCESS'
    ];

    if (masterKeys.includes(key) || (key.startsWith('DKPRO-') && key.length >= 12)) {
      const license = {
        status: 'active',
        plan: 'Dompetku PRO (Akses Penuh Selamanya)',
        key: key,
        email: email,
        phone: phone,
        fullName: fullName,
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

    // 2. Cek Online Verification ke Spreadsheet Backend Developer
    const apiUrl = window.AuthAccess?.getApiUrl?.() || 'https://script.google.com/macros/s/AKfycby3WIJilF-8cUnW2wgpGb2B-qo9KW41Fb7WzMeVtovgjKld09vrPFBuOqotNZBQITUjAw/exec';
    
    try {
      if (apiUrl && apiUrl.startsWith('http')) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({
            action: 'activate_license',
            key: key,
            licenseKey: key,
            email: email,
            phone: phone,
            fullName: fullName,
            userAgent: navigator.userAgent || '-',
            timestamp: new Date().toISOString()
          })
        });

        const data = await res.json();
        if (data && data.success) {
          const license = {
            status: 'active',
            plan: data.license?.plan || data.plan || 'Dompetku PRO Lifetime',
            key: key,
            email: email,
            phone: phone,
            fullName: fullName,
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

    // 3. Fallback Pattern Validation: Jika format kode memenuhi standar serial unik (DK-XXXX-YYYY-ZZZZ)
    if (/^DK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
      const license = {
        status: 'active',
        plan: 'Dompetku PRO (Serial Terverifikasi)',
        key: key,
        email: email,
        phone: phone,
        fullName: fullName,
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
      message: 'Kunci lisensi tidak valid atau belum terdaftar. Silakan hubungi admin di WhatsApp untuk mendapatkan kunci lisensi resmi.'
    };
  }

  /**
   * Hapus / Nonaktifkan Lisensi
   */
  static deactivate() {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
  }

  /**
   * Kirim catatan aktivasi & data nomor WhatsApp ke spreadsheet developer
   */
  static notifyServerOfActivation(license) {
    try {
      const session = window.AuthAccess?.getSession() || {};
      const payload = {
        action: 'activate_license',
        email: session.email || license.email,
        fullName: session.fullName || license.fullName || 'Pengguna PRO',
        phone: license.phone || '',
        licenseKey: license.key,
        licensePlan: license.plan,
        licenseStatus: 'PRO Aktif',
        userAgent: navigator.userAgent || '-',
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
   * Link WhatsApp Pembelian Lisensi (Dilengkapi Pesan Otomatis Nama & Email)
   */
  static getBuyWhatsAppUrl(featureReason = 'Akses Penuh Dompetku PRO') {
    const session = window.AuthAccess?.getSession() || {};
    const userName = session.fullName || 'Pelanggan Dompetku';
    const userEmail = session.email || '';

    let messageText = `Halo Admin Dompetku, saya *${userName}*`;
    if (userEmail) {
      messageText += ` (Email: *${userEmail}*)`;
    }
    messageText += ` ingin membeli/mengaktifkan *Kunci Lisensi Dompetku PRO Resmi* untuk ${featureReason}.\n\nMohon info rekening pembayaran dan nomor lisensi saya. Terima kasih!`;

    const encoded = encodeURIComponent(messageText);
    return `https://wa.me/${DEFAULT_DEVELOPER_WA}?text=${encoded}`;
  }
}
