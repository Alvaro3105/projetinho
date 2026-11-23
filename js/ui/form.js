// Formulários gerados a partir de FIELDS (schema.js), com validação e mensagens por campo.
import { h } from '../core/dom.js';
import { FIELDS, validate, coerce } from '../core/schema.js';
import { openModal, closeModal } from './modal.js';
import { toast } from './toast.js';
import { btn } from './components.js';

let seq = 0;

function control(field, value, store, idBase) {
  const id = `${idBase}-${field.key}`;
  const common = { id, name: field.key, 'aria-describedby': `${id}-hint ${id}-err` };
  switch (field.type) {
    case 'textarea':
      return h('textarea', { ...common, maxlength: field.max || null }, value ?? '');
    case 'select': {
      const sel = h('select', common,
        field.required ? null : h('option', { value: '' }, '—'),
        field.options.map((o) => h('option', { value: String(o.value) }, o.label)));
      sel.value = value === undefined || value === null ? (field.required ? String(field.options[0].value) : '') : String(value);
      return sel;
    }
    case 'date':
      return h('input', { ...common, type: 'date', value: value || '' });
    case 'number':
      return h('input', { ...common, type: 'number', inputmode: 'decimal', step: 'any', min: field.min ?? null, max: field.max ?? null, value: value ?? '' });
    case 'url':
      return h('input', { ...common, type: 'url', placeholder: 'https://', value: value || '' });
    case 'tags':
      return h('input', { ...common, type: 'text', value: Array.isArray(value) ? value.join(', ') : (value || '') });
    case 'bool': {
      const input = h('input', { ...common, type: 'checkbox' });
      input.checked = !!value;
      return h('label', { class: 'row', for: id }, input, h('span', { class: 'small' }, 'Sim'));
    }
    case 'ref': {
      const items = store.list(field.ref);
      const sel = h('select', common, h('option', { value: '' }, '— nenhum —'), items.map((it) => h('option', { value: it.id }, it[field.labelKey] || '(sem nome)')));
      sel.value = value || '';
      return sel;
    }
    case 'refs': {
      const items = store.list(field.ref);
      const chosen = new Set(value || []);
      if (!items.length) return h('p', { class: 'small faint', id }, 'Nenhum registro disponível ainda.');
      return h('div', { class: 'checks', id, role: 'group', 'aria-label': field.label },
        items.map((it) => {
          const cid = `${id}-${it.id}`;
          const cb = h('input', { type: 'checkbox', id: cid, value: it.id, 'data-refs': field.key });
          cb.checked = chosen.has(it.id);
          return h('label', { for: cid }, cb, it[field.labelKey] || '(sem nome)');
        }));
    }
    default:
      return h('input', { ...common, type: 'text', maxlength: field.max || null, value: value ?? '' });
  }
}

export function buildForm(collection, data = {}, store, { exclude = [], only = null } = {}) {
  const idBase = `f${++seq}`;
  const fields = FIELDS[collection].filter((f) => !exclude.includes(f.key) && (!only || only.includes(f.key)));
  const form = h('form', { class: 'form', novalidate: true },
    fields.map((f) => h('div', { class: `field${f.full || f.type === 'textarea' || f.type === 'refs' ? ' full' : ''}` },
      f.type === 'refs' || f.type === 'bool'
        ? h('span', { class: 'label', id: `${idBase}-${f.key}-label` }, f.label, f.required ? h('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : null)
        : h('label', { for: `${idBase}-${f.key}` }, f.label, f.required ? h('span', { class: 'req', 'aria-hidden': 'true' }, ' *') : null),
      control(f, data[f.key], store, idBase),
      h('span', { class: 'hint', id: `${idBase}-${f.key}-hint` }, f.hint || ''),
      h('span', { class: 'error', id: `${idBase}-${f.key}-err`, role: 'alert' }))));

  function read() {
    const raw = {};
    for (const f of fields) {
      if (f.type === 'refs') {
        raw[f.key] = [...form.querySelectorAll(`input[data-refs="${f.key}"]:checked`)].map((el) => el.value);
      } else if (f.type === 'bool') {
        raw[f.key] = form.querySelector(`#${idBase}-${f.key}`)?.checked || false;
      } else {
        raw[f.key] = form.querySelector(`#${idBase}-${f.key}`)?.value ?? '';
      }
    }
    return coerce(collection, raw);
  }

  function showErrors(errors) {
    let first = null;
    for (const f of fields) {
      const el = form.querySelector(`#${idBase}-${f.key}`);
      const err = form.querySelector(`#${idBase}-${f.key}-err`);
      if (err) err.textContent = errors[f.key] || '';
      if (el && 'setAttribute' in el) el.setAttribute('aria-invalid', errors[f.key] ? 'true' : 'false');
      if (errors[f.key] && !first) first = el;
    }
    if (first) first.focus();
  }

  return { form, read, showErrors, fields };
}

/**
 * Abre o formulário em modal. onSave(dados) pode retornar algo; erros lançados viram mensagem.
 */
export function editInModal({ store, collection, title, data = {}, onSave, exclude, only, extra }) {
  const { form, read, showErrors } = buildForm(collection, data, store, { exclude, only });
  const submit = (e) => {
    e?.preventDefault();
    const values = { ...read(), ...(extra ? extra() : {}) };
    const errors = validate(collection, values);
    if (Object.keys(errors).length) { showErrors(errors); toast('Revise os campos destacados.', { error: true }); return; }
    try {
      onSave(values);
      closeModal();
    } catch (err) {
      toast(err.message || 'Não foi possível salvar.', { error: true });
    }
  };
  form.addEventListener('submit', submit);
  openModal({
    title,
    body: form,
    footer: [
      btn('Cancelar', () => closeModal(), { kind: 'ghost' }),
      btn('Salvar', submit, { kind: 'primary', iconName: 'check' }),
    ],
  });
}

/** Criar/editar padrão de uma coleção. */
export function crud(store, collection, { item = null, defaults = {}, titleNew, titleEdit, after, exclude, only } = {}) {
  editInModal({
    store, collection, exclude, only,
    title: item ? titleEdit : titleNew,
    data: item || defaults,
    onSave: (values) => {
      const saved = item ? store.update(collection, item.id, values) : store.create(collection, { ...defaults, ...values });
      toast(item ? 'Alterações salvas.' : 'Registro criado.');
      if (after) after(saved, !item);
    },
  });
}
