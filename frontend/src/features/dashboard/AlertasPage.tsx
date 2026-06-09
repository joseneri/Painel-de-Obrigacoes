import { Alert } from "antd";
import { useAlertas } from "../../api/hooks";
import type { AlertaDto } from "../../api/types";
import { getErrorMessage } from "../../shared/utils/errors";
import { AlertasPanel } from "./components/AlertasPanel";

interface AlertasPageProps {
  onOpenObrigacao: (alerta: AlertaDto) => void;
}

export function AlertasPage({ onOpenObrigacao }: AlertasPageProps) {
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

      <section className="min-w-0 max-w-full overflow-hidden rounded-lg border border-[#dbe5ef] bg-white p-0">
        <AlertasPanel data={data ?? []} loading={isLoading} onOpenObrigacao={onOpenObrigacao} />
      </section>
    </div>
  );
}
