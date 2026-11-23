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
