import type {
  CvEducation,
  CvExperience,
  DocumentDefinition,
  DocumentItem,
  DocumentType,
  ExpenseItem,
  NormalizedDocumentData,
  ReportSection,
} from './types';

export const documentRegistry: Record<DocumentType, DocumentDefinition> = {
  cv: {
    type: 'cv',
    label: 'CV / Resume',
    description: 'A structured profile showcasing experience, skills, and education.',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    defaultTemplate: 'Modern',
    templates: [
      { id: 'Modern', name: 'Modern', category: 'Creative', description: 'Clean split-column layout with accent header and visual skill tags.', accentColor: '#2563eb', softColor: '#eff6ff', fontFamily: 'sans' },
      { id: 'Professional', name: 'Professional', category: 'Executive', description: 'Polished corporate resume with classic horizontal dividers.', accentColor: '#0f172a', softColor: '#f8fafc', fontFamily: 'serif' },
      { id: 'Minimal', name: 'Minimal', category: 'Modern', description: 'Swiss-inspired typography with generous whitespace and clear hierarchy.', accentColor: '#334155', softColor: '#f1f5f9', fontFamily: 'sans' },
      { id: 'Corporate', name: 'Corporate', category: 'Business', description: 'Deep slate tone with sidebar contact info and structured experience timeline.', accentColor: '#1e3a8a', softColor: '#f0f9ff', fontFamily: 'sans' },
      { id: 'European-style', name: 'European-style', category: 'Standard', description: 'Structured grid inspired by European Europass CV standards.', accentColor: '#047857', softColor: '#ecfdf5', fontFamily: 'sans' },
    ],
    exportFormats: ['pdf', 'excel', 'json'],
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        kind: 'fields',
        fields: [
          { key: 'fullName', label: 'Full Name', placeholder: 'Jane Doe', required: true },
          { key: 'jobTitle', label: 'Target Job Title', placeholder: 'Senior Product Designer' },
          { key: 'email', label: 'Email Address', type: 'email', placeholder: 'jane@example.com' },
          { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 234-5678' },
          { key: 'location', label: 'Location / City', placeholder: 'San Francisco, CA' },
          { key: 'website', label: 'Portfolio / Website', type: 'url', placeholder: 'https://janedoe.design' },
          { key: 'linkedin', label: 'LinkedIn URL', type: 'url', placeholder: 'https://linkedin.com/in/janedoe' },
        ],
      },
      {
        id: 'summarySection',
        title: 'Professional Summary',
        kind: 'fields',
        fields: [
          { key: 'summary', label: 'Summary / Bio', multiline: true, placeholder: 'Experienced product designer with over 8 years in design systems and consumer tech...' },
          { key: 'skills', label: 'Skills (comma separated)', placeholder: 'Figma, Design Systems, React, TypeScript, User Research, Prototyping' },
        ],
      },
      {
        id: 'experienceSection',
        title: 'Work Experience',
        kind: 'experience',
      },
      {
        id: 'educationSection',
        title: 'Education',
        kind: 'education',
      },
    ],
  },

  invoice: {
    type: 'invoice',
    label: 'Invoice',
    description: 'Itemized commercial invoice with seller/customer details and automatic totals.',
    badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
    defaultTemplate: 'Modern',
    templates: [
      { id: 'Modern', name: 'Modern', category: 'Digital', description: 'Vibrant indigo header with structured item cards and bold total highlights.', accentColor: '#2563eb', softColor: '#eff6ff', fontFamily: 'sans' },
      { id: 'Professional', name: 'Professional', category: 'Corporate', description: 'Classic corporate billing format with clean borders and prominent payment terms.', accentColor: '#0f172a', softColor: '#f8fafc', fontFamily: 'sans' },
      { id: 'Corporate', name: 'Corporate', category: 'Enterprise', description: 'Deep emerald banner with clear vendor registration and structured ledger.', accentColor: '#065f46', softColor: '#ecfdf5', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Understated elegance, hairline dividers, and monospace tabular figures.', accentColor: '#475569', softColor: '#f8fafc', fontFamily: 'mono' },
      { id: 'Classic', name: 'Classic', category: 'Traditional', description: 'Refined serif typography with traditional double rule accents.', accentColor: '#831843', softColor: '#fdf2f8', fontFamily: 'serif' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'invoiceMeta',
        title: 'Invoice Details',
        kind: 'fields',
        fields: [
          { key: 'invoiceNumber', label: 'Invoice #', placeholder: 'INV-2026-001', required: true },
          { key: 'invoiceDate', label: 'Invoice Date', type: 'date' },
          { key: 'dueDate', label: 'Due Date', type: 'date' },
          { key: 'currency', label: 'Currency', placeholder: 'USD ($)' },
          { key: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: '10' },
          { key: 'discount', label: 'Discount Amount', type: 'number', placeholder: '0' },
        ],
      },
      {
        id: 'parties',
        title: 'Parties',
        kind: 'fields',
        fields: [
          { key: 'sellerName', label: 'Seller / Company Name', placeholder: 'Acme Studio Inc.' },
          { key: 'sellerEmail', label: 'Seller Email', type: 'email', placeholder: 'billing@acmestudio.com' },
          { key: 'sellerAddress', label: 'Seller Address', multiline: true, placeholder: '123 Market St, Suite 400\nSan Francisco, CA 94103' },
          { key: 'customerName', label: 'Bill To / Customer Name', placeholder: 'Starlight Retailers' },
          { key: 'customerEmail', label: 'Customer Email', type: 'email', placeholder: 'ap@starlight.com' },
          { key: 'customerAddress', label: 'Customer Address', multiline: true, placeholder: '789 Broadway Ave\nNew York, NY 10003' },
        ],
      },
      {
        id: 'itemsSection',
        title: 'Line Items',
        kind: 'items',
      },
      {
        id: 'paymentNotes',
        title: 'Payment Details & Notes',
        kind: 'fields',
        fields: [
          { key: 'notes', label: 'Client Notes', multiline: true, placeholder: 'Thank you for your business! Please remit payment within 14 days.' },
          { key: 'terms', label: 'Terms & Bank Info', multiline: true, placeholder: 'Wire Transfer: Routing 021000021, Account 987654321, IBAN US89...' },
        ],
      },
    ],
  },

  receipt: {
    type: 'receipt',
    label: 'Receipt',
    description: 'Clean transaction record documenting purchase, payment, and items.',
    badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    defaultTemplate: 'Retail',
    templates: [
      { id: 'Retail', name: 'Retail', category: 'Point of Sale', description: 'Classic retail register ticket with serrated edges and center alignment.', accentColor: '#1e293b', softColor: '#f1f5f9', fontFamily: 'mono' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Crisp digital receipt with clean item summary and payment confirmation.', accentColor: '#0284c7', softColor: '#f0f9ff', fontFamily: 'sans' },
      { id: 'Modern', name: 'Modern', category: 'Card', description: 'Modern card format with green verified stamp and itemized breakdown.', accentColor: '#059669', softColor: '#ecfdf5', fontFamily: 'sans' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'receiptMeta',
        title: 'Receipt Details',
        kind: 'fields',
        fields: [
          { key: 'receiptNumber', label: 'Receipt #', placeholder: 'REC-89211' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'store', label: 'Store / Business Name', placeholder: 'Metro Coffee & Bakery' },
          { key: 'paymentMethod', label: 'Payment Method', placeholder: 'Visa ending in 4242' },
          { key: 'currency', label: 'Currency', placeholder: 'USD ($)' },
          { key: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: '8.5' },
        ],
      },
      {
        id: 'itemsSection',
        title: 'Purchased Items',
        kind: 'items',
      },
      {
        id: 'notesSection',
        title: 'Notes & Footer',
        kind: 'fields',
        fields: [
          { key: 'notes', label: 'Receipt Note', multiline: true, placeholder: 'Thank you for visiting! Keep this receipt for your records.' },
        ],
      },
    ],
  },

  quotation: {
    type: 'quotation',
    label: 'Quotation',
    description: 'Commercial price estimate with project scope, deliverables, and terms.',
    badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
    defaultTemplate: 'Modern',
    templates: [
      { id: 'Modern', name: 'Modern', category: 'Proposal', description: 'Dynamic estimate sheet with scope cards and bold validity badge.', accentColor: '#7c3aed', softColor: '#f5f3ff', fontFamily: 'sans' },
      { id: 'Professional', name: 'Professional', category: 'Executive', description: 'Formal commercial proposal with client acceptance signature area.', accentColor: '#1e293b', softColor: '#f8fafc', fontFamily: 'sans' },
      { id: 'Classic', name: 'Classic', category: 'Formal', description: 'Refined proposal layout with traditional typography.', accentColor: '#9f1239', softColor: '#fff1f2', fontFamily: 'serif' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'quoteMeta',
        title: 'Quotation Details',
        kind: 'fields',
        fields: [
          { key: 'quoteNumber', label: 'Quote #', placeholder: 'QT-2026-104' },
          { key: 'date', label: 'Quote Date', type: 'date' },
          { key: 'validUntil', label: 'Valid Until', type: 'date' },
          { key: 'currency', label: 'Currency', placeholder: 'USD ($)' },
          { key: 'taxRate', label: 'Tax Rate (%)', type: 'number', placeholder: '8' },
        ],
      },
      {
        id: 'parties',
        title: 'Company & Client',
        kind: 'fields',
        fields: [
          { key: 'companyName', label: 'Provider / Company', placeholder: 'Apex Creative Solutions' },
          { key: 'companyAddress', label: 'Company Address', multiline: true, placeholder: '500 Tech Blvd\nAustin, TX 78701' },
          { key: 'clientName', label: 'Client / Prospect', placeholder: 'Horizon Ventures' },
          { key: 'clientAddress', label: 'Client Address', multiline: true, placeholder: '120 Innovation Way\nBoston, MA 02110' },
        ],
      },
      {
        id: 'itemsSection',
        title: 'Proposed Scope & Items',
        kind: 'items',
      },
      {
        id: 'quoteTerms',
        title: 'Terms & Conditions',
        kind: 'fields',
        fields: [
          { key: 'notes', label: 'Scope Notes', multiline: true, placeholder: 'Prices are valid for 30 days. Estimated timeline: 4-6 weeks from kickoff.' },
          { key: 'terms', label: 'Terms of Acceptance', multiline: true, placeholder: '50% deposit upon signing, 50% upon final delivery.' },
        ],
      },
    ],
  },

  purchase_order: {
    type: 'purchase_order',
    label: 'Purchase Order',
    description: 'Formal procurement order detailing buyer, supplier, and delivery requirements.',
    badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
    defaultTemplate: 'Corporate',
    templates: [
      { id: 'Corporate', name: 'Corporate', category: 'Procurement', description: 'Authoritative procurement layout with dual shipping and billing details.', accentColor: '#1e3a8a', softColor: '#eff6ff', fontFamily: 'sans' },
      { id: 'Modern', name: 'Modern', category: 'Clean', description: 'Contemporary layout with clear PO reference number and order schedule.', accentColor: '#0d9488', softColor: '#f0fdfa', fontFamily: 'sans' },
      { id: 'Classic', name: 'Classic', category: 'Standard', description: 'Structured multi-column order with formal authorization signature lines.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'serif' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'poMeta',
        title: 'PO Information',
        kind: 'fields',
        fields: [
          { key: 'poNumber', label: 'PO #', placeholder: 'PO-99420' },
          { key: 'orderDate', label: 'Order Date', type: 'date' },
          { key: 'deliveryDate', label: 'Required Delivery Date', type: 'date' },
          { key: 'currency', label: 'Currency', placeholder: 'USD ($)' },
        ],
      },
      {
        id: 'parties',
        title: 'Supplier & Buyer',
        kind: 'fields',
        fields: [
          { key: 'supplierName', label: 'Supplier Name', placeholder: 'Industrial Supplies Global' },
          { key: 'supplierAddress', label: 'Supplier Address', multiline: true, placeholder: '10 Logistics Way\nChicago, IL 60601' },
          { key: 'buyerName', label: 'Buyer Organization', placeholder: 'Pacific Manufacturing Corp' },
          { key: 'shippingAddress', label: 'Shipping / Delivery Address', multiline: true, placeholder: 'Warehouse Dock 4\nSan Jose, CA 95112' },
        ],
      },
      {
        id: 'itemsSection',
        title: 'Ordered Products & Parts',
        kind: 'items',
      },
      {
        id: 'termsSection',
        title: 'Delivery Terms & Notes',
        kind: 'fields',
        fields: [
          { key: 'shippingMethod', label: 'Shipping Method / Freight', placeholder: 'FOB Destination / FedEx Freight' },
          { key: 'notes', label: 'Instructions & Notes', multiline: true, placeholder: 'Include packing slips with all cartons. Direct inquiries to receiving.' },
        ],
      },
    ],
  },

  report: {
    type: 'report',
    label: 'Report',
    description: 'Structured business or technical report with executive summary and key findings.',
    badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    defaultTemplate: 'Executive',
    templates: [
      { id: 'Executive', name: 'Executive', category: 'Briefing', description: 'Polished executive report with key takeaway metrics and structured sections.', accentColor: '#0f172a', softColor: '#f8fafc', fontFamily: 'serif' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Minimalist editorial layout with crisp headers and readable typography.', accentColor: '#475569', softColor: '#f1f5f9', fontFamily: 'sans' },
      { id: 'Modern', name: 'Modern', category: 'Contemporary', description: 'Modern briefing document with vibrant accent markers and callout boxes.', accentColor: '#e11d48', softColor: '#fff1f2', fontFamily: 'sans' },
    ],
    exportFormats: ['pdf', 'excel', 'json'],
    sections: [
      {
        id: 'reportMeta',
        title: 'Report Overview',
        kind: 'fields',
        fields: [
          { key: 'title', label: 'Report Title', placeholder: 'Q3 Product & Growth Analysis', required: true },
          { key: 'subtitle', label: 'Subtitle / Department', placeholder: 'Strategic Operations & Intelligence' },
          { key: 'author', label: 'Author / Prepared By', placeholder: 'Sarah Jenkins, Principal Analyst' },
          { key: 'date', label: 'Date', type: 'date' },
        ],
      },
      {
        id: 'execSummary',
        title: 'Executive Summary',
        kind: 'fields',
        fields: [
          { key: 'summary', label: 'Executive Summary', multiline: true, placeholder: 'Key highlights, performance summaries, and high-level findings...' },
        ],
      },
      {
        id: 'reportSections',
        title: 'Report Sections & Findings',
        kind: 'sections',
      },
      {
        id: 'recommendationsSection',
        title: 'Conclusions & Next Steps',
        kind: 'fields',
        fields: [
          { key: 'recommendations', label: 'Recommendations', multiline: true, placeholder: 'Recommended immediate actions, roadmap priorities, and resource allocation.' },
        ],
      },
    ],
  },

  expense_report: {
    type: 'expense_report',
    label: 'Expense Document',
    description: 'Categorized business expense claim with itemized receipts and reimbursement totals.',
    badgeColor: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
    defaultTemplate: 'Corporate',
    templates: [
      { id: 'Corporate', name: 'Corporate', category: 'Finance', description: 'Formal expense claim form with employee signature and department codes.', accentColor: '#0f766e', softColor: '#f0fdfa', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Streamlined reconciliation table with clear category totals.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'sans' },
      { id: 'Spreadsheet', name: 'Spreadsheet', category: 'Accounting', description: 'Structured ledger style with grid lines and category analysis.', accentColor: '#1e3a8a', softColor: '#eff6ff', fontFamily: 'mono' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'expenseMeta',
        title: 'Expense Claim Info',
        kind: 'fields',
        fields: [
          { key: 'title', label: 'Claim Title', placeholder: 'Client Visit & Conference Travel - Q2' },
          { key: 'employee', label: 'Employee Name', placeholder: 'David Miller' },
          { key: 'department', label: 'Department / Team', placeholder: 'Product Engineering' },
          { key: 'date', label: 'Submission Date', type: 'date' },
          { key: 'currency', label: 'Currency', placeholder: 'USD ($)' },
        ],
      },
      {
        id: 'expenseItems',
        title: 'Expense Items',
        kind: 'expenses',
      },
      {
        id: 'notesSection',
        title: 'Approval & Policy Notes',
        kind: 'fields',
        fields: [
          { key: 'notes', label: 'Notes / Justification', multiline: true, placeholder: 'All receipts attached. Lodging and travel within standard corporate travel policy.' },
        ],
      },
    ],
  },

  payslip: {
    type: 'payslip',
    label: 'Payslip',
    description: 'Earnings and payroll statement.',
    badgeColor: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20',
    defaultTemplate: 'Professional',
    templates: [
      { id: 'Professional', name: 'Professional', category: 'Payroll', description: 'Structured payslip layout.', accentColor: '#0891b2', softColor: '#ecfeff', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Clean payroll summary.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'mono' },
    ],
    exportFormats: ['pdf', 'excel', 'json'],
    sections: [
      {
        id: 'meta',
        title: 'Payslip Details',
        kind: 'fields',
        fields: [
          { key: 'employee', label: 'Employee' },
          { key: 'date', label: 'Pay Period Date', type: 'date' },
          { key: 'notes', label: 'Extracted Content', multiline: true },
        ],
      },
    ],
  },

  bank_statement: {
    type: 'bank_statement',
    label: 'Bank Statement',
    description: 'Account activity and transaction overview.',
    badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    defaultTemplate: 'Professional',
    templates: [
      { id: 'Professional', name: 'Professional', category: 'Banking', description: 'Structured financial statement.', accentColor: '#047857', softColor: '#ecfdf5', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Clean statement layout.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'mono' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'meta',
        title: 'Statement Details',
        kind: 'fields',
        fields: [
          { key: 'title', label: 'Account / Title' },
          { key: 'date', label: 'Period Date', type: 'date' },
          { key: 'notes', label: 'Extracted Content', multiline: true },
        ],
      },
    ],
  },

  product_catalog: {
    type: 'product_catalog',
    label: 'Product Catalog',
    description: 'Structured listing of products and specifications.',
    badgeColor: 'bg-violet-500/10 text-violet-700 border-violet-500/20',
    defaultTemplate: 'Modern',
    templates: [
      { id: 'Modern', name: 'Modern', category: 'Catalog', description: 'Modern product brochure layout.', accentColor: '#7c3aed', softColor: '#f5f3ff', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Clean product listing.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'sans' },
    ],
    exportFormats: ['pdf', 'excel', 'json'],
    sections: [
      {
        id: 'meta',
        title: 'Catalog Details',
        kind: 'fields',
        fields: [
          { key: 'title', label: 'Catalog Title' },
          { key: 'notes', label: 'Content', multiline: true },
        ],
      },
    ],
  },

  unknown: {
    type: 'unknown',
    label: 'Custom Document',
    description: 'Universal document editor with flexible structured fields.',
    badgeColor: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
    defaultTemplate: 'Modern',
    templates: [
      { id: 'Modern', name: 'Modern', category: 'General', description: 'Contemporary layout for any document type.', accentColor: '#2563eb', softColor: '#eff6ff', fontFamily: 'sans' },
      { id: 'Minimal', name: 'Minimal', category: 'Clean', description: 'Ultra-clean text presentation.', accentColor: '#334155', softColor: '#f8fafc', fontFamily: 'sans' },
      { id: 'Classic', name: 'Classic', category: 'Formal', description: 'Traditional serif layout.', accentColor: '#831843', softColor: '#fff1f2', fontFamily: 'serif' },
    ],
    exportFormats: ['pdf', 'excel', 'csv', 'json'],
    sections: [
      {
        id: 'general',
        title: 'Document Details',
        kind: 'fields',
        fields: [
          { key: 'title', label: 'Document Title' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'author', label: 'Author / Organization' },
          { key: 'summary', label: 'Summary / Notes', multiline: true },
        ],
      },
    ],
  },
};

export function definitionFor(type: DocumentType): DocumentDefinition {
  return documentRegistry[type] ?? documentRegistry.unknown;
}

export function sampleDataFor(type: DocumentType, today: string): Record<string, unknown> {
  switch (type) {
    case 'cv':
      return {
        fullName: 'Alex Vance',
        jobTitle: 'Senior Product Designer',
        email: 'alex.vance@example.com',
        phone: '+1 (555) 482-9012',
        location: 'San Francisco, CA',
        website: 'https://alexvance.design',
        linkedin: 'https://linkedin.com/in/alexvance',
        summary:
          'Versatile Lead Product Designer with 9+ years creating scalable enterprise web apps and consumer products. Passionate about design systems, clean typography, and intuitive user experiences.',
        skills: 'Design Systems, Figma, UX Strategy, Prototyping, React, Tailwind CSS, User Testing, Information Architecture',
        experience: [
          {
            id: 'exp-1',
            company: 'Veloce Design Labs',
            role: 'Lead Product Designer',
            period: '2021 — Present',
            location: 'San Francisco, CA',
            description:
              'Architected the company multi-brand design system used by 45+ engineers and designers. Reduced frontend build cycle times by 35%. Mentored 4 junior designers.',
          },
          {
            id: 'exp-2',
            company: 'Stratos Cloud',
            role: 'Senior UI/UX Designer',
            period: '2018 — 2021',
            location: 'Remote',
            description:
              'Redesigned core cloud telemetry dashboard, resulting in a 42% lift in daily active users and 18% reduction in support tickets.',
          },
        ] as CvExperience[],
        education: [
          {
            id: 'edu-1',
            institution: 'California College of the Arts',
            degree: 'B.F.A. in Interaction Design',
            period: '2014 — 2018',
            location: 'San Francisco, CA',
            details: 'Graduated Magna Cum Laude. President of AIGA Student Chapter.',
          },
        ] as CvEducation[],
      };

    case 'invoice':
      return {
        invoiceNumber: 'INV-2026-0842',
        invoiceDate: today,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
        currency: 'USD ($)',
        taxRate: 8.5,
        discount: 0,
        sellerName: 'Studio Vertex LLC',
        sellerEmail: 'billing@studiovertex.io',
        sellerAddress: '100 Montgomery St, Suite 1200\nSan Francisco, CA 94104',
        customerName: 'Kallisto Media Partners',
        customerEmail: 'invoices@kallistomedia.com',
        customerAddress: '450 Lexington Ave, 18th Floor\nNew York, NY 10017',
        items: [
          { id: 'item-1', description: 'Product Design & Prototype Sprint (Sprint 1-2)', quantity: 1, unitPrice: 4200, total: 4200 },
          { id: 'item-2', description: 'Frontend Component Library Implementation', quantity: 36, unitPrice: 125, total: 4500 },
          { id: 'item-3', description: 'User Acceptance Testing & QA Review', quantity: 1, unitPrice: 950, total: 950 },
        ] as DocumentItem[],
        notes: 'Thank you for partnering with Studio Vertex! Payment is due within 14 days of invoice date.',
        terms: 'Direct Deposit: Routing 121000358 · Account 9876543201 · Bank of America\nPlease reference INV-2026-0842 on remittance.',
      };

    case 'receipt':
      return {
        receiptNumber: 'RC-99381',
        date: today,
        store: 'Blue Bottle Coffee & Roastery',
        paymentMethod: 'Apple Pay (Mastercard •••• 7192)',
        currency: 'USD ($)',
        taxRate: 8.75,
        items: [
          { id: 'r-1', description: 'Bella Donovan Whole Bean (12oz)', quantity: 2, unitPrice: 19.5, total: 39.0 },
          { id: 'r-2', description: 'Single Origin Espresso Macchiato', quantity: 1, unitPrice: 5.25, total: 5.25 },
          { id: 'r-3', description: 'Almond Croissant', quantity: 2, unitPrice: 4.75, total: 9.5 },
        ] as DocumentItem[],
        notes: 'Thank you for your visit! Follow @bluebottle for brew guides and beans.',
      };

    case 'quotation':
      return {
        quoteNumber: 'QT-2026-309',
        date: today,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        currency: 'USD ($)',
        taxRate: 8,
        companyName: 'Apex Web Architects',
        companyAddress: '88 Tech Boulevard, Suite 500\nAustin, TX 78701\ncontact@apexweb.co',
        clientName: 'Meridian Capital Group',
        clientAddress: '200 Park Avenue South\nNew York, NY 10003',
        items: [
          { id: 'q-1', description: 'Discovery, User Interviews & Architecture Plan', quantity: 1, unitPrice: 3500, total: 3500 },
          { id: 'q-2', description: 'Web Application Development (Next.js & Supabase)', quantity: 1, unitPrice: 12000, total: 12000 },
          { id: 'q-3', description: 'Data Migration & Performance Optimization', quantity: 1, unitPrice: 2800, total: 2800 },
        ] as DocumentItem[],
        notes: 'Quotation includes 30 days of post-launch hypercare support and documentation.',
        terms: '50% upfront payment upon project initiation. Remaining balance upon staging approval.',
      };

    case 'purchase_order':
      return {
        poNumber: 'PO-88214',
        orderDate: today,
        deliveryDate: new Date(Date.now() + 21 * 86400000).toISOString().slice(0, 10),
        currency: 'USD ($)',
        supplierName: 'Precision Hardware Supplies',
        supplierAddress: '720 Industrial Way, Bldg C\nCleveland, OH 44114',
        buyerName: 'Cascade Robotics Corp',
        shippingAddress: 'Cascade Robotics — Receiving Dock 2\n1400 Northway Parkway, Seattle, WA 98101',
        shippingMethod: 'FedEx Priority Freight (Ground)',
        items: [
          { id: 'po-1', description: 'Titanium M4 Socket Head Screws (Pack of 500)', quantity: 8, unitPrice: 64.5, total: 516 },
          { id: 'po-2', description: 'High-Precision Stepper Motor 24V NEMA 17', quantity: 24, unitPrice: 38.0, total: 912 },
          { id: 'po-3', description: 'Optical Encoders 1024 PPR with Shielded Cable', quantity: 12, unitPrice: 85.0, total: 1020 },
        ] as DocumentItem[],
        notes: 'Packing slips must be attached to the exterior of each container. Inspect upon arrival.',
      };

    case 'report':
      return {
        title: 'Q3 Product & Growth Analysis',
        subtitle: 'Product Operations & Growth Intelligence',
        author: 'Sarah Jenkins, Principal Analyst',
        date: today,
        summary:
          'This report analyzes Q3 user onboarding friction, product retention curves, and monetization milestones following the release of Document Studio 2.0. Overall retention improved by 28% month-over-month.',
        sections: [
          {
            id: 'sec-1',
            title: '1. Executive Summary & Key Milestones',
            content:
              'In Q3, platform sign-ups increased by 44% following the launch of browser-based document parsing. Core conversion from document upload to completed export reached 79.4%, outperforming our baseline projection of 65%.',
          },
          {
            id: 'sec-2',
            title: '2. User Retention & Document Type Breakdown',
            content:
              'CV / Resume edits constituted 41% of processed documents, followed closely by Invoices (33%), Receipts (14%), and Business Reports (12%). Average editing time per document dropped from 7.2 minutes to 2.4 minutes with dynamic pre-fill.',
          },
        ] as ReportSection[],
        recommendations:
          '1. Expand supported template gallery for European invoice standards.\n2. Implement instant batch export for multi-receipt expense bundles.\n3. Add direct team sharing links for enterprise workspaces.',
      };

    case 'expense_report':
      return {
        title: 'Tech Summit & Client Onsite Travel',
        employee: 'David Miller',
        department: 'Engineering / Solutions',
        date: today,
        currency: 'USD ($)',
        expenses: [
          { id: 'e-1', date: today, category: 'Flight', description: 'Roundtrip SFO to JFK (Delta Air Lines)', amount: 540.2 },
          { id: 'e-2', date: today, category: 'Lodging', description: 'Hotel Midtown (3 nights)', amount: 720.0 },
          { id: 'e-3', date: today, category: 'Meals', description: 'Client Dinner at Gramercy Tavern', amount: 215.5 },
          { id: 'e-4', date: today, category: 'Transit', description: 'JFK Airport Taxi / Rideshare', amount: 68.0 },
        ] as ExpenseItem[],
        notes: 'All original receipts uploaded and verified against per-diem corporate guidelines.',
      };

    default:
      return {
        title: 'Imported Document',
        date: today,
        author: 'AI Document Studio',
        summary: 'Extracted document content ready for review and styling.',
        notes: '',
      };
  }
}

export function initialDataFor(
  type: DocumentType,
  text: string,
  fileName: string,
  today: string,
  rawParsed?: Record<string, unknown>
): Record<string, unknown> {
  const defaults = sampleDataFor(type, today);

  // If we have AI or parser parsed data, merge it nicely
  if (rawParsed && Object.keys(rawParsed).length > 0) {
    return {
      ...defaults,
      ...rawParsed,
      extractedText: text || String(rawParsed.extractedText || ''),
    };
  }

  // Otherwise, use heuristic extraction to populate from raw text if present
  if (text) {
    const extracted: Record<string, unknown> = { ...defaults };
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/);
    const dateMatch = text.match(/\b\d{4}[-/.]\d{1,2}[-/.]\d{1,2}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/i);

    if (type === 'cv') {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) extracted.fullName = lines[0].replace(/^(Name:?|Curriculum Vitae|Resume)\s*/i, '');
      if (emailMatch) extracted.email = emailMatch[0];
      if (phoneMatch) extracted.phone = phoneMatch[0];
      extracted.summary = text.slice(0, 500);
    } else if (type === 'invoice') {
      const invMatch = text.match(/(?:invoice|inv|bill)\s*(?:#|no\.?|num)?\s*[:.\s]?\s*([a-zA-Z0-9-_]+)/i);
      if (invMatch) extracted.invoiceNumber = invMatch[1];
      if (dateMatch) extracted.invoiceDate = dateMatch[0];
    } else if (type === 'receipt') {
      const recMatch = text.match(/(?:receipt|rcpt|order)\s*(?:#|no\.?)?\s*[:.\s]?\s*([a-zA-Z0-9-_]+)/i);
      if (recMatch) extracted.receiptNumber = recMatch[1];
      if (dateMatch) extracted.date = dateMatch[0];
    } else if (type === 'quotation') {
      const qMatch = text.match(/(?:quote|quotation|estimate)\s*(?:#|no\.?)?\s*[:.\s]?\s*([a-zA-Z0-9-_]+)/i);
      if (qMatch) extracted.quoteNumber = qMatch[1];
    } else if (type === 'purchase_order') {
      const poMatch = text.match(/(?:purchase order|po|p\.o\.)\s*(?:#|no\.?)?\s*[:.\s]?\s*([a-zA-Z0-9-_]+)/i);
      if (poMatch) extracted.poNumber = poMatch[1];
    }

    extracted.extractedText = text;
    return extracted;
  }

  return {
    ...defaults,
    title: fileName.replace(/\.[^.]+$/, ''),
    extractedText: text || '',
  };
}

export function documentFrom(
  type: DocumentType,
  sourceFile: NormalizedDocumentData['sourceFile'],
  text: string,
  confidence: number,
  id: string,
  date: string,
  rawParsed?: Record<string, unknown>
): NormalizedDocumentData {
  const now = new Date().toISOString();
  return {
    id,
    type,
    confidence,
    sourceFile,
    data: initialDataFor(type, text, sourceFile.name, date, rawParsed),
    metadata: { createdAt: now, updatedAt: now },
  };
}

