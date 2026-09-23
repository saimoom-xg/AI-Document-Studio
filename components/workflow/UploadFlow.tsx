'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Check, FileUp, LoaderCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { parseUpload } from '@/lib/client/document-parser';
import { documentFrom } from '@/lib/documents/registry';
import type { DocumentType } from '@/lib/documents/types';

const extensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx', 'xls', 'csv', 'docx', 'md', 'txt'];
const formats = ['PDF', 'Images', 'Excel', 'CSV', 'DOCX', 'TXT', 'Markdown'];
const maxSize = 15 * 1024 * 1024;

type UploadState = 'idle' | 'processing' | 'error';

export default function UploadFlow() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState('');

  const handleFiles = async (incoming: FileList | null) => {
    const next = incoming?.[0];
    if (!next) return;
    const extension = next.name.split('.').pop()?.toLowerCase();
    if (!extension || !extensions.includes(extension)) {
      setError('Choose a PDF, image, spreadsheet, DOCX, text, or Markdown file.');
      setState('error');
      return;
    }
    if (next.size > maxSize) {
      setError('This file is larger than 15MB.');
      setState('error');
      return;
    }

    setFile(next);
    setError('');
    setState('processing');
    try {
      const parsed = await parseUpload(next);
      const id = `doc-${Date.now()}`;
      const now = new Date().toISOString();
      const extractedText = parsed.text.slice(0, 30000);
      const supportedTypes: DocumentType[] = ['invoice', 'receipt', 'cv', 'quotation', 'purchase_order', 'report', 'expense_report'];
      let supportedType: DocumentType = supportedTypes.includes(parsed.kind as DocumentType) ? parsed.kind as DocumentType : 'unknown';
      let confidence = parsed.text ? 0.86 : 0.45;
      let aiData: Record<string, unknown> = {};

      if (extractedText) {
        const analysisResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileName: next.name, text: extractedText }),
        });
        if (analysisResponse.ok) {
          const analysis = await analysisResponse.json() as { type?: DocumentType; confidence?: number; data?: Record<string, unknown> };
          if (analysis.type) supportedType = analysis.type;
          if (typeof analysis.confidence === 'number') confidence = analysis.confidence;
          if (analysis.data) aiData = analysis.data;
        }
      }

      const document = documentFrom(supportedType, { name: next.name, type: next.type || 'application/octet-stream', size: next.size }, extractedText || parsed.note || '', confidence, id, now.slice(0, 10));
      document.data = { ...document.data, ...aiData, extractedText: extractedText || parsed.note || document.data.extractedText };
      window.sessionStorage.setItem(`document:${id}`, JSON.stringify(document));
      router.push(`/editor?id=${id}`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'This file could not be parsed in the browser.');
      setState('error');
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">A</div>
            <span className="text-sm font-semibold text-slate-900">AI Document Studio</span>
          </div>
          <span className="text-xs text-slate-500">Private, browser-based workspace</span>
        </header>

        <section className="mb-8">
          <p className="mb-3 text-sm font-medium text-blue-600">Step 1 of 3</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">Start with a document.</h1>
          <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">Upload a file and we will detect its type, extract the contents, and prepare a focused editing workspace.</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div
            onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(event) => { event.preventDefault(); setDragActive(false); void handleFiles(event.dataTransfer.files); }}
            className={`m-2 rounded-lg border border-dashed p-10 text-center transition md:p-16 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50/70'}`}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"><FileUp className="h-5 w-5" /></div>
            <h2 className="mt-5 text-lg font-semibold text-slate-900">Drop a file here</h2>
            <p className="mt-2 text-sm text-slate-500">Up to 15MB. Files are processed locally and never uploaded.</p>
            <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Choose file <ArrowRight className="h-4 w-4" /></button>
            <input ref={inputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.docx,.md,.txt" onChange={(event) => void handleFiles(event.target.files)} />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">{formats.map((format) => <span key={format} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{format}</span>)}</div>
        </section>

        {file && <section className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700"><Check className="h-4 w-4" /></div><div className="min-w-0"><p className="truncate font-medium text-slate-900">{file.name}</p><p className="text-xs text-slate-500">{state === 'processing' ? 'Detecting and extracting...' : state === 'error' ? 'Needs attention' : 'Ready'}</p></div>{state === 'processing' && <LoaderCircle className="h-4 w-4 animate-spin text-blue-600" />}</div><button type="button" onClick={() => { setFile(null); setState('idle'); setError(''); }} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Remove file"><X className="h-4 w-4" /></button></section>}
        {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
        <p className="mt-8 text-center text-xs text-slate-500">Your extracted document is temporary and stays in this browser session.</p>
      </div>
    </main>
  );
}
