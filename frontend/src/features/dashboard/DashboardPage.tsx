import { Alert, Skeleton, Typography } from "antd";
import { useDashboard } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { MetricCards } from "./components/MetricCards";
import { StatusOverview } from "./components/StatusOverview";

const dashboardPanelClassName =
  "flex h-full min-w-0 flex-col rounded-lg border border-[#f1f5f9] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:p-4";

const currentMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date());

export function DashboardPage() {
  const {
    data: dashboardData,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError
  } = useDashboard();

  return (
    <div className="grid gap-5">
      {isDashboardError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os dados da API"
          description={getErrorMessage(dashboardError)}
        />
      )}

      <section className="min-w-0 overflow-hidden rounded-lg border border-[#dbe5ef] bg-white">
        <div className="relative flex items-start justify-between gap-5 border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-[''] max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:px-4">
          <div>
            <Typography.Title
              className="!mb-2 !mt-0 !text-[30px] !font-extrabold !leading-[1.12] !tracking-normal !text-[#0f172a] max-[720px]:!text-[25px]"
              level={2}
            >
              Dashboard
            </Typography.Title>
            <Typography.Text className="!text-[15px] !text-[#526173]" type="secondary">
              Obrigações do mês de {currentMonthName} e saldo operacional consolidado.
            </Typography.Text>
          </div>
        </div>

        <MetricCards data={dashboardData} loading={isDashboardLoading} />
      </section>

      <section className={dashboardPanelClassName}>
        {isDashboardLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <StatusOverview data={dashboardData} />}
      </section>
    </div>
  );
}
