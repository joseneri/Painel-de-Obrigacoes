import { useMemo, useState } from "react";
import { App as AntApp, Alert, Button, DatePicker, Select, Space, Typography } from "antd";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useEmpresas, useObrigacoes, useRegistrarEntrega } from "../../api/hooks";
import type { ObrigacaoDto } from "../../api/types";
import { getErrorMessage } from "../../shared/utils/errors";
import { labelRegime, statusOptions } from "../../shared/utils/domain";
import { exportObrigacoesCsv } from "./components/exportCsv";
import { EntregaModal, type EntregaFormValues } from "./components/EntregaModal";
import { ObrigacoesTable } from "./components/ObrigacoesTable";

export interface CalendarioFilterState {
  ano: number;
  mes: number;
  empresaId?: string;
  status?: number;
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
      status: filters.status
    }),
    [filters.empresaId, filters.ano, filters.mes, filters.status]
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

      <section className="panel">
        <div className="toolbar">
          <div>
            <Typography.Title level={3}>Calendario por competencia</Typography.Title>
            <Typography.Text type="secondary">
              Obrigacoes geradas pela API conforme regime tributario e vencimento calculado.
            </Typography.Text>
          </div>

          <Space wrap>
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

        <div className="filter-grid">
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

          <DatePicker
            picker="month"
            allowClear={false}
            value={selectedMonth}
            format="MM/YYYY"
            onChange={(value) => value && onFiltersChange({ ano: value.year(), mes: value.month() + 1 })}
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
