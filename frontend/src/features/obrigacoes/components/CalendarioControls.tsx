import { useEffect, useState } from "react";
import { Button, DatePicker, Select } from "antd";
import { CalendarOutlined, DownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import {
  filterFieldClassName,
  filterLabelClassName,
  filterPanelClassName,
  filterSelectClassName,
  ghostActionButtonClassName
} from "../../../shared/ui/styles";

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

const filterRowClassName =
  "grid grid-cols-[264px_minmax(220px,1fr)_200px_144px] items-start gap-3.5 max-[1040px]:grid-cols-[minmax(190px,0.85fr)_minmax(220px,1fr)] max-[720px]:grid-cols-1";

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
  onEmpresaChange,
  onStatusChange,
  onExportCsv,
  onExportPdf
}: CalendarioControlsProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMode, setCalendarMode] = useState<CalendarPanelMode>("month");
  const [selectedDate, setSelectedDate] = useState(() => defaultDateForMonth(selectedMonth, today));
  const [pickerValue, setPickerValue] = useState(selectedDate);

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
    <div className="border-b border-[#edf1f5] bg-[#f8fafc] px-6 pb-[22px] pt-5 max-[720px]:p-4">
      <div className={filterPanelClassName}>
        <div className={filterRowClassName}>
          <div className={filterFieldClassName}>
            <span className={filterLabelClassName}>Competência</span>
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

          <div className={filterFieldClassName}>
            <span className={filterLabelClassName}>Empresas</span>
            <Select
              allowClear
              showSearch
              className={filterSelectClassName}
              placeholder="Todas as empresas"
              value={empresaId}
              loading={empresasLoading}
              optionFilterProp="label"
              options={empresaOptions}
              onChange={(value?: string) => onEmpresaChange(value)}
            />
          </div>

          <div className={filterFieldClassName}>
            <span className={filterLabelClassName}>Status</span>
            <Select
              allowClear
              className={filterSelectClassName}
              placeholder="Todos os status"
              value={status}
              options={statusOptions}
              onChange={(value?: number) => onStatusChange(value)}
            />
          </div>

          <div className={filterFieldClassName}>
            <span className={filterLabelClassName}>Exportar</span>
            <div className="grid h-12 w-full grid-cols-[64px_64px] items-center gap-2 max-[720px]:h-auto max-[720px]:grid-cols-1">
              <Button className={ghostActionButtonClassName} icon={<FilePdfOutlined />} disabled={!canExport} onClick={onExportPdf}>
                PDF
              </Button>
              <Button className={ghostActionButtonClassName} icon={<DownloadOutlined />} disabled={!canExport} onClick={onExportCsv}>
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
