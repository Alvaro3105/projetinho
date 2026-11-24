# Análise dos seus projetos

Análise feita em 23/11/2026 sobre o código público. Só o ExplAIner e o Portfólio foram lidos em profundidade. Os outros seis projetos do portfólio estão cadastrados com as descrições do próprio portfólio e marcados como "não analisados".

## 1. ExplAIner (`Alvaro3105/Explainer`)

**O que é (verificado):** plataforma de estudos gamificada para o Ensino Médio. O aluno escolhe matéria e tema, a IA gera questões de múltipla escolha, cada resposta é corrigida com explicação, há fases, pontuação, ranking e sequência de dias. Projeto de equipe com 6 integrantes.

| Critério | Avaliação | Evidência |
|---|---|---|
| Organização do código | **Boa no núcleo novo, irregular no legado.** A área de aprendizado tem services coesos (conta, catálogo, desafio, resposta, conclusão, progresso, gerador, limite). O CRUD legado usa um arquivo de service por operação (`criar_aluno.py`, `deletar_aluno.py`...), o que fragmenta sem ganho. | `backend/services/aprendizado/` × `backend/services/aluno/` |
| Arquitetura | **Camadas claras** (controller → service → repository → model), regras de negócio no servidor ("o navegador nunca decide pontos"). Frontend e API separados, servidos pelo Flask. | README, `app.py` |
| Qualidade técnica | **Acima da média para o nível.** Fallback entre provedores de IA, validação das questões geradas, questões de reserva, limite de geração persistido no banco, transações explícitas. | `gerador_questoes.py`, `limite_geracao.py` |
| Documentação | **Excelente.** README com problema, arquitetura, banco, rotas, variáveis, segurança e uma seção honesta de limitações conhecidas. Diagramas (classes, fluxogramas) em `docs/`. Só em português. | README (430 linhas) |
| Testes | **Fortes:** 189 testes passando (pytest), com banco temporário e IA simulada; testes de navegador com Playwright. Falta CI rodando a suíte a cada push. | Rodado em 23/11/2026: `189 passed` |
| Banco de dados | Modelagem coerente, restrições de unicidade, chaves estrangeiras ativadas no SQLite, índices para consultas reais. PostgreSQL/MySQL aceitos, mas **não testados de ponta a ponta** (o próprio README admite). | README › Banco de dados |
| Segurança | **Muito cuidadosa:** senhas com hash, cookies HttpOnly/SameSite, bloqueio por tentativas, CSP restritiva, cabeçalhos de segurança, limite de tamanho de requisição, painel administrativo protegido, erros genéricos para o cliente. Limites de login e cadastro ficam em memória por processo. | `app.py`, README › Segurança |
| Interface | Tema claro/escuro, minijogo, fontes e ícones locais. `frontend/estudar.js` tem **2.667 linhas** em um arquivo só, o que dificulta manutenção. | `wc -l` |
| Boas práticas | `.env` fora do Git, `.env.example`, requirements com faixas de versão, mensagens de commit descritivas. Alguns commits muito grandes (um com 39 arquivos e +4.194 linhas) dificultam revisão e escondem autoria. | `git log --stat` |
| Potencial de evolução | Alto: o domínio (aprendizagem + IA) conversa com sua especialização futura. | — |
| Relevância para recrutadores | **Alta, com uma condição:** você precisa explicar, sem consulta, qualquer parte que disser que fez. Projeto de equipe + histórico com commits grandes faz o entrevistador perguntar "qual foi a sua parte?". | — |

**Melhorias recomendadas (cadastradas no projeto):**
1. Registrar no README a sua contribuição individual.
2. Seção em inglês no README.
3. GitHub Actions rodando `pytest` a cada push.
4. Dividir `estudar.js` em módulos.
5. Unificar o CRUD legado com a camada de aprendizado.
6. Testar PostgreSQL na CI (serviço do GitHub Actions).
7. Três ADRs: escolha do Flask, cadeia de fallback de provedores de IA, limite de geração no banco.

## 2. Portfólio (`Alvaro3105/Portfolio`)

**Pontos fortes:** bilíngue (PT/EN), acessibilidade cuidada (foco visível, `prefers-reduced-motion`, link de pular conteúdo), SEO configurado, currículo em PDF, projetos acadêmicos identificados com transparência ("Projeto acadêmico", "Revisão pós-prova"). Identidade escura com azul e roxo, Inter + Space Grotesk + JetBrains Mono. O JARVIS mantém Inter e JetBrains Mono e o fundo escuro, trocando o roxo pelo azul-marinho que você pediu.

**Ajustes recomendados:**
- Mostrar **3 projetos fortes** em vez de 6 equivalentes. Para cada um: problema, sua decisão mais importante, resultado (testes, usuários, métricas).
- Certificados introdutórios (Cisco, Fundação Bradesco) podem ir para uma seção secundária: eles mostram iniciativa, mas não diferenciam.
- Quando o Projeto #1 existir, ele substitui os CRUDs na vitrine.

## 3. Estratégia de portfólio: poucos projetos, excelentes

| Projeto | Fase | Objetivo | Critério de "pronto" |
|---|---|---|---|
| **ExplAIner (evolução)** | 1 | Transformar o projeto de equipe em evidência individual | Você passa na Avaliação 5; README com sua contribuição; CI; ADRs |
| **#1 — API backend feita sozinho** | 2 | Provar fundamentos de backend sem IA gerando código | FastAPI + PostgreSQL + Docker + testes (cobertura medida) + CI + deploy + README em inglês. Sugestão de domínio: API de sincronização do próprio JARVIS. |
| **#2 — Sistema com fila, cache e observabilidade** | 3 | Mostrar sistemas além do CRUD | Processamento assíncrono, Redis, métricas, teste de carga com números |
| **#3 — IA aplicada com avaliação** | 4 | Entrar na especialização com rigor | RAG ou agente com conjunto de avaliação próprio, métricas de qualidade/custo/latência, seção de limitações |
| **TCC** | 5 | Resultado técnico ou de pesquisa | Alinhado à especialização |

**Regra para todos:** repositório com histórico de commits pequenos, README com problema e decisões, testes, CI, e uma frase "o que eu faria diferente" no final.
