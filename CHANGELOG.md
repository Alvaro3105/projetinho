# Registro de mudanças

Mudanças importantes do JARVIS (antigo CAREER OS). Datas em DD/MM/AAAA.

## 24/11/2026 — Evolução: núcleo, efeitos, responsividade e auditoria geral

**Correções (classificadas por severidade)**
- **Crítico:** com os dados salvos ilegíveis, a primeira interação (abrir notificações, trocar modo, criar algo) gravava por cima do conteúdo original, apesar do aviso "nada foi sobrescrito". Agora nada é gravado até você importar, restaurar ou recomeçar, e uma cópia exata fica em `careeros:v1:ilegivel`.
- **Médio:** "Último backup" aparecia como "Há -1 dia(s)" para backups feitos à noite (data em UTC). Datas de instantes agora usam o fuso do navegador; textos "Hoje", "Ontem", "Há N dias".
- **Médio:** o quadro de projetos tinha 5 etapas e só 4 colunas ("Pausado" caía para outra linha): variáveis CSS passadas em `style` não eram aplicadas por `h()`.
- **Médio:** perfil vazio mostrava "Álvaro" na saudação e COTEMIG/PUC na situação acadêmica (textos fixos). Agora tudo vem do perfil e dos semestres; sem semestres, a aba mostra um estado vazio.
- **Médio:** animações de entrada (barras, gráficos, linha do título) repetiam a cada mudança de dado, fazendo a tela "piscar". Agora só ao abrir o módulo; nas mudanças, os valores fazem transição.
- **Médio:** em 320 px, o nome de cada competência ficava espremido em ~13 px de largura.
- **Médio:** o botão ☰ aparecia no desktop sem função e o "Recolher menu" aparecia no celular (cascata do CSS).
- **Médio (acessibilidade):** contraste insuficiente no rodapé da barra lateral (3,4:1) e no âmbar do tema claro (3,9:1); tabelas com rolagem lateral sem foco pelo teclado; marcadores de conclusão com 20 px.
- **Baixo:** legendas de gráficos com cores diferentes das barras (mapa de calor e Competências); dica do mapa de calor em AAAA-MM-DD; barras sem alvo geravam `NaN` no SVG; faixa técnica lida sem separadores pelo leitor de tela.

**Novo**
- **JARVIS CORE:** camadas com profundidade, nós das fases com rótulos F1–F6, avanço na fase atual, pontos em órbita (sessões dos últimos 7 dias), arcos com brilho e ponta luminosa, pulsação ambiente e estados visuais a partir dos seus registros: sem dados, atualização, progresso registrado, meta concluída, nova atividade.
- **Painel Assistente** recomposto: faixa técnica (data, hora 24 h, fase, origem dos dados), núcleo à esquerda, legenda ao lado das ações.
- **Efeitos:** vidro, luz que segue o ponteiro, bordas luminosas, atmosfera (textura, pontos de luz, grade com borda esmaecida), transição de tema com revelação circular, conclusão animada, toasts com tempo restante, modais com saída animada, estado "Salvo · HH:MM", carregamento do Guia.
- **Configurações › Aparência:** "Efeitos visuais" (completos/essenciais) e "Sons" (desligados por padrão; só tocam depois de uma ação sua).
- **Responsividade:** navegação inferior no celular, trilho de ícones em tablets e notebooks compactos, composição própria do Painel no tablet, conteúdo centralizado em telas largas, abas e filtros com rolagem no celular, alvos maiores em telas de toque.
- **Dados de exemplo × reais:** instalações novas avisam que começaram com o plano do autor, com "É o meu plano", "Editar perfil" e "Começar do zero".
- **Testes:** `tests/evolucao.test.js` (dados ilegíveis, fuso, estados do núcleo); relatório em `docs/14-relatorio-de-testes.md`.

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
