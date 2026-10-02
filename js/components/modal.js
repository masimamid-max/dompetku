/**
 * Reusable Modal & Confirmation Dialog Component
 */
import { Icons } from './icons.js';

class ModalManager {
  open({ title, content, footerButtons = [], maxWidth = '520px' }) {
    this.close(); // Close any existing modal

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'active-modal-backdrop';

    const container = document.createElement('div');
    container.className = 'modal-container';
    container.style.maxWidth = maxWidth;

    // Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
      <div class="modal-title">${title}</div>
      <button class="modal-close-btn" id="modal-close-action" title="Tutup">
        ${Icons.x(20)}
      </button>
    `;

    // Body
    const body = document.createElement('div');
    body.className = 'modal-body';
    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    // Footer
    let footer = null;
    if (footerButtons && footerButtons.length > 0) {
      footer = document.createElement('div');
      footer.className = 'modal-footer';
      footerButtons.forEach(btnConfig => {
        const btn = document.createElement('button');
        btn.className = `btn ${btnConfig.className || 'btn-secondary'}`;
        btn.innerText = btnConfig.label || 'OK';
        btn.onclick = (e) => {
          if (btnConfig.onClick) {
            btnConfig.onClick(e, this);
          } else {
            this.close();
          }
        };
        footer.appendChild(btn);
      });
    }

    container.appendChild(header);
    container.appendChild(body);
    if (footer) container.appendChild(footer);

    backdrop.appendChild(container);
    document.body.appendChild(backdrop);

    // Event listeners for close
    const closeBtn = document.getElementById('modal-close-action');
    if (closeBtn) {
      closeBtn.onclick = () => this.close();
    }
    backdrop.onclick = (e) => {
      if (e.target === backdrop) this.close();
    };

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  }

  close() {
    const active = document.getElementById('active-modal-backdrop');
    if (active && active.parentNode) {
      active.parentNode.removeChild(active);
    }
    document.body.style.overflow = '';
  }

  confirm({ title = 'Konfirmasi Tindakan', message, confirmText = 'Ya, Lanjutkan', confirmType = 'btn-danger', onConfirm }) {
    this.open({
      title,
      content: `
        <div style="display:flex;align-items:flex-start;gap:1rem;padding:0.5rem 0;">
          <div style="color:${confirmType === 'btn-danger' ? 'var(--color-expense)' : 'var(--color-warning)'};flex-shrink:0;">
            ${Icons.alertTriangle(28)}
          </div>
          <div>
            <p style="font-size:0.9375rem;color:var(--color-slate-800);line-height:1.5;">${message}</p>
          </div>
        </div>
      `,
      footerButtons: [
        {
          label: 'Batal',
          className: 'btn-secondary',
          onClick: () => this.close()
        },
        {
          label: confirmText,
          className: confirmType,
          onClick: () => {
            this.close();
            if (onConfirm) onConfirm();
          }
        }
      ]
    });
  }
}

export const modal = new ModalManager();
