import { Button, DatePicker } from "antd";
import { CalendarOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";

interface CompetenciaNavigatorProps {
  selectedMonth: Dayjs;
  todayLabel: string;
  onMonthChange: (value: Dayjs | null) => void;
  onMonthOffset: (months: number) => void;
  onToday: () => void;
}

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

export function CompetenciaNavigator({
  selectedMonth,
  todayLabel,
  onMonthChange,
  onMonthOffset,
  onToday
}: CompetenciaNavigatorProps) {
  const monthLabel = `${monthNames[selectedMonth.month()]} ${selectedMonth.year()}`;

  return (
    <div className="competencia-navigator">
      <div className="competencia-navigator__main">
        <Button
          aria-label="Mes anterior"
          className="competencia-navigator__step"
          icon={<LeftOutlined />}
          onClick={() => onMonthOffset(-1)}
        />

        <div className="competencia-navigator__period">
          <span>Mes selecionado</span>
          <strong>{monthLabel}</strong>
        </div>

        <Button
          aria-label="Proximo mes"
          className="competencia-navigator__step"
          icon={<RightOutlined />}
          onClick={() => onMonthOffset(1)}
        />
      </div>

      <div className="competencia-navigator__controls">
        <Button
          type="primary"
          className="competencia-navigator__today"
          icon={<CalendarOutlined />}
          onClick={onToday}
        >
          Hoje {todayLabel}
        </Button>

        <DatePicker
          picker="month"
          allowClear={false}
          className="competencia-navigator__picker"
          value={selectedMonth}
          format="MM/YYYY"
          onChange={onMonthChange}
        />
      </div>
    </div>
  );
}
