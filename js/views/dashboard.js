import { h } from '../core/dom.js';
import { greeting, today, fmtDate, addDays, diffDays } from '../core/dates.js';
import {
  skillProgress, skillGaps, academicProgress, milestoneProgress, currentPhase, habitAdherence,
  goalsInWindow, goalProgress, insights, TECH_CATEGORIES, PERSONAL_CATEGORIES, isBlocked, allSessions, minutesByWeek,
} from '../core/metrics.js';
import { optionLabel, TASK_STATUS, PROJECT_STATUS, PRIORITY, AREAS } from '../core/schema.js';
import { card, stat, progressBar, pct, badge, optBadge, empty, btn, levelView, notice } from '../ui/components.js';
import { barChart, fmtHours, fmtNum } from '../ui/charts.js';
import { crud } from '../ui/form.js';
import { icon } from '../ui/icons.js';

const TRACE = `<svg viewBox="0 0 220 92" fill="none" aria-hidden="true"><path d="M6 80 C 40 78, 52 60, 78 58 S 118 40, 140 36 S 184 18, 208 10" stroke="currentColor" stroke-width="2" stroke-dasharray="3 6" stroke-linecap="round"/><circle cx="78" cy="58" r="4" fill="currentColor"/><circle cx="140" cy="36" r="4" fill="currentColor" opacity=".6"/><circle cx="208" cy="10" r="5" fill="#38BDF8"/></svg>`;

export function renderDashboard({ store, navigate }) {
  const st = store.state;
  const c = st.collections;
  const now = today();
  const phase = currentPhase(now);
  const startDays = diffDays(now, st.profile.startDate || '2026-11-30');

  const tech = skillProgress(c.skills, TECH_CATEGORIES);
  const pers = skillProgress(c.skills, PERSONAL_CATEGORIES);
  const habits = habitAdherence(c.habits, 4, now);
  const acad = academicProgress(c.semesters);
  const prof = milestoneProgress(c.milestones, ['profissional']);
  const { below, unassessed } = skillGaps(c.skills);

  const hero = h('section', { class: 'hero', 'aria-labelledby': 'page-title' },
    h('div', {},
      h('p', { class: 'eyebrow' }, 'CAREER OS'),
      h('h1', { id: 'page-title', tabindex: '-1' }, `${greeting()}, ${(st.profile.name || 'Álvaro').split(' ')[0]}.`),
      h('p', { class: 'lede' }, st.profile.mission || ''),
      h('div', { class: 'row phase-chip' },
        badge(phase.label, 'info'),
        badge(phase.period, 'plain'),
        startDays > 0 ? badge(`Retomada estruturada em ${startDays} dia(s) — ${fmtDate(st.profile.startDate)}`, 'accent') : badge(`Dia ${-startDays + 1} desde a retomada`, 'accent'))),
    h('div', { class: 'hero-trace', html: TRACE }));

  // Indicadores — cada um diz de onde vem
  const academicNote = acad.current ? `Cursando o ${acad.current.number}º período` : `${acad.done} de ${acad.total} semestres concluídos · graduação começa em 2027`;
  const indicators = h('div', { class: 'grid cols-4' },
    card({ cls: 'elevated' }, stat('Progresso acadêmico', `${acad.done}/${acad.total}`, academicNote), progressBar(acad.ratio, 'Progresso acadêmico')),
    card({ cls: 'elevated' },
      stat('Progresso técnico', pct(tech.ratio), tech.ratio === null ? `0 de ${tech.total} competências técnicas avaliadas` : `Média nível atual/desejado em ${tech.assessed} de ${tech.total} avaliadas`, { na: tech.ratio === null }),
      progressBar(tech.ratio, 'Progresso técnico')),
    card({ cls: 'elevated' },
      stat('Progresso profissional', prof.ratio === null ? 'Não avaliado' : `${prof.done}/${prof.total}`, 'Marcos profissionais do roadmap concluídos', { na: prof.ratio === null }),
      progressBar(prof.ratio, 'Progresso profissional')),
    card({ cls: 'elevated' },
      stat('Progresso pessoal', habits.ratio !== null ? pct(habits.ratio) : pct(pers.ratio), habits.ratio !== null ? 'Aderência aos hábitos nas últimas 4 semanas' : 'Sem hábitos marcados ainda', { na: habits.ratio === null && pers.ratio === null }),
      progressBar(habits.ratio ?? pers.ratio, 'Progresso pessoal')));

  // Metas da semana
  const weekGoals = goalsInWindow(c.goals, 'semana', now).slice(0, 6);
  const goalsCard = card({ title: 'Metas da semana', iconName: 'flag', actions: btn('Nova meta', () => crud(store, 'goals', { titleNew: 'Nova meta', defaults: { horizon: 'semana', status: 'ativa', area: 'tecnico', periodStart: now, due: addDays(now, 6) } }), { size: 'sm', iconName: 'plus' }) },
    weekGoals.length ? h('div', { class: 'list' }, weekGoals.map((g) => {
      const p = goalProgress(g);
      return h('div', { class: 'list-item' },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, g.title),
          h('div', { class: 'sub' }, `${optionLabel(AREAS, g.area)} · prazo ${fmtDate(g.due, { year: false })}${g.metric ? ` · ${g.current ?? 0}/${g.target ?? '?'} ${g.metric}` : ''}`),
          p !== null ? h('div', { style: { marginTop: '6px' } }, progressBar(p, g.title)) : null),
        h('div', { class: 'side' },
          g.due < now && g.status === 'ativa' ? badge('Atrasada', 'bad') : optBadge([{ value: 'ativa', label: 'Ativa', tone: 'info' }, { value: 'cumprida', label: 'Cumprida', tone: 'ok' }, { value: 'nao_cumprida', label: 'Não cumprida', tone: 'bad' }], g.status),
          btn('', () => crud(store, 'goals', { item: g, titleEdit: 'Editar meta' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${g.title}` })));
    })) : empty('Nenhuma meta semanal ativa.', 'Defina 2–4 metas verificáveis para esta semana.'));

  // Atividades pendentes
  const pending = c.tasks.filter((t) => t.status !== 'feito').sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 7);
  const tasksCard = card({ title: 'Atividades pendentes', iconName: 'check', meta: `${c.tasks.filter((t) => t.status !== 'feito').length} abertas`, actions: btn('Nova', () => crud(store, 'tasks', { titleNew: 'Nova atividade', defaults: { status: 'a_fazer', due: now } }), { size: 'sm', iconName: 'plus' }) },
    pending.length ? h('div', { class: 'list' }, pending.map((t) => {
      const skill = t.skillId ? store.get('skills', t.skillId) : null;
      return h('div', { class: 'list-item' },
        h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Concluir: ${t.title}`, onclick: () => store.update('tasks', t.id, { status: 'feito', doneAt: now }) }, icon('check')),
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, t.title),
          h('div', { class: 'sub' }, [t.due ? `Prazo ${fmtDate(t.due, { year: false })}` : 'Sem prazo', skill ? `Competência: ${skill.name}` : null].filter(Boolean).join(' · '))),
        h('div', { class: 'side' },
          t.due && t.due < now ? badge('Atrasada', 'bad') : null,
          t.priority ? optBadge(PRIORITY, t.priority) : null));
    })) : empty('Nada pendente.', 'Crie atividades a partir das competências abaixo do nível desejado.'));

  // Projetos em andamento
  const activeProjects = c.projects.filter((p) => p.status === 'em_andamento');
  const projectsCard = card({ title: 'Projetos em andamento', iconName: 'folder', actions: btn('Ver todos', () => navigate('projetos'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    activeProjects.length ? h('div', { class: 'list' }, activeProjects.map((p) => {
      const open = (p.improvements || []).filter((i) => !i.done).length + (p.tasks || []).filter((t) => !t.done).length;
      return h('div', { class: 'list-item' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, p.name), h('div', { class: 'sub' }, `${open} melhorias/tarefas abertas · ${(p.tech || []).slice(0, 4).join(', ')}`)),
        optBadge(PROJECT_STATUS, p.status));
    })) : empty('Nenhum projeto em andamento.'));

  // Próximos marcos
  const nextMilestones = c.milestones.filter((m) => m.status !== 'concluido').sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 5);
  const milestonesCard = card({ title: 'Próximos marcos', iconName: 'roadmap', actions: btn('Roadmap', () => navigate('roadmap'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    h('div', { class: 'list' }, nextMilestones.map((m) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, m.title), h('div', { class: 'sub' }, `${m.period || ''}${m.due ? ` · ${fmtDate(m.due)}` : ''}`)),
      isBlocked(m, c.milestones) ? badge('Depende de outro marco', 'plain') : badge('Liberado', 'info')))));

  // Competências prioritárias
  const priority = [...below.filter((s) => s.priority === 'alta'), ...unassessed.filter((s) => s.priority === 'alta')].slice(0, 8);
  const skillsCard = card({ title: 'Competências prioritárias', iconName: 'target', meta: `${unassessed.length} não avaliadas`, actions: btn('Skill Tracker', () => navigate('competencias'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    h('div', { class: 'list' }, priority.map((s) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, s.name), h('div', { class: 'sub' }, s.nextAction || '')),
      levelView(s.level, s.target, { compact: true })))));

  // Horas recentes
  const weeks = minutesByWeek(allSessions(st), 8, now);
  const total8 = weeks.reduce((a, w) => a + w.minutes, 0);
  const hoursCard = card({ title: 'Horas registradas', iconName: 'clock', meta: total8 ? `${fmtHours(total8)} em 8 semanas` : 'Sem registros', actions: btn('Registrar sessão', () => crud(store, 'studyLogs', { titleNew: 'Registrar sessão de estudo', defaults: { date: now, minutes: 50, kind: 'pratica', aiUse: 'nenhuma' } }), { size: 'sm', iconName: 'plus' }) },
    total8 ? barChart(weeks.map((w) => ({ label: fmtDate(w.key, { year: false }), value: Math.round(w.minutes / 6) / 10 })), { format: (v) => `${fmtNum(v)}h`, label: 'Horas por semana', height: 160 })
      : empty('Nenhuma sessão registrada.', 'As horas aparecem aqui assim que você registrar a primeira sessão. Horas medem esforço; resultados estão no Skill Tracker.'));

  // Objetivos principais + sinais
  const signals = insights(st, now).slice(0, 4);
  const objectives = card({ title: 'Objetivos principais', iconName: 'spark' },
    h('ul', { class: 'stack', style: { paddingLeft: '1.1em', gap: '6px' } }, (st.profile.objectives || []).map((o) => h('li', {}, o))),
    signals.length ? h('div', { class: 'stack', style: { marginTop: '16px' } }, signals.map((s) => notice(s.text, s.tone, btn('Abrir', () => navigate(s.route), { size: 'sm', kind: 'ghost', iconName: 'arrow' })))) : null);

  return h('div', { class: 'stack', style: { gap: '24px' } },
    hero,
    indicators,
    h('div', { class: 'grid dash-grid' },
      h('div', { class: 'stack', style: { gap: '16px' } }, goalsCard, tasksCard, hoursCard),
      h('div', { class: 'stack', style: { gap: '16px' } }, objectives, milestonesCard, skillsCard, projectsCard)));
}
