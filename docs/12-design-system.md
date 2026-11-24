# Design system do JARVIS

Versão do redesign de 24/11/2026, com a evolução de efeitos, responsividade e acessibilidade do mesmo dia. Fonte única dos valores: `css/tokens.css`. Os componentes usam só tokens.

## Conceito: "instrumento de bordo pessoal"

A referência é o painel de um assistente pessoal de ficção (HUD), traduzida para uma ferramenta de uso diário, sem copiar nenhuma interface existente e sem aparência de jogo:

- **Obsidiana** como base: fundo quase preto, painéis em camadas de profundidade, linhas finas.
- **Ciano holográfico** é a luz do sistema: estado, foco, dados, item ativo.
- **Azul elétrico** só para ações (botão principal) e gráficos.
- **Âmbar** só para "agora" e atenção: fase atual, hoje, notificações.
- **Detalhes de HUD** (cantos finos, rótulos mono em caixa-alta, grade sutil) só onde há dados. Sem neon, sem brilho em tudo.
- **Gesto principal:** o núcleo do Painel Inicial (anéis concêntricos), que mostra dados reais.

## Identidade

- **Nome:** JARVIS · **Descrição:** Seu Assistente Inteligente Pessoal · **Assinatura:** Desenvolvido por Álvaro Pires · **Criação:** 2026.
- **Símbolo:** uma órbita aberta. O anel externo fino é o contexto; o arco interno, que não se fecha, é a trajetória em andamento; o nó na ponta do arco é o "agora"; o ponto central, a pessoa. Geométrico e abstrato. Fonte do desenho: `js/core/brand.js`; o favicon (`assets/favicon.svg`) usa o mesmo desenho sobre fundo obsidiana.
- **Logotipo:** "JARVIS" em Geist 600, caixa-alta, espaçamento 0,32em.
- **Abertura:** os anéis se desenham, a marca aparece, o nome e o conceito surgem; some em cerca de 2 s. Uma vez por sessão, não bloqueia cliques, é ignorada por leitores de tela e não aparece com "reduzir movimento" (sistema ou Configurações). Não há barra de carregamento falsa.
- **Idioma:** PT-BR nativo. Datas DD/MM/AAAA, horário 24 h, vírgula decimal.

## Cores

| Token | Escuro (padrão) | Gelo (claro) | Uso |
|---|---|---|---|
| `--bg` | #07090C | #F3F5F7 | Fundo |
| `--bg-2` | #0A0E12 | #ECEFF3 | Campos, áreas recuadas |
| `--surface` / `-2` / `-3` | #0E1318 / #131A21 / #19222B | #FFFFFF / #F7F9FB / #EEF2F6 | Painéis, elevados, controles ativos |
| `--border` / `--border-strong` | #1D2731 / #2A3744 | #DDE3EA / #C7D0DB | Linhas |
| `--text` / `-2` / `-3` | #E6EDF3 / #98A6B5 / #768596 | #0B1016 / #4A5563 / #5F6B7A | Texto principal, secundário, metadados |
| `--accent` | #4CD3E8 | #08778B | Luz do sistema: foco, dados, item ativo |
| `--primary` / `--primary-strong` | #3B82F6 / #2F6FE4 | #2563EB / #1F5FD1 | Gráficos / botão principal |
| `--primary-text` | #7EB0FF | #1F5FD1 | Links |
| `--amber` | #F2A93B | #A35E00 | "Agora" e atenção |
| `--success` / `--danger` | #3DD68C / #FF7A7A | #167A47 / #C93535 | Estados |

**Contraste medido (WCAG 2.1, tema escuro, sobre `--surface`):** texto 15,8:1 · texto-2 7,5:1 · texto-3 4,95:1 · ciano 10,5:1 · links 8,5:1 · âmbar 9,4:1 · sucesso 9,9:1 · perigo 7,4:1 · branco sobre o botão principal 4,65:1. No tema Gelo, o ciano foi escurecido para #08778B para passar AA; todos os pares de texto passam AA.

## Tipografia

**Geist** (400, 500, 600, 700) para interface e **Geist Mono** (400, 500) para rótulos de HUD, datas curtas, tags e números de contagem. Fallback: Inter e system-ui.

| Papel | Token | Tamanho |
|---|---|---|
| Saudação | `--fs-2xl` | 32 px, 600, −0,03em |
| Título de página | `--fs-xl` | 24 px, 600 |
| Título de painel | `--fs-lg` | 17 px, 600 |
| Corpo | `--fs-md` | 15 px |
| Auxiliar | `--fs-sm` | 13 px |
| Rótulo HUD (mono, caixa-alta, +0,14em) | `--fs-2xs` | 11 px |
| Indicador (algarismos tabulares) | `--fs-num` | 28 px, 600 |

## Espaço, raio, camadas e movimento

- Espaço em múltiplos de 4 px (`--sp-1` a `--sp-12`). Raios pequenos: 4, 6 e 10 px.
- Camadas (`--z-*`): base, cabeçalho fixo, gaveta, popover, modal, toast, abertura.
- Movimento: curva `--ease` (saída suave), durações de 120, 200, 320 e 600 ms. Com "reduzir movimento" (sistema ou Configurações › Aparência), todas vão a zero e as rotações param.

| Animação | Onde |
|---|---|
| Abertura (anéis se desenhando) | uma vez por sessão |
| Entrada de módulo (fade + 6 px) | troca de página |
| Linha de luz sob o título | cabeçalho de cada página |
| Rotação ambiente lenta (90 s e 140 s) | anéis de marcação do núcleo |
| Arcos se desenhando | arcos de dados do núcleo, barras de progresso, barras dos gráficos |
| Indicador deslizante | aba ativa |
| Escala + fade | modais e popovers |

O núcleo **não** simula estados de IA ("pensando", "ouvindo", "processando").

## Layout

- **Barra lateral** de 256 px, recolhível para 68 px (só ícones, com o nome em dica ao passar o mouse ou focar), agrupada em Visão geral, Desenvolvimento, Acompanhamento e Sistema. Abaixo de 860 px vira gaveta. A preferência fica salva.
- **Cabeçalho** fixo e translúcido: trilha (JARVIS / página), busca global (Ctrl+K), seletor de modo Assistente/Produtividade, notificações, tema e perfil.
- **Conteúdo** com largura máxima de 1360 px. Grades de 3 e 4 colunas caem para 2 no tablet e 1 no celular.

## Modos do Painel Inicial

- **Assistente:** núcleo, saudação, campo de comando (busca em tudo; o texto diz que a IA ainda não está conectada), seis ações rápidas, legenda dos anéis, prioridades de hoje, próximas entregas e acesso rápido aos módulos. O fundo ganha uma grade de HUD muito sutil.
- **Produtividade:** o painel detalhado: régua das 6 fases, hoje, entregas, metas, atenção, marcos, indicadores, horas, atividades, competências, projetos e objetivos.

## Componentes

| Componente | Notas |
|---|---|
| Núcleo (`js/ui/core.js`) | Anéis concêntricos. Arcos de dados: consistência (dias com estudo em 28), metas da semana cumpridas, avaliações diagnósticas feitas. Sem dados, o arco vira trilha tracejada e a legenda diz "sem dados". As 6 fases da trajetória são nós na órbita (atual em âmbar). |
| Painel (`card`) | normal, `elevated`, `flat` e `hud` (cantos finos em ciano, só para painéis com dados) |
| Faixa de indicadores (`statStrip`) | uma superfície com divisórias de 1 px, no lugar de vários cartões iguais |
| Indicador (`stat`) | rótulo mono, valor tabular, nota de origem; "Não avaliado" quando não há dados |
| Progresso | barra fina em gradiente azul → ciano; listrada quando "não avaliado" |
| Botões | primário, secundário, fantasma, perigo; normal e pequeno; ícone |
| Badge | sempre texto + marcador, nunca só cor |
| Alternador segmentado (`.seg`) | modo do Painel |
| Abas | indicador deslizante, setas do teclado |
| Chips | filtros com `aria-pressed` e id estável (o foco volta ao mesmo chip) |
| Popover (`js/ui/popover.js`) | notificações e perfil; Esc, clique fora e foco devolvido |
| Notificações (`js/core/notifications.js`) | atividades atrasadas ou de hoje, entregas em até 3 dias e sinais de atenção, só dos seus registros |
| Dica (`js/ui/tooltip.js`) | flutuante, não é cortada por containers; complementa o `aria-label` |
| Escada CEFR | Central de Inglês: degrau medido (só com avaliação) e meta C1 |
| Ciclo | Revisões: Planejar → Estudar → Praticar → Desenvolver → Avaliar → Ajustar |
| Selo de integridade | Central de Backup: anel + ícone + texto para confere / não confere / ausente |
| Quadro (kanban) | colunas com faixa de cor por etapa |
| Linha do tempo | fase atual com anel tracejado girando devagar |
| Modal, toast, estado vazio, aviso | estado vazio com marcador e texto que diz o próximo passo |
| Gráficos SVG | barras (crescem ao aparecer), barras de alvo, mapa de calor em ciano |

## Acessibilidade

- Contraste AA nos dois temas (valores acima).
- Navegação completa por teclado; "Pular para o conteúdo"; foco visível em ciano; abas com setas; modais e popovers com Esc; foco devolvido ao fechar; o foco não se perde ao trocar modo, tema ou filtros.
- Estrutura semântica: `nav` (com grupos), `main`, `header`; o título da página recebe foco ao trocar de módulo.
- Estados nunca dependem só de cor.
- Núcleo e gráficos com `role="img"` e descrição textual dos valores.
- `prefers-reduced-motion` respeitado, mais a opção "Reduzir animações" em Configurações › Aparência.
- Atalhos de uma tecla (`/`, `?`) não funcionam enquanto se digita.


## JARVIS CORE (núcleo) — camadas e estados

| Camada (de fora para dentro) | O que mostra | Fonte |
|---|---|---|
| Anéis de marcação girando devagar (220 s, 90 s, 140 s) | ambiente, sem significado de dado | decorativo |
| Órbita com nós F1–F6 | as 6 fases da trajetória; atual em âmbar com halo | calendário das fases |
| Arco âmbar fino na órbita | avanço no período da fase atual | data de hoje × início/fim da fase |
| Pontos em órbita | uma sessão registrada nos últimos 7 dias = um ponto (até 14) | Estudos + Inglês |
| Arco ciano | consistência (dias com estudo em 28) | sessões |
| Arco azul | metas da semana cumpridas | metas |
| Arco âmbar | avaliações diagnósticas feitas | avaliações |
| Disco interno com brilho que "respira" (7 s) | ambiente | decorativo |

**Estados** (atributos `data-state` e `data-event` em `.core`), calculados por comparação com o último retrato dos seus registros nesta sessão do navegador:

| Estado | Quando | Visual |
|---|---|---|
| Normal | há dados | anéis em cor plena |
| Sem dados (`vazio`) | nenhum arco com valor e nenhuma sessão | cores mais apagadas, rotação mais lenta, "Aguardando os primeiros registros" |
| Atualização (`atualizado`) | qualquer contagem mudou | onda circular ciano |
| Progresso registrado (`progresso`) | sessão nova ou atividade concluída | onda + arco de consistência acende + ponto novo entra na órbita |
| Meta concluída (`meta`) | uma meta passou a "cumprida" | onda verde + arco de metas acende |
| Nova atividade (`atividade`) | atividade criada | onda azul |

Cada mudança mostra um rótulo curto sob o núcleo ("Meta concluída"). Os arcos fazem transição do valor anterior para o novo. Nada é simulado: não há "pensando", "ouvindo" nem "processando".

## Efeitos e microinterações

| Efeito | Onde | Desliga com |
|---|---|---|
| Vidro (blur) | cabeçalho, navegação inferior, fundo de modais | Efeitos essenciais |
| Luz que segue o ponteiro (`.spot`) | painel do núcleo, campo de comando, ações rápidas, módulos | Efeitos essenciais; só com mouse |
| Bordas luminosas | topo de modais, faixa de indicadores, divisor da faixa técnica | — (estático) |
| Atmosfera | textura fina, pontos de luz, grade de HUD com borda esmaecida (Assistente) | Efeitos essenciais |
| Entrada de módulo | conteúdo, linha do título, barras, arcos e gráficos | Reduzir animações |
| Transição de valores | barras de progresso e arcos vão do valor anterior ao novo | Reduzir animações |
| Conclusão | marcador "salta", anel verde, linha riscada antes de sair da lista | Reduzir animações |
| Modal | entrada com escala; saída em 150 ms | Reduzir animações |
| Toast | entra deslizando, linha de tempo restante, sai animado; clique fecha | Reduzir animações |
| Troca de tema | revelação circular a partir do ponto clicado (View Transitions) | Reduzir animações / Efeitos essenciais |
| Estado de gravação | ponto verde "Salvo · HH:MM" pulsa a cada gravação; âmbar "Não salvo" | — |
| Carregando | linhas com brilho correndo (Guia) | Reduzir animações |
| Sons (opcionais) | concluir, salvar, erro; Web Audio, volume baixo | desligados por padrão |

**Desempenho:** animações contínuas usam só `transform` e `opacity`; a luz do ponteiro atualiza duas variáveis CSS uma vez por quadro; o relógio é um único intervalo para a página inteira; listeners globais são instalados uma vez (teste confirma que abrir/fechar busca, perfil e navegar não acumula listeners). Entradas animadas só tocam ao abrir um módulo, nunca a cada mudança de dado.

## Responsividade

| Faixa | Composição |
|---|---|
| ≤ 600 px (celular) | gaveta completa + **navegação inferior** (Painel, Estudos, Buscar, Plano, Menu) para uso com uma mão; abas e filtros em uma linha com rolagem; listas com ações abaixo do texto; núcleo depois da saudação |
| 601–900 px (tablet em pé) | **trilho de ícones** fixo (dica com o nome); Painel com saudação e ações na largura toda e núcleo ao lado da legenda |
| 901–1180 px (tablet deitado, notebook compacto) | trilho de ícones; núcleo e conteúdo lado a lado |
| 1181–1799 px | barra lateral completa (recolhível); conteúdo até 1360 px |
| ≥ 1800 px (Full HD largo, ultrawide) | conteúdo centralizado até 1480 px; painel do núcleo com colunas limitadas |
| Toque (`pointer: coarse`) | botões ≥ 44 px, marcadores 28 px, campos com 16 px (sem zoom no iOS) |

## Acessibilidade (WCAG 2.2 AA)

- axe-core sem violações em 14 módulos × 2 temas × 3 tamanhos (ver `docs/14-relatorio-de-testes.md`).
- Alvos ≥ 24 px (2.5.8): marcadores de conclusão 24 px (28 px no toque); botão de menu não encolhe.
- Tabelas, quadros e mapas com rolagem lateral recebem foco pelo teclado.
- Gaveta (celular/tablet): Esc fecha, foco volta ao botão, o resto da tela fica inerte enquanto ela está aberta.
- Erros em toasts são anunciados como alerta; a faixa técnica tem separadores para leitura em voz.
- Âmbar do tema Gelo escurecido para #8A4F00 (contraste ≥ 4,5:1 em badges e contadores).
