import jsPDF from 'jspdf';

export function exportDocumentPdf(title: string, body: Record<string, unknown>) {
  const pdf = new jsPDF();
  pdf.setFontSize(18);
  pdf.text(title, 20, 20);
  pdf.setFontSize(11);
  let y = 40;
  Object.entries(body).forEach(([key, value]) => {
    pdf.text(`${key}: ${String(value)}`, 20, y);
    y += 12;
  });
  return Buffer.from(pdf.output('arraybuffer'));
}
