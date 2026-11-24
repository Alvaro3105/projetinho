// Central de Backup: integridade, exportação (JSON e CSV), verificação de arquivos,
// pontos de restauração e auditoria dos dados. Funções puras sempre que possível.
import { normalizeState, COLLECTIONS, SCHEMA_VERSION } from './store.js';
import { FIELDS } from './schema.js';
import { isValidISO } from './dates.js';
import { BRAND } from './brand.js';

export const BACKUP_FORMAT = 2;
export const MAX_SNAPSHOTS = 10;
export const ACCEPTED_APPS = [BRAND.name, BRAND.formerName];

export const COLLECTION_LABELS = {
  skills: 'Competências', studyItems: 'Materiais de estudo', studyLogs: 'Sessões de estudo', tasks: 'Atividades',
  goals: 'Metas', projects: 'Projetos', applications: 'Candidaturas', companies: 'Empresas', experiences: 'Experiências',
  englishAssessments: 'Avaliações de inglês', vocab: 'Vocabulário', englishLogs: 'Práticas de inglês', habits: 'Hábitos',
  readings: 'Leituras', reflections: 'Reflexões', reviews: 'Revisões', opportunities: 'Oportunidades e pesquisa',
  milestones: 'Marcos do plano', semesters: 'Semestres', assessments: 'Avaliações diagnósticas',
};

export function countsOf(state) {
  return Object.fromEntries(COLLECTIONS.map((c) => [c, (state.collections?.[c] || []).length]));
}

/** Conteúdo protegido pelo hash: tudo o que é seu, sem metadados de exportação. */
export function integrityPayload(state) {
  return JSON.stringify({ schemaVersion: state.schemaVersion, settings: state.settings, profile: state.profile, collections: state.collections });
}

export async function sha256Hex(text) {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) return null; // contexto inseguro (ex.: arquivo local): sem hash, avisado na interface
  const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Monta o arquivo de backup completo com selo de integridade. */
export async function buildBackup(state, now = new Date()) {
  const hash = await sha256Hex(integrityPayload(state));
  const counts = countsOf(state);
  const payload = {
    app: BRAND.name,
    backupFormat: BACKUP_FORMAT,
    exportedAt: now.toISOString(),
    integrity: { algorithm: 'SHA-256', hash, counts },
    ...JSON.parse(JSON.stringify(state)),
  };
  const json = JSON.stringify(payload, null, 2);
  return { json, hash, counts, bytes: new Blob([json]).size, exportedAt: payload.exportedAt };
}

/**
 * Verifica um arquivo de backup SEM alterar nada. Retorna o estado normalizado e o diagnóstico.
 * hashStatus: 'ok' | 'divergente' | 'ausente' | 'indisponivel'
 */
export async function verifyBackup(text) {
  const result = { ok: false, errors: [], warnings: [], state: null, counts: null, exportedAt: null, app: null, hashStatus: 'ausente' };
  let parsed;
  try { parsed = JSON.parse(text); } catch { result.errors.push('O arquivo não é um JSON válido.'); return result; }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) { result.errors.push('O arquivo não contém dados do JARVIS.'); return result; }
  result.app = parsed.app || null;
  if (parsed.app && !ACCEPTED_APPS.includes(parsed.app)) result.warnings.push(`O arquivo diz ser de "${parsed.app}", não do JARVIS.`);
  try {
    result.state = normalizeState(parsed);
  } catch (err) {
    result.errors.push(err.message);
    return result;
  }
  result.counts = countsOf(result.state);
  result.exportedAt = parsed.exportedAt || null;
  // Registros descartados pela normalização (sem id ou malformados) viram aviso.
  for (const c of COLLECTIONS) {
    const raw = Array.isArray(parsed.collections?.[c]) ? parsed.collections[c].length : 0;
    if (raw > result.counts[c]) result.warnings.push(`${COLLECTION_LABELS[c]}: ${raw - result.counts[c]} registro(s) malformado(s) seriam ignorados.`);
  }
  if (parsed.integrity?.hash) {
    const original = { schemaVersion: parsed.schemaVersion, settings: parsed.settings, profile: parsed.profile, collections: parsed.collections };
    const hash = await sha256Hex(JSON.stringify(original));
    if (hash === null) result.hashStatus = 'indisponivel';
    else result.hashStatus = hash === parsed.integrity.hash ? 'ok' : 'divergente';
    if (result.hashStatus === 'divergente') result.errors.push('O selo de integridade não confere: o arquivo foi alterado ou corrompido depois da exportação.');
  } else {
    result.warnings.push('Arquivo sem selo de integridade (backups anteriores ao JARVIS não tinham). A estrutura foi validada.');
  }
  result.ok = result.errors.length === 0;
  return result;
}

// ---------- CSV ----------
const REF_FIELDS = ['skillIds', 'requiredSkills', 'projectIds', 'dependsOn', 'studyItemId', 'projectId', 'skillId'];

/** Índice id → nome legível, para trocar ids por nomes nas planilhas. */
export function labelIndex(state) {
  const idx = new Map();
  for (const c of COLLECTIONS) for (const it of state.collections[c] || []) idx.set(it.id, it.name || it.title || it.company || it.term || it.org || it.id);
  return idx;
}

function cell(v) {
  if (v === null || v === undefined) return '';
  let s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  if (typeof v === 'number') s = s.replace('.', ','); // decimal brasileiro
  // Evita que planilhas interpretem o texto como fórmula.
  if (/^[=+\-@]/.test(s) && typeof v !== 'number') s = `'${s}`;
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV com separador ";" e BOM UTF-8 (abre corretamente no Excel em português). */
export function toCSV(state, collection) {
  const rows = state.collections[collection] || [];
  const idx = labelIndex(state);
  const preferred = (FIELDS[collection] || []).map((f) => f.key);
  const keys = [...new Set(['id', ...preferred, ...rows.flatMap((r) => Object.keys(r))])];
  const header = keys.join(';');
  const lines = rows.map((r) => keys.map((k) => {
    let v = r[k];
    if (REF_FIELDS.includes(k)) v = Array.isArray(v) ? v.map((x) => idx.get(x) || x).join(' | ') : (v ? idx.get(v) || v : '');
    else if (Array.isArray(v) && v.every((x) => typeof x !== 'object')) v = v.join(' | ');
    return cell(v);
  }).join(';'));
  return `﻿${[header, ...lines].join('\r\n')}\r\n`;
}

// ---------- Auditoria dos dados ----------
const DATE_FIELDS_EXTRA = ['createdAt', 'updatedAt'];

/** Verifica ids duplicados, referências quebradas e datas inválidas. Não altera nada. */
export function auditData(state) {
  const issues = [];
  const all = new Map();
  for (const c of COLLECTIONS) {
    const seen = new Set();
    for (const it of state.collections[c] || []) {
      if (seen.has(it.id)) issues.push({ level: 'erro', collection: c, id: it.id, message: `${COLLECTION_LABELS[c]}: id repetido (${it.id}).` });
      seen.add(it.id);
      all.set(it.id, c);
    }
  }
  for (const c of COLLECTIONS) {
    const dateFields = (FIELDS[c] || []).filter((f) => f.type === 'date').map((f) => f.key);
    for (const it of state.collections[c] || []) {
      for (const f of REF_FIELDS) {
        const v = it[f];
        const ids = Array.isArray(v) ? v : v ? [v] : [];
        for (const id of ids) if (!all.has(id)) issues.push({ level: 'aviso', collection: c, id: it.id, field: f, ref: id, message: `${COLLECTION_LABELS[c]} "${it.name || it.title || it.company || it.id}": referência a um registro que não existe mais.` });
      }
      for (const f of dateFields) if (it[f] && !isValidISO(String(it[f]))) issues.push({ level: 'aviso', collection: c, id: it.id, message: `${COLLECTION_LABELS[c]} "${it.name || it.title || it.id}": data inválida em "${f}" (${it[f]}).` });
      for (const f of DATE_FIELDS_EXTRA) if (it[f] && Number.isNaN(new Date(it[f]).getTime())) issues.push({ level: 'aviso', collection: c, id: it.id, message: `${COLLECTION_LABELS[c]}: carimbo de data inválido em "${f}".` });
    }
  }
  const total = COLLECTIONS.reduce((a, c) => a + (state.collections[c] || []).length, 0);
  return { issues, total, schemaVersion: state.schemaVersion ?? SCHEMA_VERSION };
}

/** Remove só referências quebradas (nenhum registro é apagado). Devolve cópia corrigida e contagem. */
export function repairReferences(state) {
  const copy = JSON.parse(JSON.stringify(state));
  const ids = new Set(COLLECTIONS.flatMap((c) => (copy.collections[c] || []).map((it) => it.id)));
  let fixed = 0;
  for (const c of COLLECTIONS) for (const it of copy.collections[c] || []) for (const f of REF_FIELDS) {
    if (Array.isArray(it[f])) { const before = it[f].length; it[f] = it[f].filter((x) => ids.has(x)); fixed += before - it[f].length; }
    else if (it[f] && !ids.has(it[f])) { it[f] = null; fixed++; }
  }
  return { state: copy, fixed };
}

// ---------- Pontos de restauração ----------
/**
 * backend: { all(): Promise<rec[]>, put(rec): Promise, remove(id): Promise }
 * No navegador usa IndexedDB (cota própria, separada do localStorage dos dados).
 */
export async function createSnapshot(backend, state, reason, now = new Date()) {
  const data = JSON.stringify(state);
  const rec = { id: `snap_${now.getTime()}_${Math.random().toString(36).slice(2, 7)}`, createdAt: now.toISOString(), reason, counts: countsOf(state), bytes: data.length, data };
  await backend.put(rec);
  const list = (await backend.all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  for (const old of list.slice(MAX_SNAPSHOTS)) await backend.remove(old.id);
  return rec;
}

export async function listSnapshots(backend) {
  return (await backend.all()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(({ data, ...meta }) => meta);
}

export async function readSnapshot(backend, id) {
  const rec = (await backend.all()).find((r) => r.id === id);
  if (!rec) throw new Error('Ponto de restauração não encontrado.');
  return normalizeState(JSON.parse(rec.data));
}

export function memoryBackend() {
  const m = new Map();
  return { all: async () => [...m.values()], put: async (r) => { m.set(r.id, r); }, remove: async (id) => { m.delete(id); } };
}

export function indexedDBBackend(dbName = 'jarvis', storeName = 'snapshots') {
  if (!globalThis.indexedDB) return null;
  const open = () => new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(storeName, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB indisponível'));
  });
  const tx = async (mode, fn) => {
    const db = await open();
    return new Promise((resolve, reject) => {
      const t = db.transaction(storeName, mode);
      const s = t.objectStore(storeName);
      const req = fn(s);
      t.oncomplete = () => { db.close(); resolve(req?.result); };
      t.onerror = () => { db.close(); reject(t.error); };
      t.onabort = () => { db.close(); reject(t.error || new Error('Operação cancelada (espaço insuficiente?)')); };
    });
  };
  return {
    all: () => tx('readonly', (s) => s.getAll()).then((r) => r || []),
    put: (rec) => tx('readwrite', (s) => s.put(rec)),
    remove: (id) => tx('readwrite', (s) => s.delete(id)),
  };
}
