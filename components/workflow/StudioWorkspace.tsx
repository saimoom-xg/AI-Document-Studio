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
  LoaderCircle,
  FileCode,
  LayoutTemplate,
  Pencil,
  ChevronDown,
  Columns2,
  Maximize2,
} from 'lucide-react';
import { parseUpload } from '@/lib/client/document-parser';
import {
  documentFrom,
  definitionFor,
  sampleDataFor,
  emptyDataFor,
  documentRegistry,
} from '@/lib/documents/registry';
import type { DocumentType, NormalizedDocumentData } from '@/lib/documents/types';
import { renderDocumentPdf } from '@/lib/client/pdf-templates';
import { downloadDocumentExcel, downloadDocumentCsv } from '@/lib/export/excel';
import DynamicDocumentEditor from '@/components/editor/DynamicDocumentEditor';
import DocumentPreview from '@/components/preview/DocumentPreview';
import TemplatePicker from '@/components/templates/TemplatePicker';

const allowedExtensions = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt', 'md', 'jpg', 'jpeg', 'png', 'webp'];
const sampleTypes: { type: DocumentType; label: string }[] = [
  { type: 'invoice', label: 'Invoice' },
  { type: 'cv', label: 'CV / Resume' },
  { type: 'receipt', label: 'Receipt' },
  { type: 'quotation', label: 'Quotation' },
  { type: 'report', label: 'Report' },
];

export default function StudioWorkspace() {
  const [document, setDocument] = useState<NormalizedDocumentData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [exportNotice, setExportNotice] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // View Mode: 'split' | 'editor' | 'preview'
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load from session storage if available
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

  const handleDocumentChange = (updated: NormalizedDocumentData) => {
    setDocument(updated);
    try {
      window.sessionStorage.setItem(`document:${updated.id}`, JSON.stringify(updated));
      window.sessionStorage.setItem('document:active', JSON.stringify(updated));
    } catch {
      // quota
    }
  };

  const handleTypeChange = (newType: DocumentType) => {
    if (!document) return;
    const newDef = definitionFor(newType);
    const emptyDefaults = emptyDataFor(newType);

    // Keep user's real edited data (name, email, phone, items, extractedText) intact!
    const updated: NormalizedDocumentData = {
      ...document,
      type: newType,
      confidence: 1.0,
      data: {
        ...emptyDefaults,
        ...document.data,
      },
      metadata: {
        ...document.metadata,
        updatedAt: new Date().toISOString(),
      },
    };

    handleDocumentChange(updated);
    setSelectedTemplate(newDef.defaultTemplate || newDef.templates[0]?.id || 'Modern');
  };


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
    setProcessingStage('Reading document...');

    try {
      const parsed = await parseUpload(file);
      setProcessingStage('Detecting document type & extracting structured fields...');

      const id = `doc-${Date.now()}`;
      const today = new Date().toISOString().slice(0, 10);
      let detectedType: DocumentType = parsed.kind;
      let confidence = parsed.confidence;
      let aiExtractedData: Record<string, unknown> = parsed.extractedData || {};

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
          // fallback
        }
      }

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

  const handleReset = () => {
    setDocument(null);
    setErrorMessage('');
    window.sessionStorage.removeItem('document:active');
  };

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
    try {
      setExportNotice('Generating vector PDF...');
      const pdf = renderDocumentPdf(document, selectedTemplate);
      pdf.save(`${getExportFileName()}.pdf`);
      setShowExportMenu(false);
      setExportNotice('PDF downloaded successfully!');
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      setExportNotice('Direct download failed. Opening print view...');
      setTimeout(() => {
        window.print();
        setExportNotice('');
      }, 1000);
    }
  };

  const handlePrintPdf = () => {
    setShowExportMenu(false);
    window.print();
  };

  const handleExportExcel = () => {
    if (!document) return;
    try {
      downloadDocumentExcel(document, getExportFileName());
      setShowExportMenu(false);
      setExportNotice('Excel spreadsheet downloaded!');
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('Excel export error:', err);
    }
  };

  const handleExportCsv = () => {
    if (!document) return;
    try {
      downloadDocumentCsv(document, getExportFileName());
      setShowExportMenu(false);
      setExportNotice('CSV file downloaded!');
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('CSV export error:', err);
    }
  };

  const handleExportJson = () => {
    if (!document) return;
    try {
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
      setExportNotice('JSON data downloaded!');
      setTimeout(() => setExportNotice(''), 3000);
    } catch (err) {
      console.error('JSON export error:', err);
    }
  };

  // ==========================================
  // VIEW 1: CLEAN MINIMALIST UPLOAD SCREEN
  // ==========================================
  if (!document) {

    return (
      <main className="min-h-screen px-4 py-8 md:py-16 flex flex-col justify-between font-sans">
        <div className="mx-auto w-full max-w-3xl space-y-10">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-slate-200/70 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-md bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                D
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-900">Document Studio</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Universal AI Document Editor</span>
          </header>

          {/* Minimal Hero */}
          <div className="space-y-2 text-center max-w-xl mx-auto pt-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Upload any document.
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              AI detects the type, generates the structured editor, applies professional layouts, and exports.
            </p>
          </div>

          {/* Minimal Clean Dropzone */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-8 shadow-2xs space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => { e.preventDefault(); setDragActive(false); void handleFileUpload(e.dataTransfer.files); }}
              className={`rounded-xl border border-dashed p-8 sm:p-14 text-center transition-all ${
                dragActive
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
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
                <div className="space-y-3 py-4">
                  <LoaderCircle className="h-8 w-8 animate-spin text-slate-800 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">{processingStage}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs">
                    <FileUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">Drop a file here</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOCX, Excel, CSV, or Text</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white hover:bg-slate-800 transition"
                  >
                    Select File <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {errorMessage}
              </div>
            )}

            {/* Clean Sample Starters */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] text-slate-400 mr-1">Or sample:</span>
              {sampleTypes.map((sample) => (
                <button
                  key={sample.type}
                  type="button"
                  onClick={() => handleLoadSample(sample.type)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="text-center text-[11px] text-slate-400 pt-12">
          Local browser-based processing · Minimalist &amp; privacy-first
        </footer>
      </main>
    );
  }

  // ==========================================
  // VIEW 2: CLEAN MINIMALIST STUDIO WORKSPACE
  // ==========================================
  const activeDef = definitionFor(document.type);

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans">
      {/* Minimal Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 px-4 py-2.5">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Document Type */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              title="Upload New File"
            >
              D
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900 truncate max-w-[160px] sm:max-w-xs">
                {String(document.data.title || document.data.fullName || document.sourceFile.name)}
              </span>

              {/* Type Switcher Selector */}
              <div className="relative">
                <select
                  value={document.type}
                  onChange={(e) => handleTypeChange(e.target.value as DocumentType)}
                  className="appearance-none rounded-md border border-slate-200 bg-slate-50 pl-2 pr-5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer"
                >
                  {Object.keys(documentRegistry).map((key) => {
                    const def = documentRegistry[key as DocumentType];
                    return (
                      <option key={key} value={key}>
                        {def.label}
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="h-3 w-3 text-slate-400 absolute right-1.5 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* View Mode Switcher (Split, Editor, Preview) */}
          <div className="hidden sm:flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === 'split' ? 'bg-white text-slate-950 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns2 className="h-3.5 w-3.5" />
              <span>Split View</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('editor')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === 'editor' ? 'bg-white text-slate-950 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Editor Only</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                viewMode === 'preview' ? 'bg-white text-slate-950 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Preview Only</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">Upload New</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export</span>
                <ChevronDown className="h-3 w-3" />
              </button>

              {showExportMenu && (
                <div
                  className="absolute right-0 mt-1.5 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg z-50 text-xs font-medium space-y-0.5"
                  onMouseLeave={() => setShowExportMenu(false)}
                >
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-800 hover:bg-slate-100 text-left transition"
                  >
                    <FileText className="h-4 w-4 text-slate-700" />
                    <div>
                      <p className="font-semibold">Export PDF</p>
                      <p className="text-[10px] text-slate-400">{selectedTemplate} Layout</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-800 hover:bg-slate-100 text-left transition"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-slate-700" />
                    <div>
                      <p className="font-semibold">Export Excel (.xlsx)</p>
                      <p className="text-[10px] text-slate-400">Data sheets</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-800 hover:bg-slate-100 text-left transition"
                  >
                    <FileText className="h-4 w-4 text-slate-700" />
                    <div>
                      <p className="font-semibold">Export CSV</p>
                      <p className="text-[10px] text-slate-400">Items / values</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-slate-800 hover:bg-slate-100 text-left transition"
                  >
                    <FileCode className="h-4 w-4 text-slate-700" />
                    <div>
                      <p className="font-semibold">Export JSON</p>
                      <p className="text-[10px] text-slate-400">Normalized document</p>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={handlePrintPdf}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-100 text-left transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-500" />
                      <span className="text-[11px]">Print / Save via Browser</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile View Segmented Switcher */}
        <div className="flex sm:hidden mt-2 pt-2 border-t border-slate-100 items-center justify-between gap-1 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition ${
              viewMode === 'editor' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition ${
              viewMode === 'preview' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`flex-1 py-1.5 rounded-md font-medium text-center transition ${
              viewMode === 'split' ? 'bg-slate-900 text-white font-semibold shadow-xs' : 'bg-slate-100 text-slate-600'
            }`}
          >
            Both
          </button>
        </div>

        {/* Export Status Toast Banner */}
        {exportNotice && (
          <div className="mt-2 py-1 px-3 bg-slate-900 text-white text-[11px] font-medium rounded-md text-center shadow-xs flex items-center justify-center gap-2 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {exportNotice}
          </div>
        )}
      </header>


      {/* Main Studio Body */}
      <div className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-5">
        <div className={`grid gap-6 items-start ${
          viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1 max-w-4xl mx-auto'
        }`}>
          {/* Dynamic Smart Editor */}
          {(viewMode === 'split' || viewMode === 'editor') && (
            <section className={viewMode === 'split' ? 'lg:col-span-5 space-y-4' : 'w-full space-y-4'}>
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {activeDef.label} Editor
                </span>
                <span className="text-[11px] text-slate-400">
                  Pre-filled &amp; editable
                </span>
              </div>
              <DynamicDocumentEditor
                document={document}
                onChange={handleDocumentChange}
              />
            </section>
          )}

          {/* Template Gallery & Live Preview */}
          {(viewMode === 'split' || viewMode === 'preview') && (
            <section className={viewMode === 'split' ? 'lg:col-span-7 space-y-4' : 'w-full space-y-4'}>
              {/* Template Picker */}
              <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-2xs">
                <TemplatePicker
                  definition={activeDef}
                  selectedTemplateId={selectedTemplate}
                  onSelect={setSelectedTemplate}
                />
              </div>

              {/* Preview Sheet Card */}
              <div className="bg-slate-100/80 border border-slate-200/90 rounded-xl p-2 sm:p-5 overflow-x-auto shadow-inner">
                <DocumentPreview
                  document={document}
                  templateId={selectedTemplate}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
