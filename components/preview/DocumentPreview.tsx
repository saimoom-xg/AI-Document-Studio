'use client';

import React from 'react';
import type {
  CvEducation,
  CvExperience,
  DocumentItem,
  DocumentTemplateMeta,
  ExpenseItem,
  NormalizedDocumentData,
  ReportSection,
} from '@/lib/documents/types';
import { definitionFor } from '@/lib/documents/registry';

interface DocumentPreviewProps {
  document: NormalizedDocumentData;
  templateId: string;
}

export default function DocumentPreview({ document, templateId }: DocumentPreviewProps) {
  const definition = definitionFor(document.type);
  const template: DocumentTemplateMeta =
    definition.templates.find((t) => t.id === templateId) ||
    definition.templates[0] || {
      id: 'Modern',
      name: 'Modern',
      category: 'General',
      description: 'Default template',
      accentColor: '#2563eb',
      softColor: '#eff6ff',
      fontFamily: 'sans',
    };

  const d = document.data;

  return (
    <div className="flex justify-center p-2 sm:p-4">
      {/* A4 Sheet Simulation */}
      <div
        className="w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-2xl rounded-sm border border-slate-200/80 transition-all duration-200 overflow-hidden flex flex-col justify-between"
        style={{
          fontFamily:
            template.fontFamily === 'serif'
              ? 'Georgia, Cambria, "Times New Roman", Times, serif'
              : template.fontFamily === 'mono'
              ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
              : 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div className="flex-1">
          {document.type === 'cv' && <CvPreview data={d} template={template} />}
          {document.type === 'invoice' && <InvoicePreview data={d} template={template} typeLabel="INVOICE" />}
          {document.type === 'receipt' && <ReceiptPreview data={d} template={template} />}
          {document.type === 'quotation' && <InvoicePreview data={d} template={template} typeLabel="QUOTATION" />}
          {document.type === 'purchase_order' && <InvoicePreview data={d} template={template} typeLabel="PURCHASE ORDER" />}
          {document.type === 'report' && <ReportPreview data={d} template={template} />}
          {document.type === 'expense_report' && <ExpensePreview data={d} template={template} />}
          {document.type === 'unknown' && <GenericPreview data={d} template={template} typeName={definition.label} />}
          {!['cv', 'invoice', 'receipt', 'quotation', 'purchase_order', 'report', 'expense_report', 'unknown'].includes(document.type) && (
            <GenericPreview data={d} template={template} typeName={definition.label} />
          )}
        </div>

        {/* Subtle Watermark/Footer */}
        <div className="border-t border-slate-100 px-8 py-3 flex items-center justify-between text-[11px] text-slate-400">
          <span>{definition.label} · Template: {template.name}</span>
          <span>Prepared with AI Document Studio</span>
        </div>
      </div>
    </div>
  );
}

function CvPreview({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Senior Professional');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const website = String(data.website || '');
  const linkedin = String(data.linkedin || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  const isSidebar = template.id === 'Corporate' || template.id === 'European-style';

  if (isSidebar) {
    return (
      <div className="grid grid-cols-[230px_1fr] min-h-[1050px]">
        {/* Left Sidebar */}
        <aside
          className="p-6 text-white space-y-6"
          style={{ backgroundColor: template.accentColor }}
        >
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight">{name}</h1>
            <p className="text-xs mt-1 text-white/80 font-medium tracking-wide uppercase">{role}</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-bold uppercase tracking-wider text-[10px] text-white/70 border-b border-white/20 pb-1 mb-2">Contact</p>
              <div className="space-y-1.5 text-white/90">
                {email && <p className="break-all">{email}</p>}
                {phone && <p>{phone}</p>}
                {location && <p>{location}</p>}
                {website && <p className="break-all underline text-white/80">{website.replace(/^https?:\/\//, '')}</p>}
                {linkedin && <p className="break-all underline text-white/80">{linkedin.replace(/^https?:\/\//, '')}</p>}
              </div>
            </div>

            {skills && (
              <div>
                <p className="font-bold uppercase tracking-wider text-[10px] text-white/70 border-b border-white/20 pb-1 mb-2">Core Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {skills.split(',').map((skill, idx) => (
                    <span key={idx} className="bg-white/15 px-2 py-0.5 rounded text-[11px] text-white/90">
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Main Body */}
        <main className="p-8 space-y-6">
          {summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
                Profile Summary
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {experiences.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: template.accentColor }}>
                Work Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold text-slate-900">{exp.role}</h3>
                      <span className="text-xs text-slate-500 font-medium">{exp.period}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">{exp.company} {exp.location ? `· ${exp.location}` : ''}</p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-3 pb-1 border-b border-slate-200" style={{ color: template.accentColor }}>
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                      <span className="text-xs text-slate-500">{edu.period}</span>
                    </div>
                    <p className="text-xs text-slate-600">{edu.institution} {edu.location ? `· ${edu.location}` : ''}</p>
                    {edu.details && <p className="text-xs text-slate-500 italic">{edu.details}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Classic / Modern / Minimal Clean Header Layout
  return (
    <div className="p-8 sm:p-12 space-y-7">
      {/* Header */}
      <header className="border-b pb-6 space-y-2" style={{ borderColor: template.accentColor }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">{name}</h1>
            <p className="text-base font-semibold mt-1" style={{ color: template.accentColor }}>{role}</p>
          </div>
          <div className="text-xs text-slate-600 space-y-0.5 text-left sm:text-right">
            {email && <p>{email}</p>}
            {phone && <p>{phone}</p>}
            {location && <p>{location}</p>}
            {website && <p className="underline" style={{ color: template.accentColor }}>{website.replace(/^https?:\/\//, '')}</p>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
            Executive Summary
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Skills Pill Badges */}
      {skills && (
        <section className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>
            Skills & Competencies
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {skills.split(',').map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: template.softColor, color: template.accentColor }}
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: template.accentColor }}>
            Professional Experience
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-slate-900">{exp.role}</h3>
                  <span className="text-xs text-slate-500 font-medium">{exp.period}</span>
                </div>
                <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location ? `· ${exp.location}` : ''}</p>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1" style={{ color: template.accentColor }}>
            Education & Certifications
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="space-y-0.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-semibold text-slate-900">{edu.degree}</h3>
                  <span className="text-xs text-slate-500">{edu.period}</span>
                </div>
                <p className="text-xs text-slate-600">{edu.institution} {edu.location ? `· ${edu.location}` : ''}</p>
                {edu.details && <p className="text-xs text-slate-500 italic">{edu.details}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InvoicePreview({
  data,
  template,
  typeLabel,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
  typeLabel: string;
}) {
  const number = String(data.invoiceNumber || data.quoteNumber || data.poNumber || 'INV-2026-001');
  const date = String(data.invoiceDate || data.date || data.orderDate || '');
  const dueDate = String(data.dueDate || data.validUntil || data.deliveryDate || '');
  const currency = String(data.currency || 'USD ($)');

  const sellerName = String(data.sellerName || data.companyName || data.supplierName || 'Acme Studio Inc.');
  const sellerEmail = String(data.sellerEmail || '');
  const sellerAddress = String(data.sellerAddress || data.companyAddress || data.supplierAddress || '');

  const customerName = String(data.customerName || data.clientName || data.buyerName || 'Client Name');
  const customerEmail = String(data.customerEmail || '');
  const customerAddress = String(data.customerAddress || data.clientAddress || data.shippingAddress || '');

  const items = (data.items || []) as DocumentItem[];
  const notes = String(data.notes || '');
  const terms = String(data.terms || '');
  const taxRate = parseFloat(String(data.taxRate || '0')) || 0;
  const discount = parseFloat(String(data.discount || '0')) || 0;

  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount - discount;

  return (
    <div className="p-8 sm:p-12 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b pb-6" style={{ borderColor: template.accentColor }}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{sellerName}</h1>
          {sellerEmail && <p className="text-xs text-slate-500 mt-1">{sellerEmail}</p>}
          {sellerAddress && <p className="text-xs text-slate-500 whitespace-pre-wrap mt-1">{sellerAddress}</p>}
        </div>

        <div className="text-left sm:text-right">
          <span
            className="inline-block text-xs font-bold tracking-wider uppercase px-2.5 py-1 rounded"
            style={{ backgroundColor: template.softColor, color: template.accentColor }}
          >
            {typeLabel}
          </span>
          <p className="text-sm font-semibold text-slate-900 mt-2"># {number}</p>
          {date && <p className="text-xs text-slate-500">Date: {date}</p>}
          {dueDate && <p className="text-xs text-slate-500">Due / Valid: {dueDate}</p>}
        </div>
      </div>

      {/* Parties Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-lg border border-slate-200/60 text-xs">
        <div>
          <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Billed To / Recipient</p>
          <p className="font-bold text-slate-900 text-sm">{customerName}</p>
          {customerEmail && <p className="text-slate-600 mt-0.5">{customerEmail}</p>}
          {customerAddress && <p className="text-slate-600 whitespace-pre-wrap mt-1">{customerAddress}</p>}
        </div>
        <div className="sm:text-right">
          <p className="font-semibold uppercase tracking-wider text-[10px] text-slate-500 mb-1">Payment Reference</p>
          <p className="font-medium text-slate-800">Currency: {currency}</p>
          {taxRate > 0 && <p className="text-slate-600">Standard Tax: {taxRate}%</p>}
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: template.accentColor, color: '#ffffff' }}>
              <th className="py-2.5 px-4 font-semibold">Description</th>
              <th className="py-2.5 px-3 font-semibold text-right w-16">Qty</th>
              <th className="py-2.5 px-3 font-semibold text-right w-24">Price</th>
              <th className="py-2.5 px-4 font-semibold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, idx) => {
              const qty = Number(it.quantity || 1);
              const price = Number(it.unitPrice || 0);
              const tot = it.total ?? (qty * price);
              return (
                <tr key={it.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{it.description || 'Item description'}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{qty}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{price.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-900">{tot.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Summary */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({taxRate}%)</span>
              <span>{taxAmount.toFixed(2)}</span>
            </div>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Discount</span>
              <span>-{discount.toFixed(2)}</span>
            </div>
          )}
          <div
            className="flex justify-between font-bold text-sm pt-2 border-t"
            style={{ borderColor: template.accentColor, color: template.accentColor }}
          >
            <span>Total Due ({currency})</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(notes || terms) && (
        <div className="pt-4 border-t border-slate-200/80 space-y-3 text-xs text-slate-600">
          {notes && (
            <div>
              <p className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Notes</p>
              <p className="whitespace-pre-wrap leading-relaxed">{notes}</p>
            </div>
          )}
          {terms && (
            <div>
              <p className="font-semibold text-slate-800 uppercase tracking-wider text-[10px] mb-1">Terms & Remittance</p>
              <p className="whitespace-pre-wrap leading-relaxed">{terms}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReceiptPreview({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const store = String(data.store || 'Metro Cafe');
  const number = String(data.receiptNumber || 'REC-89211');
  const date = String(data.date || new Date().toISOString().slice(0, 10));
  const paymentMethod = String(data.paymentMethod || 'Visa •••• 4242');
  const currency = String(data.currency || 'USD ($)');
  const items = (data.items || []) as DocumentItem[];
  const notes = String(data.notes || 'Thank you for your visit!');
  const taxRate = parseFloat(String(data.taxRate || '0')) || 0;

  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="p-8 sm:p-12 flex justify-center">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg p-6 shadow-sm space-y-5 text-xs text-slate-800 font-mono">
        <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-4">
          <h2 className="text-lg font-bold tracking-tight text-slate-950 uppercase">{store}</h2>
          <p className="text-[11px] text-slate-500">Receipt #{number}</p>
          <p className="text-[11px] text-slate-500">{date} · {paymentMethod}</p>
        </div>

        <div className="space-y-2 divide-y divide-slate-100">
          {items.map((item, idx) => {
            const qty = Number(item.quantity || 1);
            const price = Number(item.unitPrice || 0);
            const lineTotal = item.total ?? (qty * price);
            return (
              <div key={item.id || idx} className="pt-2 flex justify-between items-baseline">
                <div>
                  <span className="font-semibold text-slate-900">{item.description}</span>
                  <span className="text-[10px] text-slate-500 block">{qty} x {price.toFixed(2)}</span>
                </div>
                <span className="font-bold text-slate-900">{lineTotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>

        <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Tax ({taxRate}%)</span>
              <span>{taxAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold text-slate-950 pt-2 border-t border-slate-200">
            <span>TOTAL ({currency})</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>

        {notes && (
          <div className="text-center text-[11px] text-slate-500 pt-4 border-t border-dashed border-slate-300">
            <p className="italic">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportPreview({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const title = String(data.title || 'Executive Analysis');
  const subtitle = String(data.subtitle || '');
  const author = String(data.author || 'Author');
  const date = String(data.date || '');
  const summary = String(data.summary || '');
  const sections = (data.sections || []) as ReportSection[];
  const recommendations = String(data.recommendations || '');

  return (
    <div className="p-8 sm:p-12 space-y-8">
      <header className="border-b pb-6" style={{ borderColor: template.accentColor }}>
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: template.softColor, color: template.accentColor }}
        >
          Intelligence Report
        </span>
        <h1 className="text-3xl font-extrabold text-slate-950 mt-2">{title}</h1>
        {subtitle && <p className="text-sm font-semibold mt-1" style={{ color: template.accentColor }}>{subtitle}</p>}
        <p className="text-xs text-slate-500 mt-2">{[author, date].filter(Boolean).join(' · ')}</p>
      </header>

      {summary && (
        <section className="p-4 rounded-lg border border-slate-200/80 bg-slate-50/60">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: template.accentColor }}>Executive Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {sections.map((sec) => (
        <section key={sec.id} className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-1" style={{ color: template.accentColor }}>
            {sec.title}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{sec.content}</p>
        </section>
      ))}

      {recommendations && (
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>Key Recommendations</h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{recommendations}</p>
        </section>
      )}
    </div>
  );
}

function ExpensePreview({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const title = String(data.title || 'Expense Claim');
  const employee = String(data.employee || 'Claimant');
  const department = String(data.department || '');
  const date = String(data.date || '');
  const currency = String(data.currency || 'USD ($)');
  const expenses = (data.expenses || []) as ExpenseItem[];
  const notes = String(data.notes || '');

  const total = expenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);

  return (
    <div className="p-8 sm:p-12 space-y-6">
      <header className="border-b pb-4 flex justify-between items-baseline" style={{ borderColor: template.accentColor }}>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-xs text-slate-500 mt-1">Claimant: {employee} {department ? `· ${department}` : ''} {date ? `· ${date}` : ''}</p>
        </div>
        <span
          className="text-xs font-bold uppercase px-2.5 py-1 rounded"
          style={{ backgroundColor: template.softColor, color: template.accentColor }}
        >
          Expense Report
        </span>
      </header>

      <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ backgroundColor: template.accentColor, color: '#fff' }}>
              <th className="py-2 px-3 font-semibold">Date</th>
              <th className="py-2 px-3 font-semibold">Category</th>
              <th className="py-2 px-3 font-semibold">Description</th>
              <th className="py-2 px-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map((ex, idx) => (
              <tr key={ex.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                <td className="py-2 px-3 text-slate-600">{ex.date}</td>
                <td className="py-2 px-3 font-medium text-slate-800">{ex.category}</td>
                <td className="py-2 px-3 text-slate-700">{ex.description}</td>
                <td className="py-2 px-3 text-right font-medium text-slate-900">{Number(ex.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs w-56 flex justify-between font-bold" style={{ color: template.accentColor }}>
          <span>Total Claim ({currency})</span>
          <span>{total.toFixed(2)}</span>
        </div>
      </div>

      {notes && (
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600">
          <p className="font-semibold text-slate-800 text-[10px] uppercase mb-1">Notes & Approvals</p>
          <p className="leading-relaxed whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
}

function GenericPreview({
  data,
  template,
  typeName,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
  typeName: string;
}) {
  const title = String(data.title || data.fullName || 'Document');
  const extractedText = String(data.extractedText || data.summary || data.notes || '');

  return (
    <div className="p-8 sm:p-12 space-y-6">
      <header className="border-b pb-4" style={{ borderColor: template.accentColor }}>
        <span
          className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded"
          style={{ backgroundColor: template.softColor, color: template.accentColor }}
        >
          {typeName}
        </span>
        <h1 className="text-2xl font-bold text-slate-950 mt-2">{title}</h1>
      </header>

      <div className="space-y-3 text-xs">
        {Object.entries(data).map(([key, val]) => {
          if (['extractedText', 'title'].includes(key) || typeof val === 'object') return null;
          return (
            <div key={key} className="flex gap-4 border-b border-slate-100 pb-2">
              <span className="w-36 font-semibold uppercase tracking-wider text-[10px] text-slate-500">
                {key.replace(/([A-Z])/g, ' $1')}
              </span>
              <span className="text-slate-800">{String(val)}</span>
            </div>
          );
        })}
      </div>

      {extractedText && (
        <div className="pt-4 border-t border-slate-200 space-y-1">
          <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: template.accentColor }}>
            Extracted Content
          </p>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded border border-slate-200">
            {extractedText}
          </p>
        </div>
      )}
    </div>
  );
}
