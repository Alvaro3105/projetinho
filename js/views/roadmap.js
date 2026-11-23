import { h } from '../core/dom.js';
import { today, fmtDate } from '../core/dates.js';
import { PHASES, MILESTONE_STATUS, MILESTONE_TYPES, SEMESTER_STATUS, optionLabel } from '../core/schema.js';
import { currentPhase, isBlocked, loadFactor, AVERAGE_SEMESTER_HOURS } from '../core/metrics.js';
import { card, badge, optBadge, btn, pageHead, tabs, refNames, kv, notice, chips } from '../ui/components.js';
import { crud } from '../ui/form.js';
import { confirmDialog, openModal, closeModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { CURRICULUM_SOURCE, CURRICULUM_GAPS, MATH_TRACK } from '../data/curriculum.js';
import { extLink } from '../core/dom.js';

let tab = 'timeline';
let typeFilter = 'all';

export function renderRoadmap(ctx) {
  const { store, rerender } = ctx;
  return h('div', { class: 'stack', style: { gap: '20px' } },
    pageHead('Roadmap', 'Onde você está, o que vem depois e o que depende do quê. Marcos são planos: o status muda quando há entrega verificável.', [
      btn('Novo marco', () => crud(store, 'milestones', { titleNew: 'Novo marco', defaults: { phase: currentPhase().value, status: 'planejado', type: 'tecnico' } }), { kind: 'primary', iconName: 'plus' }),
    ]),
    tabs([['timeline', 'Linha do tempo'], ['semestres', 'Semestres (PUC Minas)']], tab, (k) => { tab = k; rerender(); }),
    tab === 'timeline' ? timeline(ctx) : semesters(ctx));
}

function timeline({ store, rerender }) {
  const all = store.list('milestones');
  const now = today();
  const cur = currentPhase(now);
  const filtered = typeFilter === 'all' ? all : all.filter((m) => m.type === typeFilter);
  return h('div', { class: 'stack', style: { gap: '16px' } },
    chips([['all', 'Todos'], ...MILESTONE_TYPES.map((t) => [t.value, t.label])], typeFilter, (k) => { typeFilter = k; rerender(); }, 'Filtrar por tipo'),
    h('div', { class: 'timeline' }, PHASES.map((p) => {
      const items = filtered.filter((m) => Number(m.phase) === p.value).sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'));
      const state = p.value < cur.value ? 'past' : p.value === cur.value ? 'current' : '';
      const doneCount = all.filter((m) => Number(m.phase) === p.value && m.status === 'concluido').length;
      const totalCount = all.filter((m) => Number(m.phase) === p.value).length;
      return h('section', { class: `phase ${state}`, 'aria-label': p.label },
        h('div', { class: 'phase-rail' }, h('span', { class: 'phase-dot' }, String(p.value)), h('span', { class: 'phase-line' })),
        h('div', { class: 'stack' },
          h('div', { class: 'row between' },
            h('div', {}, h('h2', {}, p.label), h('p', { class: 'small muted' }, `${p.period} · ${doneCount}/${totalCount} marcos concluídos`)),
            state === 'current' ? badge(cur.upcoming ? 'Próxima fase (começa em 30/11/2026)' : 'Você está aqui', 'accent') : null),
          items.length ? items.map((m) => milestoneRow(store, m, all, now)) : h('p', { class: 'small faint' }, 'Nenhum marco nesta fase com este filtro.')));
    })));
}

function milestoneRow(store, m, all, now) {
  const blocked = isBlocked(m, all) && m.status !== 'concluido';
  const deps = refNames(store, 'milestones', m.dependsOn, 'title');
  const skills = refNames(store, 'skills', m.skillIds);
  const late = m.due && m.due < now && m.status !== 'concluido';
  const statusSel = h('select', { 'aria-label': `Status de ${m.title}`, onchange: (e) => store.update('milestones', m.id, { status: e.target.value, completedAt: e.target.value === 'concluido' ? now : null }) },
    MILESTONE_STATUS.map((o) => h('option', { value: o.value }, o.label)));
  statusSel.value = m.status;
  statusSel.style.width = 'auto';
  return h('article', { class: `milestone${blocked ? ' blocked' : ''}` },
    h('div', { style: { minWidth: 0 } },
      h('div', { class: 'row' }, h('strong', {}, m.title), badge(optionLabel(MILESTONE_TYPES, m.type), 'plain', { class: 'badge plain' })),
      h('div', { class: 'small muted' }, [m.period, m.due ? `alvo ${fmtDate(m.due)}` : null].filter(Boolean).join(' · ')),
      m.description ? h('div', { class: 'small', style: { marginTop: '4px' } }, m.description) : null,
      deps.length ? h('div', { class: 'deps' }, `Depende de: ${deps.join(' · ')}`) : null,
      skills.length ? h('div', { class: 'deps' }, `Competências: ${skills.join(', ')}`) : null),
    h('div', { class: 'stack', style: { alignItems: 'flex-end', gap: '6px' } },
      h('div', { class: 'row' }, blocked ? badge('Bloqueado por dependência', 'warn') : null, late ? badge('Atrasado', 'bad') : null, optBadge(MILESTONE_STATUS, m.status)),
      h('div', { class: 'row' }, statusSel,
        btn('', () => crud(store, 'milestones', { item: m, titleEdit: 'Editar marco' }), { size: 'sm', kind: 'ghost', iconName: 'edit', title: `Editar ${m.title}` }),
        btn('', async () => { if (await confirmDialog({ title: 'Excluir marco', message: `Excluir "${m.title}"? Marcos que dependem dele perdem a dependência.`, confirmLabel: 'Excluir', danger: true })) { store.remove('milestones', m.id); toast('Marco excluído.'); } }, { size: 'sm', kind: 'ghost', iconName: 'trash', title: `Excluir ${m.title}` }))));
}

function semesters({ store }) {
  const list = [...store.list('semesters')].sort((a, b) => a.number - b.number);
  const total = list.reduce((a, s) => a + s.disciplines.reduce((x, d) => x + (d.hours || 0), 0), 0);
  const confirmedAt = store.state.settings.curriculumConfirmedAt;
  const header = confirmedAt
    ? notice(h('span', {}, `Matriz confirmada por você em ${fmtDate(confirmedAt)} como a vinculada à sua matrícula. Engenharia de Software — PUC Minas, ${CURRICULUM_SOURCE.campus}, turno ${CURRICULUM_SOURCE.shift.toLowerCase()} (${total.toLocaleString('pt-BR')} h em disciplinas). `, extLink(CURRICULUM_SOURCE.url, 'Página oficial')), 'info',
      btn('Voltar a provisória', () => store.setSettings({ curriculumConfirmedAt: null }), { size: 'sm', kind: 'ghost' }))
    : notice(h('span', {}, h('strong', {}, 'Referência provisória. '), `Matriz oficial de Engenharia de Software — PUC Minas, ${CURRICULUM_SOURCE.campus}, turno ${CURRICULUM_SOURCE.shift.toLowerCase()}, atualizada pela PUC em ${fmtDate(CURRICULUM_SOURCE.updated)} e conferida por você na página oficial (${total.toLocaleString('pt-BR')} h em disciplinas). Vale até você confirmar a matriz vinculada à matrícula de 2027; se houver diferenças, edite as disciplinas do período antes de confirmar. `,
      extLink(CURRICULUM_SOURCE.url, 'Página oficial')), 'warn',
      btn('Confirmar matriz da matrícula', async () => {
        if (await confirmDialog({ title: 'Confirmar matriz da matrícula', message: 'Confirme só depois de comparar com a matriz vinculada à sua matrícula de 2027 (portal do aluno ou secretaria). As disciplinas atuais passam a ser a referência definitiva e não serão mais alteradas por atualizações automáticas.', confirmLabel: 'Confirmar' })) {
          for (const sem of list) store.update('semesters', sem.id, { disciplinesEditedAt: sem.disciplinesEditedAt || today() });
          store.setSettings({ curriculumConfirmedAt: today() });
          toast('Matriz confirmada.');
        }
      }, { size: 'sm' }));
  return h('div', { class: 'stack', style: { gap: '16px' } },
    header,
    card({ title: 'O que a grade não cobre (estudar em paralelo)', iconName: 'alert' },
      h('div', { class: 'list' }, CURRICULUM_GAPS.map((g) => h('div', { class: 'list-item' }, h('div', { class: 'grow' }, h('div', { class: 'title' }, g.topic), h('div', { class: 'sub' }, g.why), h('div', { class: 'sub' }, h('strong', {}, 'Quando: '), g.when)))))),
    card({ title: 'Trilha de matemática', iconName: 'chart', sub: 'O que vem da PUC e o que é complementar, em ordem. O 3º período (708 h) fica sem matemática extra.' },
      h('div', { class: 'table-wrap' }, h('table', {},
        h('thead', {}, h('tr', {}, ['Quando', 'Origem', 'Conteúdo', 'Por quê'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', {}, MATH_TRACK.map((m) => h('tr', {}, h('td', { style: { whiteSpace: 'nowrap' } }, m.when), h('td', {}, badge(m.source, m.source === 'PUC' ? 'info' : m.source === 'Complementar' ? 'accent' : 'plain')), h('td', {}, m.topic), h('td', { class: 'small muted' }, m.why))))))),
    h('div', { class: 'grid cols-2' }, list.map((s) => semesterCard(store, s))));
}

function semesterCard(store, s) {
  const statusSel = h('select', { 'aria-label': `Status do ${s.number}º período`, onchange: (e) => store.update('semesters', s.id, { status: e.target.value }) }, SEMESTER_STATUS.map((o) => h('option', { value: o.value }, o.label)));
  statusSel.value = s.status;
  statusSel.style.width = 'auto';
  const total = s.disciplines.reduce((a, d) => a + (d.hours || 0), 0);
  const factor = loadFactor(s);
  return card({ title: `${s.number}º período · ${s.term}${s.theme ? ` · ${s.theme}` : ''}`, meta: total ? `${total} h` : null, actions: h('div', { class: 'row' }, statusSel, btn('Disciplinas', () => editDisciplines(store, s), { size: 'sm', iconName: 'edit' })) },
    h('div', { class: 'list' }, s.disciplines.map((d) => h('div', { class: 'list-item' },
      h('button', { type: 'button', class: 'check', 'aria-pressed': d.status === 'concluida' ? 'true' : 'false', 'aria-label': `Marcar ${d.name} como concluída`, onclick: () => {
        store.update('semesters', s.id, { disciplines: s.disciplines.map((x) => x.id === d.id ? { ...x, status: x.status === 'concluida' ? 'futura' : 'concluida' } : x) });
      } }, h('span', { html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>' }).firstChild),
      h('div', { class: `grow${d.status === 'concluida' ? ' done' : ''}` }, h('div', { class: 'title' }, d.name), d.note ? h('div', { class: 'sub' }, d.note) : null),
      h('div', { class: 'side' }, d.hours ? h('span', { class: 'tag' }, `${d.hours} h`) : null, d.verified ? null : badge('A confirmar', 'warn'))))),
    factor < 1 ? h('div', { style: { marginTop: '10px' } }, badge(factor <= 0.85 ? `Carga alta: ${total} h (média ${AVERAGE_SEMESTER_HOURS} h)` : `Carga acima da média: ${total} h`, factor <= 0.85 ? 'warn' : 'plain'),
      h('span', { class: 'small muted' }, ` Estudo extra planejado a ${Math.round(factor * 100)}% da sua disponibilidade.`)) : null,
    s.disciplinesEditedAt ? h('p', { class: 'small faint', style: { marginTop: '8px' } }, `Disciplinas editadas/confirmadas por você em ${fmtDate(s.disciplinesEditedAt)}.`) : null,
    h('details', { class: 'acc', style: { marginTop: '12px' } },
      h('summary', {}, 'Plano complementar do período'),
      h('div', { class: 'acc-body' }, kv([
        ['Conhecimentos prévios', s.prior], ['Fundamentos-chave', s.fundamentals], ['Estudo paralelo', s.parallel],
        ['Projeto prático', s.project], ['Frente profissional', s.professional],
      ]))));
}

function editDisciplines(store, s) {
  const text = h('textarea', { id: 'disc-edit', style: { minHeight: '220px' } }, s.disciplines.map((d) => `${d.name}${d.hours ? ` | ${d.hours}` : ''}`).join('\n'));
  openModal({
    title: `Disciplinas do ${s.number}º período`,
    body: h('div', { class: 'stack' },
      h('p', { class: 'small muted' }, 'Uma disciplina por linha. Opcional: "| carga horária". Ao salvar, as disciplinas passam a contar como confirmadas por você.'),
      h('div', { class: 'field' }, h('label', { for: 'disc-edit' }, 'Disciplinas'), text)),
    footer: [btn('Cancelar', () => closeModal(), { kind: 'ghost' }), btn('Salvar', () => {
      const lines = text.value.split('\n').map((l) => l.trim()).filter(Boolean);
      const disciplines = lines.map((line) => {
        const [name, hours] = line.split('|').map((x) => x.trim());
        const old = s.disciplines.find((d) => d.name === name);
        const n = Number(hours);
        return { id: old?.id || `dis_${Math.random().toString(36).slice(2, 9)}`, name: name.slice(0, 160), hours: Number.isFinite(n) && n > 0 ? n : null, verified: true, note: '', status: old?.status || 'futura', grade: old?.grade ?? null };
      });
      store.update('semesters', s.id, { disciplines, disciplinesEditedAt: today() });
      closeModal();
      toast('Disciplinas atualizadas.');
    }, { kind: 'primary', iconName: 'check' })],
  });
}
