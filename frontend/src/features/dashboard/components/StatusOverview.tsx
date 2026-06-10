import { Empty, Progress, Typography } from "antd";
import type { DashboardDto } from "../../../api/types";

interface StatusOverviewProps {
  data?: DashboardDto;
}

const statusItems = [
  { label: "Entregues", key: "entregues", color: "#2E7D32" },
  { label: "Pendentes", key: "pendentes", color: "#F57F17" },
  { label: "Atrasadas", key: "atrasadas", color: "#C62828" }
] as const;

export function StatusOverview({ data }: StatusOverviewProps) {
  const items = statusItems.map((item) => ({ ...item, value: data?.[item.key] ?? 0 }));
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const chartItems = items.map((item) => ({
    ...item,
    exactPercent: total > 0 ? (item.value / total) * 100 : 0,
    percent: total > 0 ? Math.round((item.value / total) * 100) : 0
  }));

  if (!data || total === 0) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
        <Empty description="Sem obrigações pendentes, entregues ou atrasadas" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-5 flex items-start justify-between gap-4 max-[720px]:flex-col">
        <div>
          <Typography.Title className="!mb-1 !mt-0 !text-[22px] !font-extrabold !text-[#0f172a]" level={3}>
            Distribuição consolidada
          </Typography.Title>
          <Typography.Text className="!text-[#667085]" type="secondary">
            Proporção dos status em todas as obrigações cadastradas.
          </Typography.Text>
        </div>
      </div>

      <div className="grid gap-5">
        <div className="rounded-lg border border-[#e5edf6] bg-[#f8fafc] p-5">
          <div className="mb-4 flex items-end justify-between gap-4 max-[720px]:items-start max-[720px]:flex-col">
            <div className="grid gap-1">
              <Typography.Text className="!text-[12px] !font-extrabold !uppercase !text-[#667085]">
                Visão geral
              </Typography.Text>
              <span className="text-[22px] font-extrabold leading-tight text-[#0f172a]">Status das obrigações</span>
            </div>
            <Typography.Text className="!text-[13px] !font-bold !text-[#475569]">
              Base consolidada de {total} registros
            </Typography.Text>
          </div>

          <div
            aria-label={`Distribuição consolidada: ${chartItems
              .map((item) => `${item.label} ${item.percent}%`)
              .join(", ")}`}
            className="flex h-9 w-full overflow-hidden rounded-full bg-[#e2e8f0]"
            role="img"
          >
            {chartItems
              .filter((item) => item.value > 0)
              .map((item) => (
                <span
                  className="h-full min-w-[8px]"
                  key={item.label}
                  style={{ width: `${item.exactPercent}%`, backgroundColor: item.color }}
                  title={`${item.label}: ${item.value} (${item.percent}%)`}
                />
              ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
          {chartItems.map((item) => (
            <div className="grid min-w-0 gap-3 rounded-lg border border-[#edf1f5] bg-[#f8fafc] p-4" key={item.label}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="h-3 w-3 flex-none rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="truncate font-bold text-[#0f172a]">{item.label}</span>
                </div>
                <Typography.Text className="!text-[15px] !text-[#0f172a]" strong>
                  {item.percent}%
                </Typography.Text>
              </div>
              <strong className="text-[30px] leading-none text-[#0f172a]">{item.value}</strong>
              <Progress percent={item.percent} strokeColor={item.color} showInfo={false} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
