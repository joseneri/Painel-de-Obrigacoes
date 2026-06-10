# Frontend

SPA React/Vite do **Painel de Obrigacoes Acessorias**.

## Stack

- React 18 + Vite + TypeScript
- Ant Design para componentes estruturais
- TanStack Query para estado servidor
- TanStack Router para rotas file-based e search params tipados
- Day.js para datas

## Como rodar na entrega

Na raiz do repositorio:

```bash
docker compose up --build
```

O Compose builda o frontend e serve a SPA por Nginx em:

- `http://localhost:8081`

A API consumida pelo build de entrega fica em:

- `http://localhost:8080`

## Desenvolvimento local do frontend

Para trabalhar apenas na SPA, instale as dependencias e rode o Vite:

```bash
npm install
npm run dev
```

Por padrao o Vite sobe em:

- `http://localhost:5241`

O arquivo `.env.example` aponta para `http://localhost:5280`, usado quando a API
e executada localmente com `dotnet run`. Para apontar o frontend local para a
API do Compose em `8080`, crie um `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Telas implementadas

- Dashboard com KPIs e distribuicao de status.
- Painel de alertas para atrasadas e vencimentos dos proximos 30 dias.
- Calendario de obrigacoes por empresa, competencia, vencimento e status.
- Registro de entrega com data de conclusao e observacao.
- Exportacao CSV/PDF do calendario filtrado.
- Cadastro, listagem e remocao de empresas.

## Arquitetura de rotas

O frontend usa TanStack Router porque a aplicacao e uma SPA React/Vite, mas
precisa de divisao clara de rotas e estado de URL:

- `src/app/App.tsx`: monta apenas o `RouterProvider`.
- `src/app/AppShell.tsx`: layout global com sidebar, header e `Outlet`.
- `src/app/router.tsx`: cria o router e injeta o `queryClient` no contexto.
- `src/routes`: rotas file-based (`/dashboard`, `/calendario`, `/alertas`,
  `/empresas`).
- `src/features`: telas e componentes de dominio.

TanStack Query continua cuidando de dados da API; TanStack Router cuida de
navegacao e search params. Exemplo: filtros do calendario podem ser reabertos
por URL em `/calendario?ano=2026&mes=6&status=2`.

## Contratos consumidos

- `GET /api/obrigacoes/dashboard`
- `GET /api/obrigacoes/alertas`
- `GET /api/obrigacoes?empresaId=&ano=&mes=&status=`
- `GET /api/empresas`
- `POST /api/empresas`
- `DELETE /api/empresas/{id}`
- `POST /api/entregas`

O frontend nao recalcula regras fiscais. Regime, obrigacoes, vencimentos e
status continuam como responsabilidade do backend.
