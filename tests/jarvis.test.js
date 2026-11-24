// Fase 1 do JARVIS: backup, integridade, busca e atualização de identidade.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, emptyState, STORAGE_KEY } from '../js/core/store.js';
import { seed, applyPlanUpdates, upgradeIsPending } from '../js/core/seed.js';
import {
  buildBackup, verifyBackup, toCSV, auditData, repairReferences, createSnapshot, listSnapshots, readSnapshot,
  memoryBackend, MAX_SNAPSHOTS, countsOf,
} from '../js/core/backup.js';
import { buildIndex, search } from '../js/core/search.js';

function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}
const seeded = () => { const s = emptyState(); seed(s); return s; };

test('backup: selo SHA-256 confere; arquivo adulterado é recusado', async () => {
  const s = seeded();
  const { json, hash, counts } = await buildBackup(s);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(counts.skills, s.collections.skills.length);
  const ok = await verifyBackup(json);
  assert.equal(ok.ok, true);
  assert.equal(ok.hashStatus, 'ok');
  assert.equal(ok.app, 'JARVIS');
  const tampered = JSON.parse(json);
  tampered.collections.skills[0].level = 'avancado';
  const bad = await verifyBackup(JSON.stringify(tampered));
  assert.equal(bad.ok, false);
  assert.equal(bad.hashStatus, 'divergente');
});

test('backup: arquivos antigos do CAREER OS (sem selo) continuam aceitos', async () => {
  const store = createStore({ storage: memoryStorage(), seed });
  const legacy = JSON.parse(store.exportJSON());
  legacy.app = 'CAREER OS';
  delete legacy.integrity;
  const v = await verifyBackup(JSON.stringify(legacy));
  assert.equal(v.ok, true);
  assert.equal(v.hashStatus, 'ausente');
  assert.ok(v.warnings.some((w) => w.includes('sem selo')));
  assert.deepEqual(countsOf(v.state), countsOf(store.state));
});

test('backup: entradas inválidas não passam e nada é alterado', async () => {
  assert.equal((await verifyBackup('não é json')).ok, false);
  assert.equal((await verifyBackup('{"app":"Outro"}')).ok, false);
  const s = seeded();
  s.collections.skills.push({ semId: true });
  const { json } = await buildBackup(s);
  const v = await verifyBackup(json);
  assert.ok(v.warnings.some((w) => w.includes('malformado')));
});

test('CSV: separador ";", BOM, vírgula decimal, aspas, proteção contra fórmula e nomes no lugar de ids', () => {
  const s = emptyState();
  s.collections.skills.push({ id: 'sk1', name: 'SQL', category: 'dados', level: 'nao_avaliado', target: 'intermediario' });
  s.collections.studyLogs.push({ id: 'l1', date: '2026-12-01', minutes: 90.5, kind: 'pratica', aiUse: 'nenhuma', skillIds: ['sk1'], learned: 'JOIN; "LEFT"\nsegunda linha' });
  s.collections.reflections.push({ id: 'r1', date: '2026-12-01', text: '=SOMA(A1)' });
  const csv = toCSV(s, 'studyLogs');
  assert.ok(csv.startsWith('﻿id;'));
  assert.ok(csv.includes(';90,5;'));
  assert.ok(csv.includes(';SQL;') || csv.includes(';SQL\r\n') || csv.includes('SQL'));
  assert.ok(!csv.includes('sk1;'), 'id da competência trocado pelo nome');
  assert.ok(csv.includes('"JOIN; ""LEFT""\nsegunda linha"'));
  assert.ok(toCSV(s, 'reflections').includes("'=SOMA(A1)"));
});

test('integridade: detecta referência quebrada e ids repetidos; o reparo não apaga registros', () => {
  const s = seeded();
  const total = Object.values(countsOf(s)).reduce((a, b) => a + b, 0);
  s.collections.projects[0].skillIds.push('fantasma');
  s.collections.tasks[0].skillId = 'fantasma2';
  s.collections.goals.push({ ...s.collections.goals[0] });
  const r = auditData(s);
  assert.equal(r.issues.filter((i) => i.ref).length, 2);
  assert.equal(r.issues.filter((i) => i.level === 'erro').length, 1);
  const { state, fixed } = repairReferences(s);
  assert.equal(fixed, 2);
  assert.equal(Object.values(countsOf(state)).reduce((a, b) => a + b, 0), total + 1, 'nenhum registro apagado');
  assert.equal(auditData(state).issues.filter((i) => i.ref).length, 0);
});

test('pontos de restauração: criar, listar sem os dados, restaurar e manter só os mais recentes', async () => {
  const backend = memoryBackend();
  const s = seeded();
  for (let i = 0; i < MAX_SNAPSHOTS + 3; i++) await createSnapshot(backend, s, `ponto ${i}`, new Date(2026, 10, 24, 10, i));
  const list = await listSnapshots(backend);
  assert.equal(list.length, MAX_SNAPSHOTS);
  assert.equal(list[0].reason, `ponto ${MAX_SNAPSHOTS + 2}`, 'mais recente primeiro');
  assert.equal(list[0].data, undefined, 'a lista não carrega os dados');
  const restored = await readSnapshot(backend, list[0].id);
  assert.deepEqual(countsOf(restored), countsOf(s));
});

test('store: histórico de backups e substituição de estado validado', () => {
  const store = createStore({ storage: memoryStorage(), seed });
  store.markExported({ kind: 'json', filename: 'a.json', bytes: 10 });
  store.markExported({ kind: 'csv', filename: 'b.csv', bytes: 5 });
  assert.equal(store.state.meta.backupHistory.length, 2);
  assert.equal(store.state.meta.backupHistory[0].filename, 'b.csv');
  const other = seeded();
  other.collections.reflections.push({ id: 'x', date: '2026-12-01', text: 'oi' });
  store.replaceState(other);
  assert.equal(store.list('reflections').length, 1);
});

test('busca global: ignora acentos, exige todas as palavras e prioriza o título', () => {
  const s = seeded();
  const idx = buildIndex(s, { modules: [{ id: 'backup', label: 'Central de Backup' }], docs: [{ id: 'x', title: 'Política de uso de IA' }] });
  const r = search(idx, 'algebra linear');
  assert.equal(r[0].title, 'Álgebra linear');
  assert.ok(search(idx, 'calculo ii').some((x) => x.title === 'Cálculo II' && x.kind === 'discipline'));
  assert.equal(search(idx, 'backup')[0].kind, 'module');
  assert.ok(search(idx, 'politica ia').some((x) => x.kind === 'doc'));
  assert.deepEqual(search(idx, '   '), []);
  assert.deepEqual(search(idx, 'zzzzinexistente'), []);
});

test('atualização de identidade: renomeia textos antigos só onde não foram editados', () => {
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  // simula dados da época do CAREER OS
  store.state.meta.appliedUpdates = store.state.meta.appliedUpdates.filter((id) => id !== '2026-11-24-jarvis-identidade');
  const proj = store.list('projects').find((p) => p.name === 'JARVIS');
  store.update('projects', proj.id, { name: 'CAREER OS', objective: 'Sistema pessoal de desenvolvimento acadêmico e de carreira.', description: 'Minha descrição' });
  const t1 = store.list('tasks').find((t) => t.title.startsWith('Exportar o primeiro backup'));
  store.update('tasks', t1.id, { title: 'Exportar o primeiro backup do CAREER OS' });
  const t2 = store.list('tasks').find((t) => t.title.startsWith('Primeira revisão semanal'));
  store.update('tasks', t2.id, { title: 'Primeira revisão semanal no CAREER OS (minha versão)' });
  const goal = store.list('goals').find((g) => g.title.startsWith('Dezembro: 5 candidaturas'));
  store.update('goals', goal.id, { title: 'Dezembro: 5 candidaturas registradas no Career Tracker', current: 3 });
  assert.equal(upgradeIsPending(store.state), true);

  assert.deepEqual(applyPlanUpdates(store), ['2026-11-24-jarvis-identidade']);
  const p2 = store.get('projects', proj.id);
  assert.equal(p2.name, 'JARVIS');
  assert.equal(p2.description, 'Minha descrição', 'descrição editada preservada');
  assert.equal(store.get('tasks', t1.id).title, 'Exportar o primeiro backup do JARVIS (Central de Backup)');
  assert.equal(store.get('tasks', t2.id).title, 'Primeira revisão semanal no CAREER OS (minha versão)', 'texto editado preservado');
  const g2 = store.get('goals', goal.id);
  assert.equal(g2.title, 'Dezembro: 5 candidaturas registradas em Oportunidades Profissionais');
  assert.equal(g2.current, 3, 'progresso preservado');
  assert.equal(upgradeIsPending(store.state), false);
  assert.ok(JSON.parse(storage.getItem(STORAGE_KEY)).meta.appliedUpdates.includes('2026-11-24-jarvis-identidade'));
  assert.deepEqual(applyPlanUpdates(store), [], 'idempotente');
});

test('instalação nova não tem atualização pendente (não cria pontos de restauração à toa)', () => {
  const store = createStore({ storage: memoryStorage(), seed });
  assert.equal(upgradeIsPending(store.state), false);
});
