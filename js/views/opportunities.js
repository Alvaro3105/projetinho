import { h, extLink } from '../core/dom.js';
import { fmtDate, today, diffDays } from '../core/dates.js';
import { OPP_CATEGORIES, OPP_STATUS, optionLabel } from '../core/schema.js';
import { badge, optBadge, btn, pageHead, empty, chips, kv, notice } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

let cat = 'all';

export function renderOpportunities({ store, rerender }) {
  const now = today();
  const list = store.list('opportunities').filter((o) => cat === 'all' || o.category === cat)
    .sort((a, b) => (a.deadline || '9999').localeCompare(b.deadline || '9999'));
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Research & Opportunities', 'Bolsas, intercâmbios, IC, hackathons, eventos, certificações e programas. Cada item diz se a informação foi confirmada na fonte oficial.', [
      btn('Nova oportunidade', () => crud(store, 'opportunities', { titleNew: 'Nova oportunidade', defaults: { status: 'monitorando', category: 'evento', verified: false } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    notice('Itens sem o selo "Confirmado" foram cadastrados a partir de pesquisa ou conhecimento geral. Antes de se planejar, abra o link oficial, confira requisitos e prazo, e marque como confirmado.', 'warn'),
    chips([['all', 'Todas'], ...OPP_CATEGORIES.map((c) => [c.value, c.label])], cat, (k) => { cat = k; rerender(); }, 'Filtrar por categoria'),
    list.length ? h('div', { class: 'grid cols-2' }, list.map((o) => {
      const days = o.deadline ? diffDays(now, o.deadline) : null;
      return h('article', { class: 'card' },
        h('div', { class: 'row between' },
          h('div', { class: 'row' }, badge(optionLabel(OPP_CATEGORIES, o.category), 'plain', { class: 'badge plain' }), optBadge(OPP_STATUS, o.status), o.verified ? badge('Confirmado', 'ok') : badge('Não confirmado', 'na')),
          h('div', { class: 'row' },
            btn('', () => crud(store, 'opportunities', { item: o, titleEdit: 'Editar oportunidade' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${o.title}` }),
            btn('', async () => { if (await confirmDialog({ title: 'Excluir oportunidade', message: `Excluir "${o.title}"?`, confirmLabel: 'Excluir', danger: true })) { store.remove('opportunities', o.id); toast('Oportunidade excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${o.title}` }))),
        h('h3', { style: { marginTop: '10px' } }, o.title),
        h('p', { class: 'small muted' }, o.org || ''),
        h('div', { style: { marginTop: '8px' } }, kv([
          ['Prazo', o.deadline ? h('span', {}, fmtDate(o.deadline), ' ', days < 0 ? badge('encerrado', 'plain') : days <= 14 ? badge(`${days} dia(s)`, 'warn') : badge(`${days} dias`, 'info')) : 'A confirmar'],
          ['Requisitos', o.requirements], ['Link', o.url ? extLink(o.url) : null], ['Fonte', o.source], ['Notas', o.notes],
        ])));
    })) : empty('Nenhuma oportunidade nesta categoria.'));
}
