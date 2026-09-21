/**
 * Toast Notification Component
 */
import { Icons } from './icons.js';

class ToastManager {
  constructor() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  show(message, type = 'success', duration = 3200) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = Icons.checkCircle(20);
    if (type === 'error') icon = Icons.alertTriangle(20);
    if (type === 'info') icon = Icons.pieChart(20);

    toast.innerHTML = `
      <div style="color: ${type === 'success' ? 'var(--color-primary-600)' : type === 'error' ? 'var(--color-expense)' : 'var(--color-transfer)'}; display:flex; align-items:center;">
        ${icon}
      </div>
      <div style="flex:1;">${message}</div>
    `;

    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  success(msg) {
    this.show(msg, 'success');
  }

  error(msg) {
    this.show(msg, 'error');
  }

  info(msg) {
    this.show(msg, 'info');
  }
}

export const toast = new ToastManager();
