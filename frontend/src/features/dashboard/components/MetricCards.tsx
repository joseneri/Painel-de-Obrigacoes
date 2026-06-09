import { Card, Statistic } from "antd";
import {
  ApartmentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { DashboardDto } from "../../../api/types";

interface MetricCardsProps {
  data?: DashboardDto;
  loading: boolean;
}

export function MetricCards({ data, loading }: MetricCardsProps) {
  return (
    <div className="metrics-grid">
      <Metric
        title="Empresas"
        value={data?.totalEmpresas}
        loading={loading}
        icon={<ApartmentOutlined />}
      />
      <Metric
        title="Obrigações do mês"
        value={data?.obrigacoesMes}
        loading={loading}
        icon={<FileDoneOutlined />}
      />
      <Metric
        title="Pendentes"
        caption="Total geral"
        value={data?.pendentes}
        loading={loading}
        icon={<ClockCircleOutlined />}
        tone="warning"
      />
      <Metric
        title="Entregues"
        caption="Total geral"
        value={data?.entregues}
        loading={loading}
        icon={<CheckCircleOutlined />}
        tone="success"
      />
      <Metric
        title="Atrasadas"
        caption="Total geral"
        value={data?.atrasadas}
        loading={loading}
        icon={<ExclamationCircleOutlined />}
        tone="danger"
      />
    </div>
  );
}

interface MetricProps {
  title: string;
  value?: number;
  caption?: string;
  loading: boolean;
  icon: ReactNode;
  tone?: "success" | "warning" | "danger";
}

function Metric({ title, value, caption, loading, icon, tone }: MetricProps) {
  return (
    <Card className="metric-card">
      <span className={`metric-icon ${tone ?? ""}`}>{icon}</span>
      <Statistic title={title} value={value ?? 0} loading={loading} />
      {caption && <span className="metric-caption">{caption}</span>}
    </Card>
  );
}
