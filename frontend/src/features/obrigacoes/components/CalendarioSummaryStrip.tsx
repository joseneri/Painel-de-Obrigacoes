import { Skeleton, Typography } from "antd";
import type { CalendarSummary } from "../calendarioPresentation";

interface CalendarioSummaryStripProps {
  summary: CalendarSummary;
  loading: boolean;
}

const metricConfig = [
  { key: "total", label: "Total", tone: "info" },
  { key: "atrasadas", label: "Atrasadas", tone: "overdue" },
  { key: "vencemHoje", label: "Hoje", tone: "today" },
  { key: "proximos7", label: "Prox. 7 dias", tone: "soon" },
  { key: "entregues", label: "Entregues", tone: "done" },
  { key: "anuais", label: "Anuais", tone: "annual" }
] as const;

export function CalendarioSummaryStrip({ summary, loading }: CalendarioSummaryStripProps) {
  if (loading) {
    return <Skeleton active paragraph={{ rows: 1 }} title={false} />;
  }

  return (
    <div className="calendar-summary-strip" aria-label="Resumo do calendario">
      {metricConfig.map((metric) => (
        <div className={`calendar-summary-item summary-${metric.tone}`} key={metric.key}>
          <Typography.Text className="calendar-summary-value">
            {summary[metric.key]}
          </Typography.Text>
          <Typography.Text className="calendar-summary-label">{metric.label}</Typography.Text>
        </div>
      ))}
    </div>
  );
}
