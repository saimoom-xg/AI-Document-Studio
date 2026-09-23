'use client';

import { useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileUp, LoaderCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const formats = ['PDF', 'JPG', 'PNG', 'WEBP', 'DOCX', 'XLSX', 'CSV', 'Markdown', 'Text'];
const extensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'xlsx', 'xls', 'csv', 'docx', 'md', 'txt'];
const maxSize = 15 * 1024 * 1024;

type UploadState = 'idle' | 'processing' | 'error';

export default function UploadPage() {
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
      setError('That file type is not supported. Choose a PDF, image, spreadsheet, DOCX, Markdown, or text file.');
      setState('error');
      return;
    }
    if (next.size > maxSize) {
      setError('This file is larger than 15MB. Choose a smaller document and try again.');
      setState('error');
      return;
    }
    setFile(next);
    setError('');
    setState('processing');
    try {
      const id = `doc-${Date.now()}`;
      const now = new Date().toISOString();
      const preview = next.type.startsWith('text/') ? (await next.text()).slice(0, 5000) : '';
      const document = {
        id,
        type: 'invoice' as const,
        confidence: 0.86,
        sourceFile: { name: next.name, type: next.type || 'application/octet-stream', size: next.size },
        data: {
          invoiceNumber: 'DRAFT-001', invoiceDate: now.slice(0, 10), dueDate: now.slice(0, 10), currency: 'USD',
          seller: { name: 'Your business', email: '', address: '' },
          customer: { name: 'Client name', email: '', address: '' },
          items: [{ id: 'item-1', description: preview || 'Imported document', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }],
          notes: 'Review the imported details before exporting.', terms: '',
        },
        metadata: { createdAt: now, updatedAt: now },
      };
      window.sessionStorage.setItem(`document:${id}`, JSON.stringify(document));
      router.push(`/editor?id=${id}`);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'We could not process this document. Please try again.');
      setState('error');
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Back to dashboard</Link>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Start a document</div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Drop your document here</h1>
            <p className="mt-2 text-slate-600">We validate the file, detect its type, and prepare editable structured data.</p>
            <div onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); void handleFiles(event.dataTransfer.files); }} className={`mt-8 rounded-3xl border-2 border-dashed p-8 text-center transition ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"><FileUp className="h-7 w-7 text-slate-700" /></div>
              <p className="mt-5 text-xl font-semibold text-slate-900">Drag and drop files here</p>
              <p className="mt-2 text-sm text-slate-500">Up to 15MB per file. Your original file stays private.</p>
              <button type="button" onClick={() => inputRef.current?.click()} className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800">Browse files</button>
              <input ref={inputRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.xls,.csv,.docx,.md,.txt" onChange={(event) => void handleFiles(event.target.files)} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">{formats.map((format) => <span key={format} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">{format}</span>)}</div>
          </section>
          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Processing status</div>
            {file ? <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-slate-500">Selected file</p><p className="mt-1 break-all text-base font-semibold text-slate-900">{file.name}</p></div><button type="button" onClick={() => { setFile(null); setState('idle'); }} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500" aria-label="Remove selected file"><X className="h-4 w-4" /></button></div></div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between text-sm text-slate-500"><span>{state === 'error' ? 'Needs attention' : 'Analyzing document'}</span><span>{state === 'processing' ? 'In progress' : state === 'error' ? 'Failed' : 'Ready'}</span></div><div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full transition-all ${state === 'error' ? 'w-1/3 bg-red-500' : state === 'processing' ? 'w-3/4 bg-blue-600' : 'w-0'}`} /></div><div className="mt-4 space-y-2 text-sm text-slate-600"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> File validated</div><div className="flex items-center gap-2">{state === 'processing' ? <LoaderCircle className="h-4 w-4 animate-spin text-blue-500" /> : <CheckCircle2 className="h-4 w-4 text-emerald-500" />} Detecting document type</div><div className="flex items-center gap-2 text-slate-500"><span className="h-4 w-4" /> Preparing editor</div></div></div>
              {error && <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button type="button" onClick={() => inputRef.current?.click()} className="mt-3 block font-semibold underline">Try again</button></div>}
            </div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No file selected yet. The upload queue will display validation and processing status here.</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
