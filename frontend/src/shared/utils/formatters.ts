import dayjs from "dayjs";

export function formatDate(value?: string | null) {
  return value ? dayjs(value).format("DD/MM/YYYY") : "-";
}

export function formatCompetencia(value: string, ano?: number, mes?: number) {
  if (value) {
    return value;
  }

  if (ano && mes) {
    return `${String(mes).padStart(2, "0")}/${ano}`;
  }

  return "-";
}

export function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 14);

  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function urgencyText(days: number) {
  if (days < 0) {
    return `${Math.abs(days)} dia(s) em atraso`;
  }

  if (days === 0) {
    return "vence hoje";
  }

  return `${days} dia(s) para vencer`;
}
