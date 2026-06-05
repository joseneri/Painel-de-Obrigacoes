# Architecture Decision Record: Painel de Obrigações

## Stack
- Runtime: .NET 9
- API: Minimal APIs com extension methods por feature
- ORM: Entity Framework Core 9
- Banco: PostgreSQL 16
- Testes: xUnit + FluentAssertions
- Container: Docker + Docker Compose

## Padrões Obrigatórios
- Clean Architecture: Domain -> Application -> Infrastructure -> Api.
- DDD leve: Domain Services para engine de regras tributárias.
- Value Object: `Competencia`, struct imutável com ano e mês.
- Persistência: `Competencia` mapeada em colunas próprias na tabela de obrigações.
- Repositórios: interfaces no Domain, implementação na Infrastructure.
- Use cases: um arquivo por caso de uso em `Application/UseCases`.

## Constraints
1. Domain não pode referenciar `Microsoft.*`, `System.Data.*` nem EF Core.
2. Arquivos com máximo de 250 linhas.
3. Engine de regras stateless, sem construtor com dependências.
4. Endpoints só chamam use cases; zero lógica de negócio.
5. Migrations versionadas, aplicadas automaticamente no startup.
6. Erros expostos como Problem Details.
7. CNPJ armazenado como 14 dígitos sem formatação.
8. Datas persistidas em UTC.

## Decisões Documentadas
| Decisão | Escolha | Motivo |
| --- | --- | --- |
| Obrigações | Persistidas ao criar empresa | Queries de alerta e dashboard ficam simples e eficientes. |
| Regras tributárias | Hardcoded no Domain | O case pede engine explícita; mudanças exigem deploy. |
| Feriados | Apenas fins de semana | Feriados nacionais estão fora do escopo do case. |
| Imune/Isento | Zero obrigações | A especificação diz dispensa da maioria; para esta versão a decisão é gerar nenhuma. |
| OpenAPI | `Microsoft.AspNetCore.OpenApi` + Scalar UI | Em .NET 9 o template não inclui Swashbuckle por padrão. |
| `Competencia` | Struct imutável calculada a partir de colunas escalares | EF Core não indexa membro aninhado de complex property; `CompetenciaAno`/`CompetenciaMes` mantêm o value object puro e o índice composto. |
