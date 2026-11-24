// Avisos curtos (toasts). Entram deslizando, mostram o tempo restante numa linha fina e saem com
// animação. Erros usam role="alert" (lidos na hora pelo leitor de tela); os demais, região "polite".
import { h } from '../core/dom.js';
import { icon } from './icons.js';
import { play } from './sound.js';

let region;
let alertRegion;

function regions() {
  if (!region) {
    region = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    alertRegion = h('div', { class: 'toasts toasts-alert', role: 'alert', 'aria-live': 'assertive' });
    document.body.append(region, alertRegion);
  }
}

export function toast(message, { error = false } = {}) {
  regions();
  const ms = error ? 6500 : 3400;
  const el = h('div', { class: `toast${error ? ' error' : ''}`, style: { '--life': `${ms}ms` } },
    icon(error ? 'alert' : 'check'), h('span', {}, message),
    h('i', { class: 'toast-life', 'aria-hidden': 'true' }));
  // Erros ficam junto dos demais na tela, mas são anunciados pela região de alerta.
  (error ? alertRegion : region).append(el);
  play(error ? 'erro' : 'salvar');
  const leave = () => {
    if (!el.isConnected) return;
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 220);
  };
  setTimeout(leave, ms);
  el.addEventListener('click', leave);
}
