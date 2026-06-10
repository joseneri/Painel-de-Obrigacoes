import { AlertOutlined, ClockCircleOutlined, FileDoneOutlined } from "@ant-design/icons";
import type { DashboardDto } from "../../../api/types";
import { MetricTile } from "../../../shared/ui/MetricTile";
import { metricPanelClassName } from "../../../shared/ui/styles";

interface MetricCardsProps {
  data?: DashboardDto;
  loading: boolean;
}

export function MetricCards({ data, loading }: MetricCardsProps) {
  const totalObrigacoes = data ? data.pendentes + data.entregues + data.atrasadas : undefined;

  return (
    <div className={metricPanelClassName}>
      <MetricTile label="Total" value={totalObrigacoes} loading={loading} icon={<FileDoneOutlined />} />
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
