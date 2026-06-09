import { Skeleton } from "antd";
import { AlertOutlined, ClockCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { classNames } from "../../../shared/utils/classNames";
import type { AlertFilter, AlertTone } from "./alertasPresentation";

interface AlertasSummaryProps {
  total: number;
  overdue: number;
  upcoming: number;
  loading: boolean;
  selectedFilter: AlertFilter;
  onFilterChange: (filter: AlertFilter) => void;
}

interface SummaryTile {
  key: AlertFilter;
  label: string;
  value: number;
  tone: AlertTone;
  icon: ReactNode;
}

const tileToneClassNames = {
  total: {
    icon: "bg-[#e6f1fb] text-[#1677ff]",
    value: "text-[#0f172a]"
  },
  atrasada: {
    icon: "bg-[#ffebee] text-[#c62828]",
    value: "text-[#c62828]"
  },
  vencendo: {
    icon: "bg-[#fff3e0] text-[#e65100]",
    value: "text-[#e65100]"
  }
} satisfies Record<AlertTone, { icon: string; value: string }>;

export function AlertasSummary({
  total,
  overdue,
  upcoming,
  loading,
  selectedFilter,
  onFilterChange
}: AlertasSummaryProps) {
  const tiles: SummaryTile[] = [
    { key: "todos", label: "Total", value: total, tone: "total", icon: <UnorderedListOutlined /> },
    { key: "atrasadas", label: "Atrasadas", value: overdue, tone: "atrasada", icon: <AlertOutlined /> },
    { key: "vencendo", label: "Vencendo", value: upcoming, tone: "vencendo", icon: <ClockCircleOutlined /> }
  ];

  return (
    <div
      className="grid grid-cols-[repeat(3,minmax(170px,1fr))] gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-7 pb-[18px] pt-3 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1 max-[720px]:px-4"
      aria-label="Resumo dos alertas"
    >
      {tiles.map((tile) => {
        const tone = tileToneClassNames[tile.tone];
        const selected = selectedFilter === tile.key;

        return (
          <button
            type="button"
            className={classNames(
              "flex min-h-[112px] min-w-0 items-center gap-4 rounded-lg border bg-white px-6 py-[18px] text-left shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition max-[720px]:min-h-[104px]",
              selected ? "border-[#1677ff] ring-2 ring-[#dbeafe]" : "border-[#f1f5f9] hover:border-[#bfdbfe]"
            )}
            aria-pressed={selected}
            onClick={() => onFilterChange(tile.key)}
            key={tile.key}
          >
            <span className={`inline-grid h-12 w-12 flex-none place-items-center rounded-[10px] text-[21px] ${tone.icon}`}>
              {tile.icon}
            </span>
            <span className="min-w-0">
              {loading ? (
                <Skeleton.Input active className="!h-[34px] !w-20" size="small" />
              ) : (
                <strong className={`block text-[34px] leading-none ${tone.value}`}>{tile.value}</strong>
              )}
              <span className="mt-2 block text-[13px] font-bold uppercase text-[#667085]">{tile.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
