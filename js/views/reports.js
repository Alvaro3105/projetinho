import { h } from '../core/dom.js';
import { today, fmtDate, fmtMonth, fmtMonthShort, monthKey, termKey } from '../core/dates.js';
import { LEVELS, APP_STATUS, OPP_STATUS, optionLabel } from '../core/schema.js';
import {
  allSessions, minutesByMonth, minutesByWeek, consistency, dailyMinutes, aiIndependence, goalsSummary,
  applicationFunnel, insights, skillProgress, TECH_CATEGORIES,
} from '../core/metrics.js';
import { card, stat, pct, btn, pageHead, chips, empty, notice, badge } from '../ui/components.js';
import { barChart, heatmap, fmtHours, fmtNum } from '../ui/charts.js';
import { BRAND, brandMark } from '../core/brand.js';

let period = 'mes';

function range(p, now) {
  if (p === 'mes') { const k = monthKey(now); return { from: `${k}-01`, to: now, label: fmtMonth(k) }; }
  if (p === 'mes_anterior') {
    const [y, m] = now.split('-').map(Number);
    const d = new Date(y, m - 2, 1);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    return { from: `${k}-01`, to: `${k}-${String(last).padStart(2, '0')}`, label: fmtMonth(k) };
  }
  if (p === 'semestre') {
    const t = termKey(now);
    const [y, s] = t.split('/');
    return { from: s === '1' ? `${y}-01-01` : `${y}-07-01`, to: now, label: `Semestre ${t}` };
  }
  return { from: '2000-01-01', to: now, label: 'Todo o histórico' };
}

const inRange = (d, r) => d && d.slice(0, 10) >= r.from && d.slice(0, 10) <= r.to;

export function renderReports({ store, navigate, rerender }) {
  const st = store.state;
  const c = st.collections;
  const now = today();
  const r = range(period, now);
  const sessions = allSessions(st);
  const inP = sessions.filter((s) => inRange(s.date, r));
  const minutes = inP.reduce((a, s) => a + s.minutes, 0);
  const activeDays = new Set(inP.map((s) => s.date)).size;
  const cons28 = consistency(sessions, 28, now);
  const indep = aiIndependence(c.studyLogs, 30, now);
  const goalsP = c.goals.filter((g) => inRange(g.due, r));
  const gsum = goalsSummary(goalsP, now);
  const coursesDone = c.studyItems.filter((i) => i.status === 'concluido' && inRange(i.completedAt, r));
  const projectsDone = c.projects.filter((p) => p.status === 'concluido' && inRange(p.endDate, r));
  const skillChanges = c.skills.flatMap((s) => (s.history || []).filter((x) => inRange(x.date, r)).map((x) => ({ ...x, name: s.name })));
  const evidences = c.skills.reduce((a, s) => a + (s.evidence || []).filter((e) => inRange(e.date, r)).length, 0);
  const appsP = c.applications.filter((a) => inRange(a.appliedAt, r));
  const funnel = applicationFunnel(c.applications);
  const tech = skillProgress(c.skills, TECH_CATEGORIES);
  const months = minutesByMonth(sessions, 6, now);
  const weeks = minutesByWeek(sessions, 12, now);
  const signals = insights(st, now);

  const header = h('div', { class: 'card elevated row between' },
    h('div', { class: 'row' }, h('span', { html: brandMark({ id: 'jvrep' }) }), h('div', {}, h('div', { class: 'strong' }, `${BRAND.name} · Relatório`), h('div', { class: 'small muted' }, `${r.label} · gerado em ${fmtDate(now)} · ${BRAND.signature}`))),
    chips([['mes', 'Este mês'], ['mes_anterior', 'Mês anterior'], ['semestre', 'Semestre'], ['tudo', 'Tudo']], period, (k) => { period = k; rerender(); }, 'Período do relatório'));

  const noData = sessions.length === 0 && c.goals.every((g) => g.status === 'ativa') && skillChanges.length === 0;

  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Relatórios', 'O que está funcionando e o que precisa mudar. Horas medem esforço; resultados aparecem em competências, projetos e metas.'),
    header,
    noData ? notice('Ainda não há dados suficientes. Os relatórios se preenchem com sessões de estudo, avaliações, metas fechadas e projetos. Nada aqui é estimado.', 'info', btn('Registrar primeira sessão', () => navigate('estudos'), { size: 'sm' })) : null,
    h('div', { class: 'grid cols-4' },
      card({}, stat('Horas no período', fmtHours(minutes), `${inP.length} sessões · ${activeDays} dias ativos`)),
      card({}, stat('Consistência (28 dias)', pct(cons28.ratio), cons28.ratio === null ? 'Sem sessões' : `${cons28.activeDays} de 28 dias com estudo`, { na: cons28.ratio === null })),
      card({}, stat('Tempo técnico sem IA', pct(indep.ratio), 'Últimos 30 dias', { na: indep.ratio === null })),
      card({}, stat('Progresso técnico', pct(tech.ratio), `${tech.assessed}/${tech.total} competências avaliadas`, { na: tech.ratio === null }))),
    h('div', { class: 'grid cols-2' },
      card({ title: 'Evolução mensal (horas)', iconName: 'chart' }, months.some((m) => m.minutes) ? barChart(months.map((m) => ({ label: fmtMonthShort(m.key), value: Math.round(m.minutes / 6) / 10 })), { format: (v) => `${fmtNum(v)}h`, label: 'Horas por mês', height: 170 }) : empty('Sem horas registradas nos últimos 6 meses.')),
      card({ title: 'Últimas 12 semanas (horas)', iconName: 'chart' }, weeks.some((w) => w.minutes) ? barChart(weeks.map((w) => ({ label: fmtDate(w.key, { year: false }), value: Math.round(w.minutes / 6) / 10 })), { format: (v) => `${fmtNum(v)}h`, label: 'Horas por semana', height: 170 }) : empty('Sem horas registradas nas últimas 12 semanas.'))),
    card({ title: 'Consistência diária (16 semanas)', iconName: 'cycle', sub: 'Cada quadrado é um dia (linhas: segunda a domingo). Mais escuro = mais minutos.' },
      heatmap(dailyMinutes(sessions, 16, now)),
      h('div', { class: 'legend', style: { marginTop: '8px' } }, ['0', '<30 min', '30–60', '60–120', '120+'].map((t, i) => h('span', {}, h('i', { style: { background: ['var(--neutral-soft)', 'color-mix(in srgb, var(--primary) 35%, transparent)', 'color-mix(in srgb, var(--primary) 65%, transparent)', 'var(--primary)', 'var(--accent)'][i] } }), t)))),
    h('div', { class: 'grid cols-3' },
      card({ title: 'Metas do período', iconName: 'flag' },
        h('div', { class: 'stack' }, stat('Cumpridas', String(gsum.done)), stat('Não cumpridas', String(gsum.failed)), stat('Atrasadas (abertas)', String(gsum.late.length)),
          gsum.late.length ? h('ul', { class: 'small' }, gsum.late.slice(0, 5).map((g) => h('li', {}, g.title))) : null)),
      card({ title: 'Aprendizagem', iconName: 'book' },
        h('div', { class: 'stack' }, stat('Cursos concluídos', String(coursesDone.length)), stat('Projetos finalizados', String(projectsDone.length)), stat('Evidências registradas', String(evidences)),
          coursesDone.length ? h('ul', { class: 'small' }, coursesDone.map((i) => h('li', {}, i.title))) : null)),
      card({ title: 'Competências desenvolvidas', iconName: 'target' },
        skillChanges.length ? h('ul', { class: 'small' }, skillChanges.map((x) => h('li', {}, `${x.name}: ${LEVELS.find((l) => l.value === x.from)?.label} → ${LEVELS.find((l) => l.value === x.to)?.label} (${fmtDate(x.date, { year: false })})`)))
          : empty('Nenhuma mudança de nível no período.', 'Níveis mudam com avaliação e evidência.'))),
    h('div', { class: 'grid cols-2' },
      card({ title: 'Oportunidades profissionais', iconName: 'briefcase' },
        h('div', { class: 'stack' },
          stat('Candidaturas no período', String(appsP.length)),
          h('div', { class: 'row' }, ['candidatura', 'teste', 'entrevista', 'oferta', 'aprovado'].map((s) => badge(`${optionLabel(APP_STATUS, s)}: ${funnel[s]}`, 'plain'))),
          h('div', { class: 'row' }, OPP_STATUS.map((s) => {
            const n = c.opportunities.filter((o) => o.status === s.value).length;
            return n ? badge(`${s.label}: ${n}`, s.tone) : null;
          })))),
      card({ title: 'Pontos de melhoria', iconName: 'alert' },
        signals.length ? h('div', { class: 'stack' }, signals.map((s) => notice(s.text, s.tone, btn('Abrir', () => navigate(s.route), { size: 'sm', kind: 'ghost', iconName: 'arrow' })))) : empty('Nenhum alerta. Continue registrando.'))),
    monthlyTable(st, sessions, now));
}

function monthlyTable(st, sessions, now) {
  const months = minutesByMonth(sessions, 6, now).reverse();
  const c = st.collections;
  return card({ title: 'Resumo mês a mês', iconName: 'chart' },
    h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Mês', 'Horas', 'Dias ativos', 'Metas cumpridas', 'Metas não cumpridas', 'Mudanças de nível', 'Revisão mensal'].map((t, i) => h('th', { scope: 'col', class: i ? 'num' : null }, t)))),
      h('tbody', {}, months.map((m) => {
        const days = new Set(sessions.filter((s) => monthKey(s.date) === m.key).map((s) => s.date)).size;
        const done = c.goals.filter((g) => g.status === 'cumprida' && g.due && monthKey(g.due) === m.key).length;
        const fail = c.goals.filter((g) => g.status === 'nao_cumprida' && g.due && monthKey(g.due) === m.key).length;
        const changes = c.skills.reduce((a, s) => a + (s.history || []).filter((x) => monthKey(x.date) === m.key).length, 0);
        const review = c.reviews.some((rv) => rv.kind === 'mensal' && rv.periodKey === m.key);
        return h('tr', {}, h('td', {}, fmtMonth(m.key)), h('td', { class: 'num' }, fmtHours(m.minutes)), h('td', { class: 'num' }, String(days)), h('td', { class: 'num' }, String(done)), h('td', { class: 'num' }, String(fail)), h('td', { class: 'num' }, String(changes)), h('td', { class: 'num' }, review ? 'feita' : '—'));
      })))));
}

