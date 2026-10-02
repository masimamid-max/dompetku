/**
 * Interactive Onboarding Setup Wizard Component for Dompetku
 * Guides first-time users through family identity, initial accounts, and starting mode.
 */

function openOnboardingWizardModal(force = false) {
  // Jika tidak dipaksa dibuka dari tombol Pengaturan, cek apakah sudah pernah selesai atau disetup
  if (!force) {
    const isCompleted = localStorage.getItem('dk_onboarding_completed');
    if (isCompleted === 'true') {
      return;
    }

    // Jika akun sudah memiliki data tersimpan (bukan fresh install kosong)
    const savedStateStr = localStorage.getItem('dompet_keluarga_db_v1');
    if (savedStateStr) {
      try {
        const parsed = JSON.parse(savedStateStr);
        if (parsed && parsed.family && parsed.family.name && parsed.family.name !== 'Keluarga Pratama') {
          localStorage.setItem('dk_onboarding_completed', 'true');
          return;
        }
      } catch (_) {}
    }
  }

  let currentStep = 1;
  const totalSteps = 4;

  const session = window.AuthAccess?.getSession?.() || {};
  const defaultUserName = session.fullName || appState.currentUser?.name || 'Pengguna';
  const defaultFamilyName = session.fullName 
    ? `Keluarga ${session.fullName.split(' ')[0]}` 
    : (appState.family?.name || 'Keluarga Saya');

  // Wizard temporary state
  const wizardData = {
    familyName: defaultFamilyName,
    userName: defaultUserName,
    currency: 'IDR',
    currencySymbol: 'Rp',
    cashBalance: 500000,
    bankName: 'Rekening Bank BCA',
    bankBalance: 5000000,
    hasEwallet: false,
    ewalletName: 'GoPay / OVO',
    ewalletBalance: 200000,
    startMode: 'clean' // 'clean' or 'demo'
  };

  function renderWizardStep() {
    switch (currentStep) {
      case 1:
        return `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div style="text-align:center;padding:0.5rem 0;">
              <div style="font-size:2.5rem;margin-bottom:0.5rem;">🏡</div>
              <h3 style="font-size:1.25rem;font-weight:800;color:var(--color-slate-900);margin:0 0 0.375rem 0;">
                Selamat Datang di Dompetku!
              </h3>
              <p style="font-size:0.875rem;color:var(--text-muted);margin:0;line-height:1.5;">
                Mari atur identitas pembukuan keuangan keluarga Anda dalam waktu kurang dari 1 menit.
              </p>
            </div>

            <div style="background:var(--color-slate-50);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1.25rem;display:flex;flex-direction:column;gap:1rem;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-weight:700;">Nama Keluarga / Buku Kas *</label>
                <input 
                  type="text" 
                  id="wiz-family-name" 
                  class="form-input" 
                  value="${wizardData.familyName}" 
                  placeholder="Contoh: Keluarga Pratama / Dompet Pribadi"
                  required 
                />
                <small style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;display:block;">
                  Nama ini akan muncul pada dashboard dan kop laporan keuangan Anda.
                </small>
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-weight:700;">Nama Panggilan Anda *</label>
                <input 
                  type="text" 
                  id="wiz-user-name" 
                  class="form-input" 
                  value="${wizardData.userName}" 
                  placeholder="Contoh: Ayah Budi / Budi"
                  required 
                />
              </div>

              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-weight:700;">Mata Uang Utama *</label>
                <select id="wiz-currency" class="form-select">
                  <option value="IDR" ${wizardData.currency === 'IDR' ? 'selected' : ''}>IDR (Rp) - Rupiah Indonesia</option>
                  <option value="USD" ${wizardData.currency === 'USD' ? 'selected' : ''}>USD ($) - US Dollar</option>
                  <option value="MYR" ${wizardData.currency === 'MYR' ? 'selected' : ''}>MYR (RM) - Ringgit Malaysia</option>
                  <option value="SGD" ${wizardData.currency === 'SGD' ? 'selected' : ''}>SGD (S$) - Singapore Dollar</option>
                </select>
              </div>
            </div>
          </div>
        `;

      case 2:
        return `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div style="text-align:center;padding:0.25rem 0;">
              <div style="font-size:2.25rem;margin-bottom:0.375rem;">💳</div>
              <h3 style="font-size:1.15rem;font-weight:800;color:var(--color-slate-900);margin:0 0 0.25rem 0;">
                Atur Akun & Saldo Awal
              </h3>
              <p style="font-size:0.8125rem;color:var(--text-muted);margin:0;line-height:1.4;">
                Masukkan estimasi saldo dana yang Anda miliki saat ini. Anda dapat menambah akun lainnya nanti.
              </p>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.875rem;">
              <!-- Akun Tunai -->
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:var(--radius-md);padding:1rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                  <span style="font-size:1.25rem;">💵</span>
                  <strong style="font-size:0.875rem;color:#166534;">Dompet Tunai (Cash)</strong>
                </div>
                <div class="form-group" style="margin-bottom:0;">
                  <label class="form-label" style="font-size:0.75rem;color:#15803d;">Saldo Tunai Saat Ini</label>
                  <div class="currency-input-wrapper">
                    <span class="currency-prefix">${wizardData.currencySymbol}</span>
                    <input 
                      type="text" 
                      id="wiz-cash-balance" 
                      class="form-input currency-input" 
                      value="${wizardData.cashBalance.toLocaleString('id-ID')}"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <!-- Rekening Bank -->
              <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:var(--radius-md);padding:1rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
                  <span style="font-size:1.25rem;">🏦</span>
                  <strong style="font-size:0.875rem;color:#1e40af;">Rekening Bank Utama</strong>
                </div>
                <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:0.75rem;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label" style="font-size:0.75rem;color:#1d4ed8;">Nama Bank</label>
                    <input 
                      type="text" 
                      id="wiz-bank-name" 
                      class="form-input" 
                      value="${wizardData.bankName}"
                      placeholder="Contoh: Bank BCA / Mandiri"
                    />
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label" style="font-size:0.75rem;color:#1d4ed8;">Saldo Rekening</label>
                    <div class="currency-input-wrapper">
                      <span class="currency-prefix">${wizardData.currencySymbol}</span>
                      <input 
                        type="text" 
                        id="wiz-bank-balance" 
                        class="form-input currency-input" 
                        value="${wizardData.bankBalance.toLocaleString('id-ID')}"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- E-Wallet Tambahan -->
              <div style="background:#faf5ff;border:1px solid #e9d5ff;border-radius:var(--radius-md);padding:1rem;">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span style="font-size:1.25rem;">📱</span>
                    <strong style="font-size:0.875rem;color:#6b21a8;">Dompet Digital / E-Wallet (Opsional)</strong>
                  </div>
                  <label style="display:flex;align-items:center;gap:0.35rem;font-size:0.75rem;font-weight:700;color:#7e22ce;cursor:pointer;">
                    <input type="checkbox" id="wiz-has-ewallet" ${wizardData.hasEwallet ? 'checked' : ''} style="accent-color:#7e22ce;" />
                    Aktifkan
                  </label>
                </div>
                <div id="wiz-ewallet-fields" style="display:${wizardData.hasEwallet ? 'grid' : 'none'};grid-template-columns:1.2fr 1fr;gap:0.75rem;margin-top:0.5rem;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label" style="font-size:0.75rem;color:#7e22ce;">Nama E-Wallet</label>
                    <input 
                      type="text" 
                      id="wiz-ewallet-name" 
                      class="form-input" 
                      value="${wizardData.ewalletName}"
                      placeholder="GoPay / OVO / Dana"
                    />
                  </div>
                  <div class="form-group" style="margin-bottom:0;">
                    <label class="form-label" style="font-size:0.75rem;color:#7e22ce;">Saldo E-Wallet</label>
                    <div class="currency-input-wrapper">
                      <span class="currency-prefix">${wizardData.currencySymbol}</span>
                      <input 
                        type="text" 
                        id="wiz-ewallet-balance" 
                        class="form-input currency-input" 
                        value="${wizardData.ewalletBalance.toLocaleString('id-ID')}"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;

      case 3:
        return `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div style="text-align:center;padding:0.25rem 0;">
              <div style="font-size:2.25rem;margin-bottom:0.375rem;">🎯</div>
              <h3 style="font-size:1.15rem;font-weight:800;color:var(--color-slate-900);margin:0 0 0.25rem 0;">
                Pilih Cara Anda Memulai
              </h3>
              <p style="font-size:0.8125rem;color:var(--text-muted);margin:0;line-height:1.4;">
                Apakah Anda ingin langsung mencatat pembukuan asli, atau mencoba data simulasi terlebih dahulu?
              </p>
            </div>

            <div style="display:flex;flex-direction:column;gap:0.875rem;">
              <!-- Option A: Clean Mode (Recommended) -->
              <label 
                id="card-mode-clean" 
                style="border:2px solid ${wizardData.startMode === 'clean' ? '#059669' : '#e2e8f0'};background:${wizardData.startMode === 'clean' ? '#f0fdf4' : '#ffffff'};border-radius:var(--radius-md);padding:1.125rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.875rem;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:${wizardData.startMode === 'clean' ? '0 4px 12px rgba(5,150,105,0.1)' : 'none'};"
              >
                <input 
                  type="radio" 
                  name="wiz-start-mode" 
                  value="clean" 
                  ${wizardData.startMode === 'clean' ? 'checked' : ''} 
                  style="margin-top:0.25rem;accent-color:#059669;"
                />
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.375rem;margin-bottom:0.25rem;">
                    <strong style="font-size:0.9375rem;color:#065f46;">🟢 Mulai Bersih (0 Transaksi)</strong>
                    <span class="badge" style="background:#ccfbf1;color:#0f766e;font-weight:800;font-size:0.6875rem;padding:0.2rem 0.5rem;border-radius:4px;">
                      PILIHAN UTAMA PELANGGAN
                    </span>
                  </div>
                  <p style="font-size:0.8125rem;color:#15803d;line-height:1.45;margin:0;">
                    Memulai dengan catatan kosong, akun terisi saldo awal di langkah sebelumnya, dan siap mencatat transaksi riil Anda dari awal.
                  </p>
                </div>
              </label>

              <!-- Option B: Demo Mode -->
              <label 
                id="card-mode-demo" 
                style="border:2px solid ${wizardData.startMode === 'demo' ? '#d97706' : '#e2e8f0'};background:${wizardData.startMode === 'demo' ? '#fffbeb' : '#ffffff'};border-radius:var(--radius-md);padding:1.125rem;cursor:pointer;display:flex;align-items:flex-start;gap:0.875rem;transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1);box-shadow:${wizardData.startMode === 'demo' ? '0 4px 12px rgba(217,119,6,0.1)' : 'none'};"
              >
                <input 
                  type="radio" 
                  name="wiz-start-mode" 
                  value="demo" 
                  ${wizardData.startMode === 'demo' ? 'checked' : ''} 
                  style="margin-top:0.25rem;accent-color:#d97706;"
                />
                <div style="flex:1;">
                  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.375rem;margin-bottom:0.25rem;">
                    <strong style="font-size:0.9375rem;color:#92400e;">🔵 Coba Data Demo (Simulasi)</strong>
                    <span class="badge" style="background:#fef3c7;color:#92400e;font-weight:700;font-size:0.6875rem;padding:0.2rem 0.5rem;border-radius:4px;">
                      UNTUK EKSPLORASI FITUR
                    </span>
                  </div>
                  <p style="font-size:0.8125rem;color:#b45309;line-height:1.45;margin:0;">
                    Memuat contoh Keluarga Santoso dengan 18+ transaksi, anggaran, dan target tabungan untuk melihat demo grafik dan laporan lengkap.
                  </p>
                </div>
              </label>
            </div>
          </div>
        `;

      case 4:
        const totalInitialBalance = wizardData.cashBalance + wizardData.bankBalance + (wizardData.hasEwallet ? wizardData.ewalletBalance : 0);
        return `
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div style="text-align:center;padding:0.25rem 0;">
              <div style="font-size:2.5rem;margin-bottom:0.375rem;">🚀</div>
              <h3 style="font-size:1.25rem;font-weight:800;color:var(--color-slate-900);margin:0 0 0.25rem 0;">
                Semua Sudah Siap!
              </h3>
              <p style="font-size:0.8125rem;color:var(--text-muted);margin:0;line-height:1.4;">
                Berikut ringkasan konfigurasi awal aplikasi Dompetku untuk Anda:
              </p>
            </div>

            <div style="background:var(--color-slate-50);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:1.125rem;display:flex;flex-direction:column;gap:0.75rem;">
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:0.5rem;">
                <span style="font-size:0.8125rem;color:var(--text-muted);">Nama Pembukuan:</span>
                <strong style="font-size:0.875rem;color:var(--color-slate-900);">${wizardData.familyName}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:0.5rem;">
                <span style="font-size:0.8125rem;color:var(--text-muted);">Pemilik Utama:</span>
                <strong style="font-size:0.875rem;color:var(--color-slate-900);">${wizardData.userName}</strong>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e2e8f0;padding-bottom:0.5rem;">
                <span style="font-size:0.8125rem;color:var(--text-muted);">Mode Awal:</span>
                <strong style="font-size:0.875rem;color:${wizardData.startMode === 'clean' ? '#059669' : '#d97706'};">
                  ${wizardData.startMode === 'clean' ? '🟢 Bersih (0 Transaksi)' : '🔵 Demo Simulasi'}
                </strong>
              </div>
              ${wizardData.startMode === 'clean' ? `
                <div style="display:flex;justify-content:space-between;align-items:center;padding-top:0.25rem;">
                  <span style="font-size:0.8125rem;color:var(--text-muted);">Total Saldo Awal:</span>
                  <strong style="font-size:1rem;font-weight:800;color:var(--color-slate-900);">
                    ${formatRupiah(totalInitialBalance)}
                  </strong>
                </div>
              ` : ''}
            </div>

            <!-- Jaminan Privasi -->
            <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:var(--radius-md);padding:0.875rem 1rem;display:flex;align-items:center;gap:0.75rem;">
              <span style="font-size:1.5rem;">🛡️</span>
              <div style="font-size:0.75rem;color:#166534;line-height:1.4;">
                <strong>Privasi Terjamin 100%:</strong> Data keuangan Anda tersimpan aman di browser Anda. Kapan pun Anda mau, Anda bisa menghubungkan Google Spreadsheet pribadi di menu Pengaturan.
              </div>
            </div>
          </div>
        `;
    }
  }

  function renderProgressBar() {
    const steps = [
      { num: 1, label: 'Profil' },
      { num: 2, label: 'Saldo Awal' },
      { num: 3, label: 'Mode' },
      { num: 4, label: 'Selesai' }
    ];

    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.25rem;position:relative;">
        <div style="position:absolute;top:50%;left:12%;right:12%;height:3px;background:#e2e8f0;transform:translateY(-50%);z-index:1;"></div>
        <div style="position:absolute;top:50%;left:12%;width:${((currentStep - 1) / (totalSteps - 1)) * 76}%;height:3px;background:#059669;transform:translateY(-50%);z-index:1;transition:width 0.3s ease;"></div>
        
        ${steps.map(s => {
          const isDone = s.num < currentStep;
          const isActive = s.num === currentStep;
          const bg = isDone ? '#059669' : (isActive ? '#059669' : '#ffffff');
          const color = isDone || isActive ? '#ffffff' : '#64748b';
          const border = isDone || isActive ? '2px solid #059669' : '2px solid #cbd5e1';
          return `
            <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;z-index:2;">
              <div style="width:28px;height:28px;border-radius:50%;background:${bg};border:${border};color:${color};display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:800;transition:all 0.2s;">
                ${isDone ? '✓' : s.num}
              </div>
              <span style="font-size:0.6875rem;font-weight:${isActive ? '700' : '500'};color:${isActive ? '#059669' : '#64748b'};">
                ${s.label}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function getFooterButtons() {
    const buttons = [];

    // Skip / Tutup Button
    if (currentStep === 1) {
      buttons.push({
        label: 'Lewati Panduan',
        className: 'btn-secondary',
        onClick: () => {
          localStorage.setItem('dk_onboarding_completed', 'true');
          modal.close();
          toast.info('Panduan dilewati. Anda dapat membukanya kembali di menu Pengaturan.');
        }
      });
    }

    // Back Button
    if (currentStep > 1) {
      buttons.push({
        label: '← Kembali',
        className: 'btn-secondary',
        onClick: () => {
          saveCurrentStepData();
          currentStep--;
          updateModal();
        }
      });
    }

    // Next / Finish Button
    if (currentStep < totalSteps) {
      buttons.push({
        label: 'Lanjutkan →',
        className: 'btn-primary',
        onClick: () => {
          if (validateAndSaveCurrentStep()) {
            currentStep++;
            updateModal();
          }
        }
      });
    } else {
      buttons.push({
        label: '🚀 Mulai Kelola Keuangan',
        className: 'btn-primary',
        onClick: () => {
          finishOnboarding();
        }
      });
    }

    return buttons;
  }

  function saveCurrentStepData() {
    if (currentStep === 1) {
      const famInput = document.getElementById('wiz-family-name');
      const userInput = document.getElementById('wiz-user-name');
      const currSelect = document.getElementById('wiz-currency');
      if (famInput) wizardData.familyName = famInput.value.trim() || wizardData.familyName;
      if (userInput) wizardData.userName = userInput.value.trim() || wizardData.userName;
      if (currSelect) {
        wizardData.currency = currSelect.value;
        wizardData.currencySymbol = currSelect.value === 'IDR' ? 'Rp' : (currSelect.value === 'USD' ? '$' : (currSelect.value === 'MYR' ? 'RM' : 'S$'));
      }
    } else if (currentStep === 2) {
      const cashInput = document.getElementById('wiz-cash-balance');
      const bankNameInput = document.getElementById('wiz-bank-name');
      const bankBalInput = document.getElementById('wiz-bank-balance');
      const ewalletCheck = document.getElementById('wiz-has-ewallet');
      const ewalletNameInput = document.getElementById('wiz-ewallet-name');
      const ewalletBalInput = document.getElementById('wiz-ewallet-balance');

      if (cashInput) wizardData.cashBalance = parseRupiah(cashInput.value);
      if (bankNameInput) wizardData.bankName = bankNameInput.value.trim() || 'Rekening Bank Utama';
      if (bankBalInput) wizardData.bankBalance = parseRupiah(bankBalInput.value);
      if (ewalletCheck) wizardData.hasEwallet = ewalletCheck.checked;
      if (ewalletNameInput) wizardData.ewalletName = ewalletNameInput.value.trim() || 'GoPay / OVO';
      if (ewalletBalInput) wizardData.ewalletBalance = parseRupiah(ewalletBalInput.value);
    } else if (currentStep === 3) {
      const selectedMode = document.querySelector('input[name="wiz-start-mode"]:checked');
      if (selectedMode) wizardData.startMode = selectedMode.value;
    }
  }

  function validateAndSaveCurrentStep() {
    saveCurrentStepData();
    if (currentStep === 1) {
      if (!wizardData.familyName) {
        toast.error('Nama keluarga / buku kas wajib diisi.');
        return false;
      }
      if (!wizardData.userName) {
        toast.error('Nama Anda wajib diisi.');
        return false;
      }
    }
    return true;
  }

  function attachStepEvents() {
    if (currentStep === 2) {
      const cashInput = document.getElementById('wiz-cash-balance');
      if (cashInput) {
        cashInput.oninput = (e) => {
          const raw = parseRupiah(e.target.value);
          e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
        };
      }

      const bankBalInput = document.getElementById('wiz-bank-balance');
      if (bankBalInput) {
        bankBalInput.oninput = (e) => {
          const raw = parseRupiah(e.target.value);
          e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
        };
      }

      const ewalletBalInput = document.getElementById('wiz-ewallet-balance');
      if (ewalletBalInput) {
        ewalletBalInput.oninput = (e) => {
          const raw = parseRupiah(e.target.value);
          e.target.value = raw > 0 ? raw.toLocaleString('id-ID') : '';
        };
      }

      const ewalletCheck = document.getElementById('wiz-has-ewallet');
      const ewalletFields = document.getElementById('wiz-ewallet-fields');
      if (ewalletCheck && ewalletFields) {
        ewalletCheck.onchange = (e) => {
          ewalletFields.style.display = e.target.checked ? 'grid' : 'none';
          wizardData.hasEwallet = e.target.checked;
        };
      }
    }

    if (currentStep === 3) {
      const cardClean = document.getElementById('card-mode-clean');
      const cardDemo = document.getElementById('card-mode-demo');
      const radioClean = document.querySelector('input[value="clean"]');
      const radioDemo = document.querySelector('input[value="demo"]');

      if (cardClean && radioClean) {
        cardClean.onclick = () => {
          radioClean.checked = true;
          wizardData.startMode = 'clean';
          updateCardStyles();
        };
      }

      if (cardDemo && radioDemo) {
        cardDemo.onclick = () => {
          radioDemo.checked = true;
          wizardData.startMode = 'demo';
          updateCardStyles();
        };
      }

      function updateCardStyles() {
        if (cardClean && cardDemo) {
          cardClean.style.borderColor = wizardData.startMode === 'clean' ? '#059669' : '#e2e8f0';
          cardClean.style.background = wizardData.startMode === 'clean' ? '#f0fdf4' : '#ffffff';
          cardDemo.style.borderColor = wizardData.startMode === 'demo' ? '#d97706' : '#e2e8f0';
          cardDemo.style.background = wizardData.startMode === 'demo' ? '#fffbeb' : '#ffffff';
        }
      }
    }
  }

  function finishOnboarding() {
    saveCurrentStepData();

    if (wizardData.startMode === 'clean') {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const words = wizardData.userName.trim().split(/\s+/);
      const avatar = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : wizardData.userName.substring(0, 2).toUpperCase();

      appState.family = {
        id: 'fam-1',
        name: wizardData.familyName,
        currency: wizardData.currency,
        currencySymbol: wizardData.currencySymbol,
        inviteCode: 'KELUARGA-' + now.getFullYear(),
        ownerId: 'user-1',
        createdAt: todayStr
      };

      appState.currentUser = {
        id: 'user-1',
        name: wizardData.userName,
        email: session.email || 'pengguna@email.com',
        role: 'owner',
        roleLabel: 'Super Akses (Pemilik)',
        avatarText: avatar
      };

      appState.members = [
        {
          id: 'user-1',
          name: wizardData.userName,
          role: 'owner',
          roleLabel: 'Super Akses (Pemilik)',
          email: session.email || 'pengguna@email.com',
          phone: '',
          membershipStatus: 'active',
          avatarText: avatar,
          joinedAt: todayStr
        }
      ];

      const initialAccounts = [
        {
          id: 'acc-1',
          familyId: 'fam-1',
          name: 'Kas Dompet Tunai',
          type: 'cash',
          typeLabel: 'Tunai',
          initialBalance: wizardData.cashBalance,
          color: '#10b981',
          icon: 'wallet',
          isArchived: false
        },
        {
          id: 'acc-2',
          familyId: 'fam-1',
          name: wizardData.bankName,
          type: 'bank',
          typeLabel: 'Bank',
          initialBalance: wizardData.bankBalance,
          color: '#3b82f6',
          icon: 'creditCard',
          isArchived: false
        }
      ];

      if (wizardData.hasEwallet) {
        initialAccounts.push({
          id: 'acc-3',
          familyId: 'fam-1',
          name: wizardData.ewalletName,
          type: 'ewallet',
          typeLabel: 'E-Wallet',
          initialBalance: wizardData.ewalletBalance,
          color: '#8b5cf6',
          icon: 'smartphone',
          isArchived: false
        });
      }

      appState.accounts = initialAccounts;
      appState.categories = JSON.parse(JSON.stringify(INITIAL_DATA.categories));
      appState.transactions = [];
      appState.budgets = [];
      appState.goals = [];
      appState.recurringBills = [];
      appState.selectedMonth = now.getMonth() + 1;
      appState.selectedYear = now.getFullYear();
      appState.saveState();

    } else {
      // Demo mode
      appState.resetToInitialData();
    }

    localStorage.setItem('dk_onboarding_completed', 'true');
    appState.notify();
    modal.close();

    toast.success(`🎉 Selamat Datang di Dompetku, ${wizardData.userName}! Aplikasi siap digunakan.`);
  }

  function updateModal() {
    modal.open({
      title: `✨ Panduan Setup Awal (${currentStep}/${totalSteps})`,
      content: `
        <div>
          ${renderProgressBar()}
          ${renderWizardStep()}
        </div>
      `,
      footerButtons: getFooterButtons(),
      maxWidth: '560px'
    });
    attachStepEvents();

    // Pastikan jika ditutup via tombol X atau backdrop, flag selesai tetap tersimpan
    const closeBtn = document.getElementById('modal-close-action');
    if (closeBtn) {
      const origClose = closeBtn.onclick;
      closeBtn.onclick = (e) => {
        localStorage.setItem('dk_onboarding_completed', 'true');
        if (typeof origClose === 'function') origClose(e);
        else modal.close();
      };
    }
  }

  // Launch initial step
  updateModal();
}
