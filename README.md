# Painel de Obrigacoes Acessorias

Aplicacao full-stack para o case tecnico da e-Auditoria. O produto funciona como
um calendario fiscal inteligente para controlar obrigacoes acessorias por
empresa, regime tributario, competencia, vencimento e status.

O sistema nao calcula impostos. Ele gera e acompanha obrigacoes acessorias.

## Rodar Localmente

Pre-requisitos:

- Docker
- Docker Compose

Comando unico da entrega:

```bash
docker compose up --build
```

Acessos:

- Frontend: `http://localhost:8081`
- API: `http://localhost:8080`
- Health check: `http://localhost:8080/health`
- Documentacao da API: `http://localhost:8080/scalar`
- PostgreSQL: servico interno `db:5432` na rede do Compose

Na primeira subida, a API aplica migrations, sincroniza feriados nacionais pela
BrasilAPI, cria o cache local de feriados e executa o seed automatico.

Para recriar a base de demonstracao:

```bash
docker compose down -v
docker compose up --build
```

Use `down -v` apenas quando quiser apagar o volume local do PostgreSQL.

## Dados de Demonstracao

O seed cria 20 empresas dos regimes Simples Nacional, Lucro Presumido, Lucro
Real e Imune/Isento. A massa inclui obrigacoes pendentes, atrasadas e entregues,
com entregas antes, no dia e apos o vencimento.

Empresas Imune/Isento nao geram obrigacoes nesta versao. Essa decisao foi
documentada porque o case informa dispensa da maioria das obrigacoes, mas nao
define uma matriz especifica para esse regime.

## Funcionalidades Entregues

- Gestao de empresas com CNPJ e regime tributario.
- Calendario mensal de obrigacoes por empresa, competencia, vencimento e status.
- Registro de entrega com data de conclusao.
- Painel de alertas com atrasadas e vencendo nos proximos 30 dias.
- Dashboard com visao consolidada de empresas e obrigacoes.
- Exportacao do calendario em CSV/PDF.
- Geracao automatica de obrigacoes futuras ao cadastrar empresa.

## Stack

- Backend: .NET 9, Minimal APIs, EF Core 9 e PostgreSQL 16.
- Frontend: React 18, Vite, TypeScript, Ant Design, TanStack Query,
  TanStack Router e Tailwind CSS.
- Testes: xUnit e FluentAssertions.
- Entrega: Docker Compose com `db`, `api` e `frontend`.

## Principais Decisoes Tecnicas

- **Clean Architecture**: o case apenas recomendava separacao de
  responsabilidades. Escolhi Domain, Application, Infrastructure e Api porque a
  regra fiscal e o nucleo do sistema.
- **Sem CQRS/MediatR**: era uma opcao aberta, mas application services diretos,
  um por operacao, resolveram o escopo sem adicionar camada extra.
- **Estrutura de pastas**: o case deixava livre. Usei monorepo com `backend/` e
  `frontend/`; backend por camadas e frontend organizado em `api`, `app`,
  `routes`, `features` e `shared`.
- **Tratamento de erros**: escolhi Problem Details, validacao padronizada,
  erros de conflito/not found, logs para erro inesperado e
  `traceId`/`correlationId` para diagnostico.
- **Estrategia de seed**: usei migrations + seed automatico no startup, com
  massa realista e empresas em varios regimes para demonstracao imediata.
- **Design system**: a paleta do case era inspiracao. Mantive uma interface SaaS
  operacional, com Ant Design como base e Tailwind/CSS para acabamento visual.
- **TanStack Router**: nao era obrigatorio. Escolhi para rotas, layout e filtros
  na URL, deixando TanStack Query focado em server state.
- **Estado de UI**: o case deixava livre Zustand, Context ou similar. Preferi
  URL state com TanStack Router/search params e estado local React quando era
  suficiente.
- **Persistencia de obrigacoes**: o case exigia calcular e mostrar obrigacoes,
  mas nao definia persistencia. Persisti os registros para facilitar dashboard,
  alertas, entregas e consultas eficientes.
- **Engine hardcoded no Domain**: o case exigia uma engine, mas nao definia se
  as regras viriam de banco, JSON ou configuracao. Usei uma engine hardcoded,
  stateless e testavel.
- **`Competencia` como value object**: modelei competencia como conceito de
  dominio. No banco, ano e mes ficam em colunas escalares para permitir indices
  confiaveis no EF/PostgreSQL.
- **Feriados nacionais**: o PDF citava prorrogacao explicitamente no DAS. A
  decisao foi aplicar fim de semana e feriado nacional a todos os vencimentos do
  perfil do case, usando BrasilAPI + cache local.
- **Imune/Isento sem obrigacoes**: o case diz que ha dispensa da maioria das
  obrigacoes, mas nao fornece matriz. Documentei a decisao de gerar zero
  obrigacoes nesta versao.
- **OpenAPI/Scalar**: documentacao interativa nao era exigida. Usei
  `Microsoft.AspNetCore.OpenApi` + Scalar para facilitar demonstracao da API.
- **Nginx no frontend**: Docker Compose era obrigatorio, mas a forma de servir a
  SPA nao. Usei build Vite + Nginx com fallback para rotas client-side.

Mais detalhes de arquitetura estao em `architecture.md`.

## Testes e Validacao

Comandos principais:

```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
npm run build --prefix frontend
docker compose config
```

Os testes cobrem engine de regras tributarias, vencimentos, status,
competencia, cadastro, dashboard, alertas, geracao futura e fluxos de
integracao HTTP da API.

## Uso de IA

Eu conduzi as decisoes tecnicas, implementei, revisei e validei a entrega. As
ferramentas de IA foram usadas como apoio, nao como piloto automatico.

- GitHub Copilot: sugestoes pontuais de codigo, bugs pequenos e autocomplete.
- Claude Code/Codex: conversa tecnica, pesquisa, comparacao de alternativas e
  revisao de arquitetura.

A regra fiscal veio do PDF do case. Um exemplo de revisao humana foi
`Competencia`: a primeira abordagem com membro aninhado no indice do EF Core foi
descartada depois da validacao com migration, e substituida por colunas
escalares.

## Limitacoes Documentadas

- Regras fiscais reais que divergirem do PDF ficam fora do escopo do case.
- Feriados estaduais, municipais, pontos facultativos e regras por UF nao entram
  nesta versao.
- Na primeira execucao com banco vazio, a API precisa acessar a BrasilAPI para
  montar o cache inicial de feriados nacionais; depois usa o snapshot local.

Mais detalhes fiscais estao em `docs/decisoes-fiscais-case.md`.
