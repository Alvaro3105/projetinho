// Guia estratégico: renderiza os documentos de planejamento em docs/*.md (fonte única).
import { h, clear } from '../core/dom.js';
import { renderMarkdown } from '../core/markdown.js';
import { pageHead, notice, loadingBlock } from '../ui/components.js';
import { CAREER_GROUPS, TRACKS, STACK } from '../data/careers.js';

export const DOCS = [
  { id: '00-visao-geral', title: 'Visão geral e como usar' },
  { id: '01-diagnostico', title: 'Diagnóstico pessoal e técnico' },
  { id: '02-carreiras', title: 'Carreiras e trilhas recomendadas' },
  { id: '03-faculdade-puc-minas', title: 'Faculdade: 8 semestres na PUC Minas' },
  { id: '04-plano-de-aprendizagem', title: 'Plano de aprendizagem e recursos' },
  { id: '05-inteligencia-artificial', title: 'Trilha de Inteligência Artificial' },
  { id: '06-roadmap-profissional', title: 'Trajetória profissional e Big Techs' },
  { id: '07-ingles-internacionalizacao', title: 'Inglês e internacionalização' },
  { id: '08-desenvolvimento-pessoal', title: 'Desenvolvimento pessoal e rotina' },
  { id: '09-analise-de-projetos', title: 'Análise dos seus projetos' },
  { id: '10-plano-30-dias', title: 'Plano de ação: primeiros 30 dias' },
  { id: '11-uso-de-ia', title: 'Política de uso de IA' },
  { id: '12-design-system', title: 'Design system do JARVIS' },
  { id: '13-evolucao-jarvis', title: 'Evolução do JARVIS: arquitetura e fases' },
  { id: '14-relatorio-de-testes', title: 'Relatório de testes da interface' },
  { id: 'fontes', title: 'Fontes e datas de consulta' },
];

let current = '00-visao-geral';
/** Abre um documento específico na próxima renderização do Guia (usado pela busca global). */
export function selectDoc(id) { if (DOCS.some((d) => d.id === id)) current = id; }
const cache = new Map();

export function renderGuide() {
  const host = h('div', { class: 'card', style: { minWidth: 0 } }, loadingBlock('Carregando documento'));
  const nav = h('nav', { 'aria-label': 'Documentos do guia', class: 'card flat', style: { alignSelf: 'start', position: 'sticky', top: '80px' } },
    h('ol', { style: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '2px' } },
      DOCS.map((d) => h('li', {}, h('a', {
        href: `#guia`, 'aria-current': d.id === current ? 'page' : null,
        style: { display: 'block', padding: '7px 10px', borderRadius: '8px', textDecoration: 'none', color: d.id === current ? 'var(--text)' : 'var(--text-2)', background: d.id === current ? 'var(--primary-soft)' : 'transparent', fontSize: '0.875rem' },
        onclick: (e) => { e.preventDefault(); current = d.id; load(); [...nav.querySelectorAll('a')].forEach((a, i) => { const on = DOCS[i].id === current; a.setAttribute('aria-current', on ? 'page' : 'false'); a.style.background = on ? 'var(--primary-soft)' : 'transparent'; a.style.color = on ? 'var(--text)' : 'var(--text-2)'; }); },
      }, d.title)))));

  async function load() {
    clear(host).append(loadingBlock('Carregando documento'));
    try {
      let text = cache.get(current);
      if (!text) {
        const res = await fetch(`docs/${current}.md`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        text = await res.text();
        cache.set(current, text);
      }
      const { node } = renderMarkdown(text, { idPrefix: current });
      clear(host).append(node);
      if (current === '02-carreiras') host.append(careerAppendix());
      host.querySelector('h2')?.setAttribute('tabindex', '-1');
    } catch (err) {
      clear(host).append(notice(`Não foi possível abrir docs/${current}.md (${err.message}). Os documentos precisam ser servidos por um servidor web (GitHub Pages ou "python -m http.server"), não abertos como arquivo local.`, 'warn'));
    }
  }
  load();

  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Guia Estratégico', 'O planejamento completo: diagnóstico, carreiras, faculdade, aprendizagem, IA, Big Techs, inglês, rotina e plano de 30 dias. Os mesmos textos estão na pasta docs/ do repositório.'),
    h('div', { class: 'grid guide-grid', style: { gridTemplateColumns: 'minmax(200px, 260px) minmax(0, 1fr)' } }, nav, host));
}

function careerAppendix() {
  return h('div', { class: 'stack', style: { marginTop: '28px' } },
    h('h2', {}, 'Referência rápida por cargo'),
    h('p', { class: 'small muted' }, 'Mesmo conteúdo usado em Oportunidades Profissionais. [oficial] = fonte oficial consultada; [mercado] = requisito frequente; [estimativa] = número de pesquisa salarial com fonte.'),
    CAREER_GROUPS.map((g) => h('div', { class: 'stack' },
      h('h3', {}, g.group),
      g.roles.map((r) => h('details', { class: 'acc' },
        h('summary', {}, r.name),
        h('div', { class: 'acc-body' }, h('dl', { class: 'kv' },
          ...[['Dia a dia', r.daily], ['Problemas que resolve', r.problems], ['Tecnologias', r.tech], ['Fundamentos', r.fundamentals], ['Linguagens', r.languages], ['Matemática', r.math], ['Requisitos', r.requirements], ['Como começar', r.start], ['Crescimento', r.growth], ['Remuneração', r.salary], ['Nas Big Techs', r.bigtech], ['Para você', r.path]]
            .flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))))))),
    h('h3', {}, 'Trilhas'),
    TRACKS.map((t) => h('div', { class: 'card flat' }, h('p', { class: 'eyebrow' }, t.kind), h('h3', { style: { margin: '4px 0 6px' } }, t.title), h('p', { class: 'small' }, t.why), h('p', { class: 'small muted', style: { marginTop: '6px' } }, `Foco: ${t.focus}`))),
    h('h3', {}, 'Stack e ordem'),
    h('div', { class: 'table-wrap' }, h('table', {}, h('thead', {}, h('tr', {}, ['Tecnologia', 'Por quê', 'Quando'].map((x) => h('th', { scope: 'col' }, x)))),
      h('tbody', {}, STACK.principal.map((s) => h('tr', {}, h('td', {}, h('strong', {}, s.tech)), h('td', {}, s.why), h('td', {}, s.when)))))),
    h('p', { class: 'small' }, h('strong', {}, 'Depois: '), STACK.later.map((s) => `${s.tech} (${s.why})`).join(' · ')),
    h('p', { class: 'small' }, h('strong', {}, 'Não aprofundar agora: '), STACK.avoid),
    h('p', { class: 'small' }, h('strong', {}, 'Alternativa: '), STACK.alternative));
}

