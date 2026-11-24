// Busca global (Ctrl+K ou /) e ajuda de atalhos (?).
import { h, clear } from '../core/dom.js';
import { buildIndex, search } from '../core/search.js';
import { openModal, closeModal } from '../ui/modal.js';
import { skillDetail } from './skills.js';
import { projectDetail } from './projects.js';
import { applicationDetail } from './career.js';
import { DOCS, selectDoc } from './guide.js';

const ROUTE_OF = {
  skills: 'competencias', projects: 'projetos', applications: 'carreira', studyItems: 'estudos', milestones: 'roadmap',
  goals: 'pessoal', tasks: 'painel', opportunities: 'oportunidades', companies: 'carreira', experiences: 'carreira',
  vocab: 'ingles', readings: 'pessoal', reflections: 'pessoal', assessments: 'competencias', habits: 'pessoal', discipline: 'roadmap',
};

export function openSearch({ store, navigate, modules }) {
  const index = buildIndex(store.state, { modules, docs: DOCS });
  let results = [];
  let active = 0;
  const listId = 'busca-resultados';
  const input = h('input', {
    id: 'busca-global', type: 'search', autocomplete: 'off', placeholder: 'Competências, projetos, disciplinas, candidaturas, documentos…',
    role: 'combobox', 'aria-expanded': 'false', 'aria-controls': listId, 'aria-autocomplete': 'list',
  });
  const list = h('ul', { id: listId, role: 'listbox', 'aria-label': 'Resultados da busca', class: 'search-results' });
  const status = h('p', { class: 'small faint', role: 'status', 'aria-live': 'polite' });

  function go(item) {
    closeModal();
    if (item.kind === 'module') return navigate(item.id);
    if (item.kind === 'doc') { selectDoc(item.id); return navigate('guia'); }
    navigate(ROUTE_OF[item.kind] || 'painel');
    // Abre o detalhe quando o módulo tem um (depois da troca de página).
    setTimeout(() => {
      if (item.kind === 'skills') skillDetail(store, item.id);
      else if (item.kind === 'projects') projectDetail(store, item.id);
      else if (item.kind === 'applications') applicationDetail(store, item.id);
    }, 60);
  }

  function paint() {
    clear(list);
    results.forEach((r, i) => {
      const li = h('li', {
        id: `busca-op-${i}`, role: 'option', 'aria-selected': i === active ? 'true' : 'false', class: 'search-item',
        onmousedown: (e) => { e.preventDefault(); go(r); },
      }, h('span', { class: 'search-title' }, r.title), h('span', { class: 'search-kind' }, r.label));
      list.append(li);
    });
    input.setAttribute('aria-expanded', results.length ? 'true' : 'false');
    if (results.length) input.setAttribute('aria-activedescendant', `busca-op-${active}`); else input.removeAttribute('aria-activedescendant');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
    status.textContent = input.value.trim() ? (results.length ? `${results.length} resultado(s). Use as setas e Enter.` : 'Nada encontrado.') : 'Digite para buscar em tudo o que você registrou.';
  }

  input.addEventListener('input', () => { results = search(index, input.value); active = 0; paint(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && results.length) { e.preventDefault(); active = (active + 1) % results.length; paint(); }
    else if (e.key === 'ArrowUp' && results.length) { e.preventDefault(); active = (active - 1 + results.length) % results.length; paint(); }
    else if (e.key === 'Enter' && results[active]) { e.preventDefault(); go(results[active]); }
  });
  paint();
  openModal({ title: 'Buscar no JARVIS', body: h('div', { class: 'stack' }, h('label', { class: 'visually-hidden', for: 'busca-global' }, 'Buscar'), input, status, list) });
}

export function openShortcuts() {
  const rows = [
    ['Ctrl + K ou /', 'Abrir a busca global'],
    ['?', 'Mostrar estes atalhos'],
    ['Esc', 'Fechar janelas e a busca'],
    ['Setas ← →', 'Trocar de aba dentro de um módulo'],
    ['Tab', 'Primeiro Tab da página: pular para o conteúdo'],
  ];
  openModal({
    title: 'Atalhos de teclado', size: 'sm',
    body: h('div', { class: 'table-wrap' }, h('table', {}, h('tbody', {}, rows.map(([k, v]) => h('tr', {}, h('td', {}, h('kbd', {}, k)), h('td', {}, v)))))),
  });
}
