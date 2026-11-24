import { h } from '../core/dom.js';
import { greeting, today, fmtDate, addDays, diffDays } from '../core/dates.js';
import {
  skillProgress, skillGaps, academicProgress, milestoneProgress, currentPhase, habitAdherence,
  goalsInWindow, goalProgress, insights, TECH_CATEGORIES, PERSONAL_CATEGORIES, isBlocked, allSessions, minutesByWeek,
  consistency, aiIndependence, upcoming, todayAgenda, currentSemester,
} from '../core/metrics.js';
import { CURRICULUM_SOURCE } from '../data/curriculum.js';
import { optionLabel, PROJECT_STATUS, PRIORITY, AREAS, PHASES } from '../core/schema.js';
import { card, stat, progressBar, pct, badge, optBadge, empty, btn, levelView } from '../ui/components.js';
import { barChart, fmtHours, fmtNum } from '../ui/charts.js';
import { crud } from '../ui/form.js';
import { icon } from '../ui/icons.js';
import { coreView, coreLegend } from '../ui/core.js';
import { BRAND, brandMark } from '../core/brand.js';


const MODULE_HINTS = {
  roadmap: 'Fases, marcos e semestres', estudos: 'Sessões, materiais e trilhas', competencias: 'Níveis e diagnósticos',
  projetos: 'Portfólio e melhorias', carreira: 'Candidaturas e empresas', ingles: 'Nível e prática', pessoal: 'Metas e hábitos',
  oportunidades: 'Bolsas, eventos, pesquisa', revisoes: 'Semanal e mensal', relatorios: 'Horas e evolução', guia: 'Estratégia e fontes',
  backup: 'Exportar e restaurar', configuracoes: 'Rotina, perfil, aparência',
};

/** Ações rápidas compartilhadas pelos dois modos. */
function quickActions(store, navigate, now) {
  return [
    { label: 'Registrar sessão', icon: 'clock', run: () => crud(store, 'studyLogs', { titleNew: 'Registrar sessão de estudo', defaults: { date: now, minutes: 50, kind: 'pratica', aiUse: 'nenhuma' } }) },
    { label: 'Nova meta', icon: 'flag', run: () => crud(store, 'goals', { titleNew: 'Nova meta', defaults: { horizon: 'semana', status: 'ativa', area: 'tecnico', periodStart: now, due: addDays(now, 6) } }) },
    { label: 'Nova atividade', icon: 'check', run: () => crud(store, 'tasks', { titleNew: 'Nova atividade', defaults: { status: 'a_fazer', due: now } }) },
    { label: 'Nova candidatura', icon: 'briefcase', run: () => crud(store, 'applications', { titleNew: 'Nova candidatura', defaults: { status: 'interesse', type: 'estagio', appliedAt: now, stageHistory: [], events: [] } }) },
    { label: 'Revisão semanal', icon: 'cycle', run: () => navigate('revisoes') },
    { label: 'Fazer backup', icon: 'lock', run: () => navigate('backup') },
  ];
}

export function renderDashboard(ctx) {
  return ctx.store.state.settings.uiMode === 'produtividade' ? renderProductivity(ctx) : renderAssistant(ctx);
}

/** Modo Assistente: núcleo com dados reais, campo de comando (busca), ações rápidas e prioridades. */
function renderAssistant({ store, navigate, modules = [], openSearch }) {
  const st = store.state;
  const c = st.collections;
  const now = today();
  const name = (st.profile.name || 'Álvaro').split(' ')[0];
  const { el: core, measures, phase } = coreView(st, {
    now,
    center: [
      h('span', { class: 'cc-mark', html: brandMark({ size: 44, id: 'jvcore' }), style: { display: 'block' } }),
      h('div', { class: 'cc-name' }, BRAND.name),
      h('div', { class: 'cc-sub' }, fmtDate(now)),
    ],
  });
  const phaseName = phase.label.split(' — ')[1] || phase.label;

  const command = h('button', { type: 'button', class: 'command', onclick: () => openSearch?.(), 'aria-describedby': 'cmd-note' },
    icon('search'), h('span', { class: 'grow' }, 'Buscar metas, competências, projetos, disciplinas…'), h('kbd', { class: 'hide-sm' }, 'Ctrl K'));

  const assist = h('section', { class: 'card elevated hud assist', 'aria-labelledby': 'page-title' },
    core,
    h('div', { class: 'assist-main' },
      h('div', { class: 'stack', style: { gap: '8px' } },
        h('span', { class: 'eyebrow' }, `Fase ${phase.value} · ${phaseName} · ${phase.period}`),
        h('h1', { id: 'page-title', tabindex: '-1' }, `${greeting()}, ${name}.`),
        st.profile.mission ? h('p', { class: 'muted', style: { maxWidth: '60ch' } }, st.profile.mission) : null),
      h('div', { class: 'stack', style: { gap: '6px' } },
        command,
        h('p', { id: 'cmd-note', class: 'small faint' }, 'Busca em tudo o que você registrou. O assistente com IA ainda não está conectado; quando estiver, este campo será o ponto de conversa.')),
      h('div', { class: 'quick', role: 'group', 'aria-label': 'Ações rápidas' },
        quickActions(store, navigate, now).map((a) => h('button', { type: 'button', class: 'quick-btn', onclick: a.run }, icon(a.icon), h('span', {}, a.label)))),
      h('div', { class: 'stack', style: { gap: '10px', paddingTop: '4px', borderTop: '1px solid var(--border)' } },
        h('span', { class: 'hud-label', style: { paddingTop: '12px' } }, 'Anéis do núcleo · de fora para dentro'),
        coreLegend(measures))));

  // Prioridades: o que vence hoje/atrasou + sinais de atenção, em uma só lista ordenada por urgência.
  const agenda = todayAgenda(st, now);
  const signals = insights(st, now).filter((s) => s.tone !== 'info').slice(0, 4);
  const rows = [
    ...agenda.tasks.map((t) => h('div', { class: 'list-item' },
      h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Concluir: ${t.title}`, onclick: () => store.update('tasks', t.id, { status: 'feito', doneAt: now }) }, icon('check')),
      h('div', { class: 'grow' }, h('div', { class: 'title' }, t.title), h('div', { class: 'sub' }, t.due < now ? `Atrasada desde ${fmtDate(t.due)}` : 'Vence hoje')),
      t.due < now ? badge('Atrasada', 'bad') : badge('Hoje', 'warn'))),
    ...agenda.habits.slice(0, 3).map((hb) => h('div', { class: 'list-item' },
      h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Marcar hábito de hoje: ${hb.name}`, onclick: () => store.update('habits', hb.id, { checks: [...(hb.checks || []), now] }) }, icon('check')),
      h('div', { class: 'grow' }, h('div', { class: 'title' }, hb.name), h('div', { class: 'sub' }, 'Hábito · ainda não marcado hoje')),
      badge('Hábito', 'plain'))),
    ...signals.map((sg) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title', style: { fontWeight: 400 } }, sg.text)),
      h('div', { class: 'side' }, badge(sg.tone === 'bad' ? 'Urgente' : 'Atenção', sg.tone),
        btn('', () => navigate(sg.route), { size: 'sm', kind: 'ghost', iconName: 'arrow', title: `Abrir: ${sg.text}` })))),
  ];
  const priorities = card({ title: `Prioridades de hoje`, meta: fmtDate(now), cls: 'today-card' },
    rows.length ? h('div', { class: 'list' }, rows) : empty('Nada vencendo hoje.', 'Use o tempo da rotina para o item mais importante das metas da semana.'));

  const next = upcoming(st, now, 14).slice(0, 6);
  const upcomingCard = card({ title: 'Próximas entregas', meta: '14 dias', cls: 'flat' },
    next.length ? h('div', { class: 'list' }, next.map((u) => h('div', { class: 'list-item' },
      h('span', { class: 'tag', style: { minWidth: '52px', justifyContent: 'center' } }, fmtDate(u.date, { year: false })),
      h('div', { class: 'grow' }, h('div', { class: 'title' }, u.title), h('div', { class: 'sub' }, u.kind)),
      btn('', () => navigate(u.route), { size: 'sm', kind: 'ghost', iconName: 'arrow', title: `Abrir: ${u.title}` })))) : empty('Nenhuma entrega com prazo nos próximos 14 dias.'));

  const access = h('section', { 'aria-labelledby': 'acesso-modulos', class: 'stack', style: { gap: '12px' } },
    h('div', { class: 'row between' }, h('h2', { id: 'acesso-modulos' }, 'Módulos'), h('span', { class: 'hud-label' }, `${modules.length - 1} áreas`)),
    h('nav', { class: 'module-grid', 'aria-label': 'Acesso rápido aos módulos' },
      modules.filter((m) => m.id !== 'painel').map((m) => h('a', { class: 'module-link', href: `#${m.id}` }, icon(m.icon), h('b', {}, m.label), h('span', {}, MODULE_HINTS[m.id] || '')))));

  return h('div', { class: 'stack', style: { gap: '24px' } },
    assist,
    h('div', { class: 'grid dash-grid' }, priorities, upcomingCard),
    access,
    h('p', { class: 'small faint' }, 'Modo Assistente. Para ver todos os indicadores, metas, horas e competências, troque para Produtividade no topo da tela.'));
}

/** Modo Produtividade: o painel detalhado. */
function renderProductivity({ store, navigate }) {
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

  function academicSituation() {
    const sem = currentSemester(c.semesters, now);
    const matrix = st.settings.curriculumConfirmedAt ? 'matriz confirmada' : 'matriz pendente de confirmação com a documentação da matrícula';
    if (sem) return `${sem.number}º período de Engenharia de Software (PUC Minas, Coração Eucarístico, noturno) · ${sem.disciplines.length} disciplinas · ${matrix}.`;
    if (now < '2027-02-01') return `Ensino Médio Técnico em TI (COTEMIG) em conclusão. Engenharia de Software na PUC Minas começa em 2027/1 · ${matrix} (consultada em ${fmtDate(CURRICULUM_SOURCE.consulted)}).`;
    return `Nenhum período marcado como "cursando". Marque o período atual em Plano de Evolução › Semestres.`;
  }

  // Gesto principal da tela: a régua das 6 fases da trajetória, com a posição atual.
  const rail = h('ol', { class: 'journey-rail', 'aria-label': 'Fases da trajetória' },
    PHASES.map((p) => {
      const state = p.value < phase.value ? 'past' : p.value === phase.value ? 'now' : '';
      return h('li', { class: `journey-seg ${state}`, 'aria-current': state === 'now' ? 'step' : null },
        h('span', { class: 'journey-num' }, `Fase ${p.value}`),
        h('span', { class: 'journey-name' }, p.label.split(' — ')[1] || ''),
        h('span', { class: 'journey-when' }, p.period));
    }));

  const hero = h('section', { class: 'hero', 'aria-labelledby': 'page-title' },
    h('div', { style: { minWidth: 0 } },
      h('h1', { id: 'page-title', tabindex: '-1' }, `${greeting()}, ${(st.profile.name || 'Álvaro').split(' ')[0]}.`),
      h('p', { class: 'lede' }, st.profile.mission || ''),
      h('div', { class: 'row phase-chip' },
        startDays > 0 ? badge(`Retomada estruturada em ${startDays} dia(s) — ${fmtDate(st.profile.startDate)}`, 'accent') : badge(`Dia ${-startDays + 1} desde a retomada`, 'accent')),
      h('p', { class: 'small muted', style: { marginTop: '10px' } }, h('strong', {}, 'Situação acadêmica: '), academicSituation()),
      rail));

  // Indicadores — cada um diz de onde vem
  const academicNote = acad.current ? `Cursando o ${acad.current.number}º período` : `${acad.done} de ${acad.total} semestres concluídos · graduação começa em 2027`;
  function consistencyCard() {
    const cons = consistency(allSessions(st), 28, now);
    const indep = aiIndependence(c.studyLogs, 30, now);
    const personal = habits.ratio !== null ? `Hábitos (4 semanas): ${pct(habits.ratio)}` : 'Hábitos: ainda sem marcações';
    return h('div', { class: 'metric' },
      stat('Consistência', cons.ratio === null ? 'Não avaliado' : `${cons.activeDays}/28 dias`, cons.ratio === null ? 'Sem sessões registradas ainda' : `Dias com estudo nas últimas 4 semanas${indep.ratio !== null ? ` · ${pct(indep.ratio)} sem IA` : ''}`, { na: cons.ratio === null }),
      progressBar(cons.ratio, 'Consistência'),
      h('p', { class: 'small muted', style: { marginTop: '8px' } }, `Evolução pessoal · ${personal}`));
  }
  const indicators = h('section', { class: 'card metric-strip', 'aria-label': 'Indicadores de evolução' },
    h('div', { class: 'metric' }, stat('Evolução acadêmica', `${acad.done}/${acad.total}`, academicNote), progressBar(acad.ratio, 'Evolução acadêmica')),
    h('div', { class: 'metric' },
      stat('Evolução técnica', pct(tech.ratio), tech.ratio === null ? `0 de ${tech.total} competências técnicas avaliadas` : `Média nível atual/desejado em ${tech.assessed} de ${tech.total} avaliadas`, { na: tech.ratio === null }),
      progressBar(tech.ratio, 'Evolução técnica')),
    h('div', { class: 'metric' },
      stat('Evolução profissional', prof.ratio === null ? 'Não avaliado' : `${prof.done}/${prof.total}`, 'Marcos profissionais do Plano de Evolução concluídos', { na: prof.ratio === null }),
      progressBar(prof.ratio, 'Evolução profissional')),
    consistencyCard());

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
  // Atividades sem prazo nos próximos 14 dias (as outras já aparecem em "Hoje" e "Próximas entregas").
  const horizon = addDays(now, 14);
  const pending = c.tasks.filter((t) => t.status !== 'feito' && (!t.due || t.due > horizon)).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 7);
  const tasksCard = card({ title: 'Outras atividades abertas', iconName: 'check', meta: `${c.tasks.filter((t) => t.status !== 'feito').length} abertas no total`, actions: btn('Nova', () => crud(store, 'tasks', { titleNew: 'Nova atividade', defaults: { status: 'a_fazer', due: now } }), { size: 'sm', iconName: 'plus' }) },
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
    })) : empty('Nenhuma outra atividade aberta.', 'As atividades com prazo até 14 dias aparecem em "Hoje" e em "Próximas entregas". Crie atividades a partir das competências abaixo do nível desejado.'));

  // Projetos em andamento
  const activeProjects = c.projects.filter((p) => p.status === 'em_andamento');
  const projectsCard = card({ title: 'Projetos em andamento', cls: 'flat', iconName: 'folder', actions: btn('Ver todos', () => navigate('projetos'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    activeProjects.length ? h('div', { class: 'list' }, activeProjects.map((p) => {
      const open = (p.improvements || []).filter((i) => !i.done).length + (p.tasks || []).filter((t) => !t.done).length;
      return h('div', { class: 'list-item' },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, p.name), h('div', { class: 'sub' }, `${open} melhorias/tarefas abertas · ${(p.tech || []).slice(0, 4).join(', ')}`)),
        optBadge(PROJECT_STATUS, p.status));
    })) : empty('Nenhum projeto em andamento.'));

  // Próximos marcos
  const nextMilestones = c.milestones.filter((m) => m.status !== 'concluido').sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')).slice(0, 5);
  const milestonesCard = card({ title: 'Próximos marcos', cls: 'flat', iconName: 'roadmap', actions: btn('Plano de Evolução', () => navigate('roadmap'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    h('div', { class: 'list' }, nextMilestones.map((m) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, m.title), h('div', { class: 'sub' }, `${m.period || ''}${m.due ? ` · ${fmtDate(m.due)}` : ''}`)),
      isBlocked(m, c.milestones) ? badge('Depende de outro marco', 'plain') : badge('Liberado', 'info')))));

  // Competências prioritárias
  const priority = [...below.filter((s) => s.priority === 'alta'), ...unassessed.filter((s) => s.priority === 'alta')].slice(0, 8);
  const skillsCard = card({ title: 'Competências prioritárias', cls: 'flat', iconName: 'target', meta: `${unassessed.length} não avaliadas`, actions: btn('Competências', () => navigate('competencias'), { size: 'sm', kind: 'ghost', iconName: 'arrow' }) },
    h('div', { class: 'list' }, priority.map((s) => h('div', { class: 'list-item' },
      h('div', { class: 'grow' }, h('div', { class: 'title' }, s.name), h('div', { class: 'sub' }, s.nextAction || '')),
      levelView(s.level, s.target, { compact: true })))));

  // Horas recentes
  const weeks = minutesByWeek(allSessions(st), 8, now);
  const total8 = weeks.reduce((a, w) => a + w.minutes, 0);
  const hoursCard = card({ title: 'Horas registradas', iconName: 'clock', meta: total8 ? `${fmtHours(total8)} em 8 semanas` : 'Sem registros', actions: btn('Registrar sessão', () => crud(store, 'studyLogs', { titleNew: 'Registrar sessão de estudo', defaults: { date: now, minutes: 50, kind: 'pratica', aiUse: 'nenhuma' } }), { size: 'sm', iconName: 'plus' }) },
    total8 ? barChart(weeks.map((w) => ({ label: fmtDate(w.key, { year: false }), value: Math.round(w.minutes / 6) / 10 })), { format: (v) => `${fmtNum(v)}h`, label: 'Horas por semana', height: 160 })
      : empty('Nenhuma sessão registrada.', 'As horas aparecem aqui assim que você registrar a primeira sessão. Horas medem esforço; resultados aparecem em Competências.'));

  // Objetivos principais
  const objectives = card({ title: 'Objetivos de longo prazo', cls: 'flat' },
    h('ul', { class: 'stack', style: { paddingLeft: '1.1em', gap: '6px' } }, (st.profile.objectives || []).map((o) => h('li', {}, o))));

  // Precisa da sua atenção (regras sobre os seus dados, não opinião)
  const signals = insights(st, now).slice(0, 5);
  const toneLabel = { bad: 'Urgente', warn: 'Atenção', info: 'Sugestão' };
  const attention = signals.length ? card({ title: 'Precisa da sua atenção', iconName: 'alert', sub: 'Gerado a partir dos seus registros.' },
    h('div', { class: 'list' }, signals.map((sg) => h('div', { class: 'list-item' },
      h('div', { class: 'grow stack', style: { gap: '4px' } },
        h('div', {}, badge(toneLabel[sg.tone] || 'Sugestão', sg.tone === 'info' ? 'info' : sg.tone)),
        h('div', { class: 'title', style: { fontWeight: 500 } }, sg.text)),
      btn('', () => navigate(sg.route), { size: 'sm', kind: 'ghost', iconName: 'arrow', title: `Abrir: ${sg.text}` }))))) : null;

  // Hoje: atividades vencendo/atrasadas e hábitos ainda não marcados
  const agenda = todayAgenda(st, now);
  const todayCard = card({ title: `Hoje · ${fmtDate(now)}`, iconName: 'clock', cls: 'elevated today-card' },
    agenda.tasks.length || agenda.habits.length ? h('div', { class: 'list' },
      agenda.tasks.map((t) => h('div', { class: 'list-item' },
        h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Concluir: ${t.title}`, onclick: () => store.update('tasks', t.id, { status: 'feito', doneAt: now }) }, icon('check')),
        h('div', { class: 'grow' }, h('div', { class: 'title' }, t.title), h('div', { class: 'sub' }, t.due < now ? `Atrasada desde ${fmtDate(t.due)}` : 'Vence hoje')),
        t.due < now ? badge('Atrasada', 'bad') : badge('Hoje', 'warn'))),
      agenda.habits.map((hb) => h('div', { class: 'list-item' },
        h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Marcar hábito de hoje: ${hb.name}`, onclick: () => store.update('habits', hb.id, { checks: [...(hb.checks || []), now] }) }, icon('check')),
        h('div', { class: 'grow' }, h('div', { class: 'title' }, hb.name), h('div', { class: 'sub' }, 'Hábito · ainda não marcado hoje')),
        badge('Hábito', 'plain')))) : empty('Nada vencendo hoje.', 'Use o tempo da rotina para o item mais importante das metas da semana.'));

  // Próximas entregas (14 dias), de todos os módulos
  const next = upcoming(st, now, 14).slice(0, 8);
  const upcomingCard = card({ title: 'Próximas entregas', iconName: 'flag', meta: 'próximos 14 dias' },
    next.length ? h('div', { class: 'list' }, next.map((u) => h('div', { class: 'list-item' },
      u.taskId
        ? h('button', { type: 'button', class: 'check', 'aria-pressed': 'false', 'aria-label': `Concluir: ${u.title}`, onclick: () => store.update('tasks', u.taskId, { status: 'feito', doneAt: now }) }, icon('check'))
        : null,
      h('span', { class: 'tag', style: { minWidth: '52px', justifyContent: 'center' } }, fmtDate(u.date, { year: false })),
      h('div', { class: 'grow' }, h('div', { class: 'title' }, u.title), h('div', { class: 'sub' }, u.kind)),
      u.taskId ? null : btn('', () => navigate(u.route), { size: 'sm', kind: 'ghost', iconName: 'arrow', title: `Abrir: ${u.title}` })))) : empty('Nenhuma entrega com prazo nos próximos 14 dias.'));

  return h('div', { class: 'stack', style: { gap: '24px' } },
    hero,
    h('div', { class: 'grid dash-grid' },
      h('div', { class: 'stack', style: { gap: '16px' } }, todayCard, upcomingCard, goalsCard),
      h('div', { class: 'stack', style: { gap: '16px' } }, attention, milestonesCard)),
    indicators,
    h('div', { class: 'grid dash-grid' },
      h('div', { class: 'stack', style: { gap: '16px' } }, hoursCard, tasksCard),
      h('div', { class: 'stack', style: { gap: '16px' } }, skillsCard, projectsCard, objectives)));
}
