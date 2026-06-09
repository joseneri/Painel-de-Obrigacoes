import { Button, DatePicker, Segmented, Select, Space, Typography } from "antd";
import { CalendarOutlined, DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { EmpresaDto } from "../../../api/types";
import { labelRegime, statusOptions } from "../../../shared/utils/domain";
import type { CalendarioFilterState, CalendarioModo } from "../calendarioTypes";

interface CalendarioCommandBarProps {
  filters: CalendarioFilterState;
  selectedMonth: Dayjs;
  empresas: EmpresaDto[];
  empresasLoading: boolean;
  resultCount: number;
  onFiltersChange: (filters: Partial<CalendarioFilterState>) => void;
  onHojeClick: () => void;
  onRefresh: () => void;
  onExport: () => void;
}

export function CalendarioCommandBar({
  filters,
  selectedMonth,
  empresas,
  empresasLoading,
  resultCount,
  onFiltersChange,
  onHojeClick,
  onRefresh,
  onExport
}: CalendarioCommandBarProps) {
  const title = filters.modo === "vencimento" ? "Agenda de vencimentos" : "Origem por competencia";
  const subtitle =
    filters.modo === "vencimento"
      ? "Prazos reais do mes, status e urgencia calculados pela API."
      : "Obrigacoes geradas para a competencia fiscal selecionada.";

  return (
    <section className="panel calendar-command-panel">
      <div className="calendar-command-row">
        <div className="calendar-command-copy">
          <Typography.Title level={3}>{title}</Typography.Title>
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        </div>

        <Space wrap>
          <Button icon={<CalendarOutlined />} onClick={onHojeClick}>
            Hoje
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onRefresh}>
            Atualizar
          </Button>
          <Button icon={<DownloadOutlined />} disabled={resultCount === 0} onClick={onExport}>
            CSV
          </Button>
        </Space>
      </div>

      <div className="calendar-filters">
        <Segmented
          className="calendar-mode-toggle"
          value={filters.modo}
          onChange={(modo) => isModo(modo) && onFiltersChange({ modo })}
          options={[
            { label: "Vencimento", value: "vencimento" },
            { label: "Competencia", value: "competencia" }
          ]}
        />

        <Select
          allowClear
          showSearch
          placeholder="Empresa"
          value={filters.empresaId}
          loading={empresasLoading}
          onChange={(empresaId) => onFiltersChange({ empresaId })}
          optionFilterProp="label"
          options={empresas.map((empresa) => ({
            value: empresa.id,
            label: `${empresa.razaoSocial} - ${labelRegime(empresa.regimeTributario)}`
          }))}
        />

        <DatePicker
          picker="month"
          allowClear={false}
          value={selectedMonth}
          format="MM/YYYY"
          onChange={(value) => value && onFiltersChange({ ano: value.year(), mes: value.month() + 1 })}
        />

        <Select
          allowClear
          placeholder="Status"
          value={filters.status}
          onChange={(status) => onFiltersChange({ status })}
          options={statusOptions}
        />
      </div>
    </section>
  );
}

function isModo(value: unknown): value is CalendarioModo {
  return value === "competencia" || value === "vencimento";
}
