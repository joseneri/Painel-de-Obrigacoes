import { Button, Result } from "antd";
import { Link, createRootRouteWithContext } from "@tanstack/react-router";
import { AppShell } from "../app/AppShell";
import type { RouterContext } from "../app/routerContext";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: AppShell,
  notFoundComponent: NotFoundPage
});

function NotFoundPage() {
  return (
    <Result
      status="404"
      title="Pagina nao encontrada"
      subTitle="A rota solicitada nao existe neste painel."
      extra={
        <Link to="/dashboard">
          <Button type="primary">Voltar ao dashboard</Button>
        </Link>
      }
    />
  );
}
