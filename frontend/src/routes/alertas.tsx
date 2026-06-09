import { createFileRoute } from "@tanstack/react-router";
import { AlertasPage } from "../features/dashboard/AlertasPage";

export const Route = createFileRoute("/alertas")({
  component: AlertasPage
});
