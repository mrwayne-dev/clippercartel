/**
 * anti-cloning.js — soft client-side deterrents.
 *
 * No defence here is unbreakable. The real locks are server-side:
 * minified JS, CSP, hotlink block, image watermarks, source lockdown.
 * This file just makes casual drive-by cloning annoying enough that
 * most won't bother.
 *
 * Guards:
 *   - block right-click context menu
 *   - block Ctrl+U / Ctrl+S / Ctrl+Shift+I / Cmd equivalents / F12
 *   - detect devtools open (window dimension diff) and log via beacon
 *
 * Explicitly NOT doing:
 *   - full-page selection disable (breaks screen readers)
 *   - visual takeover modal when devtools open (hostile UX)
 *   - debugger traps (slaughters perf, trivially bypassed)
 */

const block = (e) => { e.preventDefault(); e.stopPropagation(); return false; };

const isBlockedKey = (e) => {
  const k = (e.key || '').toLowerCase();
  if (k === 'f12') return true;
  if ((e.ctrlKey || e.metaKey) && (k === 'u' || k === 's')) return true;
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) return true;
  return false;
};

const reportDevtools = () => {
  // Fire-and-forget beacon. Server can decide what (if anything) to do.
  try { navigator.sendBeacon?.('/api/log/devtools', JSON.stringify({ ts: Date.now(), path: location.pathname })); }
  catch { /* beacon unavailable */ }
};

export const installGuards = () => {
  // 1. right-click
  document.addEventListener('contextmenu', block, { capture: true });

  // 2. blocked keys
  document.addEventListener('keydown', (e) => { if (isBlockedKey(e)) block(e); }, { capture: true });

  // 3. drag-save on images
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) block(e);
  }, { capture: true });

  // 4. devtools dimension-diff detection — fires once per session.
  let reported = false;
  const threshold = 160;
  const check = () => {
    const widthDiff  = window.outerWidth  - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    if (!reported && (widthDiff > threshold || heightDiff > threshold)) {
      reported = true;
      reportDevtools();
    }
  };
  setInterval(check, 1500);
};
