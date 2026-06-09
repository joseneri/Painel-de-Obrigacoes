import type { ReactNode } from "react";
import { App as AntApp, Button, Dropdown, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { MoreOutlined } from "@ant-design/icons";
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

const pageSize = 8;
const tablePanelClassName = classNames(
  "min-w-0 max-w-full overflow-hidden rounded-lg border border-[#e5edf5] bg-white px-6 pb-[18px] pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)] max-[720px]:w-[calc(100%-24px)] max-[720px]:px-3",
  "[&_.ant-table-thead>tr>th]:!bg-[#f8fafc] [&_.ant-table-thead>tr>th]:text-[11px]",
  "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase",
  "[&_.ant-table-thead>tr>th]:tracking-normal [&_.ant-table-thead>tr>th]:text-[#334155]",
  "[&_.ant-table-tbody>tr>td]:!py-2 [&_.ant-table-tbody>tr>td]:align-top [&_.ant-table-tbody>tr>td]:text-[14px]",
  "[&_.ant-table-tbody>tr.empresas-row-odd>td]:bg-[#fbfdff] [&_.ant-table-tbody>tr:hover>td]:!bg-[#f1f7ff]",
  "[&_.ant-table-pagination.ant-pagination]:mx-0 [&_.ant-table-pagination.ant-pagination]:mb-1",
  "[&_.ant-table-pagination.ant-pagination]:mt-5 [&_.ant-table-pagination.ant-pagination]:flex",
  "[&_.ant-table-pagination.ant-pagination]:w-full [&_.ant-table-pagination.ant-pagination]:justify-center",
  "[&_.ant-table-pagination.ant-pagination]:gap-2 [&_.ant-pagination-total-text]:me-2",
  "[&_.ant-pagination-total-text]:h-[38px] [&_.ant-pagination-total-text]:text-[13px]",
  "[&_.ant-pagination-total-text]:font-semibold [&_.ant-pagination-total-text]:leading-[38px]",
  "[&_.ant-pagination-total-text]:text-[#475569] [&_.ant-pagination-item]:h-[38px]",
  "[&_.ant-pagination-item]:min-w-[38px] [&_.ant-pagination-item]:rounded-full",
  "[&_.ant-pagination-item]:leading-9 [&_.ant-pagination-prev]:h-[38px]",
  "[&_.ant-pagination-prev]:min-w-[38px] [&_.ant-pagination-prev]:rounded-[10px]",
  "[&_.ant-pagination-prev]:leading-9 [&_.ant-pagination-next]:h-[38px]",
  "[&_.ant-pagination-next]:min-w-[38px] [&_.ant-pagination-next]:rounded-[10px]",
  "[&_.ant-pagination-next]:leading-9 [&_.ant-pagination-prev_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-next_.ant-pagination-item-link]:rounded-[10px]",
  "[&_.ant-pagination-item-active]:!rounded-full [&_.ant-pagination-item-active]:!border-[#1677ff]",
  "[&_.ant-pagination-item-active]:!bg-[#1677ff] [&_.ant-pagination-item-active_a]:font-extrabold",
  "[&_.ant-pagination-item-active_a]:!text-white"
);
const actionsMenuClassName = classNames(
  "min-w-[174px] rounded-lg border border-[#e5edf5] p-1 shadow-[0_12px_24px_rgba(15,23,42,0.12)]",
  "[&_.ant-dropdown-menu-item]:!rounded-md [&_.ant-dropdown-menu-title-content]:!font-semibold",
  "[&_.ant-dropdown-menu-item-danger]:!text-[#dc2626] [&_.ant-dropdown-menu-item-danger:hover]:!bg-[#fff1f2]"
);
const actionButtonClassName =
  "!h-7 !w-7 !rounded-md !text-[#475569] hover:!bg-[#eff6ff] hover:!text-[#2563eb]";

export function EmpresasTable({ data, loading, summary, toolbar }: EmpresasTableProps) {
  const { message, modal } = AntApp.useApp();
  const deleteEmpresa = useDeleteEmpresa();

  function confirmDelete(row: EmpresaDto) {
    modal.confirm({
      title: "Excluir empresa",
      content: "As obrigações vinculadas também serão removidas.",
      okText: "Excluir",
      cancelText: "Cancelar",
      okButtonProps: { danger: true },
      onOk: () =>
        deleteEmpresa
          .mutateAsync(row.id)
          .then(() => message.success("Empresa removida."))
          .catch((error) => {
            message.error(getErrorMessage(error));
            throw error;
          })
    });
  }

  const columns: ColumnsType<EmpresaDto> = [
    {
      title: "Razão social",
      dataIndex: "razaoSocial",
      minWidth: 260,
      render: (value) => <Typography.Text className="!font-semibold !text-[#172033]">{value}</Typography.Text>
    },
    {
      title: "CNPJ",
      dataIndex: "cnpj",
      width: 190,
      render: (value) => <Typography.Text className="!text-[#334155]">{formatCnpj(value)}</Typography.Text>
    },
    {
      title: "Regime",
      dataIndex: "regimeTributario",
      width: 190,
      render: (regime) => (
        <Tag className="rounded-full !border-[#bfdbfe] !bg-[#eff6ff] px-3 py-1 font-bold !text-[#1d4ed8]">
          {labelRegime(regime)}
        </Tag>
      )
    },
    {
      title: "Ações",
      key: "actions",
      align: "center",
      fixed: "right",
      width: 90,
      render: (_, row) => (
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName={actionsMenuClassName}
          menu={{
            items: [{ key: "delete", label: "Excluir Empresa", danger: true }],
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
              confirmDelete(row);
            }
          }}
        >
          <Button
            aria-label="Mais opções"
            title="Mais opções"
            className={actionButtonClassName}
            type="text"
            icon={<MoreOutlined />}
            disabled={deleteEmpresa.isPending}
          />
        </Dropdown>
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
          size="small"
          columns={columns}
          dataSource={data}
          loading={loading}
          locale={{ emptyText: "Nenhuma empresa encontrada" }}
          rowClassName={(_, index) => (index % 2 === 0 ? "empresas-row-even" : "empresas-row-odd")}
          scroll={{ x: 720 }}
          pagination={{
            pageSize,
            placement: ["bottomCenter"],
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} empresas`
          }}
        />
      </div>
    </section>
  );
}
