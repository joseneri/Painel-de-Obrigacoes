import { Button, Dropdown, Table, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarOutlined, CloseCircleOutlined, MoreOutlined } from "@ant-design/icons";
import type { AlertaDto } from "../../../api/types";
import { labelStatus, labelTipo } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";
import { classNames } from "../../../shared/utils/classNames";
import {
  alertasPageSize,
  alertBadgeClassName,
  alertStatusClassNames,
  alertUrgencyBadgeClassName,
  alertUrgencyClassNames,
  statusTone,
  urgencyTone
} from "./alertasPresentation";

interface AlertasListProps {
  alerts: AlertaDto[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onOpenObrigacao: (alerta: AlertaDto) => void;
  onDismissAlert: (obrigacaoId: string) => void;
}

const tablePanelClassName = classNames(
  "min-w-0 rounded-lg border border-[#e5edf5] bg-white px-6 pb-[18px] pt-0 shadow-[0_1px_2px_rgba(15,23,42,0.05)] max-[720px]:px-3",
  "[&_.ant-table-thead>tr>th]:!bg-[#f8fafc] [&_.ant-table-thead>tr>th]:text-[11px]",
  "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:uppercase",
  "[&_.ant-table-thead>tr>th]:tracking-normal [&_.ant-table-thead>tr>th]:text-[#334155]",
  "[&_.ant-table-tbody>tr>td]:!py-2 [&_.ant-table-tbody>tr>td]:align-top [&_.ant-table-tbody>tr>td]:text-[14px]",
  "[&_.ant-table-tbody>tr.alertas-row-odd>td]:bg-[#fbfdff] [&_.ant-table-tbody>tr:hover>td]:!bg-[#f1f7ff]",
  "[&_.ant-table-pagination.ant-pagination]:mx-0 [&_.ant-table-pagination.ant-pagination]:mb-1",
  "[&_.ant-table-pagination.ant-pagination]:mt-5 [&_.ant-table-pagination.ant-pagination]:flex",
  "[&_.ant-table-pagination.ant-pagination]:w-full [&_.ant-table-pagination.ant-pagination]:justify-center",
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
  "[&_.ant-pagination-item-active_a]:font-extrabold [&_.ant-pagination-item-active_a]:!text-white"
);

const dueDateClassNames = {
  ok: "text-[#047857]",
  atencao: "text-[#b45309]",
  urgente: "text-[#b91c1c]"
};

export function AlertasList({
  alerts,
  currentPage,
  onPageChange,
  onOpenObrigacao,
  onDismissAlert
}: AlertasListProps) {
  const columns: ColumnsType<AlertaDto> = [
    {
      title: "Obrigação",
      dataIndex: "tipo",
      width: 160,
      render: (tipo) => (
        <Typography.Text className="!font-semibold !text-[#1d4ed8]">{labelTipo(tipo)}</Typography.Text>
      )
    },
    {
      title: "Empresa",
      dataIndex: "empresaRazaoSocial",
      width: 250,
      ellipsis: true,
      render: (value) => <Typography.Text className="!font-medium !text-[#172033]">{value}</Typography.Text>
    },
    {
      title: "Competência",
      dataIndex: "competencia",
      width: 128,
      render: (value) => (
        <span className="inline-flex items-center whitespace-nowrap text-[13px] font-semibold text-[#1d4ed8]">
          {value}
        </span>
      )
    },
    {
      title: "Vencimento",
      dataIndex: "dataVencimento",
      width: 130,
      render: (value, row) => {
        const tone = urgencyTone(row.diasParaVencer);

        return (
          <span className={`inline-flex items-center whitespace-nowrap text-[13px] font-semibold ${dueDateClassNames[tone]}`}>
            {formatDate(value)}
          </span>
        );
      }
    },
    {
      title: "Urgência",
      dataIndex: "diasParaVencer",
      width: 170,
      render: (days) => (
        <span className={`${alertUrgencyBadgeClassName} ${alertUrgencyClassNames[urgencyTone(days)]}`}>
          {urgencyText(days)}
        </span>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 140,
      render: (status) => (
        <span className={`${alertBadgeClassName} gap-2 ${alertStatusClassNames[statusTone(status)]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {labelStatus(status)}
        </span>
      )
    },
    {
      title: "Ações",
      key: "actions",
      fixed: "right",
      width: 84,
      render: (_, row) => <AlertActions item={row} onOpenObrigacao={onOpenObrigacao} onDismissAlert={onDismissAlert} />
    }
  ];

  return (
    <section className={tablePanelClassName}>
      <Table
        rowKey="obrigacaoId"
        size="small"
        columns={columns}
        dataSource={alerts}
        rowClassName={(_, index) => (index % 2 === 0 ? "alertas-row-even" : "alertas-row-odd")}
        scroll={{ x: 1040 }}
        pagination={{
          current: currentPage,
          pageSize: alertasPageSize,
          placement: ["bottomCenter"],
          showSizeChanger: false,
          showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} alertas`,
          onChange: onPageChange
        }}
      />
    </section>
  );
}

interface AlertActionsProps {
  item: AlertaDto;
  onOpenObrigacao: (alerta: AlertaDto) => void;
  onDismissAlert: (obrigacaoId: string) => void;
}

function AlertActions({ item, onOpenObrigacao, onDismissAlert }: AlertActionsProps) {
  const actionItems: MenuProps["items"] = [
    { key: "go", label: "Ir para Obrigação", icon: <CalendarOutlined /> },
    { key: "dismiss", label: "Dispensar Alerta", icon: <CloseCircleOutlined />, danger: true }
  ];

  return (
    <Dropdown
      menu={{
        items: actionItems,
        onClick: ({ key }) => {
          if (key === "go") {
            onOpenObrigacao(item);
            return;
          }

          onDismissAlert(item.obrigacaoId);
        }
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        aria-label="Mais opções do alerta"
        className="!h-7 !w-7 !rounded-md !p-0"
        type="text"
        icon={<MoreOutlined className="rotate-90" />}
      />
    </Dropdown>
  );
}
