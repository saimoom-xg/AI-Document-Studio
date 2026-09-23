'use client';

import React from 'react';
import { Check, ShieldCheck, QrCode } from 'lucide-react';
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
    <div className="flex justify-center p-1 sm:p-3">
      {/* A4 Sheet Simulation */}
      <div className="w-full max-w-[794px] min-h-[1123px] bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200/90 transition-all duration-200 overflow-hidden flex flex-col justify-between">
        <div className="flex-1">
          {document.type === 'cv' && <CvLayoutDispatcher data={d} template={template} />}
          {document.type === 'invoice' && <InvoiceLayoutDispatcher data={d} template={template} typeLabel="INVOICE" />}
          {document.type === 'receipt' && <ReceiptLayoutDispatcher data={d} template={template} />}
          {document.type === 'quotation' && <InvoiceLayoutDispatcher data={d} template={template} typeLabel="QUOTATION" />}
          {document.type === 'purchase_order' && <InvoiceLayoutDispatcher data={d} template={template} typeLabel="PURCHASE ORDER" />}
          {document.type === 'report' && <ReportLayoutDispatcher data={d} template={template} />}
          {document.type === 'expense_report' && <ExpenseLayoutDispatcher data={d} template={template} />}
          {!['cv', 'invoice', 'receipt', 'quotation', 'purchase_order', 'report', 'expense_report'].includes(document.type) && (
            <GenericLayoutDispatcher data={d} template={template} typeName={definition.label} />
          )}
        </div>

        {/* Minimal Footer */}
        <div className="border-t border-slate-100 px-8 py-2.5 flex items-center justify-between text-[10px] text-slate-400">
          <span>{definition.label} · {template.name} Layout</span>
          <span>AI Document Studio</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CV / RESUME TEMPLATES - 5 COMPLETELY DISTINCT STRUCTURAL LAYOUTS
// ============================================================================
function CvLayoutDispatcher({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  switch (template.id) {
    case 'Professional':
      return <CvProfessionalLayout data={data} template={template} />;
    case 'Minimal':
      return <CvMinimalSwissLayout data={data} template={template} />;
    case 'Corporate':
      return <CvCorporateSidebarLayout data={data} template={template} />;
    case 'European-style':
      return <CvEuropeanGridLayout data={data} template={template} />;
    case 'Modern':
    default:
      return <CvModernSplitLayout data={data} template={template} />;
  }
}

// 1. CV MODERN: Asymmetric 2-column split with left contact/skills cards and right timeline
function CvModernSplitLayout({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Senior Product Designer');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const website = String(data.website || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  return (
    <div className="p-8 sm:p-12 space-y-8 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: template.softColor, color: template.accentColor }}>
            Resume
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-2">{name}</h1>
          <p className="text-base font-semibold mt-1" style={{ color: template.accentColor }}>{role}</p>
        </div>
        <div className="text-xs text-slate-600 space-y-1 text-left sm:text-right">
          {email && <p>{email}</p>}
          {phone && <p>{phone}</p>}
          {location && <p>{location}</p>}
          {website && <p className="font-medium underline" style={{ color: template.accentColor }}>{website.replace(/^https?:\/\//, '')}</p>}
        </div>
      </div>

      {/* 2-Column Split: 35% Left Sidebar Cards, 65% Right Main Content */}
      <div className="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {skills && (
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5" style={{ color: template.accentColor }}>
                Skills &amp; Tools
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {skills.split(',').map((s, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-md shadow-2xs">
                    {s.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1.5" style={{ color: template.accentColor }}>
                Education
              </h3>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5 text-xs">
                    <p className="font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                    <p className="text-[11px] text-slate-500">{edu.period}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Column */}
        <div className="space-y-6">
          {summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
                Professional Profile
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
            </div>
          )}

          {experiences.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-slate-200 pb-1.5" style={{ color: template.accentColor }}>
                Work Experience
              </h2>
              <div className="space-y-5">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-4 border-l-2 space-y-1" style={{ borderColor: template.softColor }}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-xs font-bold text-slate-950">{exp.role}</h3>
                      <span className="text-[11px] text-slate-500 font-medium">{exp.period}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">{exp.company} {exp.location ? `· ${exp.location}` : ''}</p>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. CV PROFESSIONAL: Classic centered serif header with elegant horizontal double dividers and chronological single column
function CvProfessionalLayout({ data }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Executive Director');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const website = String(data.website || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  return (
    <div className="p-10 sm:p-14 space-y-6 font-serif text-slate-900">
      {/* Centered Formal Header */}
      <div className="text-center space-y-2 pb-5 border-b-2 border-slate-900">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-normal uppercase text-slate-950">{name}</h1>
        <p className="text-sm font-sans tracking-widest uppercase text-slate-600 font-medium">{role}</p>
        <p className="text-xs font-sans text-slate-600 space-x-2 pt-1">
          {[location, phone, email, website].filter(Boolean).map((item, idx) => (
            <span key={idx}>
              {idx > 0 && <span className="text-slate-300 mx-1.5">•</span>}
              {item}
            </span>
          ))}
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
            Executive Summary
          </h2>
          <p className="text-xs font-sans text-slate-700 leading-relaxed text-justify">{summary}</p>
        </section>
      )}

      {/* Chronological Experience */}
      {experiences.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-4 font-sans">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-900">{exp.role}, <span className="font-semibold text-slate-700">{exp.company}</span></span>
                  <span className="text-xs text-slate-500 font-serif italic">{exp.period}</span>
                </div>
                {exp.location && <p className="text-[11px] text-slate-500">{exp.location}</p>}
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
            Education
          </h2>
          <div className="space-y-2 font-sans">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree}</span> · {edu.institution}
                </div>
                <span className="text-slate-500 font-serif italic">{edu.period}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills && (
        <section className="space-y-1.5">
          <h2 className="text-xs font-sans font-bold uppercase tracking-widest text-slate-900 border-b border-slate-300 pb-1">
            Key Competencies
          </h2>
          <p className="text-xs font-sans text-slate-700 leading-relaxed">{skills}</p>
        </section>
      )}
    </div>
  );
}

// 3. CV MINIMAL (SWISS STYLE): Strict 28% left section headers + 72% indented details with sharp borders
function CvMinimalSwissLayout({ data }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Product Architect');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const website = String(data.website || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  return (
    <div className="p-8 sm:p-14 space-y-8 font-sans">
      {/* Swiss Header: Bold Name + Rule */}
      <div className="border-b-2 border-black pb-4 flex flex-col sm:flex-row justify-between items-baseline gap-2">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-black">{name}</h1>
          <p className="text-sm font-medium text-slate-600 tracking-wide mt-0.5">{role}</p>
        </div>
        <div className="text-xs text-slate-600 sm:text-right space-y-0.5">
          <p>{email}</p>
          <p>{[phone, location].filter(Boolean).join(' · ')}</p>
          {website && <p className="font-mono text-[11px]">{website}</p>}
        </div>
      </div>

      {/* Swiss Grid Section 1: Profile */}
      {summary && (
        <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline border-b border-slate-200 pb-6">
          <span className="text-xs font-black uppercase tracking-wider text-black">Profile</span>
          <p className="text-xs text-slate-800 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Swiss Grid Section 2: Experience */}
      {experiences.length > 0 && (
        <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline border-b border-slate-200 pb-6">
          <span className="text-xs font-black uppercase tracking-wider text-black">Experience</span>
          <div className="space-y-5">
            {experiences.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold text-black uppercase">{exp.role}</h3>
                  <span className="text-[11px] font-mono text-slate-500">{exp.period}</span>
                </div>
                <p className="text-xs text-slate-600 font-medium">{exp.company} {exp.location ? `/ ${exp.location}` : ''}</p>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swiss Grid Section 3: Education */}
      {education.length > 0 && (
        <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline border-b border-slate-200 pb-6">
          <span className="text-xs font-black uppercase tracking-wider text-black">Education</span>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-baseline text-xs">
                <div>
                  <p className="font-bold text-black">{edu.degree}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{edu.period}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Swiss Grid Section 4: Skills */}
      {skills && (
        <div className="grid grid-cols-[140px_1fr] gap-6 items-baseline">
          <span className="text-xs font-black uppercase tracking-wider text-black">Skills</span>
          <div className="flex flex-wrap gap-2">
            {skills.split(',').map((skill, idx) => (
              <span key={idx} className="border border-black px-2 py-0.5 text-[11px] font-medium text-black">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 4. CV CORPORATE: Full solid colored sidebar on left, white column on right
function CvCorporateSidebarLayout({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Vice President of Operations');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const website = String(data.website || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  return (
    <div className="grid grid-cols-[220px_1fr] min-h-[1080px] font-sans">
      {/* Left Full-Height Solid Sidebar */}
      <aside className="p-7 text-white space-y-7" style={{ backgroundColor: template.accentColor }}>
        <div>
          <h1 className="text-2xl font-black leading-tight tracking-tight uppercase">{name}</h1>
          <p className="text-xs mt-1 text-white/80 font-semibold tracking-wider uppercase">{role}</p>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70 border-b border-white/20 pb-1">Contact</p>
          <div className="space-y-1 text-white/90">
            {email && <p className="break-all">{email}</p>}
            {phone && <p>{phone}</p>}
            {location && <p>{location}</p>}
            {website && <p className="break-all underline text-white/80">{website.replace(/^https?:\/\//, '')}</p>}
          </div>
        </div>

        {skills && (
          <div className="space-y-2 text-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 border-b border-white/20 pb-1">Competencies</p>
            <div className="space-y-1 text-white/90 text-[11px]">
              {skills.split(',').map((skill, idx) => (
                <p key={idx}>▪ {skill.trim()}</p>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="space-y-2 text-xs">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/70 border-b border-white/20 pb-1">Education</p>
            <div className="space-y-2 text-white/90 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="font-bold">{edu.degree}</p>
                  <p className="text-white/80 text-[11px]">{edu.institution}</p>
                  <p className="text-white/60 text-[10px]">{edu.period}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Right Column */}
      <main className="p-8 sm:p-10 space-y-6">
        {summary && (
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: template.accentColor }}>
              Executive Summary
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
          </div>
        )}

        {experiences.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider border-b-2 pb-1" style={{ borderColor: template.accentColor, color: template.accentColor }}>
              Career History
            </h2>
            <div className="space-y-5">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-bold text-slate-900">{exp.role}</h3>
                    <span className="text-[11px] font-semibold text-slate-500">{exp.period}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{exp.company} {exp.location ? `· ${exp.location}` : ''}</p>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// 5. CV EUROPEAN: Europass-style grid with timeline dots and categorized skills matrix
function CvEuropeanGridLayout({ data }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const name = String(data.fullName || 'Alex Vance');
  const role = String(data.jobTitle || 'Product Consultant');
  const email = String(data.email || '');
  const phone = String(data.phone || '');
  const location = String(data.location || '');
  const summary = String(data.summary || '');
  const skills = String(data.skills || '');
  const experiences = (data.experience || []) as CvExperience[];
  const education = (data.education || []) as CvEducation[];

  return (
    <div className="p-8 sm:p-12 space-y-7 font-sans text-xs">
      {/* European Standard Header */}
      <div className="grid grid-cols-[180px_1fr] gap-6 border-b pb-5 border-slate-300">
        <div className="space-y-1 font-semibold text-slate-700">
          <p className="text-xs uppercase text-slate-400 font-bold">Europass CV</p>
          <p>{location}</p>
          <p>{phone}</p>
          <p>{email}</p>
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">{name}</h1>
          <p className="text-sm font-semibold text-slate-700 mt-1">{role}</p>
          {summary && <p className="text-slate-600 mt-3 leading-relaxed">{summary}</p>}
        </div>
      </div>

      {/* Experience Timeline */}
      {experiences.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
            Work Experience
          </h2>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid grid-cols-[180px_1fr] gap-6">
                <span className="font-medium text-slate-500">{exp.period}</span>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">{exp.role}</p>
                  <p className="font-semibold text-slate-700">{exp.company}</p>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Timeline */}
      {education.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b pb-1 border-slate-200">
            Education and Training
          </h2>
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-[180px_1fr] gap-6">
                <span className="font-medium text-slate-500">{edu.period}</span>
                <div>
                  <p className="font-bold text-slate-900">{edu.degree}</p>
                  <p className="text-slate-700">{edu.institution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Matrix */}
      {skills && (
        <div className="grid grid-cols-[180px_1fr] gap-6 border-t pt-4 border-slate-200">
          <span className="font-bold uppercase tracking-wider text-slate-900">Personal Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {skills.split(',').map((skill, idx) => (
              <span key={idx} className="bg-slate-100 px-2.5 py-1 rounded text-slate-800 font-medium">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// INVOICE / QUOTATION / PO TEMPLATES - 5 DISTINCT STRUCTURAL LAYOUTS
// ============================================================================
function InvoiceLayoutDispatcher({
  data,
  template,
  typeLabel,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
  typeLabel: string;
}) {
  switch (template.id) {
    case 'Minimal':
      return <InvoiceMinimalLayout data={data} typeLabel={typeLabel} />;
    case 'Classic':
      return <InvoiceClassicLayout data={data} typeLabel={typeLabel} />;
    case 'Professional':
      return <InvoiceProfessionalLayout data={data} template={template} typeLabel={typeLabel} />;
    case 'Corporate':
      return <InvoiceCorporateLayout data={data} template={template} typeLabel={typeLabel} />;
    case 'Modern':
    default:
      return <InvoiceModernLayout data={data} template={template} typeLabel={typeLabel} />;
  }
}

// 1. INVOICE MODERN: Asymmetric header with floating status badge, clean item cards, bold totals
function InvoiceModernLayout({
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
    <div className="p-8 sm:p-12 space-y-8 font-sans">
      {/* Modern Asymmetrical Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
        <div>
          <span
            className="inline-block text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: template.softColor, color: template.accentColor }}
          >
            {typeLabel}
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">{sellerName}</h1>
          {sellerEmail && <p className="text-xs text-slate-500 mt-1">{sellerEmail}</p>}
          {sellerAddress && <p className="text-xs text-slate-500 whitespace-pre-wrap mt-0.5">{sellerAddress}</p>}
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-left sm:text-right min-w-[200px]">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</p>
          <p className="text-lg font-bold text-slate-900">{number}</p>
          {date && <p className="text-xs text-slate-500 mt-1">Date: {date}</p>}
          {dueDate && <p className="text-xs text-slate-500">Due: {dueDate}</p>}
        </div>
      </div>

      {/* Recipient Card */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Billed To</p>
        <p className="text-sm font-bold text-slate-900">{customerName}</p>
        {customerEmail && <p className="text-xs text-slate-600 mt-0.5">{customerEmail}</p>}
        {customerAddress && <p className="text-xs text-slate-600 whitespace-pre-wrap mt-0.5">{customerAddress}</p>}
      </div>

      {/* Item Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr style={{ backgroundColor: template.accentColor, color: '#ffffff' }}>
              <th className="py-3 px-4 font-semibold">Description</th>
              <th className="py-3 px-3 font-semibold text-right w-16">Qty</th>
              <th className="py-3 px-3 font-semibold text-right w-24">Price</th>
              <th className="py-3 px-4 font-semibold text-right w-28">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, idx) => {
              const qty = Number(it.quantity || 1);
              const price = Number(it.unitPrice || 0);
              const tot = it.total ?? (qty * price);
              return (
                <tr key={it.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="py-3 px-4 font-medium text-slate-800">{it.description || 'Item description'}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{qty}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{price.toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">{tot.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modern Totals Block */}
      <div className="flex justify-end">
        <div className="w-64 p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs">
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
          <div className="flex justify-between font-bold text-sm pt-2 border-t border-slate-200" style={{ color: template.accentColor }}>
            <span>Total Due ({currency})</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {(notes || terms) && (
        <div className="pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-2">
          {notes && <p className="leading-relaxed"><strong className="text-slate-800">Notes:</strong> {notes}</p>}
          {terms && <p className="leading-relaxed"><strong className="text-slate-800">Terms:</strong> {terms}</p>}
        </div>
      )}
    </div>
  );
}

// 2. INVOICE MINIMAL: Stark Swiss design with hairline rules, monospace numeric ledger, no colored boxes
function InvoiceMinimalLayout({
  data,
  typeLabel,
}: {
  data: Record<string, unknown>;
  typeLabel: string;
}) {
  const number = String(data.invoiceNumber || data.quoteNumber || data.poNumber || 'INV-001');
  const date = String(data.invoiceDate || data.date || data.orderDate || '');
  const dueDate = String(data.dueDate || data.validUntil || data.deliveryDate || '');
  const currency = String(data.currency || 'USD');

  const sellerName = String(data.sellerName || data.companyName || data.supplierName || 'Acme Studio');
  const sellerAddress = String(data.sellerAddress || data.companyAddress || data.supplierAddress || '');

  const customerName = String(data.customerName || data.clientName || data.buyerName || 'Client');
  const customerAddress = String(data.customerAddress || data.clientAddress || data.shippingAddress || '');

  const items = (data.items || []) as DocumentItem[];
  const notes = String(data.notes || '');
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-8 sm:p-14 space-y-10 font-sans text-xs text-black">
      {/* Minimal Stark Header */}
      <div className="border-b border-black pb-4 flex justify-between items-baseline">
        <span className="font-mono font-bold tracking-widest uppercase text-sm">{typeLabel} #{number}</span>
        <span className="font-mono text-slate-600">{date}</span>
      </div>

      {/* Dual Minimal Columns */}
      <div className="grid grid-cols-2 gap-8 font-mono">
        <div>
          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">From</p>
          <p className="font-bold text-sm text-black">{sellerName}</p>
          <p className="text-slate-600 whitespace-pre-wrap mt-1">{sellerAddress}</p>
        </div>
        <div>
          <p className="font-bold uppercase text-[10px] text-slate-500 mb-1">To</p>
          <p className="font-bold text-sm text-black">{customerName}</p>
          <p className="text-slate-600 whitespace-pre-wrap mt-1">{customerAddress}</p>
          {dueDate && <p className="text-slate-500 mt-2">Due Date: {dueDate}</p>}
        </div>
      </div>

      {/* Hairline Border Table */}
      <div className="border-t border-b border-black font-mono">
        <div className="grid grid-cols-[1fr_60px_90px_90px] py-2 border-b border-black font-bold text-[11px] uppercase">
          <span>Item</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Rate</span>
          <span className="text-right">Total</span>
        </div>
        {items.map((it, idx) => {
          const q = Number(it.quantity || 1);
          const p = Number(it.unitPrice || 0);
          const tot = it.total ?? (q * p);
          return (
            <div key={it.id || idx} className="grid grid-cols-[1fr_60px_90px_90px] py-2.5 border-b border-slate-100 last:border-b-0">
              <span className="font-medium">{it.description}</span>
              <span className="text-right">{q}</span>
              <span className="text-right">{p.toFixed(2)}</span>
              <span className="text-right font-bold">{tot.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Monospace Ledger Total */}
      <div className="flex justify-end font-mono">
        <div className="w-56 space-y-1">
          <div className="flex justify-between py-1 border-b border-black font-bold text-sm">
            <span>Total Due ({currency})</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {notes && (
        <div className="font-mono text-slate-500 text-[11px] pt-6 border-t border-slate-200">
          <p>{notes}</p>
        </div>
      )}
    </div>
  );
}

// 3. INVOICE CLASSIC: Formal serif typography, centered banner, traditional double-line borders
function InvoiceClassicLayout({
  data,
  typeLabel,
}: {
  data: Record<string, unknown>;
  typeLabel: string;
}) {
  const number = String(data.invoiceNumber || data.quoteNumber || data.poNumber || 'INV-001');
  const date = String(data.invoiceDate || data.date || data.orderDate || '');
  const currency = String(data.currency || 'USD');

  const sellerName = String(data.sellerName || data.companyName || data.supplierName || 'Acme Corporation');
  const customerName = String(data.customerName || data.clientName || data.buyerName || 'Client');
  const items = (data.items || []) as DocumentItem[];
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-10 sm:p-14 space-y-8 font-serif text-slate-900">
      {/* Formal Double Border Header */}
      <div className="text-center pb-6 border-b-4 border-double border-slate-900 space-y-1">
        <p className="text-xs font-sans tracking-widest uppercase font-semibold text-slate-600">{typeLabel}</p>
        <h1 className="text-3xl font-bold uppercase tracking-tight text-slate-950">{sellerName}</h1>
        <p className="text-xs font-sans text-slate-600">Document #{number} · Issued: {date}</p>
      </div>

      {/* Classic Bill To */}
      <div className="font-sans text-xs space-y-1">
        <p className="font-serif italic text-slate-500">Prepared for:</p>
        <p className="text-sm font-bold text-slate-900">{customerName}</p>
      </div>

      {/* Traditional Table */}
      <table className="w-full text-left font-sans text-xs border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-900 font-serif">
            <th className="py-2 font-bold">Item Description</th>
            <th className="py-2 text-right w-16 font-bold">Qty</th>
            <th className="py-2 text-right w-24 font-bold">Unit Price</th>
            <th className="py-2 text-right w-28 font-bold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((it, idx) => (
            <tr key={it.id || idx}>
              <td className="py-2.5 font-medium">{it.description}</td>
              <td className="py-2.5 text-right text-slate-600">{it.quantity}</td>
              <td className="py-2.5 text-right text-slate-600">{Number(it.unitPrice).toFixed(2)}</td>
              <td className="py-2.5 text-right font-bold">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Double Border Bottom Total */}
      <div className="flex justify-end pt-4 font-sans text-xs">
        <div className="w-56 border-t-4 border-double border-slate-900 pt-2 flex justify-between font-bold text-sm">
          <span>Grand Total ({currency})</span>
          <span>{subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// 4. INVOICE PROFESSIONAL: Formal 2-column cards, zebra-striped table, bottom remittance slip
function InvoiceProfessionalLayout({
  data,
  template,
  typeLabel,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
  typeLabel: string;
}) {
  const number = String(data.invoiceNumber || data.quoteNumber || data.poNumber || 'INV-001');
  const date = String(data.invoiceDate || data.date || data.orderDate || '');
  const dueDate = String(data.dueDate || data.validUntil || data.deliveryDate || '');
  const currency = String(data.currency || 'USD ($)');

  const sellerName = String(data.sellerName || data.companyName || data.supplierName || 'Studio Vertex LLC');
  const customerName = String(data.customerName || data.clientName || data.buyerName || 'Customer');
  const items = (data.items || []) as DocumentItem[];
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-8 sm:p-12 space-y-6 font-sans text-xs">
      <div className="flex justify-between items-start border-b pb-4 border-slate-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">{sellerName}</h1>
          <p className="text-slate-500 text-[11px] mt-0.5">Commercial Invoice Statement</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">{typeLabel} #{number}</p>
          <p className="text-slate-500">{date}</p>
          {dueDate && <p className="text-slate-500">Terms Due: {dueDate}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border border-slate-200 p-3 rounded bg-slate-50">
          <p className="font-bold text-[10px] uppercase text-slate-500 mb-1">From</p>
          <p className="font-bold text-slate-900">{sellerName}</p>
        </div>
        <div className="border border-slate-200 p-3 rounded bg-slate-50">
          <p className="font-bold text-[10px] uppercase text-slate-500 mb-1">Bill To</p>
          <p className="font-bold text-slate-900">{customerName}</p>
        </div>
      </div>

      <table className="w-full border border-slate-200 rounded overflow-hidden">
        <thead className="bg-slate-100 border-b border-slate-200">
          <tr>
            <th className="py-2 px-3 text-left">Item</th>
            <th className="py-2 px-3 text-right w-16">Qty</th>
            <th className="py-2 px-3 text-right w-24">Price</th>
            <th className="py-2 px-3 text-right w-24">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id || idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
              <td className="py-2 px-3">{it.description}</td>
              <td className="py-2 px-3 text-right">{it.quantity}</td>
              <td className="py-2 px-3 text-right">{Number(it.unitPrice).toFixed(2)}</td>
              <td className="py-2 px-3 text-right font-semibold">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end">
        <div className="w-56 p-3 bg-slate-100 rounded border border-slate-200 flex justify-between font-bold" style={{ color: template.accentColor }}>
          <span>Total Balance</span>
          <span>{currency} {subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Remittance Tear Slip */}
      <div className="pt-6 border-t border-dashed border-slate-300 mt-6 space-y-1 text-slate-500 text-[11px]">
        <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Payment Remittance Voucher</p>
        <p>Please detach and return with payment made payable to {sellerName}.</p>
      </div>
    </div>
  );
}

// 5. INVOICE CORPORATE: Bold top header band, dual address boxes, formal bank remittance panel
function InvoiceCorporateLayout({
  data,
  template,
  typeLabel,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
  typeLabel: string;
}) {
  const number = String(data.invoiceNumber || data.quoteNumber || data.poNumber || 'PO-001');
  const date = String(data.invoiceDate || data.date || data.orderDate || '');
  const currency = String(data.currency || 'USD');

  const sellerName = String(data.sellerName || data.companyName || data.supplierName || 'Enterprise Solutions');
  const customerName = String(data.customerName || data.clientName || data.buyerName || 'Buyer Corp');
  const items = (data.items || []) as DocumentItem[];
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="font-sans text-xs">
      {/* Top Banner */}
      <div className="p-8 text-white flex justify-between items-center" style={{ backgroundColor: template.accentColor }}>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{sellerName}</h1>
          <p className="text-xs text-white/80 mt-0.5">{typeLabel} Document</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-mono font-bold">#{number}</p>
          <p className="text-xs text-white/80">{date}</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="border p-3 rounded">
            <p className="font-bold text-[10px] text-slate-400 uppercase">Vendor</p>
            <p className="font-bold text-slate-900 mt-1">{sellerName}</p>
          </div>
          <div className="border p-3 rounded">
            <p className="font-bold text-[10px] text-slate-400 uppercase">Purchaser</p>
            <p className="font-bold text-slate-900 mt-1">{customerName}</p>
          </div>
        </div>

        <table className="w-full border-collapse border border-slate-200">
          <thead style={{ backgroundColor: template.softColor }}>
            <tr>
              <th className="py-2 px-3 text-left border-b font-bold" style={{ color: template.accentColor }}>Item</th>
              <th className="py-2 px-3 text-right border-b w-16 font-bold" style={{ color: template.accentColor }}>Qty</th>
              <th className="py-2 px-3 text-right border-b w-24 font-bold" style={{ color: template.accentColor }}>Rate</th>
              <th className="py-2 px-3 text-right border-b w-24 font-bold" style={{ color: template.accentColor }}>Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="py-2.5 px-3">{it.description}</td>
                <td className="py-2.5 px-3 text-right">{it.quantity}</td>
                <td className="py-2.5 px-3 text-right">{Number(it.unitPrice).toFixed(2)}</td>
                <td className="py-2.5 px-3 text-right font-bold">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-60 p-3 rounded border text-right space-y-1 font-bold" style={{ borderColor: template.accentColor, color: template.accentColor }}>
            <span className="text-xs uppercase mr-2">Total Due ({currency}):</span>
            <span className="text-base">{subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RECEIPT TEMPLATES - 3 DISTINCT STRUCTURAL LAYOUTS
// ============================================================================
function ReceiptLayoutDispatcher({
  data,
  template,
}: {
  data: Record<string, unknown>;
  template: DocumentTemplateMeta;
}) {
  switch (template.id) {
    case 'Minimal':
      return <ReceiptMinimalCardLayout data={data} />;
    case 'Modern':
      return <ReceiptModernVoucherLayout data={data} template={template} />;
    case 'Retail':
    default:
      return <ReceiptRetailThermalLayout data={data} />;
  }
}

// 1. RECEIPT RETAIL: Realistic thermal slip with serrated jagged edges, dashed tear lines, monospace font & barcode
function ReceiptRetailThermalLayout({ data }: { data: Record<string, unknown> }) {
  const store = String(data.store || 'Cafe & Bakery');
  const number = String(data.receiptNumber || 'REC-89211');
  const date = String(data.date || new Date().toISOString().slice(0, 10));
  const paymentMethod = String(data.paymentMethod || 'Credit Card •••• 4242');
  const currency = String(data.currency || 'USD ($)');
  const items = (data.items || []) as DocumentItem[];
  const notes = String(data.notes || 'Thank you for your business!');
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-6 sm:p-12 flex justify-center bg-slate-100/50">
      {/* Thermal Ticket */}
      <div className="w-full max-w-sm bg-white border-x border-slate-300 shadow-md font-mono text-xs text-slate-900 p-6 space-y-4 relative">
        {/* Serrated top edge styling */}
        <div className="text-center space-y-1 border-b-2 border-dashed border-slate-300 pb-4">
          <h2 className="text-lg font-black tracking-wider uppercase">{store}</h2>
          <p className="text-[11px] text-slate-500">REGISTER TICKET #{number}</p>
          <p className="text-[10px] text-slate-400">{date} · {paymentMethod}</p>
        </div>

        <div className="space-y-2 divide-y divide-slate-100">
          {items.map((it, idx) => (
            <div key={it.id || idx} className="pt-2 flex justify-between items-baseline">
              <div>
                <p className="font-bold">{it.description}</p>
                <p className="text-[10px] text-slate-400">{it.quantity} @ {Number(it.unitPrice).toFixed(2)}</p>
              </div>
              <span className="font-bold">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1.5 font-bold">
          <div className="flex justify-between text-base">
            <span>TOTAL ({currency})</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Barcode representation */}
        <div className="pt-4 border-t border-slate-200 text-center space-y-2">
          <div className="h-10 w-48 mx-auto flex items-center justify-center gap-0.5">
            {Array.from({ length: 42 }).map((_, i) => (
              <span
                key={i}
                className="h-8 bg-black inline-block"
                style={{ width: `${(i % 3) + 1}px`, margin: '0 1px' }}
              />
            ))}
          </div>
          <p className="text-[9px] text-slate-400 font-mono tracking-widest">*{number}*</p>
          {notes && <p className="text-[11px] text-slate-500 italic mt-1">{notes}</p>}
        </div>
      </div>
    </div>
  );
}

// 2. RECEIPT MINIMAL: Clean digital app transaction card with status badge and payment checkmark
function ReceiptMinimalCardLayout({ data }: { data: Record<string, unknown> }) {
  const store = String(data.store || 'App Store');
  const number = String(data.receiptNumber || 'REC-89211');
  const date = String(data.date || new Date().toISOString().slice(0, 10));
  const paymentMethod = String(data.paymentMethod || 'Apple Pay');
  const items = (data.items || []) as DocumentItem[];
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-8 sm:p-14 flex justify-center font-sans">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Check className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{store}</h2>
            <p className="text-xs text-slate-500">Payment Verified · #{number}</p>
          </div>
        </div>

        <div className="space-y-3">
          {items.map((it, idx) => (
            <div key={it.id || idx} className="flex justify-between items-baseline text-xs">
              <span className="text-slate-800 font-medium">{it.description} <span className="text-slate-400">×{it.quantity}</span></span>
              <span className="font-semibold text-slate-900">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-between items-baseline">
          <div>
            <p className="text-xs text-slate-500">Total Paid via {paymentMethod}</p>
            <p className="text-[11px] text-slate-400">{date}</p>
          </div>
          <span className="text-2xl font-black text-slate-950">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// 3. RECEIPT MODERN: Business voucher format with corporate header, verified stamp badge & item table
function ReceiptModernVoucherLayout({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const store = String(data.store || 'Metro Merchant');
  const number = String(data.receiptNumber || 'REC-89211');
  const date = String(data.date || new Date().toISOString().slice(0, 10));
  const items = (data.items || []) as DocumentItem[];
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? (Number(it.quantity || 1) * Number(it.unitPrice || 0))), 0);

  return (
    <div className="p-8 sm:p-12 font-sans text-xs space-y-6">
      <div className="p-4 rounded-xl border flex justify-between items-center" style={{ borderColor: template.accentColor, backgroundColor: template.softColor }}>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Commercial Receipt</span>
          <h2 className="text-xl font-bold text-slate-900">{store}</h2>
          <p className="text-slate-600">Reference: {number}</p>
        </div>
        <div className="border-2 border-emerald-600 text-emerald-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] bg-white">
          <ShieldCheck className="h-4 w-4" /> Paid &amp; Settled
        </div>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="py-2 px-3">Item Details</th>
              <th className="py-2 px-3 text-right">Qty</th>
              <th className="py-2 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((it, idx) => (
              <tr key={it.id || idx}>
                <td className="py-2.5 px-3 font-medium">{it.description}</td>
                <td className="py-2.5 px-3 text-right text-slate-500">{it.quantity}</td>
                <td className="py-2.5 px-3 text-right font-bold">{(it.total ?? (it.quantity * it.unitPrice)).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-2">
        <span className="text-slate-500">Date: {date}</span>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-500 mr-2">Total Amount:</span>
          <span className="text-xl font-extrabold text-slate-900">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// REPORT & EXPENSE LAYOUTS
// ============================================================================
function ReportLayoutDispatcher({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const title = String(data.title || 'Executive Analysis');
  const subtitle = String(data.subtitle || '');
  const author = String(data.author || 'Author');
  const date = String(data.date || '');
  const summary = String(data.summary || '');
  const sections = (data.sections || []) as ReportSection[];
  const recommendations = String(data.recommendations || '');

  return (
    <div className="p-8 sm:p-14 space-y-8 font-sans">
      <header className="border-b pb-6" style={{ borderColor: template.accentColor }}>
        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: template.softColor, color: template.accentColor }}>
          Report
        </span>
        <h1 className="text-3xl font-extrabold text-slate-950 mt-2">{title}</h1>
        {subtitle && <p className="text-sm font-semibold mt-1" style={{ color: template.accentColor }}>{subtitle}</p>}
        <p className="text-xs text-slate-500 mt-2">{[author, date].filter(Boolean).join(' · ')}</p>
      </header>

      {summary && (
        <section className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/60">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: template.accentColor }}>Executive Summary</h2>
          <p className="text-xs text-slate-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {sections.map((sec) => (
        <section key={sec.id} className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-1" style={{ color: template.accentColor }}>
            {sec.title}
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{sec.content}</p>
        </section>
      ))}

      {recommendations && (
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: template.accentColor }}>Key Recommendations</h3>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{recommendations}</p>
        </section>
      )}
    </div>
  );
}

function ExpenseLayoutDispatcher({ data, template }: { data: Record<string, unknown>; template: DocumentTemplateMeta }) {
  const title = String(data.title || 'Expense Claim');
  const employee = String(data.employee || 'Claimant');
  const department = String(data.department || '');
  const date = String(data.date || '');
  const currency = String(data.currency || 'USD ($)');
  const expenses = (data.expenses || []) as ExpenseItem[];
  const notes = String(data.notes || '');

  const total = expenses.reduce((acc, ex) => acc + (Number(ex.amount) || 0), 0);

  return (
    <div className="p-8 sm:p-12 space-y-6 font-sans text-xs">
      <header className="border-b pb-4 flex justify-between items-baseline" style={{ borderColor: template.accentColor }}>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">Claimant: {employee} {department ? `· ${department}` : ''} {date ? `· ${date}` : ''}</p>
        </div>
        <span className="text-xs font-bold uppercase px-2.5 py-1 rounded" style={{ backgroundColor: template.softColor, color: template.accentColor }}>
          Expense Report
        </span>
      </header>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
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
        <div className="pt-4 border-t border-slate-200 text-slate-600">
          <p className="font-semibold text-slate-800 text-[10px] uppercase mb-1">Notes</p>
          <p className="leading-relaxed whitespace-pre-wrap">{notes}</p>
        </div>
      )}
    </div>
  );
}

function GenericLayoutDispatcher({
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
    <div className="p-8 sm:p-12 space-y-6 font-sans text-xs">
      <header className="border-b pb-4" style={{ borderColor: template.accentColor }}>
        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: template.softColor, color: template.accentColor }}>
          {typeName}
        </span>
        <h1 className="text-2xl font-bold text-slate-950 mt-2">{title}</h1>
      </header>

      <div className="space-y-3">
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
