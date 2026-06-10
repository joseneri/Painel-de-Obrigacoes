export type EnumValue = number | string;

export interface DashboardDto {
  totalEmpresas: number;
  obrigacoesMes: number;
  pendentes: number;
  entregues: number;
  atrasadas: number;
}

export interface EmpresaDto {
  id: string;
  razaoSocial: string;
  cnpj: string;
  regimeTributario: EnumValue;
  criadaEm: string;
}

export interface ObrigacaoDto {
  id: string;
  empresaId: string;
  empresaRazaoSocial: string;
  tipo: EnumValue;
  ano: number;
  mes: number;
  competencia: string;
  dataVencimento: string;
  status: EnumValue;
  diasParaVencer: number;
  periodicidade: EnumValue;
  dataConclusao: string | null;
}

export interface AlertaDto {
  obrigacaoId: string;
  empresaId: string;
  empresaRazaoSocial: string;
  tipo: EnumValue;
  competencia: string;
  dataVencimento: string;
  status: EnumValue;
  diasParaVencer: number;
}

export interface EntregaDto {
  id: string;
  obrigacaoId: string;
  dataConclusao: string;
  observacao?: string | null;
}

export interface EntregaHistoricoDto {
  entregaId: string;
  obrigacaoId: string;
  tipo: EnumValue;
  competencia: string;
  dataVencimento: string;
  status: EnumValue;
  dataConclusao: string;
  observacao?: string | null;
}

export interface CreateEmpresaDto {
  razaoSocial: string;
  cnpj: string;
  regimeTributario: number;
}

export interface RegistrarEntregaDto {
  obrigacaoId: string;
  dataConclusao: string;
  observacao?: string | null;
}

export interface ObrigacoesFilters {
  empresaId?: string;
  ano?: number;
  mes?: number;
  status?: number;
  modo?: "competencia" | "vencimento";
}
