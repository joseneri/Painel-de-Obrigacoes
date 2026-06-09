import dayjs, { type Dayjs } from "dayjs";
import type { ObrigacaoDto } from "../../api/types";
import {
  labelPeriodicidade,
  labelTipo,
  normalizeStatus,
  StatusObrigacao
} from "../../shared/utils/domain";
import { urgencyText } from "../../shared/utils/formatters";

export type UrgencyTone = "overdue" | "today" | "soon" | "future" | "done" | "neutral";

export interface CalendarSummary {
  total: number;
  atrasadas: number;
  vencemHoje: number;
  proximos7: number;
  entregues: number;
  anuais: number;
}

const monthNames = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro"
];

const weekdayNames = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];

export function getDateKey(value: string) {
  return value.split("T")[0] ?? value;
}

export function getObrigacaoDateKey(row: ObrigacaoDto) {
  return getDateKey(row.dataVencimento);
}

export function groupByVencimento(rows: ObrigacaoDto[]) {
  return [...rows].sort(sortObrigacoes).reduce<Record<string, ObrigacaoDto[]>>((groups, row) => {
    const key = getObrigacaoDateKey(row);
    groups[key] = [...(groups[key] ?? []), row];
    return groups;
  }, {});
}

export function summarizeObrigacoes(rows: ObrigacaoDto[]): CalendarSummary {
  return rows.reduce<CalendarSummary>(
    (summary, row) => {
      const tone = urgencyTone(row);

      return {
        total: summary.total + 1,
        atrasadas: summary.atrasadas + (tone === "overdue" ? 1 : 0),
        vencemHoje: summary.vencemHoje + (tone === "today" ? 1 : 0),
        proximos7: summary.proximos7 + (tone === "soon" ? 1 : 0),
        entregues: summary.entregues + (tone === "done" ? 1 : 0),
        anuais: summary.anuais + (isAnual(row) ? 1 : 0)
      };
    },
    { total: 0, atrasadas: 0, vencemHoje: 0, proximos7: 0, entregues: 0, anuais: 0 }
  );
}

export function buildMonthDays(month: Dayjs) {
  const firstDay = month.startOf("month");
  const gridStart = firstDay.subtract(firstDay.day(), "day");

  return Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day"));
}

export function initialSelectedDateKey(rows: ObrigacaoDto[], month: Dayjs) {
  const today = dayjs();
  const todayKey = today.format("YYYY-MM-DD");

  if (today.isSame(month, "month") && rows.some((row) => getObrigacaoDateKey(row) === todayKey)) {
    return todayKey;
  }

  const firstDueDate = [...rows].sort(sortObrigacoes)[0]?.dataVencimento;
  return firstDueDate ? getDateKey(firstDueDate) : month.startOf("month").format("YYYY-MM-DD");
}

export function formatMonthTitle(month: Dayjs) {
  return `${monthNames[month.month()]} ${month.year()}`;
}

export function formatDateKeyLong(key: string) {
  const value = dayjs(`${key}T00:00:00`);
  return `${weekdayNames[value.day()]}, ${String(value.date()).padStart(2, "0")}/${String(
    value.month() + 1
  ).padStart(2, "0")}/${value.year()}`;
}

export function urgencyTone(row: ObrigacaoDto): UrgencyTone {
  const status = normalizeStatus(row.status);

  if (status === StatusObrigacao.Entregue) {
    return "done";
  }

  if (status === StatusObrigacao.NaoAplicavel) {
    return "neutral";
  }

  if (status === StatusObrigacao.Atrasada || row.diasParaVencer < 0) {
    return "overdue";
  }

  if (row.diasParaVencer === 0) {
    return "today";
  }

  if (row.diasParaVencer <= 7) {
    return "soon";
  }

  return "future";
}

export function urgencyLabel(row: ObrigacaoDto) {
  return urgencyText(row.diasParaVencer);
}

export function isAnual(row: ObrigacaoDto) {
  return row.periodicidade === 2 || labelPeriodicidade(row.periodicidade) === "Anual";
}

export function toneClass(row: ObrigacaoDto) {
  return `tone-${urgencyTone(row)}`;
}

export function sortObrigacoes(a: ObrigacaoDto, b: ObrigacaoDto) {
  const toneOrder: Record<UrgencyTone, number> = {
    overdue: 0,
    today: 1,
    soon: 2,
    future: 3,
    done: 4,
    neutral: 5
  };
  const toneDiff = toneOrder[urgencyTone(a)] - toneOrder[urgencyTone(b)];

  if (toneDiff !== 0) {
    return toneDiff;
  }

  const dateDiff = dayjs(a.dataVencimento).valueOf() - dayjs(b.dataVencimento).valueOf();
  return dateDiff !== 0 ? dateDiff : labelTipo(a.tipo).localeCompare(labelTipo(b.tipo));
}
