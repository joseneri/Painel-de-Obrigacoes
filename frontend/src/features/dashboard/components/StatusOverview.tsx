import { Empty, Progress, Space, Tag, Typography } from "antd";
import type { DashboardDto } from "../../../api/types";

interface StatusOverviewProps {
  data?: DashboardDto;
}

export function StatusOverview({ data }: StatusOverviewProps) {
  const items = [
    { label: "Entregues", value: data?.entregues ?? 0, color: "#2E7D32" },
    { label: "Pendentes", value: data?.pendentes ?? 0, color: "#F57F17" },
    { label: "Atrasadas", value: data?.atrasadas ?? 0, color: "#C62828" }
  ];
  const total = items.reduce((sum, item) => sum + item.value, 0);

  if (!data || total === 0) {
    return <Empty description="Sem obrigações pendentes, entregues ou atrasadas" />;
  }

  return (
    <>
      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Distribuição consolidada</Typography.Title>
          <Typography.Text type="secondary">
            Proporção dos status em todas as obrigações cadastradas.
          </Typography.Text>
        </div>
        <Tag color="blue">{total} obrigações</Tag>
      </div>

      <div className="status-list">
        {items.map((item) => (
          <div className="status-line" key={item.label}>
            <div className="status-line-header">
              <Space>
                <span>{item.label}</span>
                <Typography.Text type="secondary">{item.value}</Typography.Text>
              </Space>
              <Typography.Text strong>{Math.round((item.value / total) * 100)}%</Typography.Text>
            </div>
            <Progress percent={Math.round((item.value / total) * 100)} strokeColor={item.color} showInfo={false} />
          </div>
        ))}
      </div>
    </>
  );
}
