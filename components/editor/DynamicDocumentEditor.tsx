'use client';

import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import type {
  CvEducation,
  CvExperience,
  DocumentItem,
  ExpenseItem,
  NormalizedDocumentData,
  ReportSection,
} from '@/lib/documents/types';
import { definitionFor } from '@/lib/documents/registry';

interface DynamicDocumentEditorProps {
  document: NormalizedDocumentData;
  onChange: (updated: NormalizedDocumentData) => void;
}

export default function DynamicDocumentEditor({
  document,
  onChange,
}: DynamicDocumentEditorProps) {
  const definition = definitionFor(document.type);
  const d = document.data;
  const [showRawText, setShowRawText] = useState(false);
  const [copied, setCopied] = useState(false);

  const updateField = (key: string, value: unknown) => {
    onChange({
      ...document,
      data: {
        ...document.data,
        [key]: value,
      },
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  // Line Items handlers
  const items = (d.items || []) as DocumentItem[];
  const handleAddItem = () => {
    const newItem: DocumentItem = {
      id: `item-${Date.now()}`,
      description: 'New Item',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    updateField('items', [...items, newItem]);
  };

  const handleUpdateItem = (index: number, field: keyof DocumentItem, value: unknown) => {
    const next = [...items];
    const item = { ...next[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : Number(item.quantity || 1);
      const p = field === 'unitPrice' ? Number(value) : Number(item.unitPrice || 0);
      item.total = q * p;
    }
    next[index] = item;
    updateField('items', next);
  };

  const handleRemoveItem = (index: number) => {
    updateField('items', items.filter((_, idx) => idx !== index));
  };

  // CV Experience handlers
  const experiences = (d.experience || []) as CvExperience[];
  const handleAddExperience = () => {
    const nextExp: CvExperience = {
      id: `exp-${Date.now()}`,
      role: 'Job Role / Title',
      company: 'Company Name',
      period: '2024 — Present',
      description: 'Key accomplishments, projects, and impact...',
    };
    updateField('experience', [...experiences, nextExp]);
  };

  const handleUpdateExperience = (index: number, field: keyof CvExperience, val: string) => {
    const next = [...experiences];
    next[index] = { ...next[index], [field]: val };
    updateField('experience', next);
  };

  const handleRemoveExperience = (index: number) => {
    updateField('experience', experiences.filter((_, idx) => idx !== index));
  };

  // CV Education handlers
  const education = (d.education || []) as CvEducation[];
  const handleAddEducation = () => {
    const nextEdu: CvEducation = {
      id: `edu-${Date.now()}`,
      degree: 'Degree / Certificate',
      institution: 'University or College',
      period: '2020 — 2024',
    };
    updateField('education', [...education, nextEdu]);
  };

  const handleUpdateEducation = (index: number, field: keyof CvEducation, val: string) => {
    const next = [...education];
    next[index] = { ...next[index], [field]: val };
    updateField('education', next);
  };

  const handleRemoveEducation = (index: number) => {
    updateField('education', education.filter((_, idx) => idx !== index));
  };

  // Expense items handlers
  const expenses = (d.expenses || []) as ExpenseItem[];
  const handleAddExpense = () => {
    const next: ExpenseItem = {
      id: `exp-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      category: 'General',
      description: 'Expense description',
      amount: 0,
    };
    updateField('expenses', [...expenses, next]);
  };

  const handleUpdateExpense = (index: number, field: keyof ExpenseItem, val: unknown) => {
    const next = [...expenses];
    next[index] = { ...next[index], [field]: val };
    updateField('expenses', next);
  };

  const handleRemoveExpense = (index: number) => {
    updateField('expenses', expenses.filter((_, idx) => idx !== index));
  };

  // Report sections handlers
  const reportSections = (d.sections || []) as ReportSection[];
  const handleAddReportSection = () => {
    const next: ReportSection = {
      id: `sec-${Date.now()}`,
      title: 'New Section Heading',
      content: 'Discussion and details...',
    };
    updateField('sections', [...reportSections, next]);
  };

  const handleUpdateReportSection = (index: number, field: keyof ReportSection, val: string) => {
    const next = [...reportSections];
    next[index] = { ...next[index], [field]: val };
    updateField('sections', next);
  };

  const handleRemoveReportSection = (index: number) => {
    updateField('sections', reportSections.filter((_, idx) => idx !== index));
  };

  const copyExtractedText = () => {
    if (d.extractedText) {
      navigator.clipboard.writeText(String(d.extractedText));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4 text-xs font-sans">
      {definition.sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{section.title}</h3>
              {section.description && (
                <p className="text-[11px] text-slate-500 mt-0.5">{section.description}</p>
              )}
            </div>

            {section.kind === 'items' && (
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800 transition"
              >
                <Plus className="h-3 w-3" /> Add Item
              </button>
            )}
            {section.kind === 'experience' && (
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800 transition"
              >
                <Plus className="h-3 w-3" /> Add Experience
              </button>
            )}
            {section.kind === 'education' && (
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800 transition"
              >
                <Plus className="h-3 w-3" /> Add Education
              </button>
            )}
            {section.kind === 'expenses' && (
              <button
                type="button"
                onClick={handleAddExpense}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800 transition"
              >
                <Plus className="h-3 w-3" /> Add Expense
              </button>
            )}
            {section.kind === 'sections' && (
              <button
                type="button"
                onClick={handleAddReportSection}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 hover:bg-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-800 transition"
              >
                <Plus className="h-3 w-3" /> Add Section
              </button>
            )}
          </div>

          {/* Standard Fields */}
          {(!section.kind || section.kind === 'fields') && section.fields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.fields.map((field) => {
                const val = d[field.key] ?? '';
                const strVal = Array.isArray(val) ? val.join(', ') : String(val);
                return (
                  <label
                    key={field.key}
                    className={`space-y-1 block ${field.multiline ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
                      {field.label}
                      {field.required && <span className="text-rose-500 font-bold">*</span>}
                    </span>
                    {field.multiline ? (
                      <textarea
                        value={strVal}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={strVal}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="w-full rounded-md border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-300 focus:outline-none transition"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Line Items Table */}
          {section.kind === 'items' && (
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-4 text-center text-slate-400 text-xs">
                  No line items yet. Click &ldquo;Add Item&rdquo; above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[340px] space-y-1.5">
                    <div className="grid grid-cols-[1fr_56px_74px_74px_28px] gap-2 px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Description</span>
                      <span className="text-right">Qty</span>
                      <span className="text-right">Price</span>
                      <span className="text-right">Total</span>
                      <span />
                    </div>
                    {items.map((it, idx) => {
                      const q = Number(it.quantity || 1);
                      const p = Number(it.unitPrice || 0);
                      const tot = it.total ?? (q * p);
                      return (
                        <div
                          key={it.id || idx}
                          className="grid grid-cols-[1fr_56px_74px_74px_28px] gap-2 items-center bg-slate-50/70 p-1.5 rounded-md border border-slate-200/80"
                        >
                        <input
                          type="text"
                          value={it.description}
                          placeholder="Item name"
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none focus:border-slate-400"
                        />
                        <input
                          type="number"
                          value={it.quantity}
                          min={1}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-right text-slate-900 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={it.unitPrice}
                          min={0}
                          step={0.01}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-right text-slate-900 focus:outline-none"
                        />
                        <div className="text-right text-xs font-semibold text-slate-800 pr-1">
                          {tot.toFixed(2)}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Remove item"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Work Experience */}
          {section.kind === 'experience' && (
            <div className="space-y-2.5">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2 relative"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={exp.role}
                      placeholder="Role / Title"
                      onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      placeholder="Company"
                      onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={exp.period}
                      placeholder="Period (e.g. 2021 — Present)"
                      onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={exp.location || ''}
                      placeholder="Location (Optional)"
                      onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    placeholder="Accomplishments and responsibilities..."
                    rows={2}
                    onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {section.kind === 'education' && (
            <div className="space-y-2">
              {education.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 space-y-2"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.degree}
                      placeholder="Degree"
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      placeholder="Institution"
                      onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <input
                      type="text"
                      value={edu.period}
                      placeholder="Years"
                      onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-900 w-32 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-[11px] text-slate-400 hover:text-rose-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expenses */}
          {section.kind === 'expenses' && (
            <div className="overflow-x-auto">
              <div className="min-w-[420px] space-y-2">
                {expenses.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="grid grid-cols-[90px_90px_1fr_80px_28px] gap-2 items-center bg-slate-50/70 p-1.5 rounded border border-slate-200"
                  >
                    <input
                      type="date"
                      value={ex.date}
                      onChange={(e) => handleUpdateExpense(idx, 'date', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      value={ex.category}
                      placeholder="Category"
                      onChange={(e) => handleUpdateExpense(idx, 'category', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs"
                    />
                    <input
                      type="text"
                      value={ex.description}
                      placeholder="Description"
                      onChange={(e) => handleUpdateExpense(idx, 'description', e.target.value)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs"
                    />
                    <input
                      type="number"
                      value={ex.amount}
                      placeholder="0.00"
                      onChange={(e) => handleUpdateExpense(idx, 'amount', parseFloat(e.target.value) || 0)}
                      className="rounded border border-slate-200 bg-white px-1.5 py-1 text-xs text-right"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExpense(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Report Sections */}
          {section.kind === 'sections' && (
            <div className="space-y-2">
              {reportSections.map((sec, idx) => (
                <div
                  key={sec.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5 space-y-2"
                >
                  <input
                    type="text"
                    value={sec.title}
                    placeholder="Section Title"
                    onChange={(e) => handleUpdateReportSection(idx, 'title', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 focus:outline-none"
                  />
                  <textarea
                    value={sec.content}
                    placeholder="Section content..."
                    rows={2}
                    onChange={(e) => handleUpdateReportSection(idx, 'content', e.target.value)}
                    className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-900 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveReportSection(idx)}
                      className="text-[11px] text-slate-400 hover:text-rose-600"
                    >
                      Remove Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Extracted Raw Text Reference */}
      {Boolean(d.extractedText) && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <span className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-500" />
              Source Text Extracted
            </span>
            <span className="text-slate-400">
              {showRawText ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
          </button>

          {showRawText && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>Text content parsed from uploaded document</span>
                <button
                  type="button"
                  onClick={copyExtractedText}
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-[10px] text-slate-600 font-mono border border-slate-200">
                {String(d.extractedText)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
