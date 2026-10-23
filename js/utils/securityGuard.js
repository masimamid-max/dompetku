/**
 * ============================================================================
 * DOMPET KELUARGA - SECURITY GUARD & ANTI-TAMPER SYSTEM (v3.18.5)
 * ============================================================================
 * 1. Domain Locking Guard (Mencegah aplikasi di-copy ke domain lain).
 * 2. Anti-Tamper & Cryptographic License Signature (Mencegah bypass lewat console).
 * 3. Anti-Scraping / Context Protection (Melindungi IP dari scraper awam).
 * ============================================================================
 */

(function () {
  'use strict';

  // 1. DOMAIN LOCK GUARD
  const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname.toLowerCase() : '';
  const protocol = (typeof window !== 'undefined' && window.location && window.location.protocol) ? window.location.protocol : '';

  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || protocol === 'file:';
  const isOfficialDomain = 
    hostname === 'urwahdigital.space' ||
    hostname.endsWith('.urwahdigital.space') ||
    hostname.endsWith('.pages.dev');

  if (!isLocal && !isOfficialDomain && typeof document !== 'undefined') {
    const handleUnauthorized = () => {
      document.body.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#064e3b;background:linear-gradient(135deg, #064e3b 0%, #022c22 100%);color:#f8fafc;font-family:'Plus Jakarta Sans',sans-serif;padding:2rem;box-sizing:border-box;">
          <div style="max-width:480px;background:rgba(255,255,255,0.06);backdrop-filter:blur(16px);border:1.5px solid rgba(239,68,68,0.5);border-radius:24px;padding:2.5rem 2rem;text-align:center;box-shadow:0 25px 50px rgba(0,0,0,0.5);">
            <div style="width:64px;height:64px;background:#fee2e2;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 1.25rem;font-size:32px;">⚠️</div>
            <h2 style="color:#fca5a5;font-size:1.4rem;font-weight:800;margin:0 0 0.75rem 0;">Akses Domain Tidak Resmi</h2>
            <p style="color:#e2e8f0;font-size:0.9rem;line-height:1.6;margin:0 0 1.5rem 0;">
              Aplikasi <strong>Dompet Keluarga PRO</strong> dilindungi hak cipta intelektual dan lisensi domain. Distribusi di luar domain resmi tidak diizinkan.
            </p>
            <a href="https://urwahdigital.space" style="display:inline-flex;align-items:center;justify-content:center;padding:0.8rem 1.6rem;background:#10b981;color:#ffffff;font-weight:700;font-size:0.92rem;text-decoration:none;border-radius:12px;box-shadow:0 8px 20px rgba(16,185,129,0.3);">
              Buka di Domain Resmi (urwahdigital.space) →
            </a>
          </div>
        </div>
      `;
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleUnauthorized);
    } else {
      handleUnauthorized();
    }
    throw new Error('Unauthorized domain distribution. Licensed exclusively to urwahdigital.space.');
  }

  // 2. ANTI-SCRAPE & ANTI-INSPECT (HANYA AKTIF DI PRODUKSI, BUKAN SAAT DEV LOKAL)
  if (!isLocal && typeof document !== 'undefined') {
    // Nonaktifkan klik kanan hanya pada elemen non-input
    document.addEventListener('contextmenu', function (e) {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
        return true; // Izinkan klik kanan untuk paste di input form
      }
      e.preventDefault();
      return false;
    });

    // Halangi shortcut umum inspect element (F12, Ctrl+Shift+I, dll)
    document.addEventListener('keydown', function (e) {
      // F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Cmd+Option+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J, Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey || e.altKey) && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U, Cmd+Option+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
    });
  }

  // 3. CRYPTOGRAPHIC LICENSE INTEGRITY GUARD
  const SECRET_SALT = 'DK_PRO_GUARD_2026_@URWAH_SECURE_AUTH!';

  function computeFastHash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
  }

  function generateSignature(key, email, phone, status) {
    const raw = `${String(key).trim().toUpperCase()}:${String(email).trim().toLowerCase()}:${String(phone).replace(/[^0-9]/g, '')}:${status}:${SECRET_SALT}`;
    const part1 = computeFastHash(raw);
    const part2 = computeFastHash(raw.split('').reverse().join(''));
    return `sig_${part1}_${part2}`;
  }

  window.SecurityGuard = {
    isProduction: !isLocal,
    signLicense: function (license) {
      if (!license) return license;
      const copy = { ...license };
      copy._sig = generateSignature(copy.key || '', copy.email || '', copy.phone || '', copy.status || '');
      copy._verifiedAt = Date.now();
      return copy;
    },
    verifyLicense: function (license) {
      if (!license) return false;
      if (license.status !== 'active') return false;
      if (!license.key) return false;

      // Cek signature digital
      const expectedSig = generateSignature(license.key || '', license.email || '', license.phone || '', license.status || '');
      if (license._sig === expectedSig) {
        return true;
      }

      // Backward-compatibility: Jika lisensi lama yang sah belum memiliki _sig, buatkan signature jika kunci sah
      const key = String(license.key).trim().toUpperCase();
      const isValidPattern = /^DK-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key) || (key.startsWith('DKPRO-') && key.length >= 10);
      if (isValidPattern) {
        license._sig = expectedSig;
        license._verifiedAt = Date.now();
        try {
          localStorage.setItem('dk_app_license_v1', JSON.stringify(license));
        } catch (_) {}
        return true;
      }

      // Manipulasi terdeteksi (misal: inject {"status":"active"} via console tanpa signature sah)
      console.warn('⚠️ Integritas lisensi tidak valid (tampering detected).');
      return false;
    }
  };
})();
