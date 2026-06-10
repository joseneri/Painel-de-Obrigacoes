# Painel de Obrigacoes Acessorias

Aplicacao full-stack para o case tecnico da e-Auditoria. O produto e um
calendario fiscal inteligente para controlar obrigacoes acessorias por regime
tributario. Ele nao calcula impostos: gera obrigacoes, calcula vencimentos e
permite registrar entregas.

## Como Subir Localmente

Pre-requisitos:

- Docker
- Docker Compose

Comando unico de entrega:

```bash
docker compose up --build
```

Servicos:

- Frontend: `http://localhost:8081`
- API health check: `http://localhost:8080/health`
- Banco PostgreSQL: servico interno `db:5432` na rede do Compose

Credenciais do banco no Compose:

- Database: `painel_obrigacoes`
- Usuario: `postgres`
- Senha: `postgres`

O startup da API aplica migrations e executa o seed automaticamente. Em um banco
novo, a demo nasce com 20 empresas, obrigacoes futuras e entregas variadas.

Para recriar a base de demonstracao do zero:

```bash
docker compose down -v
docker compose up --build
```

Use `down -v` apenas quando quiser apagar o volume local do PostgreSQL.

## Stack

- .NET 9 com Minimal APIs
- Entity Framework Core 9
- PostgreSQL 16
- React 18 + Vite + TypeScript
- Ant Design
- TanStack Query + TanStack Router
- xUnit + FluentAssertions
- Docker + Docker Compose

## Estrutura

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
frontend/
  src/
    api/
    app/
    features/
    routes/
    shared/
docker-compose.yml
```

O backend e a regra fiscal vivem em `backend/`. O frontend e uma SPA React/Vite
separada em `frontend/`, servida em container por Nginx no modo de entrega.

## Dados de Demonstracao

O seed automatico cria:

- 20 empresas com datas de cadastro diferentes.
- Empresas dos regimes Simples Nacional, Lucro Presumido, Lucro Real e
  Imune/Isento.
- Obrigacoes de janeiro do ano corrente ate o horizonte futuro.
- Entregas registradas antes, no dia e apos o vencimento.
- Obrigacoes pendentes, atrasadas e entregues para alimentar dashboard,
  calendario e alertas.

Empresas Imune/Isento nao geram obrigacoes nesta versao. Essa foi a decisao
documentada para o case, porque o PDF diz que ficam dispensadas da maioria das
obrigacoes, mas nao define uma matriz propria.

## Decisoes Tecnicas

O PDF deixa algumas escolhas abertas e pede que elas sejam documentadas no
README. As principais decisoes e seus motivos sao:

| Decisao | Escolha | Motivo |
| --- | --- | --- |
| Arquitetura do backend | Clean Architecture com Domain, Application, Infrastructure e Api | A regra fiscal e o nucleo do case; separar camadas deixa a engine testavel sem banco ou HTTP e evita acoplamento com frameworks. |
| Minimal APIs | Endpoints por feature chamando application services | Atende ao requisito de .NET 9 com Minimal APIs e mantem os endpoints finos, sem regra de negocio dentro da camada HTTP. |
| Domain puro | Sem dependencia de ASP.NET, EF Core, `Microsoft.*` ou banco | Preserva a regra fiscal independente de infraestrutura e facilita testes unitarios rapidos. |
| Engine tributaria | Regras hardcoded no Domain, stateless e cobertas por testes | O case define uma matriz minima fixa por regime; codigo explicito e testado e mais adequado que criar um motor configuravel fora do escopo. |
| Persistencia de obrigacoes | Obrigacoes sao geradas e salvas ao criar empresa e no seed | Dashboard, alertas e calendario ficam simples e eficientes, sem recalcular toda a agenda fiscal a cada request. |
| Geracao futura | Service idempotente roda ao cadastrar empresa e no startup da API | Entrega o diferencial do case de meses futuros e evita duplicidade quando a rotina roda mais de uma vez. |
| `Competencia` | Value object no Domain, persistido como `CompetenciaAno` e `CompetenciaMes` | Mantem o modelo de dominio expressivo e permite indice composto confiavel no PostgreSQL/EF Core. |
| Tratamento de erros | Problem Details para validacao, conflitos, nao encontrados e erros inesperados | O frontend recebe respostas previsiveis e erros internos nao vazam detalhes de excecao para o usuario. |
| Seed de demonstracao | Migrations e seed automaticos no startup, com 20 empresas | O avaliador sobe o projeto com um comando e ja encontra massa de dados para dashboard, alertas, calendario e entregas. |
| Regime Imune/Isento | Nao gera obrigacoes nesta versao | O PDF informa dispensa da maioria das obrigacoes, mas nao define matriz propria; a ausencia de obrigacoes representa `Nao Aplicavel`. |
| Frontend | SPA React/Vite com Ant Design, TanStack Query e TanStack Router | Ant Design atende ao requisito visual; Query cuida de estado servidor; Router deixa navegacao e filtros na URL. |
| Regra fiscal no frontend | Frontend consome contratos HTTP e nao replica a engine | Evita divergencia entre telas e backend; a fonte da verdade tributaria permanece no Domain/Application. |
| Docker de entrega | Um unico `docker compose up --build` sobe banco, API e frontend | Atende diretamente ao requisito do PDF de subir toda a infraestrutura com um comando. |
| Servidor da SPA | Build estatico do Vite servido por Nginx no container frontend | `frontend/nginx.conf` nao e requisito funcional; ele serve os arquivos da SPA, expoe healthcheck e aplica fallback para `index.html` nas rotas client-side. |
| URL da API no frontend | `VITE_API_BASE_URL=http://localhost:8080` fixado no build do Compose | A SPA roda no navegador do host e precisa chamar a API pela porta publicada, nao pelo nome interno do container. |


## Regras Fiscais do Case

- Anuais aparecem apenas em janeiro por competencia.
- Status `Pendente`: vencimento futuro ou no dia atual, sem entrega.
- Status `Atrasada`: vencimento anterior ao dia atual, sem entrega.
- Status `Entregue`: existe registro de entrega.
- Status `Nao Aplicavel`: representado pela ausencia de obrigacao gerada para
  regimes aos quais ela nao se aplica.
- Fins de semana e feriados nacionais do perfil do case prorrogam vencimento
  para o proximo dia util.

Detalhes e limites fiscais estao em `docs/decisoes-fiscais-case.md`.

## Testes

```bash
dotnet test backend/PainelObrigacoes.sln --configuration Release
```

O projeto cobre engine de regras, vencimentos, status de obrigacoes,
competencia e services de aplicacao ligados a geracao futura, dashboard,
alertas e cadastro.

Build do frontend:

```bash
cd frontend
npm install
npm run build
```

## Uso de IA

Usei Codex como par de programacao e acelerador de pesquisa, nao como piloto
automatico. A IA ajudou a estruturar fases, consultar documentacao oficial,
gerar codigo inicial e revisar constraints. As decisoes foram validadas com
build, testes, Docker Compose e revisao das regras do PDF.

Um exemplo de correcao importante foi o mapeamento de `Competencia`: a abordagem
inicial com membro aninhado no indice do EF Core foi substituida por colunas
escalares, preservando o Domain puro e mantendo indice composto confiavel.

## Limitacoes Conhecidas

- Regras reais que divergirem do PDF ficam fora do escopo desta entrega.
- Feriados estaduais/municipais, pontos facultativos e regras por UF nao entram
  no calendario desta versao.
- A base de demo so e recriada automaticamente quando o banco esta vazio; para
  trocar uma base antiga pelo seed novo, use `docker compose down -v`.
