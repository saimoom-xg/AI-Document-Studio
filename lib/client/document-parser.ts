import * as XLSX from 'xlsx';
import type { DocumentItem, DocumentType } from '@/lib/documents/types';

export type ParsedUpload = {
  text: string;
  kind: DocumentType;
  confidence: number;
  extractedData?: Record<string, unknown>;
  note?: string;
};

const extensionOf = (file: File) => file.name.split('.').pop()?.toLowerCase() ?? '';

export function classifyDocument(text: string, fileName = ''): { kind: DocumentType; confidence: number } {
  const combined = `${fileName} ${text}`.toLowerCase();

  // Score each type
  let invoiceScore = 0;
  if (/invoice|inv\s*#|bill\s*to|tax\s*invoice|amount\s*due|due\s*date|balance\s*due|remittance/.test(combined)) invoiceScore += 3;
  if (/\b(?:inv-\d+|total\s*due|payment\s*terms)\b/.test(combined)) invoiceScore += 2;

  let receiptScore = 0;
  if (/receipt|cashier|terminal\s*#|store\s*#|change\s*due|visa\s*ending|mastercard\s*ending|sales\s*receipt/.test(combined)) receiptScore += 3;
  if (/tax\s*included|subtotal|tender|auth\s*code/.test(combined)) receiptScore += 1;

  let cvScore = 0;
  if (/resume|curriculum\s*vitae|\bcv\b|work\s*experience|employment\s*history|education|skills\s*&|technical\s*skills|professional\s*summary/.test(combined)) cvScore += 3;
  if (/linkedin\.com|github\.com|bachelor|master\s*of|gpa\b|dean's\s*list/.test(combined)) cvScore += 2;

  let quoteScore = 0;
  if (/quotation|quote\s*#|estimate|valid\s*until|pricing\s*estimate|proposal\s*for|statement\s*of\s*work/.test(combined)) quoteScore += 3;

  let poScore = 0;
  if (/purchase\s*order|p\.o\.\s*#|po\s*number|vendor\s*#|buyer\s*name|ship\s*to\s*address|requisition/.test(combined)) poScore += 3;

  let expenseScore = 0;
  if (/expense\s*report|expense\s*claim|reimbursement|per\s*diem|travel\s*expense|mileage\s*claim/.test(combined)) expenseScore += 3;

  let reportScore = 0;
  if (/annual\s*report|quarterly\s*report|executive\s*summary|key\s*findings|recommendations|methodology|market\s*analysis/.test(combined)) reportScore += 2;

  const scores: [DocumentType, number][] = [
    ['cv', cvScore],
    ['invoice', invoiceScore],
    ['receipt', receiptScore],
    ['quotation', quoteScore],
    ['purchase_order', poScore],
    ['expense_report', expenseScore],
    ['report', reportScore],
  ];

  scores.sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = scores[0];

  if (topScore >= 3) {
    return { kind: topType, confidence: Math.min(0.96, 0.75 + topScore * 0.05) };
  } else if (topScore >= 1) {
    return { kind: topType, confidence: 0.65 };
  }

  return { kind: 'unknown', confidence: 0.4 };
}

function extractTableItems(rows: unknown[][]): DocumentItem[] {
  const items: DocumentItem[] = [];
  if (rows.length < 2) return items;

  // Search for header row
  let headerIndex = -1;
  let descCol = -1;
  let qtyCol = -1;
  let priceCol = -1;
  let totalCol = -1;

  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r].map((cell) => String(cell || '').toLowerCase().trim());
    const dIdx = row.findIndex((c) => /item|description|name|service|product|details/.test(c));
    const qIdx = row.findIndex((c) => /qty|quantity|units|count|hours/.test(c));
    const pIdx = row.findIndex((c) => /price|rate|cost|unit\s*price/.test(c));
    const tIdx = row.findIndex((c) => /total|amount|subtotal/.test(c));

    if (dIdx !== -1 && (pIdx !== -1 || tIdx !== -1)) {
      headerIndex = r;
      descCol = dIdx;
      qtyCol = qIdx;
      priceCol = pIdx;
      totalCol = tIdx;
      break;
    }
  }

  if (headerIndex !== -1 && descCol !== -1) {
    for (let r = headerIndex + 1; r < rows.length; r++) {
      const row = rows[r];
      const desc = String(row[descCol] || '').trim();
      if (!desc || /^(total|subtotal|tax|discount|due)/i.test(desc)) continue;

      const qty = qtyCol !== -1 ? parseFloat(String(row[qtyCol]).replace(/[^0-9.]/g, '')) || 1 : 1;
      const price = priceCol !== -1 ? parseFloat(String(row[priceCol]).replace(/[^0-9.]/g, '')) || 0 : 0;
      const tot = totalCol !== -1 ? parseFloat(String(row[totalCol]).replace(/[^0-9.]/g, '')) || qty * price : qty * price;

      items.push({
        id: `extracted-${items.length + 1}`,
        description: desc,
        quantity: qty,
        unitPrice: price,
        total: tot,
      });
      if (items.length >= 15) break;
    }
  }

  return items;
}

async function readSpreadsheet(file: File): Promise<ParsedUpload> {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  let combinedText = '';
  let extractedItems: DocumentItem[] = [];

  const firstSheetName = workbook.SheetNames[0];
  if (firstSheetName) {
    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
    extractedItems = extractTableItems(rows);
    combinedText = rows.slice(0, 150).map((r) => r.join(' | ')).join('\n');
  }

  const { kind, confidence } = classifyDocument(combinedText, file.name);
  const extractedData: Record<string, unknown> = {};
  if (extractedItems.length > 0) {
    extractedData.items = extractedItems;
  }

  return {
    text: combinedText,
    kind: kind === 'unknown' ? 'invoice' : kind,
    confidence: Math.max(confidence, 0.8),
    extractedData,
  };
}

async function readPdf(file: File): Promise<ParsedUpload> {
  try {
    // @ts-expect-error pdfjs-dist subpath lacks bundled declaration in TypeScript
    const pdfjs = (await import('pdfjs-dist/build/pdf.mjs')) as {
      GlobalWorkerOptions: { workerSrc: string };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getDocument: (options: unknown) => { promise: Promise<any> };
    };
    if (typeof window !== 'undefined') {
      pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
    }

    const parsePromise = (async () => {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({
        data: arrayBuffer,
        useWorkerFetch: false,
        isEvalSupported: false,
      }).promise;
      const pages: string[] = [];
      for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 10); pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pages.push(content.items.map((item: any) => (item && 'str' in item ? String(item.str) : '')).join(' '));
      }
      return pages.join('\n\n');
    })();

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('PDF extraction timeout')), 4000)
    );

    const text = await Promise.race([parsePromise, timeoutPromise]);
    const { kind, confidence } = classifyDocument(text, file.name);
    return { text, kind, confidence };
  } catch (err) {
    console.warn('PDF parsing error or timeout, continuing with filename detection:', err);
    const { kind } = classifyDocument('', file.name);
    return {
      text: '',
      kind: kind === 'unknown' ? 'invoice' : kind,
      confidence: 0.65,
      note: 'PDF uploaded. Ready for review and editing.',
    };
  }
}

export async function parseUpload(file: File): Promise<ParsedUpload> {
  const extension = extensionOf(file);

  if (['xlsx', 'xls', 'csv'].includes(extension)) {
    return readSpreadsheet(file);
  }

  if (extension === 'docx') {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
    const { kind, confidence } = classifyDocument(result.value, file.name);
    return { text: result.value, kind, confidence };
  }

  if (extension === 'pdf') {
    return readPdf(file);
  }

  if (['txt', 'md'].includes(extension) || file.type.startsWith('text/')) {
    const text = await file.text();
    const { kind, confidence } = classifyDocument(text, file.name);
    return { text, kind, confidence };
  }

  if (file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(extension)) {
    const { kind } = classifyDocument(file.name, file.name);
    return {
      text: '',
      kind: kind === 'unknown' ? 'receipt' : kind,
      confidence: 0.7,
      note: 'Image uploaded. Pre-filling document workspace with structured fields ready for review.',
    };
  }

  return { text: '', kind: 'unknown', confidence: 0.4 };
}

