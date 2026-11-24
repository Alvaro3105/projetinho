---
name: design-autoral
description: Design autoral, sem "cara de IA". Use SEMPRE que for criar ou alterar qualquer interface, tela, página, componente, landing page, dashboard, artifact, slide ou visual do JARVIS ou de outro projeto do Álvaro. Também quando o usuário disser "deixa mais bonito", "melhora o visual", "parece genérico", "parece feito por IA" ou pedir revisão de design. Traz a lista de clichês visuais de IA a evitar, o processo para decidir o design a partir do assunto e um checklist final obrigatório.
---

# Design autoral: interfaces que não parecem geradas por IA

Interfaces "com cara de IA" não são feias. Elas são **genéricas**: decisões padrão empilhadas sem motivo, que serviriam para qualquer produto. O antídoto é decidir cada escolha a partir do assunto real, com conteúdo real, e ter coragem de cortar.

**Ordem de prioridade:** (1) o que o usuário pediu explicitamente; (2) o design system do projeto, que no JARVIS é `docs/12-design-system.md` com os tokens em `css/tokens.css`; (3) esta skill. Esta skill nunca sobrepõe uma escolha explícita do usuário.

## 1. Clichês proibidos (a menos que o usuário peça)

**Cor e efeitos**
- Gradiente roxo → azul ou rosa → laranja em hero, botões ou títulos.
- Texto com gradiente (`background-clip: text`).
- Glassmorphism (vidro fosco com blur) em tudo.
- Brilho neon, `box-shadow` colorido e "glow" em cards e botões.
- Blobs, esferas 3D e formas orgânicas desfocadas de fundo, sem função.
- Fundo creme com serifada e detalhe terracota; preto com um único verde-limão. São os "estilos sofisticados" mais repetidos.

**Layout**
- Tudo centralizado, todas as seções com a mesma estrutura.
- Hero gigante de 100vh com título, subtítulo e dois botões ("Começar" / "Saiba mais").
- Grade de três cards idênticos, cada um com ícone num círculo colorido, título e duas linhas.
- `rounded-2xl` com sombra em todo bloco, inclusive em quem não é objeto separado.
- Barra colorida na lateral esquerda de todos os cards.
- Seções numeradas "01 / 02 / 03" quando a ordem não significa nada.

**Conteúdo e texto**
- Emoji como marcador de seção (🚀 ✨ 💡 🎯).
- Frases vazias: "Desbloqueie seu potencial", "Leve sua carreira ao próximo nível", "Tudo o que você precisa em um só lugar", "Revolucione...".
- Números inventados ("+10.000 usuários", "98% de satisfação"), depoimentos falsos e lorem ipsum.
- Rótulos genéricos ("Recurso 1", "Título do card") ou excesso de badges ("Novo!", "Pro", "Beta" em tudo).
- Travessões e frases de efeito em todo parágrafo.

**Tipografia**
- Uma fonte só, no mesmo peso, com títulos pouco maiores que o corpo.
- Tudo em caixa alta ou tudo em negrito.

## 2. Processo (siga antes de escrever código)

1. **Defina o assunto em uma frase:** o que é, para quem, qual é a única tarefa principal da tela. Exemplo: "o Painel Inicial mostra ao Álvaro, em 10 segundos, o que precisa da atenção dele hoje".
2. **Liste o vocabulário do assunto:** unidades reais, termos do domínio, documentos que existem nesse mundo. Para o JARVIS: períodos, cargas horárias, CEFR, níveis de competência, prazos DD/MM, nomes de disciplinas. Pelo menos um detalhe que **só esse assunto teria** deve aparecer como conteúdo, não como enfeite.
3. **Escolha a hierarquia pela tarefa:** o que é lido primeiro, o que é escaneado, o que é ação. Resumo antes do detalhe. O estado que exige atenção deve ser visível de relance (forma + texto, não só cor).
4. **Decida um único gesto ousado** (um tratamento tipográfico, uma visualização, uma composição) e deixe o resto quieto. Ousadia espalhada vira ruído.
5. **Escreva os tokens antes:** cores (4–6, com neutros levemente puxados para a cor de destaque, nunca cinza puro sem intenção), escala tipográfica com pesos distintos, espaçamento em múltiplos de 4.
6. **Use conteúdo real** desde o primeiro rascunho. Quando não houver dado, use um estado vazio que explique o que vai aparecer e como começar, nunca números fictícios.

## 3. Regras de composição

- **Cartão só para objetos separados.** Borda, fundo e sombra marcam "isto é uma coisa à parte". Listas, textos e grupos relacionados usam espaçamento e divisórias.
- **Assimetria com propósito:** colunas de pesos diferentes (2:1), alinhamento à esquerda para leitura, centralização só para momentos únicos.
- **Densidade adequada:** ferramentas de uso diário podem e devem ser mais densas que landing pages. Menos espaço vazio decorativo, mais informação útil por tela.
- **Tipografia como estrutura:** pelo menos três níveis claros (título, subtítulo, corpo) com diferença real de tamanho e peso; rótulos pequenos em caixa alta com espaçamento; algarismos tabulares em números alinhados.
- **Ícones discretos:** traço fino e uma cor; ícone acompanha texto, não substitui. Nada de ícone dentro de círculo colorido em toda lista.
- **Movimento com função:** transição para mudança de estado (abrir, concluir, carregar). Uma animação memorável no máximo. Sempre respeitar `prefers-reduced-motion`.
- **Gráficos honestos:** escala correta, rótulos com valores reais, cor da série vinda dos tokens; sem gráfico decorativo.

## 4. Texto da interface

- Escreva como uma pessoa competente falaria. Nomeie as coisas pelo que o usuário reconhece ("Exportar backup", não "Gerenciar persistência").
- Botões dizem exatamente o que acontece ("Salvar revisão"); a confirmação diz o que aconteceu ("Revisão salva").
- Erros explicam o problema e como resolver, sem pedir desculpas.
- Específico vence esperto: "10 avaliações pendentes" é melhor que "Continue sua jornada!".
- No JARVIS: PT-BR nativo, DD/MM/AAAA, 24 h, vírgula decimal.

## 5. Checklist final (obrigatório antes de entregar)

Responda mentalmente a cada item. Qualquer "sim" nos três primeiros grupos exige correção.

- [ ] Alguma coisa da lista de clichês (seção 1) apareceu sem pedido explícito?
- [ ] Trocando o nome do produto, essa tela serviria para qualquer outro app? (Se sim, falta o vocabulário do assunto.)
- [ ] Há número, depoimento, logo de cliente ou dado inventado?
- [ ] Todos os blocos têm o mesmo raio, sombra e estrutura? (Se sim, falta hierarquia.)
- [ ] A tarefa principal da tela é identificável em 5 segundos?
- [ ] O estado que exige atenção aparece com forma e texto, não só cor?
- [ ] Contraste AA nos dois temas, foco visível, navegação por teclado?
- [ ] Funciona em 360 px sem rolagem horizontal?
- [ ] O texto soa humano e específico (sem frases de efeito nem travessões em excesso)?
- [ ] Existe exatamente um gesto ousado, e o resto é contido?

Se algo não passar, corrija antes de mostrar. Ao entregar, explique em uma ou duas frases a direção escolhida e por quê. Não liste valores hexadecimais nem nomes de fontes, a menos que o usuário pergunte.
