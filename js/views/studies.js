import { h, extLink } from '../core/dom.js';
import { today, fmtDate } from '../core/dates.js';
import { STUDY_STATUS, STUDY_TYPES, LOG_KINDS, AI_USE, optionLabel } from '../core/schema.js';
import { aiIndependence } from '../core/metrics.js';
import { card, badge, optBadge, btn, pageHead, tabs, chips, empty, refNames, stat, pct, tagList } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { completeStudyItem } from './actions.js';
import { RESOURCES, CERT_LABELS, BOOKS } from '../data/resources.js';
import { fmtHours } from '../ui/charts.js';

let tab = 'materiais';
let statusFilter = 'ativos';
let phaseFilter = 'all';

export function renderStudies(ctx) {
  const { store, rerender } = ctx;
  const now = today();
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Central de estudos', 'Materiais, sessões e biblioteca. Registre o uso de IA em cada sessão: é assim que a independência vira número.', [
      btn('Registrar sessão', () => crud(store, 'studyLogs', { titleNew: 'Registrar sessão de estudo', defaults: { date: now, minutes: 50, kind: 'pratica', aiUse: 'nenhuma' } }), { iconName: 'clock' }),
      btn('Novo material', () => crud(store, 'studyItems', { titleNew: 'Novo material de estudo', defaults: { type: 'curso', status: 'planejado' } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['materiais', 'Materiais'], ['sessoes', 'Sessões e horas'], ['biblioteca', 'Biblioteca recomendada']], tab, (k) => { tab = k; rerender(); }),
    tab === 'materiais' ? materials(ctx) : tab === 'sessoes' ? sessions(ctx) : library(ctx));
}

function materials({ store, rerender }) {
  const items = store.list('studyItems');
  const logs = store.list('studyLogs');
  const filtered = items.filter((i) => statusFilter === 'all' ? true : statusFilter === 'ativos' ? i.status !== 'concluido' : i.status === statusFilter);
  const minutesFor = (id) => logs.filter((l) => l.studyItemId === id).reduce((a, l) => a + Number(l.minutes || 0), 0);
  return h('div', { class: 'stack' },
    chips([['ativos', 'Ativos'], ['all', 'Todos'], ...STUDY_STATUS.map((s) => [s.value, s.label])], statusFilter, (k) => { statusFilter = k; rerender(); }, 'Filtrar por status'),
    filtered.length ? h('div', { class: 'grid cols-2' }, filtered.map((it) => {
      const mins = minutesFor(it.id);
      const skills = refNames(store, 'skills', it.skillIds);
      return h('article', { class: 'card' },
        h('div', { class: 'row between' },
          h('div', { class: 'row' }, badge(optionLabel(STUDY_TYPES, it.type), 'plain', { class: 'badge plain' }), optBadge(STUDY_STATUS, it.status)),
          h('div', { class: 'row' },
            btn('', () => crud(store, 'studyItems', { item: it, titleEdit: 'Editar material' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${it.title}` }),
            btn('', async () => { if (await confirmDialog({ title: 'Excluir material', message: `Excluir "${it.title}"? As sessões ligadas a ele continuam registradas.`, confirmLabel: 'Excluir', danger: true })) { store.remove('studyItems', it.id); toast('Material excluído.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${it.title}` }))),
        h('h3', { style: { marginTop: '10px' } }, it.title),
        h('p', { class: 'small muted' }, [it.provider, it.cost].filter(Boolean).join(' · ')),
        it.url ? h('p', { class: 'small' }, extLink(it.url)) : null,
        h('p', { class: 'small muted', style: { marginTop: '6px' } },
          [`${fmtHours(mins)} registradas${it.hoursEstimated ? ` de ~${it.hoursEstimated}h estimadas` : ''}`, it.dueDate ? `prazo ${fmtDate(it.dueDate)}` : null, it.completedAt ? `concluído em ${fmtDate(it.completedAt)}` : null].filter(Boolean).join(' · ')),
        skills.length ? h('div', { style: { marginTop: '8px' } }, tagList(skills)) : null,
        it.notes ? h('p', { class: 'small', style: { marginTop: '8px', whiteSpace: 'pre-wrap' } }, it.notes) : null,
        h('div', { class: 'row', style: { marginTop: '12px' } },
          it.status === 'planejado' || it.status === 'pausado' ? btn('Iniciar', () => store.update('studyItems', it.id, { status: 'em_andamento', startDate: it.startDate || today() }), { size: 'sm' }) : null,
          it.status !== 'concluido' ? btn('Concluir', () => completeStudyItem(store, it), { size: 'sm', kind: 'primary', iconName: 'check' }) : null,
          btn('Sessão', () => crud(store, 'studyLogs', { titleNew: `Sessão: ${it.title}`, defaults: { date: today(), minutes: 50, kind: 'estudo', aiUse: 'nenhuma', studyItemId: it.id, skillIds: it.skillIds } }), { size: 'sm', kind: 'ghost', iconName: 'clock' })));
    })) : empty('Nenhum material neste filtro.', 'Adicione da Biblioteca recomendada ou crie um novo.'));
}

function sessions({ store }) {
  const logs = [...store.list('studyLogs')].sort((a, b) => b.date.localeCompare(a.date));
  const total = logs.reduce((a, l) => a + Number(l.minutes || 0), 0);
  const indep = aiIndependence(store.list('studyLogs'), 30);
  return h('div', { class: 'stack' },
    h('div', { class: 'grid cols-3' },
      card({}, stat('Tempo total registrado', total ? fmtHours(total) : '0h', `${logs.length} sessões`)),
      card({}, stat('Sem IA (30 dias)', pct(indep.ratio), indep.total ? `${fmtHours(indep.noAI)} de ${fmtHours(indep.total)}` : 'Registre sessões com o campo de uso de IA', { na: indep.ratio === null })),
      card({}, stat('IA gerou código (30 dias)', indep.total ? pct(indep.generatedRatio) : 'Não avaliado', 'Quanto menor, mais independente', { na: !indep.total }))),
    logs.length ? h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Data', 'Min', 'Tipo', 'Uso de IA', 'Material / projeto', 'O que aprendi', ''].map((t, i) => h('th', { class: i === 1 ? 'num' : null, scope: 'col' }, t)))),
      h('tbody', {}, logs.map((l) => h('tr', {},
        h('td', {}, fmtDate(l.date)),
        h('td', { class: 'num' }, String(l.minutes)),
        h('td', {}, optionLabel(LOG_KINDS, l.kind)),
        h('td', {}, optBadge(AI_USE, l.aiUse)),
        h('td', {}, store.get('studyItems', l.studyItemId)?.title || store.get('projects', l.projectId)?.name || '—'),
        h('td', { style: { maxWidth: '320px' } }, l.learned || ''),
        h('td', {}, h('div', { class: 'row', style: { flexWrap: 'nowrap' } },
          btn('', () => crud(store, 'studyLogs', { item: l, titleEdit: 'Editar sessão' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: 'Editar sessão' }),
          btn('', async () => { if (await confirmDialog({ title: 'Excluir sessão', message: 'Excluir esta sessão de estudo?', confirmLabel: 'Excluir', danger: true })) { store.remove('studyLogs', l.id); toast('Sessão excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir sessão' }))))))))
      : empty('Nenhuma sessão registrada.', 'Use "Registrar sessão" ao fim de cada bloco de estudo (leva 20 segundos).'));
}

function library({ store, rerender }) {
  const existing = new Set(store.list('studyItems').map((i) => i.url).filter(Boolean));
  const skills = store.list('skills');
  const list = phaseFilter === 'all' ? RESOURCES : RESOURCES.filter((r) => String(r.phase) === phaseFilter);
  const add = (r) => {
    const skillIds = r.skills.map((name) => skills.find((s) => s.name === name)?.id).filter(Boolean);
    store.create('studyItems', { title: r.name, type: r.id === 'beecrowd' || r.id === 'leetcode' || r.id === 'cses' ? 'exercicios' : r.area === 'Inglês' ? 'videoaula' : /livro/i.test(r.name) ? 'livro' : 'curso', status: 'planejado', provider: r.org, url: r.url, cost: CERT_LABELS[r.cert], skillIds, notes: r.use });
    toast(`"${r.name}" adicionado aos seus materiais.`);
  };
  return h('div', { class: 'stack' },
    h('p', { class: 'small muted' }, 'Curadoria do plano. Certificados e custos mudam: confirme na página. Prioridade é aprendizado e prática, não quantidade de certificados.'),
    chips([['all', 'Todas as fases'], ['1', 'Fase 1'], ['2', 'Fase 2'], ['3', 'Fase 3'], ['4', 'Fase 4']], phaseFilter, (k) => { phaseFilter = k; rerender(); }, 'Filtrar por fase'),
    h('div', { class: 'grid cols-2' }, list.map((r) => h('article', { class: 'card' },
      h('div', { class: 'row between' }, h('div', { class: 'row' }, badge(`Fase ${r.phase}`, 'info'), badge(CERT_LABELS[r.cert], r.cert === 'gratis_cert_gratis' ? 'ok' : r.cert === 'pago' ? 'warn' : 'plain')),
        existing.has(r.url) ? badge('Na sua central', 'accent') : btn('Adicionar', () => { add(r); rerender(); }, { size: 'sm', iconName: 'plus' })),
      h('h3', { style: { marginTop: '10px' } }, r.name),
      h('p', { class: 'small muted' }, `${r.org} · ${r.lang} · ${r.level}`),
      h('p', { class: 'small' }, extLink(r.url)),
      h('dl', { class: 'kv', style: { marginTop: '10px' } },
        h('dt', {}, 'Conteúdo'), h('dd', {}, r.content),
        h('dt', {}, 'Pré-requisitos'), h('dd', {}, r.prereq),
        h('dt', {}, 'No seu plano'), h('dd', {}, r.use)),
      r.skills.length ? h('div', { style: { marginTop: '8px' } }, tagList(r.skills)) : null))),
    card({ title: 'Livros de referência', iconName: 'book', sub: 'Livros pagos entram quando o assunto aparece no plano. Biblioteca da PUC deve ter vários.' },
      h('div', { class: 'list' }, BOOKS.map((b) => h('div', { class: 'list-item' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, b.title), h('div', { class: 'sub' }, `${b.author} · ${b.use}`)),
        badge(b.cost, b.cost.startsWith('Gratuito') ? 'ok' : 'plain'))))));
}
