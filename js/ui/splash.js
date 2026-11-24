// Abertura discreta: uma vez por sessão, ~1,9 s, nunca bloqueia cliques e não aparece para
// quem pediu redução de movimento (no sistema ou em Configurações › Aparência).
// Os anéis se desenham e a marca aparece; não há "carregando" falso nem barra de progresso inventada.
import { h } from '../core/dom.js';
import { BRAND, brandMark } from '../core/brand.js';

export function bootSplash({ reduced = false } = {}) {
  try {
    if (reduced || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('jarvis:booted')) return;
    sessionStorage.setItem('jarvis:booted', '1');
  } catch { return; }
  const rings = `<svg class="boot-rings" viewBox="0 0 132 132" aria-hidden="true" focusable="false">
  <circle class="br2" cx="66" cy="66" r="41" transform="rotate(-90 66 66)"/>
  <circle class="br1" cx="66" cy="66" r="54" transform="rotate(-90 66 66)"/>
  <circle class="br3" cx="66" cy="66" r="62" transform="rotate(-40 66 66)"/>
</svg>`;
  const el = h('div', { class: 'boot', 'aria-hidden': 'true' },
    h('div', { class: 'boot-inner' },
      h('div', { style: { position: 'relative', display: 'grid', placeItems: 'center' } },
        h('span', { html: rings, style: { display: 'contents' } }),
        h('span', { html: brandMark({ size: 56, id: 'jvboot', animated: true }), style: { position: 'absolute', display: 'grid' } })),
      h('span', { class: 'boot-name' }, BRAND.name),
      h('span', { class: 'boot-sub' }, BRAND.concept)));
  document.body.append(el);
  setTimeout(() => el.remove(), 2100);
}
