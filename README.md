# JARVIS

**Seu Assistente Inteligente Pessoal** — Conhecimento. Evolução. Carreira. Futuro.
Desenvolvido por Álvaro Pires · 2026 (antigo CAREER OS).

Plataforma pessoal de organização e desenvolvimento acadêmico, técnico, profissional e pessoal, para acompanhar a graduação em Engenharia de Software (PUC Minas, Coração Eucarístico, noturno, 2027–2030), a entrada no mercado de tecnologia e a evolução até oportunidades de nível internacional.

**Interface:** dois modos no Painel Inicial. *Assistente* mostra o núcleo (anéis com dados reais: consistência, metas da semana, diagnóstico), busca e ações rápidas. *Produtividade* mostra o painel detalhado. Design system em [docs/12-design-system.md](docs/12-design-system.md); testes da interface em [docs/14-relatorio-de-testes.md](docs/14-relatorio-de-testes.md). Funciona em celular (navegação inferior), tablet (trilho de ícones) e telas largas.

Não é um cronograma estático: é um sistema com **diagnóstico**, **plano**, **execução** e **avaliação**, que começa com tudo "Não avaliado" e só mostra progresso quando há evidência registrada. A evolução por fases (assistente de IA, integrações) está em [docs/13-evolucao-jarvis.md](docs/13-evolucao-jarvis.md); as mudanças, em [CHANGELOG.md](CHANGELOG.md).

## Começar

```bash
npm start            # serve em http://localhost:8000 (usa python3 -m http.server)
```

Abra `http://localhost:8000`. O sistema precisa ser servido por HTTP (módulos ES e os documentos do Guia são carregados por URL); abrir o `index.html` direto do disco não funciona.

Publicação gratuita: **GitHub Pages** (Settings › Pages › branch e pasta raiz). Não há build: os arquivos são servidos como estão.

## Módulos

| Módulo | O que faz |
|---|---|
| Painel Inicial | Saudação, situação acadêmica, "Precisa da sua atenção", agenda de hoje, próximas entregas (14 dias), evolução acadêmica/técnica/profissional e consistência (só com dados medidos), metas da semana, marcos, competências prioritárias, projetos |
| Plano de Evolução | 6 fases com 37 marcos, dependências e status; 8 semestres da PUC Minas (Coração Eucarístico, noturno) com as 62 disciplinas, lacunas da grade, trilha de matemática e plano complementar |
| Central de Estudos | Materiais (CRUD), sessões com registro de uso de IA, horas, biblioteca com 48 recursos |
| Competências | 58 competências: nível atual × desejado, evidências, histórico, materiais, projetos, próxima ação; 10 avaliações diagnósticas |
| Laboratório de Projetos | Quadro de ideias a concluídos, tarefas, melhorias, competências, links |
| Oportunidades Profissionais | Candidaturas com funil e lacunas ligadas às Competências, empresas, experiências, preparação para entrevistas |
| Central de Inglês | Avaliações CEFR, vocabulário, prática por habilidade, metas de proficiência |
| Desenvolvimento Pessoal | Hábitos semanais, metas (semana → ano), leitura, reflexões, práticas mensuráveis |
| Oportunidades e Pesquisa | Bolsas, IC, hackathons, eventos, programas, com selo "confirmado na fonte" |
| Revisões | Ciclo semanal e mensal (Planejar → Estudar → Praticar → Desenvolver → Avaliar → Ajustar) |
| Relatórios | Evolução mensal/semestral, consistência, independência de IA, metas, aprendizagem, oportunidades, pontos de melhoria |
| Guia Estratégico | Os documentos de `docs/` renderizados no app |
| Central de Backup | JSON com selo SHA-256, CSV por tipo de dado, importação com prévia, pontos de restauração automáticos, histórico, verificação de integridade |
| Configurações | Rotina (mínima/normal/férias), cenário de trabalho (sem estágio, estágio 20 h, estágio 30 h), ajuste pela carga do semestre, perfil, aparência (tema, modo do Painel, menu lateral, animações, efeitos visuais, sons opcionais) |

**Busca global:** `Ctrl+K` ou `/`. **Atalhos:** `?`.

### Integração entre módulos

- Concluir projeto → registrar competências desenvolvidas com evidência e (opcionalmente) novo nível, com histórico.
- Concluir curso → entra no histórico de aprendizagem e pede evidência prática.
- Vaga com competências exigidas → lacunas apontadas a partir das Competências, com botão para criar atividade.
- Competência abaixo do desejado → "Criar atividade" gera tarefa ligada a ela.
- Avaliação diagnóstica → atualiza níveis com histórico.
- Excluir um registro remove as referências a ele nos demais (integridade).

## Planejamento (docs/)

| Documento | Conteúdo |
|---|---|
| [00 Visão geral](docs/00-visao-geral.md) | Como usar, ciclo, dados, classificação das informações |
| [01 Diagnóstico](docs/01-diagnostico.md) | Perfil, matriz de competências, lacunas, avaliações práticas |
| [02 Carreiras](docs/02-carreiras.md) | Big Techs sem romantizar, 22 cargos, cargos de IA, trilhas recomendadas |
| [03 Faculdade](docs/03-faculdade-puc-minas.md) | 8 semestres, IC, monitoria, extensão, UFMG/ENEM, pós-graduação |
| [04 Aprendizagem](docs/04-plano-de-aprendizagem.md) | Dependências, matriz CC/ES, stack, matemática por especialização, recursos |
| [05 IA](docs/05-inteligencia-artificial.md) | Trilha em 17 etapas e diferenças entre cargos de IA |
| [06 Trajetória profissional](docs/06-roadmap-profissional.md) | Trajetória, competências profissionais, preparação por empresa e nível |
| [07 Inglês](docs/07-ingles-internacionalizacao.md) | Metas CEFR, trilha por habilidade, internacionalização |
| [08 Pessoal e rotina](docs/08-desenvolvimento-pessoal.md) | Habilidades mensuráveis, níveis de rotina, metas por horizonte |
| [09 Projetos](docs/09-analise-de-projetos.md) | Análise do ExplAIner e do Portfólio; estratégia de 3 projetos |
| [10 Plano de 30 dias](docs/10-plano-30-dias.md) | 30/11 a 29/12/2026, semana a semana |
| [11 Uso de IA](docs/11-uso-de-ia.md) | Política de uso de IA sem perder independência |
| [12 Design system](docs/12-design-system.md) | Identidade, tokens, tipografia, componentes, acessibilidade |
| [13 Evolução do JARVIS](docs/13-evolucao-jarvis.md) | Arquitetura, decisões e Fases 2–5 (IA, integrações) |
| [Fontes](docs/fontes.md) | O que foi verificado, onde e quando |

## Dados e backup

Os dados ficam **somente no navegador** (`localStorage`, chave `careeros:v1`). Não há servidor nem sincronização. Limpar os dados do navegador, usar janela anônima ou trocar de computador faz os dados não aparecerem.

**Atualizações do plano:** quando o plano muda (como a revisão da grade, da rotina e da matemática), o sistema só acrescenta registros ou ajusta os que você não editou, uma única vez. Nada é apagado; níveis, evidências, histórico, sessões e disciplinas editadas por você ficam intactos. Testado em `tests/core.test.js`.

**Backup:** Configurações › Dados e backup › Exportar (arquivo JSON). Para restaurar ou levar para outro computador: Importar. A importação valida o arquivo antes de substituir os dados. Se o conteúdo salvo estiver corrompido, o sistema não o sobrescreve e avisa.

## Arquitetura

SPA em JavaScript puro com módulos ES, sem dependências nem build. Escolhida para ser publicada no GitHub Pages sem custo e para ser **legível por você**: todo o código usa só HTML, CSS e JS que você já conhece.

```
index.html            shell, CSP, fontes
css/                  tokens (tema), base, layout, componentes
js/app.js             roteamento por hash, sidebar recolhível, cabeçalho (modo, notificações, perfil), tema, re-renderização
js/core/              estado e persistência (store), esquema e validação (schema),
                      indicadores (metrics), datas, DOM seguro, markdown seguro, dados iniciais (seed)
js/data/              conhecimento: grade da PUC, carreiras, recursos
js/ui/                componentes, formulários gerados do esquema, modal, gráficos SVG, ícones
js/views/             um módulo por tela + actions.js (integrações entre módulos)
docs/                 planejamento (fonte única, também exibido no Guia)
tests/                testes de unidade com node:test
```

Decisões principais:

- **Esquema único** (`js/core/schema.js`) define campos, rótulos e validação; os formulários são gerados a partir dele.
- **Métricas puras** (`js/core/metrics.js`) retornam `null` quando não há dado, e a interface mostra "Não avaliado".
- **Segurança:** conteúdo do usuário nunca vai para `innerHTML` (DOM construído com `textContent`); links digitados só aceitam `http(s)`; CSP restritiva; o Markdown do Guia é renderizado sem HTML.
- **Acessibilidade:** navegação por teclado, foco visível, modais com foco preso, estados com texto (não só cor), gráficos com descrição textual, `prefers-reduced-motion` e opção "Reduzir animações", temas escuro (padrão), Gelo (claro) e do sistema.

## Testes

```bash
npm test
```

Cobrem datas, dados iniciais (nenhum nível inventado, referências válidas), progresso sem dados = `null`, CRUD e persistência, integridade referencial, exportação/importação e rejeição de arquivos inválidos, dados corrompidos não sobrescritos, validação, consistência, independência de IA, metas, funil, lacunas de vagas, hábitos, rotina e dependências do roadmap. `tests/consistency.test.js` garante que o documento da faculdade, a matriz do código e o plano (marcos, datas de matemática, recursos de IA) não divergem. A CI (`.github/workflows/ci.yml`) roda a verificação de sintaxe e os testes a cada push.

## Limitações

- Sem sincronização entre dispositivos (só backup manual).
- A grade da PUC Minas segue a matriz do campus Coração Eucarístico, turno noturno, consultada na página oficial em 21/11/2026. Está pendente de confirmação com a documentação da matrícula de 2027 (botão em Roadmap › Semestres); até lá, é uma referência provisória.
- Oportunidades e requisitos de empresas mudam: o sistema marca o que não foi confirmado na fonte oficial.
- Construído com apoio de IA. Ver [docs/11-uso-de-ia.md](docs/11-uso-de-ia.md) sobre como torná-lo um projeto seu.
