import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, normalizeState, STORAGE_KEY, emptyState } from '../js/core/store.js';
import { seed } from '../js/core/seed.js';
import { validate, coerce, levelScore } from '../js/core/schema.js';
import { addDays, weekStart, weekKey, isValidISO, diffDays, termKey } from '../js/core/dates.js';
import {
  skillProgress, skillGaps, consistency, aiIndependence, goalsSummary, applicationFunnel,
  applicationGaps, habitAdherence, routinePlan, weeklyHours, currentPhase, isBlocked, minutesByWeek,
} from '../js/core/metrics.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), _m: m };
}

test('datas: semana começa na segunda e chave ISO correta', () => {
  assert.equal(weekStart('2026-11-30'), '2026-11-30'); // segunda
  assert.equal(weekStart('2026-12-06'), '2026-11-30'); // domingo
  assert.equal(weekKey('2026-11-30'), '2026-W49');
  assert.equal(weekKey('2027-01-01'), '2026-W53');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(diffDays('2026-11-23', '2026-11-30'), 7);
  assert.ok(isValidISO('2027-02-28'));
  assert.ok(!isValidISO('2027-02-30'));
  assert.equal(termKey('2027-03-10'), '2027/1');
  assert.equal(termKey('2027-08-10'), '2027/2');
});

test('seed: todas as competências começam não avaliadas e referências são válidas', () => {
  const s = emptyState();
  seed(s);
  const c = s.collections;
  assert.ok(c.skills.length >= 40);
  assert.ok(c.skills.every((x) => x.level === 'nao_avaliado'), 'nenhum nível inventado');
  const skillIds = new Set(c.skills.map((x) => x.id));
  for (const col of ['assessments', 'projects', 'studyItems', 'milestones', 'goals', 'experiences']) {
    for (const item of c[col]) for (const id of item.skillIds || []) assert.ok(skillIds.has(id), `${col}: skill inexistente`);
  }
  const msIds = new Set(c.milestones.map((m) => m.id));
  for (const m of c.milestones) for (const d of m.dependsOn) assert.ok(msIds.has(d));
  assert.equal(c.semesters.length, 8);
  assert.equal(c.assessments.length, 10);
  assert.ok(c.studyLogs.length === 0, 'nenhuma sessão de estudo fictícia');
  assert.ok(c.applications.length === 0, 'nenhuma candidatura fictícia');
});

test('progresso: sem avaliação o resultado é null, nunca 0 inventado', () => {
  const s = emptyState();
  seed(s);
  const p = skillProgress(s.collections.skills);
  assert.equal(p.ratio, null);
  assert.equal(p.assessed, 0);
  const skills = [
    { id: 'a', level: 'em_desenvolvimento', target: 'intermediario', category: 'programacao', priority: 'alta' },
    { id: 'b', level: 'avancado', target: 'intermediario', category: 'programacao' },
    { id: 'c', level: 'nao_avaliado', target: 'intermediario', category: 'programacao', priority: 'alta' },
  ];
  const r = skillProgress(skills);
  assert.equal(r.assessed, 2);
  assert.equal(Math.round(r.ratio * 100), Math.round(((2 / 3) + 1) / 2 * 100));
  const gaps = skillGaps(skills);
  assert.deepEqual(gaps.below.map((x) => x.id), ['a']);
  assert.deepEqual(gaps.unassessed.map((x) => x.id), ['c']);
  assert.equal(levelScore('nao_avaliado'), null);
});

test('store: CRUD, persistência, integridade referencial', () => {
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  const skill = store.list('skills')[0];
  const project = store.create('projects', { name: 'X', status: 'ideia', objective: 'o', skillIds: [skill.id] });
  assert.ok(storage.getItem(STORAGE_KEY).includes('"X"'));
  store.update('projects', project.id, { name: 'Y' });
  assert.equal(store.get('projects', project.id).name, 'Y');
  store.remove('skills', skill.id);
  assert.deepEqual(store.get('projects', project.id).skillIds, [], 'referência removida');
  assert.throws(() => store.update('projects', 'nope', {}), /não encontrado/);
  // recarregar do storage
  const again = createStore({ storage, seed });
  assert.equal(again.get('projects', project.id).name, 'Y');
});

test('store: exportar e importar preserva dados; importação rejeita lixo', () => {
  const store = createStore({ storage: memoryStorage(), seed });
  store.create('reflections', { date: '2026-12-01', text: 'teste' });
  const json = store.exportJSON();
  const other = createStore({ storage: memoryStorage(), seed: null });
  other.importJSON(json);
  assert.equal(other.list('reflections').length, 1);
  assert.throws(() => other.importJSON('not json'), /JSON válido/);
  assert.throws(() => other.importJSON('{"foo":1}'), /versão de esquema/);
  assert.throws(() => other.importJSON('{"schemaVersion":99}'), /mais nova/);
  const cleaned = normalizeState({ schemaVersion: 1, collections: { skills: [{ id: 'ok' }, { noid: true }, 'x'], unknown: [1] } });
  assert.equal(cleaned.collections.skills.length, 1);
  assert.equal(cleaned.collections.unknown, undefined);
});

test('store: dado corrompido não é sobrescrito', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{corrompido');
  const store = createStore({ storage, seed });
  assert.ok(store.loadError);
  assert.equal(storage.getItem(STORAGE_KEY), '{corrompido');
});

test('validação: obrigatórios, URL segura, datas, números', () => {
  const errs = validate('projects', { name: '', status: 'ideia', objective: 'x', repoUrl: 'javascript:alert(1)' });
  assert.ok(errs.name);
  assert.ok(errs.repoUrl);
  assert.deepEqual(validate('studyLogs', { date: '2026-12-01', minutes: 50, kind: 'pratica', aiUse: 'nenhuma' }), {});
  assert.ok(validate('studyLogs', { date: '2026-13-01', minutes: 2, kind: 'pratica', aiUse: 'nenhuma' }).date);
  assert.ok(validate('studyLogs', { date: '2026-12-01', minutes: 2, kind: 'pratica', aiUse: 'nenhuma' }).minutes);
  assert.ok(validate('goals', { title: 'a', horizon: 'mes', area: 'tecnico', status: 'ativa', periodStart: '2026-12-10', due: '2026-12-01' }).due);
  const c = coerce('projects', { name: ' A ', tech: 'Python, Flask ,', skillIds: undefined });
  assert.equal(c.name, 'A');
  assert.deepEqual(c.tech, ['Python', 'Flask']);
  assert.deepEqual(c.skillIds, []);
});

test('métricas: consistência, independência de IA, metas, funil', () => {
  const now = '2026-12-28';
  const sessions = [{ date: '2026-12-27', minutes: 60 }, { date: '2026-12-26', minutes: 30 }, { date: '2026-12-26', minutes: 10 }];
  const cons = consistency(sessions, 28, now);
  assert.equal(cons.activeDays, 2);
  assert.equal(consistency([], 28, now).ratio, null);
  const indep = aiIndependence([
    { date: '2026-12-20', minutes: 60, aiUse: 'nenhuma' },
    { date: '2026-12-21', minutes: 40, aiUse: 'geracao' },
  ], 30, now);
  assert.equal(indep.ratio, 0.6);
  assert.equal(indep.generatedRatio, 0.4);
  const g = goalsSummary([
    { status: 'cumprida' }, { status: 'nao_cumprida' }, { status: 'ativa', due: '2026-12-01' }, { status: 'ativa', due: '2027-01-10' },
  ], now);
  assert.equal(g.late.length, 1);
  assert.equal(g.hitRate, 0.5);
  const f = applicationFunnel([{ status: 'reprovado', stageHistory: ['candidatura', 'entrevista'] }, { status: 'candidatura' }]);
  assert.equal(f.candidatura, 2);
  assert.equal(f.entrevista, 1);
  assert.equal(f.oferta, 0);
  const wk = minutesByWeek(sessions, 2, now);
  assert.equal(wk.length, 2);
  assert.equal(wk[0].minutes, 100); // 28/12 é segunda: as sessões caem na semana anterior
  assert.equal(wk[1].minutes, 0);
});

test('métricas: lacunas de vaga ligam ao Skill Tracker', () => {
  const skills = [{ id: 's1', level: 'intermediario', target: 'intermediario' }, { id: 's2', level: 'introdutorio', target: 'intermediario' }, { id: 's3', level: 'nao_avaliado', target: 'intermediario' }];
  const gaps = applicationGaps({ requiredSkills: ['s1', 's2', 's3', 'apagada'] }, skills);
  assert.deepEqual(gaps.map((s) => s.id), ['s2', 's3']);
});

test('hábitos: sem marcações = não avaliado; com marcações calcula aderência', () => {
  assert.equal(habitAdherence([{ targetPerWeek: 3, checks: [] }], 4, '2026-12-28').ratio, null);
  const r = habitAdherence([{ targetPerWeek: 2, checks: ['2026-12-28', '2026-12-29'] }], 1, '2026-12-29');
  assert.equal(r.ratio, 1);
});

test('rotina: horas e distribuição por fase', () => {
  const settings = { routineMode: 'normal', availability: { seg: 2, ter: 2, qua: 2, qui: 2, sex: 2, sab: 0, dom: 0 } };
  assert.equal(weeklyHours(settings), 10);
  assert.equal(weeklyHours({ ...settings, routineMode: 'minima' }), 3.5);
  const plan = routinePlan(settings, 1);
  assert.equal(plan.reduce((a, p) => a + p.hours, 0), 10);
  assert.equal(currentPhase('2026-11-23').value, 1);
  assert.equal(currentPhase('2027-03-01').value, 2);
  assert.equal(currentPhase('2029-05-01').value, 4);
});

test('roadmap: marco bloqueado enquanto dependência não termina', () => {
  const all = [{ id: 'a', status: 'planejado' }, { id: 'b', status: 'planejado', dependsOn: ['a'] }];
  assert.ok(isBlocked(all[1], all));
  all[0].status = 'concluido';
  assert.ok(!isBlocked(all[1], all));
});

test('grade oficial: cargas por período e sincronização preserva registros', async () => {
  const { SEMESTERS, totalHours, mergeSemester, CURRICULUM_VERSION } = await import('../js/data/curriculum.js');
  const { syncCurriculum } = await import('../js/core/seed.js');
  assert.deepEqual(SEMESTERS.map(totalHours), [536, 620, 708, 648, 536, 494, 464, 516]);
  assert.equal(SEMESTERS.length, 8);
  // nomes antigos com acento diferente casam com o oficial e mantêm o status
  let n = 0;
  const merged = mergeSemester({ disciplines: [{ id: 'd1', name: 'Introdução à Algoritmos', status: 'concluida', grade: 9 }] }, SEMESTERS[0], () => `new${n++}`);
  const intro = merged.disciplines.find((d) => d.name === 'Introdução a Algoritmos');
  assert.equal(intro.id, 'd1');
  assert.equal(intro.status, 'concluida');
  assert.equal(intro.grade, 9);
  // estado antigo (sem versão de grade) é atualizado; status do semestre é mantido
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  const s1 = store.list('semesters').find((s) => s.number === 1);
  store.update('semesters', s1.id, { status: 'cursando', disciplines: [{ id: 'x', name: 'Introdução à Algoritmos', hours: 144, status: 'concluida' }] });
  store.state.meta.curriculumVersion = 'antiga';
  store.setProfile({ university: 'Engenharia de Software — PUC Minas (início em 2027; campus a confirmar)' });
  assert.equal(syncCurriculum(store), true);
  const after = store.list('semesters').find((s) => s.number === 1);
  assert.equal(after.status, 'cursando');
  assert.equal(after.disciplines.length, 7);
  assert.equal(after.disciplines.find((d) => d.id === 'x').status, 'concluida');
  assert.match(store.state.profile.university, /Coração Eucarístico, noturno/);
  assert.equal(syncCurriculum(store), false, 'idempotente');
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).meta.curriculumVersion, CURRICULUM_VERSION, 'versão persistida');
});

test('rotina: cenários com e sem estágio e ajuste pela carga do semestre', async () => {
  const { WORK_SCENARIOS, loadFactor, currentSemester, semesterHours } = await import('../js/core/metrics.js');
  const { SEMESTERS } = await import('../js/data/curriculum.js');
  const base = { routineMode: 'normal', availability: { seg: 2, ter: 2, qua: 2, qui: 2, sex: 1.5, sab: 3, dom: 1 } };
  assert.equal(weeklyHours(base), 13.5, 'sem estágio usa a disponibilidade antiga (dados preservados)');
  assert.equal(weeklyHours({ ...base, workScenario: 'estagio_30h' }), 5.5, 'padrão do estágio 30 h');
  assert.equal(weeklyHours({ ...base, workScenario: 'estagio_20h', availabilityIntern20: { sab: 4 } }), 4, 'disponibilidade editada vence o padrão');
  assert.equal(weeklyHours({ ...base, routineMode: 'ferias' }), 22, 'férias com padrão');
  assert.equal(WORK_SCENARIOS.length, 3);
  const third = { disciplines: SEMESTERS[2].disciplines };
  assert.equal(semesterHours(third), 708);
  assert.equal(Math.round(loadFactor(third) * 100), 80);
  assert.equal(loadFactor({ disciplines: SEMESTERS[0].disciplines }), 1);
  const plan = routinePlan(base, 3, { semester: third });
  assert.equal(plan.declared, 13.5);
  assert.equal(plan.total, 11);
  assert.equal(routinePlan({ ...base, routineMode: 'ferias' }, 3, { semester: third }).factor, 1, 'férias não aplicam o fator');
  const sems = SEMESTERS.map((s, i) => ({ ...s, id: `s${i}`, status: 'futuro' }));
  assert.equal(currentSemester(sems, '2028-03-10').number, 3);
  assert.equal(currentSemester(sems, '2026-12-01'), null);
  sems[0].status = 'cursando';
  assert.equal(currentSemester(sems, '2028-03-10').number, 1, 'o marcado como cursando prevalece');
});

test('atualização do plano: acrescenta e ajusta sem apagar nem sobrescrever o que você editou', async () => {
  const { applyPlanUpdates, PLAN_UPDATES, syncCurriculum } = await import('../js/core/seed.js');
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  const st = store.state;
  // simula um usuário da versão anterior
  st.meta.appliedUpdates = [];
  const ms = (t) => store.list('milestones').find((m) => m.title === t);
  store.update('milestones', ms('Java + Spring Boot em nível intermediário').id, { due: '2028-06-30', period: '2028/1', description: 'Uma API Spring com testes.' });
  const icM = ms('Candidatura a iniciação científica na PUC Minas');
  store.update('milestones', icM.id, { due: '2028-03-31', period: '2028/1', description: 'minha versão' }); // só a descrição foi editada pelo usuário
  const mathml = store.list('milestones').find((m) => m.title.startsWith('Álgebra Linear I e II'));
  store.update('milestones', mathml.id, { title: 'Matemática para ML + primeiro curso de ML', phase: 3, due: '2028-12-31', period: '2028', description: 'Álgebra linear, probabilidade e um curso de ML concluído com exercícios.' });
  for (const t of ['Confirmar a matriz curricular vinculada à matrícula de 2027', '3º período (708 h) concluído sem sobrecarga', 'Matemática Discreta completa (fora da grade)']) store.remove('milestones', ms(t).id);
  store.remove('skills', store.list('skills').find((s) => s.name === 'Computabilidade e teoria da computação').id);
  const disc = store.list('skills').find((s) => s.name === 'Matemática discreta');
  store.update('skills', disc.id, { nextAction: 'Fazer a avaliação diagnóstica correspondente.', targetDate: '2028-06-30', target: 'em_desenvolvimento' });
  const lin = store.list('skills').find((s) => s.name === 'Álgebra linear');
  store.update('skills', lin.id, { nextAction: 'Meu próprio plano', level: 'introdutorio', history: [{ date: '2027-01-10', from: 'nao_avaliado', to: 'introdutorio', note: 'teste' }] });
  store.remove('goals', store.list('goals').find((g) => g.title.startsWith('2028/1 (3º período')).id);
  store.remove('tasks', store.list('tasks').find((t) => t.title.startsWith('Confirmar a matriz')).id);
  store.create('studyLogs', { date: '2026-12-01', minutes: 50, kind: 'pratica', aiUse: 'nenhuma' });
  const counts = Object.fromEntries(Object.entries(st.collections).map(([k, v]) => [k, v.length]));

  assert.deepEqual(applyPlanUpdates(store), PLAN_UPDATES.map((u) => u.id));
  assert.equal(ms('Java + Spring Boot em nível intermediário').due, '2028-12-15', 'marco original ajustado');
  const icAfter = ms('Candidatura a iniciação científica na PUC Minas');
  assert.equal(icAfter.description, 'minha versão', 'marco editado pelo usuário preservado');
  assert.equal(icAfter.due, '2028-03-31', 'nenhum campo do marco editado é alterado');
  const newMath = store.list('milestones').find((m) => m.id === mathml.id);
  assert.equal(newMath.phase, 4);
  assert.equal(newMath.due, '2029-07-15');
  assert.ok(ms('3º período (708 h) concluído sem sobrecarga').dependsOn.length === 1, 'dependência resolvida');
  assert.ok(store.list('skills').some((s) => s.name === 'Computabilidade e teoria da computação'));
  const d2 = store.get('skills', disc.id);
  assert.match(d2.nextAction, /Discreta I em 2027\/2/);
  assert.equal(d2.target, 'intermediario');
  const l2 = store.get('skills', lin.id);
  assert.equal(l2.nextAction, 'Meu próprio plano', 'ação editada preservada');
  assert.equal(l2.level, 'introdutorio', 'nível preservado');
  assert.equal(l2.history.length, 1, 'histórico preservado');
  assert.equal(store.list('studyLogs').length, 1, 'sessões preservadas');
  assert.equal(store.list('milestones').length, counts.milestones + 3);
  assert.equal(store.list('skills').length, counts.skills + 1);
  assert.equal(store.list('goals').length, counts.goals + 1);
  assert.equal(store.list('tasks').length, counts.tasks + 1);
  // idempotente
  assert.deepEqual(applyPlanUpdates(store), []);
  assert.equal(store.list('milestones').length, counts.milestones + 3);
  // persistido
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)).meta.appliedUpdates, PLAN_UPDATES.map((u) => u.id));

  // revisão do plano não sobrescreve disciplinas editadas pelo usuário
  const s3 = store.list('semesters').find((s) => s.number === 3);
  store.update('semesters', s3.id, { disciplines: [{ id: 'mine', name: 'Disciplina da minha matriz', hours: 60, status: 'futura' }], disciplinesEditedAt: '2027-02-01' });
  st.meta.curriculumPlanRev = 1;
  assert.equal(syncCurriculum(store), true);
  const s3b = store.get('semesters', s3.id);
  assert.equal(s3b.disciplines.length, 1, 'disciplinas editadas mantidas');
  assert.match(s3b.parallel, /708 h/, 'texto do plano atualizado');
  const s1 = store.list('semesters').find((s) => s.number === 1);
  assert.equal(s1.disciplines.length, 7, 'semestre não editado mantém a matriz');
});

test('padrão brasileiro: datas DD/MM/AAAA e horário 24 h', async () => {
  const { fmtDate, fmtDateTime } = await import('../js/core/dates.js');
  assert.equal(fmtDate('2026-11-30'), '30/11/2026');
  assert.equal(fmtDate('2027-03-05', { year: false }), '05/03');
  assert.equal(fmtDate(null), '—');
  assert.equal(fmtDateTime(new Date(2026, 11, 1, 21, 7).toISOString()), '01/12/2026 21:07');
});

test('painel: próximas entregas e agenda do dia vêm só de datas registradas', async () => {
  const { upcoming, todayAgenda } = await import('../js/core/metrics.js');
  const s = emptyState();
  const now = '2026-12-01';
  s.collections.tasks.push({ id: 't1', title: 'Hoje', status: 'a_fazer', due: '2026-12-01' }, { id: 't2', title: 'Atrasada', status: 'a_fazer', due: '2026-11-28' }, { id: 't3', title: 'Futura', status: 'a_fazer', due: '2026-12-05' }, { id: 't4', title: 'Feita', status: 'feito', due: '2026-12-02' }, { id: 't5', title: 'Sem prazo', status: 'a_fazer' });
  s.collections.applications.push({ id: 'a1', company: 'X', role: 'Estágio', status: 'entrevista', nextDate: '2026-12-03' }, { id: 'a2', company: 'Y', role: 'Estágio', status: 'reprovado', nextDate: '2026-12-03' });
  s.collections.milestones.push({ id: 'm1', title: 'Longe', status: 'planejado', due: '2027-06-01' });
  s.collections.habits.push({ id: 'h1', name: 'Inglês', active: true, checks: ['2026-12-01'] }, { id: 'h2', name: 'Código', active: true, checks: [] });
  const up = upcoming(s, now, 14);
  assert.deepEqual(up.map((x) => x.title), ['X — Estágio', 'Futura']);
  const ag = todayAgenda(s, now);
  assert.deepEqual(ag.tasks.map((t) => t.title), ['Atrasada', 'Hoje']);
  assert.deepEqual(ag.habits.map((x) => x.name), ['Código']);
});
