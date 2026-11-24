// Datas como strings ISO locais (AAAA-MM-DD). Funções puras, testadas em tests/dates.test.js.

const pad = (n) => String(n).padStart(2, '0');

export function toISO(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function today(now = new Date()) {
  return toISO(now);
}

export function parseISO(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidISO(iso) {
  const date = parseISO(iso);
  return !!date && toISO(date) === iso.slice(0, 10);
}

export function addDays(iso, days) {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

export function diffDays(a, b) {
  const da = parseISO(a);
  const db = parseISO(b);
  return Math.round((db - da) / 86400000);
}

/** Segunda-feira da semana (semana começa na segunda). */
export function weekStart(iso) {
  const date = parseISO(iso);
  const dow = (date.getDay() + 6) % 7; // 0 = segunda
  date.setDate(date.getDate() - dow);
  return toISO(date);
}

/** Chave ISO-8601 de semana, ex.: 2026-W49. */
export function weekKey(iso) {
  const date = parseISO(iso);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const week = 1 + Math.round(((target - firstThursday) / 86400000 - 3 + ((firstThursday.getDay() + 6) % 7)) / 7);
  return `${target.getFullYear()}-W${pad(week)}`;
}

export function monthKey(iso) {
  return iso.slice(0, 7);
}

const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

/** Padrão brasileiro: DD/MM/AAAA (ou DD/MM com { year: false }). */
export function fmtDate(iso, opts = {}) {
  const date = parseISO(iso);
  if (!date) return '—';
  const base = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;
  return opts.year === false ? base : `${base}/${date.getFullYear()}`;
}

/** Data e hora locais no padrão brasileiro, 24 horas: DD/MM/AAAA HH:MM. */
export function fmtDateTime(isoDateTime) {
  const d = new Date(isoDateTime);
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fmtMonth(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
}

export function fmtMonthShort(key) {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1]}/${String(y).slice(2)}`;
}

/** Semestre letivo aproximado: jan–jun = 1, jul–dez = 2. */
export function termKey(iso) {
  const [y, m] = iso.split('-').map(Number);
  return `${y}/${m <= 6 ? 1 : 2}`;
}

export function rangeDays(fromISO, toISOExclusive) {
  const out = [];
  let cur = fromISO;
  while (cur < toISOExclusive) { out.push(cur); cur = addDays(cur, 1); }
  return out;
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 5) return 'Boa noite';
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}
