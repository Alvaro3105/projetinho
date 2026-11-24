# Carreiras e trilhas recomendadas

## 1. A competitividade das Big Techs, sem romantizar

- **Volume.** Empresas como Google, Microsoft, Amazon e Meta recebem um número muito grande de candidaturas por vaga de entrada. A maioria dos aprovados não é "gênio": é gente que dominou fundamentos, praticou entrevistas de forma estruturada e tinha evidências (estágios, projetos, competições) para passar da triagem.
- **O que a triagem olha [mercado]:** curso em andamento na área, experiência prévia (estágios contam muito), projetos com impacto demonstrável, competições (Maratona de Programação), inglês, clareza do currículo.
- **O que as entrevistas medem [mercado]:** estruturas de dados e algoritmos resolvidos em voz alta, qualidade de código sem IDE sofisticada, análise de complexidade, comunicação, comportamento (trabalho em equipe, ownership, aprendizado com erros). Em níveis acima de entrada, system design.
- **O que diferencia os aprovados:** consistência de anos em fundamentos, muitas horas de prática deliberada de problemas, capacidade de explicar o próprio raciocínio, um histórico que mostra crescimento (cada estágio maior que o anterior).
- **Empresas de IA (OpenAI, Anthropic e laboratórios).** São ainda mais seletivas, contratam poucos profissionais em início de carreira e quase sempre fora do Brasil. Para você, são uma meta de Fase 6, não de estágio.

**Ponto concreto a seu favor [oficial]:** o Google publicou em 2026 uma vaga de *Software Engineering Intern* em Belo Horizonte (híbrido, 30 h/semana, 14–15 semanas, inglês exigido, para quem se forma em uma janela específica). Os requisitos mudam a cada ciclo, mas mostram que existe um caminho local. Fonte e data em Oportunidades.

## 2. Carreiras: comparação rápida

| Cargo | Núcleo do trabalho | Porta de entrada realista | Matemática | Encaixe com você |
|---|---|---|---|---|
| Software Engineer | Construir e manter sistemas | Estágio de desenvolvimento | Discreta | **Alto** (trilha principal) |
| Backend Engineer | APIs, dados, performance | Estágio backend | Discreta, estatística básica | **Alto** (foco da trilha principal) |
| Full Stack | Produto de ponta a ponta | Estágio em empresa menor | Básica | Médio (complemento) |
| Frontend | Interfaces | Estágio front | Básica | Baixo |
| SDE (Amazon) | SWE com ownership de serviço | Programa de estágio | Discreta | Alto (mesma base) |
| Systems Engineer | Baixo nível, performance | Raro como primeira vaga | Discreta | Médio (opção futura) |
| AI Engineer | Integrar modelos em produtos | Depois de ser bom SWE | Estatística, álgebra linear básica | **Alto no longo prazo** |
| ML Engineer | Treinar, servir e monitorar modelos | Raramente primeira vaga | Álgebra linear, cálculo, probabilidade | **Alto no longo prazo** |
| Applied AI Engineer | Aplicar modelos a problemas de clientes | Depois de SWE/AI | Estatística | Médio |
| Research Engineer | Engenharia de pesquisa em ML | Pós-graduação ou histórico forte | Avançada | Depende da IC |
| Research Scientist | Pesquisa original | Doutorado | Avançada | Só se a pesquisa encantar |
| LLM Engineer | Especialização em LLMs | Após ML/DL | Álgebra linear, probabilidade | Parte da especialização |
| AI Infrastructure Engineer | GPUs, treino distribuído, serving | Após infra/sistemas | Álgebra linear básica | Alternativa |
| Data Engineer | Pipelines e plataformas de dados | Estágio em dados | Estatística básica | **Complementar** |
| Analytics Engineer | Modelos analíticos (dbt) | Análise de dados | Estatística básica | Baixo |
| Data Scientist | Estatística e experimentos | Pós-graduação ajuda | Forte em estatística | Médio |
| Data Analyst | Painel Inicials e análises | Estágio | Descritiva | Aceitável como 1ª vaga |
| Cloud Engineer | Infra em nuvem | Suporte/infra | Básica | Complementar |
| DevOps | CI/CD, containers | Após dev | Básica | Prática transversal |
| SRE | Confiabilidade em escala | Após backend/infra | Estatística (SLOs) | Opção futura |
| Platform Engineer | Plataformas internas | Após SWE/DevOps | Básica | Baixo agora |
| Security Engineer | AppSec, detecção, resposta | Dev + CTFs | Discreta | Interesse secundário |

O detalhamento de cada cargo (dia a dia, problemas, tecnologias, fundamentos, linguagens, matemática, requisitos, como começar, crescimento, remuneração, como aparece nas Big Techs e trajetória) está logo abaixo, na **Referência rápida por cargo** (no app) e no arquivo `js/data/careers.js`.

## 3. Remuneração

**Brasil [estimativa]:** faixas da Robert Half para Desenvolvedor Full Stack (percentis 25–75, consultadas em 23/11/2026): júnior ~R$ 6.050–8.750, pleno ~R$ 9.550–15.900, sênior ~R$ 12.450–20.950 por mês. Outras fontes da mesma busca trazem júnior entre R$ 3.000 e R$ 6.500 em empresas menores, o que mostra a dispersão: cidade, porte da empresa e stack mudam muito o valor. Estágio não entrou na pesquisa; confira as bolsas nas próprias vagas.

**Exterior:** sem número neste plano, porque nenhuma fonte foi consultada com rigor. Use [Levels.fyi](https://www.levels.fyi/) filtrando por empresa, nível e país.

## 4. Diferenças entre os cargos de IA

| | AI Engineer | ML Engineer | Applied AI | Research Engineer | Research Scientist | LLM Engineer | AI Infra |
|---|---|---|---|---|---|---|---|
| Pergunta central | Como colocar um modelo em um produto confiável? | Como treinar e operar modelos em produção? | Qual técnica resolve o problema deste cliente? | Como rodar e escalar experimentos de pesquisa? | Qual pergunta nova vale investigar? | Como fazer LLMs funcionarem bem, baratos e rápidos? | Como usar GPUs com eficiência em escala? |
| Ferramentas | APIs de modelos, embeddings, vetores, backend | PyTorch, scikit-learn, Spark, MLOps | APIs, avaliação, protótipos | PyTorch/JAX, clusters | Matemática, PyTorch, escrita científica | Transformers, inferência, avaliação | Kubernetes, CUDA, C++, redes |
| Entrada típica [mercado] | SWE que migra | SWE/dados que migra; mestrado ajuda | SWE com boa comunicação | Mestrado/doutorado ou histórico forte | Doutorado | AI/ML engineer | Backend/infra que migra |

## 5. As três trilhas recomendadas para você

**Trilha principal — Software Engineer com foco em Backend.** É o cargo com mais vagas de entrada, o formato das entrevistas das Big Techs e o pré-requisito real dos cargos de IA aplicada. Você já tem contato com APIs, bancos e camadas; falta profundidade e independência. Stack: Python (fundamentos, entrevistas, IA) → SQL/PostgreSQL → FastAPI + testes + Docker → Java/Spring Boot como segunda stack (mercado brasileiro e faculdade).

**Trilha complementar — Dados e Cloud.** SQL avançado, modelagem, pipelines simples, Docker, CI/CD e noções de cloud. Isso torna você um backend melhor, abre portas de estágio em dados e é a base operacional de IA.

**Especialização de longo prazo — Engenharia de IA / ML Engineering.** Começa de verdade em 2029 (Fase 4), quando a PUC oferece Estatística e Fundamentos de IA (5º) e Ciência de Dados e IA (6º), com álgebra linear estudada antes, fora da grade. Ramo opcional: pesquisa (IC → mestrado → Research Engineer), decidido com base na experiência de IC, não no entusiasmo de agora. Alternativa: AI Infrastructure, se você descobrir gosto por sistemas e C.

**O que não fazer:** tentar dominar front, back, mobile, dados, cloud, segurança e IA ao mesmo tempo. Cada área nova entra quando a anterior virou evidência.

## 6. Trajetórias alternativas

| Caminho | Sequência | Quando faz sentido |
|---|---|---|
| A (principal) | Jovem Aprendiz/estágio local → estágio em empresa de maior porte → estágio em Big Tech (ex.: Google BH) → efetivação/new grad → internacional | Padrão; maior probabilidade |
| B | Estágio em empresa brasileira forte → júnior → pleno com impacto → Big Tech como profissional experiente | Se o estágio em Big Tech não vier; é muito comum |
| C | IC → mestrado (UFMG/USP/exterior) → Research Engineer / ML Engineer | Se a pesquisa encantar e houver bolsa |
| D | Startup de alto nível → ownership amplo → empresa internacional remota | Se surgir uma startup boa; exige inglês forte |
| E | Competições (Maratona) + open source → visibilidade → processos internacionais | Complemento a qualquer um dos anteriores |
