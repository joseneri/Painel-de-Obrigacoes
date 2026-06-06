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
  const dashboard = useDashboard();
  const alertas = useAlertas();

  const error = dashboard.error ?? alertas.error;

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

      <MetricCards data={dashboard.data} loading={dashboard.isLoading} />

      <div className="dashboard-grid">
        <section className="panel">
          {dashboard.isLoading ? <Skeleton active paragraph={{ rows: 5 }} /> : <StatusOverview data={dashboard.data} />}
        </section>

        <section className="panel">
          <AlertasPanel data={alertas.data ?? []} loading={alertas.isLoading} />
        </section>
      </div>
    </div>
  );
}
