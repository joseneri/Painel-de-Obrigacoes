import type { ObrigacaoDto } from "../../../api/types";
import { labelPeriodicidade, labelStatus, labelTipo } from "../../../shared/utils/domain";
import { formatCompetencia, formatDate, urgencyText } from "../../../shared/utils/formatters";

export function exportObrigacoesCsv(rows: ObrigacaoDto[]) {
  const header = [
    "Empresa",
    "Obrigação",
    "Competência",
    "Vencimento",
    "Urgencia",
    "Periodicidade",
    "Status",
    "Conclusão"
  ];

  const body = rows.map((row) => [
    row.empresaRazaoSocial,
    labelTipo(row.tipo),
    formatCompetencia(row.competencia, row.ano, row.mes),
    formatDate(row.dataVencimento),
    urgencyText(row.diasParaVencer),
    labelPeriodicidade(row.periodicidade),
    labelStatus(row.status),
    formatDate(row.dataConclusao)
  ]);

  const csv = [header, ...body].map((line) => line.map(escapeCsv).join(";")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "calendario-obrigacoes.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}
