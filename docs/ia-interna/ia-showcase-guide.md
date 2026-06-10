# Guia de Justificativa Técnica e Uso de IA

Este documento é a memória de apresentação do projeto. Use-o para responder
perguntas na entrevista, montar o roteiro do showcase e explicar como a IA foi
usada de forma responsável.

Para estudar todos os conceitos, backend, frontend e fluxos antes de ensaiar a
apresentacao no rich view do Codex, leia tambem
`tmp/documentacao-preview-fe-be.md`.

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

### Pendente de hash - `feat: consolidate operational frontend UI`

O que mudou:

- Dashboard, Painel de Alertas, Empresas e Calendario passaram a compartilhar
  cabecalhos, cards metricos, estilos de filtros, tabelas, badges e botoes.
- O Dashboard foi enxugado para tres metricas operacionais: total, atrasadas e
  pendentes.
- Os resumos do Painel de Alertas passaram a reutilizar o mesmo `MetricTile`,
  preservando selecao clicavel por total, atrasadas e vencendo.
- As tabelas de Alertas, Empresas e Calendario passaram a usar o mesmo visual
  operacional, com fonte maior, hover consistente e paginacao padronizada.
- A logica de agrupamento de linhas do Calendario foi extraida para utilitario
  compartilhado.
- `CalendarioSummary` foi removido porque os indicadores redundantes sairam da
  tela.

Decisoes tecnicas:

- A mudanca reduz duplicacao visual sem criar novo contrato HTTP nem mover regra
  fiscal para o frontend.
- Os componentes compartilhados ficaram pequenos e focados em UI, sem conhecer
  DTOs fiscais ou regras de negocio.
- A tabela do Calendario continua agrupando por vencimento e obrigacao, mas a
  regra de row span agora fica em utilitario reaproveitavel.
- As telas mantem Ant Design como base e centralizam apenas classes Tailwind
  repetidas.

Como a IA ajudou:

- Releu protocolo, arquitetura, guia de IA, resumo de implementacao e registros
  recentes em `tmp/` antes do commit.
- Revisou o diff para separar refino visual, extracao de componentes e remocao
  de duplicacao.
- Conferiu riscos de contrato: o backend, DTOs, endpoints e Domain permanecem
  fora do escopo.

Correcao e decisao humana:

- O usuario pediu explicitamente `commita tudo`, autorizando stage e commit do
  worktree atual.
- A decisao foi preservar o escopo como frontend operacional, sem refatorar
  regras fiscais nem ambiente Docker.
- A porta alternativa usada para subir a aplicacao localmente foi tratada como
  detalhe de ambiente, nao como mudanca de codigo.

Validacoes executadas:

- `npm run build` em `frontend/`: passou.
- `git diff --check`: sem erro bloqueante, apenas avisos LF/CRLF esperados no
  Windows.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`: nenhum
  `.cs`, `.ts` ou `.tsx` acima de 250 linhas.
- Checagem de `using` proibido nos `.cs` do Domain: sem ocorrencias.
- Browser local em `/dashboard`, `/alertas`, `/empresas` e `/calendario`: rotas
  renderizadas, sem alertas de erro e sem overflow horizontal.
- Warning conhecido do Ant Design sobre `overlayClassName` no dropdown de
  Empresas permanece nao bloqueante.

Como apresentar esse commit:

- "Centralizei os padroes visuais repetidos em componentes pequenos, o que deixa
  as telas mais consistentes sem alterar regra fiscal."
- "O Dashboard ficou mais objetivo para a demo: mostra rapidamente total,
  atrasadas e pendentes."
- "As tabelas ficaram com uma linguagem operacional unica entre alertas,
  empresas e calendario."

### Pendente de hash - `feat: simplify calendar and alert filters`

O que mudou:

- O Calendario removeu o botao dedicado `Limpar` da barra de filtros.
- O bloco de acoes do Calendario passou a se chamar `Exportar`, mantendo apenas
  `PDF` e `CSV`.
- A grade de filtros do Calendario redistribuiu o espaco livre para
  Competencia, Empresas e Status.
- O Painel de Alertas removeu o botao `Limpar filtros` e deixou a barra apenas
  com Empresa e Obrigacao, com campos mais largos.

Decisoes tecnicas:

- A limpeza individual continua disponivel pelo `allowClear` dos selects, sem
  criar novo estado local ou contrato HTTP.
- A mudanca ficou restrita ao frontend e nao altera DTOs, endpoints, Domain ou
  engine fiscal.
- Props e handlers que so existiam para os botoes removidos tambem foram
  removidos para manter os componentes enxutos.

Como a IA ajudou:

- Releu protocolo, arquitetura, registros recentes em `tmp/` e docs internas
  antes do commit.
- Localizou os componentes de filtros em Calendario e Painel de Alertas.
- Validou build, diff, limite de linhas e smoke visual local no Browser.

Correcao e decisao humana:

- O usuario pediu explicitamente a remocao dos botoes e autorizou `commita tudo`.
- O escopo foi mantido como ajuste visual/operacional, sem refatoracao de
  regras fiscais ou backend.

Validacoes executadas:

- `npm run build` em `frontend/`: passou.
- `git diff --check`: sem erro bloqueante, apenas avisos LF/CRLF esperados no
  Windows.
- Checagem de tamanho dos quatro arquivos tocados: todos abaixo de 250 linhas.
- Browser local em `/calendario`: `Exportar`, `PDF` e `CSV` visiveis; `Limpar`
  ausente.
- Browser local em `/alertas`: filtros `Empresa` e `Obrigacao` visiveis; botao
  `Limpar filtros` ausente.

Como apresentar esse commit:

- "As barras de filtros ficaram mais limpas e com mais area para os campos
  realmente usados."
- "A exportacao do Calendario ficou semanticamente separada dos filtros."
- "O frontend continua apenas consumindo a API; a regra fiscal nao saiu do
  backend."

### Pendente de hash - `feat: refine frontend operational layout`

O que mudou:

- O Dashboard ficou mais direto: removeu o bloco lateral de prazos criticos e
  deixou a distribuicao de status ocupar a area principal.
- A distribuicao de status ganhou barra consolidada e cards por status, com
  percentuais e totais mais faceis de explicar na demo.
- Os cards de metricas passaram a mostrar entregues antes de pendentes para
  priorizar resultado operacional.
- O Calendario removeu o filtro local de tipo de obrigacao e simplificou os
  controles para competencia, empresa, status e acoes.
- A tabela do Calendario ganhou ajustes de espaçamento, hover, celulas agrupadas
  e badges de urgencia com largura fixa.
- Empresas removeu o contador textual da tabela e ampliou a area dos filtros.
- Alertas ajustou a largura dos filtros e passou a usar opcoes de paginacao
  8/10/15/20, alinhadas ao restante das tabelas.
- Os textos de urgencia passaram a usar singular/plural natural, como
  "1 dia" e "2 dias".

Decisoes tecnicas:

- A simplificacao remove estado local de filtro por obrigacao no Calendario, sem
  mudar contratos HTTP nem replicar a engine fiscal no frontend.
- Exportacao CSV/PDF continua baseada no conjunto retornado pela API e filtrado
  pelos controles principais da tela.
- A visao de status no Dashboard permanece derivada do `DashboardDto`; o
  frontend apenas reorganiza apresentacao e acessibilidade.
- As opcoes de paginacao foram padronizadas para manter densidade previsivel nas
  telas operacionais.

Como a IA ajudou:

- Releu protocolo, arquitetura, guia de IA, resumo de implementacao e registros
  recentes em `tmp/` antes de preparar o commit.
- Revisou o diff atual e separou os ajustes de Dashboard, Alertas, Empresas,
  Calendario, formatadores e paginacao.
- Conferiu riscos de frontend, tamanho de arquivos, mojibake em codigo e
  whitespace antes do stage.

Correcao e decisao humana:

- O usuario pediu explicitamente `commita tudo`, autorizando stage e commit de
  todo o worktree atual.
- A mudanca foi mantida no escopo visual/operacional do frontend; regra fiscal,
  DTOs e endpoints permanecem intactos.
- Os avisos LF/CRLF do Windows foram considerados nao bloqueantes porque nao
  representam erro de whitespace.

Validacoes executadas:

- `npm run build` em `frontend/`: passou.
- `git diff --check`: sem erro bloqueante, apenas avisos LF/CRLF esperados no
  Windows.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`: nenhum
  `.cs`, `.ts` ou `.tsx` acima de 250 linhas.
- `rg -n "Ãƒ|Ã‚|ï¿½" frontend/src backend/tests backend/src`: sem ocorrencias de
  mojibake em codigo.
- Registros recentes em `tmp/` indicam smoke visual local do Calendario e do
  Painel de Alertas durante os ajustes.

Como apresentar esse commit:

- "O Dashboard ficou mais limpo para explicar status consolidados sem competir
  com o Painel de Alertas."
- "O Calendario ficou mais denso e previsivel: filtros principais, acoes curtas,
  tabela agrupada e urgencia legivel."
- "O frontend segue apenas apresentando e filtrando dados da API; a regra fiscal
  continua isolada no backend."

### `2c6abba` - `feat: add operational filters and exports`

O que mudou:

- O Painel de Alertas ganhou filtros operacionais por empresa e tipo de
  obrigacao, alem de seletor de tamanho de pagina.
- A lista de alertas removeu a dispensa local e manteve acao de abertura da
  obrigacao no Calendario, preservando o fluxo de analise sem alterar
  persistencia.
- O Calendario ganhou filtro por tipo de obrigacao, exportacao PDF simples no
  navegador e exportacao CSV/PDF baseada no conjunto filtrado.
- A area de controles do Calendario foi reorganizada em duas linhas para manter
  densidade e evitar aperto quando o novo filtro entra.
- A tabela do Calendario passou a mostrar a competencia quando a tela esta em
  modo `vencimento`, evitando perder contexto entre competencia e prazo.
- Empresas passou a validar no frontend se o CNPJ possui 14 digitos antes de
  enviar o cadastro.
- Tabelas de Empresas, Alertas e Calendario passaram a compartilhar estilo de
  seletor de tamanho de pagina.
- O Dashboard trocou o icone de atrasadas para um alerta mais direto.
- Foi adicionado teste de Application cobrindo rejeicao de CNPJ incompleto e
  normalizacao de CNPJ mascarado no cadastro de empresa.

Decisoes tecnicas:

- Os filtros novos continuam no frontend sobre dados ja retornados pela API; a
  engine fiscal e as regras de obrigacoes seguem no backend/Domain.
- A exportacao PDF e client-side e simples, adequada para demo, sem criar novo
  endpoint fora do escopo.
- CSV e PDF usam a mesma lista filtrada que o usuario esta vendo, deixando a
  exportacao coerente com a tela.
- O utilitario compartilhado de paginacao evita duplicar classes longas de Ant
  Design sem criar um design system novo.
- A validacao de CNPJ no frontend melhora feedback imediato, mas o backend
  segue como camada autoritativa com teste em Application.

Como a IA ajudou:

- Releu protocolo, arquitetura, guia de IA, resumo de implementacao e registros
  em `tmp/` antes de preparar o commit.
- Revisou o diff atual depois que o worktree mudou durante a validacao, sem
  sobrescrever alteracoes externas.
- Checou riscos de frontend, encoding, tamanho de arquivos, whitespace e
  contratos de camada.
- Usou Browser em segundo plano para smoke das rotas afetadas.

Correcao e decisao humana:

- O usuario pediu explicitamente `commita tudo`, autorizando stage e commit de
  todo o worktree atual.
- As alteracoes visuais e operacionais foram mantidas no escopo de frontend e
  testes de Application, sem mover regra fiscal para a UI.
- O aviso conhecido de Ant Design sobre `overlayClassName` em Empresas foi
  identificado como warning existente de UI, nao erro bloqueante deste commit.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 34 testes
  passaram.
- `npm run build` em `frontend/`: passou.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`: nenhum
  `.cs`, `.ts` ou `.tsx` acima de 250 linhas.
- `rg -n "Ã|Â|�" frontend/src backend/tests`: sem ocorrencias de mojibake em
  codigo.
- `git diff --check`: sem erro bloqueante, apenas avisos LF/CRLF esperados no
  Windows.
- Browser local em `/calendario`, `/alertas` e `/empresas`: rotas renderizadas,
  novos filtros visiveis e sem overflow horizontal detectado.

Como apresentar esse commit:

- "A demo agora permite filtrar alertas e calendario pelo tipo de obrigacao, e
  exportar exatamente o recorte visualizado."
- "O frontend ficou mais operacional sem recalcular regra fiscal; tudo continua
  consumindo contratos HTTP do backend."
- "A validacao de CNPJ aparece primeiro na tela, mas o backend continua
  protegido por teste de Application."

### `9172b90` - `feat: refine operational frontend flows`

O que mudou:

- O Painel de Alertas foi reorganizado em resumo clicavel, tabela paginada e
  arquivo de apresentacao para filtros, tons e textos vazios.
- Alertas agora permitem abrir a obrigacao correspondente no Calendario em modo
  `vencimento`, preservando empresa, status, ano e mes derivados do prazo.
- Acoes de alerta passaram para menu compacto, com dispensa local de itens para
  limpar a fila operacional durante a demo.
- O Dashboard teve o header simplificado com remocao dos botoes `Alertas` e
  `Calendario`, mantendo o acesso ao painel pela secao de prazos criticos.
- Empresas, Dashboard e Calendario receberam ajustes finos de alinhamento,
  densidade, controles, badges e cards para uma leitura mais consistente.
- O Calendario removeu a faixa azul do header, enxugou os KPIs para quatro
  indicadores principais e melhorou select, date picker, badges de urgencia e
  celulas agrupadas.
- Componentes preparatorios de visualizacao de calendario/agenda foram mantidos
  em `frontend/src/features/obrigacoes` como parte do worktree autorizado.

Decisoes tecnicas:

- O alerta continua vindo do backend; o frontend apenas filtra, pagina e navega
  com os contratos HTTP existentes.
- A dispensa de alerta e local e nao altera persistencia, evitando criar API
  nova fora do escopo do case.
- A navegacao para o Calendario usa TanStack Router e search params tipados,
  reforcando que URL state fica na rota, nao escondido em componente visual.
- O Dashboard perdeu os atalhos duplicados no header, mas preservou o acesso ao
  Painel de Alertas onde ele tem contexto operacional.
- A regra fiscal segue fora do frontend; todos os ajustes sao apresentacionais
  ou de navegacao.

Como a IA ajudou:

- Releu protocolo, arquitetura, guia de IA, resumo de implementacao e registros
  em `tmp/` antes do commit.
- Revisou o worktree atual para separar alteracoes de alertas, calendario,
  empresas e dashboard.
- Checou encoding real das fontes para evitar commitar textos com mojibake.
- Validou build, tamanho de arquivos e whitespace antes de preparar o stage.

Correcao e decisao humana:

- O usuario pediu explicitamente `commita tudo`, autorizando stage e commit de
  todo o worktree atual.
- Ajustes pontuais pedidos pelo usuario foram incorporados sem reverter
  alteracoes visuais acumuladas.
- Arquivos preparatorios nao rastreados foram incluidos porque faziam parte do
  worktree atual e o pedido foi commitar tudo.

Validacoes executadas:

- `npm run build` em `frontend/`: passou.
- Checagem de tamanho em `frontend/src`: nenhum `.ts`/`.tsx` acima de 250
  linhas.
- `rg -n "Ã|Â|�" frontend/src`: sem ocorrencias reais de mojibake.
- `git diff --check`: sem erro bloqueante, apenas avisos esperados LF/CRLF no
  Windows.

Como apresentar esse commit:

- "O Painel de Alertas virou uma tela operacional de trabalho: resumo, filtros,
  tabela, acoes e ponte direta para o Calendario."
- "A navegacao usa a URL para levar o usuario ao mesmo contexto de vencimento,
  empresa e status no Calendario."
- "Os polimentos reduzem ruido visual sem mexer em regra fiscal nem contratos da
  API."

### `b074455` - `feat: align frontend screens with tailwind UI`

O que mudou:

- Dashboard, Painel de Alertas e Empresas foram alinhados ao design operacional
  novo do Calendario.
- As telas migradas passaram a usar Tailwind CSS direto nos componentes, sem
  imports dos CSS legados de dashboard, alertas e empresas.
- `styles.css` foi reduzido a Tailwind/base e ajustes globais indispensaveis.
- Os componentes de metricas, distribuicao de status, alertas e tabela de
  empresas ganharam wrappers responsivos, bordas discretas e hierarquia visual
  consistente.
- Textos visiveis do frontend foram normalizados para portugues do Brasil com
  acentos, mantendo rotas, DTOs, enums e contratos HTTP sem acentos.
- A tabela do Calendario recebeu polimento visual em badges, acoes, urgencia e
  textos de status.

Decisoes tecnicas:

- A migracao continuou incremental: telas operacionais foram alinhadas ao
  Calendario sem criar design system novo nem alterar backend.
- O frontend segue como cliente da API; filtros locais de Empresas continuam
  apenas apresentacionais sobre a lista ja carregada.
- CSS legado das features foi removido somente depois de confirmar que nao
  havia imports restantes.
- Acentos foram tratados como copy de interface, preservando identificadores
  tecnicos e contratos sem acentos.

Como a IA ajudou:

- Consultou os planos, achados e riscos registrados em `tmp/` antes de preparar
  o commit.
- Revisou o diff para separar migracao visual, copy pt-BR e polimento de tabela.
- Usou validacoes registradas de build, checagem de CSS, line count e browser
  para fechar riscos.

Correcao e decisao humana:

- O usuario pediu explicitamente commitar todo o worktree atual.
- A alteracao foi mantida no escopo de frontend visual/copy, sem mover regra
  fiscal para o cliente.
- A validacao visual integrada teve limitacao de Browser; foi usado fallback
  local com screenshots e build ja registrado em `tmp/`.

Validacoes executadas:

- `npm run build` em `frontend/`: passou.
- `rg '\.css' frontend/src`: restaram apenas `antd/dist/reset.css` e
  `app/styles.css`.
- Checagem de tamanho em `frontend/src`: nenhum `.ts`/`.tsx` acima de 250
  linhas.
- `git diff --check`: sem erro bloqueante, apenas avisos esperados LF/CRLF no
  Windows.
- Browser local/Edge headless: `/dashboard`, `/alertas`, `/empresas` e
  `/calendario` conferidos conforme riscos finais em `tmp/`.

Como apresentar esse commit:

- "O visual das telas principais agora segue uma linguagem unica, com Tailwind
  real e sem CSS legado de feature."
- "A migracao preservou os contratos HTTP e manteve a regra fiscal no backend."
- "O app ficou mais pronto para demo: Dashboard, Alertas, Empresas e Calendario
  falam a mesma lingua visual."

### `c4b17bc` - `feat: migrate calendar to tailwind and dashboard totals`

O que mudou:

- Tailwind CSS foi instalado de forma real no frontend com `tailwindcss` e
  `@tailwindcss/vite`.
- O Vite passou a carregar o plugin oficial do Tailwind.
- O shell global e a tela de Calendario foram migrados para utilities
  Tailwind, preservando o design operacional aprovado.
- Os CSS puros da feature de obrigacoes foram removidos:
  `calendario-competencia.css`, `calendario-controls.css` e
  `obrigacoes-table.css`.
- O CSS global ficou como entrada Tailwind e compatibilidade minima para telas
  ainda nao migradas.
- O dashboard passou a manter `ObrigacoesMes` como recorte mensal e a contar
  `Pendentes`, `Entregues` e `Atrasadas` como totais consolidados da base.
- A distribuicao do dashboard passou a usar o total consolidado de status como
  denominador.
- Foi adicionado teste de Application para proteger a semantica nova do
  dashboard.

Decisoes tecnicas:

- Tailwind entrou como dependencia oficial do build, nao como simulacao em CSS.
- A migracao visual foi incremental: calendario e shell primeiro, porque as
  demais telas serao redesenhadas para seguir esse padrao.
- Overrides internos do Ant Design foram localizados nos wrappers com utilities
  e variantes arbitrarias, evitando novos arquivos CSS na feature de
  obrigacoes.
- O frontend continua sem replicar regra fiscal; a agregacao de status do
  dashboard ficou no `GetDashboardService`.
- O contrato `DashboardDto` foi preservado, mudando apenas a semantica dos
  status para consolidado.

Como a IA ajudou:

- Consultou documentacao oficial do Tailwind e Vite antes de instalar a nova
  dependencia.
- Mapeou os CSS existentes e planejou uma migracao com menor risco visual.
- Validou a tela de calendario em browser desktop e mobile.
- Revisou o diff de dashboard/backend junto com os achados ja registrados em
  `tmp/`.

Correcao e decisao humana:

- O usuario pediu explicitamente parar de usar CSS puro e usar Tailwind CSS de
  verdade, mantendo o design atual do calendario.
- O usuario tambem pediu explicitamente commitar todo o worktree atual.
- As mudancas de dashboard ja estavam no worktree e foram incluidas porque o
  pedido foi "commitar tudo".
- CSS legado em dashboard/empresas/alertas ficou temporario para futuras
  migracoes visuais.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 31 testes
  passaram.
- `npm run build`: TypeScript e Vite build passaram.
- Browser local em `/calendario?ano=2026&mes=6`:
  - desktop sem overflow horizontal;
  - mobile 390x844 sem overflow horizontal;
  - menu mobile sem rolagem propria;
  - KPIs, filtros e tabela renderizados.
- Checagem de tamanho: nenhum `.cs`, `.ts` ou `.tsx` em `backend/src`,
  `backend/tests` ou `frontend/src` acima de 250 linhas.
- Busca de imports proibidos no Domain: nenhuma ocorrencia.
- `git diff --check`: sem erro bloqueante; apenas avisos LF/CRLF do Windows.

Como apresentar esse commit:

- "O projeto agora tem Tailwind CSS real no pipeline Vite, e o calendario virou
  a referencia visual para as proximas telas."
- "A migracao foi incremental para preservar a UI aprovada e evitar mexer em
  telas que ainda serao redesenhadas."
- "O dashboard agora diferencia claramente obrigacoes do mes de status
  consolidados, sem empurrar agregacao de regra para o frontend."

### `7257216` - `feat: redesign calendar dashboard UI`

O que mudou:

- O calendario ganhou header proprio, sem o header global duplicado e sem badge
  de API local na tela.
- A barra superior do calendario foi redesenhada com seletor
  Competencia/Vencimento, filtro de data por Ant Design e filtros de Empresa e
  Status alinhados.
- O seletor de competencia mostra dia, mes e ano, abre primeiro por mes e
  permite entrar na selecao por dia.
- A area de acoes removeu `Atualizar`, manteve `Limpar` e `CSV` e adicionou
  `PDF` como botao visual sem funcao ainda.
- O resumo do calendario virou uma faixa de KPIs maiores para total,
  pendentes, entregues, atrasadas e percentual concluido.
- A tabela de obrigacoes ficou mais enxuta: removeu competencia repetitiva,
  condensou vencimentos/obrigacoes repetidas com `rowSpan`, modernizou status,
  urgencia e paginacao, e trocou o icone solto por acoes explicitas.
- Estilos de dashboard e calendario foram separados por feature; o limite de
  250 linhas passou a valer apenas para arquivos de codigo, deixando CSS fora
  desse limite.

Decisoes tecnicas:

- A regra fiscal continuou no backend; o frontend apenas reorganiza os dados e
  controles recebidos da API.
- O calendario concentra a experiencia da tela em uma unica feature, com
  componentes menores (`CalendarioControls`, `CalendarioSummary` e tabela).
- O botao PDF entrou sem handler porque a exportacao PDF ainda nao foi pedida
  como funcionalidade, evitando uma implementacao incompleta disfarçada.
- CSS foi tratado como excecao do limite de linhas porque dividir estilos por
  contagem artificial estava piorando a manutencao visual.

Como a IA ajudou:

- Iterou o redesign com base nos prints e ajustes do usuario.
- Validou visualmente o calendario no browser em desktop e mobile.
- Checou que o DatePicker preserva o fluxo de mes para dia.
- Registrou planos, achados e riscos em `tmp/` durante as iteracoes.

Correcao e decisao humana:

- O usuario rejeitou varias alternativas e definiu o layout desejado a partir do
  print: header interno, filtros alinhados e acoes de mesma largura.
- O usuario pediu explicitamente para remover `Atualizar`, adicionar `PDF` sem
  funcao e commitar todo o worktree atual.
- A decisao de manter PDF apenas visual foi tomada para respeitar o escopo.

Validacoes executadas:

- `npm run build`: TypeScript e Vite build passaram.
- Browser local em `/calendario?ano=2026&mes=6`:
  - desktop validado com botoes `Limpar`, `PDF` e `CSV` alinhados;
  - mobile 390px sem overflow horizontal;
  - calendario abre em mes e permite selecionar dia.
- `git diff --check`: sem erro bloqueante, apenas avisos LF/CRLF do Windows.
- Checagem de tamanho: arquivos TypeScript tocados abaixo de 250 linhas.

Como apresentar esse commit:

- "O calendario deixou de parecer uma tabela administrativa generica e virou uma
  tela operacional para prazos fiscais."
- "O filtro principal agora esta no topo, alinhado e com acoes previsiveis."
- "A tabela mostra menos informacao repetida e destaca melhor urgencia, status e
  acao de entrega."

### `35815de` - `feat: add company list filters`

O que mudou:

- A tela de Empresas ganhou busca local por razão social.
- A listagem passou a ter filtro limpável por regime tributário.
- O painel de listagem mostra contador de resultados e mensagem de vazio para
  buscas sem correspondência.
- Os estilos dos filtros foram isolados em `empresas.css` para manter o CSS
  global abaixo do limite de 250 linhas.
- Foi adicionado `normalizeRegime` para comparar regimes recebidos como número
  ou string.

Decisões técnicas:

- A filtragem ficou local sobre a lista já carregada porque o endpoint de
  empresas ainda não pagina nem recebe filtros.
- Nenhuma regra fiscal foi movida para o frontend; a tela só organiza cadastro e
  navegação visual.
- O filtro reutiliza `regimeOptions`, mantendo labels de domínio centralizadas.
- O CSS ficou na feature de Empresas para preservar escopo e constraints de
  tamanho.

Como a IA ajudou:

- Releu o protocolo do projeto, arquitetura, documentação interna, `tmp/` e
  histórico recente antes do commit.
- Identificou o ponto de menor impacto para aplicar busca/filtro sem alterar
  contratos HTTP.
- Validou a tela no browser em desktop e mobile, além do build TypeScript/Vite.

Correção e decisão humana:

- O usuário pediu explicitamente busca por nome e filtros por regime na tela de
  Empresas.
- O pedido posterior foi commitar todo o worktree atual.
- A melhoria foi limitada à experiência de listagem de empresas, preservando o
  backend como fonte de verdade para obrigações.

Validações executadas:

- `npm run build`: TypeScript e Vite build passaram.
- `git diff --check`: sem erro bloqueante; apenas avisos LF/CRLF do Windows.
- Checagem de tamanho: arquivos fonte tocados abaixo de 250 linhas.
- Browser local em `/empresas`:
  - busca por `Banco` retornou `1 de 9 empresas`;
  - filtro `Lucro Real` retornou `2 de 9 empresas`;
  - viewport mobile 390x844 manteve os filtros dentro da tela.

Como apresentar esse commit:

- "A tela de Empresas agora fica operável mesmo com mais CNPJs: busca por nome e
  filtro por regime reduzem ruído sem novo endpoint."
- "A regra fiscal continua no backend; o frontend só filtra a lista cadastral já
  recebida."
- "O ajuste respeitou a organização por feature e manteve o CSS global pequeno."

### `fce86ec` - `feat: refine alerts and calendar demo UX`

O que mudou:

- O Painel de Alertas ganhou filtros clicaveis por atrasadas, vencendo e todos,
  com paginacao para evitar listas longas na demo.
- A ordenacao de alertas passou a priorizar atrasadas, mantendo proximas em ate
  30 dias como grupo filtravel.
- A tabela de empresas removeu o GUID interno da razao social, deixando a tela
  mais limpa para apresentacao.
- A tela de calendario foi redesenhada para competencia como visao padrao, mas
  manteve a opcao por vencimento em um seletor discreto.
- O calendario ganhou navegador mensal maior, botoes anterior/proximo, destaque
  para `Hoje`, layout desktop mais largo e ajuste responsivo mobile.

Decisoes tecnicas:

- O backend segue como fonte de verdade para status, vencimento e urgencia; o
  frontend apenas filtra/apresenta os dados recebidos.
- `Competencia` ficou como padrao porque atende diretamente o requisito de
  visualizar obrigacoes por mes/empresa, enquanto `Vencimento` permanece para
  demonstrar prazos reais e edge cases fiscais.
- A URL do calendario omite `modo` quando esta em competencia e usa
  `modo=vencimento` apenas quando essa visao e selecionada.
- O painel de alertas usa paginacao local porque o endpoint ja retorna a massa
  critica filtrada pelo service, evitando novo contrato HTTP.

Como a IA ajudou:

- Releu o protocolo do projeto, arquitetura, docs internas e registros em
  `tmp/` antes de preparar o commit.
- Ajudou a iterar visualmente a tela de calendario com validacao no browser em
  desktop e mobile.
- Consolidou os achados e riscos em `tmp/` para manter rastreabilidade da
  decisao entre competencia e vencimento.

Correcao e decisao humana:

- O usuario rejeitou versoes poluidas do calendario e pediu uma UI mais moderna,
  com mes em destaque e opcao por vencimento preservada.
- O usuario tambem pediu explicitamente para commitar todo o worktree atual.
- As alteracoes foram aceitas como um pacote de refinamento de demo, juntando
  alertas, calendario e limpeza visual em empresas.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 30 testes
  passaram.
- `npm run build`: TypeScript e Vite build passaram.
- Browser local no calendario:
  - desktop em 1412x768;
  - mobile em 390x844;
  - troca `Competencia`/`Vencimento`;
  - URL limpa em competencia e `modo=vencimento` quando selecionado;
  - console sem erros.
- Checagem de tamanho: nenhum arquivo fonte em `frontend/src` acima de 250
  linhas.
- `git diff --check`: sem erro bloqueante; apenas avisos LF/CRLF do Windows.

Como apresentar esse commit:

- "O calendario agora mostra a competencia como fluxo principal, mas ainda deixa
  alternar para vencimento para explicar os prazos reais."
- "O painel de alertas virou uma tela mais demonstravel: atrasadas, vencendo e
  todos ficam filtraveis sem novo endpoint."
- "A regra fiscal continua no backend; a UI ficou melhor para operar e para
  defender as decisoes do case."

### `a9e012c` - `fix: surface upcoming alerts`

O que mudou:

- O Painel de Alertas passou a exibir separadamente obrigacoes vencendo nos
  proximos 30 dias e obrigacoes atrasadas.
- A ordenacao do service de alertas agora prioriza vencimentos futuros mais
  proximos e depois atrasadas mais recentes.
- O corte visual global de 8 itens foi removido, porque escondia as obrigacoes
  proximas quando havia muitas atrasadas antigas.
- Adicionado teste de Application para garantir que proximas e atrasadas sejam
  retornadas e ordenadas corretamente.
- CSS especifico do painel foi isolado em arquivo proprio para manter limite de
  tamanho dos arquivos.

Decisoes tecnicas:

- O backend continua sendo a fonte de verdade para status, dias para vencer e
  ordenacao operacional.
- O frontend apenas agrupa e apresenta `diasParaVencer`/`status` vindos da API,
  sem recalcular a engine fiscal.
- A UI passou a provar explicitamente o requisito do case: proximos 30 dias e
  atrasadas aparecem no mesmo painel, com contadores.

Como a IA ajudou:

- Diagnostiquei o payload real do endpoint e comparei com a tela renderizada.
- Identifiquei que a API retornava 28 proximas, mas a UI as escondia por causa
  da ordenacao e do corte visual.
- Criei plano, achados e riscos finais em `tmp/` para rastrear o hotfix.

Correcao e decisao humana:

- O usuario apontou que o Painel de Alertas parecia nao cumprir o requisito dos
  proximos 30 dias.
- A correcao foi limitada ao fluxo de alertas e preservou mudancas paralelas do
  calendario fora do commit.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 30 testes
  passaram.
- `npm run build`: TypeScript e Vite build passaram.
- Endpoint `/api/obrigacoes/alertas`: 28 proximas e 112 atrasadas no seed local.
- Browser local em `/alertas`: secao "Vencendo nos proximos 30 dias" aparece
  antes de "Atrasadas".
- Console do browser: sem erros.
- Checagem de tamanho: arquivos do hotfix abaixo de 250 linhas.
- `git diff --check`: sem erro bloqueante; apenas avisos LF/CRLF do Windows.

Como apresentar esse commit:

- "O bug nao era falta de dados; era uma UX que escondia os proximos 30 dias
  atras de muitas obrigacoes antigas."
- "O painel agora mostra claramente os dois grupos exigidos pelo case."
- "A regra segue no backend, e o frontend so organiza a apresentacao."

### `d3f4748` - `feat: harden fiscal calendar edge cases`

O que mudou:

- A engine fiscal passou a aplicar uma politica unica de proximo dia util para
  vencimentos do case, considerando fins de semana e feriados nacionais fixos,
  alem de Sexta-feira Santa.
- Obrigacoes anuais continuam sendo geradas apenas na competencia de janeiro,
  mas agora mantem vencimentos reais no mesmo ano-calendario fiscal exibido.
- O calendario ganhou modo de visualizacao por vencimento ou por competencia,
  com vencimento como padrao para status, alertas e urgencia operacional.
- O dashboard passou a contar obrigacoes do mes por vencimento, evitando
  indicadores distorcidos em meses com anuais de janeiro vencendo depois.
- A rotina de garantia de obrigacoes agora cobre desde janeiro do ano corrente
  ate o horizonte futuro e atualiza registros existentes quando a regra fiscal
  evolui.
- O frontend passou a exibir urgencia em dias e corrigiu formatacao de datas
  civis para evitar deslocamento por timezone.
- README, `architecture.md` e `docs/decisoes-fiscais-case.md` documentam as
  decisoes abertas do case, inclusive competencia vs vencimento e limites do
  calendario fiscal.

Decisoes tecnicas:

- Competencia explica o periodo fiscal da obrigacao; vencimento dirige
  status, alertas, dashboard mensal e ordenacao de urgencia.
- A regra de dia util foi centralizada no Domain em `CalendarioDiaUtil`, sem
  dependencia de infraestrutura.
- Como o PDF explicita prorrogacao apenas para DAS, a decisao documentada foi
  aplicar a mesma politica para todos os vencimentos do case para manter
  previsibilidade e cobrir o edge case de vencimento.
- Feriados locais, regras estaduais, pontos facultativos e mudancas legais
  atuais ficaram fora do escopo, mas documentados como limitacao consciente.
- O frontend nao recalcula regra fiscal; ele recebe `diasParaVencer` e datas da
  API.

Como a IA ajudou:

- Ajudou a revisar a ambiguidade do PDF sobre anuais em janeiro, vencimento no
  calendario fiscal e prorrogacao de prazos.
- Acelerou a pesquisa e a transformacao dos edge cases em plano, achados,
  decisoes documentadas e testes.
- Revisou o contrato backend/frontend para que o modo `vencimento` nao
  duplicasse regra fiscal na SPA.

Correcao e decisao humana:

- O usuario identificou as pegadinhas de regra fiscal e pediu explicitamente
  uma politica documentada para ganhar pontos na avaliacao.
- A decisao assumida foi mostrar as anuais por competencia em janeiro e tambem
  permitir a visao por vencimento, porque o produto precisa explicar origem
  fiscal e operar prazos reais.
- O commit preserva a escolha anterior de Imune/Isento sem obrigacoes nesta
  versao do case.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 29 testes
  passaram.
- `dotnet build backend/PainelObrigacoes.sln --configuration Release`: 0 erros
  e 0 warnings.
- `npm run build`: TypeScript e Vite build passaram.
- Browser local em `/calendario?ano=2026&mes=6&modo=vencimento`: SPED ECD de
  competencia 01/2026 apareceu com vencimento prorrogado em 01/06/2026.
- Endpoint `/api/obrigacoes?ano=2026&mes=1&modo=competencia` confirmou anuais
  em janeiro; fevereiro por competencia nao trouxe anuais.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`:
  nenhum arquivo fonte acima de 250 linhas.
- Busca de imports proibidos no Domain: nenhuma ocorrencia.
- `git diff --check`: sem erro bloqueante; apenas avisos LF/CRLF do Windows.

Como apresentar esse commit:

- "Eu tratei competencia e vencimento como dimensoes diferentes: janeiro mostra
  a obrigacao anual, mas o vencimento real aparece no mes correto."
- "A politica de proximo dia util foi documentada e aplicada de forma
  consistente em todos os prazos do case."
- "Os edge cases de regime e vencimento estao cobertos por testes, docs e pela
  propria UI do calendario."

### `84ff14c` - `feat: maintain obligations horizon and refine dashboard`

O que mudou:

- Criado `EnsureObrigacoesFuturasService` para garantir horizonte movel de 12
  competencias futuras por empresa.
- Cadastro de empresa e startup da API passaram a reutilizar o mesmo service
  idempotente depois de migrations/seed.
- `IObrigacaoRepository` ganhou consulta por empresa e periodo para localizar
  obrigacoes existentes sem duplicar registros.
- Criado projeto `Application.Tests` com testes focados no service de horizonte.
- Dashboard deixou de carregar a lista de alertas e passou a direcionar para a
  tela dedicada `/alertas`.
- Calendario removeu a exibicao de GUID interno da empresa na tabela.
- `AGENTS.md` ganhou referencia rapida para a transcricao do PDF do case em
  `tmp/`.

Decisoes tecnicas:

- A regra fiscal continua no backend: Application orquestra, Domain decide a
  matriz de obrigacoes e o frontend apenas consome contratos HTTP.
- A operacao de horizonte e idempotente: consulta existentes por competencia e
  insere apenas faltantes, preservando o indice unico como protecao adicional.
- Rodar a garantia no startup e no cadastro resolve a demo sem introduzir
  Quartz/Hangfire ou `BackgroundService` antes de haver necessidade real.
- Separar Dashboard e Painel de Alertas reduz duplicacao visual e isola falhas
  do endpoint de alertas na rota dedicada.

Como a IA ajudou:

- Leu o protocolo, arquitetura, docs internas, `tmp/` e historico recente antes
  do commit.
- Correlacionou o diff com os achados de horizonte futuro, dashboard/alertas e
  analise das telas do case.
- Revisou constraints de arquitetura, tamanho de arquivos, imports proibidos no
  Domain e consistencia backend/frontend antes do stage.

Correcao e decisao humana:

- O usuario pediu explicitamente para commitar tudo que estava pendente.
- As mudancas ja estavam no worktree com planos e achados em `tmp/`; este passo
  focou em revisar, validar, documentar e commitar sem refatoracao extra.
- A decisao de nao criar scheduler agora foi mantida para evitar peso
  desnecessario no case.

Validacoes executadas:

- `dotnet test backend/PainelObrigacoes.sln --configuration Release`: 18 testes
  de Domain e 2 testes de Application passaram.
- `npm run build`: TypeScript e Vite build passaram.
- `git diff --check`: sem erro de whitespace; apenas avisos LF/CRLF do Windows.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`:
  nenhum arquivo fonte acima de 250 linhas.
- Busca de imports proibidos no Domain em arquivos `.cs`: nenhuma ocorrencia.

Como apresentar esse commit:

- "O sistema nao perde horizonte futuro com o passar do tempo; ele completa os
  12 meses de forma idempotente."
- "A engine fiscal continua pura no Domain, e a Application apenas coordena a
  persistencia das obrigacoes geradas."
- "Dashboard e Painel de Alertas ficaram com responsabilidades mais claras: um
  consolida indicadores, o outro lista prazos criticos."

### `0cafc0c` - `refactor: simplify empresas list contract`

O que mudou:

- `EmpresaDto` deixou de expor o campo `Pendentes`.
- A listagem de empresas deixou de carregar obrigacoes e entregas apenas para
  calcular pendencias na tela de empresas.
- `CreateEmpresaService`, `GetEmpresasService` e `DtoMapper` foram alinhados ao
  contrato mais enxuto.
- O tipo `EmpresaDto` do frontend foi atualizado.
- A tabela de empresas removeu as colunas de pendencias e data de criacao,
  reduzindo o scroll horizontal.

Decisoes tecnicas:

- A tela de empresas deve listar dados cadastrais; indicadores operacionais de
  obrigacoes continuam mais bem representados no dashboard, alertas e calendario.
- Remover o `Include` evita carregar agregados de obrigacoes/entregas em uma
  consulta de listagem simples.
- A mudanca reduz risco de drift porque backend e frontend foram ajustados no
  mesmo contrato HTTP.

Como a IA ajudou:

- Leu o protocolo do projeto, arquitetura, docs internas, `tmp/` e historico
  recente antes de commitar.
- Revisou o diff para identificar que a mudanca era focada na coluna de
  pendencias e no contrato de empresas.
- Executou validacoes de backend, frontend, whitespace e constraints antes do
  stage.

Correcao e decisao humana:

- O usuario pediu explicitamente commit de tudo que estava pendente.
- A alteracao preserva a regra fiscal no backend e nao cria logica tributaria no
  frontend.
- Nenhuma migration, seed ou endpoint novo foi criado.

Validacoes executadas:

- `dotnet build backend/PainelObrigacoes.sln --configuration Release`: 0 erros
  e 0 warnings.
- `dotnet test backend/PainelObrigacoes.sln --configuration Release --no-build`:
  18 testes passaram.
- `npm run build`: TypeScript e Vite build passaram.
- `git diff --check`: sem erro de whitespace; apenas avisos LF/CRLF do Windows.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`:
  nenhum arquivo fonte acima de 250 linhas.
- Busca de imports proibidos no Domain em arquivos `.cs`: nenhuma ocorrencia.

Como apresentar esse commit:

- "A listagem de empresas ficou mais cadastral e mais barata; dados de
  obrigacoes continuam nas telas especificas."
- "Removi um carregamento de obrigacoes/entregas que existia so para uma coluna
  secundaria."
- "Backend e frontend foram ajustados juntos para manter o contrato consistente."

### `3f97067` - `chore: align local dev ports and npm registry`

O que mudou:

- API local do profile `http` foi movida de `5179` para `5280`.
- Frontend Vite foi fixado em `5241` no dev server e `5242` no preview.
- `VITE_API_BASE_URL` e fallbacks do cliente HTTP passaram a apontar para
  `http://localhost:5280`.
- CORS da API passou a aceitar `http://localhost:5241`, mantendo
  `http://localhost:5173` para compatibilidade local.
- `.npmrc` do frontend passou a forcar o registry publico do npm.
- `package-lock.json` foi regenerado sem referencias ao registry privado da
  Vizient.
- README raiz e README do frontend foram alinhados com as portas locais atuais.

Decisoes tecnicas:

- Usar `5280` para a API evita a faixa de portas reservadas observada no
  Windows e preserva `8080` para o modo Docker/demo.
- Fixar o Vite em `5241` com `strictPort` torna a URL local previsivel para
  documentacao, testes manuais e CORS.
- Manter a origem antiga `5173` no CORS reduz atrito para quem ainda estiver com
  uma instancia antiga do frontend.
- Registrar o registry no `.npmrc` do projeto evita depender da configuracao
  global da maquina e melhora reprodutibilidade.

Como a IA ajudou:

- Leu o protocolo do projeto, arquitetura, docs internas, planos em `tmp/` e o
  worktree antes do commit.
- Correlacionou os erros de porta/CORS com os planos ja registrados em `tmp/`.
- Revisou o diff para confirmar que a mudanca ficou restrita a configuracao
  local, documentacao e lockfile do frontend.

Correcao e decisao humana:

- O usuario pediu explicitamente commit e push de tudo que estava pendente.
- As alteracoes anteriores de correcao de porta, CORS e registry foram
  preservadas e apenas documentadas antes do commit.
- Nenhuma regra fiscal, migration, seed ou contrato HTTP funcional foi alterado.

Validacoes executadas:

- `dotnet build backend/PainelObrigacoes.sln --configuration Release`: 0 erros
  e 0 warnings.
- `dotnet test backend/PainelObrigacoes.sln --configuration Release --no-build`:
  18 testes passaram.
- `npm run build`: TypeScript e Vite build passaram.
- `npm audit --audit-level=moderate`: 0 vulnerabilidades.
- `rg "Vizientinc|pkgs\.dev\.azure\.com" frontend`: nenhuma referencia ao
  registry privado.
- `git diff --check`: sem erro de whitespace; apenas avisos LF/CRLF do Windows.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`:
  nenhum arquivo fonte acima de 250 linhas.
- Busca de imports proibidos no Domain: nenhuma ocorrencia.

Observacao de validacao:

- `dotnet build backend/PainelObrigacoes.sln` em Debug falhou porque uma API
  local ja estava em execucao e travando DLLs em `bin/Debug`; por isso a
  validacao final de build/teste foi feita em Release sem encerrar a instancia
  local.

Como apresentar esse commit:

- "O ajuste separa claramente ambiente local e ambiente Docker/demo: local usa
  API em `5280` e Vite em `5241`; Docker continua em `8080`."
- "O `.npmrc` local evita que o lockfile dependa de um registry privado da
  maquina."
- "CORS foi alinhado ao frontend real sem abrir origem generica."

### `1e76ee5` - `feat: expose dashboard and alerts navigation`

O que mudou:

- Item do menu `Relatorio` foi renomeado para `Dashboard`.
- Criada rota `/alertas` para expor o Painel de Alertas como pagina propria.
- A nova pagina reaproveita `AlertasPanel` e o hook `useAlertas`, sem duplicar
  regra fiscal no frontend.
- `routeTree.gen.ts` foi atualizado pelo TanStack Router.
- Texto do botao de pagina nao encontrada foi alinhado para "Voltar ao
  dashboard".

Decisoes tecnicas:

- Manter alertas como rota separada melhora a demonstracao das funcionalidades
  pedidas no case sem criar novo contrato HTTP.
- Reaproveitar o componente existente evita divergencia visual e logica entre
  dashboard e painel dedicado.
- A regra fiscal continua no backend; o frontend apenas consome o endpoint de
  alertas existente.

Como a IA ajudou:

- Verificou o protocolo do projeto, arquitetura, contexto em `tmp/` e worktree.
- Localizou que o dashboard ja existia, mas estava rotulado como relatorio.
- Identificou que alertas existiam como componente interno, mas nao como rota de
  menu.

Correcao e decisao humana:

- O usuario testou o frontend e apontou a ausencia de `Dashboard` e `Painel de
  Alertas` no menu.
- A alteracao foi limitada ao frontend de navegacao/rota, preservando as demais
  mudancas existentes no worktree.

Validacoes executadas:

- `npm run build`: TypeScript e Vite build passaram.
- Servidor Vite local iniciado em `http://127.0.0.1:5243/` para conferencia
  manual.
- Tentativa de verificacao via Playwright nao executou porque o pacote nao esta
  instalado localmente.

Como apresentar esse commit:

- "As funcionalidades ja existiam em parte; o ajuste foi transformar isso em
  navegacao clara para a demo."
- "O painel dedicado de alertas reutiliza o mesmo contrato HTTP e o mesmo
  componente visual, evitando duplicacao."

### `161157a` - `chore: align services docs and frontend queries`

O que mudou:

- Application deixou de expor classes em `Application/UseCases` e passou a usar
  `Application/Services` com classes `*Service`.
- Endpoints e DI foram atualizados para injetar application services.
- Repository pattern existente foi preservado: interfaces no Domain e
  implementacoes na Infrastructure.
- `architecture.md` virou o ADR de referencia na raiz, e `AGENTS.md` passou a
  concentrar o protocolo completo para agentes.
- README e templates foram ajustados para os novos caminhos de documentacao
  interna em `docs/ia-interna`.
- Hooks do frontend foram desestruturados nas telas principais para deixar
  loading, erro e dados mais explicitos.
- `.gitignore` passou a ignorar materiais internos gerados/organizados por IA.

Decisoes tecnicas:

- Usar `Application.Services` evita a nomenclatura antiga de use cases sem mudar
  os contratos HTTP nem mover regra de negocio para a API.
- Manter um service por operacao preserva arquivos pequenos e evita concentrar
  responsabilidades em classes grandes.
- Manter o repository pattern atual evita abstracao duplicada e respeita a
  arquitetura ja documentada.
- Centralizar instrucoes no `AGENTS.md` reduz risco de agentes lerem um arquivo
  curto e ignorarem regras obrigatorias.

Como a IA ajudou:

- Consultou protocolo, arquitetura, docs internas e registros em `tmp/` antes do
  stage/commit.
- Revisou o diff para separar backend, frontend e documentacao.
- Rodou validacoes e checagens de constraints antes de commitar.

Correcao e decisao humana:

- O usuario pediu explicitamente stage e commit de tudo que estava no worktree.
- A IA nao criou uma nova refatoracao funcional; apenas documentou o conjunto
  atual e validou antes do commit.
- O commit mantem a regra fiscal no backend/Domain e o frontend como cliente da
  API.

Validacoes executadas:

- `dotnet build backend/PainelObrigacoes.sln`: 0 erros e 0 warnings.
- `dotnet test backend/PainelObrigacoes.sln --no-build`: 18 testes passaram.
- `npm run build`: TypeScript e Vite build passaram.
- `npm audit --audit-level=moderate`: 0 vulnerabilidades.
- `git diff --check`: sem erro de whitespace; apenas avisos LF/CRLF do Windows.
- `rg "UseCase|UseCases" backend/src AGENTS.md architecture.md README.md docs`:
  nenhuma ocorrencia.
- Busca de imports proibidos no Domain: nenhuma ocorrencia.
- Checagem de tamanho em `backend/src`, `backend/tests` e `frontend/src`:
  nenhum arquivo acima de 250 linhas.

Como apresentar esse commit:

- "Troquei a nomenclatura de use case para application service sem mudar o
  desenho da Clean Architecture."
- "O repository pattern ja existia; a decisao correta foi preservar interfaces
  no Domain e implementacoes na Infrastructure."
- "Tambem organizei as instrucoes de IA para que qualquer agente comece pelo
  mesmo protocolo e pela mesma arquitetura."

### `4aeb5f9` - `feat: add React frontend with TanStack Router`

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

### `cf371ea` - `chore: clarify monorepo structure and naming`

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

### `61803f5` - `chore: simplify backend solution name`

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

### `716ce25` - `chore: add development docker compose`

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

### `ef415c0` - `docs: add agent workflow instructions`

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
