import type { DocumentType, NormalizedDocumentData } from '@/lib/documents/types';
import { createTemplateEngine } from './engine';

export const templateEngine = createTemplateEngine();

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMoney(value: number, currency = 'USD'): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function itemsTotal(items: any[]): number {
  return (items || []).reduce((sum: number, item: any) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice ?? item.price) || 0;
    const discount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const line = qty * price * (1 - discount / 100);
    return sum + line * (1 + taxRate / 100);
  }, 0);
}

export function subtotalBeforeTax(items: any[]): number {
  return (items || []).reduce((sum: number, item: any) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice ?? item.price) || 0;
    const discount = Number(item.discount) || 0;
    return sum + qty * price * (1 - discount / 100);
  }, 0);
}

export function taxTotal(items: any[]): number {
  return (items || []).reduce((sum: number, item: any) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice ?? item.price) || 0;
    const discount = Number(item.discount) || 0;
    const taxRate = Number(item.taxRate) || 0;
    return sum + qty * price * (1 - discount / 100) * (taxRate / 100);
  }, 0);
}

export function itemLineTotal(item: any): number {
  const qty = Number(item.quantity) || 0;
  const price = Number(item.unitPrice ?? item.price) || 0;
  const discount = Number(item.discount) || 0;
  const taxRate = Number(item.taxRate) || 0;
  return qty * price * (1 - discount / 100) * (1 + taxRate / 100);
}

export function listToRows<T>(items: T[]): T[] {
  return items || [];
}

export function joinList(items: string[]): string {
  return (items || []).filter(Boolean).join(', ');
}

export function contactLines(contact: any): string {
  if (!contact) return '';
  return [contact.email, contact.phone, contact.address, contact.name].filter(Boolean).join('\n');
}