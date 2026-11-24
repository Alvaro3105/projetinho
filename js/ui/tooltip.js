// Dica flutuante para elementos com [data-tip]. Posição fixa calculada no momento, para não ser
// cortada por containers com overflow (ex.: barra lateral recolhida). Complementa o nome
// acessível (aria-label), não o substitui: a dica é aria-hidden.
let tip = null;
let anchor = null;

function show(el) {
  const text = el.getAttribute('data-tip');
  if (!text || el.getAttribute('aria-expanded') === 'true') { hide(); return; }
  // data-tip-auto: só mostra a dica quando o rótulo visível do próprio elemento está oculto
  // (ex.: menu lateral recolhido ou em trilho no tablet).
  if (el.hasAttribute('data-tip-auto')) {
    const label = el.querySelector('.nav-text');
    if (label && getComputedStyle(label).display !== 'none') { hide(); return; }
  }
  if (!tip) { tip = document.createElement('div'); tip.className = 'tooltip'; tip.setAttribute('aria-hidden', 'true'); document.body.append(tip); }
  anchor = el;
  tip.textContent = text;
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  const t = tip.getBoundingClientRect();
  let x; let y;
  if (el.getAttribute('data-tip-side') === 'right') { x = r.right + 10; y = r.top + r.height / 2 - t.height / 2; }
  else { x = r.left + r.width / 2 - t.width / 2; y = r.bottom + 8; }
  x = Math.max(8, Math.min(x, window.innerWidth - t.width - 8));
  y = Math.max(8, Math.min(y, window.innerHeight - t.height - 8));
  tip.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
}
function hide() { if (tip) tip.hidden = true; anchor = null; }

export function installTooltips() {
  if (!window.matchMedia?.('(hover: hover)').matches) return;
  document.addEventListener('pointerover', (e) => { const el = e.target.closest?.('[data-tip]'); if (el) show(el); else if (anchor) hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest?.('[data-tip]'); if (el && el.matches(':focus-visible')) show(el); else hide(); });
  document.addEventListener('focusout', hide);
  document.addEventListener('pointerdown', hide);
  window.addEventListener('scroll', hide, { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
}
