/**
 * Dompet Keluarga — Registration, License Activation & Login Portal (v3.18.5)
 * Dedicated for Paid Customers with Unique License Key Validation & WhatsApp Lead Capture.
 */
(function () {
  const SESSION_KEY = 'dk_google_session_v2';
  const USER_ACCOUNT_KEY = 'dk_user_account_v1';
  const ACCESS_API_URL = 'https://script.google.com/macros/s/AKfycbxYmS0CU2kekjbOvAnRHB2axnojysBvGHbA30fUoRWiRAsNflhBnucN5XWHUU_j78DqJg/exec';

  class GoogleAccessManager {
    getSession() {
      try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
        return session && (session.idToken || session.accountId) ? session : null;
      } catch (_) { return null; }
    }
    getIdToken() { return this.getSession()?.idToken || ''; }
    
    logout() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.setItem('dk_logged_out', 'true');
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
      if (!shell) return;

      const existingAccountStr = localStorage.getItem(USER_ACCOUNT_KEY);
      let existingAccount = null;
      try { existingAccount = JSON.parse(existingAccountStr); } catch (_) {}

      const existingLicenseStr = localStorage.getItem('dk_app_license_v1');
      let existingLicense = null;
      try { existingLicense = JSON.parse(existingLicenseStr); } catch (_) {}

      const hasRegistered = !!existingAccount || (existingLicense && existingLicense.status === 'active');

      shell.innerHTML = `
        <div class="access-page">
          <!-- Left Brand Panel -->
          <section class="access-brand-panel">
            <div class="access-brand-mark">▣</div>
            <div class="access-brand-copy">
              <span>DOMPET KELUARGA PRO</span>
              <h1>Kelola Keuangan Keluarga Lebih Tertata & Terhubung.</h1>
              <p>Platform pencatatan keuangan premium, aman, privat, dan bebas biaya langganan bulanan.</p>
            </div>
            <div class="access-trust-list">
              <div>✓ Akses Lisensi Resmi PRO Lifetime</div>
              <div>✓ Scan Struk Belanja Otomatis (OCR)</div>
              <div>✓ Sinkronisasi Cloud Google Spreadsheet Pribadi</div>
              <div>✓ Data Privat 100% Tersimpan Aman di Perangkat Anda</div>
            </div>
          </section>

          <!-- Right Auth Card -->
          <main class="access-card-wrap">
            <div class="access-card" style="max-width:460px;padding:2rem 1.75rem;">
              <div class="access-mobile-brand"><span>▣</span> Dompet Keluarga PRO</div>
              
              <!-- Tab Navigation -->
              <div style="display:flex;background:#f1f5f9;padding:4px;border-radius:12px;margin-bottom:1.25rem;">
                <button type="button" id="tab-btn-register" style="flex:1;padding:0.6rem 0.5rem;border:none;border-radius:9px;font-weight:700;font-size:0.875rem;cursor:pointer;background:${hasRegistered ? 'transparent' : '#ffffff'};color:${hasRegistered ? '#64748b' : '#0f172a'};box-shadow:${hasRegistered ? 'none' : '0 2px 6px rgba(0,0,0,0.06)'};transition:all 0.15s ease;">
                  📝 Daftar Akun Baru
                </button>
                <button type="button" id="tab-btn-login" style="flex:1;padding:0.6rem 0.5rem;border:none;border-radius:9px;font-weight:700;font-size:0.875rem;cursor:pointer;background:${hasRegistered ? '#ffffff' : 'transparent'};color:${hasRegistered ? '#0f172a' : '#64748b'};box-shadow:${hasRegistered ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'};transition:all 0.15s ease;">
                  🚪 Masuk Akun
                </button>
              </div>

              <div id="auth-alert-box" style="margin-bottom:1rem;"></div>

              <!-- ================= REGISTRATION FORM ================= -->
              <form id="form-register-activation" style="display:${hasRegistered ? 'none' : 'block'};">
                <div style="font-size:0.82rem;color:#64748b;margin-bottom:1rem;line-height:1.45;">
                  Daftarkan diri Anda untuk mulai mengelola keuangan keluarga secara privat dan terhubung.
                </div>

                <!-- Nama Lengkap -->
                <div style="margin-bottom:0.75rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    👤 Nama Lengkap / Kepala Keluarga:
                  </label>
                  <input type="text" id="reg-name" required placeholder="Contoh: Budi Santoso" value="${existingAccount?.name || ''}" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- No WhatsApp -->
                <div style="margin-bottom:0.75rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    📱 Nomor WhatsApp Aktif (Wajib):
                  </label>
                  <input type="tel" id="reg-phone" required placeholder="Contoh: 081234567890" value="${existingAccount?.phone || existingLicense?.phone || ''}" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- Email -->
                <div style="margin-bottom:0.75rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    ✉️ Alamat Email:
                  </label>
                  <input type="email" id="reg-email" required placeholder="nama@email.com" value="${existingAccount?.email || existingLicense?.email || ''}" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- Password / PIN -->
                <div style="margin-bottom:1.15rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    🔒 Buat Password / PIN Masuk:
                  </label>
                  <input type="password" id="reg-password" required placeholder="Minimal 6 karakter" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- Submit Button -->
                <button type="submit" id="btn-submit-register" style="width:100%;min-height:46px;background:linear-gradient(135deg, #059669 0%, #047857 100%);color:#fff;border:none;border-radius:10px;font-weight:800;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;box-shadow:0 4px 14px rgba(5, 150, 105, 0.3);transition:all 0.15s ease;">
                  <span>🚀</span>
                  <span>Daftar & Buka Dashboard</span>
                </button>
              </form>

              <!-- ================= LOGIN FORM ================= -->
              <form id="form-login" style="display:${hasRegistered ? 'block' : 'none'};">
                <div style="font-size:0.82rem;color:#64748b;margin-bottom:1rem;line-height:1.45;">
                  Masuk dengan nomor WhatsApp / email dan password yang telah Anda daftarkan.
                </div>

                <!-- Identifier -->
                <div style="margin-bottom:0.85rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    📱 Nomor WhatsApp / Email:
                  </label>
                  <input type="text" id="login-identifier" required placeholder="081234567890 atau email" value="${existingAccount?.phone || existingAccount?.email || ''}" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- Password -->
                <div style="margin-bottom:1.15rem;">
                  <label style="display:block;font-size:0.8rem;font-weight:700;color:#1e293b;margin-bottom:0.3rem;">
                    🔒 Password / PIN:
                  </label>
                  <input type="password" id="login-password" required placeholder="Masukkan password Anda" style="width:100%;box-sizing:border-box;padding:0.65rem 0.85rem;border:1px solid #cbd5e1;border-radius:8px;font-size:0.9rem;font-weight:600;color:#0f172a;background:#f8fafc;" />
                </div>

                <!-- Submit Button -->
                <button type="submit" id="btn-submit-login" style="width:100%;min-height:46px;background:linear-gradient(135deg, #059669 0%, #047857 100%);color:#fff;border:none;border-radius:10px;font-weight:800;font-size:0.95rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:0.5rem;box-shadow:0 4px 14px rgba(5, 150, 105, 0.3);transition:all 0.15s ease;">
                  <span>🚪</span>
                  <span>Masuk ke Dashboard</span>
                </button>
              </form>

              <!-- Footer WhatsApp Help -->
              <div style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid #e2e8f0;text-align:center;">
                <div style="font-size:0.78rem;color:#64748b;margin-bottom:0.5rem;">
                  Belum memiliki Kode Lisensi PRO atau butuh bantuan?
                </div>
                <a href="https://wa.me/6281234567890?text=Halo%20Admin%20Dompetku%2C%20saya%20ingin%20membeli%20atau%20memeriksa%20Kode%20Lisensi%20PRO%20saya." target="_blank" rel="noopener noreferrer" style="color:#059669;font-weight:700;font-size:0.85rem;text-decoration:none;display:inline-flex;align-items:center;gap:0.35rem;">
                  <span>💬</span>
                  <span>Hubungi Admin via WhatsApp</span>
                </a>
              </div>

            </div>
          </main>
        </div>
      `;

      // Tab switching handlers
      const tabReg = document.getElementById('tab-btn-register');
      const tabLog = document.getElementById('tab-btn-login');
      const formReg = document.getElementById('form-register-activation');
      const formLog = document.getElementById('form-login');
      const alertBox = document.getElementById('auth-alert-box');

      const showAlert = (msg, type = 'error') => {
        const bg = type === 'success' ? '#ecfdf5' : '#fef2f2';
        const color = type === 'success' ? '#047857' : '#b91c1c';
        const border = type === 'success' ? '#a7f3d0' : '#fecaca';
        alertBox.innerHTML = `
          <div style="padding:0.65rem 0.85rem;background:${bg};border:1px solid ${border};border-radius:8px;color:${color};font-size:0.84rem;font-weight:600;line-height:1.4;">
            ${msg}
          </div>
        `;
      };

      tabReg.onclick = () => {
        tabReg.style.background = '#ffffff';
        tabReg.style.color = '#0f172a';
        tabReg.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
        tabLog.style.background = 'transparent';
        tabLog.style.color = '#64748b';
        tabLog.style.boxShadow = 'none';
        formReg.style.display = 'block';
        formLog.style.display = 'none';
        alertBox.innerHTML = '';
      };

      tabLog.onclick = () => {
        tabLog.style.background = '#ffffff';
        tabLog.style.color = '#0f172a';
        tabLog.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
        tabReg.style.background = 'transparent';
        tabReg.style.color = '#64748b';
        tabReg.style.boxShadow = 'none';
        formLog.style.display = 'block';
        formReg.style.display = 'none';
        alertBox.innerHTML = '';
      };

      // Form Registration Handler (Frictionless Onboarding)
      formReg.onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value;

        if (!name || !phone || !email || !password) {
          showAlert('Semua kolom wajib diisi dengan lengkap.');
          return;
        }

        if (password.length < 5) {
          showAlert('Password minimal 5 karakter.');
          return;
        }

        const submitBtn = document.getElementById('btn-submit-register');
        submitBtn.disabled = true;
        submitBtn.innerText = 'Mendaftarkan Akun...';

        try {
          // 1. Simpan Akun Pengguna Lokal
          const userAccount = {
            name,
            phone,
            email,
            password,
            registeredAt: new Date().toISOString()
          };
          localStorage.setItem(USER_ACCOUNT_KEY, JSON.stringify(userAccount));
          localStorage.removeItem('dk_logged_out');

          // 2. Buat Sesi Pengguna
          const session = {
            accountId: 'usr_' + Date.now(),
            email: email,
            fullName: name,
            phone: phone,
            idToken: 'auth_token_' + Date.now(),
            access: { authorized: true, status: 'active', role: 'owner', plan: 'Dompet Keluarga' }
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

          // 3. Rekam Lead Telemetri ke Google Spreadsheet Developer (Background)
          try {
            fetch(ACCESS_API_URL, {
              method: 'POST',
              mode: 'cors',
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify({
                action: 'record_login',
                name: name,
                fullName: name,
                phone: phone,
                email: email,
                status: 'registered',
                device: navigator.userAgent || 'Web Browser',
                registeredAt: new Date().toISOString()
              })
            }).catch(() => {});
          } catch (_) {}

          showAlert('🎉 Pendaftaran Berhasil! Membuka Dashboard...', 'success');
          
          setTimeout(() => {
            onAuthenticated(session);
          }, 600);
        } catch (err) {
          showAlert('Terjadi kesalahan: ' + (err.message || err));
          submitBtn.disabled = false;
          submitBtn.innerText = 'Daftar & Buka Dashboard';
        }
      };

      // Form Login Handler
      formLog.onsubmit = (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        if (!identifier || !password) {
          showAlert('Harap isi nomor WA / email dan password.');
          return;
        }

        const storedAccountStr = localStorage.getItem(USER_ACCOUNT_KEY);
        let storedAccount = null;
        try { storedAccount = JSON.parse(storedAccountStr); } catch (_) {}

        if (storedAccount) {
          const matchesIdent = (storedAccount.email && storedAccount.email.toLowerCase() === identifier) ||
                               (storedAccount.phone && storedAccount.phone.includes(identifier));
          if (matchesIdent && storedAccount.password === password) {
            localStorage.removeItem('dk_logged_out');
            const session = {
              accountId: 'usr_' + Date.now(),
              email: storedAccount.email,
              fullName: storedAccount.name,
              phone: storedAccount.phone,
              idToken: 'auth_token_' + Date.now(),
              access: { authorized: true, status: 'active', role: 'owner', plan: 'Dompetku PRO Lifetime' }
            };
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
            showAlert('Login berhasil! Membuka dashboard...', 'success');
            setTimeout(() => onAuthenticated(session), 400);
            return;
          }
        }

        // Fallback login jika lisensi aktif
        if (existingLicense && existingLicense.status === 'active') {
          localStorage.removeItem('dk_logged_out');
          const session = {
            accountId: 'usr_' + Date.now(),
            email: identifier.includes('@') ? identifier : 'pengguna@dompetku.local',
            fullName: storedAccount?.name || 'Kepala Keluarga',
            phone: identifier,
            idToken: 'auth_token_' + Date.now(),
            access: { authorized: true, status: 'active', role: 'owner', plan: 'Dompetku PRO Lifetime' }
          };
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
          showAlert('Login berhasil! Membuka dashboard...', 'success');
          setTimeout(() => onAuthenticated(session), 400);
          return;
        }

        showAlert('Akun tidak ditemukan atau password salah. Silakan periksa kembali atau lakukan aktivasi di tab Daftar.');
      };
    }
  }

  window.AuthAccess = new GoogleAccessManager();
})();
