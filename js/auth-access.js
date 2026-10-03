/** Dompet Keluarga — Google Identity. Kata sandi tidak disimpan aplikasi. */
(function () {
  const SESSION_KEY = 'dk_google_session_v2';
  const GOOGLE_CLIENT_ID = '308188248829-n7k89n30omrfnp4tokcao9in403p25f0.apps.googleusercontent.com';
  const ACCESS_API_URL = 'https://script.google.com/macros/s/AKfycbxYmS0CU2kekjbOvAnRHB2axnojysBvGHbA30fUoRWiRAsNflhBnucN5XWHUU_j78DqJg/exec';

  class GoogleAccessManager {
    getSession() {
      try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        return session && session.idToken ? session : null;
      } catch (_) { return null; }
    }
    getIdToken() { return this.getSession()?.idToken || ''; }
    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.setItem('dk_logged_out', 'true');
      if (window.google?.accounts?.id) window.google.accounts.id.disableAutoSelect();
      const shell = document.getElementById('app-shell');
      if (shell) {
        this.render(shell, (session) => {
          localStorage.removeItem('dk_logged_out');
          if (window.app && typeof window.app.init === 'function') {
            window.app.init();
          } else {
            location.reload();
          }
        });
      } else {
        location.reload();
      }
    }
    render(shell, onAuthenticated) {
      const members = window.appState?.members || [
        { id: 'mem-1', name: 'Budi Santoso', roleLabel: 'Kepala Keluarga', avatarText: 'BS' },
        { id: 'mem-2', name: 'Siti Rahma', roleLabel: 'Ibu Rumah Tangga', avatarText: 'SR' }
      ];

      const membersHtml = members.map(m => `
        <button type="button" class="btn-select-member" data-member-id="${m.id}" data-member-name="${m.name}" style="width:100%;padding:0.6rem 0.75rem;margin-bottom:0.4rem;border:1px solid #e2e8f0;background:#f8fafc;border-radius:10px;display:flex;align-items:center;gap:0.75rem;cursor:pointer;text-align:left;transition:all 0.15s ease;">
          <div style="width:36px;height:36px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;">
            ${m.avatarText || m.name.slice(0, 2).toUpperCase()}
          </div>
          <div style="flex:1;">
            <div style="font-weight:700;font-size:0.875rem;color:#0f172a;">${m.name}</div>
            <div style="font-size:0.75rem;color:#64748b;">${m.roleLabel || 'Anggota'}</div>
          </div>
          <span style="color:#059669;font-weight:700;font-size:0.85rem;">Masuk &rarr;</span>
        </button>
      `).join('');

      shell.innerHTML = `
        <div class="access-page">
          <section class="access-brand-panel">
            <div class="access-brand-mark">▣</div>
            <div class="access-brand-copy"><span>DOMPET KELUARGA</span>
              <h1>Keuangan keluarga lebih tertata, aman, dan terhubung.</h1>
              <p>Pilih akun anggota keluarga atau masuk langsung ke dashboard.</p>
            </div>
            <div class="access-trust-list"><div>✓ Login cepat & privat</div><div>✓ Terhubung antar anggota keluarga</div><div>✓ Data aman di perangkat Anda</div></div>
          </section>
          <main class="access-card-wrap"><div class="access-card" style="max-width:440px;">
            <div class="access-mobile-brand"><span>▣</span> Dompet Keluarga</div>
            <div class="access-heading"><h2>Pilih Akun</h2><p>Pilih profil anggota keluarga atau masuk langsung.</p></div>
            <div id="access-notice"></div>

            <div style="margin-bottom:1rem;">
              <div style="font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;margin-bottom:0.5rem;letter-spacing:0.05em;">Masuk sebagai Anggota:</div>
              ${membersHtml}
            </div>

            <div style="margin:0.75rem 0;display:flex;align-items:center;gap:0.75rem;">
              <div style="flex:1;height:1px;background:#e2e8f0;"></div>
              <span style="font-size:0.75rem;color:#94a3b8;text-transform:uppercase;font-weight:700;">Atau</span>
              <div style="flex:1;height:1px;background:#e2e8f0;"></div>
            </div>

            <button type="button" id="btn-guest-login" style="width:100%;min-height:44px;border:1.5px solid #059669;border-radius:10px;background:#ecfdf5;color:#059669;font-weight:700;font-size:0.9rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;transition:all 0.15s ease;">
              <span>🚀</span>
              <span>Buka Dashboard Utama Langsung</span>
            </button>

            <div id="google-signin-button" class="access-google-host" aria-label="Masuk dengan Google" style="min-height:36px;margin-top:0.75rem;display:flex;align-items:center;justify-content:center;"></div>
            <div class="access-security-note" style="margin-top:0.75rem;">Data keuangan tersimpan privat di perangkat Anda.</div>
          </div></main>
        </div>`;
      
      const guestBtn = document.getElementById('btn-guest-login');
      if (guestBtn) {
        guestBtn.onclick = () => {
          localStorage.removeItem('dk_logged_out');
          const isPro = window.LicenseService?.isLicensed?.() || !!localStorage.getItem('dk_app_license_v1');
          const guestSession = {
            accountId: 'guest_' + Date.now(),
            email: 'pengguna@dompetku.local',
            fullName: 'Kepala Keluarga',
            picture: '',
            idToken: 'guest_token',
            access: { authorized: true, status: isPro ? 'active' : 'trial', role: 'owner', plan: isPro ? 'Dompetku PRO' : 'Uji Coba' }
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(guestSession));
          onAuthenticated(guestSession);
        };
      }

      document.querySelectorAll('.btn-select-member').forEach(btn => {
        btn.onclick = () => {
          const mId = btn.dataset.memberId;
          const mName = btn.dataset.memberName;
          if (window.appState) {
            window.appState.setCurrentUser(mId);
          }
          localStorage.removeItem('dk_logged_out');
          const isPro = window.LicenseService?.isLicensed?.() || !!localStorage.getItem('dk_app_license_v1');
          const memberSession = {
            accountId: mId,
            email: `${mId}@dompetku.local`,
            fullName: mName,
            picture: '',
            idToken: 'member_token',
            access: { authorized: true, status: isPro ? 'active' : 'trial', role: 'member', plan: isPro ? 'Dompetku PRO' : 'Uji Coba' }
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(memberSession));
          onAuthenticated(memberSession);
        };
      });

      this.mountGoogleButton(onAuthenticated);
    }
    showNotice(message) {
      const notice = document.getElementById('access-notice');
      if (notice) notice.innerHTML = `<div class="access-notice">${String(message || '')}</div>`;
    }
    async sendTelemetry(session) {
      try {
        if (!ACCESS_API_URL || !ACCESS_API_URL.startsWith('http')) return;
        const payload = {
          action: 'record_login',
          email: session.email,
          fullName: session.fullName,
          picture: session.picture || '',
          idToken: session.idToken || '',
          familyName: (window.appState?.family?.name) || 'Keluarga Baru',
          userAgent: navigator.userAgent || '-',
          appVersion: '3.16.1',
          timestamp: new Date().toISOString()
        };
        fetch(ACCESS_API_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch (_) {}
    }
    async verifyAccess(idToken) {
      if (!ACCESS_API_URL || !ACCESS_API_URL.startsWith('http')) return { success: true };
      const response = await fetch(ACCESS_API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'checkAccess', idToken }),
        redirect: 'follow'
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Pemeriksaan akses gagal.');
      return result;
    }
    showRestrictedOverlay(session) {
      if (session?.access?.authorized || document.getElementById('license-access-overlay')) return;
      const overlay = document.createElement('div');
      overlay.id = 'license-access-overlay';
      overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.72);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;padding:18px;font-family:Plus Jakarta Sans,sans-serif';
      overlay.innerHTML = `<div style="width:min(100%,480px);background:#fff;border-radius:22px;padding:26px;box-shadow:0 24px 70px rgba(15,23,42,.3);text-align:center">
        <div style="width:58px;height:58px;border-radius:18px;background:#ecfdf5;color:#059669;display:grid;place-items:center;margin:0 auto 16px;font-size:28px">✉</div>
        <h2 style="margin:0 0 8px;color:#0f172a;font-size:22px">Konfirmasi email diperlukan</h2>
        <p style="margin:0 0 16px;color:#64748b;line-height:1.6">Anda sudah dapat melihat Dompetku. Semua fitur penyimpanan masih dikunci sampai pengelola mengaktifkan lisensi Anda.</p>
        <div style="padding:12px;border:1px solid #d1fae5;background:#f0fdf4;border-radius:12px;color:#065f46;font-weight:750;word-break:break-word">${this.escapeHtml(session.email)}</div>
        <p id="license-access-message" style="font-size:13px;color:#64748b;margin:14px 0">${this.escapeHtml(session.access?.message || 'Status: menunggu aktivasi')}</p>
        <button id="license-check-again" style="width:100%;min-height:46px;border:0;border-radius:12px;background:#059669;color:#fff;font-weight:800;cursor:pointer">Periksa Status Lagi</button>
        <button id="license-logout" style="width:100%;min-height:42px;border:0;background:transparent;color:#64748b;font-weight:700;cursor:pointer;margin-top:5px">Keluar dan gunakan email lain</button>
      </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('#license-logout').onclick = () => this.logout();
      overlay.querySelector('#license-check-again').onclick = async event => {
        const button = event.currentTarget;
        const message = overlay.querySelector('#license-access-message');
        button.disabled = true;
        button.textContent = 'Memeriksa…';
        try {
          const verification = await this.verifyAccess(session.idToken);
          session.access = verification.access;
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          if (verification.access?.authorized) location.reload();
          else message.textContent = verification.access?.message || 'Masih menunggu persetujuan pengelola.';
        } catch (error) { message.textContent = error.message || 'Pemeriksaan gagal. Coba kembali.'; }
        button.disabled = false;
        button.textContent = 'Periksa Status Lagi';
      };
    }
    escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
    }
    getApiUrl() { return ACCESS_API_URL; }
    mountGoogleButton(onAuthenticated) {
      const host = document.getElementById('google-signin-button');
      if (!host) return;
      const start = () => {
        if (!window.google?.accounts?.id) return false;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async response => {
            try {
              this.showNotice('Menyiapkan dashboard Anda…');
              const encoded = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
              const payload = JSON.parse(decodeURIComponent(atob(encoded).split('').map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('')));
              
              // Cek apakah perangkat sudah memiliki lisensi PRO permanen
              let isPro = false;
              let proPlan = 'Dompetku PRO Lifetime';
              try {
                const storedLicenseStr = localStorage.getItem('dk_app_license_v1');
                if (storedLicenseStr) {
                  const lic = JSON.parse(storedLicenseStr);
                  if (lic && lic.status === 'active') {
                    isPro = true;
                    proPlan = lic.plan || 'Dompetku PRO Lifetime';
                    // Kaitkan email akun Google ke lisensi yang tersimpan
                    lic.email = payload.email;
                    localStorage.setItem('dk_app_license_v1', JSON.stringify(lic));
                  }
                }
              } catch (_) {}

              const session = {
                accountId: payload.sub,
                email: payload.email,
                fullName: payload.name || payload.email,
                picture: payload.picture || '',
                idToken: response.credential,
                access: { 
                  authorized: true, 
                  status: isPro ? 'active' : 'trial', 
                  role: 'owner', 
                  plan: isPro ? proPlan : 'Uji Coba' 
                }
              };
              sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
              onAuthenticated(session);
              // Pencatatan login otomatis dikirim ke Spreadsheet Pengembang / Developer
              this.sendTelemetry(session);
            } catch (error) { this.showNotice(error.message || 'Login Google tidak dapat diproses. Silakan coba kembali.'); }
          },
          auto_select: false,
          cancel_on_tap_outside: true
        });
        window.google.accounts.id.renderButton(host, { theme: 'outline', size: 'large', width: Math.min(360, host.clientWidth || 320), text: 'continue_with', shape: 'rectangular', logo_alignment: 'left' });
        return true;
      };
      if (!start()) {
        let attempts = 0;
        const timer = setInterval(() => {
          attempts += 1;
          if (start() || attempts >= 30) {
            clearInterval(timer);
            if (attempts >= 30 && !window.google?.accounts?.id) this.showNotice('Layanan login Google belum dapat dimuat. Periksa koneksi internet.');
          }
        }, 200);
      }
    }
  }
  window.AuthAccess = new GoogleAccessManager();
})();
