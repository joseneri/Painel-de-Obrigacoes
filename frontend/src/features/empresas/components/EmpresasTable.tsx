import type { ReactNode } from "react";
import { App as AntApp, Button, Popconfirm, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined } from "@ant-design/icons";
import type { EmpresaDto } from "../../../api/types";
import { useDeleteEmpresa } from "../../../api/hooks";
import { labelRegime } from "../../../shared/utils/domain";
import { getErrorMessage } from "../../../shared/utils/errors";
import { formatCnpj } from "../../../shared/utils/formatters";

interface EmpresasTableProps {
  data: EmpresaDto[];
  loading: boolean;
  summary: string;
  toolbar: ReactNode;
}

export function EmpresasTable({ data, loading, summary, toolbar }: EmpresasTableProps) {
  const { message } = AntApp.useApp();
  const deleteEmpresa = useDeleteEmpresa();

  function handleDelete(id: string) {
    deleteEmpresa.mutate(id, {
      onSuccess: () => message.success("Empresa removida."),
      onError: (error) => message.error(getErrorMessage(error))
    });
  }

  const columns: ColumnsType<EmpresaDto> = [
    {
      title: "Razão social",
      dataIndex: "razaoSocial",
      minWidth: 260,
      render: (value) => <Typography.Text strong>{value}</Typography.Text>
    },
    {
      title: "CNPJ",
      dataIndex: "cnpj",
      width: 190,
      render: formatCnpj
    },
    {
      title: "Regime",
      dataIndex: "regimeTributario",
      width: 190,
      render: (regime) => <Tag color="blue">{labelRegime(regime)}</Tag>
    },
    {
      title: "",
      key: "actions",
      fixed: "right",
      width: 70,
      render: (_, row) => (
        <Popconfirm
          title="Remover empresa"
          description="As obrigações vinculadas também serão removidas."
          okText="Remover"
          cancelText="Cancelar"
          okButtonProps={{ danger: true, loading: deleteEmpresa.isPending }}
          onConfirm={() => handleDelete(row.id)}
        >
          <Button danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <section className="panel">
      <div className="panel-header empresas-list-header">
        <div>
          <Typography.Title level={3}>Empresas cadastradas</Typography.Title>
          <Typography.Text type="secondary">{summary}</Typography.Text>
        </div>
        {toolbar}
      </div>

      <Table
        rowKey="id"
        size="middle"
        columns={columns}
        dataSource={data}
        loading={loading}
        locale={{ emptyText: "Nenhuma empresa encontrada" }}
        scroll={{ x: 720 }}
        pagination={{ pageSize: 8, showSizeChanger: true }}
      />
    </section>
  );
}
