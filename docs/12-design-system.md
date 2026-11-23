# Design system do CAREER OS

## Identidade

- **Nome:** CAREER OS · **Subtítulo:** Personal Academic & Career Development System · **Assinatura:** By Álvaro Pires.
- **Conceito:** trajetória. A marca é um quadrado arredondado azul-petróleo com uma linha ascendente em degraus (azul → ciano) que termina em um ponto ciano: o próximo marco. A mesma linha pontilhada aparece na saudação do Dashboard como "rota" até o objetivo.
- **Logotipo tipográfico:** "CAREER OS" em Inter 750, caixa alta, espaçamento 0,14em; "OS" em ciano. O monograma AP fica reservado para usos pessoais (avatar, favicon alternativo).
- **Coerência com o portfólio:** o portfólio usa fundo quase preto, Inter, Space Grotesk, JetBrains Mono, azul e roxo. O CAREER OS mantém Inter e JetBrains Mono e o fundo escuro, e troca o roxo pelo azul-marinho dominante que você pediu.

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

Sidebar fixa de 248 px (vira gaveta abaixo de 860 px) + cabeçalho fixo com trilha de navegação, atalho para a revisão semanal e alternância de tema + conteúdo com largura máxima de 1320 px. Grades de 2, 3 e 4 colunas que caem para 1 coluna no celular. Espaçamento em múltiplos de 4 px.

## Componentes

Card (normal, elevado, plano) · indicador (rótulo, valor, nota de origem) · barra de progresso (com padrão listrado para "não avaliado") · botões (primário, secundário, fantasma, perigo; tamanhos normal e pequeno) · badge de estado (sempre com texto e marcador, nunca só cor) · tag mono · escala de nível em 5 segmentos com marca do nível desejado · abas com navegação por setas · filtros em chips · lista com ações · tabela com rolagem própria · modal com foco preso · confirmação dentro da página · toast · linha do tempo de fases · quadro kanban · gráficos SVG (barras, barras de alvo, mapa de calor).

## Acessibilidade

- Contraste AA nos dois temas (medido: texto secundário #A8B8CC sobre card #12243A = 7,8:1; botão principal branco sobre #2563EB = 5,2:1; links #8AB4FF sobre o fundo = 8,8:1).
- Navegação completa por teclado; link "Pular para o conteúdo"; foco visível em ciano; abas com setas; modais com Esc e foco preso; foco devolvido ao fechar.
- Estrutura semântica: `nav`, `main`, `header`, títulos hierárquicos; o título da página recebe foco ao trocar de módulo.
- Estados nunca dependem só de cor: todo badge tem texto; a escala de nível tem rótulo; barras "não avaliado" têm padrão listrado e texto.
- Gráficos com `role="img"` e descrição textual dos valores.
- `prefers-reduced-motion` respeitado.
- Responsivo de 360 px a telas largas, sem rolagem horizontal da página.
