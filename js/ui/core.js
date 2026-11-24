// Núcleo do JARVIS: anéis concêntricos com rotação ambiente lenta (decorativa) e três arcos que
// mostram DADOS REAIS do usuário. Não simula "processamento", "escuta" nem qualquer estado de IA.
// Sem dados, o arco aparece como trilha tracejada e a legenda diz "sem dados".
import { h } from '../core/dom.js';
import { PHASES } from '../core/schema.js';
import { consistency, allSessions, goalsInWindow, currentPhase } from '../core/metrics.js';
import { today } from '../core/dates.js';

const C = 160; // centro do viewBox 320×320

/** Calcula as três medidas exibidas no núcleo. Cada uma pode ser null (sem dados). */
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

function polar(r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

function ticks(r, n, width, cls) {
  const len = 2 * Math.PI * r;
  const dash = Math.max(0.6, len / n * 0.16);
  return `<circle class="${cls}" cx="${C}" cy="${C}" r="${r}" stroke-dasharray="${dash.toFixed(2)} ${(len / n - dash).toFixed(2)}" stroke-width="${width}"/>`;
}

function arc(r, ratio, cls) {
  const len = 2 * Math.PI * r;
  if (ratio === null || ratio === undefined) return `<circle class="c-ghost" cx="${C}" cy="${C}" r="${r}" stroke-width="1"/>`;
  const v = Math.max(0, Math.min(1, ratio));
  const track = `<circle class="c-track ${cls}" cx="${C}" cy="${C}" r="${r}" stroke-width="6"/>`;
  if (v === 0) return track;
  const on = v * len;
  return track
    + `<circle class="c-arc ${cls}" cx="${C}" cy="${C}" r="${r}" stroke-width="6" stroke-dasharray="${on.toFixed(2)} ${len.toFixed(2)}" transform="rotate(-90 ${C} ${C})"/>`;
}

/**
 * Renderiza o núcleo. `center` é um nó opcional para o centro (marca, nome, fase).
 * Retorna { el, measures } para a legenda poder ser montada ao lado.
 */
export function coreView(state, { center = null, now = today() } = {}) {
  const measures = coreMeasures(state, now);
  const phase = currentPhase(now);
  // As 6 fases da trajetória como nós na órbita: passadas em ciano, atual em âmbar, futuras apagadas.
  const nodes = PHASES.map((p, i) => {
    const [x, y] = polar(132, i * 60);
    const st = p.value < phase.value ? 'c-node' : p.value === phase.value ? 'c-node now' : 'c-node dim';
    const r = p.value === phase.value ? 5 : 3;
    const halo = p.value === phase.value ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" style="fill:none;stroke:var(--amber);stroke-opacity:.45"/>` : '';
    return `${halo}<circle class="${st}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}"${p.value === phase.value ? ' style="fill:var(--amber)"' : ''}/>`;
  }).join('');
  const svg = `<svg viewBox="0 0 320 320" aria-hidden="true" focusable="false">
  <defs><radialGradient id="core-glow"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.16"/><stop offset=".55" style="stop-color:var(--accent);stop-opacity:.04"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></radialGradient></defs>
  <circle class="c-glow" cx="${C}" cy="${C}" r="158"/>
  <circle class="c-ring faint" cx="${C}" cy="${C}" r="156"/>
  <g class="c-spin">${ticks(146, 120, 3, 'c-ticks fine')}</g>
  <circle class="c-ring" cx="${C}" cy="${C}" r="132"/>
  ${nodes}
  ${arc(114, measures[0].ratio, 'a1')}
  ${arc(98, measures[1].ratio, 'a2')}
  ${arc(82, measures[2].ratio, 'a3')}
  <g class="c-spin rev">${ticks(66, 48, 5, 'c-ticks')}</g>
  <circle class="c-ring faint" cx="${C}" cy="${C}" r="56"/>
</svg>`;
  const summary = measures.map((m) => `${m.name}: ${m.value}`).join('; ');
  const el = h('figure', { class: 'core', role: 'img', 'aria-label': `Núcleo do JARVIS. Fase atual: ${phase.label}. ${summary}.`, style: { margin: '0 auto' } },
    h('div', { html: svg, style: { display: 'contents' } }),
    center ? h('div', { class: 'core-center' }, center) : null);
  return { el, measures, phase };
}

/** Legenda dos arcos do núcleo, com o valor de cada um e de onde ele vem. */
export function coreLegend(measures) {
  return h('ul', { class: 'core-legend', 'aria-label': 'O que os anéis do núcleo mostram' },
    measures.map((m) => h('li', {},
      h('i', { 'aria-hidden': 'true', style: { background: m.color } }),
      h('span', { class: 'cl-name' }, m.name, h('span', { class: 'cl-sub' }, m.sub)),
      h('span', { class: 'cl-val' }, m.value))));
}
