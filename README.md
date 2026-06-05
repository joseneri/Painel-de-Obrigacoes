# Painel de Obrigações Acessórias

Backend .NET 9 para o case técnico da e-Auditoria. O sistema é um calendário
fiscal: ele não calcula impostos; gera obrigações acessórias por regime
tributário, calcula vencimentos e permite registrar entregas.

## Stack
- .NET 9 com Minimal APIs
- Clean Architecture com DDD leve
- Entity Framework Core 9
- PostgreSQL 16
- xUnit + FluentAssertions
- Docker + Docker Compose

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
