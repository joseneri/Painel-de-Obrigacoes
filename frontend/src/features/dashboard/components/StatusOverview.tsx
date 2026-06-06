import { Empty, Progress, Space, Tag, Typography } from "antd";
import type { DashboardDto } from "../../../api/types";

interface StatusOverviewProps {
  data?: DashboardDto;
}

export function StatusOverview({ data }: StatusOverviewProps) {
  if (!data || data.obrigacoesMes === 0) {
    return <Empty description="Sem obrigações para o mês atual" />;
  }

  const total = data.obrigacoesMes || 1;
  const items = [
    { label: "Entregues", value: data.entregues, color: "#2E7D32" },
    { label: "Pendentes", value: data.pendentes, color: "#F57F17" },
    { label: "Atrasadas", value: data.atrasadas, color: "#C62828" }
  ];

  return (
    <>
      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Distribuição do mês</Typography.Title>
          <Typography.Text type="secondary">
            Proporção dos status na competência corrente.
          </Typography.Text>
        </div>
        <Tag color="blue">{data.obrigacoesMes} obrigações</Tag>
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
