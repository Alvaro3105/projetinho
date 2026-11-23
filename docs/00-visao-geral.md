# CAREER OS: visão geral e como usar

**CAREER OS — Personal Academic & Career Development System. By Álvaro Pires.**

O CAREER OS é o seu ambiente de autogestão acadêmica e de carreira. Ele junta, em um só sistema, **diagnóstico** (o que você sabe de verdade), **plano** (o que estudar, em que ordem e por quê), **execução** (sessões, projetos, candidaturas) e **avaliação** (evidências, revisões e relatórios).

Ele foi construído em cima de três regras:

1. **Nada inventado.** Todo nível de competência começa como *Não avaliado*. Porcentagens só aparecem quando existe dado medido. Sem dado, o sistema escreve "Não avaliado" em vez de 0%.
2. **Evidência acima de esforço.** Horas de estudo são registradas, mas o progresso é medido por o que você consegue fazer sozinho: problemas resolvidos sem IA, projetos funcionando, avaliações feitas.
3. **Sistema vivo.** O plano muda com as revisões semanais e mensais. O roadmap é uma hipótese que você ajusta com dados.

## O ciclo

**Planejar → Estudar → Praticar → Desenvolver → Avaliar → Ajustar.**

| Momento | Onde no CAREER OS | Tempo |
|---|---|---|
| Todo dia | Marcar hábitos (Desenvolvimento pessoal), registrar sessões (Estudos), concluir atividades (Dashboard) | 2 min |
| Domingo | Revisão semanal (Revisões): produtividade, aprendizado, dificuldades, prioridades da semana | 15–20 min |
| Último dia do mês | Revisão mensal: metas × entregas, lacunas, ajuste do roadmap, plano do próximo mês | 40 min |
| A cada semestre | Reavaliar competências (Skill Tracker), EF SET (Inglês), revisar trilhas (Guia) | 2 h |

## Mapa dos módulos

| Módulo | Para que serve |
|---|---|
| Dashboard | Visão do momento: fase, progresso por área (só com dados reais), metas da semana, pendências, marcos, competências prioritárias |
| Roadmap | 6 fases com marcos, dependências e status; os 8 semestres da PUC Minas com plano complementar |
| Estudos | Materiais (cursos, livros, disciplinas), sessões com uso de IA registrado, biblioteca recomendada |
| Competências | Skill Tracker: nível atual × desejado, evidências, histórico, avaliações diagnósticas |
| Projetos | Ideias → planejado → em andamento → concluído, com tarefas, melhorias e competências |
| Carreira | Candidaturas com funil e lacunas, empresas, experiências, preparação para entrevistas |
| Inglês | Avaliações CEFR, vocabulário, prática por habilidade, metas de proficiência |
| Desenvolvimento pessoal | Hábitos, metas de todos os horizontes, leitura, reflexões, práticas mensuráveis |
| Oportunidades | Bolsas, IC, hackathons, eventos, programas, com selo de "confirmado na fonte" |
| Revisões | Ciclo semanal e mensal |
| Relatórios | Evolução mensal/semestral, consistência, independência de IA, metas, aprendizagem, pontos de melhoria |
| Guia estratégico | Estes documentos |

## Como os módulos conversam

- **Concluir um projeto** abre o registro de competências desenvolvidas: evidência + nível novo (com histórico).
- **Concluir um curso** registra a data no histórico de aprendizagem e pede uma evidência prática. Certificado sozinho não sobe nível.
- **Uma vaga** pode listar competências exigidas. As que estão abaixo do desejado ou não avaliadas aparecem como lacuna, com botão para criar uma atividade.
- **Competência abaixo do alvo** tem botão "Criar atividade" que gera uma tarefa ligada a ela.
- **Avaliação diagnóstica** registrada atualiza os níveis das competências avaliadas, com histórico.
- **Sessões de estudo** alimentam horas, consistência e o indicador de independência de IA.

## Seus dados

Os dados ficam **somente no navegador** (localStorage), no dispositivo em que você usa o sistema. Não existe servidor, conta ou sincronização. Isso tem consequências práticas:

- limpar dados do navegador, usar janela anônima ou trocar de computador faz os dados "sumirem";
- **faça backup toda semana** em Configurações › Dados e backup (arquivo JSON) e guarde em um lugar seu;
- para usar em outro computador, importe o backup lá.

Um passo natural de evolução (e um bom projeto para a Fase 2) é você mesmo construir uma API para sincronizar esses dados.

## Classificação das informações

Ao longo dos documentos:

- **[oficial]**: veio de página oficial (universidade, empresa, programa), com data de consulta;
- **[mercado]**: requisito frequente em vagas e processos, sem ser regra oficial;
- **[recomendação]**: orientação deste plano;
- **[estimativa]**: número de pesquisa salarial ou de mercado, com fonte;
- **[hipótese]**: algo que ainda precisa ser verificado por você.

## Limitações conhecidas

- A grade da PUC Minas (Coração Eucarístico, noturno) é a matriz oficial atualizada em 21/11/2026 e conferida por você na página da PUC. É uma **referência provisória** até você confirmar, em Roadmap › Semestres, a matriz vinculada à matrícula de 2027.
- Atualizações do plano (como esta revisão) só acrescentam registros ou ajustam os que você não editou. Nada é apagado, e níveis, evidências, histórico e sessões ficam como estão.
- Os repositórios dos projetos acadêmicos menores (Helpdesk, CRUDs, provas) não foram analisados em profundidade; só o ExplAIner e o Portfólio.
- Salários no exterior não têm números no sistema: sem fonte consultada, preferimos não inventar. Use Levels.fyi.
