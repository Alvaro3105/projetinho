import { h, extLink } from '../core/dom.js';
import { fmtDate, today, weekStart, addDays } from '../core/dates.js';
import { AREAS, HORIZONS, GOAL_STATUS, READING_STATUS, optionLabel } from '../core/schema.js';
import { habitWeek, goalProgress, goalsSummary } from '../core/metrics.js';
import { card, badge, optBadge, btn, pageHead, tabs, empty, progressBar, chips, stat, pct } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';

let tab = 'habitos';
let horizon = 'all';
const DOW = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

const PRACTICES = [
  { skill: 'Comunicação e oratória', act: 'Explicar em 5 minutos, em voz alta, o que estudou na semana (gravação). Uma apresentação curta por semestre em sala, meetup ou GDG.', measure: 'Nota de 1–5 em clareza, estrutura e tempo (Avaliação 10). Meta: média 4.' },
  { skill: 'Escrita', act: 'Um texto técnico por mês (README, ADR, post). Reescreva uma vez antes de publicar.', measure: 'Textos publicados por mês.' },
  { skill: 'Pensamento crítico', act: 'Para cada decisão técnica de projeto, escreva 2 alternativas e por que descartou. Na revisão semanal, anote uma crença que mudou.', measure: 'ADRs escritos; decisões justificadas.' },
  { skill: 'Resolução de problemas', act: 'Problemas sem IA com regra dos 25 minutos: tentar, depois dica, nunca solução direta.', measure: 'Problemas aceitos sem IA por semana.' },
  { skill: 'Disciplina e consistência', act: 'Rotina mínima em dias difíceis (30 min). Nunca dois dias seguidos sem nada.', measure: 'Dias ativos em 28 (Relatórios).' },
  { skill: 'Gestão de tempo', act: 'Planejar a semana no domingo (15 min) com no máximo 3 prioridades.', measure: 'Revisões semanais feitas; metas cumpridas × atrasadas.' },
  { skill: 'Autonomia e aprender sozinho', act: 'Ler a documentação oficial antes de perguntar à IA. Registrar o uso de IA em toda sessão.', measure: '% do tempo técnico sem IA (Estudos).' },
  { skill: 'Trabalho em equipe e liderança', act: 'Em trabalhos interdisciplinares, assuma um papel definido (ex.: revisar PRs, organizar quadro de tarefas). Faça uma retrospectiva ao final.', measure: 'Feedback dos colegas registrado em Reflexões.' },
  { skill: 'Inteligência emocional', act: 'Após rejeições e notas ruins, escrever o que aconteceu, o que sentiu e o que muda (Reflexões), antes de agir.', measure: 'Reflexões após eventos difíceis.' },
  { skill: 'Networking', act: 'Um evento por mês quando possível. Depois de cada um, 1 contato novo com mensagem de follow-up em 48h.', measure: 'Eventos e contatos registrados em Experiências.' },
  { skill: 'Ensinar e explicar', act: 'Monitoria ou ajudar colegas; explicar um conceito por escrito para alguém que não sabe.', measure: 'Sessões de ensino registradas.' },
  { skill: 'Criatividade', act: 'Manter uma lista de ideias de projeto e revisar uma vez por mês, escolhendo no máximo uma.', measure: 'Ideias registradas em Projetos.' },
];

export function renderPersonal(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Desenvolvimento pessoal', 'Hábitos, metas e reflexões medidos por comportamento, não por intenção.', [
      btn('Nova meta', () => crud(store, 'goals', { titleNew: 'Nova meta', defaults: { horizon: 'mes', area: 'pessoal', status: 'ativa', periodStart: today() } }), { iconName: 'flag' }),
      btn('Novo hábito', () => crud(store, 'habits', { titleNew: 'Novo hábito', defaults: { targetPerWeek: 3, active: true, checks: [] } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['habitos', 'Hábitos'], ['metas', 'Metas'], ['leitura', 'Leitura'], ['reflexoes', 'Reflexões'], ['praticas', 'Práticas']], tab, (k) => { tab = k; rerender(); }),
    tab === 'habitos' ? habits(ctx) : tab === 'metas' ? goals(ctx) : tab === 'leitura' ? readings(ctx) : tab === 'reflexoes' ? reflections(ctx) : practices());
}

function habits({ store }) {
  const list = store.list('habits');
  const now = today();
  const start = weekStart(now);
  const days = [0, 1, 2, 3, 4, 5, 6].map((i) => addDays(start, i));
  return list.length ? card({ title: `Semana de ${fmtDate(start, { year: false })}`, iconName: 'check', sub: 'Marque o dia em que fez. Dias futuros ficam bloqueados.' },
    h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, 'Hábito'), days.map((d, i) => h('th', { scope: 'col', style: { textAlign: 'center' } }, `${DOW[i]} ${d.slice(8)}`)), h('th', { scope: 'col', class: 'num' }, 'Semana'), h('th', {}, ''))),
      h('tbody', {}, list.map((hb) => {
        const { count, target } = habitWeek(hb, now);
        return h('tr', { style: { opacity: hb.active === false ? '0.5' : '1' } },
          h('td', {}, h('strong', {}, hb.name), hb.why ? h('div', { class: 'small muted' }, hb.why) : null),
          days.map((d) => {
            const on = (hb.checks || []).includes(d);
            return h('td', { style: { textAlign: 'center' } }, h('button', {
              type: 'button', class: 'check', 'aria-pressed': on ? 'true' : 'false', disabled: d > now ? true : null,
              'aria-label': `${hb.name} em ${fmtDate(d)}`, // estado em aria-pressed (rótulo estável)
              style: { margin: '0 auto', opacity: d > now ? '0.35' : '1' },
              onclick: () => store.update('habits', hb.id, { checks: on ? hb.checks.filter((x) => x !== d) : [...(hb.checks || []), d] }),
              html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
            }));
          }),
          h('td', { class: 'num' }, h('span', {}, `${count}/${target}`), count >= target ? [' ', badge('Meta', 'ok')] : null),
          h('td', {}, h('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            btn('', () => crud(store, 'habits', { item: hb, titleEdit: 'Editar hábito' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${hb.name}` }),
            btn('', async () => { if (await confirmDialog({ title: 'Excluir hábito', message: `Excluir "${hb.name}" e todo o histórico de marcações?`, confirmLabel: 'Excluir', danger: true })) { store.remove('habits', hb.id); toast('Hábito excluído.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${hb.name}` }))));
      }))))) : empty('Nenhum hábito.', 'Comece com no máximo 3 hábitos.');
}

function goals({ store, rerender }) {
  const now = today();
  const all = store.list('goals');
  const sum = goalsSummary(all, now);
  const list = all.filter((g) => horizon === 'all' || g.horizon === horizon).sort((a, b) => (a.due || '').localeCompare(b.due || ''));
  return h('div', { class: 'stack' },
    h('div', { class: 'grid cols-4' },
      card({}, stat('Ativas', String(sum.active))),
      card({}, stat('Cumpridas', String(sum.done))),
      card({}, stat('Atrasadas', String(sum.late.length), 'Ativas com prazo vencido')),
      card({}, stat('Taxa de cumprimento', pct(sum.hitRate), 'Entre metas encerradas', { na: sum.hitRate === null }))),
    chips([['all', 'Todos os horizontes'], ...HORIZONS.map((x) => [x.value, x.label])], horizon, (k) => { horizon = k; rerender(); }, 'Filtrar por horizonte'),
    list.length ? h('div', { class: 'list card' }, list.map((g) => {
      const p = goalProgress(g);
      const late = g.status === 'ativa' && g.due && g.due < now;
      return h('div', { class: 'list-item' },
        h('div', { class: 'grow' },
          h('div', { class: 'title' }, g.title),
          h('div', { class: 'sub' }, `${optionLabel(HORIZONS, g.horizon)} · ${optionLabel(AREAS, g.area)} · ${g.periodStart ? `${fmtDate(g.periodStart, { year: false })} → ` : ''}${fmtDate(g.due)}${g.metric ? ` · ${g.current ?? 0}/${g.target ?? '?'} ${g.metric}` : ''}`),
          p !== null ? h('div', { style: { marginTop: '6px', maxWidth: '420px' } }, progressBar(p, g.title)) : null),
        h('div', { class: 'side' },
          late ? badge('Atrasada', 'bad') : optBadge(GOAL_STATUS, g.status),
          g.metric && g.status === 'ativa' ? btn('+1', () => store.update('goals', g.id, { current: (Number(g.current) || 0) + 1 }), { size: 'sm', title: `Somar 1 em ${g.metric}` }) : null,
          g.status === 'ativa' ? btn('Cumprida', () => { store.update('goals', g.id, { status: 'cumprida', closedAt: now }); toast('Meta cumprida.'); }, { size: 'sm' }) : null,
          g.status === 'ativa' ? btn('Não cumprida', () => store.update('goals', g.id, { status: 'nao_cumprida', closedAt: now }), { size: 'sm', kind: 'ghost' }) : null,
          btn('', () => crud(store, 'goals', { item: g, titleEdit: 'Editar meta' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${g.title}` }),
          btn('', async () => { if (await confirmDialog({ title: 'Excluir meta', message: `Excluir "${g.title}"? Prefira marcar como não cumprida para manter o histórico.`, confirmLabel: 'Excluir', danger: true })) { store.remove('goals', g.id); toast('Meta excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${g.title}` })));
    })) : empty('Nenhuma meta neste horizonte.'));
}

function readings({ store }) {
  const list = store.list('readings');
  return h('div', { class: 'stack' },
    h('div', { class: 'row' }, btn('Nova leitura', () => crud(store, 'readings', { titleNew: 'Nova leitura', defaults: { status: 'quero_ler' } }), { iconName: 'plus' })),
    list.length ? h('div', { class: 'grid cols-3' }, list.map((r) => h('article', { class: 'card' },
      h('div', { class: 'row between' }, optBadge(READING_STATUS, r.status), h('div', { class: 'row' },
        btn('', () => crud(store, 'readings', { item: r, titleEdit: 'Editar leitura' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${r.title}` }),
        btn('', async () => { if (await confirmDialog({ title: 'Excluir leitura', message: `Excluir "${r.title}"?`, confirmLabel: 'Excluir', danger: true })) { store.remove('readings', r.id); toast('Leitura excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${r.title}` }))),
      h('h3', { style: { marginTop: '8px' } }, r.title),
      h('p', { class: 'small muted' }, r.author || ''),
      r.url ? h('p', { class: 'small' }, extLink(r.url)) : null,
      r.notes ? h('p', { class: 'small', style: { marginTop: '6px', whiteSpace: 'pre-wrap' } }, r.notes) : null))) : empty('Nenhuma leitura registrada.'));
}

function reflections({ store }) {
  const list = [...store.list('reflections')].sort((a, b) => b.date.localeCompare(a.date));
  return h('div', { class: 'stack' },
    h('div', { class: 'row' }, btn('Nova reflexão', () => crud(store, 'reflections', { titleNew: 'Nova reflexão', defaults: { date: today() } }), { iconName: 'plus' })),
    list.length ? list.map((r) => card({ title: r.title || fmtDate(r.date), meta: r.title ? fmtDate(r.date) : null, actions: h('div', { class: 'row' },
      btn('', () => crud(store, 'reflections', { item: r, titleEdit: 'Editar reflexão' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: 'Editar reflexão' }),
      btn('', async () => { if (await confirmDialog({ title: 'Excluir reflexão', message: 'Excluir esta reflexão?', confirmLabel: 'Excluir', danger: true })) { store.remove('reflections', r.id); toast('Reflexão excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir reflexão' })) },
      h('p', { style: { whiteSpace: 'pre-wrap' } }, r.text))) : empty('Nenhuma reflexão.', 'Use depois de eventos importantes: entrevistas, provas, conflitos, conquistas.'));
}

function practices() {
  return card({ title: 'Práticas por habilidade', sub: 'Cada habilidade tem uma atividade real e um jeito de medir. Transforme as que importam agora em hábitos ou metas.' },
    h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Habilidade', 'Atividade prática', 'Como medir'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, PRACTICES.map((p) => h('tr', {}, h('td', {}, h('strong', {}, p.skill)), h('td', {}, p.act), h('td', {}, p.measure)))))));
}
