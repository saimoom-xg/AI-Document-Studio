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
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

const safeStr = (val: unknown, fallback = '') => (val != null ? String(val) : fallback);
const safeNum = (val: unknown, fallback = 0) => {
  const n = parseFloat(String(val));
  return isNaN(n) ? fallback : n;
};

export function renderDocumentPdf(document: NormalizedDocumentData, templateId: string): jsPDF {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const definition = definitionFor(document.type);
  const template = definition.templates.find((t) => t.id === templateId) || definition.templates[0] || {
    id: 'default',
    name: 'Default',
    accentColor: '#2563eb',
    softColor: '#eff6ff',
    fontFamily: 'sans',
  };

  const accent = hexToRgb(template.accentColor || '#2563eb');
  const d = document.data;

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

  return pdf;
}

function renderCvPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const name = safeStr(d.fullName, 'Full Name');
  const title = safeStr(d.jobTitle, 'Professional Title');
  const email = safeStr(d.email);
  const phone = safeStr(d.phone);
  const location = safeStr(d.location);
  const website = safeStr(d.website);
  const summary = safeStr(d.summary);
  const skills = safeStr(d.skills);
  const experiences = (d.experience || []) as CvExperience[];
  const education = (d.education || []) as CvEducation[];

  if (template.id === 'Corporate' || template.id === 'European-style') {
    // 2-Column Sidebar Layout
    pdf.setFillColor(accent.r, accent.g, accent.b);
    pdf.rect(0, 0, 68, 297, 'F');

    // Sidebar Content
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    const splitName = pdf.splitTextToSize(name, 54);
    pdf.text(splitName, 7, 24);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.text(title, 7, 34);

    let sideY = 50;
    const addSideHeading = (text: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(text.toUpperCase(), 7, sideY);
      sideY += 6;
    };

    addSideHeading('Contact');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    if (email) { pdf.text(email, 7, sideY); sideY += 5; }
    if (phone) { pdf.text(phone, 7, sideY); sideY += 5; }
    if (location) { pdf.text(location, 7, sideY); sideY += 5; }
    if (website) { pdf.text(website, 7, sideY); sideY += 5; }
    sideY += 8;

    if (skills) {
      addSideHeading('Skills');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      skillList.forEach((s) => {
        pdf.text(`• ${s}`, 7, sideY);
        sideY += 5;
      });
      sideY += 8;
    }

    // Main Column
    let mainY = 24;
    const addMainHeading = (text: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(accent.r, accent.g, accent.b);
      pdf.text(text.toUpperCase(), 78, mainY);
      pdf.setDrawColor(accent.r, accent.g, accent.b);
      pdf.setLineWidth(0.4);
      pdf.line(78, mainY + 2, 200, mainY + 2);
      mainY += 8;
    };

    if (summary) {
      addMainHeading('Profile');
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(40, 40, 40);
      const splitSummary = pdf.splitTextToSize(summary, 122);
      pdf.text(splitSummary, 78, mainY);
      mainY += splitSummary.length * 4.5 + 8;
    }

    if (experiences.length > 0) {
      addMainHeading('Experience');
      experiences.forEach((exp) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9.5);
        pdf.setTextColor(20, 20, 20);
        pdf.text(exp.role, 78, mainY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${exp.company}  |  ${exp.period}`, 78, mainY + 4.5);

        pdf.setTextColor(45, 45, 45);
        const splitDesc = pdf.splitTextToSize(exp.description, 122);
        pdf.text(splitDesc, 78, mainY + 9.5);
        mainY += splitDesc.length * 4 + 14;
      });
    }

    if (education.length > 0) {
      addMainHeading('Education');
      education.forEach((edu) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor(20, 20, 20);
        pdf.text(edu.degree, 78, mainY);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${edu.institution}  |  ${edu.period}`, 78, mainY + 4.5);
        mainY += 12;
      });
    }

    return;
  }

  // Classic / Modern / Minimal Clean Layout
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 6, 'F');

  let y = 22;
  pdf.setTextColor(20, 20, 20);
  pdf.setFont(template.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
  pdf.setFontSize(24);
  pdf.text(name, 16, y);

  y += 7;
  pdf.setFont(template.fontFamily === 'serif' ? 'times' : 'helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(title, 16, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 100, 100);
  const contactParts = [email, phone, location, website].filter(Boolean);
  pdf.text(contactParts.join('   •   '), 16, y);

  y += 5;
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.4);
  pdf.line(16, y, 194, y);
  y += 8;

  const addSection = (titleText: string) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(titleText.toUpperCase(), 16, y);
    pdf.setDrawColor(accent.r, accent.g, accent.b);
    pdf.setLineWidth(0.4);
    pdf.line(16, y + 2, 194, y + 2);
    y += 8;
  };

  if (summary) {
    addSection('Professional Summary');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(45, 45, 45);
    const splitSummary = pdf.splitTextToSize(summary, 178);
    pdf.text(splitSummary, 16, y);
    y += splitSummary.length * 4.5 + 6;
  }

  if (experiences.length > 0) {
    addSection('Experience');
    experiences.forEach((exp) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(20, 20, 20);
      pdf.text(exp.role, 16, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(110, 110, 110);
      pdf.text(`${exp.company}   —   ${exp.period}`, 16, y + 4.5);

      pdf.setTextColor(45, 45, 45);
      const splitDesc = pdf.splitTextToSize(exp.description, 178);
      pdf.text(splitDesc, 16, y + 9.5);
      y += splitDesc.length * 4.2 + 13;
    });
  }

  if (skills) {
    addSection('Core Skills & Expertise');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(45, 45, 45);
    const splitSkills = pdf.splitTextToSize(skills, 178);
    pdf.text(splitSkills, 16, y);
    y += splitSkills.length * 4.5 + 6;
  }

  if (education.length > 0) {
    addSection('Education');
    education.forEach((edu) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(20, 20, 20);
      pdf.text(edu.degree, 16, y);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(110, 110, 110);
      pdf.text(`${edu.institution}   —   ${edu.period}`, 16, y + 4.5);
      y += 11;
    });
  }
}

function renderInvoicePdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB, docTitle = 'INVOICE') {
  const number = safeStr(d.invoiceNumber || d.quoteNumber || d.poNumber, 'DOC-001');
  const date = safeStr(d.invoiceDate || d.date || d.orderDate, '');
  const dueDate = safeStr(d.dueDate || d.validUntil || d.deliveryDate, '');
  const currency = safeStr(d.currency, 'USD');

  const sellerName = safeStr(d.sellerName || d.companyName || d.supplierName, 'Company / Provider');
  const sellerEmail = safeStr(d.sellerEmail, '');
  const sellerAddress = safeStr(d.sellerAddress || d.companyAddress || d.supplierAddress, '');

  const customerName = safeStr(d.customerName || d.clientName || d.buyerName, 'Customer / Client');
  const customerEmail = safeStr(d.customerEmail, '');
  const customerAddress = safeStr(d.customerAddress || d.clientAddress || d.shippingAddress, '');

  const items = (d.items || []) as DocumentItem[];
  const notes = safeStr(d.notes, '');
  const terms = safeStr(d.terms, '');
  const taxRate = safeNum(d.taxRate, 0);
  const discount = safeNum(d.discount, 0);

  // Header Banner
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 14, 'F');

  let y = 28;
  pdf.setTextColor(20, 20, 20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(sellerName, 16, y);

  pdf.setFontSize(16);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(docTitle, 194, y, { align: 'right' });

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(110, 110, 110);
  pdf.text(`# ${number}`, 194, y, { align: 'right' });

  if (date) {
    y += 5;
    pdf.text(`Date: ${date}`, 194, y, { align: 'right' });
  }
  if (dueDate) {
    y += 5;
    pdf.text(`Due / Valid: ${dueDate}`, 194, y, { align: 'right' });
  }

  // Address blocks
  y = 48;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text('ISSUED BY:', 16, y);
  pdf.text('BILLED TO / RECIPIENT:', 105, y);

  y += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9.5);
  pdf.setTextColor(20, 20, 20);
  pdf.text(sellerName, 16, y);
  pdf.text(customerName, 105, y);

  y += 4.5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  if (sellerEmail) { pdf.text(sellerEmail, 16, y); }
  if (customerEmail) { pdf.text(customerEmail, 105, y); }

  y += 4.5;
  const splitSellerAddr = pdf.splitTextToSize(sellerAddress, 75);
  const splitCustAddr = pdf.splitTextToSize(customerAddress, 75);
  pdf.text(splitSellerAddr, 16, y);
  pdf.text(splitCustAddr, 105, y);

  y += Math.max(splitSellerAddr.length, splitCustAddr.length) * 4 + 10;

  // Items Table Header
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(16, y, 178, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DESCRIPTION', 20, y + 5.5);
  pdf.text('QTY', 128, y + 5.5, { align: 'right' });
  pdf.text('UNIT PRICE', 158, y + 5.5, { align: 'right' });
  pdf.text('AMOUNT', 190, y + 5.5, { align: 'right' });

  y += 8;

  let subtotal = 0;
  items.forEach((item, index) => {
    const qty = safeNum(item.quantity, 1);
    const unitPrice = safeNum(item.unitPrice, 0);
    const lineTotal = safeNum(item.total, qty * unitPrice);
    subtotal += lineTotal;

    pdf.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    pdf.rect(16, y, 178, 8, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(40, 40, 40);
    pdf.text(safeStr(item.description, 'Item'), 20, y + 5.5);
    pdf.text(qty.toString(), 128, y + 5.5, { align: 'right' });
    pdf.text(unitPrice.toFixed(2), 158, y + 5.5, { align: 'right' });
    pdf.text(lineTotal.toFixed(2), 190, y + 5.5, { align: 'right' });

    y += 8;
  });

  const taxAmount = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + taxAmount - discount;

  // Totals Area
  y += 4;
  pdf.setDrawColor(220, 220, 220);
  pdf.setLineWidth(0.3);
  pdf.line(120, y, 194, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Subtotal:', 160, y, { align: 'right' });
  pdf.text(`${currency} ${subtotal.toFixed(2)}`, 190, y, { align: 'right' });

  if (taxRate > 0) {
    y += 5;
    pdf.text(`Tax (${taxRate}%):`, 160, y, { align: 'right' });
    pdf.text(`${currency} ${taxAmount.toFixed(2)}`, 190, y, { align: 'right' });
  }

  if (discount > 0) {
    y += 5;
    pdf.text('Discount:', 160, y, { align: 'right' });
    pdf.text(`-${currency} ${discount.toFixed(2)}`, 190, y, { align: 'right' });
  }

  y += 7;
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(125, y - 4.5, 69, 9, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL DUE:', 155, y + 1.5, { align: 'right' });
  pdf.text(`${currency} ${grandTotal.toFixed(2)}`, 190, y + 1.5, { align: 'right' });

  // Notes & terms
  if (notes || terms) {
    y += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('NOTES & TERMS', 16, y);

    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    if (notes) {
      const splitNotes = pdf.splitTextToSize(notes, 178);
      pdf.text(splitNotes, 16, y);
      y += splitNotes.length * 4 + 3;
    }
    if (terms) {
      const splitTerms = pdf.splitTextToSize(terms, 178);
      pdf.text(splitTerms, 16, y);
    }
  }
}

function renderReceiptPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const store = safeStr(d.store, 'Store Name');
  const number = safeStr(d.receiptNumber, 'REC-001');
  const date = safeStr(d.date, new Date().toISOString().slice(0, 10));
  const paymentMethod = safeStr(d.paymentMethod, 'Electronic Payment');
  const currency = safeStr(d.currency, 'USD');
  const items = (d.items || []) as DocumentItem[];
  const notes = safeStr(d.notes, 'Thank you for your purchase!');
  const taxRate = safeNum(d.taxRate, 0);

  // Center thermal / modern slip
  const startX = 50;
  const width = 110;
  let y = 20;

  pdf.setFillColor(255, 255, 255);
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(startX, 15, width, 240);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(store, startX + width / 2, y + 8, { align: 'center' });

  y += 14;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Receipt #${number}`, startX + width / 2, y, { align: 'center' });

  y += 5;
  pdf.text(`Date: ${date}   •   ${paymentMethod}`, startX + width / 2, y, { align: 'center' });

  y += 7;
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(0.3);
  pdf.line(startX + 8, y, startX + width - 8, y);
  y += 6;

  let subtotal = 0;
  items.forEach((item) => {
    const qty = safeNum(item.quantity, 1);
    const price = safeNum(item.unitPrice, 0);
    const lineTotal = safeNum(item.total, qty * price);
    subtotal += lineTotal;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(30, 30, 30);
    pdf.text(`${qty}x ${safeStr(item.description, 'Item')}`, startX + 8, y);
    pdf.text(lineTotal.toFixed(2), startX + width - 8, y, { align: 'right' });
    y += 5.5;
  });

  const tax = (subtotal * taxRate) / 100;
  const grandTotal = subtotal + tax;

  y += 3;
  pdf.line(startX + 8, y, startX + width - 8, y);
  y += 6;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(80, 80, 80);
  pdf.text('Subtotal', startX + 8, y);
  pdf.text(`${currency} ${subtotal.toFixed(2)}`, startX + width - 8, y, { align: 'right' });

  if (taxRate > 0) {
    y += 5;
    pdf.text(`Tax (${taxRate}%)`, startX + 8, y);
    pdf.text(`${currency} ${tax.toFixed(2)}`, startX + width - 8, y, { align: 'right' });
  }

  y += 7;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text('TOTAL', startX + 8, y);
  pdf.text(`${currency} ${grandTotal.toFixed(2)}`, startX + width - 8, y, { align: 'right' });

  y += 12;
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text(notes, startX + width / 2, y, { align: 'center' });
}

function renderReportPdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const title = safeStr(d.title, 'Executive Business Report');
  const subtitle = safeStr(d.subtitle, '');
  const author = safeStr(d.author, '');
  const date = safeStr(d.date, '');
  const summary = safeStr(d.summary, '');
  const sections = (d.sections || []) as ReportSection[];
  const recommendations = safeStr(d.recommendations, '');

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 12, 'F');

  let y = 30;
  pdf.setFont(template.fontFamily === 'serif' ? 'times' : 'helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(20, 20, 20);
  pdf.text(title, 16, y);

  if (subtitle) {
    y += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(subtitle, 16, y);
  }

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(100, 100, 100);
  pdf.text([author, date].filter(Boolean).join('   •   '), 16, y);

  y += 6;
  pdf.setDrawColor(220, 220, 220);
  pdf.line(16, y, 194, y);
  y += 10;

  if (summary) {
    pdf.setFillColor(245, 247, 250);
    pdf.rect(16, y, 178, 22, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('EXECUTIVE SUMMARY', 20, y + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(40, 40, 40);
    const split = pdf.splitTextToSize(summary, 170);
    pdf.text(split, 20, y + 11);
    y += 28;
  }

  sections.forEach((sec) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(sec.title, 16, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(45, 45, 45);
    const split = pdf.splitTextToSize(sec.content, 178);
    pdf.text(split, 16, y);
    y += split.length * 4.5 + 8;
  });

  if (recommendations) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('RECOMMENDATIONS', 16, y);
    y += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(45, 45, 45);
    const split = pdf.splitTextToSize(recommendations, 178);
    pdf.text(split, 16, y);
  }
}

function renderExpensePdf(pdf: jsPDF, d: Record<string, unknown>, template: any, accent: RGB) {
  const title = safeStr(d.title, 'Expense Report');
  const employee = safeStr(d.employee, 'Employee');
  const dept = safeStr(d.department, '');
  const date = safeStr(d.date, '');
  const currency = safeStr(d.currency, 'USD');
  const expenses = (d.expenses || []) as ExpenseItem[];
  const notes = safeStr(d.notes, '');

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 10, 'F');

  let y = 26;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.setTextColor(20, 20, 20);
  pdf.text(title, 16, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Claimant: ${employee}   •   Dept: ${dept}   •   Date: ${date}`, 16, y);

  y += 8;
  // Expense table
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(16, y, 178, 8, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(255, 255, 255);
  pdf.text('DATE', 20, y + 5.5);
  pdf.text('CATEGORY', 50, y + 5.5);
  pdf.text('DESCRIPTION', 95, y + 5.5);
  pdf.text('AMOUNT', 190, y + 5.5, { align: 'right' });
  y += 8;

  let total = 0;
  expenses.forEach((item, index) => {
    const amount = safeNum(item.amount, 0);
    total += amount;

    pdf.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 252);
    pdf.rect(16, y, 178, 7.5, 'F');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(40, 40, 40);
    pdf.text(safeStr(item.date), 20, y + 5);
    pdf.text(safeStr(item.category), 50, y + 5);
    pdf.text(safeStr(item.description), 95, y + 5);
    pdf.text(amount.toFixed(2), 190, y + 5, { align: 'right' });
    y += 7.5;
  });

  y += 4;
  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(125, y, 69, 9, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text('TOTAL CLAIM:', 155, y + 6, { align: 'right' });
  pdf.text(`${currency} ${total.toFixed(2)}`, 190, y + 6, { align: 'right' });

  if (notes) {
    y += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('POLICY & NOTES', 16, y);

    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    const splitNotes = pdf.splitTextToSize(notes, 178);
    pdf.text(splitNotes, 16, y);
  }
}

function renderGenericPdf(pdf: jsPDF, document: NormalizedDocumentData, template: any, accent: RGB) {
  const d = document.data;
  const title = safeStr(d.title || d.fullName || document.sourceFile.name, 'Document');

  pdf.setFillColor(accent.r, accent.g, accent.b);
  pdf.rect(0, 0, 210, 10, 'F');

  let y = 28;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.setTextColor(accent.r, accent.g, accent.b);
  pdf.text(title, 16, y);

  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(110, 110, 110);
  pdf.text(`Document Type: ${document.type.replace('_', ' ').toUpperCase()}`, 16, y);

  y += 10;
  Object.entries(d).forEach(([key, val]) => {
    if (['extractedText', 'title'].includes(key) || typeof val === 'object') return;
    if (y > 270) return;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text(key.toUpperCase(), 16, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);
    const textVal = String(val);
    const split = pdf.splitTextToSize(textVal, 178);
    pdf.text(split, 16, y + 4.5);
    y += split.length * 4.5 + 8;
  });

  if (d.extractedText && y < 250) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(accent.r, accent.g, accent.b);
    pdf.text('CONTENT', 16, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(50, 50, 50);
    const split = pdf.splitTextToSize(String(d.extractedText), 178);
    pdf.text(split.slice(0, 40), 16, y + 5);
  }
}
