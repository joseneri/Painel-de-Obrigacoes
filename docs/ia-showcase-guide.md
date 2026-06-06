# Guia de Justificativa Técnica e Uso de IA

Este documento é a memória de apresentação do projeto. Use-o para responder
perguntas na entrevista, montar o roteiro do showcase e explicar como a IA foi
usada de forma responsável.

## Regra Para Próximos Commits
Antes de cada commit, atualizar este guia com:

- O que mudou.
- Por que a decisão técnica faz sentido para o case.
- Como a IA ajudou.
- Onde houve revisão, correção ou decisão humana.
- Quais validações foram executadas.
- Quais pontos usar no showcase.

Observação: um commit não consegue conter o próprio hash final dentro do arquivo,
porque o hash depende do conteúdo commitado. Registre o assunto do commit antes
de commitar e complete o hash na próxima atualização quando o hash já existir.

## Como Explicar o Uso de IA
Mensagem curta:

> Usei IA como par de programação e acelerador de pesquisa, não como piloto
> automático. Ela ajudou a ler o case, estruturar fases, consultar documentação
> oficial, gerar código inicial e criar testes. Eu validei as decisões com build,
> testes, migration do EF e revisão das constraints. Um exemplo concreto foi o
> mapeamento de `Competencia`: a ideia inicial foi ajustada depois que o EF Core
> recusou índice com membro aninhado de complex property.

Pontos importantes:

- A regra de negócio veio do PDF e do prompt, não foi inventada pela IA.
- A IA ajudou a evitar APIs antigas ao pesquisar documentação oficial.
- O código foi validado com `dotnet test`, `dotnet build`, migration e checagens
  de constraints.
- Quando a ferramenta sugeriu ou permitiu uma abordagem frágil, a implementação
  foi corrigida com base no comportamento real do build/migration.

## Roteiro de Showcase
1. Mostrar o problema: escritórios gerenciam muitos CNPJs e precisam controlar
   obrigações acessórias, prazos e entregas sem planilha.
2. Mostrar arquitetura: Domain puro, Application com use cases, Infrastructure
   com EF Core/PostgreSQL e API com Minimal APIs.
3. Mostrar engine: `ObrigacaoRulesEngine` decide obrigações por regime e
   competência; `VencimentoCalculator` calcula prazos e prorroga fim de semana.
4. Mostrar testes: casos críticos de regime, obrigações anuais e vencimentos.
5. Mostrar API: endpoints de empresas, calendário, alertas, dashboard e entregas.
6. Mostrar persistência: migration versionada, seed automático e índices.
7. Mostrar execução: `docker compose up --build`, `/health`, `/scalar`.
8. Fechar com limitações documentadas: feriados nacionais fora do escopo e
   Imune/Isento sem obrigações nesta versão.

## Nome e Estrutura Para Explicar
Nome oficial do produto: **Painel de Obrigações Acessórias**.

Termo descritivo: **calendário fiscal inteligente**. Use esse termo para
explicar o que o produto faz, não como nome alternativo do projeto.

Estrutura:

- `backend/`: solution .NET do backend, chamada `PainelObrigacoes.sln`.
- `frontend/`: SPA React/Vite separada, cliente da API.
- `docs/`: decisões, guia de showcase e instruções para agentes.
- `docker-compose.yml`: comando único para subir serviços do case.

Frase de apresentação:

> Mantive um monorepo para facilitar a entrega full-stack com Docker Compose,
> mas separei backend e frontend em aplicações independentes. A Clean
> Architecture vale para o backend; o React é um cliente SPA externo que consome
> a API.

## Perguntas Prováveis e Respostas

### Por que Clean Architecture?
Porque o coração do sistema é regra fiscal. Separar Domain, Application,
Infrastructure e API deixa a engine testável sem banco ou HTTP e reduz acoplamento
com EF Core/ASP.NET. Para entrevista, isso mostra que a regra de negócio não está
presa ao framework.

### Por que Minimal APIs e não Controllers?
O case exigia Minimal APIs. Os endpoints foram organizados por extension methods
por feature para evitar um `Program.cs` inchado e manter leitura rápida.

### Por que não usar MediatR/CQRS?
Para este escopo, use cases explícitos entregam separação suficiente sem adicionar
indireção. A arquitetura continua preparada para evoluir, mas evita pacote e
complexidade que não resolvem um problema real agora.

### Por que persistir obrigações?
Alertas e dashboard precisam consultar vencimentos, status e entregas com rapidez.
Persistir as obrigações ao criar empresa e no seed evita recalcular tudo em cada
request e permite índices no banco.

### Por que regras hardcoded no Domain?
O case tem uma matriz fixa e quer uma engine clara. Hardcoded aqui é intencional:
mudanças fiscais exigem revisão, teste e deploy. Para um produto real maior, isso
poderia virar configuração versionada ou tabela de regras com auditoria.

### Por que `Competencia` virou colunas escalares no EF?
O Domain mantém `Competencia` como value object `struct` imutável. Na migration,
o EF Core recusou índice composto usando membro aninhado de complex property. A
solução foi persistir `CompetenciaAno` e `CompetenciaMes` como colunas escalares
e expor `Competencia` como propriedade calculada. Resultado: Domain puro, índice
composto confiável e migration limpa.

### Como os status são tratados?
`Entregue` é preservado. Para obrigações não entregues, `RecalcularStatus` compara
a data atual com vencimento: futuro vira `Pendente`, vencido vira `Atrasada`.

### Como vencimento de fim de semana funciona?
O vencimento base é calculado por tipo de obrigação. Se cair sábado, soma 2 dias;
se cair domingo, soma 1 dia. Feriados nacionais ficaram documentados como fora do
escopo.

### Por que TanStack Router no frontend?
Resposta curta para demo:

> Eu escolhi TanStack Router porque o app ja usava TanStack Query. Query ficou
> responsavel por server state; Router ficou responsavel por navegacao, layout e
> estado de URL. Isso deixou o `App.tsx` pequeno, as rotas explicitas e filtros
> como ano, mes e status compartilhaveis por link.

Como justificar tecnicamente:

- O projeto e uma SPA React/Vite, nao Next.js. Entao nao fazia sentido criar
  estrutura de `routes` de Next se o runtime real continua sendo client-side.
- "Ter rota" nao transforma a SPA em SSR. A rota so mapeia URL para tela dentro
  do navegador. Para refresh em `/calendario`, o servidor de producao ainda
  precisa fallback para `index.html`.
- TanStack Router complementa TanStack Query: Router nao busca dados por
  obrigacao; ele guarda navegacao e URL state. Query continua buscando API,
  cacheando e invalidando dados.
- File-based routing mostra uma arquitetura reconhecivel de frontend: `app`
  para shell/providers/router, `routes` para entrada de telas, `features` para
  UI de dominio e `api` para contratos HTTP.
- Search params tipados no calendario evitam estado escondido em `useState`.
  A URL `/calendario?ano=2026&mes=6&status=2` reabre a mesma visao.

Exemplos de codigo para mostrar:

```tsx
// frontend/src/app/App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";

export function App() {
  return <RouterProvider router={router} />;
}
```

Esse trecho mostra que `App.tsx` deixou de ser um arquivo grande. Ele so monta o
router. Layout, navegacao e paginas foram para arquivos com responsabilidade
propria.

```tsx
// frontend/src/app/router.tsx
export const router = createRouter({
  routeTree,
  context: {
    queryClient
  },
  defaultPreload: "intent"
});
```

Esse trecho mostra a integracao arquitetural: o router conhece o `queryClient`
por contexto, mas os dados continuam sendo tratados pelos hooks do TanStack
Query.

```tsx
// frontend/src/routes/calendario.tsx
export const Route = createFileRoute("/calendario")({
  validateSearch: validateCalendarioSearch,
  component: CalendarioRoute
});
```

Esse trecho mostra o ganho sobre um simples `useState`: a rota declara que seus
search params sao parte do contrato de navegacao.

```tsx
// frontend/src/features/obrigacoes/CalendarioPage.tsx
<DatePicker
  picker="month"
  allowClear={false}
  value={selectedMonth}
  format="MM/YYYY"
  onChange={(value) =>
    value && onFiltersChange({ ano: value.year(), mes: value.month() + 1 })
  }
/>
```

Esse trecho mostra a separacao: a feature so emite mudanca de filtro. Quem
decide que isso vira URL e a rota, nao o componente visual.

Se perguntarem "por que nao React Router?":

> React Router resolveria a navegacao basica. Eu escolhi TanStack Router porque
> ele entrega type-safety de rotas/search params e combina melhor com o ecossistema
> TanStack que o projeto ja usa. Para o case, isso tambem mostra uma escolha
> arquitetural moderna sem migrar para Next.js.

Se perguntarem "por que nao Next.js?":

> O requisito e React 18 e Vite SPA separada consumindo uma API .NET. Next.js
> mudaria o modelo de execucao para framework full-stack/SSR, sem necessidade
> para este case. Mantive SPA porque a regra fiscal e o backend sao o centro do
> produto.

## Diário Por Commit

### Pendente de hash - `feat: add React frontend with TanStack Router`

O que mudou:

- Implementado frontend React 18 + Vite + TypeScript.
- Adicionados Ant Design, TanStack Query, TanStack Router e Day.js.
- Criado app shell com sidebar/header e rotas file-based.
- `App.tsx` foi reduzido para `RouterProvider`.
- Criadas rotas `/`, `/dashboard`, `/calendario`, `/empresas` e not found.
- Filtros do calendario foram movidos para search params tipados.
- Implementadas telas de relatorio, calendario, empresas, entrega e CSV.
- Removidos usos de Ant Design deprecados encontrados na validacao visual.

Decisoes tecnicas:

- TanStack Query ficou como server state; TanStack Router ficou como URL state,
  navegacao e layout.
- File-based routing foi escolhido para deixar a arquitetura do frontend
  explicita, parecida com a organizacao que se espera em apps maiores, sem
  migrar para Next.js.
- Search params do calendario viraram contrato de navegacao para permitir link,
  refresh e reproducao de filtros.
- O frontend nao replica a engine fiscal; ele consome os contratos HTTP da API.

Como a IA ajudou:

- Pesquisou alternativas de rotas para React 18/Vite.
- Comparou React Router e TanStack Router no contexto do case.
- Ajudou a refatorar o `App.tsx` em shell, router, routes e features.
- Validou rotas no browser e identificou o problema de cache do Vite apos troca
  de dependencias.

Correcao e decisao humana:

- O usuario questionou o tamanho do `App.tsx` e a falta de divisao por rotas.
- O usuario decidiu usar TanStack Router por coerencia com TanStack Query e pela
  expectativa de uma arquitetura mais demonstravel no desafio.
- O cache `frontend/node_modules/.vite` foi limpo quando o dev server mostrou
  `Invalid hook call` depois da troca de dependencias.

Validacoes executadas:

- `npm run build`.
- `npm audit --audit-level=moderate`.
- Browser local em `/dashboard`, `/calendario?ano=2026&mes=6&status=2` e
  `/empresas`.
- Checagem de tamanho em `frontend/src`: maior fonte com 219 linhas.
- `npm ls react-router`: pacote legado ausente; apenas `@tanstack/react-router`
  permanece.

Como apresentar esse commit:

- "A refatoracao nao foi so chamar outro arquivo. Eu separei responsabilidades:
  `App.tsx` monta o router, `AppShell` cuida do layout, `routes` cuidam de URL e
  `features` cuidam das telas."
- "A URL do calendario agora representa estado real: posso mandar um link com
  ano, mes e status e a tela abre igual."
- "TanStack Router nao substitui TanStack Query. Um controla navegacao; o outro
  controla dados do servidor."

### `8865e90` - `feat: implement .NET backend obligations engine`

O que mudou:

- Criada a solution .NET 9 com projetos `Domain`, `Application`,
  `Infrastructure`, `Api` e `Domain.Tests`.
- Adicionados arquivos de governança em `docs/` e plano/pesquisa temporários em
  `tmp/`.
- Implementados enums, entidades, value object `Competencia`, interfaces de
  repositório, engine de regras e calculadora de vencimentos.
- Criados 18 testes unitários para engine, vencimentos e competência.
- Implementados DTOs e use cases de empresas, obrigações, dashboard, alertas e
  registro de entregas.
- Implementados EF Core `AppDbContext`, repositórios, seed automático e migration
  `InitialCreate`.
- Implementados endpoints Minimal API por feature, CORS, Problem Details,
  OpenAPI/Scalar, `/health`, Dockerfile, Compose e README.

Decisões técnicas:

- `global.json` fixa SDK 9.0.311 para evitar usar .NET 10 por acidente.
- Domain não referencia ASP.NET, EF Core nem `Microsoft.*`.
- Domain services são stateless e registrados como singleton.
- Use cases são scoped, alinhados ao ciclo de vida do DbContext.
- Repositórios ficam como interfaces no Domain e implementação na Infrastructure.
- Migrations e seed rodam no startup para facilitar demonstração do case.
- OpenAPI usa `Microsoft.AspNetCore.OpenApi` e Scalar UI, coerente com .NET 9.
- `CompetenciaAno` e `CompetenciaMes` foram usados para índice composto no EF.

Como a IA ajudou:

- Leu o prompt técnico e extraiu o conteúdo do PDF.
- Pesquisou documentação oficial de .NET 9, Minimal APIs, OpenAPI e EF Core.
- Ajudou a estruturar a implementação em fases e a criar a primeira versão do
  código.
- Gerou testes cobrindo os casos obrigatórios do prompt.
- Ajudou a revisar constraints: tamanho de arquivos, Domain puro, build limpo.

Correções e decisões humanas:

- A implementação não seguiu cegamente a ideia inicial de owned/complex property
  para `Competencia`; a migration falhou no índice composto e a solução foi
  ajustada para colunas escalares.
- O projeto evitou MediatR porque seria arquitetura a mais para o escopo.
- Docker Compose foi limitado a backend e banco porque o frontend ainda não foi
  implementado.
- O README documenta feriados nacionais e Imune/Isento como limitações explícitas.

Validações executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 18 testes
  passaram.
- `dotnet build backend/PainelObrigacoes.sln --configuration Release`: 0 erros e
  0 warnings após alinhar pacotes EF Core.
- `dotnet dotnet-ef migrations add InitialCreate`: migration gerada com sucesso.
- `docker compose config`: compose válido.
- `docker compose build api`: não executou porque o Docker daemon/Desktop não
  estava ativo na máquina.

Como apresentar esse commit:

- "Comecei pelo backend porque a regra fiscal é o núcleo do produto."
- "Priorizei uma engine pura e testável antes de API e banco."
- "Usei IA para acelerar, mas validei com documentação oficial e ferramentas."
- "A falha no scaffold da migration virou uma decisão arquitetural melhor e
  documentada."

### `42ee8bc` - `docs: add AI showcase guide`

O que mudou:

- Criado este guia de justificativa técnica e uso de IA.
- Atualizado o README com link para o guia.
- Atualizado `docs/agents.md` para lembrar que este documento deve ser mantido
  antes de novos commits.

Decisões técnicas:

- Separar README operacional de guia de defesa técnica. O README fica objetivo
  para executar o projeto; este documento concentra narrativa, decisões,
  trade-offs e uso de IA.
- Registrar commits como diário de engenharia para facilitar preparação do
  showcase.

Como a IA ajudou:

- Ajudou a transformar decisões tomadas durante a implementação em respostas
  de entrevista.
- Organizou perguntas prováveis e uma narrativa curta sobre uso responsável de
  IA.

Correções e decisões humanas:

- Definir que o guia deve ser atualizado antes de cada commit para evitar
  perder contexto.
- Explicitar que o hash do próprio commit só pode ser completado em atualização
  posterior, porque o hash depende do conteúdo commitado.

Validações executadas:

- `git status --short --branch`: workspace limpo após commit.

Como apresentar esse commit:

- "Documentei não só o que foi construído, mas por que foi construído assim."
- "Usei IA também para produzir rastreabilidade das decisões, não só código."

### Pendente de hash - `chore: clarify monorepo structure and naming`

O que mudou:

- Nome oficial padronizado como **Painel de Obrigações Acessórias**.
- "Calendário fiscal inteligente" passa a ser descrição funcional, não nome do
  produto.
- Solution mantida como `PainelObrigacoes.sln`, porque ela já está dentro de
  `backend/` e não precisa repetir o papel da pasta no nome.
- Estrutura `frontend/` adicionada como futura SPA React/Vite separada.
- README e docs atualizados para explicar monorepo, backend, API e frontend.

Como a IA ajudou:

- Ajudou a transformar a dúvida sobre nomenclatura em uma decisão documentável
  para entrevista.
- Revisou inconsistências entre nome de produto, descrição funcional, solution
  .NET e estrutura futura do frontend.

Decisão humana:

- Manter backend e frontend no mesmo Git para facilitar entrega do case, mas
  separar aplicações em pastas top-level.

Validações executadas:

- `dotnet build backend/PainelObrigacoes.sln --configuration Release`.
- `dotnet test backend/PainelObrigacoes.sln --configuration Release`.
- `rg` para garantir que a solution antiga não ficou referenciada.
- Conferir `git status` e estrutura final.

### Pendente de hash - `chore: simplify backend solution name`

O que mudou:

- Solution voltou para `backend/PainelObrigacoes.sln`.
- Referências em README, Dockerfile e docs foram atualizadas.

Decisão técnica:

- Como a solution já está fisicamente dentro de `backend/`, repetir o papel da
  pasta no nome deixava o caminho ruidoso.
- O monorepo já comunica a separação por pastas top-level: `backend/` e
  `frontend/`.

Como a IA ajudou:

- Ajudou a localizar todas as referências ao nome antigo e a manter a
  documentação coerente.

Decisão humana:

- Simplificar o nome para melhorar leitura no Visual Studio, terminal e docs.

Validações executadas:

- `dotnet build backend/PainelObrigacoes.sln --configuration Release`.
- `dotnet test backend/PainelObrigacoes.sln --configuration Release --no-build`.
- `rg` para garantir que o nome redundante antigo não ficou referenciado.

### Pendente de hash - `chore: add development docker compose`

O que mudou:

- Criado `docker-compose.dev.yml` para subir apenas o PostgreSQL em ambiente de
  desenvolvimento.
- README atualizado com comandos para alternar entre desenvolvimento local
  (`PostgreSQL em Docker + API no Visual Studio/dotnet run`) e modo entrega/demo
  (`API + PostgreSQL em Docker`).
- `docs/project-structure.md` atualizado para explicar que o Compose dev é
  auxiliar e pode ser removido antes da entrega final.

Decisão técnica:

- O fluxo recomendado para desenvolver backend é rodar o banco em container e a
  API localmente. Isso simplifica debug com F5, breakpoints, hot reload e logs
  da IDE, sem obrigar attach em processo dentro de container.
- O Compose principal continua sendo o modo de demonstração e entrega, porque
  garante ambiente reproduzível com API e banco juntos.
- O Compose dev usa a porta `5432`, igual ao `appsettings.json`, para evitar
  connection string especial no Visual Studio. Por isso, ele deve ser usado
  alternado com o Compose principal, não em paralelo.

Como a IA ajudou:

- Ajudou a separar os cenários de execução em comandos claros: desenvolvimento,
  reset de dados e retorno para release/demo.
- Transformou a dúvida sobre debug moderno em uma decisão prática e explicável
  para entrevista.

Decisão humana:

- Manter o arquivo como auxiliar e removível antes da entrega, como pedido pelo
  fluxo de preparação do case.

Validações executadas:

- `docker compose -f docker-compose.dev.yml config`.
- `dotnet build backend/PainelObrigacoes.sln --configuration Release`.
- `dotnet test backend/PainelObrigacoes.sln --configuration Release --no-build`.

Como apresentar esse commit:

- "Separei o fluxo de desenvolvimento do fluxo de entrega. Para codar e debugar,
  subo só o banco em Docker e rodo a API local; para demonstrar, subo tudo com
  Docker Compose."

### `5059135` - `fix: harden backend validation and errors`

O que mudou:

- Validacao de entrada do cadastro de empresa foi reforcada com limite de
  `RazaoSocial` e rejeicao de `RegimeTributario` fora do enum.
- Registro de entrega passou a validar limite de `Observacao`.
- Criada `ConflictException` para representar conflitos de estado da aplicacao.
- Entrega duplicada agora retorna conflito previsivel, em vez de erro de
  validacao generico.
- `EndpointErrorHandler` passou a tratar validacao, conflito, nao encontrado,
  valor fora de faixa, conflito de banco e erro inesperado com Problem Details.
- Erros inesperados agora sao registrados em log e nao vazam `exception.Message`
  para o cliente.

Decisoes tecnicas:

- Manter endpoints finos: eles continuam chamando use cases e delegando regra de
  negocio para Application/Domain.
- Usar 409 para conflito de entrega e possivel conflito de persistencia, porque
  esses casos representam estado concorrente ou duplicado, nao payload
  simplesmente malformado.
- Manter testes automatizados apenas no Domain por enquanto, por decisao humana,
  e validar esta etapa com build, suite existente e checagens de constraints.
- Preservar Problem Details como contrato padrao de erro da API.

Como a IA ajudou:

- Revisou o backend contra as novas instrucoes de desenvolvimento, arquitetura e
  riscos registrados em `tmp/`.
- Identificou lacunas de hardening em validacao, conflitos e vazamento de
  detalhes internos.
- Aplicou a Fase 1 aprovada pelo usuario de forma limitada ao backend.

Correcao e decisao humana:

- O usuario aprovou apenas a Fase 1 do plano de backend.
- O usuario decidiu manter testes fora de Application/API/Infrastructure como
  evolucao futura.
- O usuario esclareceu que `docker-compose.dev.yml` e arquivo de desenvolvimento
  e que o fluxo de release/entrega sera ajustado depois.

Validacoes executadas:

- `dotnet build backend/PainelObrigacoes.sln`: 0 erros e 0 warnings.
- `dotnet test backend/PainelObrigacoes.sln`: 18 testes passaram.
- Checagem de arquivos `.cs`: nenhum acima de 250 linhas.
- `rg` em Domain/Application para imports proibidos: nenhum resultado.
- `git diff --check`: sem erro de whitespace; apenas aviso normal de CRLF/LF no
  Windows.

Como apresentar esse commit:

- "Depois da primeira revisao, endureci a API sem mudar a arquitetura."
- "A regra continua fora do endpoint; o endpoint so adapta HTTP para use case."
- "Erros inesperados agora ficam nos logs, nao expostos para o cliente."
- "Conflito de entrega virou um caso esperado do dominio da aplicacao."

### Pendente de hash - `docs: add agent workflow instructions`

O que mudou:

- Criado `AGENTS.md` como ponto de entrada curto para agentes de IA.
- `docs/agents.md` foi reforcado com protocolo obrigatorio antes de comandos,
  respostas, edicoes, testes, stage ou commit.
- Criados templates de pesquisa, achados, plano e handoff em `docs/`.
- O fluxo de trabalho passou a exigir pesquisa, achados, plano, aprovacao
  humana, implementacao, validacao e stage autorizado para tarefas medias ou
  complexas.

Decisoes tecnicas:

- Separar `AGENTS.md` curto da documentacao completa em `docs/agents.md` aumenta
  a chance de qualquer ferramenta/agente encontrar as regras antes de agir.
- Templates reduzem variacao entre agentes e deixam decisoes, riscos, edge
  cases e validacoes rastreaveis.
- A regra de stage/commit explicito protege mudancas de usuario e evita misturar
  frontend, backend e documentacao em commits acidentais.

Como a IA ajudou:

- Transformou as novas instrucoes de desenvolvimento em regras operacionais
  claras e verificaveis.
- Organizou o fluxo em templates reutilizaveis para pesquisas, achados, planos e
  handoffs.

Correcao e decisao humana:

- O usuario pediu explicitamente para commitar as mudancas antigas, sem incluir
  frontend.
- `README.md`, `.gitignore` e `frontend/` ficaram fora deste commit porque as
  mudancas estavam relacionadas ao frontend ou a execucao local dele.

Validacoes executadas:

- `git status --short` para separar staged antigo de alteracoes de frontend.
- `git diff` dos arquivos candidatos antes do commit.
- `git diff --check` sera executado nos arquivos deste commit.

Como apresentar esse commit:

- "Transformei o processo de IA em protocolo rastreavel, com aprovacao humana
  antes de implementacoes relevantes."
- "Os templates ajudam a mostrar pesquisa, trade-offs, riscos e validacao em vez
  de apenas codigo final."
