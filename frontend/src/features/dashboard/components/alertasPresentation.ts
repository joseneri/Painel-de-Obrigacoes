import type { AlertaDto } from "../../../api/types";
import { normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";

export type AlertFilter = "todos" | "atrasadas" | "vencendo";
export type AlertTone = "total" | "atrasada" | "vencendo";
export type UrgencyTone = "ok" | "atencao" | "urgente";
export type StatusTone = "pendente" | "entregue" | "atrasada" | "nao-aplicavel";

export const alertasPageSize = 10;

export const alertBadgeClassName =
  "inline-flex h-7 items-center whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold";
export const alertUrgencyBadgeClassName = `${alertBadgeClassName} min-w-[128px] justify-center`;

export const alertStatusClassNames = {
  pendente: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  entregue: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  atrasada: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
  "nao-aplicavel": "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
} satisfies Record<StatusTone, string>;

export const alertUrgencyClassNames = {
  ok: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
  atencao: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  urgente: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]"
} satisfies Record<UrgencyTone, string>;

export function getFilteredAlerts(filter: AlertFilter, overdueAlerts: AlertaDto[], upcomingAlerts: AlertaDto[]) {
  if (filter === "atrasadas") {
    return overdueAlerts;
  }

  if (filter === "vencendo") {
    return upcomingAlerts;
  }

  return [...overdueAlerts, ...upcomingAlerts];
}

export function sortAlerts(alerts: AlertaDto[]) {
  return [...alerts].sort(
    (first, second) =>
      first.diasParaVencer - second.diasParaVencer || first.dataVencimento.localeCompare(second.dataVencimento)
  );
}

export function isOverdueAlert(item: AlertaDto) {
  return item.diasParaVencer < 0;
}

export function isUpcomingAlert(item: AlertaDto) {
  return item.diasParaVencer >= 0 && item.diasParaVencer <= 30;
}

export function emptyAlertasDescription(filter: AlertFilter) {
  if (filter === "atrasadas") {
    return "Nenhuma obrigação atrasada encontrada";
  }

  if (filter === "vencendo") {
    return "Nenhuma obrigação vencendo nos próximos 30 dias";
  }

  return "Nenhum prazo crítico encontrado";
}

export function statusTone(statusValue: AlertaDto["status"]): StatusTone {
  const status = normalizeStatus(statusValue);

  if (status === StatusObrigacao.Entregue) {
    return "entregue";
  }

  if (status === StatusObrigacao.Atrasada) {
    return "atrasada";
  }

  if (status === StatusObrigacao.NaoAplicavel) {
    return "nao-aplicavel";
  }

  return "pendente";
}

export function urgencyTone(days: number): UrgencyTone {
  if (days < 0) {
    return "urgente";
  }

  return days <= 7 ? "atencao" : "ok";
}
