# Estrutura do Projeto

Nome oficial: **Painel de Obrigações Acessórias**.

Descrição curta: calendário fiscal inteligente para controle de obrigações
acessórias brasileiras.

## Monorepo
O repositório é único para facilitar a entrega do case:

```text
painel-obrigacoes/
  backend/
  frontend/
  docs/
  docker-compose.yml
```

Isso permite um `docker compose up --build` subir API, banco e frontend quando a
SPA estiver implementada.

## Backend
O backend é uma solution .NET separada:

```text
backend/
  PainelObrigacoes.Backend.sln
  src/
    Api/
    Application/
    Domain/
    Infrastructure/
  tests/
    Domain.Tests/
```

Projetos atuais:

- `PainelObrigacoes.Domain`: entidades, enums, value objects e regras fiscais.
- `PainelObrigacoes.Application`: use cases, DTOs e validações de fluxo.
- `PainelObrigacoes.Infrastructure`: EF Core, PostgreSQL, repositories, seed e
  migrations.
- `PainelObrigacoes.Api`: Minimal API, DI, OpenAPI, CORS e startup.
- `PainelObrigacoes.Domain.Tests`: testes unitários da engine.

## Frontend
O frontend será uma SPA React/Vite separada:

```text
frontend/
  public/
  src/
    api/
    app/
    features/
      dashboard/
      empresas/
      obrigacoes/
    pages/
    shared/
```

Responsabilidade: interface do usuário, rotas client-side, TanStack Query,
componentes Ant Design e chamadas HTTP para a API.

O frontend não entra no Domain do backend. Ele consome contratos HTTP expostos
por `backend/src/Api`.

