// Enumerações, rótulos e definição de campos de cada coleção.
// Os formulários são gerados a partir daqui, e a validação também.
import { isValidISO } from './dates.js';
import { safeUrl } from './dom.js';

const opts = (pairs) => pairs.map(([value, label, tone]) => ({ value, label, tone }));

/** Escala de competência. score null = não avaliado (nunca vira 0 nos cálculos). */
export const LEVELS = [
  { value: 'nao_avaliado', label: 'Não avaliado', score: null, tone: 'na' },
  { value: 'nao_estudado', label: 'Não estudado', score: 0, tone: 'plain' },
  { value: 'introdutorio', label: 'Conhecimento introdutório', score: 1, tone: 'warn' },
  { value: 'em_desenvolvimento', label: 'Em desenvolvimento', score: 2, tone: 'info' },
  { value: 'intermediario', label: 'Intermediário', score: 3, tone: 'accent' },
  { value: 'avancado', label: 'Avançado', score: 4, tone: 'ok' },
];
export const LEVEL_DESCRIPTIONS = {
  nao_avaliado: 'Ainda não houve avaliação prática. Ter tido contato não conta como nível.',
  nao_estudado: 'Nunca estudei o assunto de forma estruturada.',
  introdutorio: 'Reconheço os conceitos e sigo exemplos, mas travo sem apoio.',
  em_desenvolvimento: 'Resolvo problemas simples sozinho, com consulta à documentação.',
  intermediario: 'Construo soluções completas sem IA gerando código, explico e testo minhas decisões.',
  avancado: 'Resolvo problemas novos e complexos, ensino o assunto e avalio trade-offs.',
};
export const levelScore = (value) => LEVELS.find((l) => l.value === value)?.score ?? null;

export const SKILL_CATEGORIES = opts([
  ['programacao', 'Programação'],
  ['eng_software', 'Engenharia de Software'],
  ['ciencia_computacao', 'Ciência da Computação'],
  ['ia', 'Inteligência Artificial'],
  ['matematica', 'Matemática'],
  ['dados', 'Dados'],
  ['cloud', 'Cloud e Infraestrutura'],
  ['seguranca', 'Segurança'],
  ['ingles', 'Inglês'],
  ['comunicacao', 'Comunicação'],
  ['lideranca', 'Liderança e autogestão'],
]);

export const CONTACT = opts([
  ['declarado', 'Contato declarado (revisar)'],
  ['dificuldade', 'Dificuldade declarada (reconstruir)'],
  ['sem_registro', 'Sem contato registrado (não estudado?)'],
]);

export const PRIORITY = opts([
  ['alta', 'Alta', 'bad'],
  ['media', 'Média', 'warn'],
  ['baixa', 'Baixa', 'plain'],
]);

export const AREAS = opts([
  ['academico', 'Acadêmico'],
  ['tecnico', 'Técnico'],
  ['profissional', 'Profissional'],
  ['ingles', 'Inglês'],
  ['pessoal', 'Pessoal'],
]);

export const STUDY_TYPES = opts([
  ['disciplina', 'Disciplina'],
  ['curso', 'Curso'],
  ['livro', 'Livro'],
  ['videoaula', 'Videoaula'],
  ['documentacao', 'Documentação'],
  ['exercicios', 'Lista de exercícios'],
  ['artigo', 'Artigo'],
]);

export const STUDY_STATUS = opts([
  ['planejado', 'Planejado', 'plain'],
  ['em_andamento', 'Em andamento', 'info'],
  ['pausado', 'Pausado', 'warn'],
  ['concluido', 'Concluído', 'ok'],
]);

export const LOG_KINDS = opts([
  ['estudo', 'Estudo de teoria'],
  ['pratica', 'Prática / exercícios'],
  ['projeto', 'Projeto'],
  ['leitura', 'Leitura'],
  ['revisao', 'Revisão espaçada'],
  ['entrevista', 'Preparação para entrevistas'],
]);

/** Uso de IA na sessão: mede independência ao longo do tempo. */
export const AI_USE = opts([
  ['nenhuma', 'Sem IA', 'ok'],
  ['explicacao', 'IA explicou conceito (após tentar)', 'info'],
  ['revisao', 'IA revisou meu código', 'warn'],
  ['geracao', 'IA gerou código', 'bad'],
]);

export const TASK_STATUS = opts([
  ['a_fazer', 'A fazer', 'plain'],
  ['fazendo', 'Fazendo', 'info'],
  ['feito', 'Feito', 'ok'],
]);

export const HORIZONS = opts([
  ['semana', 'Semanal'],
  ['mes', 'Mensal'],
  ['trimestre', 'Trimestral'],
  ['semestre', 'Semestral'],
  ['ano', 'Anual'],
]);

export const GOAL_STATUS = opts([
  ['ativa', 'Ativa', 'info'],
  ['cumprida', 'Cumprida', 'ok'],
  ['nao_cumprida', 'Não cumprida', 'bad'],
  ['cancelada', 'Cancelada', 'plain'],
]);

export const PROJECT_STATUS = opts([
  ['ideia', 'Ideia', 'plain'],
  ['planejado', 'Planejado', 'warn'],
  ['em_andamento', 'Em andamento', 'info'],
  ['concluido', 'Concluído', 'ok'],
  ['pausado', 'Pausado', 'plain'],
]);

export const APP_TYPES = opts([
  ['jovem_aprendiz', 'Jovem Aprendiz'],
  ['estagio', 'Estágio'],
  ['programa', 'Programa de formação / bolsa'],
  ['trainee', 'Trainee'],
  ['junior', 'Júnior'],
  ['pleno', 'Pleno'],
  ['freelance', 'Freelance'],
]);

export const APP_STATUS = opts([
  ['interesse', 'Interesse', 'plain'],
  ['candidatura', 'Candidatura enviada', 'info'],
  ['teste', 'Teste / desafio', 'accent'],
  ['entrevista', 'Entrevistas', 'accent'],
  ['oferta', 'Oferta', 'ok'],
  ['aprovado', 'Contratado', 'ok'],
  ['reprovado', 'Não aprovado', 'bad'],
  ['desistencia', 'Desisti', 'plain'],
]);
export const APP_FUNNEL = ['candidatura', 'teste', 'entrevista', 'oferta', 'aprovado'];

export const EXPERIENCE_TYPES = opts([
  ['aprendiz', 'Jovem Aprendiz'],
  ['estagio', 'Estágio'],
  ['emprego', 'Emprego'],
  ['projeto_academico', 'Projeto acadêmico'],
  ['voluntariado', 'Voluntariado'],
  ['monitoria', 'Monitoria'],
  ['pesquisa', 'Pesquisa / IC'],
  ['evento', 'Evento / comunidade'],
]);

export const CEFR = opts([
  ['nao_informado', 'Não informado'],
  ['A1', 'A1'], ['A2', 'A2'], ['B1', 'B1'], ['B2', 'B2'], ['C1', 'C1'], ['C2', 'C2'],
]);

export const ENGLISH_SKILLS = opts([
  ['listening', 'Listening'],
  ['speaking', 'Speaking'],
  ['reading', 'Reading'],
  ['writing', 'Writing'],
  ['vocabulario', 'Vocabulário'],
  ['gramatica', 'Gramática'],
  ['conversacao', 'Conversação'],
  ['tecnico', 'Inglês técnico (docs, papers)'],
  ['entrevista', 'Entrevista em inglês'],
]);

export const VOCAB_STATUS = opts([
  ['novo', 'Novo', 'plain'],
  ['revisando', 'Revisando', 'info'],
  ['dominado', 'Dominado', 'ok'],
]);
export const VOCAB_CONTEXT = opts([
  ['geral', 'Geral'],
  ['tecnico', 'Técnico'],
  ['entrevista', 'Entrevista / trabalho'],
  ['academico', 'Acadêmico'],
]);

export const READING_STATUS = opts([
  ['quero_ler', 'Quero ler', 'plain'],
  ['lendo', 'Lendo', 'info'],
  ['lido', 'Lido', 'ok'],
  ['abandonado', 'Abandonado', 'plain'],
]);

export const OPP_CATEGORIES = opts([
  ['bolsa', 'Bolsa'],
  ['intercambio', 'Intercâmbio / mobilidade'],
  ['ic', 'Iniciação científica'],
  ['hackathon', 'Hackathon'],
  ['competicao', 'Competição de programação'],
  ['evento', 'Evento / comunidade'],
  ['certificacao', 'Certificação'],
  ['estagio', 'Programa de estágio'],
  ['academica', 'Oportunidade acadêmica'],
  ['internacional', 'Programa internacional'],
  ['pesquisa', 'Pesquisa / pós-graduação'],
]);

export const OPP_STATUS = opts([
  ['monitorando', 'Monitorando', 'plain'],
  ['preparando', 'Preparando', 'warn'],
  ['inscrito', 'Inscrito', 'info'],
  ['aprovado', 'Aprovado', 'ok'],
  ['reprovado', 'Não aprovado', 'bad'],
  ['encerrado', 'Encerrado', 'plain'],
]);

export const MILESTONE_STATUS = opts([
  ['planejado', 'Planejado', 'plain'],
  ['em_andamento', 'Em andamento', 'info'],
  ['concluido', 'Concluído', 'ok'],
  ['adiado', 'Adiado', 'warn'],
]);

export const MILESTONE_TYPES = opts([
  ['academico', 'Acadêmico'],
  ['tecnico', 'Técnico'],
  ['projeto', 'Projeto'],
  ['profissional', 'Profissional'],
  ['ingles', 'Inglês'],
  ['pesquisa', 'Pesquisa'],
  ['pessoal', 'Pessoal'],
]);

export const PHASES = [
  { value: 1, label: 'Fase 1 — Preparação antes da faculdade', period: 'nov/2026 – fev/2027', start: '2026-11-30', end: '2027-02-15' },
  { value: 2, label: 'Fase 2 — Primeiro ano', period: '2027', start: '2027-02-15', end: '2028-01-31' },
  { value: 3, label: 'Fase 3 — Segundo ano', period: '2028', start: '2028-02-01', end: '2029-01-31' },
  { value: 4, label: 'Fase 4 — Terceiro ano', period: '2029', start: '2029-02-01', end: '2030-01-31' },
  { value: 5, label: 'Fase 5 — Quarto ano', period: '2030', start: '2030-02-01', end: '2031-01-31' },
  { value: 6, label: 'Fase 6 — Pós-graduação e carreira internacional', period: '2031+', start: '2031-02-01', end: '2099-12-31' },
];

export const ASSESSMENT_STATUS = opts([
  ['pendente', 'Pendente', 'warn'],
  ['realizada', 'Realizada', 'ok'],
]);

export const SEMESTER_STATUS = opts([
  ['futuro', 'Futuro', 'plain'],
  ['cursando', 'Cursando', 'info'],
  ['concluido', 'Concluído', 'ok'],
]);

export function optionLabel(options, value) {
  return options.find((o) => o.value === value)?.label ?? (value ? String(value) : '—');
}
export function optionTone(options, value) {
  return options.find((o) => o.value === value)?.tone ?? 'plain';
}

/*
 * Campos por coleção. type: text | textarea | select | date | number | url | tags | refs | ref | bool
 * ref/refs apontam para outra coleção (labelKey = campo exibido).
 */
export const FIELDS = {
  skills: [
    { key: 'name', label: 'Competência', type: 'text', required: true, max: 120 },
    { key: 'category', label: 'Categoria', type: 'select', options: SKILL_CATEGORIES, required: true },
    { key: 'level', label: 'Nível atual', type: 'select', options: LEVELS, required: true, hint: 'Avalie pelo que você consegue fazer sozinho, sem IA gerando código.' },
    { key: 'target', label: 'Nível desejado', type: 'select', options: LEVELS.filter((l) => l.score !== null && l.score > 0), required: true },
    { key: 'targetDate', label: 'Prazo do nível desejado', type: 'date' },
    { key: 'priority', label: 'Prioridade', type: 'select', options: PRIORITY },
    { key: 'contact', label: 'Situação declarada', type: 'select', options: CONTACT },
    { key: 'assessedAt', label: 'Data da última avaliação', type: 'date' },
    { key: 'nextAction', label: 'Próxima ação', type: 'text', max: 200, full: true },
    { key: 'resources', label: 'Materiais recomendados', type: 'textarea', full: true },
    { key: 'projectIds', label: 'Projetos relacionados', type: 'refs', ref: 'projects', labelKey: 'name', full: true },
    { key: 'notes', label: 'Observações', type: 'textarea', full: true },
  ],
  studyItems: [
    { key: 'title', label: 'Título', type: 'text', required: true, max: 160, full: true },
    { key: 'type', label: 'Tipo', type: 'select', options: STUDY_TYPES, required: true },
    { key: 'status', label: 'Status', type: 'select', options: STUDY_STATUS, required: true },
    { key: 'provider', label: 'Instituição / autor', type: 'text', max: 120 },
    { key: 'url', label: 'Link', type: 'url' },
    { key: 'hoursEstimated', label: 'Horas estimadas', type: 'number', min: 0, max: 2000 },
    { key: 'cost', label: 'Custo / certificado', type: 'text', max: 120 },
    { key: 'startDate', label: 'Início', type: 'date' },
    { key: 'dueDate', label: 'Prazo', type: 'date' },
    { key: 'completedAt', label: 'Concluído em', type: 'date' },
    { key: 'skillIds', label: 'Competências desenvolvidas', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'notes', label: 'Anotações', type: 'textarea', full: true },
  ],
  studyLogs: [
    { key: 'date', label: 'Data', type: 'date', required: true },
    { key: 'minutes', label: 'Minutos', type: 'number', required: true, min: 5, max: 720 },
    { key: 'kind', label: 'Tipo de sessão', type: 'select', options: LOG_KINDS, required: true },
    { key: 'aiUse', label: 'Uso de IA', type: 'select', options: AI_USE, required: true, hint: 'Registro honesto: é o indicador de independência.' },
    { key: 'studyItemId', label: 'Material', type: 'ref', ref: 'studyItems', labelKey: 'title' },
    { key: 'projectId', label: 'Projeto', type: 'ref', ref: 'projects', labelKey: 'name' },
    { key: 'skillIds', label: 'Competências praticadas', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'learned', label: 'O que aprendi / produzi', type: 'textarea', full: true },
    { key: 'difficulties', label: 'Dificuldades', type: 'textarea', full: true },
  ],
  tasks: [
    { key: 'title', label: 'Atividade', type: 'text', required: true, max: 200, full: true },
    { key: 'status', label: 'Status', type: 'select', options: TASK_STATUS, required: true },
    { key: 'due', label: 'Prazo', type: 'date' },
    { key: 'area', label: 'Área', type: 'select', options: AREAS },
    { key: 'priority', label: 'Prioridade', type: 'select', options: PRIORITY },
    { key: 'skillId', label: 'Competência', type: 'ref', ref: 'skills', labelKey: 'name' },
    { key: 'projectId', label: 'Projeto', type: 'ref', ref: 'projects', labelKey: 'name' },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  goals: [
    { key: 'title', label: 'Meta', type: 'text', required: true, max: 200, full: true, hint: 'Escreva um resultado verificável, não uma intenção.' },
    { key: 'horizon', label: 'Horizonte', type: 'select', options: HORIZONS, required: true },
    { key: 'area', label: 'Área', type: 'select', options: AREAS, required: true },
    { key: 'periodStart', label: 'Início', type: 'date' },
    { key: 'due', label: 'Prazo', type: 'date', required: true },
    { key: 'metric', label: 'Indicador', type: 'text', max: 120, hint: 'Ex.: problemas resolvidos sem IA' },
    { key: 'target', label: 'Alvo', type: 'number', min: 0, max: 100000 },
    { key: 'current', label: 'Atual', type: 'number', min: 0, max: 100000 },
    { key: 'status', label: 'Status', type: 'select', options: GOAL_STATUS, required: true },
    { key: 'skillIds', label: 'Competências', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  projects: [
    { key: 'name', label: 'Nome', type: 'text', required: true, max: 120 },
    { key: 'status', label: 'Status', type: 'select', options: PROJECT_STATUS, required: true },
    { key: 'objective', label: 'Objetivo', type: 'textarea', required: true, full: true, hint: 'Que problema real ele resolve e para quem?' },
    { key: 'description', label: 'Descrição', type: 'textarea', full: true },
    { key: 'tech', label: 'Tecnologias', type: 'tags', full: true, hint: 'Separe por vírgula' },
    { key: 'team', label: 'Formato', type: 'text', max: 120, hint: 'Individual ou equipe (quantas pessoas)' },
    { key: 'myRole', label: 'Meu papel', type: 'text', max: 160 },
    { key: 'repoUrl', label: 'Repositório', type: 'url' },
    { key: 'demoUrl', label: 'Demo / deploy', type: 'url' },
    { key: 'docsUrl', label: 'Documentação', type: 'url' },
    { key: 'startDate', label: 'Início', type: 'date' },
    { key: 'endDate', label: 'Conclusão', type: 'date' },
    { key: 'skillIds', label: 'Competências desenvolvidas', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'results', label: 'Resultados', type: 'textarea', full: true },
  ],
  applications: [
    { key: 'company', label: 'Empresa', type: 'text', required: true, max: 120 },
    { key: 'role', label: 'Cargo / vaga', type: 'text', required: true, max: 160 },
    { key: 'type', label: 'Tipo', type: 'select', options: APP_TYPES, required: true },
    { key: 'status', label: 'Status', type: 'select', options: APP_STATUS, required: true },
    { key: 'url', label: 'Link da vaga', type: 'url' },
    { key: 'location', label: 'Local / modelo', type: 'text', max: 120 },
    { key: 'appliedAt', label: 'Data da candidatura', type: 'date' },
    { key: 'nextDate', label: 'Próxima data importante', type: 'date' },
    { key: 'resumeVersion', label: 'Currículo enviado (versão)', type: 'text', max: 120 },
    { key: 'requiredSkills', label: 'Competências exigidas', type: 'refs', ref: 'skills', labelKey: 'name', full: true, hint: 'Ligadas ao Skill Tracker para mostrar lacunas.' },
    { key: 'requirementsText', label: 'Requisitos (texto da vaga)', type: 'textarea', full: true },
    { key: 'feedback', label: 'Feedback recebido', type: 'textarea', full: true },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  companies: [
    { key: 'name', label: 'Empresa', type: 'text', required: true, max: 120 },
    { key: 'segment', label: 'Segmento', type: 'text', max: 120 },
    { key: 'location', label: 'Presença', type: 'text', max: 160 },
    { key: 'priority', label: 'Prioridade', type: 'select', options: PRIORITY },
    { key: 'careersUrl', label: 'Página de carreiras', type: 'url', full: true },
    { key: 'why', label: 'Por que me interessa', type: 'textarea', full: true },
    { key: 'programs', label: 'Programas para estudantes', type: 'textarea', full: true },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  experiences: [
    { key: 'org', label: 'Organização', type: 'text', required: true, max: 120 },
    { key: 'role', label: 'Papel', type: 'text', required: true, max: 160 },
    { key: 'type', label: 'Tipo', type: 'select', options: EXPERIENCE_TYPES, required: true },
    { key: 'start', label: 'Início', type: 'date' },
    { key: 'end', label: 'Fim', type: 'date' },
    { key: 'skillIds', label: 'Competências', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'description', label: 'O que fiz e resultados', type: 'textarea', full: true },
  ],
  englishAssessments: [
    { key: 'date', label: 'Data', type: 'date', required: true },
    { key: 'instrument', label: 'Instrumento', type: 'text', required: true, max: 120, hint: 'Ex.: EF SET 50 min' },
    { key: 'cefr', label: 'Nível geral (CEFR)', type: 'select', options: CEFR, required: true },
    { key: 'score', label: 'Pontuação', type: 'text', max: 60 },
    { key: 'listening', label: 'Listening', type: 'select', options: CEFR },
    { key: 'reading', label: 'Reading', type: 'select', options: CEFR },
    { key: 'writing', label: 'Writing', type: 'select', options: CEFR },
    { key: 'speaking', label: 'Speaking', type: 'select', options: CEFR },
    { key: 'notes', label: 'Observações', type: 'textarea', full: true },
  ],
  vocab: [
    { key: 'term', label: 'Termo', type: 'text', required: true, max: 120 },
    { key: 'meaning', label: 'Significado', type: 'text', required: true, max: 240 },
    { key: 'context', label: 'Contexto', type: 'select', options: VOCAB_CONTEXT },
    { key: 'status', label: 'Status', type: 'select', options: VOCAB_STATUS, required: true },
    { key: 'example', label: 'Frase de exemplo (escrita por mim)', type: 'textarea', full: true },
    { key: 'source', label: 'Onde encontrei', type: 'text', max: 200, full: true },
  ],
  englishLogs: [
    { key: 'date', label: 'Data', type: 'date', required: true },
    { key: 'minutes', label: 'Minutos', type: 'number', required: true, min: 5, max: 600 },
    { key: 'skill', label: 'Habilidade', type: 'select', options: ENGLISH_SKILLS, required: true },
    { key: 'activity', label: 'Atividade', type: 'text', required: true, max: 200, full: true },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  habits: [
    { key: 'name', label: 'Hábito', type: 'text', required: true, max: 120 },
    { key: 'area', label: 'Área', type: 'select', options: AREAS },
    { key: 'targetPerWeek', label: 'Vezes por semana', type: 'number', required: true, min: 1, max: 7 },
    { key: 'active', label: 'Ativo', type: 'bool' },
    { key: 'why', label: 'Por que importa / como medir', type: 'textarea', full: true },
  ],
  readings: [
    { key: 'title', label: 'Título', type: 'text', required: true, max: 200, full: true },
    { key: 'author', label: 'Autor', type: 'text', max: 120 },
    { key: 'status', label: 'Status', type: 'select', options: READING_STATUS, required: true },
    { key: 'area', label: 'Área', type: 'select', options: AREAS },
    { key: 'url', label: 'Link', type: 'url' },
    { key: 'notes', label: 'Principais ideias (com minhas palavras)', type: 'textarea', full: true },
  ],
  reflections: [
    { key: 'date', label: 'Data', type: 'date', required: true },
    { key: 'title', label: 'Título', type: 'text', max: 160 },
    { key: 'text', label: 'Reflexão', type: 'textarea', required: true, full: true },
  ],
  opportunities: [
    { key: 'title', label: 'Oportunidade', type: 'text', required: true, max: 200, full: true },
    { key: 'category', label: 'Categoria', type: 'select', options: OPP_CATEGORIES, required: true },
    { key: 'status', label: 'Status', type: 'select', options: OPP_STATUS, required: true },
    { key: 'org', label: 'Organização', type: 'text', max: 160 },
    { key: 'url', label: 'Link oficial', type: 'url' },
    { key: 'deadline', label: 'Prazo', type: 'date' },
    { key: 'verified', label: 'Informações confirmadas na fonte oficial', type: 'bool' },
    { key: 'requirements', label: 'Requisitos', type: 'textarea', full: true },
    { key: 'source', label: 'Fonte e data de consulta', type: 'text', max: 240, full: true },
    { key: 'notes', label: 'Notas', type: 'textarea', full: true },
  ],
  milestones: [
    { key: 'title', label: 'Marco', type: 'text', required: true, max: 200, full: true },
    { key: 'phase', label: 'Fase', type: 'select', options: PHASES.map((p) => ({ value: p.value, label: p.label })), required: true, numeric: true },
    { key: 'type', label: 'Tipo', type: 'select', options: MILESTONE_TYPES, required: true },
    { key: 'period', label: 'Período', type: 'text', max: 40, hint: 'Ex.: 2027/1' },
    { key: 'due', label: 'Data-alvo', type: 'date' },
    { key: 'status', label: 'Status', type: 'select', options: MILESTONE_STATUS, required: true },
    { key: 'dependsOn', label: 'Depende de', type: 'refs', ref: 'milestones', labelKey: 'title', full: true },
    { key: 'skillIds', label: 'Competências necessárias', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'description', label: 'Descrição / critério de conclusão', type: 'textarea', full: true },
  ],
  assessments: [
    { key: 'title', label: 'Avaliação', type: 'text', required: true, max: 200, full: true },
    { key: 'status', label: 'Status', type: 'select', options: ASSESSMENT_STATUS, required: true },
    { key: 'duration', label: 'Duração', type: 'text', max: 60 },
    { key: 'date', label: 'Data de realização', type: 'date' },
    { key: 'skillIds', label: 'Competências avaliadas', type: 'refs', ref: 'skills', labelKey: 'name', full: true },
    { key: 'protocol', label: 'Protocolo', type: 'textarea', full: true },
    { key: 'rubric', label: 'Critério de nível', type: 'textarea', full: true },
    { key: 'resultNotes', label: 'Resultado observado', type: 'textarea', full: true },
  ],
};

/** Valida um registro contra a definição de campos. Retorna { campo: mensagem }. */
export function validate(collection, data) {
  const errors = {};
  for (const field of FIELDS[collection] || []) {
    const value = data[field.key];
    const empty = value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
    if (field.required && empty) {
      errors[field.key] = 'Campo obrigatório.';
      continue;
    }
    if (empty) continue;
    switch (field.type) {
      case 'text':
      case 'textarea':
        if (field.max && String(value).length > field.max) errors[field.key] = `Máximo de ${field.max} caracteres.`;
        if (String(value).length > 20000) errors[field.key] = 'Texto longo demais.';
        break;
      case 'number': {
        const n = Number(value);
        if (!Number.isFinite(n)) errors[field.key] = 'Informe um número.';
        else if (field.min !== undefined && n < field.min) errors[field.key] = `Mínimo: ${field.min}.`;
        else if (field.max !== undefined && n > field.max) errors[field.key] = `Máximo: ${field.max}.`;
        break;
      }
      case 'date':
        if (!isValidISO(String(value))) errors[field.key] = 'Data inválida.';
        break;
      case 'url':
        if (!safeUrl(value)) errors[field.key] = 'Use um link completo começando com https://';
        break;
      case 'select':
        if (!field.options.some((o) => String(o.value) === String(value))) errors[field.key] = 'Opção inválida.';
        break;
      default:
        break;
    }
  }
  if (collection === 'goals' && data.periodStart && data.due && data.periodStart > data.due) {
    errors.due = 'O prazo precisa ser depois do início.';
  }
  if (collection === 'projects' && data.startDate && data.endDate && data.startDate > data.endDate) {
    errors.endDate = 'A conclusão precisa ser depois do início.';
  }
  if (collection === 'experiences' && data.start && data.end && data.start > data.end) {
    errors.end = 'O fim precisa ser depois do início.';
  }
  return errors;
}

/** Converte valores vindos do formulário para os tipos do modelo. */
export function coerce(collection, raw) {
  const out = { ...raw };
  for (const field of FIELDS[collection] || []) {
    const v = raw[field.key];
    if (field.type === 'number') out[field.key] = v === '' || v === undefined || v === null ? null : Number(v);
    else if (field.type === 'bool') out[field.key] = !!v;
    else if (field.type === 'tags') out[field.key] = Array.isArray(v) ? v : String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (field.type === 'refs') out[field.key] = Array.isArray(v) ? v : [];
    else if (field.type === 'select' && field.numeric) out[field.key] = v === '' ? null : Number(v);
    else if (typeof v === 'string') out[field.key] = v.trim();
  }
  return out;
}
