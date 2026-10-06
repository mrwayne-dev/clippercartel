/**
 * admin.js — small helpers for the admin area.
 *
 * Vanilla JS, loaded as a plain script (not a module) at the end of
 * every admin page. Keeps the admin layer independent of the public
 * SPA's module graph.
 *
 * Public API:
 *   - window.CCAdmin.toast(message, type?)   // 'info' | 'ok' | 'error'
 *   - window.CCAdmin.loading(button, on?)    // toggle a loader on a <button>
 *
 * Auto-wires:
 *   - [data-password-toggle] fields → eye icon toggle
 *   - [data-ajax-form]            → fetch submit + toast + redirect
 *   - .admin-menu-btn             → mobile nav
 *   - .flash-queue                → convert server flashes into toasts
 */

(() => {
  'use strict';

  /* ------------------------------------------------------------
   *  Toast — bottom-centre pill, 3.5s auto-dismiss.
   * ---------------------------------------------------------- */
  const toast = (message, type = 'info') => {
    const el = document.createElement('div');
    el.className = `admin-toast admin-toast--${type}`;
    el.setAttribute('role', type === 'error' ? 'alert' : 'status');
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('is-visible'));
    const timer = setTimeout(dismiss, 3500);
    el.addEventListener('click', dismiss);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('is-visible');
      setTimeout(() => el.remove(), 300);
    }
  };

  /* ------------------------------------------------------------
   *  Loader — swap a button's content for a spinner while disabled.
   * ---------------------------------------------------------- */
  const loading = (btn, on = true) => {
    if (!btn) return;
    if (on) {
      btn.dataset.originalLabel = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span class="sr-only">Loading…</span>';
    } else {
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (btn.dataset.originalLabel) {
        btn.innerHTML = btn.dataset.originalLabel;
        delete btn.dataset.originalLabel;
      }
    }
  };

  /* ------------------------------------------------------------
   *  Password visibility toggle.
   *  Markup: <div data-password-toggle><input type="password">...</div>
   * ---------------------------------------------------------- */
  const wirePasswordToggles = () => {
    const EYE_OPEN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
    const EYE_SHUT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a19.77 19.77 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.77 19.77 0 0 1-2.16 3.19"/><path d="M14.12 14.12A3 3 0 1 1 9.88 9.88"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';

    document.querySelectorAll('[data-password-toggle]').forEach((wrap) => {
      const input = wrap.querySelector('input[type="password"], input[type="text"]');
      if (!input || wrap.querySelector('.password-toggle__btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'password-toggle__btn';
      btn.innerHTML = EYE_OPEN;
      btn.setAttribute('aria-label', 'Show password');
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => {
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.innerHTML = show ? EYE_SHUT : EYE_OPEN;
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        btn.setAttribute('aria-pressed', String(show));
        // Keep focus + cursor position on the input.
        const pos = input.value.length;
        input.focus();
        try { input.setSelectionRange(pos, pos); } catch (_) { /* type=number etc. */ }
      });
      wrap.appendChild(btn);
    });
  };

  /* ------------------------------------------------------------
   *  AJAX form submit — toast on failure, redirect on success.
   *  Markup: <form data-ajax-form data-redirect="/admin">…</form>
   *  Server response: { ok: true, next?: '/admin' } or { ok: false, message: '…' }
   * ---------------------------------------------------------- */
  const wireAjaxForms = () => {
    document.querySelectorAll('form[data-ajax-form]').forEach((form) => {
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        loading(btn, true);
        const data = new FormData(form);
        const payload = {};
        data.forEach((v, k) => { payload[k] = typeof v === 'string' ? v : ''; });
        try {
          const res = await fetch(form.action || window.location.pathname, {
            method: form.method || 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
          });
          let body = {};
          try { body = await res.json(); } catch (_) { /* non-JSON */ }
          if (res.ok && body.ok !== false) {
            const next = body.next || form.dataset.redirect;
            if (next) {
              window.location.assign(next);
              return;
            }
            toast(body.message || 'Saved.', 'ok');
            loading(btn, false);
          } else {
            toast(body.message || `Request failed (${res.status}).`, 'error');
            loading(btn, false);
          }
        } catch (err) {
          toast('Network error — please try again.', 'error');
          loading(btn, false);
        }
      });
    });
  };

  /* ------------------------------------------------------------
   *  Mobile menu — toggle `html[data-menu-open]`.
   *  Simpler than hunting a positioning context; CSS does the rest.
   * ---------------------------------------------------------- */
  const wireMenu = () => {
    const btn = document.querySelector('.admin-menu-btn');
    const nav = document.getElementById('admin-nav');
    if (!btn || !nav) return;

    const close = () => {
      document.documentElement.removeAttribute('data-menu-open');
      btn.setAttribute('aria-expanded', 'false');
    };
    const open = () => {
      document.documentElement.setAttribute('data-menu-open', '');
      btn.setAttribute('aria-expanded', 'true');
    };

    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      document.documentElement.hasAttribute('data-menu-open') ? close() : open();
    });

    // Close on nav-link click (so navigating feels right on mobile).
    nav.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('click', () => setTimeout(close, 50));
    });

    // Close on escape, on outside click, on resize to desktop.
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    document.addEventListener('click', (e) => {
      if (!document.documentElement.hasAttribute('data-menu-open')) return;
      if (nav.contains(e.target) || btn.contains(e.target)) return;
      close();
    });
    const mq = window.matchMedia('(min-width: 761px)');
    mq.addEventListener('change', (e) => { if (e.matches) close(); });
  };

  /* ------------------------------------------------------------
   *  Row-click navigation — <tr data-href="/path"> treats the row
   *  as a link. Buttons / forms / anchors inside the row still work
   *  because click events bubble, and we skip the nav when the
   *  original target is interactive. Mod-click opens in a new tab.
   * ---------------------------------------------------------- */
  const wireRowLinks = () => {
    document.querySelectorAll('tr[data-href]').forEach((row) => {
      row.addEventListener('click', (ev) => {
        if (ev.target.closest('a, button, input, label, select, textarea, form')) return;
        const href = row.dataset.href;
        if (!href) return;
        if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) {
          window.open(href, '_blank', 'noopener');
        } else {
          window.location.assign(href);
        }
      });
    });
  };

  /* ------------------------------------------------------------
   *  Flash queue — server renders:
   *    <ul class="flash-queue" hidden>
   *      <li data-type="ok">Saved</li>
   *    </ul>
   *  …and we convert each to a toast on load.
   * ---------------------------------------------------------- */
  const consumeFlashQueue = () => {
    document.querySelectorAll('.flash-queue').forEach((q) => {
      q.querySelectorAll('li').forEach((li) => {
        toast(li.textContent || '', li.dataset.type || 'info');
      });
      q.remove();
    });
  };

  /* ------------------------------------------------------------ */
  const boot = () => {
    wirePasswordToggles();
    wireAjaxForms();
    wireMenu();
    wireRowLinks();
    consumeFlashQueue();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  window.CCAdmin = { toast, loading };
})();
