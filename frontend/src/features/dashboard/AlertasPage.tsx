import { Alert } from "antd";
import { useAlertas } from "../../api/hooks";
import type { AlertaDto } from "../../api/types";
import { pageCardClassName, pageShellClassName } from "../../shared/ui/styles";
import { getErrorMessage } from "../../shared/utils/errors";
import { AlertasPanel } from "./components/AlertasPanel";

interface AlertasPageProps {
  onOpenObrigacao: (alerta: AlertaDto) => void;
}

export function AlertasPage({ onOpenObrigacao }: AlertasPageProps) {
  const { data, isLoading, isError, error } = useAlertas();

  return (
    <div className={pageShellClassName}>
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Não foi possível carregar os alertas da API"
          description={getErrorMessage(error)}
        />
      )}

      <section className={pageCardClassName}>
        <AlertasPanel data={data ?? []} loading={isLoading} onOpenObrigacao={onOpenObrigacao} />
      </section>
    </div>
  );
}
