# Plano de aprendizagem e recursos

## 1. Ordem e dependências

Cada bloco só começa quando o anterior tem **evidência** (avaliação ou projeto), não quando o curso acabou.

```
Lógica + Python (sem IA) ──► Estruturas de dados ──► Algoritmos/complexidade ──► Entrevistas (DSA)
        │                          │                          │
        ▼                          ▼                          ▼
   Git + Linux ──► SQL/modelagem ──► API com testes ──► Docker/CI/deploy ──► Sistemas distribuídos ──► System design
                                          │
Matemática básica ──► Cálculo I/II (PUC) ──► Álgebra linear (fora da grade) + Probabilidade (PUC, 5º) ──► ML ──► Deep Learning ──► LLMs/RAG/agentes ──► MLOps
Lógica/provas ──► Matemática Discreta (fora da grade; Computabilidade não a substitui) ──► Grafos e algoritmos
                                                                                       ▲
                                                           Backend sólido ─────────────┘
Inglês: contínuo, do primeiro ao último dia.
```

## 2. Matriz de conhecimentos da graduação

Onde cada assunto será aprendido: **PUC** (disciplina da matriz oficial, Coração Eucarístico, noturno), **Paralelo** (estudo próprio) ou **Ambos**. Período = período da PUC; Fase = fase do CAREER OS.

### Fundamentos de Ciência da Computação

| Assunto | Fonte principal | Fase | Recurso complementar |
|---|---|---|---|
| Lógica de programação | Paralelo → PUC (Introdução a Algoritmos, 1º) | 1–2 | CS50x, beecrowd |
| Algoritmos | Ambos (Introdução a Algoritmos 1º, Grafos 4º, Análise e Projeto de Algoritmos 5º) | 1–4 | MIT 6.006, CLRS |
| Estruturas de dados | PUC (Estruturas de Dados, 3º, 144 h) + paralelo | 3 | MIT 6.006, implementação do zero |
| Complexidade e análise | PUC (Estruturas de Dados 3º; Análise e Projeto de Algoritmos 5º) | 3–4 | 6.006 |
| Matemática discreta | **Paralelo — não está na grade** (Discreta I em 2027/2; II nas férias de jul/2028) | 2–3 | MIT 6.042J |
| Teoria da computação | PUC (Computabilidade, 1º; Métodos Formais, 7º) | 2, 5 | — |
| Sistemas operacionais | PUC (Fundamentos de Sistemas Operacionais, 3º) + paralelo | 3 | OSTEP |
| Arquitetura de computadores | PUC (2º, 42 h) | 2 | CS50x (memória) |
| Redes | PUC (4º) | 3 | Cisco NetAcad (seletivo) |
| Concorrência e paralelismo | PUC (Sistemas Operacionais 3º; Sistemas Distribuídos 5º) + paralelo | 3–4 | OSTEP parte 2 |
| Sistemas distribuídos e nuvem | PUC (Sistemas Distribuídos e Computação em Nuvem, 5º) | 4 | DDIA, System Design Primer |
| Compiladores | **Paralelo, opcional — não está na grade** | 4+ | Crafting Interpreters |
| Segurança computacional | PUC (Segurança em Desenvolvimento de Software, 6º) + paralelo desde já | 2+ | OWASP Top 10, CTFs |

### Engenharia de Software

| Assunto | Fonte | Fase |
|---|---|---|
| POO, programação funcional | PUC (Programação Modular) + paralelo | 2 |
| Clean Code, SOLID, padrões | PUC (Projeto de Software, 4º) + leitura crítica | 3 |
| Requisitos | PUC (Engenharia de Requisitos 3º; Gerência de Requisitos 4º) | 3 |
| Arquitetura e arquitetura limpa | PUC (Arquitetura de Software, 6º) + ADRs nos projetos | 4 |
| Testes unitários e de integração | PUC (Teste de Software, 6º) — **mas comece na Fase 1** | 1+ |
| APIs REST | Paralelo (FastAPI) | 2 |
| Microsserviços e mensageria | Paralelo (Projeto #2) | 3–4 |
| Observabilidade | Paralelo (Projeto #2) | 3–4 |
| Segurança de aplicações | Paralelo (OWASP) → PUC (6º) | 2+ |
| CI/CD e DevOps | Paralelo (GitHub Actions nos projetos) → PUC (Cultura e Práticas DevOps, 4º) | 2–3 |
| Escalabilidade e performance | PUC (Sistemas Distribuídos 5º; Modelagem e Avaliação de Desempenho 6º) + system design | 4 |
| Confiabilidade (SRE) | PUC (Site Reliability Engineering, 7º) | 5 |
| Qualidade, manutenção e processos | PUC (Qualidade, Manutenção e Evolução, Engenharia de Processos, 8º) | 5 |
| IA e ciência de dados | PUC (Estatística e Probabilidade 5º; Fundamentos de IA 5º; Ciência de Dados e IA 6º) + paralelo | 4 |

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
| Matemática discreta (lógica, indução, grafos, contagem) | **Indispensável** | Útil | Útil | Indispensável | **Paralelo** (não está na grade): Discreta I em 2027/2, II nas férias de jul/2028 |
| Computabilidade / teoria da computação | Útil | — | — | Importante | PUC: Computabilidade (1º). Não substitui a discreta |
| Cálculo diferencial e integral | Desejável | Desejável | **Indispensável** (gradientes) | Indispensável | PUC: Cálculo I (2º) e II (3º); cálculo vetorial para ML em 2029/2 |
| Álgebra linear | Desejável | Útil | **Indispensável** | Indispensável | **Paralelo** (não está na grade): I nas férias de jan–fev/2029, II em 2029/1 |
| Probabilidade e estatística | Útil (métricas, SLOs, A/B) | **Indispensável** | **Indispensável** | Indispensável | PUC: Estatística e Probabilidade (5º); base em paralelo antes |
| Otimização | — | Útil | Importante | Indispensável | Fase 4 (com ML, 2029/2+) |
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
