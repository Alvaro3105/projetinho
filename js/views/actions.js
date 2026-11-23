// Ações que conectam módulos (Parte 13.11): projeto → competências, curso → histórico,
// vaga → lacunas, competência abaixo do alvo → atividade, avaliação → nível.
import { h } from '../core/dom.js';
import { today } from '../core/dates.js';
import { LEVELS, levelScore } from '../core/schema.js';
import { openModal, closeModal } from '../ui/modal.js';
import { toast } from '../ui/toast.js';
import { btn } from '../ui/components.js';
import { crud } from '../ui/form.js';

/** Registra nova avaliação de nível com histórico (nunca sobrescreve sem rastro). */
export function setSkillLevel(store, skillId, level, note, { evidence } = {}) {
  const skill = store.get('skills', skillId);
  if (!skill) return;
  const history = [...(skill.history || []), { date: today(), from: skill.level, to: level, note: note || '' }];
  const ev = evidence ? [...(skill.evidence || []), { date: today(), text: evidence }] : skill.evidence;
  store.update('skills', skillId, { level, assessedAt: today(), history, evidence: ev });
}

export function addEvidence(store, skillId, text, url = '') {
  const skill = store.get('skills', skillId);
  if (!skill || !text) return;
  store.update('skills', skillId, { evidence: [...(skill.evidence || []), { date: today(), text, url }] });
}

function levelSelect(id, value) {
  const sel = h('select', { id }, LEVELS.map((l) => h('option', { value: l.value }, l.label)));
  sel.value = value || 'nao_avaliado';
  return sel;
}

/**
 * Diálogo para registrar competências desenvolvidas: evidência + (opcional) novo nível.
 * Usado ao concluir projeto, curso ou avaliação.
 */
export function skillsEvidenceDialog(store, { title, intro, skillIds, evidenceText, onDone, allowPick = true }) {
  const all = store.list('skills');
  let chosen = new Set(skillIds || []);
  const rowsHost = h('div', { class: 'stack' });

  function rows() {
    rowsHost.replaceChildren(...[...chosen].map((id) => {
      const s = store.get('skills', id);
      if (!s) return null;
      return h('div', { class: 'list-item', dataset: { skill: id } },
        h('div', { class: 'grow' }, h('div', { class: 'title' }, s.name), h('div', { class: 'sub' }, `Nível registrado: ${LEVELS.find((l) => l.value === s.level)?.label}`)),
        h('div', { class: 'field', style: { minWidth: '200px' } },
          h('label', { for: `lv-${id}` }, 'Nível após a evidência'),
          levelSelect(`lv-${id}`, s.level)));
    }));
  }

  const picker = allowPick ? h('div', { class: 'field' },
    h('label', { for: 'pick-skill' }, 'Adicionar competência'),
    h('select', { id: 'pick-skill', onchange: (e) => { if (e.target.value) { chosen.add(e.target.value); e.target.value = ''; rows(); } } },
      h('option', { value: '' }, '— escolher —'), all.map((s) => h('option', { value: s.id }, s.name)))) : null;

  const evidence = h('textarea', { id: 'ev-text' }, evidenceText || '');
  rows();
  openModal({
    title,
    body: h('div', { class: 'stack' },
      intro ? h('p', { class: 'muted' }, intro) : null,
      h('div', { class: 'field' }, h('label', { for: 'ev-text' }, 'Evidência prática (o que você consegue demonstrar)'), evidence,
        h('span', { class: 'hint' }, 'Ex.: "API com 12 testes passando, escrita sem IA gerar código".')),
      picker, rowsHost,
      h('p', { class: 'small faint' }, 'Só mude o nível se a evidência mostrar o que você faz sozinho. Concluir algo não sobe nível automaticamente.')),
    footer: [
      btn('Pular', () => { closeModal(); onDone?.(); }, { kind: 'ghost' }),
      btn('Registrar', () => {
        const text = evidence.value.trim();
        let changed = 0;
        for (const id of chosen) {
          const s = store.get('skills', id);
          const newLevel = document.getElementById(`lv-${id}`)?.value;
          if (!s) continue;
          if (newLevel && newLevel !== s.level) { setSkillLevel(store, id, newLevel, `Evidência: ${text}`.slice(0, 300), { evidence: text || null }); changed++; }
          else if (text) addEvidence(store, id, text);
        }
        closeModal();
        toast(changed ? `${changed} competência(s) atualizada(s) com histórico.` : 'Evidências registradas.');
        onDone?.();
      }, { kind: 'primary', iconName: 'check' }),
    ],
  });
}

export function completeProject(store, project) {
  store.update('projects', project.id, { status: 'concluido', endDate: project.endDate || today() });
  skillsEvidenceDialog(store, {
    title: `Projeto concluído: ${project.name}`,
    intro: 'Registre as competências que este projeto desenvolveu e o que ele prova.',
    skillIds: project.skillIds,
    evidenceText: `Projeto "${project.name}"${project.repoUrl ? ` (${project.repoUrl})` : ''}`,
  });
}

export function completeStudyItem(store, item) {
  store.update('studyItems', item.id, { status: 'concluido', completedAt: item.completedAt || today() });
  skillsEvidenceDialog(store, {
    title: `Concluído: ${item.title}`,
    intro: 'O curso entra no seu histórico de aprendizagem. Qual evidência prática ele gerou? (Certificado sozinho não é evidência de nível.)',
    skillIds: item.skillIds,
    evidenceText: `Concluí "${item.title}"`,
  });
}

export function createTaskForSkill(store, skill, { title } = {}) {
  crud(store, 'tasks', {
    titleNew: `Atividade para desenvolver "${skill.name}"`,
    defaults: { title: title || (skill.nextAction && !skill.nextAction.startsWith('Fazer a avaliação') ? skill.nextAction : `Praticar ${skill.name}`), status: 'a_fazer', area: ['ingles'].includes(skill.category) ? 'ingles' : ['comunicacao', 'lideranca'].includes(skill.category) ? 'pessoal' : 'tecnico', priority: skill.priority || 'media', skillId: skill.id },
  });
}

/** Registrar resultado de avaliação diagnóstica → atualiza níveis com histórico. */
export function recordAssessment(store, assessment) {
  const notes = h('textarea', { id: 'as-notes' }, assessment.resultNotes || '');
  const date = h('input', { type: 'date', id: 'as-date', value: assessment.date || today() });
  const skills = (assessment.skillIds || []).map((id) => store.get('skills', id)).filter(Boolean);
  openModal({
    title: `Resultado: ${assessment.title}`,
    body: h('div', { class: 'stack' },
      h('div', { class: 'notice' }, h('div', {}, h('strong', {}, 'Critério: '), assessment.rubric || '—')),
      h('div', { class: 'form' },
        h('div', { class: 'field' }, h('label', { for: 'as-date' }, 'Data'), date),
        h('div', { class: 'field full' }, h('label', { for: 'as-notes' }, 'Resultado observado (números, onde travou)'), notes)),
      skills.map((s) => h('div', { class: 'field' }, h('label', { for: `as-lv-${s.id}` }, s.name), levelSelect(`as-lv-${s.id}`, s.level)))),
    footer: [
      btn('Cancelar', () => closeModal(), { kind: 'ghost' }),
      btn('Salvar resultado', () => {
        if (!notes.value.trim()) { notes.setAttribute('aria-invalid', 'true'); notes.focus(); toast('Descreva o resultado antes de salvar.', { error: true }); return; }
        store.update('assessments', assessment.id, { status: 'realizada', date: date.value || today(), resultNotes: notes.value.trim() });
        for (const s of skills) {
          const lv = document.getElementById(`as-lv-${s.id}`).value;
          if (lv !== s.level) setSkillLevel(store, s.id, lv, `Avaliação diagnóstica: ${assessment.title}`, { evidence: `${assessment.title}: ${notes.value.trim()}`.slice(0, 400) });
          else addEvidence(store, s.id, `${assessment.title}: ${notes.value.trim()}`.slice(0, 400));
        }
        closeModal();
        toast('Avaliação registrada e níveis atualizados.');
      }, { kind: 'primary', iconName: 'check' }),
    ],
  });
}

export function levelGapText(skill) {
  const cur = levelScore(skill.level);
  const tgt = levelScore(skill.target);
  if (cur === null) return 'Não avaliado';
  if (tgt === null) return '';
  return cur >= tgt ? 'No nível desejado' : `${tgt - cur} nível(is) abaixo do desejado`;
}
