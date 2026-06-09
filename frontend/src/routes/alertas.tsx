import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { AlertaDto } from "../api/types";
import { AlertasPage } from "../features/dashboard/AlertasPage";
import { normalizeStatus } from "../shared/utils/domain";

export const Route = createFileRoute("/alertas")({
  component: AlertasRoute
});

function AlertasRoute() {
  const navigate = useNavigate({ from: "/alertas" });

  function handleOpenObrigacao(alerta: AlertaDto) {
    const dueDate = parseDueDate(alerta.dataVencimento);
    const status = normalizeStatus(alerta.status);

    navigate({
      to: "/calendario",
      search: {
        ano: dueDate?.ano,
        mes: dueDate?.mes,
        empresaId: alerta.empresaId,
        status: Number.isFinite(status) ? status : undefined,
        modo: "vencimento"
      }
    });
  }

  return <AlertasPage onOpenObrigacao={handleOpenObrigacao} />;
}

function parseDueDate(value: string) {
  const [datePart] = value.split("T");
  const [year, month] = datePart.split("-").map(Number);

  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    return undefined;
  }

  return { ano: year, mes: month };
}
