// Modal acessível: foco preso, Esc fecha, foco volta ao elemento de origem.
// Substitui confirm()/prompt(), que não funcionam em todos os ambientes.
import { h, clear } from '../core/dom.js';
import { icon } from './icons.js';

let open = null;

export function openModal({ title, body, footer, size = '', onClose, labelledBy } = {}) {
  closeModal();
  const previous = document.activeElement;
  const titleId = labelledBy || `m-${Math.random().toString(36).slice(2, 8)}`;
  const closeBtn = h('button', { type: 'button', class: 'btn ghost icon', 'aria-label': 'Fechar', onclick: () => closeModal() }, icon('x'));
  const dialog = h('div', { class: `modal ${size}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    h('div', { class: 'modal-head' }, h('h2', { id: titleId }, title), closeBtn),
    h('div', { class: 'modal-body' }, body),
    footer ? h('div', { class: 'modal-foot' }, footer) : null);
  const backdrop = h('div', { class: 'modal-backdrop', onmousedown: (e) => { if (e.target === backdrop) closeModal(); } }, dialog);

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
    if (e.key !== 'Tab') return;
    const focusables = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((el) => !el.disabled && el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  document.addEventListener('keydown', onKey);
  document.body.append(backdrop);
  document.querySelector('.app')?.setAttribute('aria-hidden', 'true');
  open = { backdrop, onKey, previous, onClose };
  const firstField = dialog.querySelector('input, select, textarea') || closeBtn;
  requestAnimationFrame(() => firstField.focus());
  return { dialog, close: closeModal };
}

export function closeModal() {
  if (!open) return;
  const { backdrop, onKey, previous, onClose } = open;
  open = null;
  document.removeEventListener('keydown', onKey);
  backdrop.remove();
  document.querySelector('.app')?.removeAttribute('aria-hidden');
  if (previous && previous.isConnected) previous.focus();
  if (onClose) onClose();
}

/** Confirmação dentro da página. Resolve true/false. */
export function confirmDialog({ title = 'Confirmar', message, confirmLabel = 'Confirmar', danger = false }) {
  return new Promise((resolve) => {
    let answered = false;
    const done = (v) => { answered = true; resolve(v); closeModal(); };
    openModal({
      title, size: 'sm',
      body: h('p', { class: 'muted' }, message),
      footer: [
        h('button', { type: 'button', class: 'btn ghost', onclick: () => done(false) }, 'Cancelar'),
        h('button', { type: 'button', class: `btn ${danger ? 'danger' : 'primary'}`, onclick: () => done(true) }, confirmLabel),
      ],
      onClose: () => { if (!answered) resolve(false); },
    });
  });
}

export function replaceBody(dialog, node) {
  const body = dialog.querySelector('.modal-body');
  clear(body).append(node);
}
