import { Button, Dropdown, Table, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CalendarOutlined, MoreOutlined } from "@ant-design/icons";
import type { AlertaDto } from "../../../api/types";
import { operationalTableClassName } from "../../../shared/ui/styles";
import { labelStatus, labelTipo } from "../../../shared/utils/domain";
import { formatDate, urgencyText } from "../../../shared/utils/formatters";
import { pageSizeChangerProps } from "../../../shared/utils/pagination";
import {
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
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onOpenObrigacao: (alerta: AlertaDto) => void;
}

const dueDateClassNames = {
  ok: "text-[#047857]",
  atencao: "text-[#b45309]",
  urgente: "text-[#b91c1c]"
};
const alertasPageSizeOptions = [8, 10, 15, 20];

export function AlertasList({ alerts, currentPage, pageSize, onPageChange, onOpenObrigacao }: AlertasListProps) {
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
        <span className="inline-flex items-center whitespace-nowrap text-[15px] font-semibold text-[#1d4ed8]">
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
          <span className={`inline-flex items-center whitespace-nowrap text-[15px] font-semibold ${dueDateClassNames[tone]}`}>
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
      width: 150,
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
      render: (_, row) => <AlertActions item={row} onOpenObrigacao={onOpenObrigacao} />
    }
  ];

  return (
    <section className={operationalTableClassName}>
      <Table
        rowKey="obrigacaoId"
        size="small"
        columns={columns}
        dataSource={alerts}
        rowClassName={(_, index) => (index % 2 === 0 ? "operational-row-even" : "operational-row-odd")}
        scroll={{ x: 1040 }}
        pagination={{
          current: currentPage,
          pageSize,
          pageSizeOptions: alertasPageSizeOptions,
          placement: ["bottomCenter"],
          showSizeChanger: pageSizeChangerProps,
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
}

function AlertActions({ item, onOpenObrigacao }: AlertActionsProps) {
  const actionItems: MenuProps["items"] = [
    { key: "open", label: "Abrir obrigação", icon: <CalendarOutlined /> }
  ];

  return (
    <Dropdown
      menu={{
        items: actionItems,
        onClick: () => onOpenObrigacao(item)
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <Button
        aria-label="Mais opções do alerta"
        className="!h-9 !w-9 !rounded-md !p-0 hover:!bg-[#eff6ff] hover:!text-[#2563eb]"
        type="text"
        icon={<MoreOutlined className="rotate-90" />}
      />
    </Dropdown>
  );
}
