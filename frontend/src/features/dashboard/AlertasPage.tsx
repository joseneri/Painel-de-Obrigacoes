import { Alert, Skeleton } from "antd";
import { useAlertas } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { AlertasPanel } from "./components/AlertasPanel";

export function AlertasPage() {
  const { data, isLoading, isError, error } = useAlertas();

  return (
    <div className="page-stack">
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Nao foi possivel carregar os alertas da API"
          description={getErrorMessage(error)}
        />
      )}

      <section className="panel">
        {isLoading ? <Skeleton active paragraph={{ rows: 6 }} /> : <AlertasPanel data={data ?? []} loading={false} />}
      </section>
    </div>
  );
}
