# Instrucoes para Agentes de IA

## Protocolo Obrigatorio Antes de Qualquer Acao

Antes de responder, planejar, executar comando, editar arquivo, instalar
dependencia, rodar teste, fazer stage ou sugerir commit:

1. Leia este arquivo inteiro.
2. Leia `architecture.md`.
3. Consulte `docs/ia-interna/ia-showcase-guide.md` e
   `docs/ia-interna/implementation-summary.md` quando houver defesa tecnica,
   demonstracao, resumo de implementacao, commit ou continuidade de contexto.
4. Consulte `tmp/` para pesquisas, achados, planos, riscos e decisoes.
5. Verifique `git status --short` para nao sobrescrever trabalho existente.
6. Classifique a tarefa como trivial, media ou complexa.

Esse protocolo vale para cada nova solicitacao do usuario. Nao assuma que a
leitura feita antes ainda e suficiente.

## Fluxo Padrao

Para tarefas medias ou complexas, siga:

1. Criar plano de pesquisa em `tmp/pesquisa-plano-<assunto>.md`.
2. Executar a pesquisa.
3. Salvar achados em `tmp/achados-<assunto>.md`.
4. Criar plano de desenvolvimento em `tmp/plano-<assunto>.md`.
5. Mostrar o plano ao usuario.
6. Aguardar aprovacao humana.
7. Implementar somente depois da aprovacao.
8. Validar com build/testes/verificacao aplicavel.
9. Registrar riscos finais.
10. Fazer stage somente se o usuario pediu/autorizar.

Para tarefas triviais, responda direto ou faca um plano curto, mas ainda
respeite arquitetura, riscos, worktree e Git.

## Templates Obrigatorios

- Plano: `docs/plan-template.md`.
- Plano de pesquisa: `docs/research-template.md`.
- Achados de pesquisa: `docs/findings-template.md`.
- Handoff: `docs/handoff-template.md`.

Use os templates como base. Nao precisa copiar campos irrelevantes, mas nao
remova riscos, edge cases, validacao e done checklist em tarefas complexas.

## Pesquisa

Quando houver decisao tecnica, framework, API, arquitetura, comportamento
recente ou informacao que possa estar desatualizada, pesquise antes de
implementar.

Fontes possiveis:

- Documentacao oficial.
- Documentacao de bibliotecas e softwares relacionados.
- GitHub, issues e PRs.
- Blogs tecnicos.
- Reddit e comunidade.
- Referencias classicas de arquitetura/design, como Robert Martin e Gang of
  Four, quando fizer sentido.
- Referencias de inspiracao de produto/UI, quando fizer sentido.

Registre conclusoes, links, trade-offs, riscos e recomendacao final em
`tmp/achados-*.md`.

## Git e Contexto Historico

- Sempre confira `git status --short`.
- Para continuidade de trabalho, leia commits recentes com `git log`,
  `git show` ou comandos equivalentes.
- Para usar outro branch como referencia, leia sem checkout sempre que
  possivel, por exemplo com `git show branch:path`, `git diff` ou `git log`.
- Nao use `git checkout`, `git reset`, `git clean` ou comandos destrutivos sem
  pedido explicito.
- Nao faca commit sem pedido explicito.
- Faca stage apenas quando o usuario pedir/autorizar.
- Quando fizer stage, use lista explicita de arquivos da tarefa atual.
- Se o usuario pedir commit, antes atualize
  `docs/ia-interna/ia-showcase-guide.md` com decisoes tecnicas, uso de IA,
  validacoes e pontos de apresentacao.

## Este Projeto

Nome oficial do produto: Painel de Obrigacoes Acessorias.

Descricao funcional: calendario fiscal inteligente para obrigacoes acessorias.
O sistema nao calcula impostos; gera e controla obrigacoes tributarias por
regime: Simples Nacional, Lucro Presumido, Lucro Real e Imune/Isento.

## Consulta Rapida do PDF do Case

Antes de responder perguntas sobre requisitos do case, consulte primeiro
`tmp/requisitos-case-painel-obrigacoes.md`.

O PDF original permanece como fonte canonica em
`C:\Users\Neri\Downloads\case_painel_obrigacoes_eauditoria (3).pdf` e deve ser
conferido em caso de duvida, divergencia ou pergunta especifica.

## Regras de Ouro

- Domain layer: zero imports de `Microsoft.*`, `System.Data.*` ou EF Core.
- Nenhum arquivo fonte de codigo deve passar de 250 linhas. Arquivos CSS ficam
  fora desse limite.
- Evite god files; modularize por responsabilidade.
- Engine de regras: stateless, sem injecao de infraestrutura.
- Endpoints chamam application services; zero logica de negocio no endpoint.
- Frontend nao replica a engine fiscal; consome contratos HTTP do backend.
- Testes ou build devem ser executados antes de declarar conclusao quando a
  mudanca for tecnica.
- Sempre salve planos em `tmp/` antes de codificar.
- Sempre peca aprovacao antes de implementar tarefa media/complexa.

## Palavras-Chave de Trabalho

Use e registre quando aplicavel:

- `constraints`: restricoes duras do projeto.
- `hardening`: robustez, falhas, seguranca, validacao e recuperacao.
- `edge cases`: casos limite.
- `handoff`: resumo para continuidade.

## Checklist de Riscos

Antes de codificar e antes de finalizar, confira:

- Escopo: a mudanca atende o pedido atual sem refatorar partes nao pedidas?
- Worktree: existem alteracoes do usuario que nao devem ser revertidas?
- Historico: commits recentes ou branches de referencia precisam ser lidos?
- Arquitetura: a mudanca respeita `architecture.md`?
- Regras fiscais: a logica tributaria continua no Domain/backend?
- Contratos: DTOs, endpoints e enums usados pelo frontend batem com a API?
- Persistencia: migrations, UTC, CNPJ normalizado e seed continuam coerentes?
- Limite de arquivo: nenhum fonte de codigo passa de 250 linhas? CSS esta fora
  desse limite.
- Validacao: build/teste adequado foi rodado ou a impossibilidade foi anotada?
- Docker/local: portas, CORS e `VITE_API_BASE_URL` estao coerentes?
- Documentacao: README, `tmp/` e guia de IA foram atualizados quando aplicavel?
- Git: nao houve commit, stage, reset ou checkout sem autorizacao explicita?

## Multi-Agent Dialogue

Para projeto grande ou analise ampla:

1. Um agente inicial define areas de analise.
2. Agentes separados analisam areas especificas.
3. Cada agente salva resultado em `tmp/analise-<area>.md`.
4. Um agente final consolida em `tmp/consolidado-<assunto>.md`.
5. O plano de desenvolvimento usa o consolidado como fonte.

## Handoff e Contexto

Quando a conversa ficar longa, a qualidade cair, houver troca de agente ou for
necessario compactar contexto:

- Gere handoff em Markdown usando `docs/handoff-template.md`.
- Salve em `tmp/handoff-<assunto>.md` quando for util.
- O proximo agente deve ler `AGENTS.md`, `architecture.md`, o handoff e
  `git status --short`.

## Prompt Treatment

Quando o usuario trouxer ideia solta, audio transcrito ou pedido confuso:

- Transforme a ideia em um prompt/plano claro.
- Separe objetivo, contexto, constraints, riscos e done checklist.
- Peca confirmacao antes de implementar se a tarefa for media/complexa.
