import type { ReactNode } from "react";
import { App as AntApp, Button, Dropdown, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { HistoryOutlined, MoreOutlined } from "@ant-design/icons";
import type { EmpresaDto } from "../../../api/types";
import { useDeleteEmpresa } from "../../../api/hooks";
import { operationalTableClassName } from "../../../shared/ui/styles";
import { labelRegime } from "../../../shared/utils/domain";
import { getErrorMessage } from "../../../shared/utils/errors";
import { formatCnpj } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";
import { pageSizeChangerProps, pageSizeOptions } from "../../../shared/utils/pagination";

interface EmpresasTableProps {
  data: EmpresaDto[];
  loading: boolean;
  toolbar: ReactNode;
  onOpenHistorico: (empresa: EmpresaDto) => void;
}

const defaultPageSize = 8;
const actionsMenuClassName = classNames(
  "min-w-[174px] rounded-lg border border-[#e5edf5] p-1 shadow-[0_12px_24px_rgba(15,23,42,0.12)]",
  "[&_.ant-dropdown-menu-item]:!rounded-md [&_.ant-dropdown-menu-title-content]:!font-semibold",
  "[&_.ant-dropdown-menu-item-danger]:!text-[#dc2626] [&_.ant-dropdown-menu-item-danger:hover]:!bg-[#fff1f2]"
);
const actionButtonClassName =
  "!h-9 !w-9 !rounded-md !text-[#475569] hover:!bg-[#eff6ff] hover:!text-[#2563eb]";

export function EmpresasTable({ data, loading, toolbar, onOpenHistorico }: EmpresasTableProps) {
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
        <Tag className="rounded-full !border-[#bfdbfe] !bg-[#eff6ff] px-3 py-1 !text-[14px] font-bold !text-[#1d4ed8]">
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
            items: [
              { key: "history", label: "Historico de entregas", icon: <HistoryOutlined /> },
              { key: "delete", label: "Excluir Empresa", danger: true }
            ],
            onClick: ({ key, domEvent }) => {
              domEvent.stopPropagation();
              if (key === "history") {
                onOpenHistorico(row);
                return;
              }

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
    <section className={operationalTableClassName}>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#edf1f5] py-5 max-[720px]:items-stretch">
        <Typography.Title className="!mb-1 !mt-0 !text-[22px] !font-extrabold !text-[#0f172a]" level={3}>
          Empresas cadastradas
        </Typography.Title>
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
          rowClassName={(_, index) => (index % 2 === 0 ? "operational-row-even" : "operational-row-odd")}
          scroll={{ x: 720 }}
          pagination={{
            defaultPageSize,
            pageSizeOptions,
            placement: ["bottomCenter"],
            showSizeChanger: pageSizeChangerProps,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} empresas`
          }}
        />
      </div>
    </section>
  );
}
