import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CalendarioPage, type CalendarioFilterState } from "../features/obrigacoes/CalendarioPage";
import { StatusObrigacao } from "../shared/utils/domain";

interface CalendarioSearchState {
  ano?: number;
  mes?: number;
  empresaId?: string;
  status?: number;
}

export const Route = createFileRoute("/calendario")({
  validateSearch: validateCalendarioSearch,
  component: CalendarioRoute
});

function CalendarioRoute() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/calendario" });
  const filters = withDefaultCalendarioSearch(search);

  function handleFiltersChange(nextFilters: Partial<CalendarioFilterState>) {
    navigate({
      search: (previous) => normalizeCalendarioSearch({ ...withDefaultCalendarioSearch(previous), ...nextFilters })
    });
  }

  return <CalendarioPage filters={filters} onFiltersChange={handleFiltersChange} />;
}

function validateCalendarioSearch(search: Record<string, unknown>): CalendarioSearchState {
  return {
    ano: parseOptionalYear(search.ano),
    mes: parseOptionalMonth(search.mes),
    empresaId: parseOptionalString(search.empresaId),
    status: parseStatus(search.status)
  };
}

function withDefaultCalendarioSearch(search: CalendarioSearchState): CalendarioFilterState {
  const now = new Date();

  return {
    ano: search.ano ?? now.getFullYear(),
    mes: search.mes ?? now.getMonth() + 1,
    empresaId: parseOptionalString(search.empresaId),
    status: parseStatus(search.status)
  };
}

function normalizeCalendarioSearch(search: CalendarioFilterState): CalendarioSearchState {
  return {
    ano: parseOptionalYear(search.ano),
    mes: parseOptionalMonth(search.mes),
    empresaId: parseOptionalString(search.empresaId),
    status: parseStatus(search.status)
  };
}

function parseOptionalYear(value: unknown) {
  const year = Number(value);
  return Number.isInteger(year) && year >= 2000 && year <= 2100 ? year : undefined;
}

function parseOptionalMonth(value: unknown) {
  const month = Number(value);
  return Number.isInteger(month) && month >= 1 && month <= 12 ? month : undefined;
}

function parseOptionalString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseStatus(value: unknown) {
  const status = Number(value);
  const validStatuses = new Set<number>(Object.values(StatusObrigacao));
  return validStatuses.has(status) ? status : undefined;
}
