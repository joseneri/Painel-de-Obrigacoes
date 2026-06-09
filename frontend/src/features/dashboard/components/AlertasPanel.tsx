import { useEffect, useMemo, useState } from "react";
import { Empty, Pagination, Skeleton, Space, Tag, Typography } from "antd";
import type { AlertaDto } from "../../../api/types";
import { labelStatus, labelTipo, statusColor } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";

type AlertFilter = "todos" | "atrasadas" | "vencendo";
type FilterTone = "red" | "orange" | "cyan";

const pageSize = 10;
const filterButtonClassName =
  "rounded-lg border px-3 py-2 text-xs font-extrabold leading-none transition hover:shadow-[0_0_0_2px_rgba(15,23,42,0.04)] max-[720px]:w-full";
const selectedFilterClassName = "border-current shadow-[0_0_0_2px_rgba(15,23,42,0.05)]";
const filterToneClassNames = {
  red: "border-transparent bg-[#fff1f0] text-[#cf1322]",
  orange: "border-transparent bg-[#fff7e6] text-[#d46b08]",
  cyan: "border-transparent bg-[#e6fffb] text-[#08979c]"
} satisfies Record<FilterTone, string>;
const urgencyClassNames = {
  ok: "bg-[#e8f5e9] text-[#2e7d32]",
  atencao: "bg-[#fff3e0] text-[#f57f17]",
  urgente: "bg-[#ffebee] text-[#c62828]"
};

interface AlertasPanelProps {
  data: AlertaDto[];
  loading: boolean;
}

export function AlertasPanel({ data, loading }: AlertasPanelProps) {
  const [filter, setFilter] = useState<AlertFilter>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const upcomingAlerts = useMemo(() => sortAlerts(data.filter(isUpcomingAlert)), [data]);
  const overdueAlerts = useMemo(() => sortAlerts(data.filter(isOverdueAlert)), [data]);
  const filteredAlerts = useMemo(
    () => getFilteredAlerts(filter, overdueAlerts, upcomingAlerts),
    [filter, overdueAlerts, upcomingAlerts]
  );
  const maxPage = Math.max(1, Math.ceil(filteredAlerts.length / pageSize));
  const safePage = Math.min(currentPage, maxPage);
  const pageStart = (safePage - 1) * pageSize;
  const pageAlerts = filteredAlerts.slice(pageStart, pageStart + pageSize);
  const pageOverdueAlerts = pageAlerts.filter(isOverdueAlert);
  const pageUpcomingAlerts = pageAlerts.filter(isUpcomingAlert);
  const hasAlerts = upcomingAlerts.length > 0 || overdueAlerts.length > 0;
  const hasFilteredAlerts = filteredAlerts.length > 0;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, maxPage));
  }, [maxPage]);

  return (
    <>
      <div className="relative flex items-start justify-between gap-5 border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7 before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-[''] max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:px-4">
        <div>
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
        <div
          className="flex flex-wrap justify-end gap-2 max-[720px]:grid max-[720px]:w-full max-[720px]:grid-cols-1"
          role="group"
          aria-label="Filtros de alertas"
        >
          {renderFilterTag("atrasadas", `${overdueAlerts.length} atrasadas`, "red", filter, setFilter, setCurrentPage)}
          {renderFilterTag("vencendo", `${upcomingAlerts.length} vencendo`, "orange", filter, setFilter, setCurrentPage)}
          {renderFilterTag("todos", `${data.length} itens`, "cyan", filter, setFilter, setCurrentPage)}
        </div>
      </div>

      <div className="p-6 max-[720px]:p-4">
        {loading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : !hasAlerts ? (
          <div className="grid min-h-[260px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
            <Empty description="Nenhum prazo crítico encontrado" />
          </div>
        ) : (
          <div className="grid gap-4">
            {!hasFilteredAlerts ? (
              <div className="grid min-h-[220px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
                <Empty description={emptyDescription(filter)} />
              </div>
            ) : (
              <>
                <div className="grid gap-5">
                  {renderAlertGroup("Atrasadas", pageOverdueAlerts)}
                  {renderAlertGroup("Vencendo nos próximos 30 dias", pageUpcomingAlerts)}
                </div>

                {filteredAlerts.length > pageSize && (
                  <div className="flex justify-end">
                    <Pagination
                      current={safePage}
                      pageSize={pageSize}
                      total={filteredAlerts.length}
                      showSizeChanger={false}
                      onChange={(page) => setCurrentPage(page)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function renderFilterTag(
  value: AlertFilter,
  label: string,
  color: FilterTone,
  selected: AlertFilter,
  onFilterChange: (value: AlertFilter) => void,
  onPageChange: (page: number) => void
) {
  return (
    <button
      type="button"
      className={classNames(filterButtonClassName, filterToneClassNames[color], selected === value && selectedFilterClassName)}
      aria-pressed={selected === value}
      onClick={() => {
        onFilterChange(value);
        onPageChange(1);
      }}
    >
      {label}
    </button>
  );
}

function getFilteredAlerts(filter: AlertFilter, overdueAlerts: AlertaDto[], upcomingAlerts: AlertaDto[]) {
  if (filter === "atrasadas") {
    return overdueAlerts;
  }

  if (filter === "vencendo") {
    return upcomingAlerts;
  }

  return [...overdueAlerts, ...upcomingAlerts];
}

function sortAlerts(alerts: AlertaDto[]) {
  return [...alerts].sort(
    (first, second) =>
      first.diasParaVencer - second.diasParaVencer || first.dataVencimento.localeCompare(second.dataVencimento)
  );
}

function isOverdueAlert(item: AlertaDto) {
  return item.diasParaVencer < 0;
}

function isUpcomingAlert(item: AlertaDto) {
  return item.diasParaVencer >= 0 && item.diasParaVencer <= 30;
}

function emptyDescription(filter: AlertFilter) {
  if (filter === "atrasadas") {
    return "Nenhuma obrigação atrasada encontrada";
  }

  if (filter === "vencendo") {
    return "Nenhuma obrigação vencendo nos próximos 30 dias";
  }

  return "Nenhum prazo crítico encontrado";
}

function renderAlertGroup(title: string, alerts: AlertaDto[]) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="grid gap-3 rounded-lg border border-[#e5edf6] bg-[#f8fafc] p-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#dbe5ef] pb-3">
        <Typography.Title className="!m-0 !text-[18px] !font-extrabold !text-[#0f172a]" level={4}>
          {title}
        </Typography.Title>
        <Tag className="rounded-full border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 font-bold text-[#1677ff]">
          {alerts.length}
        </Tag>
      </div>
      <div className="grid gap-3">
        {alerts.map((item) => (
          <div
            className="grid gap-3 rounded-lg border border-[#edf1f5] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
            key={item.obrigacaoId}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 max-[720px]:flex-col max-[720px]:items-start">
              <Space wrap>
                <Typography.Text className="!text-[#1677ff]" strong>
                  {labelTipo(item.tipo)}
                </Typography.Text>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe5ef] bg-[#f8fafc] px-2.5 py-1 text-[11px] font-bold text-[#475569]">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: statusColor(item.status) }}
                    aria-hidden="true"
                  />
                  {labelStatus(item.status)}
                </span>
              </Space>
              <span
                className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full px-2.5 py-[5px] text-xs font-extrabold ${urgencyTone(item.diasParaVencer)}`}
              >
                {urgencyText(item.diasParaVencer)}
              </span>
            </div>
            <Typography.Text className="!text-[#0f172a]">{item.empresaRazaoSocial}</Typography.Text>
            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#667085]">
              <span>{item.competencia}</span>
              <span>vence em {formatDate(item.dataVencimento)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function urgencyTone(days: number) {
  if (days < 0) {
    return urgencyClassNames.urgente;
  }

  if (days <= 7) {
    return urgencyClassNames.atencao;
  }

  return urgencyClassNames.ok;
}
