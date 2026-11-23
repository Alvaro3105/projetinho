// Grade de Engenharia de Software — PUC Minas, campus Coração Eucarístico, turno noturno.
// FONTE: matriz curricular da página oficial do curso (atualizada pela PUC em 21/11/2026),
// consultada e informada pelo Álvaro em 23/11/2026. A página apresenta grade para manhã e noite.
// A PUC avisa que as informações curriculares podem mudar: confirme a matriz vinculada à
// matrícula de 2027. Nenhuma ementa, professor ou pré-requisito foi inventado.

export const CURRICULUM_VERSION = '2026-11-21';

export const CURRICULUM_SOURCE = {
  url: 'https://www.pucminas.br/campus/coracao-eucaristico/ensino/graduacao/Paginas/Engenharia-de-Software.aspx',
  campus: 'Coração Eucarístico',
  shift: 'Noturno',
  updated: '2026-11-21',
  consulted: '2026-11-23',
  note: 'Matriz oficial (atualizada em 21/11/2026), informada por você. Confirme a matriz vinculada à sua matrícula de 2027.',
};

/** Lacunas da grade em relação aos seus objetivos: estudar em paralelo. */
export const CURRICULUM_GAPS = [
  { topic: 'Matemática discreta', why: 'Base de algoritmos, provas e grafos. Não aparece na grade.', when: 'Antes e durante o 3º–4º período (MIT 6.042J).' },
  { topic: 'Álgebra linear', why: 'Indispensável para ML/DL. Não aparece na grade, e Ciência de Dados e IA chega no 6º período.', when: '2028/2 a 2029/1 (MIT 18.06, Mathematics for ML).' },
  { topic: 'Compiladores', why: 'Não aparece na grade; opcional para sistemas.', when: 'Opcional, Fase 4 (Crafting Interpreters).' },
  { topic: 'Entrevistas técnicas (DSA)', why: 'A grade cobre os fundamentos, mas não o treino no formato de entrevista.', when: 'Contínuo a partir de 2027.' },
];

export const SEMESTERS = [
  {
    number: 1, term: '2027/1', theme: 'Fundamentos',
    disciplines: [
      { name: 'Computabilidade', hours: 72 },
      { name: 'Desenvolvimento de Interfaces Web', hours: 54 },
      { name: 'Filosofia: Lógica e Pensamento Crítico', hours: 36 },
      { name: 'Fundamentos de Engenharia de Software', hours: 90 },
      { name: 'Introdução a Algoritmos', hours: 144 },
      { name: 'Introdução à Computação', hours: 72 },
      { name: 'Trabalho Interdisciplinar: Desenvolvimento de Aplicações Web', hours: 68 },
    ],
    prior: 'Lógica de programação, Python básico, HTML/CSS, álgebra e funções do ensino médio.',
    fundamentals: 'Algoritmos e decomposição de problemas (Introdução a Algoritmos é a disciplina mais importante do ano), primeiros conceitos de ES, noções de computabilidade.',
    parallel: 'Terminar o CS50x; 60–120 problemas sem IA; revisão de pré-cálculo para Cálculo I (2º período).',
    project: 'Trabalho Interdisciplinar como projeto de portfólio: Git desde o 1º dia, README, divisão clara de quem fez o quê.',
    professional: 'Turno noturno libera o dia: candidaturas a Jovem Aprendiz/estágio já no 1º semestre.',
  },
  {
    number: 2, term: '2027/2', theme: 'Programação e matemática',
    disciplines: [
      { name: 'Arquitetura de Computadores', hours: 42 },
      { name: 'Cálculo I', hours: 108 },
      { name: 'Desenvolvimento e Integração de Aplicações Web', hours: 72 },
      { name: 'Interação Humano-Computador', hours: 90 },
      { name: 'Introdução à Pesquisa em Informática', hours: 36 },
      { name: 'Metodologias de Extensão Universitária', hours: 72 },
      { name: 'Programação Modular', hours: 144 },
      { name: 'Trabalho Interdisciplinar: Desenvolvimento Centrado no Usuário', hours: 56 },
    ],
    prior: 'Introdução a Algoritmos consolidada; funções e pré-cálculo.',
    fundamentals: 'Modularização e POO (Programação Modular), derivadas, integração web, como funciona uma pesquisa acadêmica.',
    parallel: 'POO e testes em Python (CS50P); MIT 18.01 como apoio a Cálculo I; começar matemática discreta (MIT 6.042J), que não está na grade.',
    project: 'Projeto #1 começa: API backend feita sozinho, com testes e CI.',
    professional: 'Primeiro hackathon; meta de primeira experiência em TI. Introdução à Pesquisa é a hora de conhecer professores e linhas de pesquisa.',
  },
  {
    number: 3, term: '2028/1', theme: 'Estruturas de dados e sistemas',
    disciplines: [
      { name: 'Bancos de Dados', hours: 72 },
      { name: 'Cálculo II', hours: 108 },
      { name: 'Engenharia de Requisitos de Software', hours: 84 },
      { name: 'Estruturas de Dados', hours: 144 },
      { name: 'Fundamentos de Sistemas Operacionais', hours: 84 },
      { name: 'Trabalho Interdisciplinar: Desenvolvimento de Aplicações para Sustentabilidade', hours: 216 },
    ],
    prior: 'Programação Modular, recursão, Cálculo I, SQL básico.',
    fundamentals: 'Listas, pilhas, filas, árvores, hashing e complexidade; modelagem e SQL; processos, memória e concorrência.',
    parallel: 'Implementar cada estrutura do zero; problemas por padrão; SQL avançado (CS50 SQL); OSTEP junto com Sistemas Operacionais; matemática discreta.',
    project: 'Projeto #1 com PostgreSQL, Docker e deploy. O Trabalho Interdisciplinar (216 h) é o maior do curso: trate como produto real.',
    professional: 'Estágio em desenvolvimento ou dados; candidatura a iniciação científica.',
  },
  {
    number: 4, term: '2028/2', theme: 'Engenharia e infraestrutura',
    disciplines: [
      { name: 'Algoritmos em Grafos', hours: 84 },
      { name: 'Cultura e Práticas DevOps', hours: 54 },
      { name: 'Desenvolvimento de Carreira Internacional', hours: 18 },
      { name: 'Gerência de Projetos de Software', hours: 60 },
      { name: 'Gerência de Requisitos de Software', hours: 18 },
      { name: 'Optativa I', hours: 18 },
      { name: 'Projeto de Software', hours: 120 },
      { name: 'Redes de Computadores', hours: 84 },
      { name: 'Trabalho Interdisciplinar: Desenvolvimento de Sistemas em Ambientes de Produção', hours: 192 },
    ],
    prior: 'Estruturas de dados, POO, requisitos, SO.',
    fundamentals: 'Grafos (BFS, DFS, caminhos mínimos), padrões de projeto, CI/CD e operação, TCP/IP.',
    parallel: 'Java + Spring Boot; grafos no LeetCode; começar álgebra linear (MIT 18.06), que não está na grade e é pré-requisito real de IA.',
    project: 'Projeto #2: fila, cache, observabilidade, deploy contínuo (aplica DevOps e o TI de produção).',
    professional: 'Desenvolvimento de Carreira Internacional encaixa com a meta de inglês B2+; primeira contribuição open source.',
  },
  {
    number: 5, term: '2029/1', theme: 'IA e sistemas distribuídos',
    disciplines: [
      { name: 'Análise e Projeto de Algoritmos', hours: 84 },
      { name: 'Desenvolvimento de Aplicações Móveis', hours: 84 },
      { name: 'Engenharia Econômica para Software', hours: 42 },
      { name: 'Estatística e Probabilidade', hours: 108 },
      { name: 'Fundamentos de Inteligência Artificial', hours: 54 },
      { name: 'Gestão da Produção de Software', hours: 18 },
      { name: 'Sistemas Distribuídos e Computação em Nuvem', hours: 72 },
      { name: 'Trabalho Interdisciplinar: Desenvolvimento de Aplicações Inovadoras', hours: 74 },
    ],
    prior: 'Grafos, estruturas de dados, Cálculo I e II, álgebra linear (paralelo).',
    fundamentals: 'Divisão e conquista, programação dinâmica, guloso; probabilidade e inferência; busca e aprendizado; consistência e replicação.',
    parallel: 'CS50 AI e ML Crash Course junto com Fundamentos de IA; ISLP com Estatística; preparação intensa de entrevistas.',
    project: 'Projeto #3 (IA aplicada) começa, possivelmente dentro do TI de Aplicações Inovadoras.',
    professional: 'Ciclo de candidaturas a estágios de grande porte, incluindo Big Techs.',
  },
  {
    number: 6, term: '2029/2', theme: 'Arquitetura e segurança',
    disciplines: [
      { name: 'Arquitetura de Software', hours: 84 },
      { name: 'Ciência de Dados e Inteligência Artificial', hours: 84 },
      { name: 'Modelagem e Avaliação de Desempenho', hours: 84 },
      { name: 'Optativa II', hours: 18 },
      { name: 'Segurança em Desenvolvimento de Software', hours: 72 },
      { name: 'Teste de Software', hours: 84 },
      { name: 'Tópicos Especiais em Sistemas Computacionais', hours: 18 },
      { name: 'Trabalho Interdisciplinar: Engenharia de Arquiteturas Avançadas', hours: 50 },
    ],
    prior: 'Projeto de software, sistemas distribuídos, estatística, fundamentos de IA.',
    fundamentals: 'Estilos arquiteturais e trade-offs, ML e ciência de dados aplicados, desempenho (filas, medições), segurança de aplicações, estratégia de testes.',
    parallel: 'Deep learning (d2l.ai, Zero to Hero); system design para entrevistas.',
    project: 'Consolidar o Projeto #3 com métricas, testes e documentação em inglês.',
    professional: 'Mobilidade internacional, se viável; estágio de maior porte.',
  },
  {
    number: 7, term: '2030/1', theme: 'Engenharia avançada',
    disciplines: [
      { name: 'Cultura Religiosa: Saberes e Tradições', hours: 36 },
      { name: 'Design de Interação e Experiência de Usuário', hours: 36 },
      { name: 'Medição e Experimentação em Engenharia de Software', hours: 120 },
      { name: 'Métodos Formais em Engenharia de Software', hours: 84 },
      { name: 'Seminários Avançados em Engenharia de Software', hours: 36 },
      { name: 'Site Reliability Engineering (SRE)', hours: 84 },
      { name: 'Tópicos Especiais em Engenharia de Software', hours: 18 },
      { name: 'Trabalho Interdisciplinar: Pesquisa e Avaliação Empírica', hours: 50 },
    ],
    prior: 'Estatística, arquitetura, testes, sistemas distribuídos.',
    fundamentals: 'Métodos experimentais e métricas, especificação formal, confiabilidade em produção (SLOs, incidentes).',
    parallel: 'LLMs, RAG e agentes com avaliação; pesquisa aplicada (o TI de Pesquisa Empírica pode virar artigo).',
    project: 'Proposta de TCC alinhada à especialização.',
    professional: 'Processos new grad / júnior; networking ativo.',
  },
  {
    number: 8, term: '2030/2', theme: 'Consolidação profissional',
    disciplines: [
      { name: 'Cidadania e Responsabilidade Social', hours: 36 },
      { name: 'Cultura Religiosa: Humanismo, Sociedade e Ecologia Integral', hours: 36 },
      { name: 'Engenharia de Processos de Software', hours: 48 },
      { name: 'Filosofia: Antropologia e Ética', hours: 36 },
      { name: 'Manutenção e Evolução de Software', hours: 84 },
      { name: 'Modelagem de Processos de Negócio', hours: 48 },
      { name: 'Qualidade de Software', hours: 84 },
      { name: 'Trabalho de Conclusão de Curso', hours: 144 },
    ],
    prior: 'Todo o núcleo do curso.',
    fundamentals: 'Qualidade, evolução e manutenção de sistemas reais; processos de software e de negócio.',
    parallel: 'Preparação para pós-graduação (se escolhida) e processos internacionais.',
    project: 'TCC com resultado técnico ou de pesquisa demonstrável.',
    professional: 'Transição para posição efetiva.',
  },
];

export const totalHours = (s) => s.disciplines.reduce((a, d) => a + (d.hours || 0), 0);

const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Atualiza semestres já salvos para a matriz oficial, preservando o que você registrou:
 * status do semestre e status/nota das disciplinas com o mesmo nome. Função pura.
 */
export function mergeSemester(saved, official, makeId) {
  const old = new Map((saved?.disciplines || []).map((d) => [norm(d.name), d]));
  return {
    term: official.term, theme: official.theme,
    disciplines: official.disciplines.map((d) => {
      const prev = old.get(norm(d.name));
      return { id: prev?.id || makeId(), name: d.name, hours: d.hours, verified: true, note: '', status: prev?.status || 'futura', grade: prev?.grade ?? null };
    }),
    gradeNote: `${totalHours(official)} h no período.`,
    prior: official.prior, fundamentals: official.fundamentals, parallel: official.parallel, project: official.project, professional: official.professional,
  };
}
