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
  docker-compose.dev.yml
```

`docker-compose.dev.yml` e um arquivo auxiliar para desenvolvimento local. Ele
sobe apenas o PostgreSQL, permitindo rodar e debugar a API pelo Visual Studio ou
por `dotnet run`. Para a entrega/demo, o Compose principal continua sendo
`docker-compose.yml`.

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
    Domain.Tests/
```

Projetos atuais:

- `PainelObrigacoes.Domain`: entidades, enums, value objects e regras fiscais.
- `PainelObrigacoes.Application`: use cases, DTOs e validacoes de fluxo.
- `PainelObrigacoes.Infrastructure`: EF Core, PostgreSQL, repositories, seed e
  migrations.
- `PainelObrigacoes.Api`: Minimal API, DI, OpenAPI, CORS e startup.
- `PainelObrigacoes.Domain.Tests`: testes unitarios da engine.

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
- Search params tipados para filtros navegaveis, como o calendario.
- TanStack Query para cache, loading, erros, mutations e invalidacao de dados.
- Componentes Ant Design.
- Chamadas HTTP para a API.

O frontend nao entra no Domain do backend e nao replica a engine fiscal. Ele
consome contratos HTTP expostos por `backend/src/Api`.
