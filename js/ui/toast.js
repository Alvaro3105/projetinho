import { h } from '../core/dom.js';
import { icon } from './icons.js';

let region;

export function toast(message, { error = false } = {}) {
  if (!region) {
    region = h('div', { class: 'toasts', role: 'status', 'aria-live': 'polite' });
    document.body.append(region);
  }
  const el = h('div', { class: `toast${error ? ' error' : ''}` }, icon(error ? 'alert' : 'check'), h('span', {}, message));
  region.append(el);
  setTimeout(() => el.remove(), error ? 6000 : 3200);
}
