import { Alert, Button, Skeleton, Typography } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import { useAlertas, useDashboard } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { AlertasPanel } from "./components/AlertasPanel";
import { MetricCards } from "./components/MetricCards";
import { StatusOverview } from "./components/StatusOverview";

interface DashboardPageProps {
  onOpenCalendario: () => void;
}

export function DashboardPage({ onOpenCalendario }: DashboardPageProps) {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError
  } = useDashboard();
  const {
    data: alertasData,
    isLoading: isAlertasLoading,
    isError: isAlertasError,
    error: alertasError
  } = useAlertas();

  const error = isDashboardError ? dashboardError : isAlertasError ? alertasError : null;

  return (
    <div className="page-stack">
      {error && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os dados da API"
          description={getErrorMessage(error)}
        />
      )}

      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Visão consolidada</Typography.Title>
          <Typography.Text type="secondary">
            Indicadores do mês corrente, prazos críticos e saldo operacional.
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
          <AlertasPanel data={alertasData ?? []} loading={isAlertasLoading} />
        </section>
      </div>
    </div>
  );
}
