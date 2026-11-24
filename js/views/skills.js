import { h, extLink } from '../core/dom.js';
import { fmtDate, today } from '../core/dates.js';
import { SKILL_CATEGORIES, LEVELS, LEVEL_DESCRIPTIONS, PRIORITY, CONTACT, ASSESSMENT_STATUS, optionLabel, levelScore } from '../core/schema.js';
import { skillGaps, isBlocked } from '../core/metrics.js';
import { card, badge, optBadge, btn, pageHead, tabs, chips, empty, levelView, refNames, kv, notice, stat } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { openModal, closeModal, confirmDialog } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { setSkillLevel, addEvidence, createTaskForSkill, recordAssessment, levelGapText } from './actions.js';
import { rangeBars } from '../ui/charts.js';

let tab = 'competencias';
let cat = 'all';
let view = 'all';

export function renderSkills(ctx) {
  const { store, rerender } = ctx;
  const pending = store.list('assessments').filter((a) => a.status === 'pendente').length;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Competências', 'O nível mede o que você consegue fazer sozinho, com evidência. Curso concluído não sobe nível automaticamente.', [
      btn('Nova competência', () => crud(store, 'skills', { titleNew: 'Nova competência', defaults: { level: 'nao_avaliado', target: 'intermediario', category: 'programacao', priority: 'media', evidence: [], history: [] } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['competencias', 'Competências'], ['avaliacoes', `Avaliações diagnósticas${pending ? ` (${pending})` : ''}`], ['escala', 'Escala de níveis']], tab, (k) => { tab = k; rerender(); }),
    tab === 'competencias' ? skillList(ctx) : tab === 'avaliacoes' ? assessments(ctx) : scale());
}

function skillList({ store, rerender }) {
  const all = store.list('skills');
  const { below, unassessed } = skillGaps(all);
  const belowIds = new Set(below.map((s) => s.id));
  let pool = cat === 'all' ? all : all.filter((s) => s.category === cat);
  if (view === 'gap') pool = pool.filter((s) => belowIds.has(s.id));
  if (view === 'na') pool = pool.filter((s) => levelScore(s.level) === null);
  if (view === 'alta') pool = pool.filter((s) => s.priority === 'alta');
  const assessed = all.filter((s) => levelScore(s.level) !== null);
  const chart = assessed.length ? card({ title: 'Atual × desejado (avaliadas)', iconName: 'chart' },
    rangeBars(assessed.slice(0, 14).map((s) => ({ label: s.name, value: levelScore(s.level), target: levelScore(s.target), max: 4 })), { label: 'Nível atual e desejado', format: (v) => String(v) }),
    h('div', { class: 'legend', style: { marginTop: '8px' } }, h('span', {}, h('i', { style: { background: 'var(--primary)' } }), 'atual (0–4)'), h('span', {}, h('i', { style: { background: 'var(--accent)', width: '2px' } }), 'desejado'))) : null;
  return h('div', { class: 'stack' },
    h('div', { class: 'grid cols-3' },
      card({}, stat('Competências', String(all.length), `${assessed.length} avaliadas`)),
      card({}, stat('Abaixo do desejado', String(below.length), 'Entre as avaliadas')),
      card({}, stat('Não avaliadas', String(unassessed.length), 'Faça as avaliações diagnósticas'))),
    unassessed.length === all.length ? notice('Todas as competências estão como "Não avaliado". Isso é intencional: contato com uma tecnologia não define nível. Comece pelas avaliações diagnósticas.', 'info', btn('Ver avaliações', () => { tab = 'avaliacoes'; rerender(); }, { size: 'sm' })) : null,
    chart,
    h('div', { class: 'row between' },
      chips([['all', 'Todas'], ...SKILL_CATEGORIES.map((c) => [c.value, c.label])], cat, (k) => { cat = k; rerender(); }, 'Filtrar por categoria'),
      chips([['all', 'Tudo'], ['alta', 'Prioridade alta'], ['gap', 'Abaixo do desejado'], ['na', 'Não avaliadas']], view, (k) => { view = k; rerender(); }, 'Filtrar por situação')),
    pool.length ? SKILL_CATEGORIES.filter((c) => pool.some((s) => s.category === c.value)).map((c) =>
      card({ title: c.label, meta: `${pool.filter((s) => s.category === c.value).length} competências` },
        h('div', { class: 'list' }, pool.filter((s) => s.category === c.value).map((s) => skillRow(store, s, belowIds.has(s.id))))))
      : empty('Nenhuma competência neste filtro.'));
}

function skillRow(store, s, below) {
  return h('div', { class: 'list-item' },
    h('div', { class: 'grow' },
      h('button', { type: 'button', class: 'title', style: { background: 'none', border: 0, padding: 0, color: 'inherit', font: 'inherit', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }, onclick: () => skillDetail(store, s.id) }, s.name),
      h('div', { class: 'sub' }, [s.contact ? optionLabel(CONTACT, s.contact) : null, s.assessedAt ? `avaliada em ${fmtDate(s.assessedAt)}` : 'nunca avaliada', `${(s.evidence || []).length} evidência(s)`].filter(Boolean).join(' · ')),
      s.nextAction ? h('div', { class: 'sub' }, `Próxima ação: ${s.nextAction}`) : null),
    h('div', { class: 'side' },
      levelView(s.level, s.target),
      h('span', { class: 'small faint' }, `→ ${LEVELS.find((l) => l.value === s.target)?.label || '—'}`),
      s.priority === 'alta' ? optBadge(PRIORITY, s.priority) : null,
      below ? badge(levelGapText(s), 'warn') : null,
      btn('Avaliar', () => assessDialog(store, s), { size: 'sm' }),
      btn('', () => createTaskForSkill(store, s), { size: 'sm', kind: 'ghost', iconName: 'plus', title: `Criar atividade para ${s.name}` })));
}

function assessDialog(store, s) {
  const sel = h('select', { id: 'lv-new' }, LEVELS.map((l) => h('option', { value: l.value }, l.label)));
  sel.value = s.level;
  const desc = h('p', { class: 'small muted', id: 'lv-desc' }, LEVEL_DESCRIPTIONS[s.level]);
  sel.addEventListener('change', () => { desc.textContent = LEVEL_DESCRIPTIONS[sel.value]; });
  const ev = h('textarea', { id: 'lv-ev' });
  openModal({
    title: `Avaliar: ${s.name}`, size: 'sm',
    body: h('div', { class: 'stack' },
      h('div', { class: 'field' }, h('label', { for: 'lv-new' }, 'Nível que você demonstra hoje'), sel, desc),
      h('div', { class: 'field' }, h('label', { for: 'lv-ev' }, 'Evidência (obrigatória para mudar o nível)'), ev, h('span', { class: 'hint' }, 'O que você fez, sem IA gerar o código, que comprova esse nível?'))),
    footer: [btn('Cancelar', () => closeModal(), { kind: 'ghost' }), btn('Salvar avaliação', () => {
      if (sel.value !== s.level && !ev.value.trim()) { ev.setAttribute('aria-invalid', 'true'); ev.focus(); toast('Descreva a evidência para mudar o nível.', { error: true }); return; }
      if (sel.value !== s.level) setSkillLevel(store, s.id, sel.value, ev.value.trim(), { evidence: ev.value.trim() });
      else if (ev.value.trim()) { addEvidence(store, s.id, ev.value.trim()); store.update('skills', s.id, { assessedAt: today() }); }
      closeModal(); toast('Avaliação registrada.');
    }, { kind: 'primary', iconName: 'check' })],
  });
}

export function skillDetail(store, id) {
  const s = store.get('skills', id);
  if (!s) return;
  const projects = refNames(store, 'projects', s.projectIds);
  const fromProjects = store.list('projects').filter((p) => (p.skillIds || []).includes(id)).map((p) => p.name);
  const studies = store.list('studyItems').filter((i) => (i.skillIds || []).includes(id)).map((i) => `${i.title} (${i.status === 'concluido' ? 'concluído' : 'em plano'})`);
  const jobs = store.list('applications').filter((a) => (a.requiredSkills || []).includes(id)).map((a) => `${a.company} — ${a.role}`);
  const milestones = store.list('milestones').filter((m) => (m.skillIds || []).includes(id));
  const tasks = store.list('tasks').filter((t) => t.skillId === id);
  openModal({
    title: s.name,
    body: h('div', { class: 'stack' },
      h('div', { class: 'row' }, levelView(s.level, s.target), h('span', { class: 'small muted' }, `Desejado: ${LEVELS.find((l) => l.value === s.target)?.label}${s.targetDate ? ` até ${fmtDate(s.targetDate)}` : ''}`)),
      kv([
        ['Categoria', optionLabel(SKILL_CATEGORIES, s.category)],
        ['Situação declarada', s.contact ? optionLabel(CONTACT, s.contact) : '—'],
        ['Última avaliação', s.assessedAt ? fmtDate(s.assessedAt) : 'Nunca'],
        ['Próxima ação', s.nextAction],
        ['Materiais', s.resources || (studies.length ? studies.join(' · ') : '—')],
        ['Projetos', [...new Set([...projects, ...fromProjects])].join(' · ') || '—'],
        ['Vagas que exigem', jobs.join(' · ') || '—'],
        ['Marcos do roadmap', milestones.map((m) => m.title).join(' · ') || '—'],
        ['Atividades', tasks.map((t) => `${t.title}${t.status === 'feito' ? ' (feito)' : ''}`).join(' · ') || '—'],
        ['Observações', s.notes],
      ]),
      h('h3', {}, 'Evidências práticas'),
      (s.evidence || []).length ? h('ul', {}, s.evidence.map((e) => h('li', { class: 'small' }, `${e.date ? `${fmtDate(e.date)} — ` : ''}${e.text}`, e.url ? [' ', extLink(e.url, 'link')] : null))) : h('p', { class: 'small faint' }, 'Nenhuma evidência ainda.'),
      h('h3', {}, 'Histórico de evolução'),
      (s.history || []).length ? h('ul', {}, s.history.map((x) => h('li', { class: 'small' }, `${fmtDate(x.date)}: ${LEVELS.find((l) => l.value === x.from)?.label} → ${LEVELS.find((l) => l.value === x.to)?.label}${x.note ? ` · ${x.note}` : ''}`))) : h('p', { class: 'small faint' }, 'Sem mudanças de nível registradas.')),
    footer: [
      btn('Excluir', async () => { closeModal(); if (await confirmDialog({ title: 'Excluir competência', message: `Excluir "${s.name}" e seu histórico? Referências em projetos, vagas e metas serão removidas.`, confirmLabel: 'Excluir', danger: true })) { store.remove('skills', s.id); toast('Competência excluída.'); } }, { kind: 'danger', iconName: 'trash' }),
      btn('Criar atividade', () => { closeModal(); createTaskForSkill(store, s); }, { iconName: 'plus' }),
      btn('Editar', () => { closeModal(); crud(store, 'skills', { item: s, titleEdit: `Editar ${s.name}` }); }, { iconName: 'edit' }),
      btn('Avaliar', () => { closeModal(); assessDialog(store, s); }, { kind: 'primary' }),
    ],
  });
}

function assessments({ store }) {
  const list = store.list('assessments');
  return h('div', { class: 'stack' },
    notice('Faça sem IA, cronometrado e sem consultar soluções. O objetivo é medir, não acertar tudo. Resultado ruim agora é informação útil.', 'info'),
    list.length ? list.map((a) => card({ title: a.title, meta: a.duration, actions: h('div', { class: 'row' }, optBadge(ASSESSMENT_STATUS, a.status),
      btn(a.status === 'realizada' ? 'Refazer registro' : 'Registrar resultado', () => recordAssessment(store, a), { size: 'sm', kind: a.status === 'realizada' ? '' : 'primary' }),
      btn('', () => crud(store, 'assessments', { item: a, titleEdit: 'Editar avaliação' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${a.title}` })) },
      kv([
        ['Competências', refNames(store, 'skills', a.skillIds).join(', ')],
        ['Protocolo', a.protocol],
        ['Critério', a.rubric],
        ['Realizada em', a.date ? fmtDate(a.date) : null],
        ['Resultado', a.resultNotes || null],
      ]))) : empty('Nenhuma avaliação cadastrada.'),
    btn('Nova avaliação', () => crud(store, 'assessments', { titleNew: 'Nova avaliação prática', defaults: { status: 'pendente' } }), { iconName: 'plus' }));
}

function scale() {
  return card({ title: 'Escala de níveis', sub: 'A mesma escala vale para todas as competências. O nível é sempre o que você demonstra hoje.' },
    h('div', { class: 'list' }, LEVELS.map((l) => h('div', { class: 'list-item' },
      h('div', { style: { minWidth: '210px' } }, levelView(l.value, null)),
      h('div', { class: 'grow small' }, LEVEL_DESCRIPTIONS[l.value])))));
}
