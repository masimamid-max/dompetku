/**
 * Theme Manager & Modal Component
 * Millennial, Fresh & Eye-Catching Color Theme Switcher
 */
import { modal } from './modal.js';
import { toast } from './toast.js';

export const THEMES = [
  {
    id: 'emerald',
    name: 'Emerald Mint',
    subtitle: 'Harmonis & Segar Alami',
    description: 'Warna hijau zamrud alami melambangkan pertumbuhan dan keharmonisan finansial keluarga.',
    badge: 'Pilihan Asli (Default)',
    primaryColor: '#059669',
    secondaryColor: '#10b981',
    lightBg: '#ecfdf5',
    emoji: '🌿'
  },
  {
    id: 'indigo',
    name: 'Cyber Indigo',
    subtitle: 'Milenial Tech & Neon',
    description: 'Gaya visual modern tech bernuansa neon indigo yang energik, cerdas, dan futuristik.',
    badge: 'Terpopuler Milenial ⭐',
    primaryColor: '#4f46e5',
    secondaryColor: '#6366f1',
    lightBg: '#eef2ff',
    emoji: '⚡'
  },
  {
    id: 'ocean',
    name: 'Oceanic Cyan',
    subtitle: 'Sejuk, Santai & Bersih',
    description: 'Nuansa biru laut dan cyan cerah khas neo-bank masa kini, memberikan ketenangan saat budgeting.',
    badge: 'Estetik Digital 🌊',
    primaryColor: '#0891b2',
    secondaryColor: '#06b6d4',
    lightBg: '#ecfeff',
    emoji: '🌊'
  },
  {
    id: 'sunset',
    name: 'Sunset Coral',
    subtitle: 'Hangat, Ceria & Berenergi',
    description: 'Gradasi jingga coral senja yang penuh kehangatan, optimisme, dan semangat produktif.',
    badge: 'Vibe Hangat 🌅',
    primaryColor: '#ea580c',
    secondaryColor: '#f97316',
    lightBg: '#fff7ed',
    emoji: '🌅'
  },
  {
    id: 'sakura',
    name: 'Berry Sakura',
    subtitle: 'Manis, Anggun & Chic',
    description: 'Sentuhan warna rose & berry yang manis dan stylish untuk suasana pencatatan yang menyenangkan.',
    badge: 'Chic & Manis 🌸',
    primaryColor: '#be185d',
    secondaryColor: '#ec4899',
    lightBg: '#fdf2f8',
    emoji: '🌸'
  },
  {
    id: 'purple',
    name: 'Royal Velvet',
    subtitle: 'Mewah & Eksklusif',
    description: 'Nuansa ungu ultraviolet yang elegan dan prestisius, menghadirkan estetika premium.',
    badge: 'Elegan Mewah 💜',
    primaryColor: '#9333ea',
    secondaryColor: '#a855f7',
    lightBg: '#faf5ff',
    emoji: '💜'
  },
  {
    id: 'slate',
    name: 'Midnight Slate',
    subtitle: 'Sleek Minimalist Cyber',
    description: 'Desain monokromatik gelap minimalis dengan kontras tinggi untuk pecinta estetika simpel.',
    badge: 'Minimalis Elegan 🖤',
    primaryColor: '#334155',
    secondaryColor: '#64748b',
    lightBg: '#f1f5f9',
    emoji: '🖤'
  }
];

export function getCurrentTheme() {
  try {
    return localStorage.getItem('dk_theme') || 'emerald';
  } catch (e) {
    return 'emerald';
  }
}

export function applyTheme(themeId, showToast = true) {
  const selectedTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  document.documentElement.setAttribute('data-theme', selectedTheme.id);
  
  try {
    localStorage.setItem('dk_theme', selectedTheme.id);
  } catch (e) {}

  // Update theme-color meta tag for mobile status bar
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', selectedTheme.primaryColor);
  }

  // Update active pill button in header if present
  const headerThemePill = document.getElementById('btn-header-theme');
  if (headerThemePill) {
    const iconSpan = headerThemePill.querySelector('.theme-trigger-icon');
    if (iconSpan) iconSpan.textContent = selectedTheme.emoji;
  }

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('dk:theme-changed', { detail: selectedTheme }));

  if (showToast) {
    toast.success(`${selectedTheme.emoji} Tema visual diubah ke <strong>${selectedTheme.name}</strong>! Tampilan jadi lebih segar & asik.`);
  }
}

export function openThemeModal() {
  const currentThemeId = getCurrentTheme();

  const content = `
    <div class="theme-modal-container">
      <div style="text-align:center;margin-bottom:1.5rem;">
        <span style="display:inline-flex;align-items:center;gap:0.35rem;padding:0.35rem 0.85rem;background:var(--color-primary-50);color:var(--color-primary-700);border:1px solid var(--color-primary-200);border-radius:9999px;font-size:0.75rem;font-weight:800;letter-spacing:0.04em;text-transform:uppercase;margin-bottom:0.6rem;">
          ✨ Personalisasi Tampilan Milenial
        </span>
        <h3 style="font-size:1.35rem;font-weight:800;color:var(--color-slate-900);margin:0;letter-spacing:-0.02em;">Pilih Tema Warna Favorit Anda</h3>
        <p style="font-size:0.875rem;color:var(--text-muted);margin-top:0.35rem;line-height:1.4;">
          Ubah suasana Dompet Keluarga sesuka Anda. Klik salah satu tema di bawah untuk pratinjau langsung secara seketika!
        </p>
      </div>

      <div class="theme-swatch-grid">
        ${THEMES.map(theme => {
          const isSelected = theme.id === currentThemeId;
          return `
            <div class="theme-picker-card ${isSelected ? 'active' : ''}" data-theme-id="${theme.id}">
              <div class="theme-card-top">
                <div class="theme-color-disc" style="background:linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});">
                  <span class="theme-emoji">${theme.emoji}</span>
                </div>
                <div class="theme-meta">
                  <div class="theme-name">${theme.name}</div>
                  <div class="theme-subtitle">${theme.subtitle}</div>
                </div>
                <div class="theme-check-mark ${isSelected ? 'checked' : ''}">
                  ${isSelected ? '✓' : ''}
                </div>
              </div>
              <p class="theme-description">${theme.description}</p>
              <div class="theme-card-bottom">
                <span class="theme-pill-tag" style="background:${theme.lightBg};color:${theme.primaryColor};border:1px solid ${theme.primaryColor}30;">
                  ${theme.badge}
                </span>
                <div class="theme-color-palette-bar">
                  <span style="background:${theme.primaryColor};"></span>
                  <span style="background:${theme.secondaryColor};"></span>
                  <span style="background:${theme.lightBg};border:1px solid ${theme.primaryColor};"></span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top:1.5rem;display:flex;justify-content:center;gap:0.75rem;">
        <button class="btn btn-primary" id="btn-close-theme-modal" style="min-width:180px;border-radius:9999px;font-weight:700;">
          ✨ Selesai & Simpan Pilihan
        </button>
      </div>
    </div>
  `;

  modal.open({
    title: '🎨 Palet Warna & Tema Aplikasi',
    content: content,
    maxWidth: '680px'
  });

  // Attach card click handlers for real-time live preview
  document.querySelectorAll('.theme-picker-card').forEach(card => {
    card.onclick = () => {
      const themeId = card.getAttribute('data-theme-id');
      applyTheme(themeId, true);

      // Update checkmarks visually
      document.querySelectorAll('.theme-picker-card').forEach(c => {
        c.classList.remove('active');
        const chk = c.querySelector('.theme-check-mark');
        if (chk) {
          chk.classList.remove('checked');
          chk.innerHTML = '';
        }
      });
      card.classList.add('active');
      const activeChk = card.querySelector('.theme-check-mark');
      if (activeChk) {
        activeChk.classList.add('checked');
        activeChk.innerHTML = '✓';
      }
    };
  });

  const closeBtn = document.getElementById('btn-close-theme-modal');
  if (closeBtn) {
    closeBtn.onclick = () => modal.close();
  }
}

// Global expose
if (typeof window !== 'undefined') {
  window.ThemeManager = {
    THEMES,
    getCurrentTheme,
    applyTheme,
    openThemeModal
  };
}
