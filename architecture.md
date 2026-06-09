# Architecture Decision Record: Painel de Obrigacoes Acessorias

## Stack

- Runtime: .NET 9
- API: Minimal APIs com extension methods por feature
- ORM: Entity Framework Core 9
- Banco: PostgreSQL 16
- Frontend: React + Vite em aplicacao SPA separada
- Rotas frontend: TanStack Router file-based
- Server state frontend: TanStack Query
- Testes: xUnit + FluentAssertions
- Container: Docker + Docker Compose

## Organizacao do Repositorio

- `backend/`: solution .NET exclusiva do backend.
- `backend/src/Api`: camada HTTP e composition root.
- `backend/src/Application`: application services e DTOs.
- `backend/src/Domain`: regras fiscais puras.
- `backend/src/Infrastructure`: EF Core, seed, migrations e repositorios.
- `backend/tests`: testes automatizados do backend.
- `frontend/`: SPA React/Vite, cliente externo que consome a API.
- `docker-compose.yml`: orquestra API, frontend e banco quando a SPA existir no
  modo de entrega full-stack.

## Padroes Obrigatorios

- Clean Architecture: Domain -> Application -> Infrastructure -> Api.
- DDD leve: Domain Services para engine de regras tributarias.
- Value Object: `Competencia`, struct imutavel com ano e mes.
- Persistencia: `Competencia` mapeada em colunas proprias na tabela de
  obrigacoes.
- Repositorios: interfaces no Domain, implementacao na Infrastructure.
- Application services: um arquivo por operacao em `Application/Services`.

## Constraints

1. Domain nao pode referenciar `Microsoft.*`, `System.Data.*` nem EF Core.
2. Arquivos com maximo de 250 linhas.
3. Engine de regras stateless, sem construtor com dependencias.
4. Endpoints so chamam application services; zero logica de negocio.
5. Migrations versionadas, aplicadas automaticamente no startup.
6. Erros expostos como Problem Details.
7. CNPJ armazenado como 14 digitos sem formatacao.
8. Datas persistidas em UTC.

## Decisoes Documentadas

| Decisao | Escolha | Motivo |
| --- | --- | --- |
| Obrigacoes | Persistidas ao criar empresa | Queries de alerta e dashboard ficam simples e eficientes. |
| Regras tributarias | Hardcoded no Domain | O case pede engine explicita; mudancas exigem deploy. |
| Feriados | Apenas fins de semana | Feriados nacionais estao fora do escopo do case. |
| Imune/Isento | Zero obrigacoes | A especificacao diz dispensa da maioria; para esta versao a decisao e gerar nenhuma. |
| OpenAPI | `Microsoft.AspNetCore.OpenApi` + Scalar UI | Em .NET 9 o template nao inclui Swashbuckle por padrao. |
| `Competencia` | Struct imutavel calculada a partir de colunas escalares | EF Core nao indexa membro aninhado de complex property; `CompetenciaAno`/`CompetenciaMes` mantem o value object puro e o indice composto. |
| Rotas frontend | TanStack Router file-based | Mantem a SPA React/Vite, reduz `App.tsx`, separa layout/rotas/features e deixa filtros do calendario na URL. |
| Estado frontend | TanStack Query + TanStack Router | Query trata dados da API; Router trata navegacao, layout e URL state. |
