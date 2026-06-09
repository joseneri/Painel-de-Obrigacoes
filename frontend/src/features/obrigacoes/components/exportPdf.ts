import type { ObrigacaoDto } from "../../../api/types";
import { labelStatus, labelTipo } from "../../../shared/utils/domain";
import { formatCompetencia, formatDate, urgencyText } from "../../../shared/utils/formatters";

const pageWidth = 842;
const pageHeight = 595;
const marginX = 36;
const firstRowY = 480;
const rowHeight = 16;
const rowsPerPage = 25;

const columns = [
  { title: "Obrigacao", x: marginX, chars: 18 },
  { title: "Empresa", x: 155, chars: 26 },
  { title: "Competencia", x: 335, chars: 12 },
  { title: "Vencimento", x: 435, chars: 12 },
  { title: "Status", x: 535, chars: 12 },
  { title: "Urgencia", x: 625, chars: 24 }
];

export function exportObrigacoesPdf(rows: ObrigacaoDto[]) {
  const chunks = chunkRows(rows);
  const streams = chunks.map((pageRows, index) => drawPage(pageRows, index + 1, chunks.length, rows.length));
  const blob = new Blob([buildPdf(streams)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "calendario-obrigacoes.pdf";
  anchor.click();
  URL.revokeObjectURL(url);
}

function chunkRows(rows: ObrigacaoDto[]) {
  const chunks: ObrigacaoDto[][] = [];

  for (let index = 0; index < rows.length; index += rowsPerPage) {
    chunks.push(rows.slice(index, index + rowsPerPage));
  }

  return chunks.length ? chunks : [[]];
}

function drawPage(rows: ObrigacaoDto[], page: number, totalPages: number, totalRows: number) {
  const commands: string[] = [];
  const generatedAt = new Intl.DateTimeFormat("pt-BR").format(new Date());

  text(commands, "Painel de Obrigacoes Acessorias", marginX, 548, 16, true);
  text(commands, `Calendario de Obrigacoes - ${totalRows} registro(s)`, marginX, 526, 11);
  text(commands, `Gerado em ${generatedAt} | Pagina ${page}/${totalPages}`, marginX, 510, 9);

  for (const column of columns) {
    text(commands, column.title, column.x, firstRowY, 9, true);
  }

  rows.forEach((row, index) => {
    const y = firstRowY - 20 - index * rowHeight;
    const cells = [
      labelTipo(row.tipo),
      row.empresaRazaoSocial,
      formatCompetencia(row.competencia, row.ano, row.mes),
      formatDate(row.dataVencimento),
      labelStatus(row.status),
      urgencyText(row.diasParaVencer)
    ];

    cells.forEach((value, cellIndex) => {
      const column = columns[cellIndex];
      text(commands, fit(value, column.chars), column.x, y, 8);
    });
  });

  return commands.join("\n");
}

function text(commands: string[], value: string, x: number, y: number, size: number, bold = false) {
  commands.push(`BT /F${bold ? 2 : 1} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(value)}) Tj ET`);
}

function fit(value: string, chars: number) {
  const safe = safeText(value);
  return safe.length > chars ? `${safe.slice(0, Math.max(1, chars - 3))}...` : safe;
}

function escapePdfText(value: string) {
  return safeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function safeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function buildPdf(streams: string[]) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  ];
  const pageIds: number[] = [];

  for (const stream of streams) {
    const streamId = pushObject(objects, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageId = pushObject(
      objects,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${streamId} 0 R >>`
    );
    pageIds.push(pageId);
  }

  objects[1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  return serializePdf(objects);
}

function pushObject(objects: string[], content: string) {
  objects.push(content);
  return objects.length;
}

function serializePdf(objects: string[]) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((content, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${content}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}
