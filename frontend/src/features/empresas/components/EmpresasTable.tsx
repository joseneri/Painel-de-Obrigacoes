import type { ReactNode } from "react";
import { App as AntApp, Button, Popconfirm, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DeleteOutlined } from "@ant-design/icons";
import type { EmpresaDto } from "../../../api/types";
import { useDeleteEmpresa } from "../../../api/hooks";
import { labelRegime } from "../../../shared/utils/domain";
import { getErrorMessage } from "../../../shared/utils/errors";
import { formatCnpj } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";

interface EmpresasTableProps {
  data: EmpresaDto[];
  loading: boolean;
  summary: string;
  toolbar: ReactNode;
}

const tablePanelClassName = classNames(
  "min-w-0 max-w-full overflow-hidden rounded-lg border border-[#f1f5f9] bg-white px-6 pb-5 pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:w-[calc(100%-24px)] max-[720px]:px-3",
  "[&_.ant-table-thead>tr>th]:text-[11px] [&_.ant-table-thead>tr>th]:font-bold [&_.ant-table-thead>tr>th]:uppercase",
  "[&_.ant-table-thead>tr>th]:tracking-normal [&_.ant-table-thead>tr>th]:text-[#64748b]",
  "[&_.ant-table-tbody>tr:hover>td]:!bg-[#eff6ff] [&_.ant-table-pagination.ant-pagination]:mx-0",
  "[&_.ant-table-pagination.ant-pagination]:mb-0 [&_.ant-table-pagination.ant-pagination]:mt-5",
  "[&_.ant-table-pagination.ant-pagination]:flex [&_.ant-table-pagination.ant-pagination]:w-full",
  "[&_.ant-table-pagination.ant-pagination]:justify-center [&_.ant-pagination-item-active]:!border-[#1677ff]",
  "[&_.ant-pagination-item-active]:!bg-[#1677ff] [&_.ant-pagination-item-active_a]:font-extrabold",
  "[&_.ant-pagination-item-active_a]:!text-white"
);

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
      render: (regime) => (
        <Tag className="rounded-full border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 font-bold text-[#1677ff]">
          {labelRegime(regime)}
        </Tag>
      )
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
          <Button className="rounded-lg" danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <section className={tablePanelClassName}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#edf1f5] py-5 max-[720px]:items-stretch">
        <div>
          <Typography.Title className="!mb-1 !mt-0 !text-[22px] !font-extrabold !text-[#0f172a]" level={3}>
            Empresas cadastradas
          </Typography.Title>
          <Typography.Text className="!text-[#667085]" type="secondary">
            {summary}
          </Typography.Text>
        </div>
        {toolbar}
      </div>

      <div className="min-w-0 overflow-x-auto pt-5">
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
      </div>
    </section>
  );
}
