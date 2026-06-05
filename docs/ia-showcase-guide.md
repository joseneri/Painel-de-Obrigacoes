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

## Diário Por Commit

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
