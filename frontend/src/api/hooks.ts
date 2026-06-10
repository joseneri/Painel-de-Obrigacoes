import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { CreateEmpresaDto, ObrigacoesFilters, RegistrarEntregaDto } from "./types";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  alertas: ["alertas"] as const,
  empresas: ["empresas"] as const,
  historicoEntregas: (empresaId?: string) => ["empresas", empresaId, "entregas"] as const,
  obrigacoes: (filters: ObrigacoesFilters) => ["obrigacoes", filters] as const
};

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: api.getDashboard });
}

export function useAlertas() {
  return useQuery({ queryKey: queryKeys.alertas, queryFn: api.getAlertas });
}

export function useEmpresas() {
  return useQuery({ queryKey: queryKeys.empresas, queryFn: api.getEmpresas });
}

export function useHistoricoEntregasEmpresa(empresaId?: string) {
  return useQuery({
    queryKey: queryKeys.historicoEntregas(empresaId),
    queryFn: () => api.getHistoricoEntregasEmpresa(empresaId!),
    enabled: Boolean(empresaId)
  });
}

export function useObrigacoes(filters: ObrigacoesFilters) {
  return useQuery({
    queryKey: queryKeys.obrigacoes(filters),
    queryFn: () => api.getObrigacoes(filters)
  });
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmpresaDto) => api.createEmpresa(input),
    onSuccess: () => invalidateBusinessQueries(queryClient)
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteEmpresa(id),
    onSuccess: () => invalidateBusinessQueries(queryClient)
  });
}

export function useRegistrarEntrega() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegistrarEntregaDto) => api.registrarEntrega(input),
    onSuccess: () => invalidateBusinessQueries(queryClient)
  });
}

function invalidateBusinessQueries(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  void queryClient.invalidateQueries({ queryKey: queryKeys.alertas });
  void queryClient.invalidateQueries({ queryKey: queryKeys.empresas });
  void queryClient.invalidateQueries({ queryKey: ["obrigacoes"] });
}
