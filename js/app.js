// JARVIS — ponto de entrada: shell, navegação por hash, tema, busca e re-renderização.
import { h, clear } from './core/dom.js';
import { createStore, STORAGE_KEY } from './core/store.js';
import { seed, syncCurriculum, applyPlanUpdates, upgradeIsPending } from './core/seed.js';
import { BRAND, brandMark } from './core/brand.js';
import { createSnapshot, indexedDBBackend } from './core/backup.js';
import { icon } from './ui/icons.js';
import { btn, notice } from './ui/components.js';
import { closeModal } from './ui/modal.js';
import { toast } from './ui/toast.js';
import { bootSplash } from './ui/splash.js';
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
import { renderBackup, setSnapshotBackend } from './views/backup.js';
import { openSearch, openShortcuts } from './views/search.js';

// Identificadores de rota estáveis (ASCII, sem "settings", reservado em alguns hosts).
// Os rótulos são os nomes oficiais em PT-BR.
const ROUTES = [
  { group: 'Visão geral' },
  { id: 'painel', label: 'Painel Inicial', icon: 'dashboard', render: renderDashboard },
  { id: 'roadmap', label: 'Plano de Evolução', icon: 'roadmap', render: renderRoadmap },
  { group: 'Desenvolvimento' },
  { id: 'estudos', label: 'Central de Estudos', icon: 'book', render: renderStudies },
  { id: 'competencias', label: 'Competências', icon: 'target', render: renderSkills, count: (s) => s.collections.assessments.filter((a) => a.status === 'pendente').length, countLabel: 'avaliações pendentes' },
  { id: 'projetos', label: 'Laboratório de Projetos', icon: 'folder', render: renderProjects },
  { id: 'carreira', label: 'Oportunidades Profissionais', icon: 'briefcase', render: renderCareer },
  { id: 'ingles', label: 'Central de Inglês', icon: 'globe', render: renderEnglish },
  { id: 'pessoal', label: 'Desenvolvimento Pessoal', icon: 'person', render: renderPersonal },
  { id: 'oportunidades', label: 'Oportunidades e Pesquisa', icon: 'compass', render: renderOpportunities },
  { group: 'Acompanhamento' },
  { id: 'revisoes', label: 'Revisões', icon: 'cycle', render: renderReview },
  { id: 'relatorios', label: 'Relatórios', icon: 'chart', render: renderReports },
  { id: 'guia', label: 'Guia Estratégico', icon: 'library', render: renderGuide },
  { group: 'Sistema' },
  { id: 'backup', label: 'Central de Backup', icon: 'lock', render: renderBackup },
  { id: 'configuracoes', label: 'Configurações', icon: 'gear', render: renderSettings },
];
const PAGES = ROUTES.filter((r) => r.id);
const DEFAULT = 'painel';

function safeStorage() {
  try {
    const k = '__jarvis_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    return null;
  }
}

// Os dados continuam na chave STORAGE_KEY ("careeros:v1") de propósito: renomear a chave faria o
// JARVIS deixar de encontrar tudo o que já foi registrado na época do CAREER OS.
const store = createStore({ storage: safeStorage(), seed });
const snapshots = indexedDBBackend();
setSnapshotBackend(snapshots);

// Atualizações do plano: acrescentam ou ajustam só o que você não editou; nada é apagado.
// Antes de qualquer atualização de versão, um ponto de restauração automático é criado.
async function upgrade({ silent = false } = {}) {
  if (store.loadError || !upgradeIsPending(store.state)) return false;
  if (snapshots) {
    try { await createSnapshot(snapshots, store.state, 'Antes da atualização de versão'); } catch { /* sem espaço: segue, o backup manual continua disponível */ }
  }
  const synced = syncCurriculum(store);
  const applied = applyPlanUpdates(store);
  const changed = synced || applied.length > 0;
  if (changed && !silent) toast('JARVIS atualizado. Um ponto de restauração foi criado antes, e seus registros e seu histórico foram mantidos.');
  return changed;
}
upgrade();

const root = document.getElementById('app');
const content = h('main', { id: 'conteudo', class: 'content', tabindex: '-1' });
const crumb = h('div', { class: 'crumb' });
const navHost = h('nav', { class: 'nav', 'aria-label': 'Módulos' });
const themeBtn = h('button', { type: 'button', class: 'btn ghost icon', onclick: () => cycleTheme() });
const shell = h('div', { class: 'app' },
  h('aside', { class: 'sidebar', id: 'sidebar' },
    h('a', { class: 'brand', href: '#painel', 'aria-label': `${BRAND.name} — ir para o Painel Inicial` },
      h('span', { html: brandMark({ id: 'jvside' }), style: { display: 'contents' } }),
      h('span', {}, h('span', { class: 'brand-name' }, BRAND.name), h('span', { class: 'brand-sub' }, BRAND.tagline))),
    navHost,
    h('div', { class: 'sidebar-foot' }, h('div', { class: 'sig' }, `${BRAND.signature} · ${BRAND.year}`), h('div', {}, BRAND.concept), h('div', { class: 'faint-side' }, 'Dados salvos neste navegador'))),
  h('div', { class: 'scrim', onclick: () => toggleNav(false) }),
  h('div', { class: 'main' },
    h('header', { class: 'topbar' },
      h('button', { type: 'button', class: 'btn ghost icon menu-btn', 'aria-label': 'Abrir menu', 'aria-controls': 'sidebar', 'aria-expanded': 'false', onclick: () => toggleNav() }, icon('menu')),
      crumb,
      h('div', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn sm search-btn', onclick: () => openSearch({ store, navigate, modules: PAGES }), 'aria-label': 'Buscar no JARVIS (Ctrl+K)', title: 'Buscar (Ctrl+K)' }, icon('search'), h('span', { class: 'hide-sm' }, 'Buscar'), h('kbd', { class: 'hide-sm' }, 'Ctrl K')),
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
    return h('a', { href: `#${r.id}`, 'aria-current': r.id === active ? 'page' : null, onclick: () => { toggleNav(false); if (location.hash === `#${r.id}`) render({ focus: true }); } },
      icon(r.icon), h('span', {}, r.label), count ? h('span', { class: 'nav-count', 'aria-label': `${count} ${r.countLabel || 'pendentes'}` }, String(count)) : null);
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
  const activeEl = document.activeElement;
  const activeLabel = activeEl && !activeId ? (activeEl.getAttribute?.('aria-label') || activeEl.getAttribute?.('title')) : null;
  const activeTag = activeEl?.tagName?.toLowerCase();
  const focusWasInContent = content.contains(document.activeElement) && document.activeElement !== content;
  const scroll = window.scrollY;
  renderNav(route.id);
  crumb.replaceChildren(h('span', {}, `${BRAND.name} / `), h('strong', {}, route.label));
  document.title = route.id === DEFAULT ? `${BRAND.name} · ${BRAND.tagline}` : `${route.label} · ${BRAND.name}`;
  const ctx = { store, navigate, snapshots, rerender: () => render() };
  let view;
  try {
    view = route.render(ctx);
  } catch (err) {
    console.error(err);
    view = notice(`Erro ao abrir "${route.label}": ${err.message}. Seus dados não foram alterados. Exporte um backup em Configurações e recarregue a página.`, 'bad');
  }
  const banners = [];
  if (store.loadError) banners.push(notice(`Os dados salvos neste navegador não puderam ser lidos (${store.loadError.message}). Nada foi sobrescrito. Importe um backup em Configurações ou restaure a configuração inicial.`, 'bad'));
  else if (!store.persistent) banners.push(notice('Não foi possível salvar neste navegador (armazenamento bloqueado, janela anônima ou espaço cheio). Suas alterações valem só até fechar a página: exporte um backup agora em Configurações › Dados e backup.', 'warn'));
  clear(content).append(...banners, view);
  if (changed || focus) {
    lastRoute = route.id;
    window.scrollTo(0, 0);
    (content.querySelector('#page-title') || content).focus({ preventScroll: true });
  } else {
    window.scrollTo(0, scroll);
    const byLabel = () => {
      if (!activeLabel || !window.CSS?.escape) return null;
      const v = CSS.escape(activeLabel);
      return content.querySelector(`${activeTag}[aria-label="${v}"], ${activeTag}[title="${v}"]`);
    };
    const target = activeId ? document.getElementById(activeId) : byLabel();
    if (target) target.focus({ preventScroll: true });
    // O elemento focado foi substituído (ex.: botão sem id): o foco vai ao título, não se perde.
    else if (focusWasInContent) {
      if (!document.querySelector('.modal')) content.querySelector('#page-title')?.focus({ preventScroll: true });
    }
  }
}

// Mudanças de dados redesenham a tela logo DEPOIS do evento que as causou. Assim um Tab que
// confirma um campo já levou o foco ao próximo campo, e o foco é restaurado no lugar certo.
let scheduled = null;
function scheduleRender(opts = {}) {
  if (scheduled) { scheduled.focus = scheduled.focus || !!opts.focus; return; }
  scheduled = { focus: !!opts.focus };
  setTimeout(() => { const o = scheduled; scheduled = null; render(o); }, 0);
}

window.addEventListener('hashchange', () => { closeModal(); render(); });
store.subscribe((change) => {
  if (change.type === 'settings') applyTheme();
  if (change.type === 'import' || change.type === 'reset') { upgrade({ silent: true }); applyTheme(); scheduleRender({ focus: true }); return; }
  scheduleRender();
});
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) toast('Os dados foram alterados em outra aba. Recarregue a página para ver a versão mais recente.', { error: true });
});

// Atalhos globais: Ctrl/Cmd+K ou "/" abrem a busca; "?" mostra os atalhos.
document.addEventListener('keydown', (e) => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch({ store, navigate, modules: PAGES }); return; }
  if (typing || e.ctrlKey || e.metaKey || e.altKey || document.querySelector('.modal')) return;
  if (e.key === '/') { e.preventDefault(); openSearch({ store, navigate, modules: PAGES }); }
  else if (e.key === '?') { e.preventDefault(); openShortcuts(); }
});

bootSplash();
applyTheme();
// Primeira renderização não move o foco: o primeiro Tab deve chegar ao link "Pular para o conteúdo".
lastRoute = currentRoute().id;
render({ focus: false });
