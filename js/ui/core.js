// JARVIS CORE — núcleo do Painel Inicial.
// Anéis concêntricos com movimento ambiente lento (decorativo) e camadas que mostram DADOS REAIS:
//   • três arcos: consistência (28 dias), metas da semana cumpridas, avaliações diagnósticas;
//   • nós da órbita: as 6 fases da trajetória (atual em âmbar) e o avanço na fase atual pelo calendário;
//   • pontos em órbita: sessões registradas nos últimos 7 dias (um ponto por sessão, até 14).
// Estados visuais vêm de mudanças nos seus registros (sessão nova, meta cumprida, atividade nova).
// O núcleo NÃO simula processamento, escuta, voz ou qualquer estado de IA.
import { h } from '../core/dom.js';
import { PHASES } from '../core/schema.js';
import { consistency, allSessions, goalsInWindow, currentPhase } from '../core/metrics.js';
import { today, addDays, diffDays, fmtDate } from '../core/dates.js';

const C = 160; // centro do viewBox
const SNAP_KEY = 'jarvis:core';
const R = { a1: 114, a2: 98, a3: 82 };

/** Calcula as três medidas dos arcos. Cada uma pode ser null (sem dados). */
export function coreMeasures(state, now = today()) {
  const c = state.collections;
  const cons = consistency(allSessions(state), 28, now);
  const week = goalsInWindow(c.goals, 'semana', now);
  const weekDone = week.filter((g) => g.status === 'cumprida').length;
  const assessed = c.assessments.filter((a) => a.status !== 'pendente').length;
  return [
    {
      key: 'consistencia', cls: 'a1', color: 'var(--accent)', name: 'Consistência',
      sub: 'Dias com estudo nos últimos 28',
      ratio: cons.ratio, value: cons.ratio === null ? 'sem dados' : `${cons.activeDays}/28`,
    },
    {
      key: 'metas', cls: 'a2', color: 'var(--primary)', name: 'Metas da semana',
      sub: 'Cumpridas entre as metas semanais',
      ratio: week.length ? weekDone / week.length : null, value: week.length ? `${weekDone}/${week.length}` : 'sem metas',
    },
    {
      key: 'diagnostico', cls: 'a3', color: 'var(--amber)', name: 'Diagnóstico',
      sub: 'Avaliações diagnósticas feitas',
      ratio: c.assessments.length ? assessed / c.assessments.length : null, value: `${assessed}/${c.assessments.length}`,
    },
  ];
}

/** Sinais que alimentam os estados do núcleo. Só contagens dos seus registros. */
export function coreSignals(state, now = today()) {
  const c = state.collections;
  const sessions = allSessions(state);
  const from = addDays(now, -6);
  const recent = sessions.filter((s) => s.date >= from && s.date <= now && s.minutes > 0);
  const week = goalsInWindow(c.goals, 'semana', now);
  return {
    sessions: sessions.length,
    recent: recent.map((s) => diffDays(from, s.date)), // 0..6 (dia da sessão dentro da janela)
    goalsDone: c.goals.filter((g) => g.status === 'cumprida').length,
    weekGoals: week.length,
    tasks: c.tasks.length,
    tasksDone: c.tasks.filter((t) => t.status === 'feito').length,
    assessed: c.assessments.filter((a) => a.status !== 'pendente').length,
  };
}

/**
 * Compara com o último retrato (desta sessão do navegador) e decide o estado visual.
 * Prioridade: meta concluída > progresso registrado > nova atividade > atualização.
 */
export function coreEvent(prev, cur) {
  if (!prev) return null;
  if (cur.goalsDone > prev.goalsDone) return { kind: 'meta', text: 'Meta concluída' };
  if (cur.sessions > prev.sessions || cur.tasksDone > prev.tasksDone) return { kind: 'progresso', text: cur.sessions > prev.sessions ? 'Progresso registrado' : 'Atividade concluída' };
  if (cur.tasks > prev.tasks) return { kind: 'atividade', text: 'Nova atividade no plano' };
  const keys = ['assessed', 'weekGoals', 'tasks', 'tasksDone', 'goalsDone', 'sessions'];
  if (keys.some((k) => cur[k] !== prev[k])) return { kind: 'atualizado', text: 'Informações atualizadas' };
  return null;
}

function readSnap() { try { return JSON.parse(sessionStorage.getItem(SNAP_KEY) || 'null'); } catch { return null; } }
function writeSnap(v) { try { sessionStorage.setItem(SNAP_KEY, JSON.stringify(v)); } catch { /* sem sessionStorage: só não há estados de mudança */ } }

function polar(r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}
const f1 = (n) => n.toFixed(1);

function ticks(r, n, width, cls) {
  const len = 2 * Math.PI * r;
  const dash = Math.max(0.6, (len / n) * 0.16);
  return `<circle class="${cls}" cx="${C}" cy="${C}" r="${r}" stroke-dasharray="${dash.toFixed(2)} ${(len / n - dash).toFixed(2)}" stroke-width="${width}"/>`;
}

function arcLayer(key, r, ratio, prevRatio, cls, label) {
  const len = 2 * Math.PI * r;
  const tip = `data-tip="${label}"`;
  if (ratio === null || ratio === undefined) return `<circle class="c-ghost" cx="${C}" cy="${C}" r="${r}" stroke-width="1" ${tip}/>`;
  const v = Math.max(0, Math.min(1, ratio));
  const from = Math.max(0, Math.min(1, prevRatio ?? 0));
  const track = `<circle class="c-track ${cls}" cx="${C}" cy="${C}" r="${r}" stroke-width="6" ${tip}/>`;
  if (v === 0 && from === 0) return track;
  const rot = `transform="rotate(-90 ${C} ${C})"`;
  const dash = (x) => `${(x * len).toFixed(2)} ${len.toFixed(2)}`;
  // Começa no valor anterior e anima até o atual (transição suave quando o dado muda).
  const [ex, ey] = polar(r, v * 360);
  return track
    + `<circle class="c-arc-glow ${cls}" cx="${C}" cy="${C}" r="${r}" stroke-width="10" stroke-dasharray="${dash(from)}" data-to="${dash(v)}" ${rot} filter="url(#core-blur)"/>`
    + `<circle class="c-arc ${cls}" cx="${C}" cy="${C}" r="${r}" stroke-width="6" stroke-dasharray="${dash(from)}" data-to="${dash(v)}" ${rot} ${tip}/>`
    + (v > 0.02 ? `<circle class="c-cap ${cls}" cx="${f1(ex)}" cy="${f1(ey)}" r="3.2"/>` : '');
}

/**
 * Renderiza o núcleo. `center` é um nó opcional para o centro (marca, nome, data).
 * Retorna { el, measures, phase, signals, event }.
 */
export function coreView(state, { center = null, now = today() } = {}) {
  const measures = coreMeasures(state, now);
  const signals = coreSignals(state, now);
  const phase = currentPhase(now);
  const prev = readSnap();
  const event = coreEvent(prev, signals);
  const prevRatios = prev?.ratios || {};
  writeSnap({ ...signals, ratios: Object.fromEntries(measures.map((m) => [m.key, m.ratio])) });
  const empty = measures.every((m) => m.ratio === null || m.ratio === 0) && signals.sessions === 0;

  // Órbita das fases: passadas em ciano, atual em âmbar (com halo), futuras apagadas, rótulo F1–F6.
  const nodes = PHASES.map((p, i) => {
    const [x, y] = polar(132, i * 60);
    const [lx, ly] = polar(150, i * 60);
    const st = p.value < phase.value ? 'past' : p.value === phase.value ? 'now' : 'next';
    return `${st === 'now' ? `<circle class="c-halo" cx="${f1(x)}" cy="${f1(y)}" r="10"/>` : ''}`
      + `<circle class="c-node ${st}" cx="${f1(x)}" cy="${f1(y)}" r="${st === 'now' ? 5 : 3}"/>`
      + `<text class="c-label ${st}" x="${f1(lx)}" y="${f1(ly + 3)}" text-anchor="middle">F${p.value}</text>`;
  }).join('');
  // Avanço na fase atual (pelo calendário): arco âmbar fino do nó atual em direção ao próximo.
  let phaseArc = '';
  if (!phase.upcoming && phase.value < PHASES.length) {
    const span = Math.max(1, diffDays(phase.start, phase.end));
    const t = Math.max(0, Math.min(1, diffDays(phase.start, now) / span));
    const a0 = (phase.value - 1) * 60;
    const a1 = a0 + t * 60;
    const [x0, y0] = polar(132, a0);
    const [x1, y1] = polar(132, a1);
    if (t > 0.01) phaseArc = `<path class="c-phase-arc" d="M${f1(x0)} ${f1(y0)} A132 132 0 0 1 ${f1(x1)} ${f1(y1)}"/><circle class="c-phase-tip" cx="${f1(x1)}" cy="${f1(y1)}" r="2.4"/>`;
  }
  // Pontos em órbita: uma sessão registrada nos últimos 7 dias = um ponto, no "relógio" da semana.
  const dots = signals.recent.slice(0, 14).map((d, i) => {
    const [x, y] = polar(140 + (i % 3) * 4, d * (360 / 7) + i * 9 + 6);
    return `<circle class="c-particle" cx="${f1(x)}" cy="${f1(y)}" r="${i % 2 ? 1.6 : 2.1}" style="animation-delay:${(i * 0.37).toFixed(2)}s"/>`;
  }).join('');
  const arcsTip = (m) => `${m.name}: ${m.value}`;
  const svg = `<svg viewBox="-24 -24 368 368" aria-hidden="true" focusable="false">
  <defs>
    <radialGradient id="core-glow"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.22"/><stop offset=".5" style="stop-color:var(--accent);stop-opacity:.05"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>
    <radialGradient id="core-disc"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.20"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient>
    <filter id="core-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.2"/></filter>
  </defs>
  <circle class="c-glow" cx="${C}" cy="${C}" r="176" fill="url(#core-glow)"/>
  <g class="c-layer l1">
    <circle class="c-ring faint" cx="${C}" cy="${C}" r="168"/>
    <g class="c-spin slow">${ticks(160, 72, 4, 'c-ticks fine')}</g>
  </g>
  <g class="c-layer l2">
    <g class="c-spin">${ticks(146, 120, 3, 'c-ticks fine')}</g>
    <g class="c-spin rev"><circle class="c-dashed" cx="${C}" cy="${C}" r="139"/></g>
    <circle class="c-ring" cx="${C}" cy="${C}" r="132"/>
    ${phaseArc}
    ${nodes}
    <g class="c-orbit">${dots}</g>
  </g>
  <g class="c-layer l3">
    ${arcLayer('consistencia', R.a1, measures[0].ratio, prevRatios.consistencia, 'a1', arcsTip(measures[0]))}
    ${arcLayer('metas', R.a2, measures[1].ratio, prevRatios.metas, 'a2', arcsTip(measures[1]))}
    ${arcLayer('diagnostico', R.a3, measures[2].ratio, prevRatios.diagnostico, 'a3', arcsTip(measures[2]))}
  </g>
  <g class="c-layer l4">
    <circle class="c-disc" cx="${C}" cy="${C}" r="62" fill="url(#core-disc)"/>
    <g class="c-spin rev slow">${ticks(66, 48, 5, 'c-ticks')}</g>
    <circle class="c-ring faint" cx="${C}" cy="${C}" r="56"/>
  </g>
  <circle class="c-ripple" cx="${C}" cy="${C}" r="58"/>
  <circle class="c-ripple r2" cx="${C}" cy="${C}" r="58"/>
</svg>`;
  const summary = measures.map((m) => `${m.name}: ${m.value}`).join('; ');
  const el = h('figure', {
    class: 'core', role: 'img', 'data-state': empty ? 'vazio' : 'normal', 'data-event': event?.kind || null,
    'aria-label': `Núcleo do JARVIS. Fase atual: ${phase.label}. ${summary}. Sessões nos últimos 7 dias: ${signals.recent.length}.`,
    style: { margin: '0 auto' },
  },
  h('div', { html: svg, style: { display: 'contents' } }),
  center ? h('div', { class: 'core-center' }, center) : null,
  event ? h('div', { class: `core-event ${event.kind}`, 'aria-hidden': 'true' }, event.text) : null);
  // Depois de entrar no DOM: leva cada arco do valor anterior ao atual (transição CSS).
  requestAnimationFrame(() => requestAnimationFrame(() => {
    for (const arc of el.querySelectorAll('[data-to]')) arc.setAttribute('stroke-dasharray', arc.getAttribute('data-to'));
  }));
  return { el, measures, phase, signals, event, empty };
}

/** Legenda dos anéis, com o valor de cada um e de onde ele vem. */
export function coreLegend(measures, signals) {
  const rows = measures.map((m) => h('li', {},
    h('i', { 'aria-hidden': 'true', style: { background: m.color } }),
    h('span', { class: 'cl-name' }, m.name, h('span', { class: 'cl-sub' }, m.sub)),
    h('span', { class: 'cl-val' }, m.value)));
  if (signals) {
    rows.push(h('li', {},
      h('i', { 'aria-hidden': 'true', class: 'dot' }),
      h('span', { class: 'cl-name' }, 'Pontos em órbita', h('span', { class: 'cl-sub' }, 'Sessões registradas nos últimos 7 dias')),
      h('span', { class: 'cl-val' }, String(signals.recent.length))));
  }
  return h('ul', { class: 'core-legend', 'aria-label': 'O que o núcleo mostra' }, rows);
}

/** Texto do período da fase atual, para o rótulo técnico do painel. */
export function phaseClock(phase, now = today()) {
  if (phase.upcoming) return `começa em ${fmtDate(phase.start)}`;
  if (phase.value >= PHASES.length) return phase.period;
  const span = Math.max(1, diffDays(phase.start, phase.end));
  const pct = Math.round(Math.max(0, Math.min(1, diffDays(phase.start, now) / span)) * 100);
  return `${pct}% do período da fase`;
}
