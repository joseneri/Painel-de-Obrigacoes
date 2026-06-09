import type { EnumValue } from "../../api/types";

export const StatusObrigacao = {
  Pendente: 1,
  Atrasada: 2,
  Entregue: 3,
  NaoAplicavel: 4
} as const;

export const RegimeTributario = {
  SimplesNacional: 1,
  LucroPresumido: 2,
  LucroReal: 3,
  ImuneIsento: 4
} as const;

export const statusOptions = [
  { value: StatusObrigacao.Pendente, label: "Pendente" },
  { value: StatusObrigacao.Atrasada, label: "Atrasada" },
  { value: StatusObrigacao.Entregue, label: "Entregue" },
  { value: StatusObrigacao.NaoAplicavel, label: "Não aplicável" }
];

export const regimeOptions = [
  { value: RegimeTributario.SimplesNacional, label: "Simples Nacional" },
  { value: RegimeTributario.LucroPresumido, label: "Lucro Presumido" },
  { value: RegimeTributario.LucroReal, label: "Lucro Real" },
  { value: RegimeTributario.ImuneIsento, label: "Imunidade / Isenção" }
];

const tipoLabels: Record<number, string> = {
  1: "DAS",
  2: "DEFIS",
  3: "DCTF",
  4: "EFD-ICMS/IPI",
  5: "EFD Contribuições",
  6: "EFD-Reinf",
  7: "SPED ECD",
  8: "SPED ECF",
  9: "eSocial",
  10: "DIRF",
  11: "RAIS"
};

const statusLabels: Record<number, string> = {
  1: "Pendente",
  2: "Atrasada",
  3: "Entregue",
  4: "Não aplicável"
};

const periodicidadeLabels: Record<number, string> = {
  1: "Mensal",
  2: "Anual"
};

const regimeLabels: Record<number, string> = {
  1: "Simples Nacional",
  2: "Lucro Presumido",
  3: "Lucro Real",
  4: "Imunidade / Isenção"
};

const stringLabels: Record<string, string> = {
  EFD_ICMS_IPI: "EFD-ICMS/IPI",
  EFD_Contribuicoes: "EFD Contribuições",
  EFD_Reinf: "EFD-Reinf",
  SPED_ECD: "SPED ECD",
  SPED_ECF: "SPED ECF",
  NaoAplicavel: "Não aplicável",
  ImuneIsento: "Imunidade / Isenção",
  SimplesNacional: "Simples Nacional",
  LucroPresumido: "Lucro Presumido",
  LucroReal: "Lucro Real"
};

export function labelTipo(value: EnumValue) {
  return resolveEnumLabel(value, tipoLabels);
}

export function labelStatus(value: EnumValue) {
  return resolveEnumLabel(value, statusLabels);
}

export function labelPeriodicidade(value: EnumValue) {
  return resolveEnumLabel(value, periodicidadeLabels);
}

export function labelRegime(value: EnumValue) {
  return resolveEnumLabel(value, regimeLabels);
}

export function normalizeRegime(value: EnumValue) {
  if (typeof value === "number") {
    return value;
  }

  const match = Object.entries(regimeLabels).find(([, label]) => label === stringLabels[value] || label === value);
  return match ? Number(match[0]) : Number(value);
}

export function normalizeStatus(value: EnumValue) {
  if (typeof value === "number") {
    return value;
  }

  const match = Object.entries(statusLabels).find(([, label]) => label === stringLabels[value] || label === value);
  return match ? Number(match[0]) : Number(value);
}

export function statusColor(value: EnumValue) {
  const status = normalizeStatus(value);

  if (status === StatusObrigacao.Entregue) {
    return "success";
  }

  if (status === StatusObrigacao.Atrasada) {
    return "error";
  }

  if (status === StatusObrigacao.NaoAplicavel) {
    return "default";
  }

  return "warning";
}

function resolveEnumLabel(value: EnumValue, numericLabels: Record<number, string>) {
  if (typeof value === "number") {
    return numericLabels[value] ?? String(value);
  }

  const numberValue = Number(value);
  if (!Number.isNaN(numberValue) && numericLabels[numberValue]) {
    return numericLabels[numberValue];
  }

  return stringLabels[value] ?? value;
}
