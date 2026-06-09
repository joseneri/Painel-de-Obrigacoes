import { Button, Table, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CheckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ObrigacaoDto } from "../../../api/types";
import {
  labelPeriodicidade,
  labelStatus,
  labelTipo,
  normalizeStatus,
  statusColor,
  StatusObrigacao
} from "../../../shared/utils/domain";
import { formatCompetencia, formatDate, urgencyText } from "../../../shared/utils/formatters";

interface ObrigacoesTableProps {
  data: ObrigacaoDto[];
  loading: boolean;
  onRegistrarEntrega: (obrigacao: ObrigacaoDto) => void;
}

export function ObrigacoesTable({ data, loading, onRegistrarEntrega }: ObrigacoesTableProps) {
  const columns: ColumnsType<ObrigacaoDto> = [
    {
      title: "Obrigação",
      dataIndex: "tipo",
      width: 170,
      render: (tipo) => <Typography.Text strong>{labelTipo(tipo)}</Typography.Text>
    },
    {
      title: "Empresa",
      dataIndex: "empresaRazaoSocial",
      minWidth: 240,
      render: (value) => <Typography.Text>{value}</Typography.Text>
    },
    {
      title: "Competência",
      dataIndex: "competencia",
      width: 140,
      render: (value, row) => formatCompetencia(value, row.ano, row.mes)
    },
    {
      title: "Vencimento",
      dataIndex: "dataVencimento",
      width: 140,
      sorter: (a, b) => dayjs(a.dataVencimento).valueOf() - dayjs(b.dataVencimento).valueOf(),
      render: formatDate
    },
    {
      title: "Urgencia",
      dataIndex: "diasParaVencer",
      width: 150,
      render: (days) => <Typography.Text>{urgencyText(days)}</Typography.Text>
    },
    {
      title: "Periodicidade",
      dataIndex: "periodicidade",
      width: 140,
      render: labelPeriodicidade
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => <Tag color={statusColor(status)}>{labelStatus(status)}</Tag>
    },
    {
      title: "Conclusão",
      dataIndex: "dataConclusao",
      width: 140,
      render: formatDate
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 70,
      render: (_, row) => {
        const status = normalizeStatus(row.status);
        const disabled =
          status === StatusObrigacao.Entregue || status === StatusObrigacao.NaoAplicavel;

        return (
          <Tooltip title={disabled ? "Entrega já registrada" : "Marcar como entregue"}>
            <Button
              className="table-action"
              type="primary"
              ghost
              icon={<CheckOutlined />}
              disabled={disabled}
              onClick={() => onRegistrarEntrega(row)}
            />
          </Tooltip>
        );
      }
    }
  ];

  return (
    <section className="panel">
      <Table
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={data}
        loading={loading}
        scroll={{ x: 1220 }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </section>
  );
}
