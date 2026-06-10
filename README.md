# Painel de Obrigacoes Acessorias

Aplicacao full-stack para o case tecnico da e-Auditoria. O sistema ajuda um
escritorio contabil a controlar obrigacoes acessorias por empresa, regime
tributario, competencia, vencimento e status.

O projeto nao calcula impostos. Ele gera e acompanha obrigacoes acessorias.

## Como Rodar

Pre-requisitos:

- Docker
- Docker Compose

Comando unico da entrega:

```bash
docker compose up --build
```

Acessos:

- Frontend: `http://localhost:8081`
- API health check: `http://localhost:8080/health`
- Banco PostgreSQL: servico interno `db:5432`

Na primeira subida, a API aplica migrations, carrega feriados nacionais pela
BrasilAPI, cria o cache local de feriados e executa o seed automatico.

Para recriar a base de demonstracao:

```bash
docker compose down -v
docker compose up --build
```

Use `down -v` apenas quando quiser apagar o volume local do PostgreSQL.

## O Que Foi Entregue

- Gestao de empresas com CNPJ e regime tributario.
- Calendario mensal de obrigacoes por empresa, competencia, vencimento e status.
- Registro de entrega com data de conclusao.
- Painel de alertas com atrasadas e vencendo nos proximos 30 dias.
- Dashboard com visao consolidada de empresas e obrigacoes.
- Exportacao do calendario em CSV/PDF.
- Geracao automatica de obrigacoes futuras ao cadastrar empresa.
- Seed automatico com massa de demonstracao.

## Dados de Demonstracao

O seed cria 20 empresas dos regimes Simples Nacional, Lucro Presumido, Lucro
Real e Imune/Isento. A massa inclui obrigacoes pendentes, atrasadas e entregues,
com entregas antes, no dia e apos o vencimento.

Empresas Imune/Isento nao geram obrigacoes nesta versao. Essa decisao foi
documentada porque o case informa dispensa da maioria das obrigacoes, mas nao
define uma matriz especifica para esse regime.

## Stack

- Backend: .NET 9, Minimal APIs, EF Core 9, PostgreSQL 16.
- Frontend: React 18, Vite, TypeScript, Ant Design, TanStack Query,
  TanStack Router e Tailwind CSS.
- Testes: xUnit e FluentAssertions.
- Entrega: Docker e Docker Compose.

## Principais Decisoes Tecnicas

- Backend em Clean Architecture: Domain, Application, Infrastructure e Api.
- Domain puro, sem dependencia de ASP.NET, EF Core, `Microsoft.*` ou banco.
- Engine tributaria hardcoded no Domain, stateless e coberta por testes.
- Endpoints Minimal API chamam application services e nao concentram regra de
  negocio.
- Obrigacoes sao persistidas para facilitar dashboard, alertas e consultas por
  vencimento.
- `Competencia` fica como value object no Domain e e persistida como colunas
  escalares para permitir indice confiavel no EF/PostgreSQL.
- Fins de semana e feriados nacionais prorrogam vencimento para o proximo dia
  util; feriados ficam em cache no banco apos carga pela BrasilAPI.
- Frontend e uma SPA React/Vite: TanStack Query cuida do estado servidor e
  TanStack Router cuida de navegacao e filtros na URL.
- Ant Design e a biblioteca principal de componentes; Tailwind CSS e usado para
  refinamento visual e padronizacao de layout sem criar um design system proprio.
- O frontend nao replica regra fiscal; ele consome contratos HTTP do backend.
- O container do frontend usa Nginx para servir o build estatico do Vite e dar
  fallback para `index.html` nas rotas client-side.

## Testes e Validacao

Backend:

```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

Os testes cobrem a engine de regras tributarias, vencimentos, status,
competencia e services de aplicacao ligados a cadastro, dashboard, alertas e
geracao futura.

## Uso de IA

Usei Codex como par de programacao e acelerador de pesquisa, nao como piloto
automatico. A IA ajudou a estruturar fases, consultar documentacao oficial,
gerar codigo inicial, revisar constraints e criar testes.

As decisoes foram guiadas e revisadas manualmente. Um exemplo foi o mapeamento
de `Competencia`: a primeira abordagem com membro aninhado no indice do EF Core
foi substituida por colunas escalares depois da validacao com migration.

## Limitacoes Documentadas

- Regras fiscais reais que divergirem do PDF ficam fora do escopo do case.
- Feriados estaduais, municipais, pontos facultativos e regras por UF nao entram
  nesta versao.
- Na primeira execucao com banco vazio, a API precisa acessar a BrasilAPI para
  montar o cache inicial de feriados nacionais; depois usa o snapshot local.

Mais detalhes fiscais estao em `docs/decisoes-fiscais-case.md`.
