# Agent Entry Point

Antes de qualquer resposta, comando ou edicao neste repositorio, leia e siga:

- `docs/agents.md`
- `docs/architecture.md`
- arquivos relevantes em `tmp/`

Regras obrigatorias:

- Para tarefa media/complexa, nao implemente direto.
- Fluxo padrao: pesquisa -> achados -> plano -> aprovacao humana ->
  implementacao -> validacao -> stage autorizado.
- Use os templates em `docs/`:
  - `docs/research-template.md`
  - `docs/findings-template.md`
  - `docs/plan-template.md`
  - `docs/handoff-template.md`
- Crie ou atualize plano em `tmp/` antes de codificar.
- Crie ou atualize pesquisa/achados em `tmp/` quando houver decisao tecnica,
  framework, API, arquitetura ou informacao que possa estar desatualizada.
- Verifique riscos antes de editar e antes de finalizar.
- Peca aprovacao do usuario antes de implementar tarefa media/complexa.
- Nao faca commit sem pedido explicito do usuario.
- Faca stage somente quando o usuario pedir/autorizar, e somente dos arquivos
  relacionados a tarefa atual.
