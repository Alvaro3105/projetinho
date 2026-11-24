import { h } from '../core/dom.js';
import { fmtDate, today, addDays } from '../core/dates.js';
import { CEFR, ENGLISH_SKILLS, VOCAB_STATUS, VOCAB_CONTEXT, optionLabel } from '../core/schema.js';
import { card, badge, optBadge, btn, pageHead, tabs, empty, stat, chips, levelView } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { barChart, fmtHours } from '../ui/charts.js';

let tab = 'visao';
let vocabFilter = 'all';

const TARGETS = [
  { when: 'Dez/2026', goal: 'Nível medido (EF SET) e rotina de 20 min/dia', how: 'Diagnóstico + BBC Learning English.' },
  { when: 'Dez/2027', goal: 'B2 medido', how: 'Listening diário com legendas em inglês; leitura de documentação; 1 texto por semana.' },
  { when: 'Dez/2028', goal: 'B2+ com speaking fluente sobre seus projetos', how: 'Conversação semanal; apresentar projetos em inglês; READMEs em inglês.' },
  { when: 'Dez/2029', goal: 'C1 medido', how: 'Papers, palestras sem legenda, mock interviews em inglês.' },
  { when: '2030+', goal: 'Trabalho e entrevistas internacionais em inglês', how: 'Teste certificado (IELTS/TOEFL) só quando houver um processo que exija.' },
];

export function renderEnglish(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Central de Inglês', 'Meta: estudar, trabalhar e fazer entrevistas internacionais. Nível atual: só depois da primeira avaliação.', [
      btn('Registrar prática', () => crud(store, 'englishLogs', { titleNew: 'Registrar prática de inglês', defaults: { date: today(), minutes: 20, skill: 'listening' } }), { iconName: 'clock' }),
      btn('Nova avaliação', () => crud(store, 'englishAssessments', { titleNew: 'Registrar avaliação de inglês', defaults: { date: today(), instrument: 'EF SET 50 min', cefr: 'nao_informado' } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['visao', 'Visão geral'], ['vocab', 'Vocabulário'], ['pratica', 'Prática'], ['avaliacoes', 'Avaliações']], tab, (k) => { tab = k; rerender(); }),
    tab === 'visao' ? overview(ctx) : tab === 'vocab' ? vocab(ctx) : tab === 'pratica' ? practice(ctx) : assessments(ctx));
}

function overview({ store }) {
  const assess = [...store.list('englishAssessments')].sort((a, b) => b.date.localeCompare(a.date));
  const last = assess[0];
  const logs = store.list('englishLogs');
  const from = addDays(today(), -27);
  const recent = logs.filter((l) => l.date >= from);
  const days = new Set(recent.map((l) => l.date)).size;
  const bySkill = ENGLISH_SKILLS.map((s) => ({ label: s.label.split(' ')[0], value: Math.round(recent.filter((l) => l.skill === s.value).reduce((a, l) => a + Number(l.minutes), 0)) }));
  const skills = store.list('skills').filter((s) => s.category === 'ingles');
  return h('div', { class: 'stack' },
    h('div', { class: 'grid cols-3' },
      card({}, stat('Nível geral (CEFR)', last && last.cefr !== 'nao_informado' ? last.cefr : 'Não avaliado', last ? `${last.instrument} · ${fmtDate(last.date)}` : 'Faça o EF SET (Avaliação 8)', { na: !last || last.cefr === 'nao_informado' })),
      card({}, stat('Dias com prática (28 dias)', String(days), `${fmtHours(recent.reduce((a, l) => a + Number(l.minutes), 0))} no período`)),
      card({}, stat('Vocabulário dominado', String(store.list('vocab').filter((v) => v.status === 'dominado').length), `${store.list('vocab').length} termos registrados`))),
    h('div', { class: 'grid cols-2' },
      card({ title: 'Habilidades em Competências', iconName: 'target' }, h('div', { class: 'list' }, skills.map((s) => h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, s.name)), levelView(s.level, s.target))))),
      card({ title: 'Minutos por habilidade (28 dias)', iconName: 'chart' }, recent.length ? barChart(bySkill, { label: 'Minutos de prática por habilidade', format: (v) => String(Math.round(v)), height: 170, highlightLast: false }) : empty('Sem prática registrada.'))),
    card({ title: 'Metas de proficiência', iconName: 'flag', sub: 'Metas de plano, revisadas a cada avaliação semestral.' },
      h('div', { class: 'list' }, TARGETS.map((t) => h('div', { class: 'list-item' }, h('span', { class: 'tag', style: { minWidth: '76px', justifyContent: 'center' } }, t.when), h('div', { class: 'grow' }, h('div', { class: 'title' }, t.goal), h('div', { class: 'sub' }, t.how)))))),
    card({ title: 'Rotina semanal sugerida (rotina normal ≈ 2h30)', iconName: 'clock' },
      h('ul', {},
        h('li', {}, 'Listening (4×20 min): BBC Learning English, palestras técnicas (DevFest, Google I/O) com legenda em inglês.'),
        h('li', {}, 'Reading técnico (2×20 min): documentação oficial que você já usa (Python, FastAPI, PostgreSQL). Anote termos no Vocabulário.'),
        h('li', {}, 'Speaking (1×15 min): grave-se explicando o que estudou na semana. Ouça e anote 3 erros.'),
        h('li', {}, 'Writing (1×20 min): resumo semanal em inglês ou um trecho de README.'),
        h('li', {}, 'Avaliação: EF SET a cada 6 meses; registre em Avaliações.'))));
}

function vocab({ store, rerender }) {
  const list = store.list('vocab').filter((v) => vocabFilter === 'all' || v.status === vocabFilter || v.context === vocabFilter);
  return h('div', { class: 'stack' },
    h('div', { class: 'row between' },
      chips([['all', 'Todos'], ...VOCAB_STATUS.map((s) => [s.value, s.label]), ['tecnico', 'Técnico'], ['entrevista', 'Entrevista']], vocabFilter, (k) => { vocabFilter = k; rerender(); }, 'Filtrar vocabulário'),
      btn('Novo termo', () => crud(store, 'vocab', { titleNew: 'Novo termo', defaults: { status: 'novo', context: 'tecnico' } }), { iconName: 'plus' })),
    list.length ? h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, ['Termo', 'Significado', 'Contexto', 'Status', ''].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', {}, list.map((v) => {
        const next = { novo: 'revisando', revisando: 'dominado', dominado: 'revisando' }[v.status];
        return h('tr', {},
          h('td', {}, h('strong', {}, v.term), v.example ? h('div', { class: 'small muted' }, v.example) : null),
          h('td', {}, v.meaning),
          h('td', {}, optionLabel(VOCAB_CONTEXT, v.context)),
          h('td', {}, optBadge(VOCAB_STATUS, v.status)),
          h('td', {}, h('div', { class: 'row', style: { flexWrap: 'nowrap' } },
            btn(next === 'dominado' ? 'Dominei' : 'Revisar', () => store.update('vocab', v.id, { status: next, reviewedAt: today() }), { size: 'sm' }),
            btn('', () => crud(store, 'vocab', { item: v, titleEdit: 'Editar termo' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${v.term}` }),
            btn('', async () => { if (await confirmDialog({ title: 'Excluir termo', message: `Excluir "${v.term}"?`, confirmLabel: 'Excluir', danger: true })) { store.remove('vocab', v.id); toast('Termo excluído.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${v.term}` }))));
      })))) : empty('Nenhum termo neste filtro.', 'Registre termos que encontrar em documentação, aulas e entrevistas, com uma frase de exemplo escrita por você.'));
}

function practice({ store }) {
  const logs = [...store.list('englishLogs')].sort((a, b) => b.date.localeCompare(a.date));
  return logs.length ? h('div', { class: 'table-wrap' }, h('table', {},
    h('thead', {}, h('tr', {}, ['Data', 'Min', 'Habilidade', 'Atividade', ''].map((t, i) => h('th', { scope: 'col', class: i === 1 ? 'num' : null }, t)))),
    h('tbody', {}, logs.map((l) => h('tr', {},
      h('td', {}, fmtDate(l.date)), h('td', { class: 'num' }, String(l.minutes)), h('td', {}, optionLabel(ENGLISH_SKILLS, l.skill)), h('td', {}, l.activity, l.notes ? h('div', { class: 'small muted' }, l.notes) : null),
      h('td', {}, h('div', { class: 'row', style: { flexWrap: 'nowrap' } },
        btn('', () => crud(store, 'englishLogs', { item: l, titleEdit: 'Editar prática' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: 'Editar prática' }),
        btn('', async () => { if (await confirmDialog({ title: 'Excluir prática', message: 'Excluir este registro?', confirmLabel: 'Excluir', danger: true })) { store.remove('englishLogs', l.id); toast('Registro excluído.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir prática' })))))))) : empty('Nenhuma prática registrada.', 'Registre cada bloco de inglês (listening, speaking, reading, writing).');
}

function assessments({ store }) {
  const list = [...store.list('englishAssessments')].sort((a, b) => b.date.localeCompare(a.date));
  return list.length ? card({ title: 'Histórico de avaliações' }, h('div', { class: 'list' }, list.map((a) => h('div', { class: 'list-item' },
    h('div', { class: 'grow' }, h('div', { class: 'title' }, `${a.instrument} · ${fmtDate(a.date)}`), h('div', { class: 'sub' }, ['listening', 'reading', 'writing', 'speaking'].filter((k) => a[k] && a[k] !== 'nao_informado').map((k) => `${k}: ${a[k]}`).join(' · ') || 'Sem detalhamento por habilidade'), a.notes ? h('div', { class: 'sub' }, a.notes) : null),
    h('div', { class: 'side' }, badge(a.cefr === 'nao_informado' ? 'CEFR não informado' : a.cefr, a.cefr === 'nao_informado' ? 'na' : 'accent'), a.score ? h('span', { class: 'tag' }, a.score) : null,
      btn('', () => crud(store, 'englishAssessments', { item: a, titleEdit: 'Editar avaliação' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: 'Editar avaliação' }),
      btn('', async () => { if (await confirmDialog({ title: 'Excluir avaliação', message: 'Excluir esta avaliação?', confirmLabel: 'Excluir', danger: true })) { store.remove('englishAssessments', a.id); toast('Avaliação excluída.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: 'Excluir avaliação' })))))) : empty('Nenhuma avaliação registrada.', 'Comece pelo EF SET (gratuito, 50 minutos) e registre o resultado aqui.');
}
