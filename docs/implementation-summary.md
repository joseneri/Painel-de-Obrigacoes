# Implementacao Ate Agora

Data: 2026-06-06

Este documento consolida o estado atual do projeto **Painel de Obrigacoes
Acessorias**. Ele separa o que ja foi implementado, o que foi validado, quais
decisoes tecnicas foram tomadas e quais pontos ainda ficam como proximas fases.

O produto e um calendario fiscal inteligente para controlar obrigacoes
acessorias por regime tributario. Ele nao calcula impostos. A regra fiscal fica
no backend; o frontend e um cliente SPA que consome contratos HTTP.

## Estado Geral

Implementado ate agora:

- Backend .NET 9 com Minimal APIs.
- Separacao em `Domain`, `Application`, `Infrastructure` e `Api`.
- Engine de regras tributarias no Domain.
- Calculo de vencimentos com prorrogacao de fim de semana.
- EF Core 9 com PostgreSQL 16 e migration versionada.
- Seed automatico de empresas, obrigacoes e entregas de demonstracao.
- Endpoints para empresas, obrigacoes, alertas, dashboard e entregas.
- Hardening inicial de validacoes e tratamento de erros.
- Frontend React 18 + Vite + TypeScript.
- Ant Design como biblioteca principal de componentes estruturais.
- TanStack Query para estado servidor.
- TanStack Router para rotas file-based, layout e estado de URL.
- Dashboard, calendario, cadastro/remocao de empresas, registro de entrega e
  exportacao CSV.
- Docker Compose principal para API + PostgreSQL.
- Docker Compose dev para banco/infra, com API e frontend locais.
- Documentacao de arquitetura, processo de agentes e uso de IA.

Ainda nao implementado ou deixado para fase futura:

- Compose full-stack de entrega com frontend servido junto da API e banco.
- Testes automatizados fora do Domain.
- Testes E2E/smoke do frontend com API viva.
- Cliente gerado por OpenAPI ou teste de contrato para evitar drift de DTOs.
- Revisao mais profunda de datas civis vs instantes UTC para entregas.
- Estrategia final de status derivado vs status persistido em larga escala.

## Linha do Tempo

Commits ja existentes no historico:

| Commit | Assunto | Resultado |
| --- | --- | --- |
| `8865e90` | `feat: implement .NET backend obligations engine` | Criou backend, Domain, Application, Infrastructure, API, testes, Docker e README inicial. |
| `42ee8bc` | `docs: add AI showcase guide` | Criou guia para defesa tecnica e uso responsavel de IA. |
| `cf371ea` | `chore: clarify monorepo structure and naming` | Padronizou nome do produto e estrutura monorepo. |
| `61803f5` | `chore: simplify backend solution name` | Simplificou a solution para `PainelObrigacoes.sln`. |
| `716ce25` | `chore: add development docker compose` | Criou `docker-compose.dev.yml` para banco em desenvolvimento. |
| `5059135` | `fix: harden backend validation and errors` | Endureceu validacoes e erros do backend. |
| `ef415c0` | `docs: add agent workflow instructions` | Adicionou fluxo obrigatorio para agentes e templates em `docs/`. |

Mudancas do ciclo de frontend/TanStack Router:

- Frontend React/Vite implementado em `frontend/`.
- React ajustado para 18.x.
- Rotas file-based adicionadas com TanStack Router.
- Filtros do calendario movidos para search params tipados.
- `frontend/.env.example` apontando para API local em `5179`.
- README raiz e README do frontend alinhados ao fluxo dev local.
- `.gitignore` ignorando overrides locais de ambiente do frontend.

## Arquitetura

### Monorepo

Estrutura principal:

```text
backend/
  PainelObrigacoes.sln
  src/
    Api/
    Application/
    Domain/
    Infrastructure/
  tests/
    Domain.Tests/
frontend/
  src/
    api/
    app/
    routes/
    features/
    shared/
docs/
docker-compose.yml
docker-compose.dev.yml
```

O backend e a regra fiscal vivem em `backend/`. O frontend e uma SPA separada
em `frontend/`. O Compose principal e o Compose dev ficam na raiz.

### Backend

Camadas:

- `Domain`: entidades, enums, value objects, interfaces de repositorio e
  services puros.
- `Application`: DTOs, mappers, use cases, normalizacao e excecoes de aplicacao.
- `Infrastructure`: EF Core, migrations, seed e repositorios.
- `Api`: Minimal APIs, CORS, OpenAPI/Scalar, Problem Details, DI e startup.

Constraints mantidas:

- Domain sem referencias a `Microsoft.*`, ASP.NET, EF Core ou `System.Data.*`.
- Engine fiscal stateless.
- Endpoints chamam use cases e nao concentram regra de negocio.
- Arquivos fonte abaixo de 250 linhas.
- Migrations versionadas.
- CNPJ persistido com 14 digitos.
- Datas persistidas como UTC.

### Frontend

Organizacao:

- `frontend/src/api`: cliente HTTP, tipos e hooks TanStack Query.
- `frontend/src/app`: shell da aplicacao, providers, router e CSS global.
- `frontend/src/routes`: rotas file-based e contratos de URL.
- `frontend/src/features/dashboard`: dashboard fiscal.
- `frontend/src/features/empresas`: cadastro, listagem e remocao de empresas.
- `frontend/src/features/obrigacoes`: calendario, entrega e CSV.
- `frontend/src/shared/utils`: formatadores, labels de dominio e mensagens de
  erro.

Stack:

- React `18.3.1`.
- React DOM `18.3.1`.
- TypeScript obrigatorio.
- Vite.
- Ant Design `6.4.3`.
- TanStack Query `5.101.0`.
- TanStack Router `1.170.13`.
- Day.js.

O frontend nao replica a engine fiscal. Ele apenas:

- Busca dashboard, alertas, empresas e obrigacoes via API.
- Envia cadastro/remocao de empresas.
- Registra entrega.
- Formata labels, datas, CNPJ e CSV para apresentacao.

## Backend Implementado

### Domain

Enums principais:

- `RegimeTributario`: `SimplesNacional`, `LucroPresumido`, `LucroReal`,
  `ImuneIsento`.
- `TipoObrigacao`: `DAS`, `DEFIS`, `DCTF`, `EFD_ICMS_IPI`,
  `EFD_Contribuicoes`, `EFD_Reinf`, `SPED_ECD`, `SPED_ECF`, `eSocial`, `DIRF`,
  `RAIS`.
- `StatusObrigacao`: pendente, atrasada, entregue e nao aplicavel.
- `PeriodicidadeObrigacao`: mensal e anual.

Entidades:

- `Empresa`: dados basicos da empresa, CNPJ normalizado e regime tributario.
- `Obrigacao`: tipo, competencia, vencimento, periodicidade, status e entrega.
- `Entrega`: conclusao de uma obrigacao, data e observacao.

Value object:

- `Competencia`: ano e mes imutaveis, com operacoes de mes anterior/proximo e
  formatacao.

Services:

- `ObrigacaoRulesEngine`: decide obrigacoes aplicaveis por regime e competencia.
- `VencimentoCalculator`: calcula vencimentos e prorroga sabado/domingo para a
  proxima segunda-feira.

Matriz de obrigacoes:

| Regime | Mensais | Anuais em janeiro |
| --- | --- | --- |
| Simples Nacional | DAS, eSocial | DEFIS, DIRF, RAIS |
| Lucro Presumido | DCTF, EFD-ICMS/IPI, EFD Contribuicoes, EFD-Reinf, eSocial | SPED ECD, SPED ECF, DIRF, RAIS |
| Lucro Real | DCTF, EFD-ICMS/IPI, EFD Contribuicoes, EFD-Reinf, eSocial | SPED ECD, SPED ECF, DIRF, RAIS |
| Imune/Isento | nenhuma nesta versao | nenhuma nesta versao |

Regras de vencimento:

| Obrigacao | Vencimento base |
| --- | --- |
| DAS | dia 20 do mes seguinte |
| DCTF | dia 15 do segundo mes seguinte |
| EFD-ICMS/IPI | dia 15 do mes seguinte |
| EFD Contribuicoes | dia 15 do mes seguinte |
| EFD-Reinf | dia 15 do mes seguinte |
| eSocial | dia 7 do mes seguinte |
| SPED ECD | 31/05 do ano seguinte |
| SPED ECF | 31/07 do ano seguinte |
| DIRF | ultimo dia de fevereiro do ano seguinte |
| RAIS | 31/03 do ano seguinte |
| DEFIS | 31/03 do ano seguinte |

Feriados nacionais ficaram fora do escopo. Apenas fins de semana sao tratados.

### Application

Use cases implementados:

- `CreateEmpresaUseCase`: cria empresa, normaliza CNPJ, valida entrada e gera
  obrigacoes futuras.
- `GetEmpresasUseCase`: lista empresas com saldo de pendencias.
- `DeleteEmpresaUseCase`: remove empresa.
- `GetCalendarioUseCase`: lista obrigacoes por filtros de empresa, ano, mes e
  status.
- `GetAlertasUseCase`: lista obrigacoes atrasadas e vencendo.
- `GetDashboardUseCase`: consolida KPIs do mes.
- `RegistrarEntregaUseCase`: registra entrega de obrigacao.

DTOs implementados:

- `EmpresaDto`
- `CreateEmpresaDto`
- `ObrigacaoDto`
- `AlertaDto`
- `DashboardDto`
- `EntregaDto`
- `RegistrarEntregaDto`

Hardening aplicado:

- `CreateEmpresaUseCase` valida razao social obrigatoria, tamanho maximo,
  CNPJ com 14 digitos e regime dentro do enum.
- `RegistrarEntregaUseCase` valida observacao com limite e conflito de entrega
  duplicada.
- `ConflictException` representa conflito de estado da aplicacao.
- `ValidationException` centraliza erros de validacao por campo.
- `NotFoundException` representa recursos inexistentes.

### Infrastructure

Implementado:

- `AppDbContext` com EF Core.
- Repositorios `EmpresaRepository` e `ObrigacaoRepository`.
- Migration `InitialCreate`.
- Seed automatico em `DatabaseSeeder`.
- Registro de servicos em `ServiceCollectionExtensions`.

Persistencia:

- PostgreSQL 16.
- Migrations versionadas em `backend/src/Infrastructure/Persistence/Migrations`.
- `Competencia` mantida como value object no Domain, mas persistida por colunas
  escalares `CompetenciaAno` e `CompetenciaMes` para permitir indice composto.
- CNPJ armazenado sem mascara.
- Datas criadas em UTC.

Seed:

- Empresas de demonstracao para Simples Nacional, Lucro Presumido, Lucro Real e
  Imune/Isento.
- Obrigacoes geradas a partir da engine.
- Algumas obrigacoes vencidas recebem entrega automatica para criar massa de
  dashboard/alertas.

### Api

Endpoints:

- `GET /api/empresas`
- `POST /api/empresas`
- `DELETE /api/empresas/{id}`
- `GET /api/obrigacoes?empresaId=&ano=&mes=&status=`
- `GET /api/obrigacoes/alertas`
- `GET /api/obrigacoes/dashboard`
- `POST /api/entregas`
- `GET /health`
- `GET /openapi/v1.json`
- `GET /scalar` em ambiente Development

Recursos HTTP:

- Minimal APIs com extension methods por feature.
- CORS para frontend local em `http://localhost:5173`.
- Problem Details.
- OpenAPI via `Microsoft.AspNetCore.OpenApi`.
- Scalar UI em Development.
- Migrations e seed aplicados no startup.

Tratamento de erros:

- Validacao retorna `ValidationProblem`.
- Conflito retorna 409.
- Recurso inexistente retorna 404.
- `ArgumentOutOfRangeException` vira validacao generica e fica logada.
- `DbUpdateException` vira conflito previsivel.
- Erro inesperado retorna mensagem generica e fica registrado em log.

## Frontend Implementado

### App Shell

O app principal usa Ant Design `Layout` e `Menu` com tres areas:

- Relatorio fiscal.
- Calendario.
- Empresas.

O header mostra a URL base da API. Depois do ajuste de ambiente dev, o fallback
passou a ser `http://localhost:5179`.

### Providers

`AppProviders` configura:

- `ConfigProvider` do Ant Design com locale `pt_BR`.
- Tema visual do produto.
- `QueryClientProvider`.
- Defaults do TanStack Query:
  - `refetchOnWindowFocus: false`
  - `staleTime: 30_000`
  - `retry: 1`

### Router

Arquivos:

- `frontend/src/app/App.tsx`
- `frontend/src/app/router.tsx`
- `frontend/src/app/AppShell.tsx`
- `frontend/src/app/navigation.tsx`
- `frontend/src/routes/__root.tsx`
- `frontend/src/routes/index.tsx`
- `frontend/src/routes/dashboard.tsx`
- `frontend/src/routes/calendario.tsx`
- `frontend/src/routes/empresas.tsx`
- `frontend/src/routeTree.gen.ts`

Responsabilidades:

- `App.tsx` monta apenas o `RouterProvider`.
- `router.tsx` cria o router com a `routeTree` gerada e injeta `queryClient` no
  contexto.
- `AppShell` centraliza layout, sidebar, header e `Outlet`.
- `routes` mapeia URL para feature e cuida de search params.
- `features` continuam como telas de dominio e nao conhecem detalhes do router,
  exceto callbacks recebidos por props.

Exemplo:

```tsx
// frontend/src/app/App.tsx
export function App() {
  return <RouterProvider router={router} />;
}
```

```tsx
// frontend/src/routes/calendario.tsx
export const Route = createFileRoute("/calendario")({
  validateSearch: validateCalendarioSearch,
  component: CalendarioRoute
});
```

O calendario usa search params tipados para tornar filtros navegaveis:

```text
/calendario?ano=2026&mes=6&status=2
```

Isso permite recarregar a pagina, compartilhar link e reproduzir a mesma visao
sem guardar filtros em estado escondido do componente.

### API Client

Arquivos:

- `frontend/src/api/http.ts`
- `frontend/src/api/client.ts`
- `frontend/src/api/hooks.ts`
- `frontend/src/api/types.ts`

Responsabilidades:

- Montar URL com query string.
- Enviar JSON em POST/DELETE quando necessario.
- Ler payload de erro.
- Transformar erro HTTP em `ApiError`.
- Expor funcoes `api.getDashboard`, `api.getAlertas`, `api.getEmpresas`,
  `api.createEmpresa`, `api.deleteEmpresa`, `api.getObrigacoes` e
  `api.registrarEntrega`.
- Expor hooks de query/mutation.
- Invalidar dashboard, alertas, empresas e obrigacoes apos mutations.

### Dashboard

Arquivos:

- `DashboardPage.tsx`
- `MetricCards.tsx`
- `StatusOverview.tsx`
- `AlertasPanel.tsx`

Funcionalidades:

- KPIs de empresas, obrigacoes do mes, pendentes, entregues e atrasadas.
- Distribuicao por status.
- Lista de alertas atrasados ou vencendo.
- Botao para abrir calendario.
- Mensagem de erro quando API nao responde.

### Calendario

Arquivos:

- `CalendarioPage.tsx`
- `ObrigacoesTable.tsx`
- `EntregaModal.tsx`
- `exportCsv.ts`

Funcionalidades:

- Filtro por empresa.
- Filtro por competencia mensal.
- Filtro por status.
- Tabela com obrigacao, empresa, competencia, vencimento, periodicidade, status
  e data de conclusao.
- Acao para registrar entrega.
- Modal com data de conclusao e observacao.
- Exportacao CSV do calendario filtrado.

### Empresas

Arquivos:

- `EmpresasPage.tsx`
- `EmpresasTable.tsx`

Funcionalidades:

- Cadastro de empresa com razao social, CNPJ e regime tributario.
- Mascara visual de CNPJ.
- Envio de CNPJ somente com digitos.
- Listagem de empresas.
- Exibicao de pendencias por empresa.
- Remocao com confirmacao.

### Utilitarios

Arquivos:

- `shared/utils/domain.ts`: labels, cores e normalizacao de enums.
- `shared/utils/formatters.ts`: datas, competencia, CNPJ, digitos e urgencia.
- `shared/utils/errors.ts`: mensagem de erro para UI.

Observacao: labels/enums ainda sao manuais. Isso e aceitavel para o case, mas
pode virar drift se o backend mudar. Cliente gerado por OpenAPI ou testes de
contrato ficam como evolucao.

## Docker e Ambiente

### Compose Principal

Arquivo: `docker-compose.yml`.

Hoje sobe:

- PostgreSQL 16.
- API .NET em `http://localhost:8080`.

Inclui:

- Healthcheck do banco.
- Healthcheck da API.
- Rede `painel`.
- Volume `postgres_data`.

O frontend ainda roda localmente via Vite nesta etapa. Compose full-stack com
frontend fica como fase futura de entrega/demo/release, se o requisito for
cobrado literalmente.

### Compose Dev

Arquivo: `docker-compose.dev.yml`.

Sobe apenas:

- PostgreSQL 16 em `localhost:5432`.

Fluxo dev aprovado:

```bash
docker compose -f docker-compose.dev.yml up -d
dotnet run --project backend/src/Api/PainelObrigacoes.Api.csproj --launch-profile http
cd frontend
npm run dev
```

Portas:

- Banco dev: `localhost:5432`.
- API local: `http://localhost:5179`.
- Frontend local: `http://localhost:5173`.

O frontend usa `http://localhost:5179` por padrao. Para apontar para a API do
Compose principal em `8080`, usar `frontend/.env.local`.

## Validacoes Executadas

Backend:

- `dotnet build backend/PainelObrigacoes.sln`: passou.
- `dotnet test backend/PainelObrigacoes.sln`: passou, 18 testes.
- Checagem de arquivos `.cs`: nenhum acima de 250 linhas.
- Busca de imports proibidos no Domain/Application: sem ocorrencias relevantes.
- `git diff --check`: sem erro bloqueante de whitespace, apenas avisos normais
  de CRLF/LF no Windows.

Frontend:

- `npm ls react react-dom @types/react @types/react-dom`: confirmou React
  `18.3.1`.
- `npm run build`: passou.
- `npm audit --audit-level=moderate`: 0 vulnerabilidades.
- `npm ls react-router`: pacote legado ausente.
- Checagem de tamanho: maior fonte em `frontend/src` segue com 219 linhas.
- Browser local: SPA validada em `/dashboard`,
  `/calendario?ano=2026&mes=6&status=2` e `/empresas`.

Avisos conhecidos:

- API local nao estava rodando durante a verificacao visual do frontend; o
  `Failed to fetch` observado foi esperado nesse contexto.
- Produção/Docker ainda precisa fallback SPA para refresh em rotas internas.

## Uso de IA

IA foi usada como par de programacao e acelerador de pesquisa, nao como piloto
automatico.

Uso pratico:

- Leitura do case e transformacao em fases.
- Pesquisa em documentacao oficial de .NET, EF Core, Minimal APIs, Vite,
  React, Ant Design, TanStack Query e TanStack Router.
- Geracao inicial de codigo.
- Revisao de constraints.
- Criacao de planos, achados e documentacao.
- Validacao assistida com build, testes, audit e browser.

Decisoes humanas importantes:

- Manter `PainelObrigacoes.sln` dentro de `backend/`.
- Tratar o produto como Painel de Obrigacoes Acessorias e "calendario fiscal
  inteligente" como descricao funcional.
- Manter testes automatizados apenas no Domain por enquanto.
- Tratar React 18+ do case como React 18.x, nao React 19.
- Usar TanStack Router em vez de React Router para manter coerencia com
  TanStack Query e ganhar search params tipados.
- Manter API e frontend locais em desenvolvimento, com `docker-compose.dev.yml`
  apenas para banco/infra.
- Deixar Compose full-stack de entrega para fase propria.

Correcao relevante durante o desenvolvimento:

- A ideia inicial de indexar membro aninhado de complex property no EF Core para
  `Competencia` foi corrigida. A solucao final persistiu `CompetenciaAno` e
  `CompetenciaMes` como colunas escalares, mantendo o Domain puro e o indice
  composto funcional.

## Decisoes Tecnicas

| Area | Decisao | Motivo |
| --- | --- | --- |
| Produto | Nome oficial `Painel de Obrigacoes Acessorias` | Alinha o produto ao case; calendario fiscal e descricao funcional. |
| Backend | Clean Architecture | Mantem regra fiscal isolada de HTTP/EF. |
| API | Minimal APIs por feature | Atende requisito e evita `Program.cs` inchado. |
| Use cases | Classes explicitas sem MediatR | Escopo nao precisa de indirecao extra. |
| Domain | Engine hardcoded | Case pede engine clara e testavel; mudancas exigem deploy. |
| Persistencia | Obrigacoes persistidas | Facilita dashboard, alertas e filtros. |
| Competencia | Value object + colunas escalares no EF | Mantem Domain puro e permite indice composto. |
| Frontend | React 18 + Vite + TypeScript | Atende requisito do case. |
| Rotas frontend | TanStack Router file-based | Deixa layout, paginas e URL state explicitos sem migrar para Next.js. |
| UI | Ant Design | Componentes estruturais prontos para ferramenta operacional. |
| Estado servidor | TanStack Query | Cache, loading, erro, mutation e invalidacao. |
| Dev Docker | Compose dev apenas para PostgreSQL | Facilita debug local da API e HMR do frontend. |
| Entrega Docker | Compose full-stack futuro | Separado do fluxo dev para nao quebrar produtividade. |

## Riscos e Pendencias

Backend:

- Adicionar testes de Application/API/Infrastructure quando o backend estabilizar.
- Rever estrategia de status derivado vs persistido para volumes maiores.
- Ajustar queries de alertas/status se performance virar problema.
- Revisar contrato de data de entrega: data civil vs instante UTC.
- Adicionar health check de banco se necessario para entrega mais robusta.

Frontend:

- Adicionar validacao local de CNPJ com 14 digitos e limites de texto.
- Reduzir drift de DTOs/enums com cliente gerado por OpenAPI ou testes de
  contrato.
- Tratar API offline de forma mais global.
- Adicionar lint/testes leves para utils, CSV e formularios.
- Adicionar E2E smoke para fluxo principal.
- Rever bundle de Ant Design se tamanho de chunk virar problema real.

Docker/entrega:

- Decidir e implementar Compose full-stack com frontend se a entrega final
  exigir literalmente um unico `docker compose up --build` com frontend, API e
  banco.
- Separar claramente modo dev e modo release/demo.

Documentacao/processo:

- Atualizar esta documentacao a cada fase relevante.
- Atualizar `docs/ia-showcase-guide.md` antes de commits, conforme
  `docs/agents.md`.
- Fazer stage/commit apenas quando o usuario pedir.

## Como Apresentar

Roteiro curto:

1. Mostrar o problema: controlar obrigacoes acessorias por regime, vencimento e
   entrega.
2. Mostrar backend: Domain puro, engine testada, use cases e API Minimal.
3. Mostrar persistencia: EF Core, PostgreSQL, migration e seed.
4. Mostrar frontend: dashboard, calendario, empresas, entrega, CSV e rotas com
   TanStack Router.
5. Mostrar ambiente: Compose dev para banco, API local e Vite local.
6. Mostrar validacoes: `dotnet test`, `dotnet build`, `npm run build`,
   `npm audit`.
7. Fechar com pendencias honestas: feriados fora do escopo, Compose full-stack
   futuro, testes fora do Domain e fallback SPA em producao.

Mensagem de defesa:

> A regra fiscal esta no backend, isolada e testada. O frontend e uma SPA React
> 18 que consome contratos HTTP e nao recalcula obrigacoes. Usei TanStack Router
> para deixar rotas e filtros na URL, enquanto TanStack Query continua cuidando
> dos dados da API. Separei o fluxo dev do fluxo de entrega: em desenvolvimento
> uso PostgreSQL em Docker, API local e Vite local para facilitar debug e HMR.
> As decisoes e validacoes foram documentadas para deixar claro o que esta
> pronto, o que foi validado e o que fica para proxima fase.

## Justificativa Final de Arquitetura Frontend

Resposta pronta para demo:

> Eu nao usei rota so para "chamar outro arquivo". A refatoracao separou
> responsabilidades: `App.tsx` monta o router, `AppShell` cuida do layout,
> `routes` cuidam de URL/search params e `features` cuidam da tela de negocio.
> TanStack Router foi escolhido porque o projeto ja usa TanStack Query: um cuida
> de navegacao e URL state; o outro cuida de server state.

Exemplo de `App.tsx` leve:

```tsx
export function App() {
  return <RouterProvider router={router} />;
}
```

Exemplo de rota com contrato de search params:

```tsx
export const Route = createFileRoute("/calendario")({
  validateSearch: validateCalendarioSearch,
  component: CalendarioRoute
});
```

Exemplo de feature sem conhecer o router:

```tsx
<DatePicker
  picker="month"
  value={selectedMonth}
  onChange={(value) =>
    value && onFiltersChange({ ano: value.year(), mes: value.month() + 1 })
  }
/>
```

Como responder se perguntarem por Next.js:

> Next.js mudaria o modelo de execucao para um framework full-stack/SSR. O case
> pede uma SPA React 18 + Vite consumindo API .NET, entao mantive esse desenho e
> adicionei rotas client-side bem tipadas.

Como responder se perguntarem por React Router:

> React Router resolveria navegacao basica. TanStack Router trouxe type-safety,
> search params validados e coesao com TanStack Query, que ja era a biblioteca
> de estado servidor do projeto.
