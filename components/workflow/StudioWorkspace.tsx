'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FileUp,
  ArrowRight,
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Sparkles,
  Check,
  LoaderCircle,
  FileCode,
  LayoutTemplate,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import { parseUpload } from '@/lib/client/document-parser';
import {
  documentFrom,
  definitionFor,
  sampleDataFor,
  documentRegistry,
} from '@/lib/documents/registry';
import type { DocumentType, NormalizedDocumentData } from '@/lib/documents/types';
import { renderDocumentPdf } from '@/lib/client/pdf-templates';
import { downloadDocumentExcel, downloadDocumentCsv } from '@/lib/export/excel';
import DynamicDocumentEditor from '@/components/editor/DynamicDocumentEditor';
import DocumentPreview from '@/components/preview/DocumentPreview';
import TemplatePicker from '@/components/templates/TemplatePicker';

const allowedExtensions = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'md', 'jpg', 'jpeg', 'png', 'webp'];
const sampleTypes: { type: DocumentType; label: string; icon: string }[] = [
  { type: 'invoice', label: 'Invoice', icon: '📄' },
  { type: 'cv', label: 'CV / Resume', icon: '👤' },
  { type: 'receipt', label: 'Receipt', icon: '🧾' },
  { type: 'quotation', label: 'Quotation', icon: '💼' },
  { type: 'report', label: 'Report', icon: '📊' },
];

export default function StudioWorkspace() {
  const [document, setDocument] = useState<NormalizedDocumentData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor'); // for mobile toggling

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load from session storage on initial mount if available
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const docId = urlParams.get('id');
      const storedKey = docId ? `document:${docId}` : 'document:active';
      const stored = window.sessionStorage.getItem(storedKey);

      if (stored) {
        const parsed = JSON.parse(stored) as NormalizedDocumentData;
        setDocument(parsed);
        const def = definitionFor(parsed.type);
        setSelectedTemplate(def.defaultTemplate || def.templates[0]?.id || 'Modern');
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Save changes to session storage
  const handleDocumentChange = (updated: NormalizedDocumentData) => {
    setDocument(updated);
    try {
      window.sessionStorage.setItem(`document:${updated.id}`, JSON.stringify(updated));
      window.sessionStorage.setItem('document:active', JSON.stringify(updated));
    } catch {
      // storage quota
    }
  };

  // Change document type on the fly
  const handleTypeChange = (newType: DocumentType) => {
    if (!document) return;
    const today = new Date().toISOString().slice(0, 10);
    const newDef = definitionFor(newType);
    const defaults = sampleDataFor(newType, today);

    const updated: NormalizedDocumentData = {
      ...document,
      type: newType,
      confidence: 1.0,
      data: {
        ...defaults,
        extractedText: document.data.extractedText || '',
      },
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    handleDocumentChange(updated);
    setSelectedTemplate(newDef.defaultTemplate || newDef.templates[0]?.id || 'Modern');
  };

  // Process uploaded file
  const handleFileUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setErrorMessage(`Please upload a supported file (${allowedExtensions.join(', ')})`);
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 20MB limit.');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);
    setProcessingStage('Parsing file contents...');

    try {
      const parsed = await parseUpload(file);
      setProcessingStage('Analyzing document structure with AI...');

      const id = `doc-${Date.now()}`;
      const today = new Date().toISOString().slice(0, 10);
      let detectedType: DocumentType = parsed.kind;
      let confidence = parsed.confidence;
      let aiExtractedData: Record<string, unknown> = parsed.extractedData || {};

      // If we have text, call /api/analyze to check for AI extraction enhancements
      if (parsed.text) {
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileName: file.name, text: parsed.text.slice(0, 24000) }),
          });
          if (res.ok) {
            const result = (await res.json()) as {
              type?: DocumentType;
              confidence?: number;
              data?: Record<string, unknown>;
              fallback?: boolean;
            };
            if (!result.fallback && result.type && result.type !== 'unknown') {
              detectedType = result.type;
              if (result.confidence) confidence = result.confidence;
              if (result.data) aiExtractedData = { ...aiExtractedData, ...result.data };
            }
          }
        } catch {
          // fallback to client heuristics
        }
      }

      setProcessingStage('Generating smart editor & templates...');
      const newDoc = documentFrom(
        detectedType,
        { name: file.name, type: file.type || 'application/octet-stream', size: file.size },
        parsed.text,
        confidence,
        id,
        today,
        aiExtractedData
      );

      const def = definitionFor(detectedType);
      const initialTemplate = def.defaultTemplate || def.templates[0]?.id || 'Modern';

      setDocument(newDoc);
      setSelectedTemplate(initialTemplate);
      window.sessionStorage.setItem(`document:${id}`, JSON.stringify(newDoc));
      window.sessionStorage.setItem('document:active', JSON.stringify(newDoc));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to parse file.');
    } finally {
      setIsProcessing(false);
      setProcessingStage('');
    }
  };

  // Load sample starter document
  const handleLoadSample = (type: DocumentType) => {
    const id = `sample-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const def = definitionFor(type);
    const newDoc: NormalizedDocumentData = {
      id,
      type,
      confidence: 1.0,
      sourceFile: { name: `Sample-${def.label.replace(/\s+/g, '-')}.pdf`, type: 'application/pdf' },
      data: sampleDataFor(type, today),
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    };

    setDocument(newDoc);
    setSelectedTemplate(def.defaultTemplate || def.templates[0]?.id || 'Modern');
    window.sessionStorage.setItem(`document:${id}`, JSON.stringify(newDoc));
    window.sessionStorage.setItem('document:active', JSON.stringify(newDoc));
  };

  // Reset to upload screen
  const handleReset = () => {
    setDocument(null);
    setErrorMessage('');
    window.sessionStorage.removeItem('document:active');
  };

  // Export handlers
  const getExportFileName = () => {
    if (!document) return 'document';
    const raw =
      document.data.title ||
      document.data.fullName ||
      document.data.invoiceNumber ||
      document.data.quoteNumber ||
      document.data.receiptNumber ||
      document.sourceFile.name;
    return String(raw).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'document';
  };

  const handleExportPdf = () => {
    if (!document) return;
    const pdf = renderDocumentPdf(document, selectedTemplate);
    pdf.save(`${getExportFileName()}.pdf`);
    setShowExportMenu(false);
  };

  const handleExportExcel = () => {
    if (!document) return;
    downloadDocumentExcel(document, getExportFileName());
    setShowExportMenu(false);
  };

  const handleExportCsv = () => {
    if (!document) return;
    downloadDocumentCsv(document, getExportFileName());
    setShowExportMenu(false);
  };

  const handleExportJson = () => {
    if (!document) return;
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${getExportFileName()}.json`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // ==========================================
  // VIEW 1: UPLOAD & DETECTION STAGE
  // ==========================================
  if (!document) {
    return (
      <main className="min-h-screen px-4 py-8 md:py-14 flex flex-col justify-between">
        <div className="mx-auto w-full max-w-4xl space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white font-bold text-base shadow-sm ring-1 ring-slate-800">
                A
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-950 tracking-tight">AI Document Studio</h1>
                <p className="text-xs text-slate-500">Universal Document Identification &amp; Design</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Identification Ready
            </div>
          </header>

          {/* Hero Banner */}
          <div className="space-y-3 text-center max-w-2xl mx-auto pt-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              Upload Any Document
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
              One unified studio for every document.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Upload an invoice, resume, receipt, quote, or report. AI detects the type, generates the structured editor, and applies professional templates.
            </p>
          </div>

          {/* Dropzone Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-8 shadow-sm">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); void handleFileUpload(e.dataTransfer.files); }}
              className={`rounded-xl border-2 border-dashed p-8 sm:p-14 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : 'border-slate-300/80 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.docx,.md,.txt"
                onChange={(e) => void handleFileUpload(e.target.files)}
              />

              {isProcessing ? (
                <div className="space-y-4 py-4">
                  <LoaderCircle className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{processingStage}</h3>
                    <p className="text-xs text-slate-500 mt-1">Extracting structured fields and detecting layout...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm border border-slate-200/80">
                    <FileUp className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Drop your file here</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports PDF, Word (DOCX), Excel (XLSX, CSV), Markdown, TXT, or Images up to 20MB.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition"
                  >
                    Select File From Device <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Quick Sample Starters */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center sm:text-left">
                Or start instantly with a sample document:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {sampleTypes.map((sample) => (
                  <button
                    key={sample.type}
                    type="button"
                    onClick={() => handleLoadSample(sample.type)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 text-left text-xs font-semibold text-slate-800 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 transition"
                  >
                    <span className="text-base">{sample.icon}</span>
                    <span>{sample.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-xs text-slate-400">
          Browser-based document processing · Your data stays local and private
        </footer>
      </main>
    );
  }

  // ==========================================
  // VIEW 2: SPLIT-SCREEN SMART STUDIO
  // ==========================================
  const activeDef = definitionFor(document.type);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Studio Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Document Info */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              title="Upload New Document"
            >
              A
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                  {String(document.data.title || document.data.fullName || document.sourceFile.name)}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border ${activeDef.badgeColor}`}>
                  <Sparkles className="h-3 w-3" />
                  {activeDef.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                {document.sourceFile.name} · {Math.round(document.confidence * 100)}% detection confidence
              </p>
            </div>
          </div>

          {/* Workflow Stepper Indicator */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3.5 w-3.5" /> 1. Upload
            </span>
            <span>→</span>
            <span className="flex items-center gap-1 text-emerald-600">
              <Check className="h-3.5 w-3.5" /> 2. AI Identified
            </span>
            <span>→</span>
            <span className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
              <Pencil className="h-3 w-3" /> 3. Smart Edit &amp; Style
            </span>
            <span>→</span>
            <span>4. Export</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Document Type Switcher Dropdown */}
            <div className="relative">
              <select
                value={document.type}
                onChange={(e) => handleTypeChange(e.target.value as DocumentType)}
                className="appearance-none rounded-lg border border-slate-200 bg-white pl-2.5 pr-7 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-none cursor-pointer"
                title="Change Document Type"
              >
                {Object.keys(documentRegistry).map((key) => {
                  const def = documentRegistry[key as DocumentType];
                  return (
                    <option key={key} value={key}>
                      Type: {def.label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
              title="Upload another document"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Upload</span>
            </button>

            {/* Export Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg z-50 text-xs font-medium space-y-0.5"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-blue-50 hover:text-blue-700 text-left transition"
                  >
                    <FileText className="h-4 w-4 text-rose-500" />
                    <div>
                      <p className="font-semibold">Export as PDF</p>
                      <p className="text-[10px] text-slate-500">Styled matching {selectedTemplate}</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 text-left transition"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <div>
                      <p className="font-semibold">Export as Excel (.xlsx)</p>
                      <p className="text-[10px] text-slate-500">Multi-sheet data tables</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-amber-50 hover:text-amber-700 text-left transition"
                  >
                    <FileText className="h-4 w-4 text-amber-600" />
                    <div>
                      <p className="font-semibold">Export as CSV</p>
                      <p className="text-[10px] text-slate-500">Tabular items &amp; values</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-800 hover:bg-slate-100 text-left transition"
                  >
                    <FileCode className="h-4 w-4 text-indigo-500" />
                    <div>
                      <p className="font-semibold">Export as JSON</p>
                      <p className="text-[10px] text-slate-500">Normalized document data</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Toggle */}
        <div className="flex lg:hidden mt-2 pt-2 border-t border-slate-100 justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'editor' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Pencil className="h-3.5 w-3.5" /> Smart Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'preview' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <LayoutTemplate className="h-3.5 w-3.5" /> Template &amp; Preview
          </button>
        </div>
      </header>

      {/* Main Studio Body: Split View */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Dynamic Smart Form Editor */}
          <section
            className={`lg:col-span-5 space-y-4 ${
              activeTab === 'editor' ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-950">Dynamic {activeDef.label} Editor</h2>
                  <p className="text-xs text-slate-500">
                    Fields are automatically extracted from your document. Edit anytime.
                  </p>
                </div>
              </div>

              <DynamicDocumentEditor
                document={document}
                onChange={handleDocumentChange}
              />
            </div>
          </section>

          {/* Right Column: Template Selector & Live WYSIWYG Preview */}
          <section
            className={`lg:col-span-7 space-y-5 ${
              activeTab === 'preview' ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Template Selection Gallery */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
              <TemplatePicker
                definition={activeDef}
                selectedTemplateId={selectedTemplate}
                onSelect={setSelectedTemplate}
              />
            </div>

            {/* Live Document Preview Card */}
            <div className="bg-slate-200/70 border border-slate-300/80 rounded-2xl p-2 sm:p-6 shadow-inner overflow-x-auto">
              <div className="flex justify-between items-center mb-3 px-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Live WYSIWYG Preview ({selectedTemplate} Style)
                </span>
                <span className="text-[11px] text-slate-600 bg-white/80 px-2 py-0.5 rounded shadow-2xs">
                  A4 Page Simulation
                </span>
              </div>

              <DocumentPreview
                document={document}
                templateId={selectedTemplate}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
