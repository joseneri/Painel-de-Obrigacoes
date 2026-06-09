import { useEffect, useMemo, useState } from "react";
import { Badge, Empty, Pagination, Skeleton, Space, Tag, Typography } from "antd";
import type { AlertaDto } from "../../../api/types";
import { labelStatus, labelTipo, statusColor } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";
import "./alertas-panel.css";

type AlertFilter = "todos" | "atrasadas" | "vencendo";

const pageSize = 10;

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
      <div className="panel-header">
        <div>
          <Typography.Title level={3}>Alertas</Typography.Title>
          <Typography.Text type="secondary">Atrasadas e vencendo nos proximos 30 dias.</Typography.Text>
        </div>
        <div className="alerts-summary" role="group" aria-label="Filtros de alertas">
          {renderFilterTag("atrasadas", `${overdueAlerts.length} atrasadas`, "red", filter, setFilter, setCurrentPage)}
          {renderFilterTag("vencendo", `${upcomingAlerts.length} vencendo`, "orange", filter, setFilter, setCurrentPage)}
          {renderFilterTag("todos", `${data.length} itens`, "cyan", filter, setFilter, setCurrentPage)}
        </div>
      </div>

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : !hasAlerts ? (
        <Empty description="Nenhum prazo critico encontrado" />
      ) : (
        <div className="alerts-content">
          {!hasFilteredAlerts ? (
            <Empty description={emptyDescription(filter)} />
          ) : (
            <>
              <div className="alerts-groups">
                {renderAlertGroup("Atrasadas", pageOverdueAlerts)}
                {renderAlertGroup("Vencendo nos proximos 30 dias", pageUpcomingAlerts)}
              </div>

              {filteredAlerts.length > pageSize && (
                <div className="alerts-pagination">
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
    </>
  );
}

function renderFilterTag(
  value: AlertFilter,
  label: string,
  color: "red" | "orange" | "cyan",
  selected: AlertFilter,
  onFilterChange: (value: AlertFilter) => void,
  onPageChange: (page: number) => void
) {
  return (
    <button
      type="button"
      className={`alert-filter-tag alert-filter-tag-${color}`}
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
      first.diasParaVencer - second.diasParaVencer ||
      first.dataVencimento.localeCompare(second.dataVencimento)
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
    return "Nenhuma obrigacao atrasada encontrada";
  }

  if (filter === "vencendo") {
    return "Nenhuma obrigacao vencendo nos proximos 30 dias";
  }

  return "Nenhum prazo critico encontrado";
}

function renderAlertGroup(title: string, alerts: AlertaDto[]) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <section className="alerts-group">
      <div className="alerts-group-header">
        <Typography.Title level={4}>{title}</Typography.Title>
        <Tag>{alerts.length}</Tag>
      </div>
      <div className="alerts-list">
        {alerts.map((item) => (
          <div className="alert-item" key={item.obrigacaoId}>
            <Space wrap>
              <Typography.Text strong>{labelTipo(item.tipo)}</Typography.Text>
              <Badge color={statusColor(item.status)} text={labelStatus(item.status)} />
            </Space>
            <Typography.Text>{item.empresaRazaoSocial}</Typography.Text>
            <div className="alert-meta">
              <Typography.Text type="secondary">{item.competencia}</Typography.Text>
              <Typography.Text type="secondary">vence em {formatDate(item.dataVencimento)}</Typography.Text>
              <Tag color={item.diasParaVencer < 0 ? "red" : item.diasParaVencer <= 7 ? "orange" : "blue"}>
                {urgencyText(item.diasParaVencer)}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
