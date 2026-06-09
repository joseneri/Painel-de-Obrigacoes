# Frontend

SPA React/Vite do **Painel de Obrigacoes Acessorias**.

## Stack

- React 18 + Vite + TypeScript
- Ant Design para componentes estruturais
- TanStack Query para estado servidor
- TanStack Router para rotas file-based e search params tipados
- Day.js para datas

## Como rodar local

No desenvolvimento, suba apenas o banco pelo Compose dev e rode API e frontend
localmente.

```bash
docker compose -f ../docker-compose.dev.yml up -d
dotnet run --project ../backend/src/Api/PainelObrigacoes.Api.csproj --launch-profile http
```

Em outro terminal:

```bash
npm install
npm run dev
```

Por padrao o Vite sobe em:

- `http://localhost:5241`

A API esperada por padrao no desenvolvimento local e:

- `http://localhost:5280`

O arquivo `.env.example` registra essa URL. Para apontar temporariamente para a
API do Compose principal em `8080`, crie um `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Telas implementadas

- Relatorio fiscal com KPIs do dashboard e distribuicao de status.
- Painel de alertas para atrasadas e vencimentos dos proximos 30 dias.
- Calendario de obrigacoes por empresa, competencia e status.
- Registro de entrega com data de conclusao e observacao.
- Exportacao CSV do calendario filtrado.
- Cadastro, listagem e remocao de empresas.

## Arquitetura de rotas

O frontend usa TanStack Router porque a aplicacao e uma SPA React/Vite, mas
precisa de uma divisao clara de rotas e estado de URL:

- `src/app/App.tsx`: monta apenas o `RouterProvider`.
- `src/app/AppShell.tsx`: layout global com sidebar, header e `Outlet`.
- `src/app/router.tsx`: cria o router e injeta o `queryClient` no contexto.
- `src/routes`: rotas file-based (`/dashboard`, `/calendario`, `/empresas`).
- `src/features`: telas e componentes de dominio.

TanStack Query continua cuidando de dados da API; TanStack Router cuida de
navegacao e search params. Exemplo: filtros do calendario podem ser reabertos
por URL em `/calendario?ano=2026&mes=6&status=2`.

## Base funcional

A interface foi desenhada a partir do PDF do case e dos contratos reais da API:

- `GET /api/obrigacoes/dashboard`
- `GET /api/obrigacoes/alertas`
- `GET /api/obrigacoes?empresaId=&ano=&mes=&status=`
- `GET /api/empresas`
- `POST /api/empresas`
- `DELETE /api/empresas/{id}`
- `POST /api/entregas`

O frontend nao recalcula regras fiscais. Regime, obrigacoes, vencimentos e
status continuam como responsabilidade do backend.
