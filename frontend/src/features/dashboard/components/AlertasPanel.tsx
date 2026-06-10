import { useEffect, useMemo, useState } from "react";
import { Empty, Skeleton } from "antd";
import type { AlertaDto, EnumValue } from "../../../api/types";
import { PageHeader } from "../../../shared/ui/PageHeader";
import { labelTipo } from "../../../shared/utils/domain";
import { AlertasFilters } from "./AlertasFilters";
import { AlertasList } from "./AlertasList";
import { AlertasSummary } from "./AlertasSummary";
import {
  alertasPageSize,
  emptyAlertasDescription,
  getFilteredAlerts,
  isOverdueAlert,
  isUpcomingAlert,
  sortAlerts,
  type AlertFilter
} from "./alertasPresentation";

interface AlertasPanelProps {
  data: AlertaDto[];
  loading: boolean;
  onOpenObrigacao: (alerta: AlertaDto) => void;
}

export function AlertasPanel({ data, loading, onOpenObrigacao }: AlertasPanelProps) {
  const [filter, setFilter] = useState<AlertFilter>("todos");
  const [empresaId, setEmpresaId] = useState<string>();
  const [tipoKey, setTipoKey] = useState<string>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(alertasPageSize);
  const empresaOptions = useMemo(
    () => uniqueOptions(data, (item) => item.empresaId, (item) => item.empresaRazaoSocial),
    [data]
  );
  const tipoOptions = useMemo(
    () => uniqueOptions(data, (item) => enumKey(item.tipo), (item) => labelTipo(item.tipo)),
    [data]
  );
  const scopedAlerts = useMemo(
    () => data.filter((item) => (!empresaId || item.empresaId === empresaId) && (!tipoKey || enumKey(item.tipo) === tipoKey)),
    [data, empresaId, tipoKey]
  );
  const upcomingAlerts = useMemo(() => sortAlerts(scopedAlerts.filter(isUpcomingAlert)), [scopedAlerts]);
  const overdueAlerts = useMemo(() => sortAlerts(scopedAlerts.filter(isOverdueAlert)), [scopedAlerts]);
  const filteredAlerts = useMemo(
    () => getFilteredAlerts(filter, overdueAlerts, upcomingAlerts),
    [filter, overdueAlerts, upcomingAlerts]
  );
  const maxPage = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const hasAlerts = overdueAlerts.length > 0 || upcomingAlerts.length > 0;
  const hasFilteredAlerts = filteredAlerts.length > 0;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, maxPage));
  }, [maxPage]);

  function handleFilterChange(nextFilter: AlertFilter) {
    setFilter(nextFilter);
    setCurrentPage(1);
  }

  function handlePageChange(nextPage: number, nextPageSize: number) {
    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
      setCurrentPage(1);
      return;
    }

    setCurrentPage(nextPage);
  }

  return (
    <>
      <PageHeader title="Painel de Alertas" subtitle="Atrasadas e vencendo nos próximos 30 dias." />

      <AlertasSummary
        total={overdueAlerts.length + upcomingAlerts.length}
        overdue={overdueAlerts.length}
        upcoming={upcomingAlerts.length}
        loading={loading}
        selectedFilter={filter}
        onFilterChange={handleFilterChange}
      />

      <div className="grid gap-4 p-6 max-[720px]:p-4">
        <AlertasFilters
          empresaId={empresaId}
          tipoKey={tipoKey}
          empresaOptions={empresaOptions}
          tipoOptions={tipoOptions}
          onEmpresaChange={(value) => {
            setEmpresaId(value);
            setCurrentPage(1);
          }}
          onTipoChange={(value) => {
            setTipoKey(value);
            setCurrentPage(1);
          }}
        />

        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !hasAlerts ? (
          <div className="grid min-h-[260px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
            <Empty description="Nenhum prazo crítico encontrado" />
          </div>
        ) : !hasFilteredAlerts ? (
          <div className="grid min-h-[220px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
            <Empty description={emptyAlertasDescription(filter)} />
          </div>
        ) : (
          <AlertasList
            alerts={filteredAlerts}
            currentPage={safePage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onOpenObrigacao={onOpenObrigacao}
          />
        )}
      </div>
    </>
  );
}

function enumKey(value: EnumValue) {
  return String(value);
}

function uniqueOptions<T>(
  items: T[],
  getValue: (item: T) => string,
  getLabel: (item: T) => string
) {
  const options = new Map<string, string>();

  for (const item of items) {
    options.set(getValue(item), getLabel(item));
  }

  return [...options.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((first, second) => first.label.localeCompare(second.label, "pt-BR"));
}
