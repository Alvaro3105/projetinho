// Animação discreta de inicialização: uma vez por sessão, ~1,5 s, nunca bloqueia cliques
// e não aparece para quem pediu redução de movimento.
import { h } from '../core/dom.js';
import { BRAND, brandMark } from '../core/brand.js';

export function bootSplash() {
  try {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('jarvis:booted')) return;
    sessionStorage.setItem('jarvis:booted', '1');
  } catch { return; }
  const el = h('div', { class: 'boot', 'aria-hidden': 'true' },
    h('div', { class: 'boot-inner' },
      h('span', { html: brandMark({ size: 72, id: 'jvboot', animated: true }), style: { display: 'contents' } }),
      h('span', { class: 'boot-name' }, BRAND.name),
      h('span', { class: 'boot-sub' }, BRAND.concept)));
  document.body.append(el);
  setTimeout(() => el.remove(), 1700);
}
