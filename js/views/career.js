import { h, extLink } from '../core/dom.js';
import { fmtDate, today } from '../core/dates.js';
import { APP_STATUS, APP_TYPES, APP_FUNNEL, EXPERIENCE_TYPES, PRIORITY, optionLabel } from '../core/schema.js';
import { applicationGaps, applicationFunnel } from '../core/metrics.js';
import { card, badge, optBadge, btn, pageHead, tabs, empty, refNames, kv, stat, notice, chips, statStrip } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { openModal, closeModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { createTaskForSkill } from './actions.js';
import { BIGTECH_PREP, INTERVIEW_LEVELS } from '../data/careers.js';

let tab = 'candidaturas';
let statusFilter = 'abertas';

export function renderCareer(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Oportunidades Profissionais', 'Vagas, processos, empresas e experiências. Cada competência exigida por uma vaga se liga às suas Competências para mostrar a lacuna.', [
      btn('Nova candidatura', () => newApplication(store), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['candidaturas', 'Candidaturas'], ['empresas', 'Empresas'], ['experiencias', 'Experiências'], ['preparacao', 'Preparação para entrevistas']], tab, (k) => { tab = k; rerender(); }),
    tab === 'candidaturas' ? applications(ctx) : tab === 'empresas' ? companies(ctx) : tab === 'experiencias' ? experiences(ctx) : prep());
}

function newApplication(store) {
  crud(store, 'applications', { titleNew: 'Nova candidatura', defaults: { status: 'interesse', type: 'estagio', appliedAt: today(), stageHistory: [], events: [] } });
}

function applications({ store, rerender }) {
  const apps = store.list('applications');
  const skills = store.list('skills');
  const funnel = applicationFunnel(apps);
  const closed = ['reprovado', 'desistencia', 'aprovado'];
  const list = apps.filter((a) => statusFilter === 'all' ? true : statusFilter === 'abertas' ? !closed.includes(a.status) : closed.includes(a.status))
    .sort((a, b) => (a.nextDate || a.appliedAt || '').localeCompare(b.nextDate || b.appliedAt || ''));
  const gapCount = new Map();
  for (const a of apps) for (const s of applicationGaps(a, skills)) gapCount.set(s.id, (gapCount.get(s.id) || 0) + 1);
  const topGaps = [...gapCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([id, n]) => ({ skill: store.get('skills', id), n }));
  return h('div', { class: 'stack' },
    statStrip(APP_FUNNEL.slice(0, 4).map((s) => stat(optionLabel(APP_STATUS, s), String(funnel[s]), 'chegaram a esta etapa'))),
    topGaps.length ? card({ title: 'Lacunas que mais aparecem nas vagas', iconName: 'target', sub: 'Competências exigidas que estão abaixo do desejado ou não avaliadas.' },
      h('div', { class: 'list' }, topGaps.map(({ skill, n }) => h('div', { class: 'list-item' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, skill.name), h('div', { class: 'sub' }, `Exigida em ${n} vaga(s) · ${skill.level === 'nao_avaliado' ? 'não avaliada' : 'abaixo do desejado'}`)),
        btn('Criar atividade', () => createTaskForSkill(store, skill), { size: 'sm', iconName: 'plus' }))))) : null,
    chips([['abertas', 'Em aberto'], ['encerradas', 'Encerradas'], ['all', 'Todas']], statusFilter, (k) => { statusFilter = k; rerender(); }, 'Filtrar candidaturas'),
    list.length ? h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Empresa / vaga', 'Tipo', 'Status', 'Candidatura', 'Próxima data', 'Lacunas', ''].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, list.map((a) => {
        const gaps = applicationGaps(a, skills);
        const sel = h('select', { 'aria-label': `Status de ${a.company}`, style: { width: 'auto' }, onchange: (e) => {
          const hist = new Set([...(a.stageHistory || []), a.status]);
          const events = [...(a.events || []), { id: `ev_${Date.now()}`, date: today(), type: 'status', note: `Status: ${optionLabel(APP_STATUS, a.status)} → ${optionLabel(APP_STATUS, e.target.value)}` }];
          store.update('applications', a.id, { status: e.target.value, stageHistory: [...hist], events });
          toast('Status atualizado.');
        } }, APP_STATUS.map((o) => h('option', { value: o.value }, o.label)));
        sel.value = a.status;
        return h('tr', {},
          h('td', {}, h('button', { type: 'button', style: { background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }, onclick: () => applicationDetail(store, a.id) }, a.company), h('div', { class: 'small muted' }, a.role)),
          h('td', {}, optionLabel(APP_TYPES, a.type)),
          h('td', {}, sel),
          h('td', {}, a.appliedAt ? fmtDate(a.appliedAt) : '—'),
          h('td', {}, a.nextDate ? h('span', {}, fmtDate(a.nextDate), a.nextDate < today() ? [' ', badge('passou', 'warn')] : null) : '—'),
          h('td', {}, gaps.length ? badge(`${gaps.length} lacuna(s)`, 'warn') : (a.requiredSkills || []).length ? badge('Sem lacunas', 'ok') : h('span', { class: 'faint small' }, 'sem competências ligadas')),
          h('td', {}, btn('', () => applicationDetail(store, a.id), { size: 'sm', kind: 'ghost', iconName: 'arrow', title: `Abrir ${a.company}` })));
      })))) : empty('Nenhuma candidatura neste filtro.', 'Registre cada processo seletivo, inclusive os que não avançaram: o funil mostra onde melhorar.', btn('Nova candidatura', () => newApplication(store), { size: 'sm', iconName: 'plus' })));
}

export function applicationDetail(store, id) {
  const a = store.get('applications', id);
  if (!a) return;
  const gaps = applicationGaps(a, store.list('skills'));
  const noteInput = h('input', { type: 'text', id: 'ev-note', placeholder: 'Ex.: entrevista técnica marcada para 12/03', maxlength: 240 });
  const dateInput = h('input', { type: 'date', id: 'ev-date', value: today() });
  const addEvent = () => {
    if (!noteInput.value.trim()) { noteInput.focus(); return; }
    store.update('applications', a.id, { events: [...(a.events || []), { id: `ev_${Date.now()}`, date: dateInput.value || today(), type: 'nota', note: noteInput.value.trim() }] });
    applicationDetail(store, a.id);
  };
  openModal({
    title: `${a.company} — ${a.role}`,
    body: h('div', { class: 'stack', style: { gap: '16px' } },
      h('div', { class: 'row' }, optBadge(APP_STATUS, a.status), badge(optionLabel(APP_TYPES, a.type), 'plain')),
      kv([['Link', a.url ? extLink(a.url) : null], ['Local / modelo', a.location], ['Currículo enviado', a.resumeVersion], ['Requisitos', a.requirementsText], ['Feedback', a.feedback], ['Notas', a.notes]]),
      h('h3', {}, 'Competências exigidas'),
      (a.requiredSkills || []).length ? h('div', { class: 'list' }, refNames(store, 'skills', a.requiredSkills).length ? (a.requiredSkills || []).map((sid) => {
        const s = store.get('skills', sid);
        if (!s) return null;
        const gap = gaps.some((g) => g.id === sid);
        return h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, s.name)),
          gap ? badge(s.level === 'nao_avaliado' ? 'Não avaliada' : 'Abaixo do desejado', 'warn') : badge('Ok', 'ok'),
          gap ? btn('Criar atividade', () => { closeModal(); createTaskForSkill(store, s, { title: `Desenvolver ${s.name} (exigida por ${a.company})` }); }, { size: 'sm', iconName: 'plus' }) : null);
      }) : null) : h('p', { class: 'small faint' }, 'Edite a candidatura e marque as competências exigidas para ver as lacunas.'),
      h('h3', {}, 'Linha do tempo'),
      (a.events || []).length ? h('ul', {}, [...a.events].sort((x, y) => x.date.localeCompare(y.date)).map((e) => h('li', { class: 'small' }, `${fmtDate(e.date)} — ${e.note}`))) : h('p', { class: 'small faint' }, 'Sem eventos.'),
      h('div', { class: 'form' },
        h('div', { class: 'field' }, h('label', { for: 'ev-date' }, 'Data'), dateInput),
        h('div', { class: 'field' }, h('label', { for: 'ev-note' }, 'Evento (entrevista, teste, retorno)'), noteInput),
        h('div', { class: 'full' }, btn('Adicionar evento', addEvent, { size: 'sm', iconName: 'plus' })))),
    footer: [
      btn('Excluir', async () => { closeModal(); if (await confirmDialog({ title: 'Excluir candidatura', message: `Excluir a candidatura para ${a.company}?`, confirmLabel: 'Excluir', danger: true })) { store.remove('applications', a.id); toast('Candidatura excluída.'); } }, { kind: 'danger', iconName: 'trash' }),
      btn('Editar', () => { closeModal(); crud(store, 'applications', { item: a, titleEdit: 'Editar candidatura' }); }, { kind: 'primary', iconName: 'edit' }),
    ],
  });
}

function companies({ store }) {
  const list = [...store.list('companies')].sort((a, b) => ({ alta: 0, media: 1, baixa: 2 }[a.priority] ?? 3) - ({ alta: 0, media: 1, baixa: 2 }[b.priority] ?? 3));
  return h('div', { class: 'stack' },
    h('div', { class: 'row' }, btn('Nova empresa', () => crud(store, 'companies', { titleNew: 'Nova empresa de interesse', defaults: { priority: 'media' } }), { iconName: 'plus' })),
    h('div', { class: 'grid cols-3' }, list.map((co) => {
      const apps = store.list('applications').filter((a) => a.company.trim().toLowerCase() === co.name.trim().toLowerCase());
      return h('article', { class: 'card' },
        h('div', { class: 'row between' }, h('h3', {}, co.name), co.priority ? optBadge(PRIORITY, co.priority) : null),
        h('p', { class: 'small muted' }, [co.segment, co.location].filter(Boolean).join(' · ')),
        co.why ? h('p', { class: 'small', style: { marginTop: '6px' } }, co.why) : null,
        co.programs ? h('p', { class: 'small muted', style: { marginTop: '6px' } }, co.programs) : null,
        h('div', { class: 'row between', style: { marginTop: '10px' } },
          co.careersUrl ? h('span', { class: 'small' }, extLink(co.careersUrl, 'Carreiras')) : h('span', { class: 'small faint' }, 'Sem link oficial'),
          h('div', { class: 'row' }, apps.length ? badge(`${apps.length} candidatura(s)`, 'info') : null,
            btn('', () => crud(store, 'companies', { item: co, titleEdit: `Editar ${co.name}` }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${co.name}` }),
            btn('', async () => { if (await confirmDialog({ title: 'Excluir empresa', message: `Excluir ${co.name} da lista?`, confirmLabel: 'Excluir', danger: true })) { store.remove('companies', co.id); toast('Empresa excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${co.name}` }))));
    })));
}

function experiences({ store }) {
  const list = [...store.list('experiences')].sort((a, b) => (b.start || '').localeCompare(a.start || ''));
  return h('div', { class: 'stack' },
    h('div', { class: 'row' }, btn('Nova experiência', () => crud(store, 'experiences', { titleNew: 'Nova experiência', defaults: { type: 'evento' } }), { iconName: 'plus' })),
    list.length ? card({ title: 'Histórico de experiências' }, h('div', { class: 'list' }, list.map((e) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, `${e.role} · ${e.org}`), h('div', { class: 'sub' }, [optionLabel(EXPERIENCE_TYPES, e.type), e.start ? fmtDate(e.start) : 'data a registrar'].join(' · ')), e.description ? h('div', { class: 'sub' }, e.description) : null),
      h('div', { class: 'side' },
        btn('', () => crud(store, 'experiences', { item: e, titleEdit: 'Editar experiência' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: 'Editar experiência' }),
        btn('', async () => { if (await confirmDialog({ title: 'Excluir experiência', message: `Excluir "${e.role} · ${e.org}"?`, confirmLabel: 'Excluir', danger: true })) { store.remove('experiences', e.id); toast('Experiência excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir experiência' })))))) : empty('Nenhuma experiência registrada.'));
}

function prep() {
  return h('div', { class: 'stack' },
    notice('Não comece por problemas difíceis. Ordem: lógica sem IA (beecrowd) → estruturas de dados implementadas do zero → LeetCode fácil por padrão → médio → mock interviews em inglês. A Fase 3 é quando isso fica intenso.', 'info'),
    card({ title: 'O que é cobrado por nível', iconName: 'target' },
      h('div', { class: 'list' }, INTERVIEW_LEVELS.map((l) => h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, l.level), h('div', { class: 'sub' }, l.what)))))),
    h('div', { class: 'grid cols-2' }, BIGTECH_PREP.map((b) => card({ title: b.company }, kv([['Formato', b.format], ['Programas', b.official], ['Brasil / BH', b.local]])))),
    card({ title: 'Rotina de preparação (a partir da Fase 2)', iconName: 'clock' },
      h('ul', {},
        h('li', {}, '3 problemas por semana, cronometrados (25–40 min), explicando em voz alta. Depois de travar 25 min, leia só a dica, não a solução.'),
        h('li', {}, 'Para cada problema resolvido: escreva o padrão (two pointers, BFS, DP...) e a complexidade. Revise 7 e 30 dias depois.'),
        h('li', {}, 'Comportamental: mantenha 6 histórias no formato STAR (conflito, falha, liderança, prazo, aprendizado, impacto) a partir de projetos e trabalho.'),
        h('li', {}, 'Uma mock interview por mês a partir da Fase 3 (colegas, Pramp ou similar), metade em inglês.'),
        h('li', {}, 'System design só a partir da Fase 4, quando você tiver construído sistemas com banco, cache e fila.'))));
}
