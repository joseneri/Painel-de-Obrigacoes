import { classNames } from "./classNames";

export const pageSizeOptions = [8, 10, 15, 20];

export const pageSizeChangerProps = {
  className: "!min-w-[118px]",
  showSearch: false,
  classNames: {
    popup: {
      root: classNames(
        "!rounded-lg !border-[#dbe7f3] !p-1 !shadow-[0_12px_30px_rgba(15,23,42,0.14)]",
        "[&_.ant-select-item]:!rounded-md [&_.ant-select-item]:!font-semibold",
        "[&_.ant-select-item-option-selected]:!bg-[#eff6ff]",
        "[&_.ant-select-item-option-selected]:!text-[#1d4ed8]"
      )
    }
  }
};

export const tablePaginationSizeClassName = classNames(
  "[&_.ant-pagination-options]:!ms-2 [&_.ant-pagination-options]:h-[38px]",
  "[&_.ant-pagination-options-size-changer]:!h-[38px]",
  "[&_.ant-pagination-options-size-changer]:!min-w-[118px]",
  "[&_.ant-pagination-options-size-changer_.ant-select-selector]:!h-[38px]",
  "[&_.ant-pagination-options-size-changer_.ant-select-selector]:!rounded-[10px]",
  "[&_.ant-pagination-options-size-changer_.ant-select-selector]:!border-[#cbd5e1]",
  "[&_.ant-pagination-options-size-changer_.ant-select-selector]:!bg-white",
  "[&_.ant-pagination-options-size-changer_.ant-select-selector]:!shadow-[0_1px_2px_rgba(15,23,42,0.06)]",
  "[&_.ant-pagination-options-size-changer_.ant-select-selection-item]:!leading-9",
  "[&_.ant-pagination-options-size-changer_.ant-select-selection-item]:!font-semibold",
  "[&_.ant-pagination-options-size-changer_.ant-select-selection-item]:!text-[#334155]",
  "[&_.ant-pagination-options-size-changer_.ant-select-arrow]:!text-[#2563eb]"
);
