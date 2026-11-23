import { h, extLink } from '../core/dom.js';
import { fmtDate, today } from '../core/dates.js';
import { PROJECT_STATUS } from '../core/schema.js';
import { uid } from '../core/store.js';
import { card, badge, optBadge, btn, pageHead, empty, refNames, kv, tagList } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { openModal, closeModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { completeProject } from './actions.js';
import { icon } from '../ui/icons.js';

export function renderProjects({ store }) {
  const projects = store.list('projects');
  const cols = PROJECT_STATUS.map((s) => ({ ...s, items: projects.filter((p) => p.status === s.value) }));
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Projetos', 'Poucos projetos excelentes. Cada um precisa de objetivo claro, decisões documentadas, testes e algo que prove o que você aprendeu.', [
      btn('Registrar ideia', () => crud(store, 'projects', { titleNew: 'Nova ideia de projeto', defaults: { status: 'ideia', tech: [], tasks: [], improvements: [] } }), { iconName: 'spark' }),
      btn('Novo projeto', () => crud(store, 'projects', { titleNew: 'Novo projeto', defaults: { status: 'planejado', tech: [], tasks: [], improvements: [], startDate: today() } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    h('div', { class: 'board', style: { '--cols': String(cols.length) } }, cols.map((col) => h('section', { class: 'board-col', 'aria-label': col.label },
      h('h3', {}, h('span', {}, col.label), h('span', { class: 'mono' }, String(col.items.length))),
      col.items.length ? col.items.map((p) => projectCard(store, p)) : h('p', { class: 'small faint' }, 'Vazio')))));
}

function projectCard(store, p) {
  const open = [...(p.tasks || []), ...(p.improvements || [])].filter((t) => !t.done).length;
  return h('article', { class: 'mini-card' },
    h('button', { type: 'button', class: 'title', style: { background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit', fontWeight: 600, textAlign: 'left', cursor: 'pointer' }, onclick: () => projectDetail(store, p.id) }, p.name),
    h('p', { class: 'small muted' }, (p.objective || '').slice(0, 140) + ((p.objective || '').length > 140 ? '…' : '')),
    tagList((p.tech || []).slice(0, 5)),
    h('div', { class: 'row between' }, h('span', { class: 'small faint' }, `${open} pendência(s)`), p.repoUrl ? h('span', { class: 'small' }, extLink(p.repoUrl, 'repositório')) : null));
}

export function projectDetail(store, id) {
  const p = store.get('projects', id);
  if (!p) return;
  const listEditor = (key, label, placeholder) => {
    const items = p[key] || [];
    const input = h('input', { type: 'text', id: `new-${key}`, placeholder, maxlength: 240 });
    const addItem = () => {
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      store.update('projects', p.id, { [key]: [...items, { id: uid('itm'), text, done: false }] });
      projectDetail(store, p.id);
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } });
    return h('div', { class: 'stack' },
      h('h3', {}, label),
      items.length ? h('div', { class: 'list' }, items.map((t) => h('div', { class: `list-item${t.done ? ' done' : ''}` },
        h('button', { type: 'button', class: 'check', 'aria-pressed': t.done ? 'true' : 'false', 'aria-label': `${t.done ? 'Reabrir' : 'Concluir'}: ${t.text}`, onclick: () => { store.update('projects', p.id, { [key]: items.map((x) => x.id === t.id ? { ...x, done: !x.done, doneAt: !x.done ? today() : null } : x) }); projectDetail(store, p.id); } }, icon('check')),
        h('div', { class: 'grow' }, h('div', { class: 'title' }, t.text)),
        btn('', () => { store.update('projects', p.id, { [key]: items.filter((x) => x.id !== t.id) }); projectDetail(store, p.id); }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Remover ${t.text}` })))) : h('p', { class: 'small faint' }, 'Nada registrado.'),
      h('div', { class: 'row', style: { flexWrap: 'nowrap' } }, h('label', { class: 'visually-hidden', for: `new-${key}` }, `Adicionar em ${label}`), input, btn('Adicionar', addItem, { size: 'sm', iconName: 'plus' })));
  };
  const skills = refNames(store, 'skills', p.skillIds);
  const logs = store.list('studyLogs').filter((l) => l.projectId === p.id);
  openModal({
    title: p.name,
    body: h('div', { class: 'stack', style: { gap: '18px' } },
      h('div', { class: 'row' }, optBadge(PROJECT_STATUS, p.status), p.team ? badge(p.team, 'plain') : null),
      kv([
        ['Objetivo', p.objective], ['Descrição', p.description], ['Meu papel', p.myRole],
        ['Repositório', p.repoUrl ? extLink(p.repoUrl) : null], ['Demo', p.demoUrl ? extLink(p.demoUrl) : null], ['Documentação', p.docsUrl ? extLink(p.docsUrl) : null],
        ['Período', [p.startDate ? fmtDate(p.startDate) : null, p.endDate ? fmtDate(p.endDate) : null].filter(Boolean).join(' → ') || null],
        ['Competências', skills.join(', ') || null], ['Resultados', p.results],
        ['Sessões registradas', logs.length ? `${logs.length} (${logs.reduce((a, l) => a + Number(l.minutes || 0), 0)} min)` : null],
      ]),
      tagList(p.tech),
      listEditor('tasks', 'Tarefas', 'Nova tarefa'),
      listEditor('improvements', 'Melhorias planejadas', 'Nova melhoria')),
    footer: [
      btn('Excluir', async () => { closeModal(); if (await confirmDialog({ title: 'Excluir projeto', message: `Excluir "${p.name}"? Tarefas e melhorias dele serão perdidas.`, confirmLabel: 'Excluir', danger: true })) { store.remove('projects', p.id); toast('Projeto excluído.'); } }, { kind: 'danger', iconName: 'trash' }),
      btn('Editar', () => { closeModal(); crud(store, 'projects', { item: p, titleEdit: `Editar ${p.name}` }); }, { iconName: 'edit' }),
      p.status === 'ideia' || p.status === 'planejado' || p.status === 'pausado' ? btn('Iniciar', () => { store.update('projects', p.id, { status: 'em_andamento', startDate: p.startDate || today() }); closeModal(); toast('Projeto em andamento.'); }) : null,
      p.status !== 'concluido' ? btn('Concluir projeto', () => { closeModal(); completeProject(store, store.get('projects', p.id)); }, { kind: 'primary', iconName: 'check' }) : null,
    ],
  });
}
