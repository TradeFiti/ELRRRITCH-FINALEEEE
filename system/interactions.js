/* ============================================
   ELTRICH PRIME — Interactions
   Tab switching, sheets, theme, balance toggle
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Tab Switching ---- */
  document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const group = tab.closest('[data-tab-group]') || tab.parentElement;
      const targetId = tab.dataset.tab;

      // Deactivate siblings
      group.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('tab-item--active'));
      tab.classList.add('tab-item--active');

      // Find and switch content panels
      const container = group.closest('.tab-container') || group.parentElement;
      container.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
        if (content.dataset.tabContent === targetId) {
          content.classList.add('active');
        }
      });
    });
  });

  /* ---- Bottom Sheet Toggle ---- */
  document.querySelectorAll('[data-sheet-trigger]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const sheetId = trigger.dataset.sheetTrigger;
      const sheet = document.querySelector(`[data-sheet="${sheetId}"]`);
      if (sheet) sheet.classList.add('active');
    });
  });

  document.querySelectorAll('.sheet-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });
  });

  document.querySelectorAll('[data-sheet-close]').forEach(close => {
    close.addEventListener('click', () => {
      const overlay = close.closest('.sheet-overlay');
      if (overlay) overlay.classList.remove('active');
    });
  });

  /* ---- Theme Toggle ---- */
  document.querySelectorAll('[data-theme-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme') || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', next);
      localStorage.setItem('eltrich-theme', next);
    });
  });

  // Restore saved theme
  const savedTheme = localStorage.getItem('eltrich-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  /* ---- Balance Hide/Show Toggle ---- */
  document.querySelectorAll('[data-balance-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const container = toggle.closest('[data-balance-container]') || document;
      const balances = container.querySelectorAll('[data-balance]');
      const isHidden = toggle.dataset.balanceHidden === 'true';

      balances.forEach(bal => {
        if (isHidden) {
          bal.textContent = bal.dataset.balance;
        } else {
          bal.dataset.balance = bal.textContent;
          bal.textContent = '••••••';
        }
      });

      toggle.dataset.balanceHidden = isHidden ? 'false' : 'true';

      // Update toggle icon
      const icon = toggle.querySelector('.balance-icon');
      if (icon) {
        icon.textContent = isHidden ? '👁' : '👁‍🗨';
      }
    });
  });

  /* ---- Sidebar Toggle ---- */
  document.querySelectorAll('[data-sidebar-toggle]').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const sidebar = document.querySelector('.desktop-sidebar');
      if (sidebar) {
        sidebar.classList.toggle('collapsed');
        sidebar.style.display = sidebar.classList.contains('collapsed') ? 'none' : '';
      }
    });
  });

  /* ---- Mobile Drawer ---- */
  document.querySelectorAll('[data-mobile-drawer]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const drawer = document.querySelector('.mobile-drawer');
      if (drawer) drawer.classList.toggle('active');
    });
  });

  /* ---- Accordion / Expandable Nav ---- */
  document.querySelectorAll('[data-expand]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.dataset.expand;
      const target = document.querySelector(`[data-expandable="${targetId}"]`);
      if (target) {
        const isOpen = target.style.display !== 'none';
        target.style.display = isOpen ? 'none' : 'block';
        trigger.classList.toggle('expanded', !isOpen);
      }
    });
  });

});
