// Indicadores calculados a partir dos dados registrados. Funções puras.
// Regra central: sem dado medido, o resultado é null ("Não avaliado"), nunca 0 inventado.
import { levelScore, PHASES, APP_FUNNEL } from './schema.js';
import { addDays, weekStart, monthKey, today as todayISO, diffDays, rangeDays, localDay } from './dates.js';

export const TECH_CATEGORIES = ['programacao', 'eng_software', 'ciencia_computacao', 'ia', 'matematica', 'dados', 'cloud', 'seguranca'];
export const PERSONAL_CATEGORIES = ['comunicacao', 'lideranca'];

/** Progresso de competências: média de (nível atual / nível desejado), só entre as avaliadas. */
export function skillProgress(skills, categories = null) {
  const pool = categories ? skills.filter((s) => categories.includes(s.category)) : skills;
  const assessed = pool.filter((s) => levelScore(s.level) !== null);
  if (assessed.length === 0) return { ratio: null, assessed: 0, total: pool.length };
  const sum = assessed.reduce((acc, s) => {
    const cur = levelScore(s.level);
    const tgt = Math.max(1, levelScore(s.target) ?? 1);
    return acc + Math.min(1, cur / tgt);
  }, 0);
  return { ratio: sum / assessed.length, assessed: assessed.length, total: pool.length };
}

/** Competências abaixo do desejado (avaliadas) e prioritárias ainda não avaliadas. */
export function skillGaps(skills) {
  const below = [];
  const unassessed = [];
  for (const s of skills) {
    const cur = levelScore(s.level);
    const tgt = levelScore(s.target);
    if (cur === null) unassessed.push(s);
    else if (tgt !== null && cur < tgt) below.push({ ...s, gap: tgt - cur });
  }
  const prio = { alta: 0, media: 1, baixa: 2 };
  below.sort((a, b) => (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3) || b.gap - a.gap);
  unassessed.sort((a, b) => (prio[a.priority] ?? 3) - (prio[b.priority] ?? 3));
  return { below, unassessed };
}

export function isBelowTarget(skill) {
  const cur = levelScore(skill.level);
  const tgt = levelScore(skill.target);
  return cur === null || (tgt !== null && cur < tgt);
}

export function academicProgress(semesters) {
  const total = semesters.length || 8;
  const done = semesters.filter((s) => s.status === 'concluido').length;
  const current = semesters.find((s) => s.status === 'cursando') || null;
  return { done, total, ratio: done / total, current };
}

export function milestoneProgress(milestones, types = null) {
  const pool = types ? milestones.filter((m) => types.includes(m.type)) : milestones;
  if (pool.length === 0) return { ratio: null, done: 0, total: 0 };
  const done = pool.filter((m) => m.status === 'concluido').length;
  return { ratio: done / pool.length, done, total: pool.length };
}

export function currentPhase(now = todayISO()) {
  return PHASES.find((p) => now >= p.start && now < p.end) || (now < PHASES[0].start ? { ...PHASES[0], upcoming: true } : PHASES[PHASES.length - 1]);
}

export function isBlocked(milestone, all) {
  return (milestone.dependsOn || []).some((id) => {
    const dep = all.find((m) => m.id === id);
    return dep && dep.status !== 'concluido';
  });
}

/** Junta sessões de estudo e de inglês num formato único {date, minutes, aiUse?}. */
export function allSessions(state) {
  const c = state.collections;
  return [
    ...c.studyLogs.map((l) => ({ date: l.date, minutes: Number(l.minutes) || 0, aiUse: l.aiUse, source: 'estudo' })),
    ...c.englishLogs.map((l) => ({ date: l.date, minutes: Number(l.minutes) || 0, aiUse: null, source: 'ingles' })),
  ].filter((s) => s.date);
}

export function minutesByWeek(sessions, weeks = 12, now = todayISO()) {
  const thisWeek = weekStart(now);
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const start = addDays(thisWeek, -7 * i);
    const end = addDays(start, 7);
    const minutes = sessions.filter((s) => s.date >= start && s.date < end).reduce((a, s) => a + s.minutes, 0);
    out.push({ key: start, minutes });
  }
  return out;
}

export function minutesByMonth(sessions, months = 6, now = todayISO()) {
  const [y, m] = now.split('-').map(Number);
  const out = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const minutes = sessions.filter((s) => monthKey(s.date) === key).reduce((a, s) => a + s.minutes, 0);
    out.push({ key, minutes });
  }
  return out;
}

/** Consistência: dias com pelo menos uma sessão nos últimos N dias. */
export function consistency(sessions, days = 28, now = todayISO()) {
  const from = addDays(now, -(days - 1));
  const active = new Set(sessions.filter((s) => s.date >= from && s.date <= now && s.minutes > 0).map((s) => s.date));
  if (sessions.length === 0) return { ratio: null, activeDays: 0, days };
  return { ratio: active.size / days, activeDays: active.size, days };
}

/** Minutos por dia para o mapa de calor (semanas completas, segunda a domingo). */
export function dailyMinutes(sessions, weeks = 16, now = todayISO()) {
  const start = addDays(weekStart(now), -7 * (weeks - 1));
  const end = addDays(weekStart(now), 7);
  const map = new Map();
  for (const s of sessions) map.set(s.date, (map.get(s.date) || 0) + s.minutes);
  return rangeDays(start, end).map((date) => ({ date, minutes: map.get(date) || 0, future: date > now }));
}

/** Independência de IA: % do tempo de estudo técnico feito sem IA gerar código. */
export function aiIndependence(studyLogs, days = 30, now = todayISO()) {
  const from = addDays(now, -(days - 1));
  const pool = studyLogs.filter((l) => l.date >= from && l.date <= now && l.aiUse);
  const total = pool.reduce((a, l) => a + (Number(l.minutes) || 0), 0);
  if (total === 0) return { ratio: null, noAI: 0, generated: 0, total: 0 };
  const noAI = pool.filter((l) => l.aiUse === 'nenhuma').reduce((a, l) => a + Number(l.minutes), 0);
  const generated = pool.filter((l) => l.aiUse === 'geracao').reduce((a, l) => a + Number(l.minutes), 0);
  return { ratio: noAI / total, noAI, generated, total, generatedRatio: generated / total };
}

export function goalsSummary(goals, now = todayISO()) {
  const done = goals.filter((g) => g.status === 'cumprida');
  const failed = goals.filter((g) => g.status === 'nao_cumprida');
  const active = goals.filter((g) => g.status === 'ativa');
  const late = active.filter((g) => g.due && g.due < now);
  const closed = done.length + failed.length;
  return { done: done.length, failed: failed.length, active: active.length, late, hitRate: closed ? done.length / closed : null };
}

export function goalProgress(goal) {
  if (goal.target === null || goal.target === undefined || goal.target === '' || Number(goal.target) === 0) return null;
  return Math.min(1, (Number(goal.current) || 0) / Number(goal.target));
}

/** Metas do horizonte cujo período contém a data. */
export function goalsInWindow(goals, horizon, now = todayISO()) {
  // Inclui metas que começam nos próximos 7 dias (planejamento antecipado).
  return goals.filter((g) => g.horizon === horizon && g.status !== 'cancelada' && (!g.periodStart || g.periodStart <= addDays(now, 7)) && (!g.due || g.due >= addDays(now, -7)));
}

export function habitWeek(habit, now = todayISO()) {
  const start = weekStart(now);
  const end = addDays(start, 7);
  const count = (habit.checks || []).filter((d) => d >= start && d < end).length;
  return { count, target: Number(habit.targetPerWeek) || 1 };
}

/** Aderência média aos hábitos ativos nas últimas N semanas completas + atual. */
export function habitAdherence(habits, weeks = 4, now = todayISO()) {
  const active = habits.filter((h) => h.active !== false);
  if (active.length === 0) return { ratio: null, habits: 0 };
  const anyCheck = active.some((h) => (h.checks || []).length > 0);
  if (!anyCheck) return { ratio: null, habits: active.length };
  let sum = 0;
  let n = 0;
  for (let i = 0; i < weeks; i++) {
    const ref = addDays(now, -7 * i);
    for (const h of active) {
      if (h.createdAt && localDay(h.createdAt) > addDays(weekStart(ref), 6)) continue;
      const { count, target } = habitWeek(h, ref);
      sum += Math.min(1, count / target);
      n++;
    }
  }
  return { ratio: n ? sum / n : null, habits: active.length };
}

/** Funil: quantas candidaturas chegaram a cada etapa (usa o histórico de status). */
export function applicationFunnel(applications) {
  const reached = Object.fromEntries(APP_FUNNEL.map((s) => [s, 0]));
  for (const app of applications) {
    const stages = new Set([app.status, ...(app.stageHistory || [])]);
    let max = -1;
    for (const s of stages) max = Math.max(max, APP_FUNNEL.indexOf(s));
    for (let i = 0; i <= max; i++) reached[APP_FUNNEL[i]]++;
  }
  return reached;
}

/** Lacunas de uma vaga: competências exigidas abaixo do desejado ou não avaliadas. */
export function applicationGaps(app, skills) {
  return (app.requiredSkills || [])
    .map((id) => skills.find((s) => s.id === id))
    .filter(Boolean)
    .filter(isBelowTarget);
}

export function weeklyReviewDue(reviews, now = todayISO()) {
  const thisWeek = weekStart(now);
  const lastWeek = addDays(thisWeek, -7);
  const hasCurrent = reviews.some((r) => r.kind === 'semanal' && (r.periodKey === thisWeek || r.periodKey === lastWeek));
  return !hasCurrent;
}

/** Distribuição sugerida de horas semanais por frente, conforme a fase. */
export const PHASE_WEIGHTS = {
  1: { 'Programação e lógica (sem IA)': 0.35, 'Matemática (álgebra, funções, pré-cálculo)': 0.2, 'Inglês': 0.2, 'Projeto e Git': 0.15, 'Carreira (currículo, vagas)': 0.1 },
  2: { 'Algoritmos e programação': 0.3, 'Projeto de portfólio': 0.25, 'Inglês': 0.15, 'Matemática (Cálculo I + Discreta I)': 0.15, 'Carreira e comunidade': 0.15 },
  3: { 'Estruturas de dados e entrevistas': 0.3, 'Projeto / estágio': 0.3, 'Inglês': 0.15, 'Matemática complementar (Discreta II)': 0.1, 'Carreira e comunidade': 0.15 },
  4: { 'Especialização (backend + IA)': 0.25, 'Entrevistas (DSA + system design)': 0.25, 'Álgebra linear e matemática para ML': 0.15, 'Projeto avançado / pesquisa': 0.15, 'Inglês profissional': 0.1, 'Carreira e networking': 0.1 },
  5: { 'Projeto de alto nível / TCC': 0.3, 'Entrevistas e processos': 0.3, 'Especialização': 0.2, 'Inglês e internacionalização': 0.1, 'Networking': 0.1 },
  6: { 'Pesquisa / pós-graduação': 0.35, 'Trabalho e entregas': 0.35, 'Comunidade e ensino': 0.15, 'Internacionalização': 0.15 },
};

/**
 * Cenários de trabalho. A disponibilidade de cada um é editável em Configurações.
 * Estudar à noite não significa ter o dia livre: deslocamento, família, trabalho e descanso contam.
 * "sem_estagio" usa settings.availability (compatível com dados antigos).
 */
export const WORK_SCENARIOS = [
  { value: 'sem_estagio', label: 'Sem estágio', key: 'availability', defaults: { seg: 2, ter: 2, qua: 2, qui: 2, sex: 1.5, sab: 3, dom: 1 }, note: 'Dia sem compromisso fixo, mas com deslocamento, descanso, família e imprevistos. Blocos de 1h30–2h antes da aula.' },
  { value: 'estagio_20h', label: 'Estágio 20 h/semana (4 h/dia)', key: 'availabilityIntern20', defaults: { seg: 1, ter: 1, qua: 1, qui: 1, sex: 1, sab: 3, dom: 1 }, note: 'Estágio em um turno + deslocamento + aula à noite. Um bloco curto por dia útil; o estudo pesado vai para o sábado.' },
  { value: 'estagio_30h', label: 'Estágio 30 h/semana (6 h/dia)', key: 'availabilityIntern30', defaults: { seg: 0.5, ter: 0.5, qua: 0.5, qui: 0.5, sex: 0, sab: 3, dom: 0.5 }, note: 'Dias úteis cheios: só rotina mínima (30 min) quando der. Sábado concentra o estudo extra; domingo é descanso e revisão.' },
];
export const VACATION_DEFAULTS = { seg: 4, ter: 4, qua: 4, qui: 4, sex: 3, sab: 3, dom: 0 };

export function scenarioOf(settings) {
  return WORK_SCENARIOS.find((w) => w.value === settings.workScenario) || WORK_SCENARIOS[0];
}

export function availabilityFor(settings) {
  const mode = settings.routineMode || 'normal';
  if (mode === 'ferias') return settings.availabilityVacation || VACATION_DEFAULTS;
  const sc = scenarioOf(settings);
  return settings[sc.key] || sc.defaults;
}

/** Horas extras/semana que você declarou disponíveis (antes do ajuste por carga). */
export function weeklyHours(settings) {
  if ((settings.routineMode || 'normal') === 'minima') return 3.5; // 30 min por dia
  return Object.values(availabilityFor(settings) || {}).reduce((a, v) => a + (Number(v) || 0), 0);
}

/** Carga média por período da matriz (4.522 h / 8). Semestres acima da média reduzem o estudo extra. */
export const AVERAGE_SEMESTER_HOURS = 565;

export function semesterHours(semester) {
  return (semester?.disciplines || []).reduce((a, d) => a + (Number(d.hours) || 0), 0);
}

/** Semestre em curso: o marcado como "cursando" ou o do período letivo atual (se não concluído). */
export function currentSemester(semesters, now = todayISO()) {
  const marked = semesters.find((s) => s.status === 'cursando');
  if (marked) return marked;
  const [y, m] = now.split('-').map(Number);
  const term = `${y}/${m <= 6 ? 1 : 2}`;
  return semesters.find((s) => s.term === term && s.status !== 'concluido') || null;
}

/** Fator de carga: 1 em semestres até a média; menor em semestres pesados (mínimo 0,7). */
export function loadFactor(semester) {
  const hours = semesterHours(semester);
  if (!hours) return 1;
  return Math.max(0.7, Math.min(1, AVERAGE_SEMESTER_HOURS / hours));
}

/**
 * Plano semanal: horas disponíveis × fator de carga (só no modo normal, durante o semestre)
 * distribuídas pelos pesos da fase.
 */
export function routinePlan(settings, phaseValue, { semester = null } = {}) {
  const declared = weeklyHours(settings);
  const factor = (settings.routineMode || 'normal') === 'normal' && semester ? loadFactor(semester) : 1;
  const total = Math.round(declared * factor * 2) / 2;
  const weights = PHASE_WEIGHTS[phaseValue] || PHASE_WEIGHTS[1];
  const items = Object.entries(weights).map(([area, w]) => ({ area, hours: Math.round(total * w * 2) / 2 }));
  items.declared = declared;
  items.total = total;
  items.factor = factor;
  return items;
}

/** Sinais acionáveis para o painel e os relatórios. */
export function insights(state, now = todayISO()) {
  const c = state.collections;
  const out = [];
  const gaps = skillGaps(c.skills);
  const pendingAssess = c.assessments.filter((a) => a.status === 'pendente');
  if (pendingAssess.length) out.push({ tone: 'warn', text: `${pendingAssess.length} avaliações diagnósticas pendentes. Sem elas, os níveis seguem como "não avaliado".`, route: 'competencias' });
  const sessions = allSessions(state);
  const cons = consistency(sessions, 14, now);
  if (cons.ratio === null) out.push({ tone: 'info', text: 'Nenhuma sessão de estudo registrada ainda. Registre a primeira para ativar os relatórios.', route: 'estudos' });
  else if (cons.ratio < 0.4) out.push({ tone: 'warn', text: `Você estudou em ${cons.activeDays} dos últimos 14 dias. Use a rotina mínima em dias difíceis para não zerar.`, route: 'pessoal' });
  const indep = aiIndependence(c.studyLogs, 30, now);
  if (indep.ratio !== null && indep.generatedRatio > 0.3) out.push({ tone: 'warn', text: `${Math.round(indep.generatedRatio * 100)}% do tempo técnico do mês teve código gerado por IA. Reserve sessões sem IA.`, route: 'estudos' });
  const goals = goalsSummary(c.goals, now);
  if (goals.late.length) out.push({ tone: 'bad', text: `${goals.late.length} metas passaram do prazo sem fechamento. Marque como cumpridas ou não cumpridas e ajuste.`, route: 'pessoal' });
  if (weeklyReviewDue(c.reviews, now)) out.push({ tone: 'info', text: 'Revisão semanal pendente: avalie a semana e reorganize prioridades.', route: 'revisoes' });
  const blockedHigh = gaps.below.filter((s) => s.priority === 'alta').slice(0, 2);
  for (const s of blockedHigh) out.push({ tone: 'info', text: `"${s.name}" está abaixo do nível desejado. Crie uma atividade para desenvolvê-la.`, route: 'competencias' });
  const last = localDay(state.meta.lastExportAt);
  const days = last ? Math.max(0, diffDays(last, now)) : null;
  if (days === null || days > 14) out.push({ tone: 'warn', text: days === null ? 'Você ainda não fez backup. Os dados ficam só neste navegador.' : `Último backup há ${days} dias. Exporte um novo arquivo.`, route: 'configuracoes' });
  return out;
}

/**
 * Próximas entregas de todos os módulos (só itens com data registrada).
 * Retorna [{date, title, kind, route, overdue}] ordenado por data.
 */
export function upcoming(state, now = todayISO(), days = 14) {
  const c = state.collections;
  const limit = addDays(now, days);
  const out = [];
  const push = (date, title, kind, route, extra = {}) => { if (date && date <= limit) out.push({ date, title, kind, route, overdue: date < now, ...extra }); };
  for (const t of c.tasks) if (t.status !== 'feito' && t.due && t.due > now) push(t.due, t.title, 'Atividade', 'painel', { taskId: t.id });
  for (const g of c.goals) if (g.status === 'ativa' && g.due >= now) push(g.due, g.title, 'Meta', 'pessoal');
  for (const m of c.milestones) if (m.status !== 'concluido' && m.due >= now) push(m.due, m.title, 'Marco', 'roadmap');
  for (const a of c.applications) if (!['reprovado', 'desistencia', 'aprovado'].includes(a.status) && a.nextDate >= now) push(a.nextDate, `${a.company} — ${a.role}`, 'Candidatura', 'carreira');
  for (const o of c.opportunities) if (!['encerrado', 'reprovado', 'aprovado'].includes(o.status) && o.deadline >= now) push(o.deadline, o.title, 'Prazo de oportunidade', 'oportunidades');
  for (const s of c.studyItems) if (s.status !== 'concluido' && s.dueDate >= now) push(s.dueDate, s.title, 'Material de estudo', 'estudos');
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** O que vence hoje ou já venceu (atividades) e hábitos ainda não marcados hoje. */
export function todayAgenda(state, now = todayISO()) {
  const c = state.collections;
  const tasks = c.tasks.filter((t) => t.status !== 'feito' && t.due && t.due <= now).sort((a, b) => a.due.localeCompare(b.due));
  const habits = c.habits.filter((hb) => hb.active !== false && !(hb.checks || []).includes(now));
  return { tasks, habits };
}
