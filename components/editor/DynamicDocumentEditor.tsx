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
      content: 'Detailed discussion and analysis...',
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
    <div className="space-y-6">
      {definition.sections.map((section) => (
        <div
          key={section.id}
          className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{section.title}</h3>
              {section.description && (
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
              )}
            </div>
            {section.kind === 'items' && (
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item
              </button>
            )}
            {section.kind === 'experience' && (
              <button
                type="button"
                onClick={handleAddExperience}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Experience
              </button>
            )}
            {section.kind === 'education' && (
              <button
                type="button"
                onClick={handleAddEducation}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Education
              </button>
            )}
            {section.kind === 'expenses' && (
              <button
                type="button"
                onClick={handleAddExpense}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Expense
              </button>
            )}
            {section.kind === 'sections' && (
              <button
                type="button"
                onClick={handleAddReportSection}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Add Section
              </button>
            )}
          </div>

          {/* Standard Fields Section */}
          {(!section.kind || section.kind === 'fields') && section.fields && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.fields.map((field) => {
                const val = d[field.key] ?? '';
                const strVal = Array.isArray(val) ? val.join(', ') : String(val);
                return (
                  <label
                    key={field.key}
                    className={`space-y-1 text-left ${field.multiline ? 'sm:col-span-2' : ''}`}
                  >
                    <span className="text-xs font-medium text-slate-700 flex items-center justify-between">
                      {field.label}
                      {field.required && <span className="text-rose-500 text-[10px]">*</span>}
                    </span>
                    {field.multiline ? (
                      <textarea
                        value={strVal}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                      />
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={strVal}
                        placeholder={field.placeholder}
                        onChange={(e) => updateField(field.key, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                      />
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {/* Line Items Table Section */}
          {section.kind === 'items' && (
            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 py-6 text-center text-xs text-slate-500">
                  No line items yet. Click &ldquo;Add Item&rdquo; to start.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_70px_90px_80px_32px] gap-2 px-1 text-[11px] font-semibold text-slate-500 uppercase">
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
                        className="grid grid-cols-[1fr_70px_90px_80px_32px] gap-2 items-center bg-slate-50/50 p-2 rounded-lg border border-slate-200/70"
                      >
                        <input
                          type="text"
                          value={it.description}
                          placeholder="Item name / description"
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={it.quantity}
                          min={1}
                          onChange={(e) => handleUpdateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-right text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                        <input
                          type="number"
                          value={it.unitPrice}
                          min={0}
                          step={0.01}
                          onChange={(e) => handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-right text-slate-900 focus:border-blue-500 focus:outline-none"
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
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Work Experience Section */}
          {section.kind === 'experience' && (
            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 space-y-3 relative"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={exp.role}
                      placeholder="Role / Title"
                      onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={exp.company}
                      placeholder="Company"
                      onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={exp.period}
                      placeholder="Period (e.g. 2021 — Present)"
                      onChange={(e) => handleUpdateExperience(idx, 'period', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={exp.location || ''}
                      placeholder="Location (Optional)"
                      onChange={(e) => handleUpdateExperience(idx, 'location', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <textarea
                    value={exp.description}
                    placeholder="Description of accomplishments and projects..."
                    rows={2}
                    onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(idx)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove Experience
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education Section */}
          {section.kind === 'education' && (
            <div className="space-y-3">
              {education.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 space-y-2 relative"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={edu.degree}
                      placeholder="Degree / Field"
                      onChange={(e) => handleUpdateEducation(idx, 'degree', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.institution}
                      placeholder="Institution"
                      onChange={(e) => handleUpdateEducation(idx, 'institution', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.period}
                      placeholder="Years (e.g. 2018 — 2022)"
                      onChange={(e) => handleUpdateEducation(idx, 'period', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={edu.details || ''}
                      placeholder="Honors / Details (Optional)"
                      onChange={(e) => handleUpdateEducation(idx, 'details', e.target.value)}
                      className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Expenses Section */}
          {section.kind === 'expenses' && (
            <div className="space-y-3">
              {expenses.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="grid grid-cols-[100px_100px_1fr_90px_32px] gap-2 items-center bg-slate-50/50 p-2 rounded-lg border border-slate-200"
                >
                  <input
                    type="date"
                    value={ex.date}
                    onChange={(e) => handleUpdateExpense(idx, 'date', e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={ex.category}
                    placeholder="Category"
                    onChange={(e) => handleUpdateExpense(idx, 'category', e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900"
                  />
                  <input
                    type="text"
                    value={ex.description}
                    placeholder="Description"
                    onChange={(e) => handleUpdateExpense(idx, 'description', e.target.value)}
                    className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900"
                  />
                  <input
                    type="number"
                    value={ex.amount}
                    placeholder="0.00"
                    onChange={(e) => handleUpdateExpense(idx, 'amount', parseFloat(e.target.value) || 0)}
                    className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-right text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Report Sections */}
          {section.kind === 'sections' && (
            <div className="space-y-3">
              {reportSections.map((sec, idx) => (
                <div
                  key={sec.id || idx}
                  className="rounded-lg border border-slate-200 bg-slate-50/40 p-3 space-y-2"
                >
                  <input
                    type="text"
                    value={sec.title}
                    placeholder="Section Title"
                    onChange={(e) => handleUpdateReportSection(idx, 'title', e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <textarea
                    value={sec.content}
                    placeholder="Section content..."
                    rows={3}
                    onChange={(e) => handleUpdateReportSection(idx, 'content', e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveReportSection(idx)}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-600 transition"
                    >
                      <Trash2 className="h-3 w-3" /> Remove Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Raw Extracted Text Reference Drawer */}
      {Boolean(d.extractedText) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowRawText(!showRawText)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
          >
            <span className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Original Extracted File Text
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              {showRawText ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </span>
          </button>

          {showRawText && (
            <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-[11px] text-slate-500">
                <span>Direct text content parsed from original upload</span>
                <button
                  type="button"
                  onClick={copyExtractedText}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy Text'}
                </button>
              </div>
              <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-[11px] text-slate-700 font-mono border border-slate-200">
                {String(d.extractedText)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
