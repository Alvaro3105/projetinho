// Efeitos de interface com custo baixo. Tudo é instalado uma única vez (sem listeners por tela).
// - Luz que segue o ponteiro em superfícies marcadas com .spot (só atualiza variáveis CSS, 1× por quadro).
// - Transição de tema com revelação circular a partir do ponto clicado (View Transitions, quando houver).
// - Relógio 24 h para elementos [data-clock] (um único intervalo para a página inteira).
// Com "reduzir movimento" ou "efeitos essenciais", os efeitos de luz e a transição de tema ficam desligados.

let lastPointer = null;

export function motionReduced() {
  const root = document.documentElement;
  return root.getAttribute('data-motion') === 'reduced' || !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
function fxLite() { return document.documentElement.getAttribute('data-fx') === 'essenciais'; }

export function installFx() {
  let raf = 0;
  let target = null;
  let x = 0;
  let y = 0;
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse' || fxLite()) return;
    const el = e.target.closest?.('.spot');
    if (!el) return;
    target = el; x = e.clientX; y = e.clientY;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      if (!target?.isConnected) return;
      const r = target.getBoundingClientRect();
      target.style.setProperty('--mx', `${Math.round(x - r.left)}px`);
      target.style.setProperty('--my', `${Math.round(y - r.top)}px`);
    });
  }, { passive: true });
  document.addEventListener('pointerdown', (e) => { lastPointer = { x: e.clientX, y: e.clientY }; }, { passive: true, capture: true });
  tickClock();
  setInterval(tickClock, 20000);
}

/** Aplica a troca de tema com revelação circular (quando suportado e permitido). */
export function themeTransition(apply) {
  if (!document.startViewTransition || motionReduced() || fxLite() || document.visibilityState !== 'visible') { apply(); return; }
  const root = document.documentElement;
  const p = lastPointer || { x: window.innerWidth - 80, y: 28 };
  root.style.setProperty('--vt-x', `${Math.round(p.x)}px`);
  root.style.setProperty('--vt-y', `${Math.round(p.y)}px`);
  try { document.startViewTransition(apply); } catch { apply(); }
}

const pad = (n) => String(n).padStart(2, '0');
function tickClock() {
  const d = new Date();
  const text = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  for (const el of document.querySelectorAll('[data-clock]')) if (el.textContent !== text) el.textContent = text;
}
export function clockText() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
