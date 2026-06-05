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
    PainelObrigacoes.Backend.sln
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
mesmo Git. A solution .NET é apenas do backend. O React/Vite é uma SPA separada
que consumirá a API.

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
dotnet test backend/PainelObrigacoes.Backend.sln --configuration Release
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
