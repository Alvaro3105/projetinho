# Plano de aprendizagem e recursos

## 1. Ordem e dependências

Cada bloco só começa quando o anterior tem **evidência** (avaliação ou projeto), não quando o curso acabou.

```
Lógica + Python (sem IA) ──► Estruturas de dados ──► Algoritmos/complexidade ──► Entrevistas (DSA)
        │                          │                          │
        ▼                          ▼                          ▼
   Git + Linux ──► SQL/modelagem ──► API com testes ──► Docker/CI/deploy ──► Sistemas distribuídos ──► System design
                                          │
Matemática básica ──► Cálculo ──► Álgebra linear + Probabilidade ──► ML ──► Deep Learning ──► LLMs/RAG/agentes ──► MLOps
                                                                                       ▲
                                                           Backend sólido ─────────────┘
Inglês: contínuo, do primeiro ao último dia.
```

## 2. Matriz de conhecimentos da graduação

Onde cada assunto será aprendido: **PUC** (disciplina da grade encontrada), **Paralelo** (estudo próprio) ou **Ambos**.

### Fundamentos de Ciência da Computação

| Assunto | Fonte principal | Fase | Recurso complementar |
|---|---|---|---|
| Lógica de programação | Paralelo → PUC (Introdução à Algoritmos) | 1–2 | CS50x, beecrowd |
| Algoritmos | Ambos | 1–5 | MIT 6.006, CLRS |
| Estruturas de dados | PUC (Estruturas de Dados, 3º) + paralelo | 3 | MIT 6.006, implementação do zero |
| Complexidade e análise | PUC (Análise e Projeto de Algoritmos, 5º) | 3–5 | 6.006 |
| Matemática discreta | Paralelo (verificar se há disciplina) | 2–3 | MIT 6.042J |
| Teoria da computação | PUC (Computabilidade, 1º) | 2 | — |
| Sistemas operacionais | Paralelo (não apareceu na grade encontrada) | 3–4 | OSTEP |
| Arquitetura de computadores | PUC (2º) | 2 | CS50x (memória) |
| Redes | PUC (4º) | 3 | Cisco NetAcad (seletivo) |
| Concorrência e paralelismo | Paralelo + PUC (Sistemas Distribuídos) | 4 | OSTEP parte 2 |
| Sistemas distribuídos | PUC (5º) | 4 | DDIA, System Design Primer |
| Compiladores | Paralelo, opcional | 4+ | Crafting Interpreters |
| Segurança computacional | Paralelo | 3+ | OWASP Top 10, CTFs |

### Engenharia de Software

| Assunto | Fonte | Fase |
|---|---|---|
| POO, programação funcional | PUC (Programação Modular) + paralelo | 2 |
| Clean Code, SOLID, padrões | PUC (Projeto de Software) + leitura crítica | 3 |
| Requisitos | PUC (3º) | 3 |
| Arquitetura e arquitetura limpa | PUC (Arquitetura de Software, 6º) + ADRs nos projetos | 4 |
| Testes unitários e de integração | PUC (Teste de Software, 6º) — **mas comece na Fase 1** | 1+ |
| APIs REST | Paralelo (FastAPI) | 2 |
| Microsserviços e mensageria | Paralelo (Projeto #2) | 3–4 |
| Observabilidade | Paralelo (Projeto #2) | 3–4 |
| Segurança de aplicações | Paralelo (OWASP) | 2+ |
| CI/CD e DevOps | Paralelo (GitHub Actions nos projetos) | 2 |
| Escalabilidade e performance | PUC (5º) + system design | 4–5 |

## 3. Stack: o que aprender e em que ordem

**Principal:** Python → SQL/PostgreSQL → Git/Linux → C (via CS50x) → FastAPI + pytest → Docker → Java + Spring Boot → Redis/filas/observabilidade → PyTorch (especialização).

**Depois, só o necessário:** TypeScript + React (para interfaces dos seus projetos), Kubernetes (quando houver serviço real para orquestrar), C++ (se seguir sistemas/AI infra ou competições).

**Não aprofundar agora:** PHP, C#/.NET. Ficam no currículo como experiência acadêmica.

**Alternativa justificada:** se a faculdade e as vagas de estágio em BH pedirem Java com força, Java/Spring Boot vira a stack principal de backend e Python fica para algoritmos e IA. A decisão entra na revisão mensal de jun/2027 com dados das vagas registradas no Career Tracker.

**Por que Python primeiro:** é a linguagem que você declarou precisar reconstruir, é aceita em entrevistas de todas as Big Techs, é a língua franca de IA e tem sintaxe que deixa você focar no raciocínio.

## 4. Matemática por especialização

| Conteúdo | Software/Backend | Dados | IA/ML | Pesquisa em IA | Quando |
|---|---|---|---|---|---|
| Matemática básica, álgebra, funções | Indispensável | Indispensável | Indispensável | Indispensável | Fase 1 |
| Geometria analítica | Útil | Útil | Útil (vetores) | Indispensável | Fase 2 |
| Matemática discreta (lógica, indução, grafos, contagem) | **Indispensável** | Útil | Útil | Indispensável | Fase 2–3 |
| Cálculo diferencial e integral | Desejável | Desejável | **Indispensável** (gradientes) | Indispensável | Fase 2–3 (PUC) |
| Álgebra linear | Desejável | Útil | **Indispensável** | Indispensável | Fase 3 |
| Probabilidade e estatística | Útil (métricas, SLOs, A/B) | **Indispensável** | **Indispensável** | Indispensável | Fase 3 |
| Otimização | — | Útil | Importante | Indispensável | Fase 4 |
| Métodos numéricos | — | Útil | Útil | Importante | Fase 4+ |

## 5. Recursos

A biblioteca completa (48 recursos) está em **Estudos › Biblioteca recomendada**, cada um com instituição, link, custo/certificado, idioma, nível, conteúdo, competências, pré-requisitos e uso no plano. Um clique adiciona o recurso à sua central. Os principais por fase:

| Fase | Recurso | Instituição | Custo / certificado | Idioma |
|---|---|---|---|---|
| 1 | [CS50x](https://cs50.harvard.edu/x/) | Harvard | Gratuito, certificado gratuito | Inglês (legendas PT) |
| 1 | [CS50P](https://cs50.harvard.edu/python/) | Harvard | Gratuito, certificado gratuito | Inglês |
| 1 | [beecrowd](https://judge.beecrowd.com/) | beecrowd | Gratuito | Português |
| 1 | [Khan Academy](https://pt.khanacademy.org/math) | Khan Academy | Gratuito, sem certificado | Português |
| 1 | [Missing Semester](https://missing.csail.mit.edu/) | MIT | Gratuito, sem certificado | Inglês |
| 1 | [Pro Git](https://git-scm.com/book/pt-br/v2) | Chacon e Straub | Gratuito | Português |
| 1 | [Learning How to Learn](https://www.coursera.org/learn/learning-how-to-learn) | Coursera | Gratuito para ouvir, certificado pago | Inglês |
| 2 | [CS50 SQL](https://cs50.harvard.edu/sql/) | Harvard | Gratuito, certificado gratuito | Inglês |
| 2 | [Engenharia de Software Moderna](https://engsoftmoderna.info/) | M. T. Valente (UFMG) | Gratuito | Português |
| 2 | [FastAPI](https://fastapi.tiangolo.com/) · [Docker](https://docs.docker.com/get-started/) | Documentação oficial | Gratuito | Inglês |
| 2 | [MIT 6.042J](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/) | MIT OCW | Gratuito, sem certificado | Inglês |
| 2–3 | Bootcamp DIO + Itaú (Java com IA) | DIO | Verificar edital | Português |
| 3 | [MIT 6.006](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/) | MIT OCW | Gratuito, sem certificado | Inglês |
| 3 | [MIT 18.06](https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/) · [MML book](https://mml-book.github.io/) | MIT · Cambridge UP | Gratuito | Inglês |
| 3 | [CS50 AI](https://cs50.harvard.edu/ai/) · [ML Crash Course](https://developers.google.com/machine-learning/crash-course) | Harvard · Google | Gratuito | Inglês |
| 4 | [Zero to Hero](https://karpathy.ai/zero-to-hero.html) · [d2l.ai](https://d2l.ai/) · [CS224N](https://web.stanford.edu/class/cs224n/) | Karpathy · d2l · Stanford | Gratuito | Inglês |
| 4 | [System Design Primer](https://github.com/donnemartin/system-design-primer) | open source | Gratuito | Inglês |

### Três tipos de "gratuito"

- **Gratuito com certificado gratuito:** CS50 (certificado do próprio CS50), freeCodeCamp, EF SET.
- **Gratuito com certificado pago:** Coursera e edX no modo ouvinte; CS50 com certificado *verificado* do edX; Microsoft Learn (o conteúdo é gratuito, os exames de certificação são pagos).
- **Gratuito sem certificado:** MIT OCW, Stanford, Khan Academy, documentação oficial, livros abertos.

**Regra do plano:** certificado não é objetivo. Um certificado só vale o custo quando uma vaga específica pede (comum em cloud) ou quando o curso tem avaliação rigorosa (CS50). Sempre registre a **evidência prática** que o curso gerou.
