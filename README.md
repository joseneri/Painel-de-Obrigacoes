# Painel de Obrigacoes Acessorias

Aplicacao full-stack para o case tecnico da e-Auditoria. O nome do produto e
**Painel de Obrigacoes Acessorias**; sua funcao principal e ser um calendario
fiscal inteligente. O sistema nao calcula impostos: ele gera obrigacoes
acessorias por regime tributario, calcula vencimentos e permite registrar
entregas.

## Stack

- .NET 9 com Minimal APIs
- Clean Architecture com DDD leve
- Entity Framework Core 9
- PostgreSQL 16
- React 18 + Vite em `frontend/`
- TanStack Query + TanStack Router no frontend
- xUnit + FluentAssertions
- Docker + Docker Compose

## Estrutura

```text
painel-obrigacoes/
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
      features/
      routes/
      shared/
  docs/
  docker-compose.yml
  docker-compose.dev.yml
```

O repositorio e um monorepo: backend, frontend, docs e Docker Compose ficam no
mesmo Git. A solution .NET fica dentro de `backend/`, entao nao precisa repetir
"Backend" no nome. O React/Vite e uma SPA separada que consome a API.

## Como Rodar Demo

Pre-requisitos: Docker e Docker Compose.

O Compose principal sobe API e PostgreSQL:

```bash
docker compose up --build
```

API no Compose principal (Docker/demo):

- `http://localhost:8080/health`
- `http://localhost:8080/openapi/v1.json`
- `http://localhost:8080/scalar` em ambiente Development

Essas URLs em `8080` so respondem quando a API estiver rodando pelo
`docker compose up --build`. No desenvolvimento local com `dotnet run` ou
Visual Studio, use as URLs em `5280` da secao "Desenvolvimento Local".

Frontend local:

- `http://localhost:5241`

Banco:

- Host local: `localhost:5432`
- Database: `painel_obrigacoes`
- Usuario/senha: `postgres/postgres`

Se o frontend local precisar consumir a API do Compose principal em `8080`,
configure `frontend/.env.local` com:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Desenvolvimento Local

Para desenvolver e debugar, use o Compose de desenvolvimento apenas com
PostgreSQL e rode API + frontend localmente. Ele usa a mesma porta `5432` do
`appsettings.json`, entao pare o Compose completo antes de subir o banco dev.

```bash
docker compose down
docker compose -f docker-compose.dev.yml up -d
dotnet run --project backend/src/Api/PainelObrigacoes.Api.csproj --launch-profile http
```

No Visual Studio:

- Abra `backend/PainelObrigacoes.sln`.
- Defina `PainelObrigacoes.Api` como startup project.
- Escolha o profile `http`.
- Rode com F5 para debugar.

URLs no modo desenvolvimento local:

- `http://localhost:5280/health`
- `http://localhost:5280/openapi/v1.json`
- `http://localhost:5280/scalar`
- `http://localhost:5280/scalar/#tag/painelobrigacoesapi`

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Por padrao o frontend consome a API local em `http://localhost:5280`, alinhado
ao `dotnet run --launch-profile http`. O arquivo `frontend/.env.example`
registra esse valor.

Comandos uteis:

```bash
# Parar o banco de desenvolvimento
docker compose -f docker-compose.dev.yml down

# Resetar os dados de desenvolvimento
docker compose -f docker-compose.dev.yml down -v

# Voltar para o modo entrega/demo com API + banco em Docker
docker compose -f docker-compose.dev.yml down
docker compose up --build -d
```

No modo entrega/demo, a API volta para `http://localhost:8080`. A imagem da API
e publicada em `Release` pelo Dockerfile, mas o Compose principal mantem
`ASPNETCORE_ENVIRONMENT=Development` para expor o Scalar na demonstracao. O
arquivo `docker-compose.dev.yml` e auxiliar para desenvolvimento: ele sobe o
banco/infra, enquanto API e frontend rodam localmente.

## Endpoints

- `GET /api/empresas`
- `POST /api/empresas`
- `DELETE /api/empresas/{id}`
- `GET /api/obrigacoes?empresaId=&ano=&mes=&status=`
- `GET /api/obrigacoes/alertas`
- `GET /api/obrigacoes/dashboard`
- `POST /api/entregas`

## Decisoes Tecnicas

- Domain e puro, sem dependencia de `Microsoft.*`, EF Core ou ASP.NET.
- A engine tributaria (`ObrigacaoRulesEngine`) e o calculo de vencimentos
  (`VencimentoCalculator`) sao stateless e testaveis sem banco.
- Obrigacoes sao persistidas no cadastro/seed para facilitar dashboard e
  alertas.
- `Competencia` e um value object `struct` imutavel no Domain. Para o indice
  composto no EF Core, a entidade persiste `CompetenciaAno` e `CompetenciaMes`
  como colunas escalares e expoe `Competencia` como valor calculado.
- OpenAPI usa o suporte integrado do .NET 9 com Scalar UI em desenvolvimento.
- Migrations e seed rodam automaticamente no startup, adequado para demo/case.
- O frontend usa TanStack Router file-based para deixar `App.tsx` pequeno,
  separar layout/rotas/features e manter filtros do calendario na URL.
- TanStack Query continua responsavel por dados da API; TanStack Router cuida
  de navegacao e estado de URL.

## Limitacoes Conhecidas

- Feriados nacionais nao foram implementados; apenas fins de semana prorrogam
  vencimentos para a proxima segunda-feira.
- Regime Imune/Isento nao gera obrigacoes nesta versao.
- O Compose principal atual sobe backend e PostgreSQL. O frontend roda
  localmente via Vite nesta etapa.

## Testes

```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
```

Cobertura atual: engine de regras, calculo de vencimentos e value object de
competencia.

## Uso de IA

Usei Codex para acelerar pesquisa oficial, implementacao guiada por fases e
validacao de constraints. A principal correcao humana/arquitetural foi ajustar
o mapeamento de `Competencia`: o plano inicial tentou usar membro aninhado de
complex property no indice EF, mas a migration validou que colunas escalares
eram a opcao mais segura para manter o Domain imutavel.

Para estudar o projeto inteiro em ordem didatica no rich view do Codex, veja
`tmp/documentacao-preview-fe-be.md`.
Para preparar a defesa tecnica e o showcase, veja
`docs/ia-interna/ia-showcase-guide.md`.
Para um inventario detalhado do que ja foi implementado em backend, frontend,
Docker, validacoes e proximas fases, veja
`docs/ia-interna/implementation-summary.md`.
