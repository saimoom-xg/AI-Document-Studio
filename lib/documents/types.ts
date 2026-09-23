export type DocumentType =
  | 'cv'
  | 'invoice'
  | 'receipt'
  | 'quotation'
  | 'purchase_order'
  | 'report'
  | 'expense_report'
  | 'payslip'
  | 'bank_statement'
  | 'product_catalog'
  | 'unknown';

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

export interface SourceFileMeta {
  name: string;
  type: SupportedMimeType | string;
  size?: number;
}

export interface DocumentItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  taxRate?: number;
  total?: number;
}

export interface CvExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  location?: string;
  description: string;
}

export interface CvEducation {
  id: string;
  institution: string;
  degree: string;
  period: string;
  location?: string;
  details?: string;
}

export interface ExpenseItem {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export type EditorFieldType = 'text' | 'date' | 'email' | 'url' | 'number' | 'textarea' | 'currency';

export interface EditorField {
  key: string;
  label: string;
  type?: EditorFieldType;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export interface EditorSection {
  id: string;
  title: string;
  description?: string;
  kind?: 'fields' | 'items' | 'experience' | 'education' | 'expenses' | 'sections';
  fields?: EditorField[];
}

export interface DocumentTemplateMeta {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  softColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
}

export interface DocumentDefinition {
  type: DocumentType;
  label: string;
  description: string;
  badgeColor: string;
  templates: DocumentTemplateMeta[];
  defaultTemplate: string;
  sections: EditorSection[];
  exportFormats: ('pdf' | 'excel' | 'csv' | 'json')[];
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

