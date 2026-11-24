// Evolução da interface: proteção de dados ilegíveis, fuso horário do último backup e estados do núcleo.
// Todos os testes usam dados fictícios em armazenamento de memória.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, STORAGE_KEY, RECOVERY_KEY, daysSinceExport, emptyState } from '../js/core/store.js';
import { seed } from '../js/core/seed.js';
import { localDay, daysAgo, toISO } from '../js/core/dates.js';
import { insights } from '../js/core/metrics.js';
import { coreEvent } from '../js/ui/core.js';

function memoryStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), map: m };
}

test('dados ilegíveis: nada é gravado por cima, e uma cópia exata é guardada', () => {
  const broken = '{"schemaVersion": 1, "collections": {"skills": [tru';
  const storage = memoryStorage({ [STORAGE_KEY]: broken });
  const store = createStore({ storage, seed });
  assert.ok(store.loadError, 'detecta o erro');
  assert.equal(storage.getItem(RECOVERY_KEY), broken, 'cópia de recuperação');
  // Interações comuns que antes gravavam por cima:
  store.setSettings({ uiMode: 'produtividade', seenNotifications: ['x'] });
  store.create('tasks', { title: 'Tarefa fictícia', status: 'a_fazer' });
  assert.equal(storage.getItem(STORAGE_KEY), broken, 'o conteúdo original continua intacto');
  assert.equal(store.persistent, false, 'a interface sabe que não está salvando');
  // Só uma decisão explícita (importar/restaurar/recomeçar) volta a gravar.
  store.reset({ withSeed: false });
  assert.notEqual(storage.getItem(STORAGE_KEY), broken);
  assert.equal(store.persistent, true);
  assert.equal(storage.getItem(RECOVERY_KEY), broken, 'a cópia de recuperação permanece');
});

test('dados legíveis continuam sendo salvos normalmente', () => {
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  store.setSettings({ fx: 'essenciais', sound: 'on' });
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).settings.fx, 'essenciais');
  assert.equal(storage.getItem(RECOVERY_KEY), null);
});

test('fuso horário: backup às 23:30 locais conta como hoje, nunca negativo', () => {
  const d = new Date(); d.setHours(23, 30, 0, 0);
  const iso = d.toISOString();
  const s = emptyState();
  s.meta.lastExportAt = iso;
  assert.equal(localDay(iso), toISO(d));
  assert.equal(daysSinceExport(s, toISO(d)), 0);
  const signals = insights(s, toISO(d)).map((x) => x.text).join(' ');
  assert.ok(!/há -\d/.test(signals) && !/Último backup há/.test(signals), 'sem aviso de backup atrasado no mesmo dia');
  assert.equal(localDay('2026-11-24'), '2026-11-24');
  assert.equal(localDay(null), null);
});

test('rótulos de tempo em PT-BR', () => {
  assert.equal(daysAgo(null), 'Nunca');
  assert.equal(daysAgo(0), 'Hoje');
  assert.equal(daysAgo(1), 'Ontem');
  assert.equal(daysAgo(5), 'Há 5 dias');
});

test('núcleo: estados vêm só de mudanças reais nos registros', () => {
  const base = { sessions: 2, recent: [], goalsDone: 1, weekGoals: 2, tasks: 5, tasksDone: 1, assessed: 0 };
  assert.equal(coreEvent(null, base), null, 'primeira visita não inventa evento');
  assert.equal(coreEvent(base, { ...base }), null, 'sem mudança, sem evento');
  assert.equal(coreEvent(base, { ...base, sessions: 3 }).kind, 'progresso');
  assert.equal(coreEvent(base, { ...base, goalsDone: 2, sessions: 3 }).kind, 'meta', 'meta tem prioridade');
  assert.equal(coreEvent(base, { ...base, tasks: 6 }).kind, 'atividade');
  assert.equal(coreEvent(base, { ...base, tasksDone: 2 }).kind, 'progresso');
  assert.equal(coreEvent(base, { ...base, assessed: 1 }).kind, 'atualizado');
});
