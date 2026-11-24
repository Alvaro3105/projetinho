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
import { togglePopover, closePopover } from './ui/popover.js';
import { installTooltips } from './ui/tooltip.js';
import { buildNotifications, unseenCount, markSeen } from './core/notifications.js';
import { fmtDate } from './core/dates.js';

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
const modeSeg = h('div', { class: 'seg', role: 'group', 'aria-label': 'Modo de exibição do Painel' });
const bellBtn = h('button', { type: 'button', class: 'btn ghost icon', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', onclick: () => openNotifications() });
const profileBtn = h('button', { type: 'button', class: 'btn ghost profile-btn', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', onclick: () => openProfile() });
const collapseBtn = h('button', { type: 'button', class: 'btn ghost sm collapse-btn', onclick: () => store.setSettings({ sidebarCollapsed: !store.state.settings.sidebarCollapsed }) });
const shell = h('div', { class: 'app' },
  h('aside', { class: 'sidebar', id: 'sidebar' },
    h('a', { class: 'brand', href: '#painel', 'aria-label': `${BRAND.name} — ir para o Painel Inicial` },
      h('span', { html: brandMark({ id: 'jvside' }), style: { display: 'contents' } }),
      h('span', { style: { minWidth: 0 } }, h('span', { class: 'brand-name' }, BRAND.name), h('span', { class: 'brand-sub' }, BRAND.tagline))),
    navHost,
    h('div', { class: 'sidebar-foot' }, h('div', { class: 'sig' }, `${BRAND.signature} · ${BRAND.year}`), h('div', {}, BRAND.concept), h('div', { class: 'faint-side' }, 'Dados salvos neste navegador')),
    collapseBtn),
  h('div', { class: 'scrim', onclick: () => toggleNav(false) }),
  h('div', { class: 'main' },
    h('header', { class: 'topbar' },
      h('button', { type: 'button', class: 'btn ghost icon menu-btn', 'aria-label': 'Abrir menu', 'aria-controls': 'sidebar', 'aria-expanded': 'false', onclick: () => toggleNav() }, icon('menu')),
      crumb,
      h('div', { class: 'spacer' }),
      h('button', { type: 'button', class: 'btn sm search-btn', onclick: () => openSearch({ store, navigate, modules: PAGES }), 'aria-label': 'Buscar no JARVIS (Ctrl+K)' }, icon('search'), h('span', { class: 'hide-sm grow' }, 'Buscar em tudo'), h('kbd', { class: 'hide-sm' }, 'Ctrl K')),
      h('span', { class: 'hide-sm' }, modeSeg),
      h('div', { class: 'pop-wrap' }, bellBtn),
      themeBtn,
      h('div', { class: 'pop-wrap' }, profileBtn)),
    content));

clear(root).append(h('a', { class: 'skip-link', href: '#conteudo', onclick: (e) => { e.preventDefault(); content.focus(); } }, 'Pular para o conteúdo'), shell);

// ---------- Modo, barra lateral, movimento ----------
const MODES = [
  { value: 'assistente', label: 'Assistente', icon: 'orbit', hint: 'Núcleo, comando e ações rápidas' },
  { value: 'produtividade', label: 'Produtividade', icon: 'rows', hint: 'Painel detalhado, todos os blocos' },
];
function uiMode() { return store.state.settings.uiMode === 'produtividade' ? 'produtividade' : 'assistente'; }
function applyChrome() {
  const st = store.state.settings;
  const root = document.documentElement;
  root.setAttribute('data-ui-mode', uiMode());
  if (st.motion === 'reduced') root.setAttribute('data-motion', 'reduced'); else root.removeAttribute('data-motion');
  shell.classList.toggle('collapsed', !!st.sidebarCollapsed);
  clear(collapseBtn).append(icon('sidebar'), h('span', { class: 'btn-label' }, st.sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'));
  collapseBtn.setAttribute('aria-label', st.sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral');
  collapseBtn.setAttribute('aria-expanded', String(!st.sidebarCollapsed));
  if (st.sidebarCollapsed) { collapseBtn.dataset.tip = 'Expandir menu'; collapseBtn.dataset.tipSide = 'right'; } else { delete collapseBtn.dataset.tip; }
  // Os botões são criados uma vez e só têm aria-pressed atualizado: assim o foco não se perde.
  if (!modeSeg.childElementCount) modeSeg.append(...MODES.map((m) => h('button', { type: 'button', 'data-mode': m.value, title: m.hint, onclick: () => store.setSettings({ uiMode: m.value }) }, icon(m.icon), m.label)));
  for (const b of modeSeg.children) b.setAttribute('aria-pressed', String(b.dataset.mode === uiMode()));
  const initials = (store.state.profile.name || 'Você').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  clear(profileBtn).append(h('span', { class: 'avatar', 'aria-hidden': 'true' }, initials || '·'));
  profileBtn.setAttribute('aria-label', `Perfil e preferências: ${store.state.profile.name || 'sem nome'}`);
  profileBtn.dataset.tip = 'Perfil e preferências';
  updateBell();
}

// ---------- Notificações (derivadas dos seus registros) ----------
function updateBell() {
  const list = buildNotifications(store.state);
  const n = unseenCount(list, store.state.settings.seenNotifications || []);
  clear(bellBtn).append(icon('bell'));
  if (n) bellBtn.append(h('span', { class: 'dot-count', 'aria-hidden': 'true' }, n > 9 ? '9+' : String(n)));
  bellBtn.setAttribute('aria-label', n ? `Notificações: ${n} nova(s)` : 'Notificações: nenhuma nova');
  bellBtn.dataset.tip = 'Notificações';
}
function openNotifications() {
  const list = buildNotifications(store.state);
  const seen = new Set(store.state.settings.seenNotifications || []);
  togglePopover(bellBtn, {
    label: 'Notificações',
    build: (close) => [
      h('div', { class: 'popover-head' }, h('strong', {}, 'Notificações'), h('span', { class: 'hud-label' }, list.length === 1 ? '1 aviso' : `${list.length} avisos`)),
      list.length ? h('ul', { class: 'popover-list' }, list.map((n) => h('li', {},
        h('button', { type: 'button', class: `pop-item${seen.has(n.key) ? '' : ' unseen'}`, onclick: () => { close({ restoreFocus: false }); navigate(n.route); } },
          h('span', { class: `pi-dot ${n.tone}`, 'aria-hidden': 'true' }),
          h('span', { style: { minWidth: 0 } }, h('span', { class: 'pi-title', style: { display: 'block' } }, n.title), h('span', { class: 'pi-sub' }, n.date ? `${n.sub} · ${fmtDate(n.date)}` : n.sub))))))
        : h('p', { class: 'pop-empty' }, 'Nada pendente agora. Avisos aparecem aqui quando uma atividade vence, uma entrega se aproxima (3 dias) ou um sinal de atenção surge nos seus registros.'),
      h('p', { class: 'small faint', style: { padding: '8px 12px 4px' } }, 'Geradas só a partir dos seus registros. Nada é enviado para fora.'),
    ],
    onOpen: () => { if (list.length) store.setSettings({ seenNotifications: markSeen(list, store.state.settings.seenNotifications || []) }); },
  });
}

// ---------- Perfil ----------
function openProfile() {
  const p = store.state.profile;
  const item = (label, iconName, fn) => h('li', {}, h('button', { type: 'button', class: 'pop-item', onclick: () => { closePopover({ restoreFocus: false }); fn(); } }, icon(iconName), h('span', { class: 'pi-title' }, label)));
  togglePopover(profileBtn, {
    label: 'Perfil e preferências',
    build: () => [
      h('div', { class: 'popover-head' }, h('div', {}, h('strong', { style: { display: 'block' } }, p.name || 'Perfil sem nome'), h('span', { class: 'small faint' }, p.course || p.headline || 'Edite seu perfil em Configurações'))),
      h('ul', { class: 'popover-list' },
        item(uiMode() === 'assistente' ? 'Mudar para o modo Produtividade' : 'Mudar para o modo Assistente', uiMode() === 'assistente' ? 'rows' : 'orbit', () => store.setSettings({ uiMode: uiMode() === 'assistente' ? 'produtividade' : 'assistente' })),
        item('Editar perfil', 'person', () => navigate('configuracoes')),
        item('Configurações e aparência', 'gear', () => navigate('configuracoes')),
        item('Central de Backup', 'lock', () => navigate('backup')),
        item('Revisão semanal', 'cycle', () => navigate('revisoes')),
        item('Atalhos de teclado', 'keyboard', () => openShortcuts())),
    ],
  });
}

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
  const groups = [];
  for (const r of ROUTES) {
    if (r.group) { groups.push({ label: r.group, items: [] }); continue; }
    groups[groups.length - 1].items.push(r);
  }
  clear(navHost).append(...groups.map((g) => h('div', { class: 'nav-group', role: 'group', 'aria-label': g.label },
    h('div', { class: 'nav-label', 'aria-hidden': 'true' }, g.label),
    g.items.map((r) => {
      const count = r.count ? r.count(store.state) : 0;
      return h('a', {
        href: `#${r.id}`, 'aria-current': r.id === active ? 'page' : null,
        'aria-label': count ? `${r.label}, ${count} ${r.countLabel || 'pendentes'}` : r.label,
        'data-tip': store.state.settings.sidebarCollapsed ? r.label : null, 'data-tip-side': 'right',
        onclick: () => { toggleNav(false); if (location.hash === `#${r.id}`) render({ focus: true }); },
      }, icon(r.icon), h('span', {}, r.label), count ? h('span', { class: 'nav-count', 'aria-hidden': 'true' }, String(count)) : null);
    }))));
}

function applyTheme() {
  const theme = store.state.settings.theme || 'dark';
  document.documentElement.setAttribute('data-cos-theme', theme);
  clear(themeBtn).append(icon(theme === 'light' ? 'moon' : 'sun'));
  themeBtn.setAttribute('aria-label', theme === 'light' ? 'Usar tema escuro' : 'Usar tema claro');
  themeBtn.dataset.tip = theme === 'light' ? 'Tema escuro' : 'Tema claro';
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
  const ctx = { store, navigate, snapshots, rerender: () => render(), modules: PAGES, openSearch: () => openSearch({ store, navigate, modules: PAGES }) };
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
  updateBell();
  if (changed) {
    content.classList.remove('route-enter');
    void content.offsetWidth; // reinicia a animação de entrada
    content.classList.add('route-enter');
  }
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

window.addEventListener('hashchange', () => { closeModal(); closePopover({ restoreFocus: false }); render(); });
store.subscribe((change) => {
  if (change.type === 'settings' || change.type === 'profile') { applyTheme(); applyChrome(); }
  if (change.type === 'import' || change.type === 'reset') { upgrade({ silent: true }); applyTheme(); applyChrome(); scheduleRender({ focus: true }); return; }
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

bootSplash({ reduced: store.state.settings.motion === 'reduced' });
applyTheme();
applyChrome();
installTooltips();
// Primeira renderização não move o foco: o primeiro Tab deve chegar ao link "Pular para o conteúdo".
lastRoute = currentRoute().id;
// A página é montada por JavaScript: a restauração automática de rolagem do navegador
// pode cair num ponto errado ao recarregar. O JARVIS abre sempre no topo.
try { history.scrollRestoration = 'manual'; } catch { /* navegador sem suporte */ }
render({ focus: false });
window.scrollTo(0, 0);
