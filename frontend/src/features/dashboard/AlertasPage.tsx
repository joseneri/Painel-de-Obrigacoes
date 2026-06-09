import { Alert } from "antd";
import { useAlertas } from "../../api/hooks";
import { getErrorMessage } from "../../shared/utils/errors";
import { AlertasPanel } from "./components/AlertasPanel";

export function AlertasPage() {
  const { data, isLoading, isError, error } = useAlertas();

  return (
    <div className="grid gap-5">
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os alertas da API"
          description={getErrorMessage(error)}
        />
      )}

      <section className="min-w-0 overflow-hidden rounded-lg border border-[#dbe5ef] bg-white">
        <AlertasPanel data={data ?? []} loading={isLoading} />
      </section>
    </div>
  );
}
