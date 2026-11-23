# Trilha de Inteligência Artificial

IA é a sua área de maior interesse. Por isso mesmo, ela entra **na ordem certa**: sem base de programação, matemática e engenharia, estudar IA vira usar APIs sem entender o que acontece por dentro, e isso não diferencia ninguém em 2030.

## Como a trilha se encaixa na faculdade

Na matriz oficial, IA chega no **5º período** (Estatística e Probabilidade, Fundamentos de Inteligência Artificial) e no **6º** (Ciência de Dados e Inteligência Artificial). A estratégia é chegar lá com a matemática pronta: **álgebra linear como estudo complementar** (não está na grade): parte I nas férias de jan–fev/2029 e parte II em 2029/1, junto com Estatística e Probabilidade. O 3º período (2028/1, 708 h) fica sem estudo de IA ou matemática complementar. Assim as disciplinas viram aprofundamento, e o restante da trilha (deep learning, LLMs, MLOps) é estudo próprio a partir do 6º.

## A trilha em 17 etapas

| # | Etapa | Pré-requisitos | Fase | Recursos | Evidência esperada |
|---|---|---|---|---|---|
| 1 | Fundamentos de IA (busca, conhecimento, incerteza) | Python intermediário | 4 (PUC 5º) | Fundamentos de IA (PUC) + CS50 AI | Problem sets do CS50 AI |
| 2 | Python para ciência de dados | Python, SQL (Bancos de Dados, 3º) | 4 | Documentação de NumPy e pandas | Análise de um conjunto de dados público com conclusões honestas |
| 3 | Matemática para ML: álgebra linear (+ cálculo vetorial em 2029/2) | Cálculo I e II (PUC) | 4 (férias jan–fev/2029 + 2029/1) | MIT 18.06, *Mathematics for Machine Learning* | Exercícios resolvidos; derivar o gradiente da regressão linear à mão |
| 4 | Estatística aplicada | Probabilidade | 4 (PUC 5º) | Estatística e Probabilidade (PUC) + *ISLP* | Teste de hipótese e intervalo de confiança explicados |
| 5 | Machine Learning clássico | 2, 3, 4 | 4 (PUC 6º) | Ciência de Dados e IA (PUC), ML Crash Course, scikit-learn | Modelo com validação correta e análise de erros |
| 6 | Deep Learning | 5 | 4 | d2l.ai, fast.ai | Rede treinada em PyTorch com curvas de treino explicadas |
| 7 | Redes neurais por dentro | 3, 6 | 4 | Karpathy *Zero to Hero* | Backpropagation implementado do zero (micrograd) |
| 8 | Processamento de Linguagem Natural | 6 | 4 | CS224N | Classificador de texto e embeddings |
| 9 | Large Language Models | 7, 8 | 4 | Zero to Hero (GPT do zero), Hugging Face LLM Course | Pequeno modelo de linguagem treinado por você |
| 10 | RAG | 9 + backend | 4 | Documentação de embeddings e bancos vetoriais | Sistema RAG com conjunto de avaliação próprio |
| 11 | Agentes de IA | 10 | 4–5 | Documentação dos provedores; artigos | Agente com ferramentas, limites e testes |
| 12 | Sistemas multiagentes | 11 | 5 | Artigos e frameworks | Experimento comparando 1 vs. vários agentes com métrica |
| 13 | Avaliação de modelos | 5, 10 | 4–5 | Literatura de avaliação | Relatório de avaliação com métricas e limitações |
| 14 | MLOps | 5 + Docker + CI | 5 | MLflow, documentação de cloud | Pipeline treino → registro → deploy → monitoramento |
| 15 | Infraestrutura de IA | SO, distribuídos | 5+ | Documentação de serving e GPUs | Benchmark de latência/custo de inferência |
| 16 | Otimização e implantação | 14, 15 | 5+ | Quantização, distilação (documentação) | Modelo otimizado com trade-off medido |
| 17 | Pesquisa aplicada | IC + 1–13 | 4–6 | Artigos, orientador | Reprodução de um artigo; depois, contribuição própria |

## Como estudar o funcionamento interno, não só as APIs

1. **Implemente antes de usar:** regressão linear com NumPy antes do scikit-learn; backpropagation (micrograd) antes do PyTorch; atenção antes de usar um transformer pronto.
2. **Leia o artigo original** das ideias centrais quando chegar nelas (atenção/transformer, embeddings, RAG), com o resumo escrito por você.
3. **Avalie sempre:** todo projeto de IA tem um conjunto de teste, uma métrica e uma seção de limitações. É o que separa engenharia de demonstração.
4. **Meça custo e latência:** em produção, IA é trade-off entre qualidade, custo e tempo de resposta.

## Diferenças entre os cargos

| Cargo | Responsabilidades | Conhecimentos | Ferramentas | Requisitos de entrada [mercado] |
|---|---|---|---|---|
| AI Engineer | Integrar modelos em produtos: prompts, RAG, ferramentas, avaliação, custo | Engenharia de software + ML aplicado | APIs de modelos, embeddings, backend | Ser um bom engenheiro de software; projetos com avaliação |
| Machine Learning Engineer | Treinar, servir e monitorar modelos; pipelines de features | ML, DL, dados, software | PyTorch, scikit-learn, Spark, MLOps | Diploma na área; projetos ponta a ponta; geralmente experiência prévia |
| Applied AI Engineer | Aplicar modelos a problemas de clientes, provar valor | Software, ML aplicado, comunicação | APIs, avaliação, protótipos | Software + inglês + comunicação |
| Research Engineer | Implementar e escalar pesquisa | DL profundo + engenharia de alto nível | PyTorch/JAX, clusters de GPU | Mestrado/doutorado ou histórico forte |
| Research Scientist | Conduzir pesquisa original, publicar | Teoria de ML, matemática avançada | Frameworks de DL, escrita científica | Doutorado na maioria das vagas |
| LLM Engineer | Fine-tuning, avaliação, inferência e RAG com LLMs | NLP, transformers, sistemas | Transformers, servidores de inferência | Título variável; avalie o conteúdo da vaga |
| AI Infrastructure Engineer | GPUs, treino distribuído, serving eficiente | SO, distribuídos, arquitetura | Kubernetes, CUDA, C++ | Base forte de sistemas e infraestrutura |

## Onde você entra

- **Até a Fase 2:** nada de trilha de IA formal. Use IA só como ferramenta (ver Política de uso de IA) e entenda como o ExplAIner integra o Gemini.
- **Fase 3 (2028):** nenhuma etapa formal de IA. O 3º período tem 708 h; Bancos de Dados e Estruturas de Dados preparam o terreno.
- **Fase 4 (2029):** etapa 3 (álgebra linear) nas férias de jan–fev e em 2029/1; etapas 1, 2 e 4 com o 5º período; etapa 5 com o 6º; etapas 6–10 + Projeto #3 a partir de 2029/2.
- **Fase 5+:** especialização conforme o que a IC, os estágios e o mercado mostrarem: AI Engineer/MLE (caminho mais provável) ou Research Engineer (se a pesquisa encantar).
