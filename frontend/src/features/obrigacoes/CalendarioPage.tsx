import { useMemo, useState } from "react";
import { App as AntApp, Alert, Segmented, Typography } from "antd";
import { CalendarOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEmpresas, useObrigacoes, useRegistrarEntrega } from "../../api/hooks";
import type { ObrigacaoDto } from "../../api/types";
import { getErrorMessage } from "../../shared/utils/errors";
import { labelRegime, statusOptions } from "../../shared/utils/domain";
import { CalendarioControls } from "./components/CalendarioControls";
import { CalendarioSummary } from "./components/CalendarioSummary";
import { calcCalendarioSummary, modeDescription, type CalendarioModo } from "./components/calendarioPresentation";
import { exportObrigacoesCsv } from "./components/exportCsv";
import { EntregaModal, type EntregaFormValues } from "./components/EntregaModal";
import { ObrigacoesTable } from "./components/ObrigacoesTable";

export interface CalendarioFilterState {
  ano: number;
  mes: number;
  empresaId?: string;
  status?: number;
  modo: CalendarioModo;
}

interface CalendarioPageProps {
  filters: CalendarioFilterState;
  onFiltersChange: (filters: Partial<CalendarioFilterState>) => void;
}

export function CalendarioPage({ filters, onFiltersChange }: CalendarioPageProps) {
  const { message } = AntApp.useApp();
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoDto | null>(null);
  const today = useMemo(() => dayjs(), []);

  const selectedMonth = useMemo(
    () => dayjs(`${filters.ano}-${String(filters.mes).padStart(2, "0")}-01`),
    [filters.ano, filters.mes]
  );
  const obrigacoesFilters = useMemo(
    () => ({ ...filters }),
    [filters.empresaId, filters.ano, filters.mes, filters.status, filters.modo]
  );

  const empresasQuery = useEmpresas();
  const obrigacoesQuery = useObrigacoes(obrigacoesFilters);
  const registrarEntrega = useRegistrarEntrega();
  const empresas = empresasQuery.data ?? [];
  const obrigacoes = obrigacoesQuery.data ?? [];
  const error = empresasQuery.isError ? empresasQuery.error : obrigacoesQuery.isError ? obrigacoesQuery.error : null;
  const summary = useMemo(() => calcCalendarioSummary(obrigacoes), [obrigacoes]);
  const empresaOptions = useMemo(
    () =>
      empresas.map((empresa) => ({
        value: empresa.id,
        label: `${empresa.razaoSocial} - ${labelRegime(empresa.regimeTributario)}`
      })),
    [empresas]
  );

  function handleRegistrarEntrega(values: EntregaFormValues) {
    if (!selectedObrigacao) {
      return;
    }

    registrarEntrega.mutate(
      {
        obrigacaoId: selectedObrigacao.id,
        dataConclusao: values.dataConclusao.startOf("day").toISOString(),
        observacao: values.observacao?.trim() || null
      },
      {
        onSuccess: () => {
          message.success("Entrega registrada.");
          setSelectedObrigacao(null);
        },
        onError: (error) => message.error(getErrorMessage(error))
      }
    );
  }

  function handleMonthChange(value: dayjs.Dayjs | null) {
    if (value) {
      onFiltersChange({ ano: value.year(), mes: value.month() + 1 });
    }
  }

  function handleResetFilters() {
    onFiltersChange({ empresaId: undefined, status: undefined });
  }

  return (
    <div className="page-stack">
      {error && (
        <Alert
          type="error"
          showIcon
          title="Nao foi possivel carregar o calendario"
          description={getErrorMessage(error)}
        />
      )}

      <section className="min-w-0 overflow-hidden rounded-lg border border-[#dbe5ef] bg-white p-0">
        <div className="relative flex items-start justify-between gap-5 border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-[''] max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:px-4">
          <div>
            <Typography.Title
              className="!mb-2 !mt-0 !text-[30px] !font-extrabold !leading-[1.12] !tracking-normal !text-[#0f172a] max-[720px]:!text-[25px]"
              level={2}
            >
              Calendario de Obrigacoes
            </Typography.Title>
            <Typography.Text className="!text-[15px] !text-[#526173]" type="secondary">
              {modeDescription(filters.modo)}
            </Typography.Text>
          </div>

          <Segmented
            className="border border-[#edf1f5] !bg-[#f3f6fa] p-1 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            value={filters.modo}
            onChange={(value) => onFiltersChange({ modo: value as CalendarioModo })}
            options={[
              {
                label: (
                  <span className="inline-flex items-center gap-2">
                    <CalendarOutlined />
                    Competencia
                  </span>
                ),
                value: "competencia"
              },
              {
                label: (
                  <span className="inline-flex items-center gap-2">
                    <ClockCircleOutlined />
                    Vencimento
                  </span>
                ),
                value: "vencimento"
              }
            ]}
          />
        </div>

        <CalendarioControls
          selectedMonth={selectedMonth}
          empresaId={filters.empresaId}
          status={filters.status}
          empresaOptions={empresaOptions}
          statusOptions={statusOptions}
          empresasLoading={empresasQuery.isLoading || empresasQuery.isFetching}
          canExport={Boolean(obrigacoes.length)}
          today={today}
          onMonthChange={handleMonthChange}
          onReset={handleResetFilters}
          onEmpresaChange={(empresaId) => onFiltersChange({ empresaId })}
          onStatusChange={(status) => onFiltersChange({ status })}
          onExportCsv={() => exportObrigacoesCsv(obrigacoes)}
        />

        <CalendarioSummary summary={summary} />
      </section>

      <ObrigacoesTable
        data={obrigacoes}
        loading={obrigacoesQuery.isLoading || obrigacoesQuery.isFetching}
        onRegistrarEntrega={setSelectedObrigacao}
      />

      <EntregaModal
        open={Boolean(selectedObrigacao)}
        obrigacao={selectedObrigacao}
        confirmLoading={registrarEntrega.isPending}
        onCancel={() => setSelectedObrigacao(null)}
        onSubmit={handleRegistrarEntrega}
      />
    </div>
  );
}
