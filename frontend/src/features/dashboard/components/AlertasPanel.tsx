import { Badge, Empty, Skeleton, Space, Tag, Typography } from "antd";
import type { AlertaDto } from "../../../api/types";
import { labelStatus, labelTipo, statusColor } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";

interface AlertasPanelProps {
  data: AlertaDto[];
  loading: boolean;
}

export function AlertasPanel({ data, loading }: AlertasPanelProps) {
  const visibleAlerts = data.slice(0, 8);

  return (
    <>
      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Alertas</Typography.Title>
          <Typography.Text type="secondary">Atrasadas e vencendo nos proximos 30 dias.</Typography.Text>
        </div>
        <Tag color="cyan">{data.length} itens</Tag>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : visibleAlerts.length === 0 ? (
        <Empty description="Nenhum prazo critico encontrado" />
      ) : (
        <div className="alerts-list">
          {visibleAlerts.map((item) => (
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
      )}
    </>
  );
}
