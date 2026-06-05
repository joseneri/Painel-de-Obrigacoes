# Frontend

SPA React/Vite do Painel de Obrigações Acessórias.

Esta pasta foi criada para mostrar a estrutura planejada do monorepo. A UI ainda
será implementada em uma etapa posterior com:

- React + Vite + TypeScript
- Ant Design
- TanStack Query
- cliente HTTP para a API .NET em `backend/src/Api`

Estrutura planejada:

```text
frontend/
  public/
  src/
    api/
    app/
    features/
      dashboard/
      empresas/
      obrigacoes/
    pages/
    shared/
```

Em desenvolvimento, Vite roda um servidor local para hot reload. Em produção, a
SPA será buildada para arquivos estáticos e servida por Nginx no Docker.

