import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PercentageOutlined,
  UnorderedListOutlined
} from "@ant-design/icons";
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

export function CalendarioSummary({ summary }: CalendarioSummaryProps) {
  const tiles: SummaryTile[] = [
    { key: "total", label: "Total", value: summary.total, tone: "total", icon: <UnorderedListOutlined /> },
    { key: "pendentes", label: "Pendentes", value: summary.pendentes, tone: "pendente", icon: <ClockCircleOutlined /> },
    { key: "entregues", label: "Entregues", value: summary.entregues, tone: "entregue", icon: <CheckCircleOutlined /> },
    { key: "atrasadas", label: "Atrasadas", value: summary.atrasadas, tone: "atrasada", icon: <AlertOutlined /> },
    {
      key: "pct",
      label: "Concluidas",
      value: `${summary.pctConcluidas}%`,
      tone: "entregue",
      icon: <PercentageOutlined />
    }
  ];

  return (
    <div className="calendario-summary" aria-label="Resumo do calendario">
      {tiles.map((tile) => (
        <div className="calendario-summary__tile" key={tile.key}>
          <span className={`calendario-summary__icon calendario-summary__icon--${tile.tone}`}>{tile.icon}</span>
          <span>
            <strong className={`calendario-summary__value calendario-summary__value--${tile.tone}`}>
              {tile.value}
            </strong>
            <span className="calendario-summary__label">{tile.label}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
