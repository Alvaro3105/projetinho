// Gráficos em SVG desenhados com uma escala única. Cores vêm dos tokens via classes CSS.
import { h } from '../core/dom.js';
import { fmtDate } from '../core/dates.js';

const NS = { __svg: true };
const s = (tag, attrs = {}, ...children) => h(tag, { ...NS, ...attrs }, ...children);

function niceMax(v) {
  if (v <= 0) return 1;
  const exp = 10 ** Math.floor(Math.log10(v));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/**
 * Barras verticais. data: [{label, value}], format(v) para rótulos.
 */
export function barChart(data, { height = 180, format = (v) => String(v), label = 'Gráfico de barras', highlightLast = true } = {}) {
  const width = 600;
  const pad = { top: 16, right: 8, bottom: 26, left: 40 };
  const max = niceMax(Math.max(...data.map((d) => d.value), 0));
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const bw = innerW / data.length;
  const y = (v) => pad.top + innerH - (v / max) * innerH;
  const ticks = [0, max / 2, max];
  const summary = data.map((d) => `${d.label}: ${format(d.value)}`).join('; ');
  return s('svg', { class: 'chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `${label}. ${summary}` },
    ticks.map((t) => s('g', {},
      s('line', { class: 'grid-line', x1: pad.left, x2: width - pad.right, y1: y(t), y2: y(t) }),
      s('text', { x: pad.left - 6, y: y(t) + 4, 'text-anchor': 'end' }, format(t)))),
    data.map((d, i) => {
      const x = pad.left + i * bw + bw * 0.18;
      const w = bw * 0.64;
      const bh = Math.max(d.value > 0 ? 2 : 0, (d.value / max) * innerH);
      return s('g', {},
        s('rect', { class: `bar${highlightLast && i === data.length - 1 ? ' alt' : ''}`, x, y: pad.top + innerH - bh, width: w, height: bh, rx: 3, style: `animation-delay:${i * 35}ms` },
          s('title', {}, `${d.label}: ${format(d.value)}`)),
        (data.length <= 12 || i % 2 === 0) ? s('text', { x: x + w / 2, y: height - 8, 'text-anchor': 'middle' }, d.label) : null);
    }));
}

/**
 * Barras horizontais com marca de alvo. data: [{label, value, target, max}]
 */
export function rangeBars(data, { label = 'Comparação', format = (v) => String(v) } = {}) {
  const width = 600;
  const rowH = 30;
  const labelW = 210;
  const height = data.length * rowH + 8;
  const innerW = width - labelW - 50;
  return s('svg', { class: 'chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': `${label}. ${data.map((d) => `${d.label}: ${format(d.value)} de ${format(d.target)}`).join('; ')}` },
    data.map((d, i) => {
      const yy = i * rowH + 6;
      const value = Number.isFinite(d.value) ? d.value : 0;
      const hasTarget = Number.isFinite(d.target);
      const max = d.max || Math.max(hasTarget ? d.target : 0, value, 1);
      const w = (value / max) * innerW;
      const tx = labelW + ((hasTarget ? d.target : 0) / max) * innerW;
      const name = d.label.length > 30 ? `${d.label.slice(0, 29)}…` : d.label;
      return s('g', {},
        s('text', { x: 0, y: yy + 14 }, name),
        s('rect', { class: 'bar muted', x: labelW, y: yy + 4, width: innerW, height: 12, rx: 3 }),
        s('rect', { class: 'bar h', x: labelW, y: yy + 4, width: Math.max(0, w), height: 12, rx: 3, style: `animation-delay:${i * 40}ms` }),
        hasTarget ? s('line', { class: 'target-mark', x1: tx, x2: tx, y1: yy, y2: yy + 20 }) : null,
        s('text', { x: labelW + innerW + 8, y: yy + 14 }, hasTarget ? `${format(value)}/${format(d.target)}` : format(value)));
    }));
}

/** Mapa de calor por dia (colunas = semanas). days: [{date, minutes, future}] */
export function heatmap(days, { label = 'Dias de estudo' } = {}) {
  const level = (m) => (m <= 0 ? 0 : m < 30 ? 1 : m < 60 ? 2 : m < 120 ? 3 : 4);
  const active = days.filter((d) => d.minutes > 0).length;
  return h('div', { class: 'heat', role: 'img', 'aria-label': `${label}: ${active} dias com estudo em ${days.filter((d) => !d.future).length} dias.` },
    days.map((d) => h('i', { 'data-l': d.future ? null : String(level(d.minutes)), title: d.future ? fmtDate(d.date) : `${fmtDate(d.date)}: ${d.minutes} min`, style: d.future ? { opacity: '0.25' } : null })));
}

/** Número com vírgula decimal (padrão brasileiro). */
export const fmtNum = (n) => String(n).replace('.', ',');
/** Horas a partir de minutos: 90 → "1,5h"; 600 → "10h". */
export const fmtHours = (min) => {
  const hrs = min / 60;
  return hrs >= 10 ? `${Math.round(hrs)}h` : `${fmtNum(Math.round(hrs * 10) / 10)}h`;
};
