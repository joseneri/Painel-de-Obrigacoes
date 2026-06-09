import dayjs from "dayjs";
import type { ObrigacaoDto } from "../../../api/types";
import { normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";

export interface AgendaGroup {
  dateKey: string;
  rows: ObrigacaoDto[];
}

export interface CalendarioSummaryModel {
  total: number;
  atrasadas: number;
  pendentes: number;
  entregues: number;
  proximo?: ObrigacaoDto;
}

export function buildCalendarioSummary(rows: ObrigacaoDto[]): CalendarioSummaryModel {
  const ordered = sortObrigacoes(rows);

  return {
    total: rows.length,
    atrasadas: countByStatus(rows, StatusObrigacao.Atrasada),
    pendentes: countByStatus(rows, StatusObrigacao.Pendente),
    entregues: countByStatus(rows, StatusObrigacao.Entregue),
    proximo: ordered.find((row) => normalizeStatus(row.status) !== StatusObrigacao.Entregue)
  };
}

export function buildAgendaGroups(rows: ObrigacaoDto[]): AgendaGroup[] {
  const groups = new Map<string, ObrigacaoDto[]>();

  sortObrigacoes(rows).forEach((row) => {
    const dateKey = getDateKey(row.dataVencimento);
    groups.set(dateKey, [...(groups.get(dateKey) ?? []), row]);
  });

  return Array.from(groups.entries())
    .map(([dateKey, groupRows]) => ({ dateKey, rows: groupRows }))
    .sort((a, b) => dayjs(a.dateKey).valueOf() - dayjs(b.dateKey).valueOf());
}

export function sortObrigacoes(rows: ObrigacaoDto[]) {
  return [...rows].sort((a, b) => {
    const urgency = statusPriority(a) - statusPriority(b);
    if (urgency !== 0) {
      return urgency;
    }

    const vencimento = dayjs(a.dataVencimento).valueOf() - dayjs(b.dataVencimento).valueOf();
    if (vencimento !== 0) {
      return vencimento;
    }

    return a.empresaRazaoSocial.localeCompare(b.empresaRazaoSocial);
  });
}

export function getDateKey(value: string) {
  return value.split("T")[0] || value;
}

function countByStatus(rows: ObrigacaoDto[], status: number) {
  return rows.filter((row) => normalizeStatus(row.status) === status).length;
}

function statusPriority(row: ObrigacaoDto) {
  const status = normalizeStatus(row.status);

  if (status === StatusObrigacao.Atrasada) {
    return 0;
  }

  if (status === StatusObrigacao.Pendente) {
    return 1;
  }

  if (status === StatusObrigacao.Entregue) {
    return 2;
  }

  return 3;
}
