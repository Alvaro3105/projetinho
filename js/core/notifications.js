// Notificações: derivadas só dos seus registros (nada é inventado nem vem de fora).
// - atividades atrasadas ou vencendo hoje;
// - entregas de qualquer módulo nos próximos 3 dias;
// - sinais de atenção (insights) de tom "warn" ou "bad".
// Cada item tem uma chave estável; as já vistas ficam em settings.seenNotifications.
import { todayAgenda, upcoming, insights } from './metrics.js';
import { today } from './dates.js';

export const MAX_SEEN = 300;

export function buildNotifications(state, now = today()) {
  const out = [];
  const agenda = todayAgenda(state, now);
  for (const t of agenda.tasks) {
    const late = t.due < now;
    out.push({ key: `task:${t.id}:${t.due}`, tone: late ? 'bad' : 'warn', title: t.title, sub: late ? 'Atividade atrasada' : 'Atividade vence hoje', route: 'painel', date: t.due });
  }
  for (const u of upcoming(state, now, 3)) {
    out.push({ key: `up:${u.kind}:${u.taskId || u.title}:${u.date}`, tone: 'info', title: u.title, sub: `${u.kind} · prazo`, route: u.route, date: u.date });
  }
  for (const s of insights(state, now)) {
    if (s.tone === 'warn' || s.tone === 'bad') out.push({ key: `ins:${s.text}`, tone: s.tone, title: s.text, sub: 'Sinal de atenção', route: s.route });
  }
  return out;
}

export function unseenCount(list, seen = []) {
  const set = new Set(seen);
  return list.filter((n) => !set.has(n.key)).length;
}

/** Junta as chaves vistas às anteriores, mantendo no máximo MAX_SEEN (as mais recentes). */
export function markSeen(list, seen = []) {
  const merged = [...seen.filter((k) => !list.some((n) => n.key === k)), ...list.map((n) => n.key)];
  return merged.slice(-MAX_SEEN);
}
