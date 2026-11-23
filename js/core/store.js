// Estado da aplicação + persistência local + backup.
// A lógica de estado é pura (createStore recebe um "storage"), o que permite testar em Node.
import { today } from './dates.js';

export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'careeros:v1';

export const COLLECTIONS = [
  'skills', 'studyItems', 'studyLogs', 'tasks', 'goals', 'projects', 'applications', 'companies',
  'experiences', 'englishAssessments', 'vocab', 'englishLogs', 'habits', 'readings', 'reflections',
  'reviews', 'opportunities', 'milestones', 'semesters', 'assessments',
];

export function uid(prefix = 'id') {
  const rand = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function emptyState() {
  const collections = {};
  for (const c of COLLECTIONS) collections[c] = [];
  return {
    schemaVersion: SCHEMA_VERSION,
    meta: { createdAt: new Date().toISOString(), lastExportAt: null, seededAt: null },
    settings: {
      theme: 'dark',
      routineMode: 'normal',
      availability: { seg: 2, ter: 2, qua: 2, qui: 2, sex: 1.5, sab: 3, dom: 1 },
      weeklyReviewDay: 'dom',
    },
    profile: {},
    collections,
  };
}

/** Garante que um estado importado tem a forma esperada (sem confiar no arquivo). */
export function normalizeState(input) {
  if (!input || typeof input !== 'object') throw new Error('Arquivo sem dados do CAREER OS.');
  if (typeof input.schemaVersion !== 'number') throw new Error('Arquivo sem versão de esquema. Não parece um backup do CAREER OS.');
  if (input.schemaVersion > SCHEMA_VERSION) throw new Error('Backup criado por uma versão mais nova do CAREER OS.');
  const base = emptyState();
  const state = {
    schemaVersion: SCHEMA_VERSION,
    meta: { ...base.meta, ...(isPlainObject(input.meta) ? input.meta : {}) },
    settings: { ...base.settings, ...(isPlainObject(input.settings) ? input.settings : {}) },
    profile: isPlainObject(input.profile) ? input.profile : {},
    collections: {},
  };
  state.settings.availability = { ...base.settings.availability, ...(isPlainObject(input.settings?.availability) ? input.settings.availability : {}) };
  for (const c of COLLECTIONS) {
    const list = input.collections?.[c];
    state.collections[c] = Array.isArray(list)
      ? list.filter((item) => isPlainObject(item) && typeof item.id === 'string')
      : [];
  }
  return migrate(state);
}

/** Ponto único de migração entre versões de esquema. */
export function migrate(state) {
  // v1 é a primeira versão. Novas versões adicionam passos aqui, em ordem.
  return state;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

/**
 * storage: objeto com getItem/setItem (localStorage no navegador, Map falso nos testes).
 * Retorna API de CRUD com notificação de mudanças.
 */
export function createStore({ storage, seed } = {}) {
  let persistent = true;
  let state;
  let loadError = null;
  const listeners = new Set();

  try {
    const raw = storage?.getItem(STORAGE_KEY);
    state = raw ? normalizeState(JSON.parse(raw)) : null;
  } catch (err) {
    loadError = err;
    state = null;
  }
  if (!state) {
    state = emptyState();
    if (seed) seed(state);
    if (!loadError) save();
  }

  function save() {
    if (!storage) { persistent = false; return; }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(state));
      persistent = true;
    } catch {
      persistent = false;
    }
  }

  function emit(change) {
    save();
    for (const fn of listeners) fn(change);
  }

  const api = {
    get state() { return state; },
    get persistent() { return persistent; },
    get loadError() { return loadError; },

    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },

    list(collection) { return state.collections[collection] || []; },
    get(collection, id) { return api.list(collection).find((item) => item.id === id) || null; },

    create(collection, data) {
      if (!COLLECTIONS.includes(collection)) throw new Error(`Coleção desconhecida: ${collection}`);
      const now = new Date().toISOString();
      const item = { ...clone(data), id: data.id || uid(collection.slice(0, 3)), createdAt: now, updatedAt: now };
      state.collections[collection].push(item);
      emit({ type: 'create', collection, id: item.id });
      return item;
    },

    update(collection, id, patch) {
      const list = state.collections[collection];
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('Registro não encontrado. Ele pode ter sido excluído.');
      const next = { ...list[index], ...clone(patch), id, updatedAt: new Date().toISOString() };
      list[index] = next;
      emit({ type: 'update', collection, id });
      return next;
    },

    remove(collection, id) {
      const list = state.collections[collection];
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) return false;
      list.splice(index, 1);
      removeReferences(state, collection, id);
      emit({ type: 'remove', collection, id });
      return true;
    },

    setSettings(patch) {
      state.settings = { ...state.settings, ...clone(patch) };
      emit({ type: 'settings' });
    },

    setProfile(patch) {
      state.profile = { ...state.profile, ...clone(patch) };
      emit({ type: 'profile' });
    },

    exportJSON() {
      const payload = { ...clone(state), exportedAt: new Date().toISOString(), app: 'CAREER OS' };
      return JSON.stringify(payload, null, 2);
    },

    markExported() {
      state.meta.lastExportAt = new Date().toISOString();
      emit({ type: 'meta' });
    },

    importJSON(text) {
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new Error('O arquivo não é um JSON válido.'); }
      state = normalizeState(parsed);
      loadError = null;
      emit({ type: 'import' });
      return state;
    },

    reset({ withSeed = true } = {}) {
      state = emptyState();
      if (withSeed && seed) seed(state);
      loadError = null;
      emit({ type: 'reset' });
    },
  };
  return api;
}

/** Remove IDs apagados das listas de referência de outros registros (integridade). */
export function removeReferences(state, collection, id) {
  const refFields = {
    skills: ['skillIds', 'requiredSkills', 'skillId'],
    projects: ['projectIds', 'projectId'],
    studyItems: ['studyItemId'],
    milestones: ['dependsOn'],
  }[collection];
  if (!refFields) return;
  for (const c of COLLECTIONS) {
    for (const item of state.collections[c]) {
      for (const f of refFields) {
        if (Array.isArray(item[f])) item[f] = item[f].filter((x) => x !== id);
        else if (item[f] === id) item[f] = null;
      }
    }
  }
}

/** Data do último backup em dias (null se nunca). */
export function daysSinceExport(state, now = today()) {
  if (!state.meta.lastExportAt) return null;
  const last = state.meta.lastExportAt.slice(0, 10);
  return Math.round((new Date(now) - new Date(last)) / 86400000);
}
