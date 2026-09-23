import type { DocumentType, NormalizedDocumentData } from '@/lib/documents/types';

export interface Template {
  id: string;
  name: string;
  type: DocumentType;
  category: string;
  description: string;
  render(data: NormalizedDocumentData): { html: string; title: string };
}

export interface TemplateEngine {
  listTemplates(type?: DocumentType): Template[];
  getTemplate(id: string): Template | null;
  render(templateId: string, document: NormalizedDocumentData): { html: string; title: string };
}

export function createTemplateEngine(): TemplateEngine {
  const templates: Template[] = [];
  return {
    listTemplates: (type?: DocumentType) => type ? templates.filter((t) => t.type === type) : templates,
    getTemplate: (id: string) => templates.find((t) => t.id === id) ?? null,
    render: (templateId: string, document: NormalizedDocumentData) => {
      const template = templates.find((t) => t.id === templateId);
      if (!template) throw new Error(`Template ${templateId} not found`);
      return template.render(document);
    },
  };
}

export function registerTemplate(template: Template, engine: ReturnType<typeof createTemplateEngine>) {
  (engine as any).templates.push(template);
}