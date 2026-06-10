import type { AlertaDto } from "../../../api/types";
import { fixedBadgeClassName, statusBadgeClassNames, urgencyBadgeClassNames } from "../../../shared/ui/styles";
import { normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";

export type AlertFilter = "todos" | "atrasadas" | "vencendo";
export type AlertTone = "total" | "atrasada" | "vencendo";
export type UrgencyTone = "ok" | "atencao" | "urgente";
export type StatusTone = "pendente" | "entregue" | "atrasada" | "nao-aplicavel";

export const alertasPageSize = 10;

export const alertBadgeClassName = fixedBadgeClassName;
export const alertUrgencyBadgeClassName = fixedBadgeClassName;

export const alertStatusClassNames = statusBadgeClassNames satisfies Record<StatusTone, string>;

export const alertUrgencyClassNames = urgencyBadgeClassNames satisfies Record<UrgencyTone, string>;

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
