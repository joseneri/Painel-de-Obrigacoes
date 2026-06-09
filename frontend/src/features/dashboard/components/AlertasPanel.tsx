import { Badge, Empty, Skeleton, Space, Tag, Typography } from "antd";
import type { AlertaDto } from "../../../api/types";
import { labelStatus, labelTipo, statusColor } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";
import "./alertas-panel.css";

interface AlertasPanelProps {
  data: AlertaDto[];
  loading: boolean;
}

export function AlertasPanel({ data, loading }: AlertasPanelProps) {
  const upcomingAlerts = data.filter((item) => item.diasParaVencer >= 0 && item.diasParaVencer <= 30);
  const overdueAlerts = data.filter((item) => item.diasParaVencer < 0);
  const hasAlerts = upcomingAlerts.length > 0 || overdueAlerts.length > 0;

  return (
    <>
      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Alertas</Typography.Title>
          <Typography.Text type="secondary">Atrasadas e vencendo nos proximos 30 dias.</Typography.Text>
        </div>
        <div className="alerts-summary">
          <Tag color="blue">{upcomingAlerts.length} vencendo</Tag>
          <Tag color="red">{overdueAlerts.length} atrasadas</Tag>
          <Tag color="cyan">{data.length} itens</Tag>
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !hasAlerts ? (
        <Empty description="Nenhum prazo critico encontrado" />
      ) : (
        <div className="alerts-groups">
          {renderAlertGroup("Vencendo nos proximos 30 dias", upcomingAlerts)}
          {renderAlertGroup("Atrasadas", overdueAlerts)}
        </div>
      )}
    </>
  );
}

function renderAlertGroup(title: string, alerts: AlertaDto[]) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="alerts-group">
      <div className="alerts-group-header">
        <Typography.Title level={4}>{title}</Typography.Title>
        <Tag>{alerts.length}</Tag>
      </div>
      <div className="alerts-list">
        {alerts.map((item) => (
          <div className="alert-item" key={item.obrigacaoId}>
            <Space wrap>
              <Typography.Text strong>{labelTipo(item.tipo)}</Typography.Text>
              <Badge color={statusColor(item.status)} text={labelStatus(item.status)} />
            </Space>
            <Typography.Text>{item.empresaRazaoSocial}</Typography.Text>
            <div className="alert-meta">
              <Typography.Text type="secondary">{item.competencia}</Typography.Text>
              <Typography.Text type="secondary">vence em {formatDate(item.dataVencimento)}</Typography.Text>
              <Tag color={item.diasParaVencer < 0 ? "red" : item.diasParaVencer <= 7 ? "orange" : "blue"}>
                {urgencyText(item.diasParaVencer)}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
