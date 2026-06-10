import { request } from "./http";
import type {
  AlertaDto,
  CreateEmpresaDto,
  DashboardDto,
  EmpresaDto,
  EntregaDto,
  EntregaHistoricoDto,
  ObrigacaoDto,
  ObrigacoesFilters,
  RegistrarEntregaDto
} from "./types";

export const api = {
  getDashboard: () => request<DashboardDto>("/api/obrigacoes/dashboard"),
  getAlertas: () => request<AlertaDto[]>("/api/obrigacoes/alertas"),
  getEmpresas: () => request<EmpresaDto[]>("/api/empresas"),
  getHistoricoEntregasEmpresa: (empresaId: string) =>
    request<EntregaHistoricoDto[]>(`/api/empresas/${empresaId}/entregas`),
  createEmpresa: (input: CreateEmpresaDto) =>
    request<EmpresaDto>("/api/empresas", { method: "POST", body: input }),
  deleteEmpresa: (id: string) => request<void>(`/api/empresas/${id}`, { method: "DELETE" }),
  getObrigacoes: (filters: ObrigacoesFilters) =>
    request<ObrigacaoDto[]>("/api/obrigacoes", { query: { ...filters } }),
  registrarEntrega: (input: RegistrarEntregaDto) =>
    request<EntregaDto>("/api/entregas", { method: "POST", body: input })
};
