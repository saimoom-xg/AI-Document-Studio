export type DocumentType = 'invoice' | 'receipt' | 'cv' | 'quotation' | 'purchase_order' | 'report' | 'expense_report' | 'payslip' | 'bank_statement' | 'product_catalog' | 'unknown';

export type SupportedMimeType =
  | 'application/pdf'
  | 'image/jpeg'
  | 'image/png'
  | 'image/webp'
  | 'application/vnd.ms-excel'
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  | 'text/csv'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'text/markdown'
  | 'text/plain';

export type ProcessingStatus = 'uploaded' | 'processing' | 'extracting' | 'review_required' | 'ready' | 'exporting' | 'completed' | 'failed';

export interface SourceFileMeta {
  name: string;
  type: SupportedMimeType | string;
  size?: number;
}

export interface NormalizedDocumentData {
  id: string;
  type: DocumentType;
  confidence: number;
  sourceFile: SourceFileMeta;
  data: Record<string, unknown>;
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface DocumentClassificationResult {
  documentType: DocumentType;
  confidence: number;
  data?: Record<string, unknown>;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  seller: { name: string; email: string; address: string };
  customer: { name: string; email: string; address: string };
  items: DocumentItem[];
  notes: string;
  terms: string;
}

export interface ReceiptData {
  receiptNumber: string;
  date: string;
  store: string;
  paymentMethod: string;
  items: DocumentItem[];
  notes: string;
}

export interface CvData {
  fullName: string;
  jobTitle: string;
  summary: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  skills: string[];
}

export type DocumentData = InvoiceData | ReceiptData | CvData | Record<string, unknown>;
