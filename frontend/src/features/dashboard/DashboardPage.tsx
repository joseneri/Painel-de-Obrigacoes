import { Alert, Button, Skeleton, Typography } from "antd";
import { AlertOutlined, CalendarOutlined } from "@ant-design/icons";
import { useDashboard } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { MetricCards } from "./components/MetricCards";
import { StatusOverview } from "./components/StatusOverview";
import "./dashboard.css";

interface DashboardPageProps {
  onOpenCalendario: () => void;
  onOpenAlertas: () => void;
}

export function DashboardPage({ onOpenCalendario, onOpenAlertas }: DashboardPageProps) {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError
  } = useDashboard();

  return (
    <div className="page-stack">
      {isDashboardError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os dados da API"
          description={getErrorMessage(dashboardError)}
        />
      )}

      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Visão consolidada</Typography.Title>
          <Typography.Text type="secondary">
            Obrigações do mês e saldo operacional consolidado.
          </Typography.Text>
        </div>

        <Button type="primary" icon={<CalendarOutlined />} onClick={onOpenCalendario}>
          Abrir calendário
        </Button>
      </div>

      <MetricCards data={dashboardData} loading={isDashboardLoading} />

      <div className="dashboard-grid">
        <section className="panel">
          {isDashboardLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : <StatusOverview data={dashboardData} />}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <Typography.Title level={3}>Prazos críticos</Typography.Title>
              <Typography.Text type="secondary">
                A lista operacional fica concentrada no Painel de Alertas.
              </Typography.Text>
            </div>
          </div>

          <div className="dashboard-actions">
            <div className="dashboard-action-copy">
              <Typography.Text strong>{dashboardData?.atrasadas ?? 0} obrigação(ões) atrasada(s)</Typography.Text>
              <Typography.Text type="secondary">
                Consulte atrasadas consolidadas e vencimentos dos próximos 30 dias na tela dedicada.
              </Typography.Text>
            </div>

            <Button type="default" icon={<AlertOutlined />} onClick={onOpenAlertas}>
              Abrir painel de alertas
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
