# Estrutura do Projeto

Nome oficial: **Painel de Obrigacoes Acessorias**.

Descricao curta: calendario fiscal inteligente para controle de obrigacoes
acessorias brasileiras.

## Monorepo

O repositorio e unico para facilitar a entrega do case:

```text
painel-obrigacoes/
  backend/
  frontend/
  docs/
  docker-compose.yml
```

`docker-compose.yml` e o arquivo de entrega. Um unico
`docker compose up --build` sobe PostgreSQL, API e frontend.

## Backend

O backend e uma solution .NET separada:

```text
backend/
  PainelObrigacoes.sln
  src/
    Api/
    Application/
    Domain/
    Infrastructure/
  tests/
    Application.Tests/
    Domain.Tests/
```

Projetos atuais:

- `PainelObrigacoes.Domain`: entidades, enums, value objects e regras fiscais.
- `PainelObrigacoes.Application`: services, DTOs e validacoes de fluxo.
- `PainelObrigacoes.Infrastructure`: EF Core, PostgreSQL, repositories, seed e
  migrations.
- `PainelObrigacoes.Api`: Minimal API, DI, CORS, health check e startup.
- `PainelObrigacoes.Domain.Tests`: testes unitarios da engine e do Domain.
- `PainelObrigacoes.Application.Tests`: testes de services de aplicacao.

## Frontend

O frontend e uma SPA React/Vite separada:

```text
frontend/
  src/
    api/
    app/
    routes/
    features/
      dashboard/
      empresas/
      obrigacoes/
    shared/
```

Responsabilidades:

- Interface do usuario.
- Rotas client-side com TanStack Router.
- Search params tipados para filtros navegaveis.
- TanStack Query para cache, loading, erros, mutations e invalidacao de dados.
- Componentes Ant Design.
- Chamadas HTTP para a API.

O frontend nao entra no Domain do backend e nao replica a engine fiscal. Ele
consome contratos HTTP expostos por `backend/src/Api`.

## Docker

O frontend e buildado por Vite e servido por Nginx. A API e publicada em
Release pelo Dockerfile do .NET. O PostgreSQL usa volume nomeado para manter os
dados entre subidas.
