import { useMemo, useState } from "react";
import { Button, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import { labelStatus, labelTipo, normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";
import { formatCompetencia, formatDate } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";
import { pageSizeChangerProps, pageSizeOptions, tablePaginationSizeClassName } from "../../../shared/utils/pagination";
import { statusClassName, urgencyLevel, urgencyPresentation } from "./calendarioPresentation";

interface ObrigacoesTableProps {
  data: ObrigacaoDto[];
  loading: boolean;
  showCompetencia?: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

const defaultPageSize = 10;
const tablePanelClassName = classNames(
  "min-w-0 overflow-hidden rounded-lg border border-[#e5edf5] bg-white pb-1 pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)]",
  "[&_.ant-table-thead>tr>th]:!bg-[#f8fafc] [&_.ant-table-thead>tr>th]:text-[11px]",
  "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase",
  "[&_.ant-table-thead>tr>th]:tracking-normal [&_.ant-table-thead>tr>th]:text-[#334155]",
  "[&_.ant-table-thead>tr>th:first-child]:!pl-8 [&_.ant-table-thead>tr>th:last-child]:!pr-8 [&_.ant-table-tbody>tr>td:last-child]:!pr-8",
  "[&_.ant-table-tbody>tr>td]:!py-2 [&_.ant-table-tbody>tr>td]:align-top [&_.ant-table-tbody>tr>td]:text-[14px]",
  "[&_.ant-table-tbody>tr.obrigacoes-row-odd>td]:bg-[#fbfdff] [&_.ant-table-tbody>tr:hover>td:not(.obrigacoes-group-cell)]:!bg-[#f8fafc]",
  "[&_.ant-table-tbody>tr:hover>td.obrigacoes-group-cell]:!bg-[#f8fbff] [&_.ant-table-tbody>tr>td.obrigacoes-group-cell.ant-table-cell-row-hover]:!bg-[#f8fbff]",
  "[&_.ant-table-tbody>tr:hover>td.obrigacoes-obligation-cell]:!bg-[#f8fbff] [&_.ant-table-tbody>tr>td.obrigacoes-obligation-cell.ant-table-cell-row-hover]:!bg-[#f8fbff]",
  "[&_.ant-table-pagination.ant-pagination]:!mb-0 [&_.ant-table-pagination.ant-pagination]:!mt-2 [&_.ant-table-pagination.ant-pagination]:mx-0",
  "[&_.ant-table-pagination.ant-pagination]:flex [&_.ant-table-pagination.ant-pagination]:w-full [&_.ant-table-pagination.ant-pagination]:justify-center",
  "[&_.ant-table-pagination.ant-pagination]:px-6 max-[720px]:[&_.ant-table-pagination.ant-pagination]:px-3",
  "[&_.ant-table-pagination.ant-pagination]:gap-2 [&_.ant-pagination-total-text]:me-2",
  "[&_.ant-pagination-total-text]:h-[38px] [&_.ant-pagination-total-text]:text-[13px]",
  "[&_.ant-pagination-total-text]:font-semibold [&_.ant-pagination-total-text]:leading-[38px]",
  "[&_.ant-pagination-total-text]:text-[#475569] [&_.ant-pagination-item]:h-[38px]",
  "[&_.ant-pagination-item]:min-w-[38px] [&_.ant-pagination-item]:rounded-[10px]",
  "[&_.ant-pagination-item]:leading-9 [&_.ant-pagination-prev]:h-[38px]",
  "[&_.ant-pagination-prev]:min-w-[38px] [&_.ant-pagination-prev]:rounded-[10px]",
  "[&_.ant-pagination-prev]:leading-9 [&_.ant-pagination-next]:h-[38px]",
  "[&_.ant-pagination-next]:min-w-[38px] [&_.ant-pagination-next]:rounded-[10px]",
  "[&_.ant-pagination-next]:leading-9 [&_.ant-pagination-prev_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-next_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-item-active]:!border-[#1677ff] [&_.ant-pagination-item-active]:!bg-[#1677ff]",
  "[&_.ant-pagination-item-active_a]:font-extrabold [&_.ant-pagination-item-active_a]:!text-white",
  tablePaginationSizeClassName
);
const dueDateClassNames = {
  ok: "text-[#047857]",
  atencao: "text-[#b45309]",
  urgente: "text-[#b91c1c]"
};
const urgencyClassNames = {
  ok: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
  atencao: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  urgente: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
  concluida: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  neutra: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
};
const statusBadgeClassNames: Record<string, string> = {
  pendente: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  entregue: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  atrasada: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
  "nao-aplicavel": "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
};
const badgeClassName = "inline-flex h-7 items-center whitespace-nowrap rounded-md border px-2.5 text-xs font-semibold";
const urgencyBadgeClassName = `${badgeClassName} w-[144px] justify-center`;
const groupedCellClassName = "obrigacoes-group-cell !align-middle";
const dueDateCellClassName = `${groupedCellClassName} !bg-[#f8fbff]`;
const obligationCellClassName = `${groupedCellClassName} obrigacoes-obligation-cell !border-r !border-[#e5edf5] !bg-[#f8fbff] !pl-8`;
const deliveredButtonClassName =
  "[&.ant-btn[disabled]]:!border-[#a7f3d0] [&.ant-btn[disabled]]:!bg-[#ecfdf5] [&.ant-btn[disabled]]:!text-[#047857]";

export function ObrigacoesTable({
  data,
  loading,
  showCompetencia = false,
  onRegistrarEntrega
}: ObrigacoesTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, lastPage);
  const visibleRows = useMemo(
    () => data.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, data, pageSize]
  );
  const obligationSpans = useMemo(() => buildRowSpans(visibleRows, (row) => String(row.tipo)), [visibleRows]);
  const dueDateSpans = useMemo(() => buildRowSpans(visibleRows, (row) => row.dataVencimento), [visibleRows]);
  const competenciaColumn: ColumnsType<ObrigacaoDto>[number] = {
    title: "Competência",
    dataIndex: "competencia",
    width: 128,
    render: (value, row) => (
      <span className="inline-flex items-center whitespace-nowrap text-[13px] font-semibold text-[#1d4ed8]">
        {formatCompetencia(value, row.ano, row.mes)}
      </span>
    )
  };

  const columns: ColumnsType<ObrigacaoDto> = [
    {
      title: "Obrigação",
      dataIndex: "tipo",
      width: 160,
      onCell: (_, index) => ({ rowSpan: spanAt(obligationSpans, index), className: obligationCellClassName }),
      render: (tipo) => (
        <Typography.Text className="!font-semibold !text-[#1d4ed8]">
          {labelTipo(tipo)}
        </Typography.Text>
      )
    },
    {
      title: "Empresa",
      dataIndex: "empresaRazaoSocial",
      width: 240,
      ellipsis: true,
      render: (value) => <Typography.Text className="!font-medium !text-[#172033]">{value}</Typography.Text>
    },
    ...(showCompetencia ? [competenciaColumn] : []),
    {
      title: "Vencimento",
      dataIndex: "dataVencimento",
      width: 130,
      onCell: (_, index) => ({ rowSpan: spanAt(dueDateSpans, index), className: dueDateCellClassName }),
      render: (value, row) => {
        const level = urgencyLevel(row.diasParaVencer);

        return (
          <span className={`inline-flex items-center whitespace-nowrap text-[13px] font-semibold ${dueDateClassNames[level]}`}>
            {formatDate(value)}
          </span>
        );
      }
    },
    {
      title: "Urgência",
      dataIndex: "diasParaVencer",
      width: 150,
      render: (days, row) => {
        const { label, level } = urgencyPresentation(row.status, days);

        return (
          <span className={`${urgencyBadgeClassName} ${urgencyClassNames[level]}`}>
            {label}
          </span>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => {
        const tone = statusClassName(status);

        return (
          <span className={`${badgeClassName} gap-2 ${statusBadgeClassNames[tone]}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {labelStatus(status)}
          </span>
        );
      }
    },
    {
      title: "Ações",
      key: "actions",
      fixed: "right",
      width: 126,
      render: (_, row) => {
        const status = normalizeStatus(row.status);
        const delivered = status === StatusObrigacao.Entregue;
        const disabled = delivered || status === StatusObrigacao.NaoAplicavel;
        const tooltip = delivered
          ? "Entrega já registrada"
          : status === StatusObrigacao.NaoAplicavel
            ? "Não aplicável"
            : "Marcar como entregue";

        return (
          <Tooltip title={tooltip}>
            <Button
              className={classNames(
                "!h-7 !min-w-[92px] !rounded-md !font-semibold",
                "[&.ant-btn-primary]:!border-[#2563eb] [&.ant-btn-primary]:!bg-[#2563eb]",
                delivered && deliveredButtonClassName
              )}
              type={delivered ? "default" : "primary"}
              size="small"
              icon={<CheckCircleOutlined />}
              disabled={disabled}
              onClick={() => onRegistrarEntrega(row)}
            >
              {delivered ? "Entregue" : "Entregar"}
            </Button>
          </Tooltip>
        );
      }
    }
  ];

  return (
    <section className={tablePanelClassName}>
      <Table
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={data}
        loading={loading}
        rowClassName={(_, index) => (index % 2 === 0 ? "obrigacoes-row-even" : "obrigacoes-row-odd")}
        scroll={{ x: showCompetencia ? 1080 : 980 }}
        pagination={{
          current: currentPage,
          pageSize,
          pageSizeOptions,
          placement: ["bottomCenter"],
          showSizeChanger: pageSizeChangerProps,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} obrigações`,
          onChange: (nextPage, nextPageSize) => { setPageSize(nextPageSize); setPage(nextPageSize === pageSize ? nextPage : 1); }
        }}
      />
    </section>
  );
}

function spanAt(spans: number[], index?: number) {
  return typeof index === "number" ? spans[index] ?? 1 : 1;
}

function buildRowSpans<T>(rows: T[], getKey: (row: T) => string) {
  const spans = Array(rows.length).fill(1);
  let start = 0;

  for (let index = 1; index <= rows.length; index += 1) {
    if (index < rows.length && getKey(rows[index]) === getKey(rows[start])) {
      continue;
    }

    const span = index - start;
    spans[start] = span;

    for (let hidden = start + 1; hidden < index; hidden += 1) {
      spans[hidden] = 0;
    }

    start = index;
  }

  return spans;
}
