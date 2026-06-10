import { classNames } from "../utils/classNames";
import { tablePaginationSizeClassName } from "../utils/pagination";

export type UiTone = "info" | "danger" | "warning" | "success" | "neutral";

export const pageShellClassName = "grid gap-5";

export const pageCardClassName =
  "min-w-0 max-w-full overflow-hidden rounded-lg border border-[#dbe5ef] bg-white p-0";

export const pageHeaderClassName = classNames(
  "relative flex items-start justify-between gap-5 border-b border-[#edf1f5] bg-white px-8 pb-6 pt-7",
  "before:absolute before:inset-y-0 before:left-0 before:w-[5px] before:bg-[#1677ff] before:content-['']",
  "max-[720px]:flex-col max-[720px]:items-stretch max-[720px]:px-4"
);

export const pageTitleClassName =
  "!mb-2 !mt-0 !text-[30px] !font-extrabold !leading-[1.12] !tracking-normal !text-[#0f172a] max-[720px]:!text-[25px]";

export const pageSubtitleClassName = "!text-[15px] !text-[#526173]";

export const panelClassName = classNames(
  "flex h-full min-w-0 flex-col rounded-lg border border-[#edf2f7] bg-white p-6",
  "shadow-[0_1px_2px_rgba(15,23,42,0.06)] max-[720px]:p-4"
);

export const metricPanelClassName = classNames(
  "grid grid-cols-3 gap-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 pb-[18px] pt-4",
  "max-[980px]:grid-cols-1 max-[720px]:px-4"
);

export const dashboardMetricPanelClassName = classNames(
  "grid grid-cols-2 gap-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] px-6 pb-[18px] pt-4",
  "max-[980px]:grid-cols-1 max-[720px]:px-4"
);

export const metricToneClassNames = {
  info: {
    accent: "border-l-[#1677ff]",
    icon: "bg-[#e6f1fb] text-[#1677ff]",
    value: "text-[#0f172a]"
  },
  danger: {
    accent: "border-l-[#e11d48]",
    icon: "bg-[#fff1f2] text-[#be123c]",
    value: "text-[#be123c]"
  },
  warning: {
    accent: "border-l-[#f97316]",
    icon: "bg-[#fff7ed] text-[#c2410c]",
    value: "text-[#c2410c]"
  },
  success: {
    accent: "border-l-[#10b981]",
    icon: "bg-[#ecfdf5] text-[#047857]",
    value: "text-[#047857]"
  },
  neutral: {
    accent: "border-l-[#cbd5e1]",
    icon: "bg-[#f8fafc] text-[#64748b]",
    value: "text-[#334155]"
  }
} satisfies Record<UiTone, { accent: string; icon: string; value: string }>;

export const filterPanelClassName =
  "grid gap-3.5 rounded-lg border border-[#e5edf6] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] max-[720px]:p-3.5";

export const filterFieldClassName = "grid min-w-0 grid-rows-[18px_48px] items-start gap-[9px]";

export const filterLabelClassName =
  "text-xs font-extrabold leading-[18px] tracking-normal text-[#111827]";

export const filterSelectClassName = classNames(
  "!h-12 !min-h-12 !min-w-0 w-full !rounded-lg !border-[#e5e7eb] !bg-white !shadow-none",
  "[&_.ant-select-content]:!flex [&_.ant-select-content]:!h-12 [&_.ant-select-content]:!min-h-12",
  "[&_.ant-select-content]:!items-center [&_.ant-select-content]:!rounded-lg",
  "[&_.ant-select-content]:!border [&_.ant-select-content]:!border-[#e5e7eb]",
  "[&_.ant-select-content]:!bg-white [&_.ant-select-content]:!px-3",
  "[&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!rounded-lg",
  "[&_.ant-select-selector]:!border-[#e5e7eb] [&_.ant-select-selector]:!bg-white",
  "[&_.ant-select-placeholder]:!font-semibold [&_.ant-select-placeholder]:!text-[#667085]",
  "[&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#0f172a]",
  "[&_.ant-select-suffix]:!text-[#98a2b3]"
);

export const filterInputClassName = classNames(
  "h-12 min-w-0 rounded-lg border-[#e5e7eb] bg-white font-semibold text-[#0f172a]",
  "shadow-none placeholder:font-semibold placeholder:text-[#667085]",
  "[&_.ant-input-prefix]:text-[#64748b]"
);

export const ghostActionButtonClassName =
  "h-9 min-w-0 justify-center rounded-lg border-[#d1d5db] bg-white px-2 text-xs font-semibold text-[#334155]";

export const operationalTableClassName = classNames(
  "min-w-0 overflow-hidden rounded-lg border border-[#e5edf5] bg-white px-6 pb-[18px] pt-0",
  "shadow-[0_1px_2px_rgba(15,23,42,0.05)] max-[720px]:px-3",
  "[&_.ant-table-thead>tr>th]:!bg-[#f8fafc] [&_.ant-table-thead>tr>th]:!text-left",
  "[&_.ant-table-thead>tr>th]:text-[13px]",
  "[&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:tracking-normal",
  "[&_.ant-table-thead>tr>th]:text-[#64748b]",
  "[&_.ant-table-tbody>tr>td]:!py-3 [&_.ant-table-tbody>tr>td]:!text-left",
  "[&_.ant-table-tbody>tr>td]:align-middle [&_.ant-table-tbody>tr>td]:text-[15px]",
  "[&_.ant-table-tbody>tr.operational-row-odd>td]:bg-[#fbfdff]",
  "[&_.ant-table-tbody>tr:hover>td]:!bg-[#f8fafc]",
  "[&_.ant-table-pagination.ant-pagination]:mx-0 [&_.ant-table-pagination.ant-pagination]:mb-1",
  "[&_.ant-table-pagination.ant-pagination]:mt-4 [&_.ant-table-pagination.ant-pagination]:flex",
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
  "[&_.ant-pagination-item-active_a]:font-extrabold [&_.ant-pagination-item-active_a]:!text-white",
  tablePaginationSizeClassName
);

export const badgeBaseClassName =
  "inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3 text-[14px] font-semibold";

export const fixedBadgeClassName = `${badgeBaseClassName} w-[150px] justify-center`;

export const statusBadgeClassNames = {
  pendente: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  entregue: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  atrasada: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
  "nao-aplicavel": "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
} as const;

export const urgencyBadgeClassNames = {
  ok: "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]",
  atencao: "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]",
  urgente: "border-[#fecdd3] bg-[#fff1f2] text-[#be123c]",
  concluida: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  neutra: "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
} as const;

export const primaryActionButtonClassName =
  "!h-9 !min-w-[112px] !rounded-md !border-[#2563eb] !bg-[#2563eb] !text-[14px] !font-semibold hover:!border-[#1d4ed8] hover:!bg-[#1d4ed8]";

export const completedActionButtonClassName =
  "!h-9 !min-w-[112px] !rounded-md !border-[#a7f3d0] !bg-white !text-[14px] !font-semibold !text-[#047857] hover:!bg-[#ecfdf5]";
