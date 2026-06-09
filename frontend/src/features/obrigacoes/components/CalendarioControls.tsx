import { useEffect, useState } from "react";
import { Button, DatePicker, Select } from "antd";
import { CalendarOutlined, CloseCircleOutlined, DownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import "./calendario-controls.css";

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
}

const monthNames = [
  "janeiro",
  "fevereiro",
  "marco",
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
  onExportCsv
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
    <div className="calendario-controls">
      <div className="calendario-filter-panel">
        <div className="calendario-filter-field">
          <span>Competencia</span>
          <DatePicker
            allowClear={false}
            className="calendario-date-picker"
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

        <div className="calendario-filter-field calendario-filter-field--empresa">
          <span>Empresa</span>
          <Select
            allowClear
            showSearch
            className="calendario-filter calendario-filter--empresa"
            placeholder="Todas as empresas"
            value={empresaId}
            loading={empresasLoading}
            optionFilterProp="label"
            options={empresaOptions}
            onChange={(value?: string) => onEmpresaChange(value)}
          />
        </div>

        <div className="calendario-filter-field calendario-filter-field--status">
          <span>Status</span>
          <Select
            allowClear
            className="calendario-filter calendario-filter--status"
            placeholder="Todos os status"
            value={status}
            options={statusOptions}
            onChange={(value?: number) => onStatusChange(value)}
          />
        </div>

        <div className="calendario-filter-field calendario-filter-field--actions">
          <span>Acoes</span>
          <div className="calendario-actions">
            <Button icon={<CloseCircleOutlined />} onClick={onReset}>
              Limpar
            </Button>
            <Button icon={<FilePdfOutlined />}>PDF</Button>
            <Button icon={<DownloadOutlined />} disabled={!canExport} onClick={onExportCsv}>
              CSV
            </Button>
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
