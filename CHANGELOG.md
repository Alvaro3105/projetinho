# Registro de mudanças

Mudanças importantes do JARVIS (antigo CAREER OS). Datas em DD/MM/AAAA.

## 24/11/2026 — Redesign completo da interface

- **Conceito "instrumento de bordo pessoal":** obsidiana como base, ciano como luz do sistema, azul para ações, âmbar só para "agora" e atenção. Geist e Geist Mono. Tema claro "Gelo". Contraste AA medido nos dois temas.
- **Núcleo do JARVIS** no Painel: anéis concêntricos com rotação ambiente lenta e três arcos com dados reais (consistência em 28 dias, metas da semana cumpridas, avaliações diagnósticas). Sem dados, o arco aparece tracejado. Não simula estados de IA.
- **Dois modos:** Assistente (núcleo, busca, ações rápidas, prioridades, acesso aos módulos) e Produtividade (painel detalhado). Troca no topo, no menu de perfil ou em Configurações.
- **Novo símbolo** (órbita aberta), favicon e abertura com anéis que se desenham.
- **Shell:** barra lateral recolhível com dicas, cabeçalho com busca, seletor de modo, notificações (geradas só dos seus registros) e menu de perfil.
- **Módulos:** faixas de indicadores no lugar de cartões repetidos; escada CEFR (Inglês); ciclo visual (Revisões); selo de integridade (Backup); quadro com faixas por etapa (Projetos); fase atual destacada (Plano de Evolução); Aparência em Configurações (tema, modo, menu, reduzir animações).
- **Animações:** entrada de módulo, linha sob o título, abas, modais, gráficos e progresso. Todas desligam com "reduzir movimento" (sistema ou Configurações).
- **Correções:** o foco não se perde mais ao trocar modo ou filtros (chips com id estável); marcos do Plano de Evolução empilham no celular.
- **Dados:** mesma chave `careeros:v1`; as novas preferências são campos opcionais em `settings`. Nenhum dado é alterado.

## 24/11/2026 — Painel Inicial revisado com a skill design-autoral

- Régua das 6 fases da trajetória na saudação, com a posição atual (substitui a linha decorativa).
- "Hoje" e "Precisa da sua atenção" no topo; indicadores em uma faixa única com divisórias;
  blocos de consulta sem sombra, para dar hierarquia; rótulo de marca repetido removido.
- Correção: a classe da régua colidia com a linha do tempo do Plano de Evolução (renomeada).

## 24/11/2026 — JARVIS, Fase 1: identidade e consolidação

- **Novo nome:** CAREER OS → JARVIS — Seu Assistente Inteligente Pessoal. Desenvolvido por Álvaro Pires, 2026.
- **Identidade:** símbolo próprio (um "J" em trilha de circuito), favicon, abertura discreta (uma vez por sessão, respeita "reduzir movimento").
- **PT-BR nativo:** módulos com nomes oficiais (Painel Inicial, Plano de Evolução, Central de Estudos, Laboratório de Projetos, Oportunidades Profissionais, Central de Inglês, Oportunidades e Pesquisa, Central de Backup); datas DD/MM/AAAA e horário 24 h.
- **Painel Inicial:** situação acadêmica, "Precisa da sua atenção", agenda de hoje, próximas entregas de todos os módulos, indicador de consistência.
- **Busca global** (`Ctrl+K` ou `/`) e atalhos (`?`).
- **Central de Backup:** JSON com selo SHA-256, CSV, importação com prévia, pontos de restauração automáticos no IndexedDB, histórico de backups, verificação e correção de integridade, confirmação por digitação. Dentro do claude.ai, os arquivos são salvos pela capacidade `downloads`.
- **Proteção na atualização:** ponto de restauração antes de aplicar qualquer atualização de versão; textos antigos atualizados só onde você não havia editado.
- **Correção:** o registro de atualizações aplicadas agora é salvo mesmo quando nenhum dado precisou mudar (antes, a atualização seria reavaliada a cada abertura).
- **Dados:** continuam na chave `careeros:v1`, para não perder nada.
- **Documentação:** `docs/13-evolucao-jarvis.md` com a arquitetura e as Fases 2–5.

## 24/11/2026 — Auditoria geral (CAREER OS)

- Foco do formulário imediato, salvamento duplo de revisões e perfil, foco após redesenho, vírgula decimal, tablet e celular, procedência da matriz, teste de consistência.

## 23–24/11/2026 — Rotinas, matemática e matriz

- Matriz de Engenharia de Software (PUC Minas, Coração Eucarístico, noturno), cenários com e sem estágio, fator de carga do 3º período, trilha de Matemática Discreta e Álgebra Linear, atualizações de plano que preservam seus dados.

## 23/11/2026 — Primeira versão (CAREER OS)

- 13 módulos, planejamento completo em `docs/`, Central de dados local, testes.
