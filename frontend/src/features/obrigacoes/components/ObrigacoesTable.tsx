import { useMemo, useState } from "react";
import { Button, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckCircleOutlined, MoreOutlined } from "@ant-design/icons";
import type { ObrigacaoDto } from "../../../api/types";
import { labelStatus, labelTipo, normalizeStatus, StatusObrigacao } from "../../../shared/utils/domain";
import { formatDate } from "../../../shared/utils/formatters";
import { statusClassName, urgencyLabel, urgencyLevel } from "./calendarioPresentation";
import "./obrigacoes-table.css";

interface ObrigacoesTableProps {
  data: ObrigacaoDto[];
  loading: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

const pageSize = 10;

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
      title: "Obrigação",
      dataIndex: "tipo",
      width: 160,
      onCell: (_, index) => ({ rowSpan: spanAt(obligationSpans, index) }),
      render: (tipo) => (
        <Typography.Text className="obrigacao-name" strong>
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
        return <span className={`tag-venc tag-venc--${level}`}>{formatDate(value)}</span>;
      }
    },
    {
      title: "Urgência",
      dataIndex: "diasParaVencer",
      width: 150,
      render: (days) => {
        const level = urgencyLevel(days);

        return <span className={`urgency-badge urgency-badge--${level}`}>{urgencyLabel(days)}</span>;
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => (
        <span className={`status-badge status-badge--${statusClassName(status)}`}>
          <span className="status-dot" aria-hidden="true" />
          {labelStatus(status)}
        </span>
      )
    },
    {
      title: "Ações",
      key: "actions",
      fixed: "right",
      width: 170,
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
          <Space className="row-actions" size={4}>
            <Tooltip title={tooltip}>
              <Button
                className={`obligation-action${delivered ? " obligation-action--done" : ""}`}
                type={delivered ? "default" : "primary"}
                size="small"
                icon={<CheckCircleOutlined />}
                disabled={disabled}
                onClick={() => onRegistrarEntrega(row)}
              >
                {delivered ? "Entregue" : "Entregar"}
              </Button>
            </Tooltip>
            <Tooltip title="Mais opções">
              <Button aria-label="Mais opções" type="text" shape="circle" icon={<MoreOutlined />} />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  return (
    <section className="panel calendario-table-panel">
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
          position: ["bottomCenter"],
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} obrigações`,
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
