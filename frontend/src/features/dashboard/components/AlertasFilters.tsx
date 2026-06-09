import { Button, Select } from "antd";

interface AlertasOption {
  value: string;
  label: string;
}

interface AlertasFiltersProps {
  empresaId?: string;
  tipoKey?: string;
  empresaOptions: AlertasOption[];
  tipoOptions: AlertasOption[];
  hasFilters: boolean;
  onEmpresaChange: (empresaId?: string) => void;
  onTipoChange: (tipoKey?: string) => void;
  onReset: () => void;
}

const fieldClassName = "grid min-w-0 grid-rows-[18px_44px] items-start gap-2";
const labelClassName = "text-xs font-extrabold leading-[18px] tracking-normal text-[#111827]";
const selectClassName =
  "!h-11 !min-h-11 w-full !rounded-lg !border-[#e5e7eb] !bg-white !shadow-none [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#e5e7eb] [&_.ant-select-selector]:!bg-white [&_.ant-select-placeholder]:!font-semibold [&_.ant-select-placeholder]:!text-[#667085] [&_.ant-select-selection-item]:!font-semibold [&_.ant-select-selection-item]:!text-[#0f172a] [&_.ant-select-suffix]:!text-[#98a2b3]";

export function AlertasFilters({
  empresaId,
  tipoKey,
  empresaOptions,
  tipoOptions,
  hasFilters,
  onEmpresaChange,
  onTipoChange,
  onReset
}: AlertasFiltersProps) {
  return (
    <div className="grid grid-cols-[minmax(220px,1fr)_minmax(180px,260px)_auto] items-end gap-3 rounded-lg border border-[#e5edf6] bg-[#f8fafc] p-4 max-[900px]:grid-cols-1">
      <div className={fieldClassName}>
        <span className={labelClassName}>Empresa</span>
        <Select
          allowClear
          showSearch
          aria-label="Filtrar alertas por empresa"
          className={selectClassName}
          placeholder="Todas as empresas"
          value={empresaId}
          optionFilterProp="label"
          options={empresaOptions}
          onChange={(value?: string) => onEmpresaChange(value)}
        />
      </div>

      <div className={fieldClassName}>
        <span className={labelClassName}>Obrigação</span>
        <Select
          allowClear
          showSearch
          aria-label="Filtrar alertas por obrigação"
          className={selectClassName}
          placeholder="Todas"
          value={tipoKey}
          optionFilterProp="label"
          options={tipoOptions}
          onChange={(value?: string) => onTipoChange(value)}
        />
      </div>

      <Button className="h-11 rounded-lg font-bold" disabled={!hasFilters} onClick={onReset}>
        Limpar filtros
      </Button>
    </div>
  );
}
