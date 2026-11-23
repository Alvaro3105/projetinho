// Grade de Engenharia de Software — PUC Minas.
// FONTE: página oficial do curso no campus Lourdes (Praça da Liberdade) e, para o 2º período,
// a página do campus Coração Eucarístico (curso=267), lidas por mecanismo de busca em 23/11/2026.
// O acesso direto a pucminas.br estava bloqueado no ambiente de desenvolvimento, então:
// - "verificado: true" = nome e carga horária apareceram na página oficial;
// - "verificado: false" = disciplina citada na página, mas período ou carga não confirmados.
// Confirme o campus e a matriz vigente na matrícula. Nenhuma ementa ou professor foi inventado.

export const CURRICULUM_SOURCE = {
  lourdes: 'https://www.pucminas.br/campus/lourdes/ensino/graduacao/Paginas/Engenharia-de-Software.aspx',
  coracao: 'https://www.pucminas.br/campus/coracao-eucaristico/ensino/graduacao/Paginas/Engenharia-de-Software.aspx?curso=267',
  consulted: '2026-11-23',
  note: 'Grade parcial obtida pela busca. As páginas mostram turnos diferentes (manhã/noite) e campi diferentes. Revise após a matrícula.',
};

export const SEMESTERS = [
  {
    number: 1, term: '2027/1',
    disciplines: [
      { name: 'Introdução à Algoritmos', hours: 144, verified: true },
      { name: 'Fundamentos de Engenharia de Software', hours: 90, verified: true },
      { name: 'Desenvolvimento de Interfaces Web', hours: 54, verified: true },
      { name: 'Introdução à Computação', hours: null, verified: true },
      { name: 'Computabilidade', hours: null, verified: true },
      { name: 'Trabalho Interdisciplinar — Aplicações Web', hours: 68, verified: true },
    ],
    gradeNote: 'A página lista 7 disciplinas (536 h) no 1º período do turno da manhã; uma delas não apareceu no trecho lido.',
    prior: 'Lógica de programação, Python básico, HTML/CSS, funções e álgebra do ensino médio.',
    fundamentals: 'Algoritmos, decomposição de problemas, depuração, primeiros conceitos de engenharia de software.',
    parallel: 'CS50x (concluir), 60–120 problemas de lógica sem IA, revisão de pré-cálculo para Cálculo I.',
    project: 'Refazer sozinho um CRUD pequeno (sem IA gerando código) e documentar decisões.',
    professional: 'Candidaturas para Jovem Aprendiz/estágio; LinkedIn atualizado; primeiro evento do semestre.',
  },
  {
    number: 2, term: '2027/2',
    disciplines: [
      { name: 'Programação Modular', hours: 144, verified: true, note: 'Listada no 2º período (Coração Eucarístico).' },
      { name: 'Cálculo I', hours: null, verified: true },
      { name: 'Arquitetura de Computadores', hours: null, verified: true },
      { name: 'Desenvolvimento e Integração de Aplicações Web', hours: null, verified: true },
      { name: 'Interação Humano-Computador', hours: null, verified: true },
      { name: 'Introdução à Pesquisa', hours: null, verified: false },
      { name: 'Métodos de Extensão Universitária', hours: null, verified: false },
      { name: 'Trabalho Interdisciplinar', hours: null, verified: true },
    ],
    gradeNote: 'Lista do campus Coração Eucarístico. Pode diferir no campus Lourdes.',
    prior: 'Introdução à Algoritmos bem consolidada; funções, limites intuitivos.',
    fundamentals: 'Modularização, POO, contratos, testes; derivadas.',
    parallel: 'POO em Python e Java; pytest; Git em equipe; MIT 18.01 como apoio a Cálculo I.',
    project: 'Projeto #1 de portfólio: API backend com testes e CI (início).',
    professional: 'Primeiro hackathon; meta de primeira experiência em TI.',
  },
  {
    number: 3, term: '2028/1',
    disciplines: [
      { name: 'Estruturas de Dados', hours: 144, verified: true },
      { name: 'Cálculo II', hours: 108, verified: true },
      { name: 'Engenharia de Requisitos de Software', hours: 84, verified: true },
      { name: 'Trabalho Interdisciplinar — Sustentabilidade', hours: 216, verified: true },
      { name: 'Bancos de Dados', hours: null, verified: false, note: 'Citada entre o 2º e o 4º período; período não confirmado.' },
    ],
    gradeNote: 'O trecho lido mostra 6 disciplinas (708 h) no turno da noite.',
    prior: 'Programação modular, recursão, Cálculo I.',
    fundamentals: 'Listas, pilhas, filas, árvores, hashing, complexidade; requisitos.',
    parallel: 'Implementar cada estrutura do zero; problemas por padrão (NeetCode); SQL avançado.',
    project: 'Evoluir o Projeto #1 (PostgreSQL, Docker, deploy, observabilidade básica).',
    professional: 'Buscar estágio em desenvolvimento; candidatura a IC.',
  },
  {
    number: 4, term: '2028/2',
    disciplines: [
      { name: 'Projeto de Software', hours: 120, verified: true },
      { name: 'Algoritmos em Grafos', hours: 84, verified: true },
      { name: 'Redes de Computadores', hours: 84, verified: true },
      { name: 'Optativa I', hours: null, verified: true },
      { name: 'Trabalho Interdisciplinar — Sistemas de produção', hours: 192, verified: true },
      { name: 'Gerência de Projetos de Software', hours: null, verified: false, note: 'Citada entre o 2º e o 4º período; período não confirmado.' },
    ],
    gradeNote: 'O trecho lido mostra 9 disciplinas (648 h) no turno da manhã.',
    prior: 'Estruturas de dados, POO, requisitos.',
    fundamentals: 'Design de software, padrões, grafos (BFS, DFS, caminhos mínimos), redes TCP/IP.',
    parallel: 'Design Patterns aplicados; grafos no LeetCode; Java + Spring Boot.',
    project: 'Projeto #2: sistema com fila/cache e testes de integração.',
    professional: 'Estágio (meta); primeira contribuição open source.',
  },
  {
    number: 5, term: '2029/1',
    disciplines: [
      { name: 'Análise e Projeto de Algoritmos', hours: null, verified: true },
      { name: 'Sistemas Distribuídos e Computação em Nuvem', hours: null, verified: true },
      { name: 'Desenvolvimento de Aplicações Móveis', hours: null, verified: true },
      { name: 'Trabalho Interdisciplinar', hours: null, verified: true },
    ],
    gradeNote: 'A página lista 8 disciplinas no 5º período; só estas apareceram no trecho lido.',
    prior: 'Grafos, estruturas de dados, redes, Cálculo.',
    fundamentals: 'Divisão e conquista, programação dinâmica, guloso; consistência, replicação, cloud.',
    parallel: 'Preparação intensiva de entrevistas; MIT 6.006; DDIA (leitura).',
    project: 'Projeto #3 (IA aplicada) começa: RAG/agentes com avaliação.',
    professional: 'Candidaturas a estágios de grande porte (inclui ciclo de internships das Big Techs).',
  },
  {
    number: 6, term: '2029/2',
    disciplines: [
      { name: 'Arquitetura de Software', hours: null, verified: true },
      { name: 'Teste de Software', hours: null, verified: true },
      { name: 'Optativa II', hours: 18, verified: true },
    ],
    gradeNote: 'Só estas disciplinas do 6º período apareceram no trecho lido.',
    prior: 'Projeto de software, sistemas distribuídos.',
    fundamentals: 'Estilos arquiteturais, trade-offs, ADRs; estratégia de testes.',
    parallel: 'System design para entrevistas; ML com base matemática.',
    project: 'Consolidar Projeto #3 com métricas, testes e documentação em inglês.',
    professional: 'Intercâmbio/mobilidade (se viável); estágio de maior porte.',
  },
  {
    number: 7, term: '2030/1',
    disciplines: [
      { name: 'Medição e Experimentação em Engenharia de Software', hours: 120, verified: true },
      { name: 'Eletivas de Engenharia de Software (ex.: Métodos Formais, Site Reliability Engineering)', hours: null, verified: true },
      { name: 'Disciplina de formação cultural-religiosa', hours: null, verified: false },
    ],
    gradeNote: 'O 7º período tem várias eletivas; os nomes citados apareceram no trecho lido.',
    prior: 'Estatística, arquitetura e testes.',
    fundamentals: 'Métodos experimentais, métricas, confiabilidade.',
    parallel: 'Pesquisa aplicada / artigo; especialização em IA ou infraestrutura.',
    project: 'Proposta de TCC alinhada à especialização.',
    professional: 'Processos new grad / júnior; networking ativo.',
  },
  {
    number: 8, term: '2030/2',
    disciplines: [
      { name: 'Trabalho de Conclusão de Curso', hours: 144, verified: true },
      { name: 'Qualidade de Software', hours: null, verified: true },
      { name: 'Manutenção e Evolução de Software', hours: null, verified: true },
    ],
    gradeNote: 'Só estas disciplinas do 8º período apareceram no trecho lido.',
    prior: 'Todo o núcleo do curso.',
    fundamentals: 'Qualidade, evolução, manutenção de sistemas reais.',
    parallel: 'Preparação para pós-graduação (se escolhida) e processos internacionais.',
    project: 'TCC com resultado técnico demonstrável.',
    professional: 'Transição para posição efetiva.',
  },
];
