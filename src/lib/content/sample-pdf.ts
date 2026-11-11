// Génère un petit PDF d'exemple (1 page, texte simple) pour tester le circuit des cours
// tant que les vrais PDF des modules ne sont pas disponibles.

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export function makeSamplePdf(title: string, lines: string[]): Buffer {
  const content = [
    "BT",
    "/F1 22 Tf",
    "60 760 Td",
    `(${esc(title)}) Tj`,
    "/F1 12 Tf",
    "0 -36 Td",
    ...lines.flatMap((l) => [`(${esc(l)}) Tj`, "0 -20 Td"]),
    "ET",
    "0.82 0.86 0.92 RG 4 w 50 40 495 760 re S",
  ].join("\n");
  const contentBytes = Buffer.from(content, "latin1");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${contentBytes.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
  ];
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, "latin1");
}
