import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "../features/dashboard/DashboardPage";

export const Route = createFileRoute("/dashboard")({
  component: DashboardRoute
});

function DashboardRoute() {
  return <DashboardPage />;
}
