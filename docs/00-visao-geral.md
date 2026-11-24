# JARVIS: visão geral e como usar

**JARVIS — Seu Assistente Inteligente Pessoal.** Conhecimento. Evolução. Carreira. Futuro.
Desenvolvido por Álvaro Pires · 2026. (Antes chamado CAREER OS.)

O JARVIS é a sua plataforma pessoal de organização e desenvolvimento acadêmico, profissional, técnico e pessoal. Ele junta **diagnóstico** (o que você sabe de verdade), **plano** (o que estudar, em que ordem e por quê), **execução** (sessões, projetos, candidaturas) e **avaliação** (evidências, revisões e relatórios).

Ele segue três regras:

1. **Nada inventado.** Todo nível de competência começa como *Não avaliado*. Porcentagens só aparecem quando existe dado medido; sem dado, o sistema escreve "Não avaliado" em vez de 0%.
2. **Evidência acima de esforço.** Horas são registradas, mas o progresso é medido pelo que você consegue fazer sozinho: problemas resolvidos sem IA, projetos funcionando, avaliações feitas, conceitos explicados com suas palavras.
3. **Sistema vivo.** O plano muda com as revisões semanais e mensais. O Plano de Evolução é uma hipótese que você ajusta com dados.

## O ciclo

**Planejar → Estudar → Praticar → Desenvolver → Avaliar → Ajustar.**

| Momento | Onde no JARVIS | Tempo |
|---|---|---|
| Todo dia | Painel Inicial (bloco "Hoje"), hábitos, sessões de estudo | 2 min |
| Domingo | Revisões › semanal; backup na Central de Backup | 20 min |
| Último dia do mês | Revisões › mensal: metas × entregas, lacunas, ajuste do plano | 40 min |
| A cada semestre | Reavaliar competências, EF SET, revisar trilhas no Guia Estratégico | 2 h |

## Mapa dos módulos

| Módulo | Para que serve |
|---|---|
| Painel Inicial | Situação acadêmica, o que precisa de atenção, agenda de hoje, próximas entregas (14 dias), evolução acadêmica, técnica, profissional e consistência, metas da semana, marcos, competências prioritárias, projetos |
| Plano de Evolução | 6 fases com marcos e dependências; os 8 semestres da PUC Minas (Coração Eucarístico, noturno) com disciplinas, trilha de matemática e plano complementar |
| Central de Estudos | Materiais, sessões com uso de IA registrado, biblioteca recomendada |
| Competências | Nível atual × desejado, evidências, histórico, avaliações diagnósticas |
| Laboratório de Projetos | Ideias → planejado → em andamento → concluído, com tarefas, melhorias e competências |
| Oportunidades Profissionais | Candidaturas com funil e lacunas, empresas, experiências, preparação para entrevistas |
| Central de Inglês | Avaliações CEFR, vocabulário, prática por habilidade, metas de proficiência |
| Desenvolvimento Pessoal | Hábitos, metas (semana → ano), leitura, reflexões, práticas mensuráveis |
| Oportunidades e Pesquisa | Bolsas, IC, hackathons, eventos, programas, com selo de "confirmado na fonte" |
| Revisões | Ciclo semanal e mensal |
| Relatórios | Evolução mensal/semestral, consistência, independência de IA, metas, aprendizagem |
| Guia Estratégico | Estes documentos |
| Central de Backup | Exportação (JSON com selo de integridade e CSV), importação com prévia, pontos de restauração, histórico, verificação de integridade |
| Configurações | Rotina (mínima/normal/férias), cenário de trabalho (sem estágio, 20 h, 30 h), perfil, tema |

**Busca global:** `Ctrl+K` ou `/` encontra competências, projetos, disciplinas, candidaturas, metas, materiais e documentos. `?` mostra os atalhos.

## Como os módulos conversam

- **Concluir um projeto** abre o registro de competências desenvolvidas: evidência + nível novo (com histórico).
- **Concluir um curso** registra a data e pede uma evidência prática. Certificado sozinho não sobe nível.
- **Uma vaga** pode listar competências exigidas; as que estão abaixo do desejado ou não avaliadas aparecem como lacuna, com botão para criar uma atividade.
- **Competência abaixo do alvo** tem botão "Criar atividade".
- **Avaliação diagnóstica** atualiza os níveis com histórico.
- **Sessões de estudo** alimentam horas, consistência e o indicador de independência de IA.

## Seus dados

Os dados ficam **somente neste navegador**, no dispositivo em que você usa o JARVIS. Não há servidor, conta ou sincronização.

- Faça **backup toda semana** na Central de Backup e guarde o arquivo em um lugar seu.
- Antes de importar, restaurar, apagar dados ou atualizar a versão, o JARVIS cria um **ponto de restauração** automático (no IndexedDB do navegador, separado dos dados). Ele protege contra erros de operação, mas não contra limpar os dados do navegador: por isso o arquivo de backup continua essencial.
- Atualizações de versão só acrescentam registros ou ajustam os que você não editou. Nada é apagado.
- Por compatibilidade, os dados continuam guardados na chave `careeros:v1`, a mesma da época do CAREER OS.

## Classificação das informações

- **[oficial]**: veio de página oficial, com data de consulta;
- **[mercado]**: requisito frequente em vagas, sem ser regra oficial;
- **[recomendação]**: orientação deste plano;
- **[estimativa]**: número de pesquisa salarial ou de mercado, com fonte;
- **[hipótese]**: algo que ainda precisa ser verificado por você.

## Limitações conhecidas

- A grade da PUC Minas (Coração Eucarístico, noturno) foi consultada na página oficial da PUC Minas em 21/11/2026 e está **pendente de confirmação** com a documentação da matrícula de 2027. Até lá, é uma referência provisória; a confirmação é feita em Plano de Evolução › Semestres.
- Não há assistente de IA nem integrações externas (Google Calendar, GitHub) ainda. Elas estão planejadas, com as decisões necessárias, em "Evolução do JARVIS: arquitetura e fases".
- Os repositórios dos projetos acadêmicos menores não foram analisados em profundidade; só o ExplAIner e o Portfólio.
- Salários no exterior não têm números: sem fonte consultada, preferimos não inventar. Use Levels.fyi.
