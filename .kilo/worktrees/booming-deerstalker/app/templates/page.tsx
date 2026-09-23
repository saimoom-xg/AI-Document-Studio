'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Download, FileSpreadsheet, FileText } from 'lucide-react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { InvoiceData, NormalizedDocumentData } from '@/lib/documents/types';

const fallback: NormalizedDocumentData = {
  id: 'demo-invoice', type: 'invoice', confidence: 0.96, sourceFile: { name: 'invoice.pdf', type: 'application/pdf' },
  data: { invoiceNumber: 'INV-1001', invoiceDate: '2026-09-23', dueDate: '2026-10-07', currency: 'USD', seller: { name: 'ABC Trading Ltd', email: '', address: '' }, customer: { name: 'Northwind Retail', email: '', address: '' }, items: [{ id: 'item-1', description: 'Product package', quantity: 10, unitPrice: 20, discount: 0, taxRate: 10 }], notes: '', terms: '' }, metadata: { createdAt: '', updatedAt: '' },
};
const templates = [
  { id: 'ledger', name: 'Ledger', description: 'Structured and confident for everyday billing.', tone: 'bg-slate-900', accent: 'text-blue-600' },
  { id: 'signal', name: 'Signal', description: 'A brighter layout for modern client work.', tone: 'bg-blue-600', accent: 'text-blue-600' },
  { id: 'paper', name: 'Paper', description: 'Quiet, editorial, and easy to print.', tone: 'bg-emerald-700', accent: 'text-emerald-700' },
];
const totalFor = (data: InvoiceData) => data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice * (1 + item.taxRate / 100), 0);

export default function TemplatesPage() {
  const [document, setDocument] = useState(fallback);
  const [selected, setSelected] = useState('ledger');
  const data = document.data as unknown as InvoiceData;
  const total = useMemo(() => totalFor(data), [data]);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id');
    const stored = id ? window.sessionStorage.getItem(`document:${id}`) : window.sessionStorage.getItem('document:demo-invoice');
    if (stored) setDocument(JSON.parse(stored) as NormalizedDocumentData);
  }, []);

  const exportPdf = () => {
    const pdf = new jsPDF();
    const template = templates.find((item) => item.id === selected);
    pdf.setFillColor(selected === 'signal' ? '#2563eb' : selected === 'paper' ? '#047857' : '#0f172a');
    pdf.rect(0, 0, 210, 12, 'F');
    pdf.setFontSize(10); pdf.setTextColor(80); pdf.text(data.seller.name, 20, 30);
    pdf.setFontSize(24); pdf.setTextColor(15); pdf.text('INVOICE', 20, 43);
    pdf.setFontSize(11); pdf.setTextColor(80); pdf.text(`#${data.invoiceNumber}`, 150, 35); pdf.text(data.invoiceDate, 150, 42);
    pdf.line(20, 52, 190, 52); pdf.text(`Billed to: ${data.customer.name}`, 20, 66);
    let y = 84; data.items.forEach((item) => { pdf.text(`${item.description} x ${item.quantity}`, 20, y); pdf.text(`$${(item.quantity * item.unitPrice).toFixed(2)}`, 160, y); y += 10; });
    pdf.line(20, y, 190, y); pdf.setFontSize(14); pdf.setTextColor(15); pdf.text(`Total: $${total.toFixed(2)}`, 130, y + 18);
    pdf.setFontSize(9); pdf.setTextColor(110); pdf.text(template?.description ?? '', 20, y + 30);
    pdf.save(`${data.invoiceNumber.toLowerCase()}.pdf`);
  };
  const exportExcel = () => {
    const rows = data.items.map((item) => ({ Description: item.description, Quantity: item.quantity, UnitPrice: item.unitPrice, TaxRate: item.taxRate, Total: item.quantity * item.unitPrice * (1 + item.taxRate / 100) }));
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), 'Invoice items'); XLSX.writeFile(workbook, `${data.invoiceNumber.toLowerCase()}.xlsx`);
  };

  return <main className="min-h-screen bg-slate-50 px-4 py-6 md:py-8"><div className="mx-auto max-w-6xl"><Link href="/editor" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-600"><ArrowLeft className="h-4 w-4" />Back to editor</Link><header className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Design & export</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Choose a document template</h1><p className="mt-2 text-slate-600">Switch designs without changing the extracted data.</p></div><div className="flex gap-2"><button type="button" onClick={exportPdf} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"><Download className="h-4 w-4" />Export PDF</button><button type="button" onClick={exportExcel} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700"><FileSpreadsheet className="h-4 w-4" />Excel</button></div></header><div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]"><section className="space-y-3">{templates.map((template) => <button type="button" key={template.id} onClick={() => setSelected(template.id)} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition ${selected === template.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-slate-300'}`}><span className={`mt-1 h-10 w-10 shrink-0 rounded-xl ${template.tone}`} /> <span className="flex-1"><span className="flex items-center justify-between font-semibold text-slate-900">{template.name}{selected === template.id && <Check className="h-4 w-4 text-blue-600" />}</span><span className="mt-1 block text-sm text-slate-500">{template.description}</span></span></button>)}</section><section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-8"><div className={`mx-auto min-h-[560px] max-w-2xl border border-slate-200 bg-white p-8 shadow-sm ${selected === 'paper' ? 'font-serif' : ''}`}><div className={`mb-8 h-2 w-full rounded-full ${templates.find((item) => item.id === selected)?.tone}`} /><div className="flex items-start justify-between border-b border-slate-200 pb-6"><div><p className={`text-sm font-semibold ${templates.find((item) => item.id === selected)?.accent}`}>{data.seller.name}</p><h2 className="mt-2 text-3xl font-bold text-slate-900">INVOICE</h2></div><div className="text-right text-sm text-slate-500"><p>#{data.invoiceNumber}</p><p>{data.invoiceDate}</p></div></div><div className="py-8 text-sm"><p className="text-xs uppercase tracking-wider text-slate-400">Billed to</p><p className="mt-2 font-semibold text-slate-900">{data.customer.name}</p><p className="text-slate-500">{data.customer.address}</p></div><div className="space-y-4 border-t border-slate-200 pt-5 text-sm">{data.items.map((item) => <div className="flex justify-between" key={item.id}><span className="text-slate-600">{item.description} × {item.quantity}</span><span className="font-medium text-slate-900">${(item.quantity * item.unitPrice).toFixed(2)}</span></div>)}<div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900"><span>Total</span><span>${total.toFixed(2)}</span></div></div><div className="mt-12 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400"><FileText className="h-3.5 w-3.5" />{templates.find((item) => item.id === selected)?.description}</div></div></section></div></div></main>;
}
