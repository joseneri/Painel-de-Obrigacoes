import { Empty, Progress, Space, Tag, Typography } from "antd";
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

  if (!data || total === 0) {
    return (
      <div className="grid min-h-[220px] place-items-center rounded-lg border border-[#e5edf6] bg-[#f8fafc]">
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
        <Tag className="rounded-full border-[#bfdbfe] bg-[#eff6ff] px-3 py-1 font-bold text-[#1677ff]">
          {total} obrigações
        </Tag>
      </div>

      <div className="grid gap-4">
        {items.map((item) => {
          const percent = Math.round((item.value / total) * 100);

          return (
            <div className="grid gap-2 rounded-lg border border-[#edf1f5] bg-[#f8fafc] p-4" key={item.label}>
              <div className="flex justify-between gap-3">
                <Space>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-bold text-[#0f172a]">{item.label}</span>
                  <Typography.Text type="secondary">{item.value}</Typography.Text>
                </Space>
                <Typography.Text className="!text-[#0f172a]" strong>
                  {percent}%
                </Typography.Text>
              </div>
              <Progress percent={percent} strokeColor={item.color} showInfo={false} />
            </div>
          );
        })}
      </div>
    </>
  );
}
