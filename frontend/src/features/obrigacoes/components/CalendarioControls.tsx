import { useEffect, useState } from "react";
import { Button, DatePicker, Select } from "antd";
import { CalendarOutlined, CloseCircleOutlined, DownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";

type CalendarPanelMode = "time" | "date" | "week" | "month" | "quarter" | "year" | "decade";

interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface CalendarioControlsProps {
  selectedMonth: Dayjs;
  today: Dayjs;
  empresaId?: string;
  status?: number;
  empresaOptions: SelectOption<string>[];
  statusOptions: SelectOption<number>[];
  empresasLoading: boolean;
  canExport: boolean;
  onMonthChange: (value: Dayjs | null) => void;
  onReset: () => void;
  onEmpresaChange: (empresaId?: string) => void;
  onStatusChange: (status?: number) => void;
  onExportCsv: () => void;
  onExportPdf: () => void;
}

const monthNames = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro"
];

const fieldClassName = "grid min-w-0 grid-rows-[18px_48px] items-start gap-[9px]";
const labelClassName = "text-xs font-extrabold leading-[18px] tracking-normal text-[#111827]";
const selectClassName =
  "!h-12 !min-h-12 !min-w-0 w-full !rounded-lg !border-[#e5e7eb] !bg-white !shadow-none [&_.ant-select-content]:!flex [&_.ant-select-content]:!h-12 [&_.ant-select-content]:!min-h-12 [&_.ant-select-content]:!items-center [&_.ant-select-content]:!rounded-lg [&_.ant-select-content]:!border [&_.ant-select-content]:!border-[#e5e7eb] [&_.ant-select-content]:!bg-white [&_.ant-select-content]:!px-3 [&_.ant-select-selector]:!h-12 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#e5e7eb] [&_.ant-select-selector]:!bg-white [&_.ant-select-placeholder]:!font-semibold [&_.ant-select-placeholder]:!text-[#667085] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#0f172a] [&_.ant-select-suffix]:!text-[#98a2b3]";
const actionButtonClassName = "h-9 min-w-0 justify-center rounded-lg px-2 text-xs";
const filterRowClassName =
  "grid grid-cols-[232px_minmax(180px,1fr)_184px_216px] items-start gap-3.5 max-[1040px]:grid-cols-[minmax(170px,0.8fr)_minmax(180px,1fr)] max-[720px]:grid-cols-1";

export function CalendarioControls({
  selectedMonth,
  today,
  empresaId,
  status,
  empresaOptions,
  statusOptions,
  empresasLoading,
  canExport,
  onMonthChange,
  onReset,
  onEmpresaChange,
  onStatusChange,
  onExportCsv,
  onExportPdf
}: CalendarioControlsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarPanelMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => defaultDateForMonth(selectedMonth, today));
  const [pickerValue, setPickerValue] = useState(selectedDate);
  const hasResetFilters = Boolean(empresaId) || status !== undefined;

  useEffect(() => {
    setSelectedDate((currentDate) =>
      currentDate.isSame(selectedMonth, "month") ? currentDate : defaultDateForMonth(selectedMonth, today)
    );
  }, [selectedMonth, today]);

  useEffect(() => {
    setPickerValue(selectedDate);
  }, [selectedDate]);

  function handleCalendarOpenChange(open: boolean) {
    setCalendarOpen(open);

    if (open) {
      setCalendarMode("month");
      setPickerValue(selectedDate);
    }
  }

  function handlePanelChange(value: Dayjs, mode: CalendarPanelMode) {
    setPickerValue(value);
    setCalendarMode(mode);
  }

  function handleDateChange(value: Dayjs | null) {
    if (value) {
      setSelectedDate(value);
      setCalendarOpen(false);
      setCalendarMode("month");
    }

    onMonthChange(value);
  }

  return (
    <div className="border-b border-[#edf1f5] bg-[#f8fafc] px-7 pb-[22px] pt-5 max-[720px]:p-4">
      <div className="grid gap-3.5 rounded-lg border border-[#e5edf6] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] max-[720px]:p-3.5">
        <div className={filterRowClassName}>
          <div className={fieldClassName}>
            <span className={labelClassName}>Competência</span>
            <DatePicker
              allowClear={false}
              className="h-12 min-h-12 !min-w-0 w-full border-[#e5e7eb] bg-white [&_.ant-picker-input>input]:cursor-pointer [&_.ant-picker-input>input]:text-center [&_.ant-picker-input>input]:text-sm [&_.ant-picker-input>input]:font-bold [&_.ant-picker-input>input]:text-[#0f172a]"
              open={calendarOpen}
              value={selectedDate}
              pickerValue={pickerValue}
              mode={calendarMode}
              format={() => formatDisplayDate(selectedDate)}
              suffixIcon={<CalendarOutlined />}
              onChange={handleDateChange}
              onOpenChange={handleCalendarOpenChange}
              onPanelChange={handlePanelChange}
              onPickerValueChange={(value) => setPickerValue(value)}
            />
          </div>

          <div className={fieldClassName}>
            <span className={labelClassName}>Empresas</span>
            <Select
              allowClear
              showSearch
              className={selectClassName}
              placeholder="Todas as empresas"
              value={empresaId}
              loading={empresasLoading}
              optionFilterProp="label"
              options={empresaOptions}
              onChange={(value?: string) => onEmpresaChange(value)}
            />
          </div>

          <div className={fieldClassName}>
            <span className={labelClassName}>Status</span>
            <Select
              allowClear
              className={selectClassName}
              placeholder="Todos os status"
              value={status}
              options={statusOptions}
              onChange={(value?: number) => onStatusChange(value)}
            />
          </div>

          <div className={fieldClassName}>
            <span className={labelClassName}>Ações</span>
            <div className="grid h-12 w-full grid-cols-[72px_64px_64px] items-center gap-2 max-[720px]:h-auto max-[720px]:grid-cols-1">
              <Button
                className={actionButtonClassName}
                disabled={!hasResetFilters}
                icon={<CloseCircleOutlined />}
                onClick={onReset}
              >
                Limpar
              </Button>
              <Button className={actionButtonClassName} icon={<FilePdfOutlined />} disabled={!canExport} onClick={onExportPdf}>
                PDF
              </Button>
              <Button className={actionButtonClassName} icon={<DownloadOutlined />} disabled={!canExport} onClick={onExportCsv}>
                CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function defaultDateForMonth(selectedMonth: Dayjs, today: Dayjs) {
  return selectedMonth.isSame(today, "month") ? today : selectedMonth;
}

function formatDisplayDate(value: Dayjs) {
  return `${value.format("DD")} ${monthNames[value.month()]} ${value.year()}`;
}
