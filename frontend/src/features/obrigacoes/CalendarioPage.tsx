import { useMemo, useState } from "react";
import { App as AntApp, Alert, Button, Segmented, Select, Space, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import { useEmpresas, useObrigacoes, useRegistrarEntrega } from "../../api/hooks";
import type { ObrigacaoDto } from "../../api/types";
import { getErrorMessage } from "../../shared/utils/errors";
import { labelRegime, statusOptions } from "../../shared/utils/domain";
import "./calendario-competencia.css";
import { CompetenciaNavigator } from "./components/CompetenciaNavigator";
import { exportObrigacoesCsv } from "./components/exportCsv";
import { EntregaModal, type EntregaFormValues } from "./components/EntregaModal";
import { ObrigacoesTable } from "./components/ObrigacoesTable";

export interface CalendarioFilterState {
  ano: number;
  mes: number;
  empresaId?: string;
  status?: number;
  modo: "competencia" | "vencimento";
}

interface CalendarioPageProps {
  filters: CalendarioFilterState;
  onFiltersChange: (filters: Partial<CalendarioFilterState>) => void;
}

export function CalendarioPage({ filters, onFiltersChange }: CalendarioPageProps) {
  const { message } = AntApp.useApp();
  const [selectedObrigacao, setSelectedObrigacao] = useState<ObrigacaoDto | null>(null);

  const selectedMonth = useMemo(
    () => dayjs(`${filters.ano}-${String(filters.mes).padStart(2, "0")}-01`),
    [filters.ano, filters.mes]
  );

  const obrigacoesFilters = useMemo(
    () => ({
      empresaId: filters.empresaId,
      ano: filters.ano,
      mes: filters.mes,
      status: filters.status,
      modo: filters.modo
    }),
    [filters.empresaId, filters.ano, filters.mes, filters.status, filters.modo]
  );

  const {
    data: empresas = [],
    isLoading: isEmpresasLoading,
    isError: isEmpresasError,
    error: empresasError,
    isFetching: isEmpresasFetching
  } = useEmpresas();
  const {
    data: obrigacoes = [],
    isLoading: isObrigacoesLoading,
    isError: isObrigacoesError,
    error: obrigacoesError,
    isFetching: isObrigacoesFetching,
    refetch: refetchObrigacoes
  } = useObrigacoes(obrigacoesFilters);
  const registrarEntrega = useRegistrarEntrega();

  const error = isEmpresasError ? empresasError : isObrigacoesError ? obrigacoesError : null;

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

  function handleHojeClick() {
    const today = dayjs();
    onFiltersChange({ ano: today.year(), mes: today.month() + 1 });
  }

  function handleMonthChange(value: Dayjs | null) {
    if (value) {
      onFiltersChange({ ano: value.year(), mes: value.month() + 1 });
    }
  }

  function handleMonthOffset(months: number) {
    const nextMonth = selectedMonth.add(months, "month");
    onFiltersChange({ ano: nextMonth.year(), mes: nextMonth.month() + 1 });
  }

  function handleModeChange(modo: string | number) {
    if (modo === "competencia" || modo === "vencimento") {
      onFiltersChange({ modo });
    }
  }

  const modeLabel = filters.modo === "vencimento" ? "vencimento" : "competencia";
  const modeDescription =
    filters.modo === "vencimento"
      ? "Obrigacoes com prazo no mes selecionado, com status e conclusao."
      : "Obrigacoes da competencia selecionada, com prazos e status.";

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

      <section className="panel calendario-panel">
        <div className="calendario-panel__header">
          <div>
            <Typography.Title level={3}>Calendario por {modeLabel}</Typography.Title>
            <Typography.Text type="secondary">{modeDescription}</Typography.Text>
          </div>

          <Space wrap>
            <Segmented
              className="calendario-mode-toggle"
              value={filters.modo}
              onChange={handleModeChange}
              options={[
                { label: "Competencia", value: "competencia" },
                { label: "Vencimento", value: "vencimento" }
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => refetchObrigacoes()}>
              Atualizar
            </Button>
            <Button
              icon={<DownloadOutlined />}
              disabled={!obrigacoes.length}
              onClick={() => exportObrigacoesCsv(obrigacoes)}
            >
              CSV
            </Button>
          </Space>
        </div>

        <CompetenciaNavigator
          selectedMonth={selectedMonth}
          todayLabel={dayjs().format("DD/MM/YYYY")}
          onMonthChange={handleMonthChange}
          onMonthOffset={handleMonthOffset}
          onToday={handleHojeClick}
        />

        <div className="calendario-filter-row">
          <Select
            allowClear
            showSearch
            placeholder="Empresa"
            value={filters.empresaId}
            loading={isEmpresasLoading || isEmpresasFetching}
            onChange={(empresaId) => onFiltersChange({ empresaId })}
            optionFilterProp="label"
            options={empresas.map((empresa) => ({
              value: empresa.id,
              label: `${empresa.razaoSocial} - ${labelRegime(empresa.regimeTributario)}`
            }))}
          />

          <Select
            allowClear
            placeholder="Status"
            value={filters.status}
            onChange={(status) => onFiltersChange({ status })}
            options={statusOptions}
          />
        </div>
      </section>

      <ObrigacoesTable
        data={obrigacoes}
        loading={isObrigacoesLoading || isObrigacoesFetching}
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
