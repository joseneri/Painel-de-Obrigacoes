export type CalendarioModo = "competencia" | "vencimento";

export interface CalendarioFilterState {
  ano: number;
  mes: number;
  empresaId?: string;
  status?: number;
  modo: CalendarioModo;
}
