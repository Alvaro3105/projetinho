// Popover ancorado a um botão (notificações, perfil). Fecha com Esc, clique fora ou ao escolher
// um item; devolve o foco ao botão. O botão mantém aria-expanded sincronizado.
import { h } from '../core/dom.js';

let current = null;

export function closePopover({ restoreFocus = true } = {}) {
  if (!current) return;
  const { el, button, onDoc, onKey } = current;
  current = null;
  el.remove();
  button.setAttribute('aria-expanded', 'false');
  document.removeEventListener('pointerdown', onDoc, true);
  document.removeEventListener('keydown', onKey, true);
  if (restoreFocus) button.focus();
}

export function isPopoverOpen(button) { return !!current && current.button === button; }

/** Abre (ou fecha, se já aberto) um popover. build(close) retorna o conteúdo. */
export function togglePopover(button, { label, build, onOpen }) {
  if (isPopoverOpen(button)) { closePopover(); return; }
  closePopover({ restoreFocus: false });
  const wrap = button.parentElement;
  const close = (opts) => closePopover(opts);
  const el = h('div', { class: 'popover', role: 'dialog', 'aria-label': label }, build(close));
  wrap.append(el);
  button.setAttribute('aria-expanded', 'true');
  const onDoc = (e) => { if (!wrap.contains(e.target)) closePopover({ restoreFocus: false }); };
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closePopover(); }
    else if (e.key === 'Tab' && !el.contains(document.activeElement) && document.activeElement !== button) closePopover({ restoreFocus: false });
  };
  document.addEventListener('pointerdown', onDoc, true);
  document.addEventListener('keydown', onKey, true);
  current = { el, button, onDoc, onKey };
  (el.querySelector('a, button:not([disabled])') || el).focus?.();
  onOpen?.();
}
