import { Alert, Skeleton } from "antd";
import { useDashboard } from "../../api/hooks";
import { PageHeader } from "../../shared/ui/PageHeader";
import { pageCardClassName, pageShellClassName, panelClassName } from "../../shared/ui/styles";
import { getErrorMessage } from "../../shared/utils/errors";
import { MetricCards } from "./components/MetricCards";
import { StatusOverview } from "./components/StatusOverview";

const currentMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date());

export function DashboardPage() {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError
  } = useDashboard();

  return (
    <div className={pageShellClassName}>
      {isDashboardError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os dados da API"
          description={getErrorMessage(dashboardError)}
        />
      )}

      <section className={pageCardClassName}>
        <PageHeader
          title="Dashboard"
          subtitle={`Obrigações do mês de ${currentMonthName} e saldo operacional consolidado.`}
        />
        <MetricCards data={dashboardData} loading={isDashboardLoading} />
      </section>

      <section className={panelClassName}>
        {isDashboardLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <StatusOverview data={dashboardData} />}
      </section>
    </div>
  );
}
