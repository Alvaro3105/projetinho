# Relatório de testes da interface

Execução de 24/11/2026, depois da evolução de núcleo, efeitos, responsividade e auditoria geral. Todos os testes usaram **dados fictícios** em navegador isolado (Chromium via Playwright) ou armazenamento em memória. Nenhum dado real foi usado.

## Resumo

| Bateria | O que cobre | Resultado |
|---|---|---|
| Testes unitários (`npm test`) | store, backup e selo SHA-256, CSV, migração, atualizações de plano, busca, notificações, preferências, **dados ilegíveis**, **fuso do último backup**, **estados do núcleo** | **39/39** |
| Auditoria funcional no navegador | navegação, voltar/avançar, busca, atalhos, abas por setas, criação em 17 coleções, editar, excluir, cancelar exclusão, históricos, gráficos (valores conferidos), exportar/importar, selo adulterado, persistência após reabrir, dado corrompido, rotinas, 6 tamanhos de tela, erros de console | **80/80** |
| Fluxos de uso | formulários e validação, sessão, nível com evidência, projeto concluído, lacunas de vaga, Guia, Esc, importação, revisão, XSS, relatórios, modo Assistente e Produtividade | **18/18** (3 execuções seguidas) |
| Preservação de dados na atualização | estados de versões antigas (CAREER OS) abertos na versão atual | **15/15** |
| Estados do núcleo | sem dados, progresso, meta, atividade, recarregar sem evento, arco até o valor, conclusão animada | **9/9** |
| Extras | navegação inferior, gaveta (Esc, inerte, foco), trilho no tablet com dicas, sons desligados por padrão e só após ação, efeitos essenciais, reduzir movimento, troca de tema sem alterar dados, data DD/MM/AAAA e hora 24 h com locale pt-BR | **24/24** |
| Reprodução dos bugs encontrados | dados ilegíveis, fuso, quadro de projetos, perfil vazio, acúmulo de listeners | **6/6 corrigidos** |

## Varredura de responsividade e acessibilidade

300 telas: 14 módulos (Painel nos dois modos) × 10 resoluções × 2 temas (escuro e Gelo). axe-core 4.10 (regras WCAG 2.0/2.1/2.2 A e AA) em 1440×900, 768×1024 e 390×844.

| Medida | Antes | Depois |
|---|---|---|
| Erros de JavaScript | 0 | 0 |
| Telas com rolagem horizontal | 0 | 0 |
| Violações axe (contraste, região rolável sem foco) | 139 | **0** |
| Ocorrências de alvos < 24 px | 790 | **0** (conferido de novo em 320–768 px depois do último ajuste) |

Resoluções: 320×568, 360×800, 390×844, 430×932, 768×1024, 1024×768, 1366×768, 1440×900, 1920×1080, 2560×1080.

## Problemas encontrados e corrigidos

| Severidade | Problema | Situação |
|---|---|---|
| Crítico | Dados salvos ilegíveis eram sobrescritos na primeira interação | Corrigido + teste |
| Médio | "Há -1 dia(s)" para backup feito à noite (UTC) | Corrigido + teste |
| Médio | Quadro de projetos com 4 colunas para 5 etapas | Corrigido |
| Médio | Nome e instituições fixos no Painel | Corrigido (vem do perfil) |
| Médio | Animações de entrada repetindo a cada mudança | Corrigido |
| Médio | Títulos de competências espremidos em 320 px | Corrigido |
| Médio | Botão de menu visível no desktop; "Recolher" no celular | Corrigido |
| Médio | Contraste, foco em regiões roláveis, alvos pequenos | Corrigido (axe 0) |
| Baixo | Legendas e datas de gráficos; NaN em barras sem alvo; faixa técnica sem separadores para leitor de tela | Corrigido |

## Limitações conhecidas

- **Fases da trajetória** (F1–F6) continuam fixas no código, com as datas do plano de exemplo. Para outra pessoa usar fases próprias, seria preciso uma funcionalidade nova (fora do escopo desta etapa).
- **Campos de data** nativos seguem o idioma do sistema operacional. Em sistemas em português aparecem como DD/MM/AAAA; em sistemas em inglês, como MM/DD/AAAA.
- **Transição de tema** com revelação circular só existe em navegadores com View Transitions (Chrome, Edge, Safari recentes); nos demais, a troca é imediata.
- **Colar um backup muito grande** (130 KB) é instantâneo com Ctrl+V. Só a digitação simulada por automação (`insertText`) é lenta, por limitação do navegador.
- Não houve teste em aparelhos físicos nem com leitores de tela reais (NVDA, VoiceOver); a verificação foi por automação e por regras do axe.
