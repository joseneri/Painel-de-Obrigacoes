import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute
});

function DashboardRoute() {
  const navigate = useNavigate({ from: "/dashboard" });

  return (
    <DashboardPage
      onOpenAlertas={() => navigate({ to: "/alertas" })}
      onOpenCalendario={() => navigate({ to: "/calendario" })}
    />
  );
}
