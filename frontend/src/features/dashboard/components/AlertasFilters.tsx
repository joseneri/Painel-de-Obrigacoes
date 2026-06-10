import { Select } from "antd";
import {
  filterFieldClassName,
  filterLabelClassName,
  filterPanelClassName,
  filterSelectClassName
} from "../../../shared/ui/styles";
import { classNames } from "../../../shared/utils/classNames";

interface AlertasOption {
  value: string;
  label: string;
}

interface AlertasFiltersProps {
  empresaId?: string;
  tipoKey?: string;
  empresaOptions: AlertasOption[];
  tipoOptions: AlertasOption[];
  onEmpresaChange: (empresaId?: string) => void;
  onTipoChange: (tipoKey?: string) => void;
}

export function AlertasFilters({
  empresaId,
  tipoKey,
  empresaOptions,
  tipoOptions,
  onEmpresaChange,
  onTipoChange
}: AlertasFiltersProps) {
  return (
    <div
      className={classNames(
        filterPanelClassName,
        "grid-cols-[minmax(420px,1.7fr)_minmax(260px,0.9fr)] max-[900px]:grid-cols-1"
      )}
    >
      <div className={filterFieldClassName}>
        <span className={filterLabelClassName}>Empresa</span>
        <Select
          allowClear
          showSearch
          aria-label="Filtrar alertas por empresa"
          className={filterSelectClassName}
          placeholder="Todas as empresas"
          value={empresaId}
          optionFilterProp="label"
          options={empresaOptions}
          onChange={(value?: string) => onEmpresaChange(value)}
        />
      </div>

      <div className={filterFieldClassName}>
        <span className={filterLabelClassName}>Obrigação</span>
        <Select
          allowClear
          showSearch
          aria-label="Filtrar alertas por obrigação"
          className={filterSelectClassName}
          placeholder="Todas"
          value={tipoKey}
          optionFilterProp="label"
          options={tipoOptions}
          onChange={(value?: string) => onTipoChange(value)}
        />
      </div>
    </div>
  );
}
