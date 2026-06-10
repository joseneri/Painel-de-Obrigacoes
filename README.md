# Painel de Obrigacoes Acessorias

Aplicacao full-stack desenvolvida para o case tecnico da **e-Auditoria**.

O sistema ajuda um escritorio contabil a controlar obrigacoes acessorias por
empresa, regime tributario, competencia, vencimento e status de entrega.

> Este projeto **nao calcula impostos**. Ele gera, organiza e acompanha
> obrigacoes acessorias conforme as regras definidas no case.

---

## Como Rodar Localmente

### Pre-requisitos

- Docker
- Docker Compose

### Subir toda a infraestrutura

Na raiz do repositorio, onde esta o `docker-compose.yml`, execute:

```bash
docker compose up --build
```

Esse comando sobe toda a infraestrutura necessaria para avaliacao do case:

| Servico | Endereco |
| --- | --- |
| Frontend | `http://localhost:8081` |
| API | `http://localhost:8080` |
| Health check | `http://localhost:8080/health` |
| Documentacao API | `http://localhost:8080/scalar` |
| PostgreSQL | servico interno `db:5432` |

Na primeira execucao, a API aplica migrations, sincroniza feriados nacionais,
prepara o cache local e executa o seed automatico de demonstracao.

### Recriar a base do zero

```bash
docker compose down -v
docker compose up --build
```

Use `docker compose down -v` apenas quando quiser apagar o volume local do
PostgreSQL e recriar os dados de demonstracao.

---

## O Que Foi Entregue

- Cadastro, listagem e remocao de empresas.
- Controle de empresas por regime tributario.
- Geracao automatica de obrigacoes acessorias.
- Calendario mensal por competencia e vencimento.
- Registro de entrega de obrigacoes.
- Dashboard com visao consolidada.
- Painel de alertas com obrigacoes atrasadas e vencendo nos proximos 30 dias.
- Historico de entregas por empresa.
- Exportacao do calendario em CSV e PDF.
- Seed automatico com massa de demonstracao.
- Backend com testes automatizados de Domain, Application e API.
- Ambiente completo executavel com um unico comando Docker Compose.

---

## Dados de Demonstracao e Seed Automatico

O seed roda automaticamente na inicializacao da API.

Ele cria empresas nos regimes:

- Simples Nacional
- Lucro Presumido
- Lucro Real
- Imune/Isento

A massa de demonstracao inclui obrigacoes pendentes, atrasadas e entregues, com
entregas antes do vencimento, no dia do vencimento e apos o vencimento.

A decisao foi gerar os dados de demonstracao pela propria engine fiscal do
sistema, e nao por um script SQL fixo. Assim, os dados usados na demonstracao
seguem a mesma regra de negocio usada pela aplicacao.

---

## Stack Utilizada

| Camada | Tecnologia |
| --- | --- |
| Backend | .NET 9, Minimal APIs, EF Core 9 |
| Banco de dados | PostgreSQL 16 |
| Frontend | React 18, Vite, TypeScript |
| UI | Ant Design, Tailwind CSS |
| Estado e navegacao | TanStack Query, TanStack Router |
| Testes | xUnit, FluentAssertions, WebApplicationFactory |
| Entrega | Docker, Docker Compose, Nginx |

---

## Estrutura do Projeto

```text
.
|-- backend/
|   |-- PainelObrigacoes.sln
|   |-- src/
|   |   |-- Domain/
|   |   |-- Application/
|   |   |-- Infrastructure/
|   |   `-- Api/
|   `-- tests/
|       |-- Domain.Tests/
|       |-- Application.Tests/
|       `-- Api.Tests/
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- app/
|   |   |-- routes/
|   |   |-- features/
|   |   `-- shared/
|   |-- Dockerfile
|   `-- nginx.conf
|-- docs/
`-- docker-compose.yml
```

A estrutura e hibrida:

- No backend, usei separacao por camadas: Domain, Application, Infrastructure e
  Api.
- No frontend, usei organizacao por areas de responsabilidade: `api`, `app`,
  `routes`, `features` e `shared`.

Essa combinacao foi escolhida porque o backend concentra regras de negocio e
persistencia, enquanto o frontend evolui naturalmente por telas e fluxos de uso.

---

## Principais Decisoes Tecnicas

### Backend com Minimal APIs, sem MediatR/CQRS

Escolhi **Minimal APIs com application services**, sem MediatR/CQRS, porque o
escopo do case possui fluxos objetivos: cadastrar empresa, consultar calendario,
registrar entrega, consultar alertas e exibir dashboard.

A separacao em Domain, Application, Infrastructure e Api ja entrega baixo
acoplamento, testabilidade e clareza suficiente para o tamanho do projeto.

MediatR/CQRS poderia fazer sentido em um cenario com muitos fluxos assincronos,
pipelines complexos, leitura e escrita com modelos muito diferentes ou multiplas
equipes trabalhando em modulos independentes. Para este case, adicionar essa
camada traria mais indirecao do que beneficio pratico.

### Regra fiscal isolada no Domain

A regra fiscal fica no Domain, sem dependencia de ASP.NET, EF Core, PostgreSQL
ou frontend.

O frontend nao calcula vencimento, status ou obrigacao aplicavel. Ele apenas
consome os contratos HTTP expostos pela API.

Essa decisao facilita testes, reduz acoplamento e deixa claro onde a regra de
negocio vive.

### Application Services em vez de logica nos endpoints

Os endpoints Minimal API sao finos e delegam os fluxos para services da camada
Application.

Isso evita colocar regra de negocio dentro dos handlers HTTP e mantem a API
apenas como borda de entrada da aplicacao.

### Obrigacoes persistidas no banco

As obrigacoes sao geradas e persistidas ao cadastrar uma empresa e tambem durante
o seed/startup.

A decisao foi nao recalcular todas as obrigacoes a cada request, porque
dashboard, alertas, entregas e calendario precisam consultar vencimentos, status
e historico de forma eficiente.

Persistir as obrigacoes permite usar indices, consultar historico e manter
consistencia entre o que foi gerado e o que foi entregue.

### Competencia separada de vencimento

No sistema, competencia e vencimento sao conceitos diferentes:

- **Competencia** representa o periodo fiscal da obrigacao.
- **Vencimento** define prazo, atraso, alerta e urgencia operacional.

Essa separacao e importante principalmente para obrigacoes anuais. Elas pertencem
a competencia de janeiro, mas podem vencer em fevereiro, marco, maio ou julho,
dependendo da obrigacao.

### `Competencia` como value object

No Domain, `Competencia` foi modelada como um value object imutavel.

Durante a implementacao, o EF Core apresentou limitacao para criar indice
composto usando membro aninhado de complex property. A solucao foi persistir
`CompetenciaAno` e `CompetenciaMes` como colunas escalares no banco, mantendo o
conceito de `Competencia` protegido no Domain.

Essa decisao preserva o design do dominio e tambem deixa a persistencia mais
simples e confiavel.

### Feriados nacionais via BrasilAPI com cache local

A regra de vencimento considera proximo dia util quando a data cai em sabado,
domingo ou feriado nacional.

Para feriados, usei a BrasilAPI como fonte externa, mas a aplicacao nao depende
dela a cada calculo. No startup, a API sincroniza os feriados nacionais, persiste
no PostgreSQL e usa o snapshot local no calculo de vencimentos.

Essa decisao evita hardcode de feriados no Domain e, ao mesmo tempo, impede que
uma chamada externa fique no caminho critico da regra fiscal.

### Tratamento de erros e observabilidade

O tratamento de erros foi centralizado em um handler global.

Erros esperados, como validacao, conflito e recurso inexistente, retornam
respostas previsiveis no formato Problem Details.

Erros inesperados retornam uma mensagem generica para o usuario, mas sao
registrados em log com `traceId` e `correlationId`, permitindo investigacao sem
expor detalhes internos.

O frontend envia `X-Correlation-ID` em cada chamada. A API devolve
`X-Correlation-ID`, `X-Trace-ID` e tambem inclui `traceId`/`correlationId` nos
Problem Details, conectando erro de tela, resposta HTTP e log do backend.

### Frontend como SPA React/Vite

O frontend foi implementado como SPA React/Vite consumindo uma API .NET.

Nao usei Next.js porque o requisito do case era uma aplicacao React separada
consumindo backend. Next.js mudaria o modelo de execucao para um framework
full-stack/SSR, sem necessidade para este escopo.

O frontend e buildado pelo Vite e servido por Nginx no container, com fallback
para `index.html` nas rotas client-side da SPA.

### TanStack Query e TanStack Router

Usei TanStack Query para server state, cache e invalidacao das chamadas HTTP.

Usei TanStack Router para navegacao, layout e estado de URL. Filtros importantes,
como ano, mes e status do calendario, podem ser refletidos na URL, permitindo
compartilhar ou reabrir a mesma visao.

### Design system

A interface segue uma linguagem de painel operacional:

- sidebar escura;
- fundo neutro;
- cards brancos;
- tabelas densas;
- cores semanticas;
- azul para navegacao e acao principal;
- verde para entregue/sucesso;
- ambar para atencao;
- vermelho para atraso ou erro.

O objetivo foi construir uma interface profissional para rotina contabil, com
leitura rapida de prazos, empresas, status e obrigacoes.

---

## Ambiguidades e Decisoes do Case

Durante a implementacao, algumas regras do case exigiram interpretacao.
Documentei abaixo as decisoes tomadas para deixar claro o criterio adotado.

| Tema | Decisao tomada | Justificativa |
| --- | --- | --- |
| Dashboard | Exibir o total geral de obrigacoes por padrao | Mantem a visao consolidada pedida no case e deixa a operacao mais direta. |
| Dia util | Prorrogar vencimentos em fins de semana e feriados nacionais | Fins de semana estavam no case; feriados nacionais foram tratados como diferencial consistente para vencimentos. |
| Competencia vs. vencimento | Competencia organiza o periodo fiscal; vencimento define status, atraso e alertas | Evita confusao em obrigacoes anuais, que pertencem a janeiro mas podem vencer em meses posteriores. |
| Obrigacoes anuais | Geradas apenas na competencia de janeiro | Mantem aderencia a regra do case e separa competencia fiscal de prazo real. |
| Imune/Isento | Nao gerar obrigacoes nesta versao | O case informa dispensa da maioria das obrigacoes, mas nao define uma matriz especifica para esse regime. |
| Status no dia do vencimento | Considerar como Pendente ate o fim do dia do vencimento | A obrigacao so se torna Atrasada no dia seguinte, caso nao tenha entrega registrada. |
| Regras fiscais reais divergentes do PDF | O PDF do case prevalece | O objetivo foi cumprir o escopo proposto, nao substituir a legislacao fiscal atualizada. |

### Resumo da matriz implementada

A matriz de obrigacoes foi implementada conforme o escopo do case:

- **Simples Nacional**: DAS, eSocial, DEFIS, DIRF e RAIS.
- **Lucro Presumido**: DCTF, EFD-ICMS/IPI, EFD Contribuicoes, EFD-Reinf,
  eSocial, SPED ECD, SPED ECF, DIRF e RAIS.
- **Lucro Real**: DCTF, EFD-ICMS/IPI, EFD Contribuicoes, EFD-Reinf, eSocial,
  SPED ECD, SPED ECF, DIRF e RAIS.
- **Imune/Isento**: sem obrigacoes geradas nesta versao por falta de matriz
  especifica no enunciado.

---

## Testes e Validacoes

### Rodar testes do backend

```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
```

### Build do frontend

```bash
npm run build --prefix frontend
```

### Validacoes usadas durante o desenvolvimento

- `dotnet test`
- `dotnet build`
- migrations do EF Core
- build do frontend com Vite
- validacao do Docker Compose
- revisao de constraints de arquitetura
- checagem manual dos principais fluxos da aplicacao

Os testes cobrem regras de dominio, vencimentos, status, geracao de obrigacoes,
cadastro de empresas, dashboard, alertas, historico de entregas, fluxos de
entrega e integracao HTTP da API, incluindo Problem Details.

---

## Uso de IA no Desenvolvimento

Usei tres ferramentas com papeis diferentes:

- **Codex (OpenAI)** como par de programacao e agente de trabalho. Eu usava o
  Codex para ler o case, reler `AGENTS.md` e `architecture.md`, montar pesquisa,
  registrar planos, levantar riscos, quebrar a implementacao em etapas, sugerir
  caminhos tecnicos, revisar diffs e lembrar as validacoes antes de concluir.
- **GitHub Copilot** para correcoes pontuais inline, autocomplete e pequenos bug
  fixes durante o desenvolvimento.
- **Claude.ai** para pesquisa e arquitetura: consulta a documentacao oficial,
  discussao de trade-offs e validacao de decisoes de design antes de
  implementar.

A regra de negocio veio do PDF do case e das respostas da equipe da
e-Auditoria, nao da IA.

O codigo foi validado com `dotnet test`, `dotnet build`, migrations, build do
frontend, Docker Compose e checagens de constraints. Quando uma sugestao nao
funcionou na pratica, a decisao foi corrigida com base no comportamento real das
ferramentas e na documentacao oficial.

Um exemplo concreto foi o mapeamento de `Competencia`: a abordagem inicial com
membro aninhado de complex property nao funcionou bem para indice composto no EF
Core. A solucao foi ajustada para colunas escalares `CompetenciaAno` e
`CompetenciaMes`, mantendo o value object no Domain.

Tambem documentei as ambiguidades do case e as decisoes tomadas, porque essa
capacidade de identificar e justificar trade-offs fazia parte da avaliacao.

---

## Limitacoes Conhecidas

- Feriados estaduais e municipais nao sao considerados.
- Pontos facultativos nao sao considerados.
- Regras especificas por UF ou municipio ficam fora do escopo.
- Regras fiscais reais que divergirem do PDF do case nao foram aplicadas.
- Empresas Imune/Isento nao geram obrigacoes nesta versao por falta de matriz
  especifica no enunciado.
- A primeira execucao com banco vazio precisa acessar a BrasilAPI para montar o
  cache inicial de feriados.

---

## Resumo das Principais Escolhas

| Decisao | Escolha |
| --- | --- |
| Backend | Minimal APIs com application services |
| Arquitetura | Camadas Domain, Application, Infrastructure e Api |
| CQRS/MediatR | Nao utilizado por nao agregar valor suficiente ao escopo |
| Persistencia | PostgreSQL com EF Core |
| Obrigacoes | Geradas pela engine e persistidas no banco |
| Seed | Automatico no startup |
| Feriados | BrasilAPI + cache local no banco |
| Erros | Handler global com Problem Details, traceId e correlationId |
| Frontend | SPA React/Vite |
| Runtime frontend | Build Vite servido por Nginx |
| UI | Ant Design + Tailwind CSS |
| Estado remoto | TanStack Query |
| Rotas | TanStack Router |
| Entrega | Docker Compose com banco, API e frontend |
