import type { ReactNode } from "react";
import { Skeleton } from "antd";
import { classNames } from "../utils/classNames";
import { metricToneClassNames, type UiTone } from "./styles";

interface MetricTileProps {
  label: string;
  value?: number | string;
  loading?: boolean;
  icon: ReactNode;
  tone?: UiTone;
  selected?: boolean;
  onClick?: () => void;
}

export function MetricTile({
  label,
  value,
  loading = false,
  icon,
  tone = "info",
  selected = false,
  onClick
}: MetricTileProps) {
  const classes = metricToneClassNames[tone];
  const className = classNames(
    "flex min-h-[118px] min-w-0 items-center gap-4 rounded-lg border border-l bg-white px-6 py-[18px]",
    "text-left shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition max-[720px]:min-h-[104px]",
    classes.accent,
    selected ? "border-[#1677ff] ring-2 ring-[#dbeafe]" : "border-[#f1f5f9] hover:border-[#bfdbfe]"
  );
  const content = (
    <>
      <span className={`inline-grid h-12 w-12 flex-none place-items-center rounded-full text-[21px] ${classes.icon}`}>
        {icon}
      </span>
      <span className="min-w-0">
        {loading ? (
          <Skeleton.Input active className="!h-[34px] !w-20" size="small" />
        ) : (
          <strong className={`block text-[34px] leading-none ${classes.value}`}>{value ?? 0}</strong>
        )}
        <span className="mt-2 block text-[13px] font-bold uppercase text-[#667085]">{label}</span>
      </span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} aria-pressed={selected} onClick={onClick}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
