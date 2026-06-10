import { useMemo, useState } from "react";
import { Button, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import {
  completedActionButtonClassName,
  fixedBadgeClassName,
  operationalTableClassName,
  primaryActionButtonClassName,
  statusBadgeClassNames,
  urgencyBadgeClassNames
} from "../../../shared/ui/styles";
import { labelStatus, labelTipo, normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";
import { formatCompetencia, formatDate } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";
import { pageSizeChangerProps, pageSizeOptions } from "../../../shared/utils/pagination";
import { buildRowSpans, spanAt } from "../../../shared/utils/tableRows";
import { statusClassName, urgencyLevel, urgencyPresentation } from "./calendarioPresentation";

interface ObrigacoesTableProps {
  data: ObrigacaoDto[];
  loading: boolean;
  showCompetencia?: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

const defaultPageSize = 10;
const tablePanelClassName = classNames(
  operationalTableClassName,
  "[&_.ant-table-thead>tr>th:first-child]:!pl-8 [&_.ant-table-thead>tr>th:last-child]:!pr-8",
  "[&_.ant-table-tbody>tr>td:last-child]:!pr-8",
  "[&_.ant-table-tbody>tr:hover>td.obrigacoes-group-cell]:!bg-[#f8fbff]",
  "[&_.ant-table-tbody>tr>td.obrigacoes-group-cell.ant-table-cell-row-hover]:!bg-[#f8fbff]",
  "[&_.ant-table-tbody>tr:hover>td.obrigacoes-obligation-cell]:!bg-[#f8fbff]",
  "[&_.ant-table-tbody>tr>td.obrigacoes-obligation-cell.ant-table-cell-row-hover]:!bg-[#f8fbff]"
);
const dueDateClassNames = {
  ok: "text-[#047857]",
  atencao: "text-[#b45309]",
  urgente: "text-[#b91c1c]"
};
const groupedCellClassName = "obrigacoes-group-cell !align-middle";
const dueDateCellClassName = `${groupedCellClassName} !bg-[#f8fbff]`;
const obligationCellClassName =
  `${groupedCellClassName} obrigacoes-obligation-cell !border-r !border-[#e5edf5] !bg-[#f8fbff] !pl-8`;

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
      <span className="inline-flex items-center whitespace-nowrap text-[15px] font-semibold text-[#1d4ed8]">
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
        <Typography.Text className="!font-semibold !text-[#1d4ed8]">{labelTipo(tipo)}</Typography.Text>
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
          <span className={`inline-flex items-center whitespace-nowrap text-[15px] font-semibold ${dueDateClassNames[level]}`}>
            {formatDate(value)}
          </span>
        );
      }
    },
    {
      title: "Urgência",
      dataIndex: "diasParaVencer",
      width: 170,
      render: (days, row) => {
        const { label, level } = urgencyPresentation(row.status, days);

        return <span className={`${fixedBadgeClassName} ${urgencyBadgeClassNames[level]}`}>{label}</span>;
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 150,
      render: (status) => (
        <span className={`${fixedBadgeClassName} gap-2 ${statusBadgeClassNames[statusClassName(status)]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {labelStatus(status)}
        </span>
      )
    },
    {
      title: "Ações",
      key: "actions",
      fixed: "right",
      width: 136,
      render: (_, row) => (
        <ObrigacaoAction row={row} onRegistrarEntrega={onRegistrarEntrega} />
      )
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
        rowClassName={(_, index) => (index % 2 === 0 ? "operational-row-even" : "operational-row-odd")}
        scroll={{ x: showCompetencia ? 1080 : 980 }}
        pagination={{
          current: currentPage,
          pageSize,
          pageSizeOptions,
          placement: ["bottomCenter"],
          showSizeChanger: pageSizeChangerProps,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} obrigações`,
          onChange: (nextPage, nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(nextPageSize === pageSize ? nextPage : 1);
          }
        }}
      />
    </section>
  );
}

interface ObrigacaoActionProps {
  row: ObrigacaoDto;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

function ObrigacaoAction({ row, onRegistrarEntrega }: ObrigacaoActionProps) {
  const status = normalizeStatus(row.status);
  const delivered = status === StatusObrigacao.Entregue;
  const disabled = status === StatusObrigacao.NaoAplicavel;
  const tooltip = delivered
    ? "Entrega já registrada"
    : disabled
      ? "Não aplicável"
      : "Marcar como entregue";

  return (
    <Tooltip title={tooltip}>
      <Button
        className={delivered ? completedActionButtonClassName : primaryActionButtonClassName}
        type={delivered ? "default" : "primary"}
        size="small"
        icon={<CheckCircleOutlined />}
        disabled={disabled}
        onClick={delivered ? undefined : () => onRegistrarEntrega(row)}
      >
        {delivered ? "Entregue" : "Entregar"}
      </Button>
    </Tooltip>
  );
}
