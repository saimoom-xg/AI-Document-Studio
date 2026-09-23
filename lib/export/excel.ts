import * as XLSX from 'xlsx';
import type { NormalizedDocumentData, DocumentItem, ExpenseItem, CvExperience, CvEducation } from '@/lib/documents/types';
import { definitionFor } from '@/lib/documents/registry';

export function createDocumentWorkbook(document: NormalizedDocumentData) {
  const workbook = XLSX.utils.book_new();
  const def = definitionFor(document.type);
  const d = document.data;

  // 1. General Summary Sheet
  const summaryRows: Array<{ Field: string; Value: string }> = [];
  summaryRows.push({ Field: 'Document Type', Value: def.label });
  summaryRows.push({ Field: 'File Source', Value: document.sourceFile.name });

  Object.entries(d).forEach(([key, val]) => {
    if (['items', 'experience', 'education', 'expenses', 'sections', 'extractedText'].includes(key)) return;
    summaryRows.push({
      Field: key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
      Value: Array.isArray(val) ? val.join(', ') : String(val ?? ''),
    });
  });

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // 2. Line Items Sheet (for Invoices, Receipts, Quotes, POs)
  if (Array.isArray(d.items) && d.items.length > 0) {
    const items = d.items as DocumentItem[];
    const itemRows = items.map((it, idx) => ({
      '#': idx + 1,
      Description: it.description || '',
      Quantity: it.quantity || 1,
      'Unit Price': it.unitPrice || 0,
      Total: it.total ?? ((it.quantity || 1) * (it.unitPrice || 0)),
    }));
    const itemsSheet = XLSX.utils.json_to_sheet(itemRows);
    XLSX.utils.book_append_sheet(workbook, itemsSheet, 'Line Items');
  }

  // 3. Expenses Sheet
  if (Array.isArray(d.expenses) && d.expenses.length > 0) {
    const expenses = d.expenses as ExpenseItem[];
    const expenseRows = expenses.map((ex, idx) => ({
      '#': idx + 1,
      Date: ex.date || '',
      Category: ex.category || '',
      Description: ex.description || '',
      Amount: ex.amount || 0,
    }));
    const expensesSheet = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(workbook, expensesSheet, 'Expenses');
  }

  // 4. Experience & Education (for CV)
  if (Array.isArray(d.experience) && d.experience.length > 0) {
    const exps = d.experience as CvExperience[];
    const expRows = exps.map((e) => ({
      Role: e.role,
      Company: e.company,
      Period: e.period,
      Location: e.location || '',
      Description: e.description,
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expRows), 'Experience');
  }

  if (Array.isArray(d.education) && d.education.length > 0) {
    const edus = d.education as CvEducation[];
    const eduRows = edus.map((e) => ({
      Degree: e.degree,
      Institution: e.institution,
      Period: e.period,
      Location: e.location || '',
      Details: e.details || '',
    }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(eduRows), 'Education');
  }

  return workbook;
}

export function downloadDocumentExcel(document: NormalizedDocumentData, fileName: string) {
  const workbook = createDocumentWorkbook(document);
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function downloadDocumentCsv(document: NormalizedDocumentData, fileName: string) {
  const d = document.data;
  // If tabular items exist, output the tabular items as CSV
  if (Array.isArray(d.items) && d.items.length > 0) {
    const items = d.items as DocumentItem[];
    const rows = items.map((it, idx) => ({
      'Item No': idx + 1,
      Description: it.description,
      Quantity: it.quantity,
      'Unit Price': it.unitPrice,
      Total: it.total ?? (it.quantity * it.unitPrice),
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    triggerDownload(csv, `${fileName}.csv`, 'text/csv;charset=utf-8;');
    return;
  }

  if (Array.isArray(d.expenses) && d.expenses.length > 0) {
    const expenses = d.expenses as ExpenseItem[];
    const rows = expenses.map((ex, idx) => ({
      '#': idx + 1,
      Date: ex.date,
      Category: ex.category,
      Description: ex.description,
      Amount: ex.amount,
    }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(sheet);
    triggerDownload(csv, `${fileName}.csv`, 'text/csv;charset=utf-8;');
    return;
  }

  // Otherwise, output key-value CSV
  const rows: Array<{ Field: string; Value: string }> = [];
  Object.entries(d).forEach(([key, val]) => {
    if (['extractedText'].includes(key) || typeof val === 'object') return;
    rows.push({ Field: key, Value: String(val) });
  });
  const sheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(sheet);
  triggerDownload(csv, `${fileName}.csv`, 'text/csv;charset=utf-8;');
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
