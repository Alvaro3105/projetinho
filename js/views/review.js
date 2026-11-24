// Ciclo Planejar → Estudar → Praticar → Desenvolver → Avaliar → Ajustar.
import { h } from '../core/dom.js';
import { today, weekStart, addDays, monthKey, fmtDate, fmtMonth } from '../core/dates.js';
import { allSessions, aiIndependence, goalsSummary } from '../core/metrics.js';
import { uid } from '../core/store.js';
import { card, btn, pageHead, tabs, empty, stat, pct, kv, badge } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { fmtHours } from '../ui/charts.js';

let tab = 'semanal';
const CYCLE = [
  { name: 'Planejar', hint: 'Metas da semana' },
  { name: 'Estudar', hint: 'Sessões registradas' },
  { name: 'Praticar', hint: 'Sem IA gerando código' },
  { name: 'Desenvolver', hint: 'Projetos e entregas' },
  { name: 'Avaliar', hint: 'Esta revisão' },
  { name: 'Ajustar', hint: 'Até 3 prioridades' },
];

export function renderReview(ctx) {
  const { rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Revisões', 'O sistema só funciona vivo: revisão semanal (15–20 min, domingo) e mensal (40 min, último dia do mês).'),
    h('ol', { class: 'cycle card flat', style: `--n:${CYCLE.length}`, 'aria-label': 'Ciclo de acompanhamento' }, CYCLE.map((step) => h('li', {}, h('b', {}, step.name), h('span', {}, step.hint)))),
    tabs([['semanal', 'Revisão semanal'], ['mensal', 'Revisão mensal'], ['historico', 'Histórico']], tab, (k) => { tab = k; rerender(); }),
    tab === 'semanal' ? weekly(ctx) : tab === 'mensal' ? monthly(ctx) : history(ctx));
}

function field(id, label, value, hint, rows = 3) {
  return h('div', { class: 'field full' }, h('label', { for: id }, label), h('textarea', { id, rows: String(rows) }, value || ''), hint ? h('span', { class: 'hint' }, hint) : null);
}

function weekly({ store, navigate }) {
  const now = today();
  const start = weekStart(now);
  const end = addDays(start, 6);
  const c = store.state.collections;
  const sessions = allSessions(store.state).filter((s) => s.date >= start && s.date <= end);
  const minutes = sessions.reduce((a, s) => a + s.minutes, 0);
  const indep = aiIndependence(c.studyLogs.filter((l) => l.date >= start && l.date <= end), 7, end);
  const tasksDone = c.tasks.filter((t) => t.status === 'feito' && t.doneAt && t.doneAt >= start && t.doneAt <= end).length;
  const goals = c.goals.filter((g) => g.horizon === 'semana' && g.due >= start && g.due <= addDays(end, 1));
  const existing = c.reviews.find((r) => r.kind === 'semanal' && r.periodKey === start);
  const prod = h('select', { id: 'rv-prod' }, h('option', { value: '' }, '—'), [1, 2, 3, 4, 5].map((n) => h('option', { value: String(n) }, `${n} — ${['muito abaixo', 'abaixo', 'dentro', 'acima', 'muito acima'][n - 1]} do planejado`)));
  prod.value = existing?.productivity ? String(existing.productivity) : '';
  const save = () => {
    const get = (id) => document.getElementById(id).value.trim();
    if (!prod.value) { prod.setAttribute('aria-invalid', 'true'); prod.focus(); toast('Dê uma nota de produtividade.', { error: true }); return; }
    const data = { kind: 'semanal', periodKey: start, productivity: Number(prod.value), learned: get('rv-learned'), difficulties: get('rv-diff'), wins: get('rv-wins'), projectsUpdate: get('rv-proj'), priorities: get('rv-prio'), snapshot: { minutes, sessions: sessions.length, noAI: indep.ratio, tasksDone } };
    if (existing) store.update('reviews', existing.id, data); else store.create('reviews', { id: uid('rev'), ...data });
    toast('Revisão semanal salva.');
  };
  return h('div', { class: 'grid dash-grid' },
    card({ title: `Semana de ${fmtDate(start, { year: false })} a ${fmtDate(end, { year: false })}`, iconName: 'cycle', meta: existing ? 'revisão já registrada (editando)' : null },
      h('form', { class: 'form', onsubmit: (e) => { e.preventDefault(); save(); } },
        h('div', { class: 'field' }, h('label', { for: 'rv-prod' }, 'Produtividade da semana'), prod),
        h('div', { class: 'field' }, h('span', { class: 'label' }, 'Atualizações'), h('div', { class: 'row' }, btn('Competências', () => navigate('competencias'), { size: 'sm', iconName: 'target' }), btn('Projetos', () => navigate('projetos'), { size: 'sm', iconName: 'folder' }))),
        field('rv-learned', 'O que aprendi (com minhas palavras)', existing?.learned, 'Se não consegue explicar, ainda não aprendeu.'),
        field('rv-diff', 'Dificuldades e onde travei', existing?.difficulties),
        field('rv-wins', 'Entregas concretas', existing?.wins, 'Problemas resolvidos, commits, avaliações feitas.'),
        field('rv-proj', 'Projetos: o que avançou', existing?.projectsUpdate),
        field('rv-prio', 'Prioridades da próxima semana (no máximo 3)', existing?.priorities),
        h('div', { class: 'full row' }, btn('Salvar revisão', null, { kind: 'primary', iconName: 'check', type: 'submit' }),
          btn('Criar meta para a próxima semana', () => crud(store, 'goals', { titleNew: 'Meta da próxima semana', defaults: { horizon: 'semana', status: 'ativa', area: 'tecnico', periodStart: addDays(start, 7), due: addDays(end, 7) } }), { iconName: 'flag' })))),
    h('div', { class: 'stack' },
      card({ title: 'Dados da semana', iconName: 'chart', sub: 'Calculados dos seus registros.' },
        h('div', { class: 'stack' },
          stat('Tempo registrado', fmtHours(minutes), `${sessions.length} sessões`),
          stat('Sem IA', pct(indep.ratio), 'do tempo técnico', { na: indep.ratio === null }),
          stat('Atividades concluídas', String(tasksDone)))),
      card({ title: 'Metas da semana', iconName: 'flag' },
        goals.length ? h('div', { class: 'list' }, goals.map((g) => h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, g.title), h('div', { class: 'sub' }, g.metric ? `${g.current ?? 0}/${g.target ?? '?'} ${g.metric}` : '')),
          g.status === 'ativa' ? h('div', { class: 'row' }, btn('Cumprida', () => store.update('goals', g.id, { status: 'cumprida', closedAt: now }), { size: 'sm' }), btn('Não', () => store.update('goals', g.id, { status: 'nao_cumprida', closedAt: now }), { size: 'sm', kind: 'ghost' })) : badge(g.status === 'cumprida' ? 'Cumprida' : 'Não cumprida', g.status === 'cumprida' ? 'ok' : 'bad')))) : empty('Nenhuma meta semanal nesta semana.'))));
}

function monthly({ store, navigate }) {
  const now = today();
  const key = monthKey(now);
  const c = store.state.collections;
  const from = `${key}-01`;
  const sessions = allSessions(store.state).filter((s) => monthKey(s.date) === key);
  const minutes = sessions.reduce((a, s) => a + s.minutes, 0);
  const monthGoals = c.goals.filter((g) => g.due && monthKey(g.due) === key && g.horizon !== 'semana');
  const sum = goalsSummary(monthGoals, now);
  const weeklyDone = c.reviews.filter((r) => r.kind === 'semanal' && r.periodKey >= addDays(from, -6) && monthKey(addDays(r.periodKey, 6)) === key).length;
  const existing = c.reviews.find((r) => r.kind === 'mensal' && r.periodKey === key);
  const save = () => {
    const get = (id) => document.getElementById(id).value.trim();
    if (!get('mv-results')) { document.getElementById('mv-results').focus(); toast('Descreva os resultados do mês.', { error: true }); return; }
    const data = { kind: 'mensal', periodKey: key, results: get('mv-results'), goalsVsDelivered: get('mv-goals'), gaps: get('mv-gaps'), roadmapChanges: get('mv-road'), nextPlan: get('mv-next'), snapshot: { minutes, sessions: sessions.length, goalsDone: sum.done, goalsFailed: sum.failed } };
    if (existing) store.update('reviews', existing.id, data); else store.create('reviews', { id: uid('rev'), ...data });
    toast('Revisão mensal salva.');
  };
  return h('div', { class: 'grid dash-grid' },
    card({ title: `Revisão de ${fmtMonth(key)}`, iconName: 'cycle', meta: existing ? 'editando revisão registrada' : null },
      h('form', { class: 'form', onsubmit: (e) => { e.preventDefault(); save(); } },
        field('mv-results', 'Resultados do mês (entregas verificáveis)', existing?.results, null, 4),
        field('mv-goals', 'Metas × entregas: o que foi cumprido e o que não', existing?.goalsVsDelivered),
        field('mv-gaps', 'Lacunas identificadas', existing?.gaps, 'Ex.: SQL ainda abaixo do desejado; inglês sem prática de speaking.'),
        field('mv-road', 'Mudanças no Plano de Evolução', existing?.roadmapChanges),
        field('mv-next', 'Plano do próximo mês (3 resultados principais)', existing?.nextPlan),
        h('div', { class: 'full row' }, btn('Salvar revisão mensal', null, { kind: 'primary', iconName: 'check', type: 'submit' }), btn('Abrir o Plano de Evolução', () => navigate('roadmap'), { iconName: 'roadmap' }), btn('Relatório do mês', () => navigate('relatorios'), { iconName: 'chart' })))),
    h('div', { class: 'stack' },
      card({ title: 'Dados do mês', iconName: 'chart' }, h('div', { class: 'stack' },
        stat('Tempo registrado', fmtHours(minutes), `${sessions.length} sessões`),
        stat('Metas cumpridas', `${sum.done}`, `${sum.failed} não cumpridas · ${sum.late.length} atrasadas`),
        stat('Revisões semanais', String(weeklyDone), 'feitas neste mês'))),
      card({ title: 'Fechar metas do mês', iconName: 'flag' },
        monthGoals.filter((g) => g.status === 'ativa').length ? h('div', { class: 'list' }, monthGoals.filter((g) => g.status === 'ativa').map((g) => h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, g.title)),
          h('div', { class: 'row' }, btn('Cumprida', () => store.update('goals', g.id, { status: 'cumprida', closedAt: now }), { size: 'sm' }), btn('Não', () => store.update('goals', g.id, { status: 'nao_cumprida', closedAt: now }), { size: 'sm', kind: 'ghost' }))))) : empty('Nenhuma meta aberta com prazo neste mês.'))));
}

function history({ store }) {
  const list = [...store.list('reviews')].sort((a, b) => b.periodKey.localeCompare(a.periodKey));
  return list.length ? h('div', { class: 'stack' }, list.map((r) => card({
    title: r.kind === 'semanal' ? `Semana de ${fmtDate(r.periodKey)}` : `Mês: ${fmtMonth(r.periodKey)}`,
    meta: r.kind === 'semanal' && r.productivity ? `produtividade ${r.productivity}/5` : null,
    actions: btn('', async () => { if (await confirmDialog({ title: 'Excluir revisão', message: 'Excluir esta revisão?', confirmLabel: 'Excluir', danger: true })) { store.remove('reviews', r.id); toast('Revisão excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir revisão' }),
  }, kv(r.kind === 'semanal'
    ? [['Aprendi', r.learned], ['Dificuldades', r.difficulties], ['Entregas', r.wins], ['Projetos', r.projectsUpdate], ['Prioridades', r.priorities], ['Registro', r.snapshot ? `${fmtHours(r.snapshot.minutes)} · ${r.snapshot.sessions} sessões` : null]]
    : [['Resultados', r.results], ['Metas × entregas', r.goalsVsDelivered], ['Lacunas', r.gaps], ['Plano de Evolução', r.roadmapChanges], ['Próximo mês', r.nextPlan]])))) : empty('Nenhuma revisão registrada.', 'Faça a primeira no domingo, 06/12/2026.');
}
