import type { ObrigacaoDto } from "../../../api/types";
import { normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";

export type CalendarioModo = "competencia" | "vencimento";
export type DeadlineLevel = "ok" | "atencao" | "urgente";
export type UrgencyLevel = DeadlineLevel | "concluida" | "neutra";

export interface CalendarioSummaryData {
  total: number;
  pendentes: number;
  entregues: number;
  atrasadas: number;
  pctConcluidas: number;
}

export function calcCalendarioSummary(data: ObrigacaoDto[]): CalendarioSummaryData {
  const total = data.length;
  const entregues = data.filter((item) => normalizeStatus(item.status) === StatusObrigacao.Entregue).length;

  return {
    total,
    pendentes: data.filter((item) => normalizeStatus(item.status) === StatusObrigacao.Pendente).length,
    entregues,
    atrasadas: data.filter((item) => normalizeStatus(item.status) === StatusObrigacao.Atrasada).length,
    pctConcluidas: total ? Math.round((entregues / total) * 100) : 0
  };
}

export function urgencyLevel(days: number): DeadlineLevel {
  if (days < 0) {
    return "urgente";
  }

  return days <= 7 ? "atencao" : "ok";
}

export function urgencyLabel(days: number) {
  if (days < 0) {
    return `${Math.abs(days)}d atrasado`;
  }

  return days === 0 ? "Vence hoje" : `${days}d restantes`;
}

export function urgencyPresentation(statusValue: ObrigacaoDto["status"], days: number) {
  const status = normalizeStatus(statusValue);

  if (status === StatusObrigacao.Entregue) {
    return { label: "Concluída", level: "concluida" as const };
  }

  if (status === StatusObrigacao.NaoAplicavel) {
    return { label: "Não aplicável", level: "neutra" as const };
  }

  return { label: urgencyLabel(days), level: urgencyLevel(days) };
}

export function statusClassName(statusValue: ObrigacaoDto["status"]) {
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

export function modeDescription(modo: CalendarioModo) {
  return modo === "vencimento"
    ? "Obrigações com prazo no mês selecionado, status e conclusão."
    : "Obrigações da competência selecionada, prazos e entregas.";
}
