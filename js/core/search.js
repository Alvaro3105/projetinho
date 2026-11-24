// Busca global: índice de tudo o que você registrou + módulos + documentos. Função pura.
export const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const KINDS = [
  ['skills', 'Competência', (x) => x.name, (x) => [x.nextAction, x.notes]],
  ['projects', 'Projeto', (x) => x.name, (x) => [x.objective, x.description, (x.tech || []).join(' ')]],
  ['applications', 'Candidatura', (x) => `${x.company} — ${x.role}`, (x) => [x.requirementsText, x.notes]],
  ['studyItems', 'Material de estudo', (x) => x.title, (x) => [x.provider, x.notes]],
  ['milestones', 'Marco do plano', (x) => x.title, (x) => [x.description, x.period]],
  ['goals', 'Meta', (x) => x.title, (x) => [x.metric, x.notes]],
  ['tasks', 'Atividade', (x) => x.title, (x) => [x.notes]],
  ['opportunities', 'Oportunidade', (x) => x.title, (x) => [x.org, x.requirements]],
  ['companies', 'Empresa', (x) => x.name, (x) => [x.segment, x.why]],
  ['experiences', 'Experiência', (x) => `${x.role} · ${x.org}`, (x) => [x.description]],
  ['vocab', 'Vocabulário', (x) => x.term, (x) => [x.meaning, x.example]],
  ['readings', 'Leitura', (x) => x.title, (x) => [x.author, x.notes]],
  ['reflections', 'Reflexão', (x) => x.title || x.date, (x) => [x.text]],
  ['assessments', 'Avaliação diagnóstica', (x) => x.title, (x) => [x.protocol]],
  ['habits', 'Hábito', (x) => x.name, (x) => [x.why]],
];

/** Monta o índice. modules: [{id,label}], docs: [{id,title}]. */
export function buildIndex(state, { modules = [], docs = [] } = {}) {
  const items = [];
  for (const m of modules) items.push({ kind: 'module', label: 'Módulo', title: m.label, id: m.id, text: '' });
  for (const d of docs) items.push({ kind: 'doc', label: 'Guia Estratégico', title: d.title, id: d.id, text: '' });
  for (const [collection, label, title, extra] of KINDS) {
    for (const x of state.collections[collection] || []) {
      items.push({ kind: collection, label, title: String(title(x) || '(sem título)'), id: x.id, text: extra(x).filter(Boolean).join(' ') });
    }
  }
  for (const s of state.collections.semesters || []) {
    for (const d of s.disciplines || []) items.push({ kind: 'discipline', label: `Disciplina · ${s.number}º período`, title: d.name, id: s.id, text: s.term });
  }
  return items.map((it) => ({ ...it, _t: norm(it.title), _x: norm(it.text) }));
}

/** Todas as palavras precisam aparecer (título ou texto). Título pesa mais. */
export function search(index, query, limit = 30) {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored = [];
  for (const it of index) {
    let score = 0;
    let all = true;
    for (const t of terms) {
      if (it._t.startsWith(t)) score += 6;
      else if (it._t.includes(` ${t}`)) score += 4;
      else if (it._t.includes(t)) score += 3;
      else if (it._x.includes(t)) score += 1;
      else { all = false; break; }
    }
    if (all) scored.push({ ...it, score: score + (it.kind === 'module' ? 2 : 0) });
  }
  return scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'pt-BR')).slice(0, limit);
}
