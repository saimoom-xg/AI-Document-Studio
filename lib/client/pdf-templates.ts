import jsPDF from 'jspdf';
import type {
  CvEducation,
  CvExperience,
  DocumentItem,
  ExpenseItem,
  NormalizedDocumentData,
  ReportSection,
} from '@/lib/documents/types';
import { definitionFor } from '@/lib/documents/registry';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  if (!hex || typeof hex !== 'string') return { r: 37, g: 99, b: 235 };
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  if (isNaN(bigint)) return { r: 37, g: 99, b: 235 };
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Sanitizes text to pure ASCII/Latin-1 so jsPDF standard fonts
 * NEVER crash on characters like Unicode bullets, smart quotes, em-dashes, or currency symbols.
 */
export function cleanPdfText(val: unknown, fallback = ''): string {
  if (val == null) return fallback;
  const str = String(val);
  return str
    .replace(/[\u2018\u2019]/g, "'") // smart single quotes
    .replace(/[\u201C\u201D]/g, '"') // smart double quotes
    .replace(/[\u2013\u2014]/g, '-') // en-dash and em-dash
    .replace(/[\u2022\u25AA\u25CF]/g, '-') // bullets
    .replace(/[\u00B7]/g, '|') // middle dot
    .replace(/[\u20AC]/g, 'EUR ') // euro
    .replace(/[\u00A3]/g, 'GBP ') // pound
    .replace(/[\u00A5]/g, 'JPY ') // yen
    .replace(/[^\x00-\x7F]/g, ' '); // remove any other non-ASCII character that jsPDF cannot encode
}

const safeNum = (val: unknown, fallback = 0) => {
  const n = parseFloat(String(val));
  return isNaN(n) ? fallback : n;
};

export function renderDocumentPdf(document: NormalizedDocumentData, templateId: string): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const definition = definitionFor(document.type);
  const template = definition.templates.find((t) => t.id === templateId) || definition.templates[0] || {
    id: 'Modern',
    name: 'Modern',
    category: 'General',
    description: 'Default template',
    accentColor: '#2563eb',
    softColor: '#eff6ff',
    fontFamily: 'sans',
  };

  const accent = hexToRgb(template.accentColor || '#2563eb');
  const d = document.data;

  try {
    switch (document.type) {
      case 'cv':
        renderCvPdf(pdf, d, template, accent);
        break;
      case 'invoice':
        renderInvoicePdf(pdf, d, template, accent, 'INVOICE');
        break;
      case 'receipt':
        renderReceiptPdf(pdf, d, template, accent);
        break;
      case 'quotation':
        renderInvoicePdf(pdf, d, template, accent, 'QUOTATION');
        break;
      case 'purchase_order':
        renderInvoicePdf(pdf, d, template, accent, 'PURCHASE ORDER');
        break;
      case 'report':
        renderReportPdf(pdf, d, template, accent);
        break;
      case 'expense_report':
        renderExpensePdf(pdf, d, template, accent);
        break;
      default:
        renderGenericPdf(pdf, document, template, accent);
        break;
    }
  } catch (err) {
    console.error('PDF template rendering error, falling back to clean generic PDF:', err);
    // If anything fails in a specific template layout, fallback cleanly so download NEVER fails
    renderGenericPdf(pdf, document, template, accent);
  }

  return pdf;
}

function renderCvPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const name = cleanPdfText(d.fullName || d.title, 'Curriculum Vitae');
  const title = cleanPdfText(d.jobTitle, '');
  const email = cleanPdfText(d.email, '');
  const phone = cleanPdfText(d.phone, '');
  const location = cleanPdfText(d.location, '');
  const website = cleanPdfText(d.website, '');
  const summary = cleanPdfText(d.summary, '');
  const skills = cleanPdfText(d.skills, '');
  const experiences = (d.experience || []) as CvExperience[];
  const education = (d.education || []) as CvEducation[];

  // 1. CORPORATE SIDEBAR LAYOUT
  if (template.id === 'Corporate') {
    pdf.setFillColor(accent.r, accent.g, accent.b);
    pdf.rect(0, 0, 65, 297, 'F');

    // Sidebar Content
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    const splitName = pdf.splitTextToSize(name.toUpperCase(), 50);
    pdf.text(splitName, 7, 24);

    if (title) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      const splitTitle = pdf.splitTextToSize(title.toUpperCase(), 50);
      pdf.text(splitTitle, 7, 34);
    }

    let sideY = 50;
    const addSideHeading = (text: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(text.toUpperCase(), 7, sideY);
      sideY += 5;
    };

    if (email || phone || location || website) {
      addSideHeading('Contact');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      if (email) { pdf.text(pdf.splitTextToSize(email, 50), 7, sideY); sideY += 5; }
      if (phone) { pdf.text(phone, 7, sideY); sideY += 5; }
      if (location) { pdf.text(location, 7, sideY); sideY += 5; }
      if (website) { pdf.text(pdf.splitTextToSize(website, 50), 7, sideY); sideY += 5; }
      sideY += 6;
    }

    if (skills) {
      addSideHeading('Skills');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      skillList.forEach((s) => {
        pdf.text(cleanPdfText(`- ${s}`), 7, sideY);
        sideY += 4.5;
      });
      sideY += 6;
    }

    // Main Column
    let mainY = 24;
    const addMainHeading = (text: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(accent.r, accent.g, accent.b);
      pdf.text(text.toUpperCase(), 75, mainY);
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.4);
      pdf.line(75, mainY + 2, 198, mainY + 2);
      mainY += 7;
    };

    if (summary) {
      addMainHeading('Profile Summary');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(40, 40, 40);
      const splitSummary = pdf.splitTextToSize(summary, 122);
      pdf.text(splitSummary, 75, mainY);
      mainY += splitSummary.length * 4.2 + 7;
    }

    if (experiences.length > 0) {
      addMainHeading('Work Experience');
      experiences.forEach((exp) => {
        if (mainY > 265) { pdf.addPage(); mainY = 20; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(20, 20, 20);
        pdf.text(cleanPdfText(exp.role), 75, mainY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(cleanPdfText(`${exp.company} | ${exp.period}`), 75, mainY + 4);

        pdf.setTextColor(50, 50, 50);
        const splitDesc = pdf.splitTextToSize(cleanPdfText(exp.description), 122);
        pdf.text(splitDesc, 75, mainY + 8.5);
        mainY += splitDesc.length * 3.8 + 12;
      });
    }

    if (education.length > 0) {
      if (mainY > 265) { pdf.addPage(); mainY = 20; }
      addMainHeading('Education');
      education.forEach((edu) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(20, 20, 20);
        pdf.text(cleanPdfText(edu.degree), 75, mainY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(cleanPdfText(`${edu.institution} | ${edu.period}`), 75, mainY + 4);
        mainY += 10;
      });
    }
    return;
  }

  // 2. MINIMAL (SWISS 28/72 GRID)
  if (template.id === 'Minimal') {
    let y = 24;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(0, 0, 0);
    pdf.text(name.toUpperCase(), 16, y);

    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text(title, 16, y);

    const contactParts = [email, phone, location].filter(Boolean);
    if (contactParts.length > 0) {
      pdf.setFontSize(7.5);
      pdf.text(cleanPdfText(contactParts.join('  /  ')), 194, y, { align: 'right' });
    }

    y += 5;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.5);
    pdf.line(16, y, 194, y);
    y += 9;

    const addSwissRow = (sectionTitle: string, renderRight: () => number) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(0, 0, 0);
      pdf.text(sectionTitle.toUpperCase(), 16, y);

      const nextY = renderRight();
      y = nextY + 5;
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(16, y - 1, 194, y - 1);
    };

    if (summary) {
      addSwissRow('PROFILE', () => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(40, 40, 40);
        const split = pdf.splitTextToSize(summary, 126);
        pdf.text(split, 68, y);
        return y + split.length * 4;
      });
    }

    if (experiences.length > 0) {
      addSwissRow('EXPERIENCE', () => {
        let curY = y;
        experiences.forEach((exp) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8.5);
          pdf.setTextColor(0, 0, 0);
          pdf.text(cleanPdfText(exp.role).toUpperCase(), 68, curY);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 100, 100);
          pdf.text(cleanPdfText(exp.period), 194, curY, { align: 'right' });

          curY += 4;
          pdf.setTextColor(70, 70, 70);
          pdf.text(cleanPdfText(`${exp.company} ${exp.location ? `/ ${exp.location}` : ''}`), 68, curY);

          curY += 4;
          pdf.setTextColor(40, 40, 40);
          const split = pdf.splitTextToSize(cleanPdfText(exp.description), 126);
          pdf.text(split, 68, curY);
          curY += split.length * 3.8 + 6;
        });
        return curY;
      });
    }

    if (education.length > 0) {
      addSwissRow('EDUCATION', () => {
        let curY = y;
        education.forEach((edu) => {
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(8);
          pdf.setTextColor(0, 0, 0);
          pdf.text(cleanPdfText(edu.degree), 68, curY);

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(7.5);
          pdf.setTextColor(100, 100, 100);
          pdf.text(cleanPdfText(edu.period), 194, curY, { align: 'right' });

          curY += 3.5;
          pdf.setTextColor(60, 60, 60);
          pdf.text(cleanPdfText(edu.institution), 68, curY);
          curY += 6;
        });
        return curY;
      });
    }

    if (skills) {
      addSwissRow('SKILLS', () => {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(40, 40, 40);
        const split = pdf.splitTextToSize(skills, 126);
        pdf.text(split, 68, y);
        return y + split.length * 3.8;
      });
    }
    return;
  }

  // 3. PROFESSIONAL (SERIF FORMAL CENTERED)
  if (template.id === 'Professional') {
    let y = 24;
    pdf.setFont('times', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(20, 20, 20);
    pdf.text(name.toUpperCase(), 105, y, { align: 'center' });

    if (title) {
      y += 6;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9.5);
      pdf.setTextColor(80, 80, 80);
      pdf.text(title.toUpperCase(), 105, y, { align: 'center' });
    }

    const contactParts = [email, phone, location].filter(Boolean);
    if (contactParts.length > 0) {
      y += 5;
      pdf.setFontSize(7.5);
      pdf.text(cleanPdfText(contactParts.join('   -   ')), 105, y, { align: 'center' });
    }

    y += 5;
    pdf.setDrawColor(20, 20, 20);
    pdf.setLineWidth(0.5);
    pdf.line(20, y, 190, y);
    y += 8;

    const addFormalSection = (secTitle: string) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text(secTitle.toUpperCase(), 20, y);
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.2);
      pdf.line(20, y + 2, 190, y + 2);
      y += 6;
    };

    if (summary) {
      addFormalSection('Executive Summary');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(45, 45, 45);
      const split = pdf.splitTextToSize(summary, 170);
      pdf.text(split, 20, y);
      y += split.length * 4 + 7;
    }

    if (experiences.length > 0) {
      addFormalSection('Professional Experience');
      experiences.forEach((exp) => {
        if (y > 265) { pdf.addPage(); y = 20; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(20, 20, 20);
        pdf.text(cleanPdfText(`${exp.role}, ${exp.company}`), 20, y);

        pdf.setFont('times', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(cleanPdfText(exp.period), 190, y, { align: 'right' });

        y += 4;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(50, 50, 50);
        const split = pdf.splitTextToSize(cleanPdfText(exp.description), 170);
        pdf.text(split, 20, y);
        y += split.length * 3.8 + 6;
      });
    }

    if (education.length > 0) {
      addFormalSection('Education');
      education.forEach((edu) => {
        if (y > 270) { pdf.addPage(); y = 20; }
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(20, 20, 20);
        pdf.text(cleanPdfText(edu.degree), 20, y);

        pdf.setFont('times', 'italic');
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(cleanPdfText(edu.period), 190, y, { align: 'right' });

        y += 3.5;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(60, 60, 60);
        pdf.text(cleanPdfText(edu.institution), 20, y);
        y += 6;
      });
    }

    if (skills) {
      addFormalSection('Core Competencies');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(50, 50, 50);
      const split = pdf.splitTextToSize(skills, 170);
      pdf.text(split, 20, y);
    }
    return;
  }

  // 4. MODERN SPLIT / DEFAULT
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 5, 'F');

  let y = 20;
  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(name, 16, y);

  if (title) {
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(title, 16, y);
  }

  const contactParts = [email, phone, location, website].filter(Boolean);
  if (contactParts.length > 0) {
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(cleanPdfText(contactParts.join('   |   ')), 16, y);
  }

  y += 5;
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(16, y, 194, y);
  y += 7;

  const addSection = (titleText: string) => {
    if (y > 265) { pdf.addPage(); y = 20; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(titleText.toUpperCase(), 16, y);
    pdf.setDrawColor(accent.r, accent.g, accent.b);
    pdf.setLineWidth(0.3);
    pdf.line(16, y + 2, 194, y + 2);
    y += 7;
  };

  if (summary) {
    addSection('Professional Summary');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(45, 45, 45);
    const splitSummary = pdf.splitTextToSize(summary, 178);
    pdf.text(splitSummary, 16, y);
    y += splitSummary.length * 4 + 6;
  }

  if (experiences.length > 0) {
    addSection('Experience');
    experiences.forEach((exp) => {
      if (y > 265) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(20, 20, 20);
      pdf.text(cleanPdfText(exp.role), 16, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(110, 110, 110);
      pdf.text(cleanPdfText(`${exp.company} - ${exp.period}`), 16, y + 4);

      pdf.setTextColor(45, 45, 45);
      const splitDesc = pdf.splitTextToSize(cleanPdfText(exp.description), 178);
      pdf.text(splitDesc, 16, y + 8.5);
      y += splitDesc.length * 3.8 + 11;
    });
  }

  if (education.length > 0) {
    addSection('Education');
    education.forEach((edu) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text(cleanPdfText(edu.degree), 16, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(110, 110, 110);
      pdf.text(cleanPdfText(`${edu.institution} | ${edu.period}`), 16, y + 4);
      y += 9;
    });
  }

  if (skills) {
    addSection('Core Skills');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(45, 45, 45);
    const splitSkills = pdf.splitTextToSize(skills, 178);
    pdf.text(splitSkills, 16, y);
  }
}

function renderInvoicePdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB, docTitle = 'INVOICE') {
  const number = cleanPdfText(d.invoiceNumber || d.quoteNumber || d.poNumber, 'DOC-001');
  const date = cleanPdfText(d.invoiceDate || d.date || d.orderDate, '');
  const dueDate = cleanPdfText(d.dueDate || d.validUntil || d.deliveryDate, '');
  const currency = cleanPdfText(d.currency, 'USD');

  const sellerName = cleanPdfText(d.sellerName || d.companyName || d.supplierName, 'Company');
  const sellerAddress = cleanPdfText(d.sellerAddress || d.companyAddress || d.supplierAddress, '');

  const customerName = cleanPdfText(d.customerName || d.clientName || d.buyerName, 'Customer');
  const customerAddress = cleanPdfText(d.customerAddress || d.clientAddress || d.shippingAddress, '');

  const items = (d.items || []) as DocumentItem[];
  const notes = cleanPdfText(d.notes, '');

  // 1. MINIMAL HAIRLINE INVOICE
  if (template.id === 'Minimal') {
    let y = 24;
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`${docTitle} #${number}`, 16, y);
    if (date) pdf.text(date, 194, y, { align: 'right' });

    y += 4;
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(16, y, 194, y);

    y += 10;
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(8.5);
    pdf.text(pdf.splitTextToSize(`FROM: ${sellerName}\n${sellerAddress}`, 80), 16, y);
    pdf.text(pdf.splitTextToSize(`TO:   ${customerName}\n${customerAddress}`, 80), 110, y);

    y += 18;
    pdf.setFont('courier', 'bold');
    pdf.text('ITEM', 16, y);
    pdf.text('QTY', 130, y, { align: 'right' });
    pdf.text('RATE', 160, y, { align: 'right' });
    pdf.text('TOTAL', 194, y, { align: 'right' });

    y += 3;
    pdf.line(16, y, 194, y);
    y += 6;

    let subtotal = 0;
    pdf.setFont('courier', 'normal');
    items.forEach((it) => {
      if (y > 270) { pdf.addPage(); y = 20; }
      const q = safeNum(it.quantity, 1);
      const p = safeNum(it.unitPrice, 0);
      const tot = safeNum(it.total, q * p);
      subtotal += tot;

      pdf.text(cleanPdfText(it.description), 16, y);
      pdf.text(q.toString(), 130, y, { align: 'right' });
      pdf.text(p.toFixed(2), 160, y, { align: 'right' });
      pdf.text(tot.toFixed(2), 194, y, { align: 'right' });
      y += 6;
    });

    y += 2;
    pdf.line(16, y, 194, y);
    y += 6;

    pdf.setFont('courier', 'bold');
    pdf.text(`TOTAL DUE (${currency}): ${subtotal.toFixed(2)}`, 194, y, { align: 'right' });
    return;
  }

  // 2. STANDARD / MODERN / PROFESSIONAL
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 14, 'F');

  let y = 26;
  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(sellerName, 16, y);

  pdf.setFontSize(14);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(docTitle, 194, y, { align: 'right' });

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(110, 110, 110);
  pdf.text(`# ${number}`, 194, y, { align: 'right' });

  if (date) { y += 4.5; pdf.text(`Date: ${date}`, 194, y, { align: 'right' }); }
  if (dueDate) { y += 4.5; pdf.text(`Due: ${dueDate}`, 194, y, { align: 'right' }); }

  y = 46;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text('BILLED TO:', 16, y);

  y += 4.5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(20, 20, 20);
  pdf.text(customerName, 16, y);

  if (customerAddress) {
    y += 4;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(80, 80, 80);
    const splitCustAddr = pdf.splitTextToSize(customerAddress, 100);
    pdf.text(splitCustAddr, 16, y);
    y += splitCustAddr.length * 3.8;
  }

  y += 8;

  // Items Table Header
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(16, y, 178, 7.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DESCRIPTION', 20, y + 5);
  pdf.text('QTY', 128, y + 5, { align: 'right' });
  pdf.text('PRICE', 158, y + 5, { align: 'right' });
  pdf.text('AMOUNT', 190, y + 5, { align: 'right' });

  y += 7.5;

  let subtotal = 0;
  items.forEach((item, index) => {
    if (y > 270) { pdf.addPage(); y = 20; }
    const qty = safeNum(item.quantity, 1);
    const unitPrice = safeNum(item.unitPrice, 0);
    const lineTotal = safeNum(item.total, qty * unitPrice);
    subtotal += lineTotal;

    pdf.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    pdf.rect(16, y, 178, 7.5, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);
    pdf.text(cleanPdfText(item.description, 'Item'), 20, y + 5);
    pdf.text(qty.toString(), 128, y + 5, { align: 'right' });
    pdf.text(unitPrice.toFixed(2), 158, y + 5, { align: 'right' });
    pdf.text(lineTotal.toFixed(2), 190, y + 5, { align: 'right' });
    y += 7.5;
  });

  y += 5;
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(125, y, 69, 8.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL DUE:', 155, y + 5.5, { align: 'right' });
  pdf.text(`${currency} ${subtotal.toFixed(2)}`, 190, y + 5.5, { align: 'right' });

  if (notes) {
    y += 18;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 100, 100);
    const splitNotes = pdf.splitTextToSize(notes, 178);
    pdf.text(splitNotes, 16, y);
  }
}

function renderReceiptPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const store = cleanPdfText(d.store, 'Store Name');
  const number = cleanPdfText(d.receiptNumber, 'REC-001');
  const date = cleanPdfText(d.date, new Date().toISOString().slice(0, 10));
  const paymentMethod = cleanPdfText(d.paymentMethod, 'Electronic Payment');
  const currency = cleanPdfText(d.currency, 'USD');
  const items = (d.items || []) as DocumentItem[];

  const startX = 55;
  const width = 100;
  let y = 20;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(180, 180, 180);
  pdf.rect(startX, 15, width, 220);

  pdf.setFont('courier', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(20, 20, 20);
  pdf.text(store.toUpperCase(), startX + width / 2, y + 6, { align: 'center' });

  y += 12;
  pdf.setFont('courier', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`TICKET #${number}`, startX + width / 2, y, { align: 'center' });

  y += 4;
  pdf.text(`${date} - ${paymentMethod}`, startX + width / 2, y, { align: 'center' });

  y += 6;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(startX + 6, y, startX + width - 6, y);
  y += 6;

  let subtotal = 0;
  items.forEach((item) => {
    const qty = safeNum(item.quantity, 1);
    const price = safeNum(item.unitPrice, 0);
    const lineTotal = safeNum(item.total, qty * price);
    subtotal += lineTotal;

    pdf.setFont('courier', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(20, 20, 20);
    pdf.text(`${qty}x ${cleanPdfText(item.description)}`, startX + 6, y);
    pdf.text(lineTotal.toFixed(2), startX + width - 6, y, { align: 'right' });
    y += 5;
  });

  y += 4;
  pdf.line(startX + 6, y, startX + width - 6, y);
  y += 6;

  pdf.setFont('courier', 'bold');
  pdf.setFontSize(9.5);
  pdf.text(`TOTAL (${currency}):`, startX + 6, y);
  pdf.text(subtotal.toFixed(2), startX + width - 6, y, { align: 'right' });
}

function renderReportPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const title = cleanPdfText(d.title, 'Executive Report');
  const author = cleanPdfText(d.author, '');
  const date = cleanPdfText(d.date, '');
  const summary = cleanPdfText(d.summary, '');
  const sections = (d.sections || []) as ReportSection[];

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 8, 'F');

  let y = 26;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(20, 20, 20);
  pdf.text(title, 16, y);

  const metaParts = [author, date].filter(Boolean);
  if (metaParts.length > 0) {
    y += 5.5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(cleanPdfText(metaParts.join('   -   ')), 16, y);
  }

  y += 5;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(16, y, 194, y);
  y += 9;

  if (summary) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('EXECUTIVE SUMMARY', 16, y);
    y += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);
    const split = pdf.splitTextToSize(summary, 178);
    pdf.text(split, 16, y);
    y += split.length * 4 + 7;
  }

  sections.forEach((sec) => {
    if (y > 265) { pdf.addPage(); y = 20; }
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(cleanPdfText(sec.title), 16, y);
    y += 4.5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(45, 45, 45);
    const split = pdf.splitTextToSize(cleanPdfText(sec.content), 178);
    pdf.text(split, 16, y);
    y += split.length * 4 + 7;
  });
}

function renderExpensePdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const title = cleanPdfText(d.title, 'Expense Report');
  const employee = cleanPdfText(d.employee, 'Employee');
  const date = cleanPdfText(d.date, '');
  const currency = cleanPdfText(d.currency, 'USD');
  const expenses = (d.expenses || []) as ExpenseItem[];

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 8, 'F');

  let y = 24;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(20, 20, 20);
  pdf.text(title, 16, y);

  y += 5.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(cleanPdfText(`Claimant: ${employee}   -   Date: ${date}`), 16, y);

  y += 7;
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(16, y, 178, 7, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DATE', 20, y + 5);
  pdf.text('CATEGORY', 55, y + 5);
  pdf.text('DESCRIPTION', 100, y + 5);
  pdf.text('AMOUNT', 190, y + 5, { align: 'right' });
  y += 7;

  let total = 0;
  expenses.forEach((item, index) => {
    if (y > 270) { pdf.addPage(); y = 20; }
    const amount = safeNum(item.amount, 0);
    total += amount;

    pdf.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    pdf.rect(16, y, 178, 6.5, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(40, 40, 40);
    pdf.text(cleanPdfText(item.date), 20, y + 4.5);
    pdf.text(cleanPdfText(item.category), 55, y + 4.5);
    pdf.text(cleanPdfText(item.description), 100, y + 4.5);
    pdf.text(amount.toFixed(2), 190, y + 4.5, { align: 'right' });
    y += 6.5;
  });

  y += 4;
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(125, y, 69, 7.5, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`TOTAL (${currency}):`, 155, y + 5, { align: 'right' });
  pdf.text(total.toFixed(2), 190, y + 5, { align: 'right' });
}

function renderGenericPdf(pdf: jsPDF, document: NormalizedDocumentData, template: any, accent: RGB) {
  const d = document.data;
  const title = cleanPdfText(d.title || d.fullName || document.sourceFile.name, 'Document');

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 8, 'F');

  let y = 24;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(title, 16, y);

  y += 8;
  Object.entries(d).forEach(([key, val]) => {
    if (['extractedText', 'title'].includes(key) || typeof val === 'object') return;
    if (y > 265) { pdf.addPage(); y = 20; }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(cleanPdfText(key.toUpperCase()), 16, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(40, 40, 40);
    const textVal = cleanPdfText(val);
    const split = pdf.splitTextToSize(textVal, 178);
    pdf.text(split, 16, y + 4);
    y += split.length * 3.8 + 6;
  });
}
