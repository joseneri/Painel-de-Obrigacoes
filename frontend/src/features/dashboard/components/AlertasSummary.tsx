import { AlertOutlined, ClockCircleOutlined, UnorderedListOutlined } from "@ant-design/icons";
import type { ReactNode } from "react";
import { MetricTile } from "../../../shared/ui/MetricTile";
import { metricPanelClassName, type UiTone } from "../../../shared/ui/styles";
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
  tone: UiTone;
  icon: ReactNode;
}

const summaryToneMap = {
  total: "info",
  atrasada: "danger",
  vencendo: "warning"
} satisfies Record<AlertTone, UiTone>;

export function AlertasSummary({
  total,
  overdue,
  upcoming,
  loading,
  selectedFilter,
  onFilterChange
}: AlertasSummaryProps) {
  const tiles: SummaryTile[] = [
    { key: "todos", label: "Total", value: total, tone: summaryToneMap.total, icon: <UnorderedListOutlined /> },
    { key: "atrasadas", label: "Atrasadas", value: overdue, tone: summaryToneMap.atrasada, icon: <AlertOutlined /> },
    { key: "vencendo", label: "Pendentes", value: upcoming, tone: summaryToneMap.vencendo, icon: <ClockCircleOutlined /> }
  ];

  return (
    <div className={metricPanelClassName} aria-label="Resumo dos alertas">
      {tiles.map((tile) => (
        <MetricTile
          key={tile.key}
          label={tile.label}
          value={tile.value}
          loading={loading}
          icon={tile.icon}
          tone={tile.tone}
          selected={selectedFilter === tile.key}
          onClick={() => onFilterChange(tile.key)}
        />
      ))}
    </div>
  );
}
