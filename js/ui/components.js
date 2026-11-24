// Componentes visuais reutilizáveis.
import { h } from '../core/dom.js';
import { icon } from './icons.js';
import { LEVELS, levelScore, optionLabel, optionTone } from '../core/schema.js';

export function badge(text, tone = 'plain', extra = {}) {
  return h('span', { class: `badge ${tone}`, ...extra }, text);
}

export function optBadge(options, value) {
  return badge(optionLabel(options, value), optionTone(options, value));
}

/** Nível atual (5 segmentos) + marcação do desejado + rótulo textual (não depende de cor). */
export function levelView(level, target, { compact = false } = {}) {
  const cur = levelScore(level);
  const tgt = levelScore(target);
  const bar = h('span', { class: `level-bar${cur === null ? ' na' : ''}`, 'aria-hidden': 'true' },
    [1, 2, 3, 4, 5].map((i) => h('i', { class: [cur !== null && i <= cur ? 'on' : '', tgt !== null && i === tgt ? 'target' : ''] })));
  const label = LEVELS.find((l) => l.value === level)?.label || 'Não avaliado';
  const targetLabel = LEVELS.find((l) => l.value === target)?.label;
  const sr = `Nível atual: ${label}.${targetLabel ? ` Desejado: ${targetLabel}.` : ''}`;
  return h('span', { class: 'level', title: sr },
    bar,
    compact ? h('span', { class: 'visually-hidden' }, sr) : h('span', { class: 'small muted' }, label),
  );
}

export function progressBar(ratio, label) {
  const na = ratio === null || ratio === undefined;
  return h('div', {
    class: `progress${na ? ' na' : ''}`, role: 'progressbar',
    'aria-label': label, 'aria-valuemin': 0, 'aria-valuemax': 100,
    'aria-valuenow': na ? null : Math.round(ratio * 100),
    'aria-valuetext': na ? 'Não avaliado' : `${Math.round(ratio * 100)}%`,
  }, h('span', { style: { width: na ? '0%' : `${Math.round(ratio * 100)}%` } }));
}

export function pct(ratio) {
  return ratio === null || ratio === undefined ? 'Não avaliado' : `${Math.round(ratio * 100)}%`;
}

export function stat(label, value, note, { na = false } = {}) {
  return h('div', { class: 'stat' },
    h('span', { class: 'stat-label' }, label),
    h('span', { class: `stat-value${na ? ' na' : ''}` }, value),
    note ? h('span', { class: 'stat-note' }, note) : null);
}

/** Indicador de carregamento (linhas que "respiram"), com texto para leitores de tela. */
export function loadingBlock(text = 'Carregando') {
  return h('div', { class: 'loading', role: 'status', 'aria-live': 'polite' },
    h('span', { class: 'ld-text' }, `${text}…`),
    h('i', { class: 'ld-row w1', 'aria-hidden': 'true' }), h('i', { class: 'ld-row w2', 'aria-hidden': 'true' }),
    h('i', { class: 'ld-row w3', 'aria-hidden': 'true' }), h('i', { class: 'ld-row w4', 'aria-hidden': 'true' }));
}

/** Faixa de indicadores: uma superfície com divisórias finas, em vez de N cartões iguais. */
export function statStrip(...items) {
  const list = items.flat().filter(Boolean);
  return h('section', { class: 'metric-strip', style: `--n:${Math.min(list.length, 4)}`, 'aria-label': 'Indicadores' },
    list.map((el) => (el.classList?.contains('metric') ? el : h('div', { class: 'metric' }, el))));
}

export function card({ title, iconName, meta, actions, sub, cls = '' } = {}, ...body) {
  return h('section', { class: `card ${cls}` },
    title ? h('div', { class: 'card-head' },
      h('h2', {}, iconName ? icon(iconName) : null, title),
      h('div', { class: 'row' }, meta ? h('span', { class: 'meta' }, meta) : null, actions || null)) : null,
    sub ? h('p', { class: 'card-sub' }, sub) : null,
    ...body);
}

export function btn(label, onClick, { kind = '', iconName, size = '', title, type = 'button', disabled } = {}) {
  return h('button', { type, class: ['btn', kind, size, !label ? 'icon' : ''], onclick: onClick, title: title || null, 'aria-label': !label ? title : null, disabled: disabled || null },
    iconName ? icon(iconName) : null, label || null);
}

export function empty(title, text, action) {
  return h('div', { class: 'empty' }, h('strong', {}, title), text ? h('span', {}, text) : null, action || null);
}

export function notice(text, tone = 'info', action = null) {
  return h('div', { class: `notice ${tone === 'warn' || tone === 'bad' ? 'warn' : ''}`, role: tone === 'bad' ? 'alert' : null },
    icon(tone === 'warn' || tone === 'bad' ? 'alert' : 'info'),
    h('div', { class: 'grow' }, text, action ? h('div', { style: { marginTop: '8px' } }, action) : null));
}

export function pageHead(title, lede, actions = []) {
  return h('header', { class: 'page-head' },
    h('div', {}, h('h1', { id: 'page-title', tabindex: '-1' }, title), lede ? h('p', { class: 'lede' }, lede) : null),
    actions.length ? h('div', { class: 'actions' }, actions) : null);
}

export function tabs(items, active, onChange, label = 'Seções') {
  return h('div', { class: 'tabs', role: 'tablist', 'aria-label': label },
    items.map(([key, text]) => h('button', {
      role: 'tab', type: 'button', 'aria-selected': key === active ? 'true' : 'false',
      tabindex: key === active ? '0' : '-1',
      onclick: () => onChange(key),
      onkeydown: (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        const idx = items.findIndex(([k]) => k === key); // parte da aba focada, não da ativa
        const next = items[(idx + (e.key === 'ArrowRight' ? 1 : items.length - 1)) % items.length][0];
        onChange(next);
        requestAnimationFrame(() => document.querySelector('.tabs [aria-selected="true"]')?.focus());
      },
    }, text)));
}

// Id estável para o foco voltar ao mesmo chip depois do redesenho da tela.
function slug(t) { return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

export function chips(items, active, onChange, label) {
  return h('div', { class: 'filters', role: 'group', 'aria-label': label },
    items.map(([key, text]) => h('button', { type: 'button', class: 'chip', id: label ? `chip-${slug(label)}-${slug(String(key))}` : null, 'aria-pressed': key === active ? 'true' : 'false', onclick: () => onChange(key) }, text)));
}

export function kv(pairs) {
  return h('dl', { class: 'kv' }, pairs.filter(([, v]) => v !== null && v !== undefined && v !== '').flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]));
}

export function refNames(store, collection, ids, key = 'name') {
  return (ids || []).map((id) => store.get(collection, id)?.[key]).filter(Boolean);
}

export function tagList(items) {
  if (!items || !items.length) return null;
  return h('div', { class: 'row' }, items.map((t) => h('span', { class: 'tag' }, t)));
}
