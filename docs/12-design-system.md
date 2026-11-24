# Design system do JARVIS

## Identidade

- **Nome:** JARVIS · **Descrição:** Seu Assistente Inteligente Pessoal · **Assinatura:** Desenvolvido por Álvaro Pires · **Criação:** 2026.
- **Conceito:** Conhecimento. Evolução. Carreira. Futuro. Um assistente que conhece seus objetivos, acompanha sua evolução com evidências e ajuda a decidir, sem inventar dados.
- **Símbolo:** um "J" desenhado como trilha de circuito, dentro de um quadrado arredondado azul-petróleo. O traço principal vai do azul (#2563EB) ao ciano (#38BDF8); o nó ciano no topo representa a inteligência, e o traço superior, mais fraco, uma conexão. É geométrico e abstrato, sem referência a personagens, franquias ou interfaces existentes. Fonte única do desenho: `js/core/brand.js` (também usado no favicon `assets/favicon.svg`).
- **Logotipo tipográfico:** "JARVIS" em Inter 750, caixa alta, espaçamento 0,22em, ao lado do símbolo; a descrição aparece abaixo, em texto auxiliar.
- **Animação de inicialização:** o símbolo se desenha, o nome e o conceito aparecem e a tela some em cerca de 1,5 s. Acontece uma vez por sessão, nunca bloqueia cliques, é ignorada por leitores de tela e não aparece para quem ativou "reduzir movimento" no sistema.
- **Coerência com o portfólio:** o portfólio usa fundo quase preto, Inter, Space Grotesk, JetBrains Mono, azul e roxo. O JARVIS mantém Inter e JetBrains Mono e o fundo escuro, e troca o roxo pelo azul-marinho dominante.
- **Idioma:** PT-BR nativo. Datas DD/MM/AAAA, horário 24 h, vírgula decimal, moeda R$. Termos técnicos consagrados (Backend, Machine Learning, Deploy, System Design) ficam em inglês.

## Cores (tokens em `css/tokens.css`)

| Token | Escuro (padrão) | Claro | Uso |
|---|---|---|---|
| `--bg` | #081426 | #F2F5FA | Fundo principal |
| `--bg-2` | #0D1B2E | #E8EEF6 | Campos, áreas recuadas |
| `--surface` | #12243A | #FFFFFF | Cards |
| `--surface-2` | #172D47 | #F6F8FC | Cards elevados, botões secundários |
| `--border` | #263B55 | #D6DFEB | Bordas |
| `--primary` | #3478F6 | #2563EB | Gráficos, foco de marca |
| `--primary-strong` | #2563EB | #1D4ED8 | Botão principal (texto branco com contraste AA) |
| `--primary-text` | #8AB4FF | #1D4ED8 | Links e texto azul sobre fundo escuro (o #3478F6 puro fica no limite, 4,5:1, no fundo marinho) |
| `--accent` | #38BDF8 | #0369A1 | Detalhes interativos, foco, destaque |
| `--text` / `--text-2` | #F1F5F9 / #A8B8CC | #0B1A2E / #44546A | Texto principal / secundário |
| `--success` / `--warning` / `--danger` | #22C55E / #F59E0B / #F87171 | #15803D / #B45309 / #DC2626 | Estados |

A sidebar continua azul-marinho (#0A1729) também no tema claro, para preservar a identidade. Gradientes só em três lugares: saudação, cards de indicadores e barras de progresso. Sem neon.

## Tipografia

Fonte única: **Inter** (400, 500, 600, 700). **JetBrains Mono** só para números de contagem, tags de tecnologia e código.

| Papel | Tamanho | Peso |
|---|---|---|
| Saudação | 28 px | 700 |
| Título de página | 22 px | 650 |
| Título de card | 17 px | 650 |
| Corpo | 15 px | 400 |
| Auxiliar | 13 px | 400 |
| Rótulo (caixa alta, +0,1em) | 12 px | 600 |
| Indicador | 26 px, algarismos tabulares | 700 |

## Layout

Barra lateral fixa de 268 px (vira gaveta abaixo de 860 px), agrupada em Visão geral, Desenvolvimento, Acompanhamento e Sistema + cabeçalho fixo com trilha de navegação, busca global (Ctrl+K), atalho para a revisão semanal e alternância de tema + conteúdo com largura máxima de 1320 px. Grades de 3 e 4 colunas caem para 2 no tablet e para 1 no celular; o quadro de projetos empilha as colunas no celular. Espaçamento em múltiplos de 4 px.

## Componentes

Card (normal, elevado, plano) · indicador (rótulo, valor, nota de origem) · barra de progresso (com padrão listrado para "não avaliado") · botões (primário, secundário, fantasma, perigo; tamanhos normal e pequeno) · badge de estado (sempre com texto e marcador, nunca só cor) · tag mono · escala de nível em 5 segmentos com marca do nível desejado · abas com navegação por setas · filtros em chips · lista com ações · tabela com rolagem própria · modal com foco preso · confirmação dentro da página · confirmação por digitação (operações irreversíveis) · busca global com lista navegável por setas · toast · linha do tempo de fases · quadro kanban · gráficos SVG (barras, barras de alvo, mapa de calor).

## Acessibilidade

- Contraste AA nos dois temas (medido: texto secundário #A8B8CC sobre card #12243A = 7,8:1; botão principal branco sobre #2563EB = 5,2:1; links #8AB4FF sobre o fundo = 8,8:1).
- Navegação completa por teclado; link "Pular para o conteúdo"; foco visível em ciano; abas com setas; modais com Esc e foco preso; foco devolvido ao fechar.
- Estrutura semântica: `nav`, `main`, `header`, títulos hierárquicos; o título da página recebe foco ao trocar de módulo.
- Estados nunca dependem só de cor: todo badge tem texto; a escala de nível tem rótulo; barras "não avaliado" têm padrão listrado e texto.
- Gráficos com `role="img"` e descrição textual dos valores.
- `prefers-reduced-motion` respeitado.
- Responsivo de 360 px a telas largas, sem rolagem horizontal da página.
