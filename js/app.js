// CAREER OS — ponto de entrada: shell, navegação por hash, tema e re-renderização.
import { h, clear } from './core/dom.js';
import { createStore } from './core/store.js';
import { seed, syncCurriculum } from './core/seed.js';
import { icon, BRAND_MARK } from './ui/icons.js';
import { btn, notice } from './ui/components.js';
import { closeModal } from './ui/modal.js';
import { toast } from './ui/toast.js';
import { renderDashboard } from './views/dashboard.js';
import { renderRoadmap } from './views/roadmap.js';
import { renderStudies } from './views/studies.js';
import { renderSkills } from './views/skills.js';
import { renderProjects } from './views/projects.js';
import { renderCareer } from './views/career.js';
import { renderEnglish } from './views/english.js';
import { renderPersonal } from './views/personal.js';
import { renderOpportunities } from './views/opportunities.js';
import { renderReports } from './views/reports.js';
import { renderReview } from './views/review.js';
import { renderGuide } from './views/guide.js';
import { renderSettings } from './views/settings.js';

// Nomes de rota em ASCII e sem "settings" (reservado em alguns hosts de artifact).
const ROUTES = [
  { group: 'Visão geral' },
  { id: 'painel', label: 'Dashboard', icon: 'dashboard', render: renderDashboard },
  { id: 'roadmap', label: 'Roadmap', icon: 'roadmap', render: renderRoadmap },
  { group: 'Desenvolvimento' },
  { id: 'estudos', label: 'Estudos', icon: 'book', render: renderStudies },
  { id: 'competencias', label: 'Competências', icon: 'target', render: renderSkills, count: (s) => s.collections.assessments.filter((a) => a.status === 'pendente').length },
  { id: 'projetos', label: 'Projetos', icon: 'folder', render: renderProjects },
  { id: 'carreira', label: 'Carreira', icon: 'briefcase', render: renderCareer },
  { id: 'ingles', label: 'Inglês', icon: 'globe', render: renderEnglish },
  { id: 'pessoal', label: 'Desenvolvimento pessoal', icon: 'person', render: renderPersonal },
  { id: 'oportunidades', label: 'Oportunidades', icon: 'compass', render: renderOpportunities },
  { group: 'Acompanhamento' },
  { id: 'revisoes', label: 'Revisões', icon: 'cycle', render: renderReview },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart', render: renderReports },
  { id: 'guia', label: 'Guia estratégico', icon: 'library', render: renderGuide },
  { id: 'configuracoes', label: 'Configurações', icon: 'gear', render: renderSettings },
];
const PAGES = ROUTES.filter((r) => r.id);
const DEFAULT = 'painel';

function safeStorage() {
  try {
    const k = '__careeros_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

const store = createStore({ storage: safeStorage(), seed });
if (!store.loadError && syncCurriculum(store)) setTimeout(() => toast('Grade da PUC Minas atualizada para a matriz oficial (Coração Eucarístico, noturno). Seus registros foram mantidos.'), 600);

const root = document.getElementById('app');
const content = h('main', { id: 'conteudo', class: 'content', tabindex: '-1' });
const crumb = h('div', { class: 'crumb' });
const navHost = h('nav', { class: 'nav', 'aria-label': 'Módulos' });
const themeBtn = h('button', { type: 'button', class: 'btn ghost icon', onclick: () => cycleTheme() });
const shell = h('div', { class: 'app' },
  h('aside', { class: 'sidebar', id: 'sidebar' },
    h('a', { class: 'brand', href: '#painel', 'aria-label': 'CAREER OS — ir para o Dashboard' },
      h('span', { html: BRAND_MARK, style: { display: 'contents' } }),
      h('span', {}, h('span', { class: 'brand-name' }, 'CAREER ', h('b', {}, 'OS')), h('span', { class: 'brand-sub' }, 'Personal Academic & Career Development System'))),
    navHost,
    h('div', { class: 'sidebar-foot' }, h('div', { class: 'sig' }, 'By Álvaro Pires'), h('div', {}, 'Dados salvos neste navegador'))),
  h('div', { class: 'scrim', onclick: () => toggleNav(false) }),
  h('div', { class: 'main' },
    h('header', { class: 'topbar' },
      h('button', { type: 'button', class: 'btn ghost icon menu-btn', 'aria-label': 'Abrir menu', 'aria-controls': 'sidebar', 'aria-expanded': 'false', onclick: () => toggleNav() }, icon('menu')),
      crumb,
      h('div', { class: 'spacer' }),
      (() => { const b = btn('Revisão semanal', () => navigate('revisoes'), { size: 'sm', iconName: 'cycle' }); b.classList.add('hide-sm'); return b; })(),
      themeBtn),
    content));

clear(root).append(h('a', { class: 'skip-link', href: '#conteudo', onclick: (e) => { e.preventDefault(); content.focus(); } }, 'Pular para o conteúdo'), shell);

function currentRoute() {
  const id = (location.hash || '').replace(/^#/, '');
  return PAGES.find((p) => p.id === id) || PAGES.find((p) => p.id === DEFAULT);
}

export function navigate(id) {
  if (location.hash === `#${id}`) render({ focus: true });
  else location.hash = id;
}

function toggleNav(force) {
  const open = force ?? !shell.classList.contains('nav-open');
  shell.classList.toggle('nav-open', open);
  shell.querySelector('.menu-btn').setAttribute('aria-expanded', String(open));
  if (open) navHost.querySelector('a[aria-current="page"]')?.focus();
}

function renderNav(active) {
  clear(navHost).append(...ROUTES.map((r) => {
    if (r.group) return h('div', { class: 'nav-label', 'aria-hidden': 'true' }, r.group);
    const count = r.count ? r.count(store.state) : 0;
    return h('a', { href: `#${r.id}`, 'aria-current': r.id === active ? 'page' : null, onclick: () => toggleNav(false) },
      icon(r.icon), h('span', {}, r.label), count ? h('span', { class: 'nav-count', 'aria-label': `${count} pendentes` }, String(count)) : null);
  }));
}

function applyTheme() {
  const theme = store.state.settings.theme || 'dark';
  document.documentElement.setAttribute('data-cos-theme', theme);
  clear(themeBtn).append(icon(theme === 'light' ? 'moon' : 'sun'));
  themeBtn.setAttribute('aria-label', theme === 'light' ? 'Usar tema escuro' : 'Usar tema claro');
  themeBtn.title = themeBtn.getAttribute('aria-label');
}

function cycleTheme() {
  store.setSettings({ theme: store.state.settings.theme === 'light' ? 'dark' : 'light' });
}

let lastRoute = null;
function render({ focus = false } = {}) {
  const route = currentRoute();
  const changed = route.id !== lastRoute;
  const activeId = document.activeElement?.id;
  const scroll = window.scrollY;
  renderNav(route.id);
  crumb.replaceChildren(h('span', {}, 'CAREER OS / '), h('strong', {}, route.label));
  document.title = route.id === DEFAULT ? 'CAREER OS' : `${route.label} · CAREER OS`;
  const ctx = { store, navigate, rerender: () => render() };
  let view;
  try {
    view = route.render(ctx);
  } catch (err) {
    console.error(err);
    view = notice(`Erro ao abrir "${route.label}": ${err.message}. Seus dados não foram alterados. Exporte um backup em Configurações e recarregue a página.`, 'bad');
  }
  const banners = [];
  if (store.loadError) banners.push(notice(`Os dados salvos neste navegador não puderam ser lidos (${store.loadError.message}). Nada foi sobrescrito. Importe um backup em Configurações ou restaure a configuração inicial.`, 'bad'));
  else if (!store.persistent) banners.push(notice('O armazenamento local está indisponível (janela anônima ou bloqueio do navegador). Suas alterações valem só até fechar a página: exporte um backup.', 'warn'));
  clear(content).append(...banners, view);
  if (changed || focus) {
    lastRoute = route.id;
    window.scrollTo(0, 0);
    (content.querySelector('#page-title') || content).focus({ preventScroll: true });
  } else {
    window.scrollTo(0, scroll);
    if (activeId) document.getElementById(activeId)?.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', () => { closeModal(); render(); });
store.subscribe((change) => {
  if (change.type === 'settings') applyTheme();
  if (change.type === 'import' || change.type === 'reset') { syncCurriculum(store); applyTheme(); render({ focus: true }); return; }
  render();
});
window.addEventListener('storage', (e) => {
  if (e.key === 'careeros:v1') toast('Os dados foram alterados em outra aba. Recarregue a página para ver a versão mais recente.', { error: true });
});

applyTheme();
render({ focus: false });
lastRoute = currentRoute().id;
