# Evolução do JARVIS: arquitetura e fases

Documento vivo. Registra a análise da arquitetura, o que cada fase entrega e as decisões que dependem de você. Atualizado em 24/11/2026, ao fim da Fase 1.

## 1. Análise da arquitetura atual

| Aspecto | Situação | Consequência para a evolução |
|---|---|---|
| Aplicação | SPA em JavaScript puro, módulos ES, sem build e sem dependências | Roda em qualquer servidor estático (GitHub Pages, `npm start`) e no artifact do claude.ai. Continua legível para você. |
| Camadas | `core` (estado, esquema, métricas, seed, backup, busca, marca), `ui` (componentes), `views` (uma por tela), `data` (matriz, carreiras, recursos) | Novos módulos entram como novas `views` e novas coleções no esquema, sem reescrever o resto. |
| Armazenamento | `localStorage`, chave `careeros:v1` (mantida de propósito), esquema versionado, normalização na leitura | Limite de ~5 MB por site. Com notas, flashcards e anotações de vários anos, isso pode apertar (ver Fase 5). |
| Proteção dos dados | Atualizações do plano só acrescentam ou ajustam o que você não editou; pontos de restauração no IndexedDB antes de operações de risco; backup JSON com SHA-256 | Toda fase nova segue a mesma regra: migração aditiva, ponto de restauração antes, testes de preservação. |
| Testes | `node:test` (unidade, consistência da matriz, preservação de dados) + auditoria no navegador (Playwright, fora do repositório) | Cada fase acrescenta testes antes de ser publicada. |
| Integrações externas | Nenhuma | Nada finge integração. As opções reais estão nas Fases 4 e 5. |

**Problema estrutural identificado (não resolvido nesta fase, sem risco imediato):** o `localStorage` não comporta anos de anotações e flashcards. A solução proposta (Fase 5) é mover os dados para o IndexedDB com migração verificada por hash e ponto de restauração. Ela só será feita com sua aprovação, porque mexe no lugar onde os dados moram.

## 2. Fase 1 — Identidade e consolidação (concluída)

- CAREER OS → **JARVIS**: símbolo próprio, favicon, abertura discreta, assinatura e descrição oficiais.
- **PT-BR nativo**: nomes oficiais dos módulos, datas DD/MM/AAAA, horário 24 h, vírgula decimal.
- **Painel Inicial** revisado: situação acadêmica, "Precisa da sua atenção", agenda de hoje, próximas entregas (14 dias), consistência.
- **Navegação**: busca global (`Ctrl+K` ou `/`), atalhos (`?`), barra lateral agrupada.
- **Central de Backup**: JSON com selo SHA-256, CSV por tipo de dado, importação com prévia e conferência do selo, pontos de restauração automáticos, histórico, verificação e correção de integridade, confirmação por digitação nas operações irreversíveis.
- Dentro do claude.ai, o backup é salvo com a capacidade `downloads` (com confirmação sua). Fora dele, usa o download do navegador.
- Textos antigos dos seus dados ("Skill Tracker", "CAREER OS"...) atualizados só onde você não tinha editado.

## 3. Fase 2 — Organização e produtividade (próxima)

| Entrega | Como | Dados novos (aditivos) |
|---|---|---|
| Temporizador de foco | Duração configurável, pausa, registro automático como sessão de estudo ligada a disciplina, competência ou projeto | usa `studyLogs` (campos novos opcionais: `focus`, `disciplineId`) |
| Flashcards com revisão espaçada | Algoritmo SM-2 simplificado e documentado: intervalo cresce com acertos e encolhe com erros; você ajusta os fatores | `flashcards` (frente, verso, assunto, ease, intervalo, próxima revisão, histórico) |
| Explicações com suas palavras | Registro "expliquei X assim", ligado a competência; conta como evidência | `explanations` |
| Gestão Acadêmica | Disciplinas da matriz → avaliações, pesos, notas, frequência, entregas, bibliografia | `courses`/`gradeItems` ligados aos semestres existentes |
| Simulador de desempenho | Você informa a regra real de cada disciplina (média mínima, pesos, frequência); o JARVIS calcula a nota necessária nas avaliações restantes. Nenhuma regra é assumida. | campos de critério por disciplina |
| Oportunidades Profissionais em Kanban | Etapas configuráveis (Vaga encontrada → … → Encerrado), contatos, remuneração divulgada, próxima ação | campos novos em `applications`; migração mapeia os status atuais para as etapas novas, sem perder histórico |

## 4. Fase 3 — Desenvolvimento técnico

- **Preparação para Big Techs**: registro de problemas (plataforma, categoria, dificuldade, tempo, tentativas, ajuda usada, consegue explicar?), com indicadores de autonomia, não só de quantidade.
- **Laboratório de Projetos**: escopo, arquitetura, testes, segurança, deploy e checklist de maturidade (avaliação interna, sem valor de certificação).
- **Base de Conhecimento**: resumos, conceitos, referências e artigos, ligados a disciplina, competência e projeto.
- **Central de Inglês**: flashcards de vocabulário (reaproveitando a Fase 2) e roteiros de entrevista em inglês para praticar.
- **Laboratório de entrevistas (sem IA)**: bancos de perguntas, registro das suas respostas, autoavaliação com critérios explícitos (clareza, organização, raciocínio, justificativa).

## 5. Fase 4 — Inteligência artificial (decisão sua necessária)

O assistente só existirá quando houver um modelo de verdade por trás. As duas opções reais:

| | Opção A — capacidade `sample` do claude.ai | Opção B — backend próprio |
|---|---|---|
| Onde funciona | Só no JARVIS aberto como artifact no claude.ai | Em qualquer lugar (GitHub Pages, seu computador) |
| Chave de API | Nenhuma na página: o claude.ai intermedia | Fica no servidor, nunca no navegador |
| Custo | Usa o seu plano do claude.ai | Cobrança por uso da API; exige limite de gastos |
| Contexto dos seus dados | A página envia só o necessário; o modelo pode chamar funções da página (ferramentas) para consultar metas, competências, notas | O backend recebe o contexto da página; mesma lógica de ferramentas |
| Consentimento | Você autoriza na primeira chamada | Você controla o servidor |
| Esforço | Baixo | Alto, mas é um ótimo projeto de portfólio: o Projeto #1 (API FastAPI) pode ser esse backend |

**Regras do assistente, qualquer que seja a opção:** responder em PT-BR; separar "dados registrados" de "recomendação"; dizer "não avaliado" quando faltar dado; nunca inventar vagas, requisitos ou progresso; citar fonte e data quando usar informação externa.

**Análise de lacunas (Career Gap Analysis):** compara suas competências com requisitos de **vagas que você cadastrou** (link e data de consulta). Pesquisa automática de vagas na web não está disponível na página; quando houver, cada requisito virá com link e data, e nunca será tratado como regra universal de uma profissão.

## 6. Fase 5 — Ecossistema

| Integração | Caminho real | Limitações |
|---|---|---|
| Google Calendar | (1) No claude.ai: capacidade `mcp` com o seu conector do Google Calendar, usando suas credenciais e com sua autorização. (2) Em qualquer lugar: exportação `.ics` de provas, entregas e entrevistas, para importar na agenda. | (1) só no claude.ai e só se o conector estiver conectado; (2) é exportação, não sincronização contínua. |
| GitHub | (1) No claude.ai: conector do GitHub via `mcp`. (2) Fora dele: API pública do GitHub para repositórios públicos (sem token, com limite de requisições). | Repositórios privados exigem autorização. |
| Plataformas de cursos | Links e registro manual. Não há API pública confiável e gratuita das principais plataformas para progresso de cursos. | — |
| Sincronização entre dispositivos | (1) Capacidade `db` do claude.ai com dados em área privada por pessoa; (2) backend próprio (mesmo da Fase 4B). | Exige decidir onde seus dados ficam guardados. |
| Armazenamento maior | Migrar de `localStorage` para IndexedDB com verificação por hash. | Só com sua aprovação explícita. |

## 7. Decisões que dependem de você

1. **Fase 4:** Opção A (claude.ai), B (backend próprio) ou as duas.
2. **Fase 5:** onde os dados devem morar para sincronizar (somente no navegador, no claude.ai ou em um servidor seu).
3. **Fase 5:** autorizar a migração para IndexedDB quando o volume de dados justificar.
