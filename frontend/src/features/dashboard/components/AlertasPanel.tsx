import { useEffect, useMemo, useState } from "react";
import { Empty, Skeleton, Typography } from "antd";
import type { AlertaDto } from "../../../api/types";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => new Set());
  const visibleAlerts = useMemo(
    () => data.filter((item) => !dismissedIds.has(item.obrigacaoId)),
    [data, dismissedIds]
  );
  const upcomingAlerts = useMemo(() => sortAlerts(visibleAlerts.filter(isUpcomingAlert)), [visibleAlerts]);
  const overdueAlerts = useMemo(() => sortAlerts(visibleAlerts.filter(isOverdueAlert)), [visibleAlerts]);
  const filteredAlerts = useMemo(
    () => getFilteredAlerts(filter, overdueAlerts, upcomingAlerts),
    [filter, overdueAlerts, upcomingAlerts]
  );
  const maxPage = Math.max(1, Math.ceil(filteredAlerts.length / alertasPageSize));
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

  function handleDismissAlert(obrigacaoId: string) {
    setDismissedIds((current) => {
      const next = new Set(current);
      next.add(obrigacaoId);
      return next;
    });
  }

  return (
    <>
      <div className="relative border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-[''] max-[720px]:px-4">
        <Typography.Title
          className="!mb-2 !mt-0 !text-[30px] !font-extrabold !leading-[1.12] !tracking-normal !text-[#0f172a] max-[720px]:!text-[25px]"
          level={2}
        >
          Painel de Alertas
        </Typography.Title>
        <Typography.Text className="!text-[15px] !text-[#526173]" type="secondary">
          Atrasadas e vencendo nos próximos 30 dias.
        </Typography.Text>
      </div>

      <AlertasSummary
        total={overdueAlerts.length + upcomingAlerts.length}
        overdue={overdueAlerts.length}
        upcoming={upcomingAlerts.length}
        loading={loading}
        selectedFilter={filter}
        onFilterChange={handleFilterChange}
      />

      <div className="p-6 max-[720px]:p-4">
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
            onPageChange={setCurrentPage}
            onOpenObrigacao={onOpenObrigacao}
            onDismissAlert={handleDismissAlert}
          />
        )}
      </div>
    </>
  );
}
