// Configuração inicial com o que é CONHECIDO sobre o Álvaro (informado por ele ou verificado
// nos repositórios públicos em 23/11/2026). Todos os níveis começam como "não avaliado".
// Metas, marcos e atividades são PLANO (status planejado/pendente), não resultado.
import { SEMESTERS, CURRICULUM_VERSION, CURRICULUM_PLAN_REV, mergeSemester } from '../data/curriculum.js';
import { uid } from './store.js';

export const SEED_VERSION = '2026-11-23';
export const UNIVERSITY = 'Engenharia de Software — PUC Minas, Coração Eucarístico, noturno (2027–2030)';

const S = (name, category, contact, target, priority, extra = {}) => ({
  id: uid('ski'), name, category, contact, level: 'nao_avaliado', target, priority,
  targetDate: extra.targetDate || '2027-12-31', assessedAt: null,
  nextAction: extra.next || 'Fazer a avaliação diagnóstica correspondente.',
  resources: extra.resources || '', notes: extra.notes || '',
  evidence: extra.evidence || [], history: [], projectIds: [],
});


// ---------- Valores do plano revisado em 24/11/2026 (usados no seed e na atualização) ----------
const NEXT_DISCRETE = 'Fora da grade: Discreta I em 2027/2 (lógica, provas, indução, conjuntos) e Discreta II nas férias de jul/2028 (contagem, recorrências, grafos), com MIT 6.042J.';
const NEXT_LINALG = 'Fora da grade: Álgebra Linear I nas férias de jan–fev/2029 e II em 2029/1 (MIT 18.06), antes de Ciência de Dados e IA (6º período).';
const COMPUTABILITY_SKILL = { name: 'Computabilidade e teoria da computação', next: 'Disciplina Computabilidade (1º período, 72 h). Usa lógica e provas, mas não substitui Matemática Discreta.' };
const NEW_JAVA = { title: 'Java + Spring Boot em nível intermediário', period: '2028/2', due: '2028-12-15', description: 'Uma API Spring com testes, junto com Projeto de Software (4º). Fora do 3º período, que é o mais pesado.' };
const NEW_IC = { title: 'Candidatura a iniciação científica na PUC Minas', period: '2028/1 ou 2028/2', due: '2028-08-31', description: 'Prepare em Introdução à Pesquisa em Informática (2º). Candidate-se no 3º só se a carga de 708 h permitir; senão, no 4º.' };
const NEW_MATHML = { phase: 4, title: 'Álgebra Linear I e II (fora da grade da PUC)', period: 'jan–fev/2029 + 2029/1', due: '2029-07-15', description: 'MIT 18.06 com exercícios: parte I nas férias, parte II com Estatística e Fundamentos de IA. Chegar ao 6º período (Ciência de Dados e IA) com a base de ML.' };
const NEW_MILESTONES = {
  matrix: { title: 'Confirmar a matriz curricular vinculada à matrícula de 2027', period: '2027/1', due: '2027-03-15', description: 'Comparar a matriz consultada na página oficial em 21/11/2026 com a documentação da matrícula de 2027 e confirmar em Plano de Evolução › Semestres.' },
  p3: { title: '3º período (708 h) concluído sem sobrecarga', period: '2028/1', due: '2028-07-15', description: 'Aprovação em todas as disciplinas e Estruturas de Dados sólida. Estudo extra reduzido (fator 0,8), sem matemática complementar, projeto pessoal só em manutenção, TI de 216 h como projeto do semestre.' },
  discrete: { title: 'Matemática Discreta completa (fora da grade)', period: '2027/2 + jul/2028', due: '2028-08-15', description: 'Discreta I em 2027/2 e Discreta II nas férias de julho, antes de Algoritmos em Grafos.' },
};
const NEW_GOAL_P3 = { title: '2028/1 (3º período, 708 h): aprovação em todas as disciplinas sem sobrecarga', periodStart: '2028-02-01', due: '2028-07-15', metric: 'disciplinas aprovadas', target: 6 };
const NEW_TASK_MATRIX = { title: 'Confirmar a matriz curricular da matrícula de 2027 (Plano de Evolução › Semestres)', due: '2027-03-15' };

// Valores originais das versões anteriores. Um registro só é ajustado se TODOS os campos
// que vamos mudar ainda forem iguais a uma dessas versões (ou seja, você não os editou).
const OLD = {
  discrete: [
    { nextAction: 'Fazer a avaliação diagnóstica correspondente.', targetDate: '2028-06-30' },
    { nextAction: 'Não está na grade da PUC: estudar em paralelo (MIT 6.042J) a partir de 2027/2.', targetDate: '2028-06-30' },
  ],
  linalg: [
    { nextAction: 'MIT 18.06 na Fase 3.', targetDate: '2028-12-31' },
    { nextAction: 'Não está na grade da PUC: MIT 18.06 em paralelo (2028/2), antes de Ciência de Dados e IA (6º período).', targetDate: '2029-06-30' },
  ],
  java: [{ title: 'Java + Spring Boot em nível intermediário', period: '2028/1', due: '2028-06-30', description: 'Uma API Spring com testes.' }],
  ic: [{ title: 'Candidatura a iniciação científica na PUC Minas', period: '2028/1', due: '2028-03-31', description: 'Conversar com professores sobre linhas de pesquisa em IA/ES.' }],
  mathml: [
    { title: 'Matemática para ML + primeiro curso de ML', period: '2028', due: '2028-12-31', description: 'Álgebra linear, probabilidade e um curso de ML concluído com exercícios.' },
    { title: 'Álgebra linear e base de probabilidade (fora da grade da PUC)', period: '2028/2', due: '2029-02-15', description: 'MIT 18.06 com exercícios resolvidos e base de probabilidade antes de Estatística e Fundamentos de IA (5º período).' },
  ],
};
const unchanged = (rec, versions) => !!rec && versions.some((v) => Object.entries(v).every(([k, val]) => rec[k] === val));

// ---------- Identidade JARVIS (24/11/2026): textos do plano que citavam nomes antigos ----------
const JARVIS_PROJECT = {
  name: 'JARVIS',
  objective: 'Plataforma pessoal de inteligência e de desenvolvimento acadêmico, profissional e pessoal (antigo CAREER OS).',
  description: 'SPA em JavaScript puro (módulos ES), sem dependências, com persistência local, Central de Backup, busca global e testes com node:test.',
};
const OLD_JARVIS_PROJECT = { name: 'CAREER OS', objective: 'Sistema pessoal de desenvolvimento acadêmico e de carreira.', description: 'SPA em JavaScript puro (módulos ES), sem dependências, com persistência local, backup JSON e testes com node:test.' };
/** [texto antigo, texto novo]: só é trocado onde o valor continua EXATAMENTE igual ao original. */
const RENAMED_TEXTS = [
  ['Comparar a matriz consultada na página oficial em 21/11/2026 com a documentação da matrícula de 2027 e confirmar em Roadmap › Semestres.', 'Comparar a matriz consultada na página oficial em 21/11/2026 com a documentação da matrícula de 2027 e confirmar em Plano de Evolução › Semestres.'],
  ['Confirmar a matriz curricular da matrícula de 2027 (Roadmap › Semestres)', 'Confirmar a matriz curricular da matrícula de 2027 (Plano de Evolução › Semestres)'],
  ['Seguir a política de uso de IA do CAREER OS (Guia › Uso de IA).', 'Seguir a política de uso de IA do JARVIS (Guia Estratégico › Política de uso de IA).'],
  ['Incluir o CAREER OS como projeto quando você conseguir explicá-lo inteiro.', 'Incluir o JARVIS como projeto quando você conseguir explicá-lo inteiro.'],
  ['Listado no portfólio. Código ainda não analisado pelo CAREER OS.', 'Listado no portfólio. Código ainda não analisado pelo JARVIS.'],
  ['Refazer do zero, sozinho, uma API real com FastAPI + PostgreSQL + Docker + testes + CI + deploy. Sugestão: API de registro de estudos que o próprio CAREER OS poderia sincronizar no futuro.', 'Refazer do zero, sozinho, uma API real com FastAPI + PostgreSQL + Docker + testes + CI + deploy. Sugestão: API de registro de estudos que o próprio JARVIS poderia sincronizar no futuro.'],
  ['Todas as avaliações registradas e níveis atualizados no Skill Tracker.', 'Todas as avaliações registradas e níveis atualizados em Competências.'],
  ['Registradas no Career Tracker.', 'Registradas em Oportunidades Profissionais.'],
  ['Dezembro: 5 candidaturas registradas no Career Tracker', 'Dezembro: 5 candidaturas registradas em Oportunidades Profissionais'],
  ['Exportar o primeiro backup do CAREER OS', 'Exportar o primeiro backup do JARVIS (Central de Backup)'],
  ['Primeira revisão semanal no CAREER OS', 'Primeira revisão semanal no JARVIS'],
  ['Comparar com a referência provisória (página oficial, 21/11/2026) e confirmar em Roadmap › Semestres.', 'Comparar a matriz consultada na página oficial em 21/11/2026 com a documentação da matrícula de 2027 e confirmar em Plano de Evolução › Semestres.'],
];

/**
 * Atualizações do plano para quem já usa o sistema. Regras:
 * - só ACRESCENTAM registros que ainda não existem (pelo título/nome);
 * - só ALTERAM registros que continuam iguais ao valor original do plano (você não editou);
 * - nunca apagam nada; cada atualização roda uma única vez (meta.appliedUpdates).
 */
export const PLAN_UPDATES = [
  {
    id: '2026-11-24-matematica-rotina-3p',
    apply(store) {
      const now = new Date().toISOString();
      const skills = store.list('skills');
      const byName = (n) => skills.find((x) => x.name === n);
      if (!byName(COMPUTABILITY_SKILL.name)) {
        store.create('skills', { name: COMPUTABILITY_SKILL.name, category: 'ciencia_computacao', contact: 'sem_registro', level: 'nao_avaliado', target: 'em_desenvolvimento', priority: 'baixa', targetDate: '2027-07-15', assessedAt: null, nextAction: COMPUTABILITY_SKILL.next, resources: '', notes: '', evidence: [], history: [], projectIds: [] });
      }
      const d = byName('Matemática discreta');
      if (unchanged(d, OLD.discrete)) store.update('skills', d.id, { nextAction: NEXT_DISCRETE, targetDate: '2028-08-15', target: d.target === 'em_desenvolvimento' ? 'intermediario' : d.target, notes: d.notes || 'Computabilidade (1º) não substitui a discreta completa.' });
      const l = byName('Álgebra linear');
      if (unchanged(l, OLD.linalg)) store.update('skills', l.id, { nextAction: NEXT_LINALG, targetDate: '2029-07-15', target: l.target === 'em_desenvolvimento' ? 'intermediario' : l.target });

      const ms = () => store.list('milestones');
      const byTitle = (t) => ms().find((m) => m.title === t);
      const java = ms().find((m) => unchanged(m, OLD.java));
      if (java) store.update('milestones', java.id, { period: NEW_JAVA.period, due: NEW_JAVA.due, description: NEW_JAVA.description });
      const ic = ms().find((m) => unchanged(m, OLD.ic));
      if (ic) store.update('milestones', ic.id, { period: NEW_IC.period, due: NEW_IC.due, description: NEW_IC.description });
      const mathml = ms().find((m) => unchanged(m, OLD.mathml) && m.status !== 'concluido');
      if (mathml) store.update('milestones', mathml.id, { phase: NEW_MATHML.phase, title: NEW_MATHML.title, period: NEW_MATHML.period, due: NEW_MATHML.due, description: NEW_MATHML.description });
      const skillIds = (...names) => names.map((n) => store.list('skills').find((x) => x.name === n)?.id).filter(Boolean);
      const depId = (t) => byTitle(t)?.id;
      if (!byTitle(NEW_MILESTONES.matrix.title)) store.create('milestones', { ...NEW_MILESTONES.matrix, phase: 2, type: 'academico', status: 'planejado', skillIds: [], dependsOn: [] });
      if (!byTitle(NEW_MILESTONES.p3.title)) store.create('milestones', { ...NEW_MILESTONES.p3, phase: 3, type: 'academico', status: 'planejado', skillIds: skillIds('Estruturas de dados', 'SQL', 'Sistemas operacionais'), dependsOn: [depId('2º período concluído')].filter(Boolean) });
      if (!byTitle(NEW_MILESTONES.discrete.title)) store.create('milestones', { ...NEW_MILESTONES.discrete, phase: 3, type: 'academico', status: 'planejado', skillIds: skillIds('Matemática discreta'), dependsOn: [depId('1º período da PUC Minas concluído com Introdução a Algoritmos sólida') || depId('1º período da PUC Minas concluído com Introdução à Algoritmos sólida')].filter(Boolean) });

      if (!store.list('goals').some((g) => g.title === NEW_GOAL_P3.title)) store.create('goals', { ...NEW_GOAL_P3, horizon: 'semestre', area: 'academico', current: 0, status: 'ativa', skillIds: skillIds('Estruturas de dados'), notes: '' });
      if (!store.list('tasks').some((t) => t.title === NEW_TASK_MATRIX.title)) store.create('tasks', { ...NEW_TASK_MATRIX, status: 'a_fazer', area: 'academico', priority: 'media', skillId: null, projectId: null, notes: '' });
      return now;
    },
  },
];

PLAN_UPDATES.push({
  id: '2026-11-24-jarvis-identidade',
  apply(store) {
    const swap = new Map(RENAMED_TEXTS);
    const fieldsByCollection = { skills: ['nextAction'], projects: ['description', 'objective'], milestones: ['description'], goals: ['title'], tasks: ['title'] };
    for (const [collection, fields] of Object.entries(fieldsByCollection)) {
      for (const it of store.list(collection)) {
        const patch = {};
        for (const f of fields) if (swap.has(it[f])) patch[f] = swap.get(it[f]);
        if (Array.isArray(it.improvements) && it.improvements.some((x) => swap.has(x.text))) patch.improvements = it.improvements.map((x) => (swap.has(x.text) ? { ...x, text: swap.get(x.text) } : x));
        if (Object.keys(patch).length) store.update(collection, it.id, patch);
      }
    }
    const p = store.list('projects').find((x) => x.name === OLD_JARVIS_PROJECT.name && x.objective === OLD_JARVIS_PROJECT.objective);
    if (p) store.update('projects', p.id, { name: JARVIS_PROJECT.name, objective: JARVIS_PROJECT.objective, ...(p.description === OLD_JARVIS_PROJECT.description ? { description: JARVIS_PROJECT.description } : {}) });
  },
});

/** Há atualização de plano ou de grade por aplicar? (usado para criar o ponto de restauração antes) */
export function upgradeIsPending(state) {
  const done = new Set(state.meta.appliedUpdates || []);
  return state.meta.curriculumVersion !== CURRICULUM_VERSION || state.meta.curriculumPlanRev !== CURRICULUM_PLAN_REV || PLAN_UPDATES.some((u) => !done.has(u.id));
}

export function applyPlanUpdates(store) {
  const done = new Set(store.state.meta.appliedUpdates || []);
  const applied = [];
  for (const u of PLAN_UPDATES) {
    if (done.has(u.id)) continue;
    store.state.meta.appliedUpdates = [...done, u.id];
    done.add(u.id);
    u.apply(store);
    applied.push(u.id);
  }
  if (applied.length) store.saveMeta(); // grava o registro mesmo quando nada precisou mudar
  return applied;
}

export function seed(state) {
  const c = state.collections;
  const now = new Date().toISOString();
  state.meta.seededAt = now;
  state.meta.seedVersion = SEED_VERSION;
  state.meta.appliedUpdates = PLAN_UPDATES.map((u) => u.id); // a configuração inicial já inclui as atualizações
  state.meta.curriculumPlanRev = CURRICULUM_PLAN_REV;

  state.profile = {
    name: 'Álvaro Pires',
    fullName: 'Álvaro Pires de Souza',
    age: 17,
    city: 'Região de Belo Horizonte, MG',
    school: 'Ensino Médio Técnico em TI — COTEMIG (conclusão prevista: dez/2026)',
    university: UNIVERSITY,
    startDate: '2026-11-30',
    github: 'https://github.com/Alvaro3105',
    portfolio: 'https://alvaro3105.github.io/Portfolio/',
    linkedin: '',
    mission: 'Dominar fundamentos, construir sistemas reais e competir por oportunidades exigentes no Brasil e no exterior.',
    objectives: [
      'Primeira oportunidade em TI (Jovem Aprendiz ou estágio)',
      'Fundamentos sólidos de Ciência da Computação durante a graduação',
      'Stack backend profissional + especialização progressiva em IA',
      'Inglês avançado e condições de competir por vagas internacionais (Big Techs no longo prazo)',
    ],
  };

  // ---------- Competências ----------
  const skills = [
    S('Lógica de programação', 'programacao', 'dificuldade', 'intermediario', 'alta', { targetDate: '2027-06-30', next: 'Avaliação 1: 10 problemas beecrowd sem IA.' }),
    S('Python', 'programacao', 'dificuldade', 'intermediario', 'alta', { next: 'Avaliação 1 e 2 (problemas + mini-projeto CLI).', resources: 'CS50P; Tutorial oficial do Python; Think Python.' }),
    S('Linguagem C', 'programacao', 'sem_registro', 'em_desenvolvimento', 'media', { next: 'CS50x semanas 1–5.' }),
    S('Java', 'programacao', 'declarado', 'intermediario', 'media', { targetDate: '2028-06-30', next: 'Não estudar agora. Entra na Fase 2–3.' }),
    S('JavaScript', 'programacao', 'declarado', 'em_desenvolvimento', 'baixa', { next: 'Manter. Sem horas dedicadas na Fase 1.' }),
    S('HTML e CSS', 'programacao', 'declarado', 'em_desenvolvimento', 'baixa', { next: 'Manter. Evidência: portfólio pessoal.' }),
    S('C# e .NET', 'programacao', 'declarado', 'introdutorio', 'baixa', { next: 'Não aprofundar agora (decisão de foco).' }),
    S('PHP e Laravel', 'programacao', 'declarado', 'introdutorio', 'baixa', { next: 'Não aprofundar agora (decisão de foco).' }),
    S('Depuração e leitura de código', 'programacao', 'dificuldade', 'intermediario', 'alta', { next: 'Avaliação 5: explicar e alterar o ExplAIner sem ajuda.' }),

    S('Programação orientada a objetos', 'eng_software', 'declarado', 'intermediario', 'media', { targetDate: '2028-06-30' }),
    S('APIs REST', 'eng_software', 'declarado', 'intermediario', 'media', { targetDate: '2027-12-31', next: 'Avaliação 5 (ExplAIner) mostra o nível real.' }),
    S('Arquitetura de software', 'eng_software', 'dificuldade', 'em_desenvolvimento', 'media', { next: 'Escrever 3 ADRs do ExplAIner com suas palavras.' }),
    S('Testes automatizados', 'eng_software', 'sem_registro', 'em_desenvolvimento', 'media', { next: 'Escrever testes pytest no mini-projeto da Avaliação 2.', notes: 'O ExplAIner tem 189 testes passando (verificado em 23/11/2026), mas é projeto de equipe: é preciso confirmar quais você escreveu e entende.' }),
    S('Git e GitHub', 'eng_software', 'declarado', 'intermediario', 'alta', { targetDate: '2027-03-31', next: 'Avaliação 6 (branches, conflito, PR).' }),
    S('Clean Code, SOLID e padrões', 'eng_software', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2028-12-31' }),
    S('Engenharia de requisitos', 'eng_software', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2028-06-30', next: 'Coberta no 3º período da PUC.' }),
    S('CI/CD', 'eng_software', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2028-12-31', next: 'GitHub Actions no Projeto #1; Cultura e Práticas DevOps na PUC (4º período).' }),
    S('Desenvolvimento independente (sem IA gerando código)', 'eng_software', 'dificuldade', 'intermediario', 'alta', { next: 'Registrar o uso de IA em toda sessão de estudo. Meta: 70%+ do tempo técnico sem IA gerar código.' }),

    S('Estruturas de dados', 'ciencia_computacao', 'dificuldade', 'intermediario', 'alta', { targetDate: '2028-06-30', next: 'Avaliação 4 (implementar do zero).' }),
    S('Algoritmos e complexidade', 'ciencia_computacao', 'dificuldade', 'intermediario', 'alta', { targetDate: '2028-12-31' }),
    S('Linux e terminal', 'ciencia_computacao', 'declarado', 'intermediario', 'media', { next: 'Avaliação 9.' }),
    S('Redes de computadores', 'ciencia_computacao', 'declarado', 'em_desenvolvimento', 'baixa', { targetDate: '2028-12-31', next: 'Avaliação 9.', evidence: [{ date: null, text: 'Cursos Cisco NetAcad concluídos (Packet Tracer, Fundamentos do Hardware) — certificado não equivale a nível.' }] }),
    S('Arquitetura de computadores', 'ciencia_computacao', 'declarado', 'em_desenvolvimento', 'baixa', { targetDate: '2027-12-31' }),
    S(COMPUTABILITY_SKILL.name, 'ciencia_computacao', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2027-07-15', next: COMPUTABILITY_SKILL.next }),
    S('Sistemas operacionais', 'ciencia_computacao', 'sem_registro', 'em_desenvolvimento', 'media', { targetDate: '2028-07-15', next: 'Fundamentos de Sistemas Operacionais na PUC (3º período, 2028/1), com OSTEP em paralelo.' }),
    S('Concorrência', 'ciencia_computacao', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2029-06-30' }),
    S('Sistemas distribuídos', 'ciencia_computacao', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2029-12-31' }),

    S('Matemática básica e álgebra', 'matematica', 'dificuldade', 'intermediario', 'alta', { targetDate: '2027-02-15', next: 'Avaliação 7 (Khan Academy).' }),
    S('Funções', 'matematica', 'dificuldade', 'intermediario', 'alta', { targetDate: '2027-02-15', next: 'Avaliação 7.' }),
    S('Matemática discreta', 'matematica', 'sem_registro', 'intermediario', 'media', { targetDate: '2028-08-15', next: NEXT_DISCRETE, notes: 'Computabilidade (1º) não substitui a discreta completa.' }),
    S('Cálculo', 'matematica', 'sem_registro', 'em_desenvolvimento', 'media', { targetDate: '2028-06-30', next: 'Cálculo I e II na PUC (2º e 3º períodos).' }),
    S('Álgebra linear', 'matematica', 'sem_registro', 'intermediario', 'media', { targetDate: '2029-07-15', next: NEXT_LINALG }),
    S('Probabilidade e estatística', 'matematica', 'sem_registro', 'em_desenvolvimento', 'media', { targetDate: '2029-07-15', next: 'Estatística e Probabilidade na PUC (5º período, 2029/1).' }),

    S('SQL', 'dados', 'dificuldade', 'intermediario', 'alta', { targetDate: '2027-12-31', next: 'Avaliação 3.' }),
    S('Modelagem relacional', 'dados', 'dificuldade', 'intermediario', 'alta', { targetDate: '2027-12-31', next: 'Avaliação 3.' }),
    S('Python para dados (pandas)', 'dados', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2028-12-31' }),

    S('Fundamentos de IA', 'ia', 'declarado', 'em_desenvolvimento', 'baixa', { targetDate: '2029-07-15', next: 'Fundamentos de IA na PUC (5º período, 2029/1); CS50 AI em paralelo.', evidence: [{ date: null, text: 'Curso "Introdução à IA Moderna" (Cisco NetAcad) concluído.' }] }),
    S('Machine Learning', 'ia', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2029-12-31', next: 'Ciência de Dados e IA na PUC (6º período, 2029/2).' }),
    S('Deep Learning', 'ia', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2029-12-31' }),
    S('LLMs, RAG e agentes', 'ia', 'declarado', 'em_desenvolvimento', 'baixa', { targetDate: '2029-12-31', next: 'Só depois de ML básico. Hoje: entender como o ExplAIner chama o Gemini.', evidence: [{ date: null, text: 'ExplAIner (equipe) gera questões com a API do Google Gemini, com validação e fallback.' }] }),
    S('IA como ferramenta de produtividade', 'ia', 'dificuldade', 'intermediario', 'alta', { next: 'Seguir a política de uso de IA do JARVIS (Guia Estratégico › Política de uso de IA).' }),

    S('Docker e deploy', 'cloud', 'sem_registro', 'em_desenvolvimento', 'media', { targetDate: '2027-12-31', evidence: [{ date: null, text: 'ExplAIner tem render.yaml e deploy citado no README (contribuição pessoal não verificada).' }] }),
    S('Cloud computing', 'cloud', 'sem_registro', 'em_desenvolvimento', 'baixa', { targetDate: '2029-06-30' }),

    S('Segurança de aplicações web', 'seguranca', 'declarado', 'em_desenvolvimento', 'media', { targetDate: '2029-12-31', next: 'Ler OWASP Top 10 e mapear o que o ExplAIner já faz; Segurança em Desenvolvimento de Software na PUC (6º).' }),
    S('Fundamentos de cibersegurança', 'seguranca', 'declarado', 'em_desenvolvimento', 'baixa', { targetDate: '2028-12-31', evidence: [{ date: null, text: 'Curso "Introdução à Cibersegurança" (Cisco NetAcad).' }] }),

    S('Inglês — reading técnico', 'ingles', null, 'avancado', 'alta', { targetDate: '2029-12-31', next: 'EF SET (Avaliação 8).' }),
    S('Inglês — listening', 'ingles', null, 'avancado', 'alta', { targetDate: '2029-12-31', next: 'EF SET (Avaliação 8).' }),
    S('Inglês — speaking', 'ingles', null, 'intermediario', 'alta', { targetDate: '2028-12-31', next: 'Gravação de 2 minutos (Avaliação 8).' }),
    S('Inglês — writing', 'ingles', null, 'intermediario', 'media', { targetDate: '2028-12-31', next: 'Texto de 150 palavras (Avaliação 8).' }),

    S('Comunicação técnica escrita', 'comunicacao', 'declarado', 'intermediario', 'media', { targetDate: '2028-06-30', evidence: [{ date: null, text: 'READMEs do ExplAIner e do Portfólio (autoria individual a confirmar).' }] }),
    S('Apresentações e oratória', 'comunicacao', 'declarado', 'intermediario', 'media', { targetDate: '2028-06-30', next: 'Avaliação 10.', evidence: [{ date: null, text: 'Apresentação final do ExplAIner (docs/apresentacao).' }] }),
    S('Ensinar e explicar conceitos', 'comunicacao', 'declarado', 'intermediario', 'baixa', { targetDate: '2028-12-31', evidence: [{ date: null, text: 'Voluntariado no Code Club e World Creativity Day.' }] }),
    S('Entrevistas técnicas', 'comunicacao', 'sem_registro', 'intermediario', 'media', { targetDate: '2029-06-30', next: 'Começa na Fase 2 com problemas explicados em voz alta.' }),

    S('Gestão de tempo e organização', 'lideranca', null, 'intermediario', 'alta', { targetDate: '2027-06-30', next: 'Medir: revisões semanais feitas e aderência aos hábitos.' }),
    S('Trabalho em equipe', 'lideranca', 'declarado', 'intermediario', 'media', { evidence: [{ date: null, text: 'ExplAIner: equipe de 6 pessoas.' }] }),
    S('Aprender sozinho', 'lideranca', null, 'intermediario', 'alta', { targetDate: '2027-06-30', next: 'Curso Learning How to Learn + registro de sessões.' }),
    S('Liderança', 'lideranca', null, 'em_desenvolvimento', 'baixa', { targetDate: '2029-12-31' }),
    S('Networking', 'lideranca', 'declarado', 'intermediario', 'media', { targetDate: '2028-12-31', evidence: [{ date: null, text: 'Participação em Google I/O Extended BH, Minas Summit e DevFest BH 2026.' }] }),
  ];
  c.skills.push(...skills);
  const sk = (name) => skills.find((s) => s.name === name)?.id;
  const sks = (...names) => names.map(sk).filter(Boolean);

  // ---------- Avaliações diagnósticas (Fase 1, semana 1–2) ----------
  const A = (title, skillNames, duration, protocol, rubric) => ({ id: uid('ass'), title, skillIds: sks(...skillNames), duration, protocol, rubric, status: 'pendente', date: null, resultNotes: '', createdAt: now, updatedAt: now });
  c.assessments.push(
    A('1. Lógica e Python sem IA', ['Lógica de programação', 'Python'], '120 min',
      'Escolha 10 problemas da categoria Iniciante do beecrowd que você nunca resolveu. Resolva em Python, sem IA, sem ver soluções. Pode consultar só a documentação oficial do Python. Registre quantos foram aceitos e onde travou.',
      '0–3 aceitos: Conhecimento introdutório · 4–7: Em desenvolvimento · 8–10 com código legível: Intermediário (no nível iniciante). Avançado não se mede aqui.'),
    A('2. Mini-projeto CLI em Python', ['Python', 'Testes automatizados', 'Desenvolvimento independente (sem IA gerando código)'], '3 h',
      'Construa do zero um gerenciador de tarefas de linha de comando: adicionar, listar, concluir e remover tarefas, salvando em JSON. Escreva pelo menos 5 testes com pytest. Sem IA. Commit a cada etapa.',
      'Não terminou o CRUD: Introdutório · CRUD funcional sem testes: Em desenvolvimento · CRUD + testes + código organizado em funções/módulos: Intermediário.'),
    A('3. SQL e modelagem', ['SQL', 'Modelagem relacional'], '90 min',
      'Modele uma biblioteca (livros, autores, membros, empréstimos) com chaves e restrições. Crie no PostgreSQL ou SQLite, insira dados e escreva 10 consultas: 3 com JOIN, 2 com GROUP BY/HAVING, 2 com subconsulta, 1 com LEFT JOIN para achar "sem empréstimo", 2 de atualização. Sem IA.',
      'Até 4 consultas corretas: Introdutório · 5–7: Em desenvolvimento · 8–10 e modelo normalizado: Intermediário.'),
    A('4. Estruturas de dados do zero', ['Estruturas de dados', 'Algoritmos e complexidade'], '2 h',
      'Em Python, sem usar list como atalho para a estrutura: implemente pilha, fila, lista ligada e busca binária. Para cada uma, escreva a complexidade das operações e um teste.',
      'Até 1 estrutura correta: Não estudado/Introdutório · 2–3: Em desenvolvimento · 4 com complexidades corretas: Intermediário.'),
    A('5. Explicar e alterar o ExplAIner', ['Depuração e leitura de código', 'APIs REST', 'Arquitetura de software'], '90 min',
      'Sem anotações e sem IA: grave 10 minutos explicando o caminho de uma resposta de questão (frontend → controller → service → repository → banco) e por que o servidor confere o gabarito. Depois, altere uma regra (ex.: valor do bônus de fase perfeita), ajuste o teste e rode a suíte.',
      'Não consegue explicar as camadas: Introdutório · explica, mas não altera sozinho: Em desenvolvimento · explica, altera e mantém os testes verdes: Intermediário.'),
    A('6. Git na prática', ['Git e GitHub'], '45 min',
      'Crie um repositório, faça 3 commits com mensagens claras, crie uma branch, provoque e resolva um conflito de merge, abra um pull request e desfaça um commit com git revert.',
      'Só add/commit/push: Introdutório · branches e merge: Em desenvolvimento · conflito, revert e PR sem consulta: Intermediário.'),
    A('7. Diagnóstico de matemática', ['Matemática básica e álgebra', 'Funções'], '90 min',
      'Faça os desafios de curso da Khan Academy de Álgebra e de Funções (ou equivalentes do ensino médio). Registre o percentual por tópico: frações, potências, equações, inequações, funções afim/quadrática/exponencial/logarítmica.',
      'Abaixo de 50%: Introdutório · 50–79%: Em desenvolvimento · 80%+: Intermediário.'),
    A('8. Inglês: EF SET + produção', ['Inglês — reading técnico', 'Inglês — listening', 'Inglês — speaking', 'Inglês — writing'], '80 min',
      'Faça o EF SET de 50 minutos (reading + listening). Depois grave 2 minutos falando sobre um projeto seu e escreva 150 palavras sobre o mesmo tema. Registre o CEFR do EF SET em Inglês › Avaliações.',
      'Use o CEFR do EF SET para reading/listening. Speaking e writing: autoavaliação com a grade CEFR do Council of Europe e, se possível, feedback de um professor.'),
    A('9. Linux, redes e terminal', ['Linux e terminal', 'Redes de computadores'], '60 min',
      'Sem consulta: navegue e crie arquivos pelo terminal, mude permissões, encontre um processo e encerre, use grep e pipes. Depois escreva o que acontece entre digitar uma URL e a página aparecer (DNS, TCP, TLS, HTTP).',
      'Comandos básicos com consulta: Introdutório · sem consulta: Em desenvolvimento · explica o fluxo da URL com precisão: Intermediário (redes).'),
    A('10. Apresentação técnica de 5 minutos', ['Apresentações e oratória', 'Comunicação técnica escrita'], '30 min',
      'Apresente um projeto seu para alguém (colega, professor, família) em 5 minutos. Peça notas de 1 a 5 em: clareza do problema, estrutura, domínio técnico, tempo, linguagem corporal.',
      'Média < 3: Introdutório · 3–3,9: Em desenvolvimento · 4+: Intermediário.'),
  );

  // ---------- Projetos (existentes, conforme portfólio e repositórios) ----------
  const P = (data) => ({ id: uid('pro'), tasks: [], improvements: [], skillIds: [], tech: [], createdAt: now, updatedAt: now, ...data });
  const explainer = P({
    name: 'ExplAIner', status: 'em_andamento',
    objective: 'Plataforma de estudos gamificada para o Ensino Médio: a IA gera questões de múltipla escolha por tema, com correção explicada, fases, ranking e sequência de estudo.',
    description: 'Projeto de equipe (6 pessoas). Backend Flask em camadas (controller → service → repository → model), SQLAlchemy, SQLite/PostgreSQL/MySQL, geração com Google Gemini e fallback OpenAI/banco local, limites de uso, cabeçalhos de segurança, 189 testes pytest passando (verificado em 23/11/2026).',
    tech: ['Python', 'Flask', 'SQLAlchemy', 'SQLite', 'JavaScript', 'Gemini API', 'pytest', 'Playwright'],
    team: 'Equipe de 6', myRole: 'Integrante (papel exato a registrar)',
    repoUrl: 'https://github.com/Alvaro3105/Explainer',
    skillIds: sks('Python', 'APIs REST', 'Arquitetura de software', 'Testes automatizados', 'LLMs, RAG e agentes', 'Trabalho em equipe'),
    improvements: [
      { id: uid('imp'), text: 'Registrar no README sua contribuição individual (o que você fez de fato).', done: false },
      { id: uid('imp'), text: 'Seção do README em inglês e diagrama de arquitetura atualizado.', done: false },
      { id: uid('imp'), text: 'CI no GitHub Actions rodando pytest a cada push (hoje não há workflow).', done: false },
      { id: uid('imp'), text: 'Dividir frontend/estudar.js (2.667 linhas) em módulos.', done: false },
      { id: uid('imp'), text: 'Unificar o CRUD legado (um service por operação) com a camada de aprendizado.', done: false },
      { id: uid('imp'), text: 'Validar PostgreSQL de ponta a ponta nos testes (README admite que só SQLite é testado).', done: false },
      { id: uid('imp'), text: 'Escrever 3 ADRs: escolha do Flask, fallback de provedores de IA, limite de geração no banco.', done: false },
    ],
  });
  const portfolio = P({
    name: 'Portfólio pessoal', status: 'concluido',
    objective: 'Apresentar formação, projetos, eventos e certificados para recrutadores.',
    description: 'Site estático bilíngue (PT/EN) com foco em acessibilidade, publicado no GitHub Pages.',
    tech: ['HTML', 'CSS', 'JavaScript', 'GitHub Pages'], team: 'Individual', myRole: 'Autor',
    repoUrl: 'https://github.com/Alvaro3105/Portfolio', demoUrl: 'https://alvaro3105.github.io/Portfolio/',
    skillIds: sks('HTML e CSS', 'JavaScript', 'Comunicação técnica escrita'),
    improvements: [
      { id: uid('imp'), text: 'Reduzir a lista a 3 projetos fortes e explicar o problema, decisões e resultado de cada um.', done: false },
      { id: uid('imp'), text: 'Incluir o JARVIS como projeto quando você conseguir explicá-lo inteiro.', done: false },
    ],
  });
  const academic = [
    ['Helpdesk API', 'API REST para usuários e chamados, arquitetura em camadas, filtros, estatísticas e testes.', ['Python', 'Flask', 'SQLAlchemy', 'unittest'], 'https://github.com/Alvaro3105/Helpdesk'],
    ['Projeto CRUD Varejo', 'Aplicação desktop C#/Windows Forms para clientes e fornecedores.', ['C#', 'Windows Forms'], 'https://github.com/Alvaro3105/projeto-final-crud-varejo'],
    ['API REST de Questões', 'API Laravel com CRUD, migrations e MySQL.', ['PHP', 'Laravel', 'MySQL'], 'https://github.com/Alvaro3105/atividade_integrada'],
    ['CRUD de Veículos com PHP & PDO', 'Aplicação web PHP/PDO com consultas parametrizadas.', ['PHP', 'PDO', 'MySQL'], 'https://github.com/Alvaro3105/CRUD-em-PHP-PDO'],
    ['Prova de Python — MVC e Repository', 'Refatoração pós-prova de API Flask com testes de regressão.', ['Python', 'Flask', 'pytest'], 'https://github.com/Alvaro3105/Prova-de-python'],
    ['Prova de TPA — API de Pedidos', 'Revisão pós-prova de API Laravel com testes PHPUnit.', ['PHP', 'Laravel', 'PHPUnit'], 'https://github.com/Alvaro3105/Prova-final-de-TPA-2etapa'],
  ].map(([name, objective, tech, repoUrl]) => P({ name, status: 'concluido', objective, tech, repoUrl, team: 'Projeto acadêmico (COTEMIG)', description: 'Listado no portfólio. Código ainda não analisado pelo JARVIS.' }));
  const careeros = P({
    name: JARVIS_PROJECT.name, status: 'em_andamento',
    objective: JARVIS_PROJECT.objective,
    description: JARVIS_PROJECT.description,
    tech: ['JavaScript', 'HTML', 'CSS', 'node:test'], team: 'Individual (gerado com apoio de IA)',
    skillIds: sks('JavaScript', 'Arquitetura de software'),
    improvements: [
      { id: uid('imp'), text: 'Ler o código módulo por módulo e registrar dúvidas: você precisa conseguir explicar o que usa.', done: false },
      { id: uid('imp'), text: 'Implementar sozinho uma melhoria pequena por mês (ex.: novo relatório).', done: false },
    ],
  });
  const ideas = [
    ['Projeto #1 — API backend de portfólio (Fase 2)', 'Refazer do zero, sozinho, uma API real com FastAPI + PostgreSQL + Docker + testes + CI + deploy. Sugestão: API de registro de estudos que o próprio JARVIS poderia sincronizar no futuro.', ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'pytest', 'GitHub Actions']],
    ['Projeto #2 — Sistema com fila, cache e observabilidade (Fase 3)', 'Evoluir o Projeto #1 ou criar um sistema com processamento assíncrono (fila), cache Redis, métricas e testes de carga.', ['Java ou Python', 'Redis', 'RabbitMQ', 'OpenTelemetry']],
    ['Projeto #3 — IA aplicada com avaliação (Fase 4)', 'Sistema de RAG ou agente com conjunto de avaliação próprio, métricas de qualidade, custo e latência, e relatório honesto de limitações.', ['Python', 'PyTorch', 'Embeddings', 'Avaliação de LLM']],
  ].map(([name, objective, tech]) => P({ name, status: 'ideia', objective, tech, description: 'Sugestão do plano. Três projetos excelentes valem mais que dez superficiais.' }));
  c.projects.push(explainer, portfolio, ...academic, careeros, ...ideas);

  // ---------- Experiências e comunidade (portfólio + relato) ----------
  const E = (org, role, type, start, description, skillNames) => ({ id: uid('exp'), org, role, type, start, end: start, description, skillIds: sks(...skillNames), createdAt: now, updatedAt: now });
  c.experiences.push(
    E('GDG Belo Horizonte', 'Participante — Google I/O Extended BH', 'evento', '2026-06-13', 'Evento da comunidade Google Developer Group BH.', ['Networking']),
    E('Minas Summit', 'Participante', 'evento', '2026-06-17', 'Palestras sobre IA e tecnologia (17 e 18 de junho de 2026).', ['Networking']),
    E('DevFest Belo Horizonte 2026', 'Participante', 'evento', null, 'Aumentou o interesse por agentes de IA, engenharia de software e segurança. Data a registrar.', ['Networking']),
    E('Code Club e World Creativity Day', 'Voluntário', 'voluntariado', null, 'Ações voluntárias de tecnologia, educação e criatividade. Datas a registrar.', ['Ensinar e explicar conceitos']),
    E('COTEMIG', 'Integrante da equipe do ExplAIner', 'projeto_academico', null, 'Projeto de equipe de 6 pessoas. Registre aqui seu papel e o que você entregou.', ['Trabalho em equipe']),
  );

  // ---------- Cursos já concluídos (portfólio) ----------
  const done = (title, provider, skillNames) => ({ id: uid('stu'), title, type: 'curso', status: 'concluido', provider, url: '', hoursEstimated: null, cost: 'Gratuito', skillIds: sks(...skillNames), completedAt: null, notes: 'Certificado listado no portfólio. Data de conclusão a registrar.', createdAt: now, updatedAt: now });
  c.studyItems.push(
    done('Introdução à Cibersegurança', 'Cisco Networking Academy', ['Fundamentos de cibersegurança']),
    done('Introdução à IA Moderna', 'Cisco Networking Academy', ['Fundamentos de IA']),
    done('Fundamentos do Hardware do Computador', 'Cisco Networking Academy', ['Arquitetura de computadores']),
    done('Começando com Cisco Packet Tracer', 'Cisco Networking Academy', ['Redes de computadores']),
    done('Conscientização Digital', 'Cisco Networking Academy', []),
    done('Using Computer and Mobile Devices', 'Cisco Networking Academy', []),
    done('Crie um Site Simples usando HTML, CSS e JavaScript', 'Fundação Bradesco', ['HTML e CSS', 'JavaScript']),
  );
  // Plano de estudos da Fase 1
  const plan = (title, provider, url, type, skillNames, hours, due, cost, notes = '') => ({ id: uid('stu'), title, type, status: 'planejado', provider, url, hoursEstimated: hours, cost, startDate: '2026-11-30', dueDate: due, skillIds: sks(...skillNames), notes, createdAt: now, updatedAt: now });
  c.studyItems.push(
    plan('CS50x — semanas 0 a 5', 'Harvard', 'https://cs50.harvard.edu/x/', 'curso', ['Lógica de programação', 'Linguagem C', 'Algoritmos e complexidade', 'Estruturas de dados'], 60, '2027-01-31', 'Gratuito · certificado gratuito', 'Problem sets sem IA (regra do próprio curso, exceto o CS50 duck).'),
    plan('Problemas beecrowd — categoria Iniciante', 'beecrowd', 'https://judge.beecrowd.com/', 'exercicios', ['Lógica de programação', 'Python'], 30, '2027-02-10', 'Gratuito', 'Meta: 60 aceitos sem IA até 10/02/2027.'),
    plan('Khan Academy — Álgebra e Funções', 'Khan Academy', 'https://pt.khanacademy.org/math', 'curso', ['Matemática básica e álgebra', 'Funções'], 25, '2027-02-10', 'Gratuito'),
    plan('SQLBolt — lições 1 a 18', 'SQLBolt', 'https://sqlbolt.com/', 'exercicios', ['SQL'], 6, '2026-12-27', 'Gratuito'),
    plan('Pro Git — capítulos 1 a 3', 'Scott Chacon e Ben Straub', 'https://git-scm.com/book/pt-br/v2', 'livro', ['Git e GitHub'], 6, '2026-12-20', 'Gratuito'),
    plan('Learning How to Learn', 'Coursera', 'https://www.coursera.org/learn/learning-how-to-learn', 'curso', ['Aprender sozinho'], 12, '2027-01-15', 'Gratuito (ouvinte) · certificado pago'),
    plan('BBC Learning English — rotina diária', 'BBC', 'https://www.bbc.co.uk/learningenglish', 'videoaula', ['Inglês — listening', 'Inglês — speaking'], 20, '2027-02-15', 'Gratuito'),
  );

  // ---------- Roadmap: marcos com dependências ----------
  const M = (key, phase, type, title, period, due, description, skillNames = [], deps = []) => ({ key, id: uid('mil'), phase, type, title, period, due, description, status: 'planejado', skillIds: sks(...skillNames), deps });
  const ms = [
    M('diag', 1, 'tecnico', 'Concluir as 10 avaliações diagnósticas', 'dez/2026', '2026-12-13', 'Todas as avaliações registradas e níveis atualizados em Competências.'),
    M('eng0', 1, 'ingles', 'Medir o inglês (EF SET) e fixar rotina diária de 20 min', 'dez/2026', '2026-12-07', 'CEFR registrado; 20 min/dia em pelo menos 5 dias por semana.'),
    M('cotemig', 1, 'academico', 'Concluir o Ensino Médio Técnico em TI (COTEMIG)', 'dez/2026', '2026-12-31', 'Formatura.'),
    M('cs50a', 1, 'tecnico', 'CS50x semanas 0–5 com problem sets próprios', 'jan/2027', '2027-01-31', 'Problem sets submetidos e aceitos, sem IA.', ['Linguagem C', 'Lógica de programação'], ['diag']),
    M('logic60', 1, 'tecnico', '60 problemas de lógica aceitos sem IA', 'fev/2027', '2027-02-10', 'Contagem no beecrowd.', ['Lógica de programação', 'Python'], ['diag']),
    M('math0', 1, 'academico', 'Revisão de matemática para Cálculo I', 'fev/2027', '2027-02-10', '80%+ nos desafios de Álgebra e Funções.', ['Matemática básica e álgebra', 'Funções'], ['diag']),
    M('explainer', 1, 'projeto', 'ExplAIner: explicar 100% do que você assina + README em inglês + ADRs', 'jan/2027', '2027-01-31', 'Passar na Avaliação 5 em nível Intermediário.', ['Depuração e leitura de código', 'Arquitetura de software'], ['diag']),
    M('cv', 1, 'profissional', 'Currículo e LinkedIn revisados + 10 candidaturas (Jovem Aprendiz/estágio)', 'jan/2027', '2027-01-31', 'Registradas em Oportunidades Profissionais.'),
    M('p1', 2, 'academico', '1º período da PUC Minas concluído com Introdução a Algoritmos sólida', '2027/1', '2027-07-15', 'Aprovação + conseguir resolver as listas sem IA.', ['Lógica de programação'], ['logic60', 'cs50a']),
    M('cs50b', 2, 'tecnico', 'CS50x completo com projeto final', '2027/1', '2027-06-30', 'Certificado gratuito do CS50.', [], ['cs50a']),
    M('job1', 2, 'profissional', 'Primeira experiência profissional em TI (meta, não garantia)', '2027', '2027-12-31', 'Jovem Aprendiz, estágio ou equivalente.', [], ['cv']),
    M('proj1', 2, 'projeto', 'Projeto #1: API backend completa, feita sozinho', '2027/2', '2027-11-30', 'FastAPI + PostgreSQL + Docker + testes + CI + deploy + README em inglês.', ['APIs REST', 'SQL', 'Docker e deploy', 'Testes automatizados'], ['explainer', 'cs50b']),
    M('dsa150', 2, 'tecnico', '150 problemas aceitos sem IA (beecrowd/LeetCode fácil)', '2027', '2027-12-15', 'Inclui explicar cada solução em voz alta.', ['Algoritmos e complexidade'], ['logic60']),
    M('engB2', 2, 'ingles', 'Inglês B2 medido', '2027', '2027-12-15', 'EF SET ou teste equivalente.', ['Inglês — listening', 'Inglês — reading técnico'], ['eng0']),
    M('enem', 2, 'academico', 'Decisão sobre ENEM 2027 / UFMG com critérios escritos', '2027', '2027-04-30', 'Ver Guia › Faculdade. Confirmar datas no edital do INEP.'),
    M('matrix', 2, 'academico', NEW_MILESTONES.matrix.title, NEW_MILESTONES.matrix.period, NEW_MILESTONES.matrix.due, NEW_MILESTONES.matrix.description),
    M('hack1', 2, 'profissional', '1 hackathon + 2 eventos de comunidade no ano', '2027', '2027-12-31', 'Registrados em Experiências.'),
    M('p2', 2, 'academico', '2º período concluído', '2027/2', '2027-12-20', '', [], ['p1']),
    M('intern', 3, 'profissional', 'Estágio em desenvolvimento ou dados', '2028', '2028-12-31', 'Meta da Fase 3.', [], ['job1', 'proj1']),
    M('dsa250', 3, 'tecnico', 'Estruturas de dados e grafos: 250 problemas por padrão', '2028', '2028-12-15', 'Padrões NeetCode + disciplinas de ED e Grafos.', ['Estruturas de dados', 'Algoritmos e complexidade'], ['dsa150']),
    M('proj2', 3, 'projeto', 'Projeto #2: fila, cache e observabilidade', '2028/2', '2028-11-30', '', ['Sistemas distribuídos'], ['proj1']),
    M('java', 3, 'tecnico', NEW_JAVA.title, NEW_JAVA.period, NEW_JAVA.due, NEW_JAVA.description, ['Java'], ['p2']),
    M('oss', 3, 'profissional', 'Primeira contribuição open source aceita', '2028', '2028-10-31', 'PR aceito em projeto que outras pessoas usam.', ['Git e GitHub'], ['proj1']),
    M('p3', 3, 'academico', NEW_MILESTONES.p3.title, NEW_MILESTONES.p3.period, NEW_MILESTONES.p3.due, NEW_MILESTONES.p3.description, ['Estruturas de dados', 'SQL', 'Sistemas operacionais'], ['p2']),
    M('discrete', 3, 'academico', NEW_MILESTONES.discrete.title, NEW_MILESTONES.discrete.period, NEW_MILESTONES.discrete.due, NEW_MILESTONES.discrete.description, ['Matemática discreta'], ['p1']),
    M('mathml', NEW_MATHML.phase, 'tecnico', NEW_MATHML.title, NEW_MATHML.period, NEW_MATHML.due, NEW_MATHML.description, ['Álgebra linear', 'Probabilidade e estatística'], ['p2']),
    M('ic', 3, 'pesquisa', NEW_IC.title, NEW_IC.period, NEW_IC.due, NEW_IC.description, [], ['p2']),
    M('bigintern', 4, 'profissional', 'Candidaturas a estágios de grande porte (inclui Google BH)', '2029', '2029-08-31', 'Ver requisitos na página de cada empresa.', ['Entrevistas técnicas', 'Inglês — speaking'], ['dsa250', 'intern']),
    M('proj3', 4, 'projeto', 'Projeto #3: IA aplicada com avaliação medida', '2029/2', '2029-10-31', '', ['LLMs, RAG e agentes', 'Machine Learning'], ['mathml', 'proj2']),
    M('sysdesign', 4, 'tecnico', 'System design básico', '2029/1', '2029-06-30', '', ['Sistemas distribuídos'], ['proj2']),
    M('exchange', 4, 'academico', 'Avaliar e, se viável, candidatar-se a mobilidade internacional', '2029/1', '2029-04-30', 'Depende de edital da PUC e de recursos.', [], ['engB2']),
    M('engC1', 4, 'ingles', 'Inglês C1', '2029', '2029-12-15', '', ['Inglês — speaking', 'Inglês — writing'], ['engB2']),
    M('tcc', 5, 'academico', 'TCC com resultado técnico ou de pesquisa', '2030/2', '2030-12-15', '', [], ['proj3']),
    M('newgrad', 5, 'profissional', 'Oferta de posição júnior / new grad', '2030', '2030-12-31', '', ['Entrevistas técnicas'], ['bigintern']),
    M('grad', 5, 'academico', 'Graduação concluída', '2030/2', '2030-12-20', '', [], ['tcc']),
    M('masters', 6, 'pesquisa', 'Decidir: mestrado (Brasil/exterior) ou indústria', '2031', '2031-06-30', 'Critérios: gosto por pesquisa, finanças, oportunidades.', [], ['grad']),
    M('global', 6, 'profissional', 'Posição em empresa internacional / Big Tech', '2031–2034', null, 'Horizonte de longo prazo. Não é garantia.', [], ['newgrad', 'engC1']),
  ];
  const byKey = Object.fromEntries(ms.map((m) => [m.key, m.id]));
  for (const m of ms) {
    c.milestones.push({ id: m.id, phase: m.phase, type: m.type, title: m.title, period: m.period, due: m.due, description: m.description, status: m.status, skillIds: m.skillIds, dependsOn: m.deps.map((k) => byKey[k]).filter(Boolean), createdAt: now, updatedAt: now });
  }

  // ---------- Semestres (a partir da grade pesquisada) ----------
  for (const s of SEMESTERS) {
    c.semesters.push({ id: uid('sem'), number: s.number, status: 'futuro', ...mergeSemester(null, s, () => uid('dis')), createdAt: now, updatedAt: now });
  }
  state.meta.curriculumVersion = CURRICULUM_VERSION;

  // ---------- Metas dos primeiros 30 dias e do ano ----------
  const G = (title, horizon, area, periodStart, due, metric, target, skillNames = []) => ({ id: uid('goa'), title, horizon, area, periodStart, due, metric, target, current: 0, status: 'ativa', skillIds: sks(...skillNames), notes: '', createdAt: now, updatedAt: now });
  c.goals.push(
    G('Semana 1: fazer as avaliações 1, 3, 6, 7 e 8', 'semana', 'tecnico', '2026-11-30', '2026-12-06', 'avaliações registradas', 5),
    G('Semana 1: 4 sessões de estudo registradas com uso de IA anotado', 'semana', 'pessoal', '2026-11-30', '2026-12-06', 'sessões', 4),
    G('Dezembro: concluir as 10 avaliações diagnósticas', 'mes', 'tecnico', '2026-11-30', '2026-12-13', 'avaliações', 10),
    G('Dezembro: 25 problemas de lógica aceitos sem IA', 'mes', 'tecnico', '2026-11-30', '2026-12-29', 'problemas aceitos', 25, ['Lógica de programação', 'Python']),
    G('Dezembro: CS50x semanas 0 a 3 com problem sets', 'mes', 'tecnico', '2026-11-30', '2026-12-29', 'semanas concluídas', 4, ['Linguagem C']),
    G('Dezembro: 4 revisões semanais e 1 revisão mensal', 'mes', 'pessoal', '2026-11-30', '2026-12-31', 'revisões', 5, ['Gestão de tempo e organização']),
    G('Dezembro: 20 dias com inglês (20 min)', 'mes', 'ingles', '2026-11-30', '2026-12-29', 'dias', 20, ['Inglês — listening']),
    G('Dezembro: 5 candidaturas registradas em Oportunidades Profissionais', 'mes', 'profissional', '2026-11-30', '2026-12-29', 'candidaturas', 5),
    G('Fase 1: 60 problemas aceitos sem IA', 'trimestre', 'tecnico', '2026-11-30', '2027-02-10', 'problemas aceitos', 60, ['Lógica de programação']),
    G('2027: primeira experiência profissional em TI', 'ano', 'profissional', '2027-01-01', '2027-12-31', 'experiências', 1),
    G('2027/1: média de 70%+ do tempo técnico sem IA gerar código', 'semestre', 'tecnico', '2027-02-15', '2027-07-15', '% do tempo sem IA', 70, ['Desenvolvimento independente (sem IA gerando código)']),
    G(NEW_GOAL_P3.title, 'semestre', 'academico', NEW_GOAL_P3.periodStart, NEW_GOAL_P3.due, NEW_GOAL_P3.metric, NEW_GOAL_P3.target, ['Estruturas de dados']),
  );

  // ---------- Atividades da primeira semana ----------
  const T = (title, due, area, priority, skillName = null) => ({ id: uid('tas'), title, status: 'a_fazer', due, area, priority, skillId: skillName ? sk(skillName) : null, projectId: null, notes: '', createdAt: now, updatedAt: now });
  c.tasks.push(
    T('Ler o Guia › Plano de 30 dias e ajustar a disponibilidade em Configurações', '2026-11-30', 'pessoal', 'alta'),
    T('Exportar o primeiro backup do JARVIS (Central de Backup)', '2026-11-30', 'pessoal', 'media'),
    T('Avaliação 8: EF SET + gravação + texto', '2026-11-30', 'ingles', 'alta', 'Inglês — listening'),
    T('Avaliação 1: 10 problemas beecrowd sem IA', '2026-12-01', 'tecnico', 'alta', 'Lógica de programação'),
    T('Avaliação 7: desafios Khan Academy (Álgebra e Funções)', '2026-12-02', 'academico', 'alta', 'Matemática básica e álgebra'),
    T('Avaliação 3: SQL e modelagem', '2026-12-03', 'tecnico', 'alta', 'SQL'),
    T('Avaliação 6: Git na prática', '2026-12-04', 'tecnico', 'media', 'Git e GitHub'),
    T('CS50x: assistir Lecture 0 e fazer o Problem Set 0 (Scratch)', '2026-12-05', 'tecnico', 'media', 'Lógica de programação'),
    T('Primeira revisão semanal no JARVIS', '2026-12-06', 'pessoal', 'alta'),
    T(NEW_TASK_MATRIX.title, NEW_TASK_MATRIX.due, 'academico', 'media'),
  );

  // ---------- Hábitos (sugestões, editáveis) ----------
  const Hb = (name, area, targetPerWeek, why) => ({ id: uid('hab'), name, area, targetPerWeek, active: true, why, checks: [], createdAt: now, updatedAt: now });
  c.habits.push(
    Hb('Programar 45 min sem IA', 'tecnico', 5, 'Mede independência. Conta só se o código foi escrito por você.'),
    Hb('Inglês 20 min', 'ingles', 5, 'Listening ou speaking com material autêntico.'),
    Hb('Atividade física 30 min', 'pessoal', 3, 'Energia e foco para estudar de forma sustentável.'),
    Hb('Dormir 8 h', 'pessoal', 5, 'Sono é parte do plano, não sobra de tempo.'),
    Hb('Ler 15 páginas', 'pessoal', 4, 'Livro técnico ou de desenvolvimento pessoal.'),
  );

  // ---------- Leituras sugeridas ----------
  c.readings.push(
    { id: uid('rea'), title: 'Engenharia de Software Moderna', author: 'Marco Tulio Valente', status: 'quero_ler', area: 'tecnico', url: 'https://engsoftmoderna.info/', notes: '', createdAt: now, updatedAt: now },
    { id: uid('rea'), title: 'Entendendo Algoritmos', author: 'Aditya Bhargava', status: 'quero_ler', area: 'tecnico', url: '', notes: '', createdAt: now, updatedAt: now },
    { id: uid('rea'), title: 'O Programador Pragmático', author: 'David Thomas e Andrew Hunt', status: 'quero_ler', area: 'tecnico', url: '', notes: '', createdAt: now, updatedAt: now },
  );

  // ---------- Empresas de interesse ----------
  const C = (name, segment, location, careersUrl, why, priority = 'media', programs = '') => ({ id: uid('com'), name, segment, location, careersUrl, why, priority, programs, notes: '', createdAt: now, updatedAt: now });
  c.companies.push(
    C('Google', 'Big Tech', 'Escritório de engenharia em Belo Horizonte', 'https://www.google.com/about/careers/applications/', 'Possibilidade concreta de estágio sem sair de BH.', 'alta', 'Software Engineering Intern (BH): ver requisitos do ciclo em Oportunidades.'),
    C('Microsoft', 'Big Tech', 'Brasil (São Paulo)', 'https://careers.microsoft.com/', 'Cloud e IA.', 'media'),
    C('Amazon', 'Big Tech', 'Brasil (São Paulo)', 'https://www.amazon.jobs/', 'Escala de sistemas distribuídos; SDE.', 'media'),
    C('Meta', 'Big Tech', 'Exterior', 'https://www.metacareers.com/', 'Produto e infraestrutura em escala.', 'baixa'),
    C('Apple', 'Big Tech', 'Exterior', 'https://www.apple.com/careers/', '—', 'baixa'),
    C('NVIDIA', 'Hardware e IA', 'Exterior', 'https://www.nvidia.com/en-us/about-nvidia/careers/', 'AI infrastructure; exige base forte em sistemas.', 'baixa'),
    C('OpenAI', 'Laboratório de IA', 'Exterior', 'https://openai.com/careers/', 'Meta de longo prazo.', 'baixa'),
    C('Anthropic', 'Laboratório de IA', 'Exterior', 'https://www.anthropic.com/careers', 'Meta de longo prazo.', 'baixa'),
    C('Databricks', 'Dados e IA', 'Exterior', 'https://www.databricks.com/company/careers', 'Dados + IA.', 'baixa'),
    C('Cloudflare', 'Rede e segurança', 'Exterior', 'https://www.cloudflare.com/careers/', 'Redes, segurança e sistemas distribuídos.', 'baixa'),
    C('Oracle', 'Software corporativo e cloud', 'Brasil e exterior', 'https://www.oracle.com/careers/', '—', 'baixa'),
    C('IBM', 'Software, consultoria e pesquisa', 'Brasil e exterior', 'https://www.ibm.com/careers', '—', 'baixa'),
    C('Empresas de tecnologia de BH (a mapear)', 'Mercado local', 'Belo Horizonte', '', 'Mapear empresas com programa de aprendiz/estágio em BH e registrar aqui, uma por linha, com link oficial.', 'alta'),
  );

  // ---------- Oportunidades (com fonte e status de verificação) ----------
  const O = (title, category, org, url, deadline, requirements, source, verified = false, status = 'monitorando') => ({ id: uid('opp'), title, category, org, url, deadline, requirements, source, verified, status, notes: '', createdAt: now, updatedAt: now });
  c.opportunities.push(
    O('Google — Software Engineering Intern (Belo Horizonte)', 'estagio', 'Google', 'https://www.google.com/about/careers/applications/', null,
      'Ciclo 2026: formatura esperada entre dez/2026 e fev/2027; 30 h/semana em modelo híbrido por 14–15 semanas; inglês exigido; estar no Brasil durante o programa. Os requisitos mudam a cada ciclo.',
      'Vaga publicada em 07/04/2026, lida via agregador AnitaB.org (jobs.anitab.org) em 23/11/2026. Confirmar no site oficial.'),
    O('Maratona de Programação (SBC)', 'competicao', 'Sociedade Brasileira de Computação', 'https://maratona.sbc.org.br/', null,
      'Equipes de 3 estudantes de graduação da mesma instituição, com técnico. Fases regional e nacional.', 'Conhecimento geral; confirmar regulamento do ano no site oficial.'),
    O('Iniciação científica — PUC Minas', 'ic', 'PUC Minas (Pró-reitoria de Pesquisa e Pós-graduação)', '', null,
      'Os livros de resumos do seminário de IC citam bolsas FAPEMIG, CNPq e do Fundo de Incentivo à Pesquisa (FIP PUC Minas). Editais e requisitos a verificar.',
      'Livro de resumos IC 2018/2024 (pucminas.br/seminarioproppg), via busca em 23/11/2026.'),
    O('ENEM 2027 / SISU — Ciência da Computação UFMG', 'academica', 'INEP / UFMG', 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem', null,
      'Inscrição pelo edital do INEP (normalmente no 1º semestre). Avaliar a decisão com os critérios do Guia antes da inscrição.', 'Datas não verificadas.'),
    O('Google Summer of Code', 'internacional', 'Google', 'https://summerofcode.withgoogle.com/', null,
      'Programa de contribuição open source remunerado. Há requisito de idade mínima (18 anos na inscrição) e regras por ano.', 'Regras de memória; confirmar no site oficial.'),
    O('GitHub Student Developer Pack', 'certificacao', 'GitHub', 'https://education.github.com/pack', null,
      'Ferramentas gratuitas para estudantes verificados (e-mail institucional ou comprovante).', 'Confirmar elegibilidade com a matrícula na PUC.'),
    O('Mobilidade internacional — PUC Minas', 'intercambio', 'PUC Minas (relações internacionais)', '', null,
      'Programas, parceiros e bolsas a mapear na área de relações internacionais da PUC Minas.', 'Não verificado. Buscar no site oficial após a matrícula.'),
    O('DevFest / eventos GDG Belo Horizonte', 'evento', 'GDG Belo Horizonte', 'https://gdg.community.dev/', null,
      'Eventos de comunidade; ótimos para networking e para palestras curtas no futuro.', 'Você participou do DevFest BH 2026.'),
    O('NASA Space Apps Challenge', 'hackathon', 'NASA e parceiros', 'https://www.spaceappschallenge.org/', null,
      'Hackathon global anual, com edições locais. Equipes multidisciplinares.', 'Conhecimento geral; confirmar edição e local.'),
  );
}

/**
 * Para quem já usa o sistema: atualiza a grade salva para a matriz oficial mais recente,
 * preservando status e notas das disciplinas. Retorna true se algo mudou.
 */
export function syncCurriculum(store) {
  const st = store.state;
  const matrixChanged = st.meta.curriculumVersion !== CURRICULUM_VERSION;
  const planChanged = st.meta.curriculumPlanRev !== CURRICULUM_PLAN_REV;
  if (!matrixChanged && !planChanged) return false;
  // Matriz igual ou confirmada por você: só os textos do plano mudam; disciplinas ficam intactas.
  const keepDisciplines = !matrixChanged || !!st.settings.curriculumConfirmedAt;
  st.meta.curriculumVersion = CURRICULUM_VERSION; // gravados junto com as atualizações abaixo
  st.meta.curriculumPlanRev = CURRICULUM_PLAN_REV;
  for (const official of SEMESTERS) {
    const saved = store.list('semesters').find((x) => Number(x.number) === official.number);
    const merged = mergeSemester(saved, official, () => uid('dis'), { keepDisciplines: keepDisciplines && !!saved });
    if (saved) store.update('semesters', saved.id, merged);
    else store.create('semesters', { number: official.number, status: 'futuro', ...merged });
  }
  if (!st.profile.university || /campus a confirmar/.test(st.profile.university)) store.setProfile({ university: UNIVERSITY });
  return true;
}
