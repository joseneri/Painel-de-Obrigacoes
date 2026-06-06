import { createFileRoute } from "@tanstack/react-router";
import { EmpresasPage } from "../features/empresas/EmpresasPage";

export const Route = createFileRoute("/empresas")({
  component: EmpresasPage
});
