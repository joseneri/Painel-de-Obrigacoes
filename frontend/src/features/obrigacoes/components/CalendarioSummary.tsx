import { AlertOutlined, CheckCircleOutlined, ClockCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import type { CalendarioSummaryData } from "./calendarioPresentation";

interface SummaryTile {
  key: string;
  label: string;
  value: string | number;
  tone: "total" | "pendente" | "entregue" | "atrasada";
  icon: ReactNode;
}

interface CalendarioSummaryProps {
  summary: CalendarioSummaryData;
}

const tileToneClassNames = {
  total: {
    icon: "bg-[#e6f1fb] text-[#1677ff]",
    value: "text-[#0f172a]"
  },
  pendente: {
    icon: "bg-[#fff3e0] text-[#e65100]",
    value: "text-[#e65100]"
  },
  entregue: {
    icon: "bg-[#e8f5e9] text-[#2e7d32]",
    value: "text-[#2e7d32]"
  },
  atrasada: {
    icon: "bg-[#ffebee] text-[#c62828]",
    value: "text-[#c62828]"
  }
} satisfies Record<SummaryTile["tone"], { icon: string; value: string }>;

export function CalendarioSummary({ summary }: CalendarioSummaryProps) {
  const tiles: SummaryTile[] = [
    { key: "total", label: "Total", value: summary.total, tone: "total", icon: <UnorderedListOutlined /> },
    { key: "pendentes", label: "Pendentes", value: summary.pendentes, tone: "pendente", icon: <ClockCircleOutlined /> },
    { key: "entregues", label: "Entregues", value: summary.entregues, tone: "entregue", icon: <CheckCircleOutlined /> },
    { key: "atrasadas", label: "Atrasadas", value: summary.atrasadas, tone: "atrasada", icon: <AlertOutlined /> }
  ];

  return (
    <div
      className="grid grid-cols-[repeat(4,minmax(170px,1fr))] gap-3 border-b border-[#e2e8f0] bg-[#f8fafc] px-7 pb-[18px] pt-3 max-[980px]:grid-cols-2 max-[720px]:grid-cols-1"
      aria-label="Resumo do calendário"
    >
      {tiles.map((tile) => (
        <div
          className="flex min-h-[112px] min-w-0 items-center gap-4 rounded-lg border border-[#f1f5f9] bg-white px-6 py-[18px] shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:min-h-[104px]"
          key={tile.key}
        >
          <span
            className={`inline-grid h-12 w-12 flex-none place-items-center rounded-[10px] text-[21px] ${tileToneClassNames[tile.tone].icon}`}
          >
            {tile.icon}
          </span>
          <span>
            <strong className={`block text-[34px] leading-none ${tileToneClassNames[tile.tone].value}`}>
              {tile.value}
            </strong>
            <span className="mt-2 block text-[13px] font-bold uppercase text-[#667085]">{tile.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
