import { Skeleton } from "antd";
import {
  ApartmentOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { DashboardDto } from "../../../api/types";

interface MetricCardsProps {
  data?: DashboardDto;
  loading: boolean;
}

type MetricTone = "default" | "success" | "warning" | "danger";

interface MetricProps {
  title: string;
  value?: number;
  loading: boolean;
  icon: ReactNode;
  tone?: MetricTone;
}

const toneClassNames = {
  default: {
    icon: "bg-[#e6f1fb] text-[#1677ff]",
    value: "text-[#0f172a]"
  },
  warning: {
    icon: "bg-[#fff3e0] text-[#e65100]",
    value: "text-[#e65100]"
  },
  success: {
    icon: "bg-[#e8f5e9] text-[#2e7d32]",
    value: "text-[#2e7d32]"
  },
  danger: {
    icon: "bg-[#ffebee] text-[#c62828]",
    value: "text-[#c62828]"
  }
} satisfies Record<MetricTone, { icon: string; value: string }>;

const currentMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(new Date());

export function MetricCards({ data, loading }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] px-7 pb-6 pt-5 max-[720px]:grid-cols-1">
      <Metric title="Empresas" value={data?.totalEmpresas} loading={loading} icon={<ApartmentOutlined />} />
      <Metric
        title={`Obrigações do mês de ${currentMonthName}`}
        value={data?.obrigacoesMes}
        loading={loading}
        icon={<FileDoneOutlined />}
      />
      <div className="col-span-2 grid min-w-0 gap-2.5 max-[720px]:col-span-1">
        <span className="text-xs font-extrabold uppercase leading-none tracking-normal text-[#475569]">
          Obrigações totais
        </span>
        <div className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
          <Metric
            title="Pendentes"
            value={data?.pendentes}
            loading={loading}
            icon={<ClockCircleOutlined />}
            tone="warning"
          />
          <Metric
            title="Entregues"
            value={data?.entregues}
            loading={loading}
            icon={<CheckCircleOutlined />}
            tone="success"
          />
          <Metric
            title="Atrasadas"
            value={data?.atrasadas}
            loading={loading}
            icon={<AlertOutlined />}
            tone="danger"
          />
        </div>
      </div>
    </div>
  );
}

function Metric({ title, value, loading, icon, tone = "default" }: MetricProps) {
  const classes = toneClassNames[tone];

  return (
    <div className="flex min-h-[124px] min-w-0 items-center gap-4 rounded-lg border border-[#f1f5f9] bg-white px-6 py-[22px] shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:min-h-[104px]">
      <span className={`inline-grid h-12 w-12 flex-none place-items-center rounded-[10px] text-[21px] ${classes.icon}`}>
        {icon}
      </span>
      <span className="min-w-0">
        {loading ? (
          <Skeleton.Input active className="!h-[34px] !w-20" size="small" />
        ) : (
          <strong className={`block text-[34px] leading-none ${classes.value}`}>{value ?? 0}</strong>
        )}
        <span className="mt-2 block text-[13px] font-bold uppercase text-[#667085]">{title}</span>
      </span>
    </div>
  );
}
