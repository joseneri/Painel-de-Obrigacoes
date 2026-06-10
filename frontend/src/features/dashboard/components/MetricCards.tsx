import { AlertOutlined, ClockCircleOutlined } from "@ant-design/icons";
import type { DashboardDto } from "../../../api/types";
import { MetricTile } from "../../../shared/ui/MetricTile";
import { dashboardMetricPanelClassName } from "../../../shared/ui/styles";

interface MetricCardsProps {
  data?: DashboardDto;
  loading: boolean;
}

export function MetricCards({ data, loading }: MetricCardsProps) {
  return (
    <div className={dashboardMetricPanelClassName}>
      <MetricTile label="Atrasadas" value={data?.atrasadas} loading={loading} icon={<AlertOutlined />} tone="danger" />
      <MetricTile
        label="Pendentes"
        value={data?.pendentes}
        loading={loading}
        icon={<ClockCircleOutlined />}
        tone="warning"
      />
    </div>
  );
}
