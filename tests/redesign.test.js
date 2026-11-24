// Redesign da interface: notificações derivadas dos dados, medidas do núcleo e preservação das
// novas preferências de aparência (campos opcionais em settings, mesma chave careeros:v1).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStore, emptyState, normalizeState, STORAGE_KEY } from '../js/core/store.js';
import { seed } from '../js/core/seed.js';
import { buildNotifications, unseenCount, markSeen, MAX_SEEN } from '../js/core/notifications.js';
import { buildBackup, verifyBackup } from '../js/core/backup.js';

const NOW = '2026-11-24';
const seeded = () => { const s = emptyState(); seed(s); return s; };
function memoryStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('notificações: atrasadas, de hoje e próximas 3 dias vêm só dos registros', () => {
  const s = seeded();
  s.collections.tasks = [
    { id: 't1', title: 'Atrasada', status: 'a_fazer', due: '2026-11-20' },
    { id: 't2', title: 'Hoje', status: 'a_fazer', due: NOW },
    { id: 't3', title: 'Em 2 dias', status: 'a_fazer', due: '2026-11-26' },
    { id: 't4', title: 'Em 10 dias', status: 'a_fazer', due: '2026-12-04' },
    { id: 't5', title: 'Feita', status: 'feito', due: '2026-11-20' },
  ];
  const list = buildNotifications(s, NOW);
  const titles = list.map((n) => n.title);
  assert.ok(titles.includes('Atrasada'));
  assert.ok(titles.includes('Hoje'));
  assert.ok(titles.includes('Em 2 dias'));
  assert.ok(!titles.includes('Em 10 dias'));
  assert.ok(!titles.includes('Feita'));
  assert.equal(list.find((n) => n.title === 'Atrasada').tone, 'bad');
  assert.ok(list.every((n) => typeof n.key === 'string' && n.route));
  assert.equal(new Set(list.map((n) => n.key)).size, list.length, 'chaves únicas');
});

test('notificações: marcar como vistas zera o contador e respeita o limite', () => {
  const s = seeded();
  const list = buildNotifications(s, NOW);
  assert.ok(unseenCount(list, []) === list.length);
  const seen = markSeen(list, []);
  assert.equal(unseenCount(list, seen), 0);
  const many = Array.from({ length: MAX_SEEN + 50 }, (_, i) => `k${i}`);
  assert.ok(markSeen(list, many).length <= MAX_SEEN);
});

test('preferências de aparência: sobrevivem a recarregar, backup e importação sem tocar nos dados', async () => {
  const storage = memoryStorage();
  const store = createStore({ storage, seed });
  const before = JSON.stringify(store.state.collections);
  store.setSettings({ uiMode: 'produtividade', sidebarCollapsed: true, motion: 'reduced', seenNotifications: ['a', 'b'] });
  assert.equal(JSON.stringify(store.state.collections), before, 'coleções intactas');
  assert.ok(storage.getItem(STORAGE_KEY), 'mesma chave careeros:v1');
  const reloaded = createStore({ storage, seed });
  assert.equal(reloaded.state.settings.uiMode, 'produtividade');
  assert.equal(reloaded.state.settings.sidebarCollapsed, true);
  assert.equal(reloaded.state.settings.motion, 'reduced');
  const { json } = await buildBackup(reloaded.state);
  const v = await verifyBackup(json);
  assert.ok(v.ok);
  assert.equal(v.state.settings.uiMode, 'produtividade');
  assert.deepEqual(v.state.settings.seenNotifications, ['a', 'b']);
});

test('estado antigo sem as novas preferências continua válido (padrões aplicados na interface)', () => {
  const old = seeded();
  delete old.settings.uiMode; delete old.settings.sidebarCollapsed; delete old.settings.motion;
  const n = normalizeState(JSON.parse(JSON.stringify(old)));
  assert.equal(n.settings.uiMode, undefined);
  assert.equal(n.collections.skills.length, old.collections.skills.length);
});
