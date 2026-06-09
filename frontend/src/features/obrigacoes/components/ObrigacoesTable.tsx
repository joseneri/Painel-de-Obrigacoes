import { useMemo, useState } from "react";
import { Button, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, MoreOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import { labelStatus, labelTipo, normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";
import { formatDate } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";
import { statusClassName, urgencyLabel, urgencyLevel } from "./calendarioPresentation";

interface ObrigacoesTableProps {
  data: ObrigacaoDto[];
  loading: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

const pageSize = 10;
const tablePanelClassName = classNames(
  "min-w-0 rounded-lg border border-[#f1f5f9] bg-white px-6 pb-[18px] pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:px-3",
  "[&_.ant-table-thead>tr>th]:text-[11px] [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase",
  "[&_.ant-table-thead>tr>th]:tracking-normal [&_.ant-table-thead>tr>th]:text-[#64748b]",
  "[&_.ant-table-tbody>tr.obrigacoes-row-odd>td]:bg-[#f8fafc] [&_.ant-table-tbody>tr:hover>td]:!bg-[#eff6ff]",
  "[&_.ant-table-pagination.ant-pagination]:mx-0 [&_.ant-table-pagination.ant-pagination]:mb-1",
  "[&_.ant-table-pagination.ant-pagination]:mt-5 [&_.ant-table-pagination.ant-pagination]:flex",
  "[&_.ant-table-pagination.ant-pagination]:w-full [&_.ant-table-pagination.ant-pagination]:justify-center",
  "[&_.ant-table-pagination.ant-pagination]:gap-2 [&_.ant-pagination-total-text]:me-2",
  "[&_.ant-pagination-total-text]:h-[38px] [&_.ant-pagination-total-text]:text-[13px]",
  "[&_.ant-pagination-total-text]:font-bold [&_.ant-pagination-total-text]:leading-[38px]",
  "[&_.ant-pagination-total-text]:text-[#475569] [&_.ant-pagination-item]:h-[38px]",
  "[&_.ant-pagination-item]:min-w-[38px] [&_.ant-pagination-item]:rounded-[10px]",
  "[&_.ant-pagination-item]:leading-9 [&_.ant-pagination-prev]:h-[38px]",
  "[&_.ant-pagination-prev]:min-w-[38px] [&_.ant-pagination-prev]:rounded-[10px]",
  "[&_.ant-pagination-prev]:leading-9 [&_.ant-pagination-next]:h-[38px]",
  "[&_.ant-pagination-next]:min-w-[38px] [&_.ant-pagination-next]:rounded-[10px]",
  "[&_.ant-pagination-next]:leading-9 [&_.ant-pagination-prev_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-next_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-item-active]:!border-[#1677ff] [&_.ant-pagination-item-active]:!bg-[#1677ff]",
  "[&_.ant-pagination-item-active_a]:font-extrabold [&_.ant-pagination-item-active_a]:!text-white"
);
const dueDateClassNames = {
  ok: "text-[#2e7d32]",
  atencao: "text-[#f57f17]",
  urgente: "text-[#c62828]"
};
const urgencyClassNames = {
  ok: "bg-[#e8f5e9] text-[#2e7d32]",
  atencao: "bg-[#fff3e0] text-[#f57f17]",
  urgente: "bg-[#ffebee] text-[#c62828]"
};
const statusBadgeClassNames: Record<string, string> = {
  pendente: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  entregue: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  atrasada: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
  "nao-aplicavel": "border-[#cbd5e1] bg-[#f8fafc] text-[#64748b]"
};
const deliveredButtonClassName =
  "[&.ant-btn[disabled]]:!border-[#a7f3d0] [&.ant-btn[disabled]]:!bg-[#ecfdf5] [&.ant-btn[disabled]]:!text-[#047857]";

export function ObrigacoesTable({ data, loading, onRegistrarEntrega }: ObrigacoesTableProps) {
  const [page, setPage] = useState(1);
  const lastPage = Math.max(1, Math.ceil(data.length / pageSize));
  const currentPage = Math.min(page, lastPage);
  const visibleRows = useMemo(
    () => data.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [currentPage, data]
  );
  const obligationSpans = useMemo(() => buildRowSpans(visibleRows, (row) => String(row.tipo)), [visibleRows]);
  const dueDateSpans = useMemo(() => buildRowSpans(visibleRows, (row) => row.dataVencimento), [visibleRows]);

  const columns: ColumnsType<ObrigacaoDto> = [
    {
      title: "Obrigacao",
      dataIndex: "tipo",
      width: 160,
      onCell: (_, index) => ({ rowSpan: spanAt(obligationSpans, index) }),
      render: (tipo) => (
        <Typography.Text className="!text-[#1677ff]" strong>
          {labelTipo(tipo)}
        </Typography.Text>
      )
    },
    {
      title: "Empresa",
      dataIndex: "empresaRazaoSocial",
      width: 240,
      ellipsis: true,
      render: (value) => <Typography.Text>{value}</Typography.Text>
    },
    {
      title: "Vencimento",
      dataIndex: "dataVencimento",
      width: 130,
      onCell: (_, index) => ({ rowSpan: spanAt(dueDateSpans, index) }),
      render: (value, row) => {
        const level = urgencyLevel(row.diasParaVencer);

        return (
          <span className={`inline-flex items-center whitespace-nowrap text-[13px] font-bold ${dueDateClassNames[level]}`}>
            {formatDate(value)}
          </span>
        );
      }
    },
    {
      title: "Urgencia",
      dataIndex: "diasParaVencer",
      width: 150,
      render: (days) => {
        const level = urgencyLevel(days);

        return (
          <span
            className={`inline-flex min-h-7 items-center whitespace-nowrap rounded-full px-2.5 py-[5px] text-xs font-extrabold ${urgencyClassNames[level]}`}
          >
            {urgencyLabel(days)}
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
          <span
            className={`inline-flex items-center gap-[7px] whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusBadgeClassNames[tone]}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {labelStatus(status)}
          </span>
        );
      }
    },
    {
      title: "Acoes",
      key: "actions",
      fixed: "right",
      width: 170,
      render: (_, row) => {
        const status = normalizeStatus(row.status);
        const delivered = status === StatusObrigacao.Entregue;
        const disabled = delivered || status === StatusObrigacao.NaoAplicavel;
        const tooltip = delivered
          ? "Entrega ja registrada"
          : status === StatusObrigacao.NaoAplicavel
            ? "Nao aplicavel"
            : "Marcar como entregue";

        return (
          <Space className="min-w-[132px]" size={4}>
            <Tooltip title={tooltip}>
              <Button
                className={classNames("min-w-[92px] rounded-lg font-bold", delivered && deliveredButtonClassName)}
                type={delivered ? "default" : "primary"}
                size="small"
                icon={<CheckCircleOutlined />}
                disabled={disabled}
                onClick={() => onRegistrarEntrega(row)}
              >
                {delivered ? "Entregue" : "Entregar"}
              </Button>
            </Tooltip>
            <Tooltip title="Mais opcoes">
              <Button aria-label="Mais opcoes" type="text" shape="circle" icon={<MoreOutlined />} />
            </Tooltip>
          </Space>
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
        scroll={{ x: 980 }}
        pagination={{
          current: currentPage,
          pageSize,
          placement: ["bottomCenter"],
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} obrigacoes`,
          onChange: setPage
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
