# Painel de Obrigações Acessórias

Aplicação full-stack para o case técnico da e-Auditoria. O nome do produto é
**Painel de Obrigações Acessórias**; sua função principal é ser um calendário
fiscal inteligente. O sistema não calcula impostos: ele gera obrigações
acessórias por regime tributário, calcula vencimentos e permite registrar
entregas.

## Stack
- .NET 9 com Minimal APIs
- Clean Architecture com DDD leve
- Entity Framework Core 9
- PostgreSQL 16
- React + Vite em `frontend/` quando a SPA for implementada
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
      pages/
      shared/
  docs/
  docker-compose.yml
```

O repositório é um monorepo: backend, frontend, docs e Docker Compose ficam no
mesmo Git. A solution .NET fica dentro de `backend/`, então não precisa repetir
"Backend" no nome. O React/Vite é uma SPA separada que consumirá a API.

## Como Rodar
Pré-requisitos: Docker e Docker Compose.

```bash
docker compose up --build
```

API:
- `http://localhost:8080/health`
- `http://localhost:8080/openapi/v1.json`
- `http://localhost:8080/scalar` em ambiente Development

Banco:
- Host local: `localhost:5432`
- Database: `painel_obrigacoes`
- Usuário/senha: `postgres/postgres`

## Desenvolvimento Local
Para desenvolver e debugar no Visual Studio, use o Compose de desenvolvimento
apenas com PostgreSQL e rode a API localmente. Ele usa a mesma porta `5432` do
`appsettings.json`, então pare o Compose completo antes de subir o banco dev.

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

- `http://localhost:5179/health`
- `http://localhost:5179/openapi/v1.json`
- `http://localhost:5179/scalar`

Comandos úteis:

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
é publicada em `Release` pelo Dockerfile, mas o Compose principal mantém
`ASPNETCORE_ENVIRONMENT=Development` para expor o Scalar na demonstração. O
arquivo `docker-compose.dev.yml` é auxiliar para desenvolvimento e pode ser
removido antes da entrega final se você quiser deixar só o Compose de
demonstração.

## Endpoints
- `GET /api/empresas`
- `POST /api/empresas`
- `DELETE /api/empresas/{id}`
- `GET /api/obrigacoes?empresaId=&ano=&mes=&status=`
- `GET /api/obrigacoes/alertas`
- `GET /api/obrigacoes/dashboard`
- `POST /api/entregas`

## Decisões Técnicas
- Domain é puro, sem dependência de `Microsoft.*`, EF Core ou ASP.NET.
- A engine tributária (`ObrigacaoRulesEngine`) e o cálculo de vencimentos
  (`VencimentoCalculator`) são stateless e testáveis sem banco.
- Obrigações são persistidas no cadastro/seed para facilitar dashboard e alertas.
- `Competencia` é um value object `struct` imutável no Domain. Para o índice
  composto no EF Core, a entidade persiste `CompetenciaAno` e `CompetenciaMes`
  como colunas escalares e expõe `Competencia` como valor calculado.
- OpenAPI usa o suporte integrado do .NET 9 com Scalar UI em desenvolvimento.
- Migrations e seed rodam automaticamente no startup, adequado para demo/case.

## Limitações Conhecidas
- Feriados nacionais não foram implementados; apenas fins de semana prorrogam
  vencimentos para a próxima segunda-feira.
- Regime Imune/Isento não gera obrigações nesta versão.
- O Compose atual sobe backend e PostgreSQL. O serviço frontend será adicionado
  quando a etapa React/Vite/Ant Design for implementada.

## Testes
```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
```

Cobertura atual: engine de regras, cálculo de vencimentos e value object de
competência.

## Uso de IA
Usei Codex para acelerar pesquisa oficial, implementação guiada por fases e
validação de constraints. A principal correção humana/arquitetural foi ajustar
o mapeamento de `Competencia`: o plano inicial tentou usar membro aninhado de
complex property no índice EF, mas a migration validou que colunas escalares
eram a opção mais segura para manter o Domain imutável.

Para preparar a defesa técnica e o showcase, veja `docs/ia-showcase-guide.md`.
