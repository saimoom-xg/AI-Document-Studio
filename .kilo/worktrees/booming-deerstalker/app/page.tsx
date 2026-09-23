import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, LayoutTemplate, ShieldCheck, Sparkles, UploadCloud } from 'lucide-react';

const features = [
  { icon: UploadCloud, title: 'Smart upload workflow', text: 'Support for PDF, images, Excel, CSV, DOCX, Markdown, and text formats.' },
  { icon: Sparkles, title: 'AI extraction', text: 'Detect the document type and convert raw files into structured, reviewable data.' },
  { icon: LayoutTemplate, title: 'Template-driven export', text: 'Move from extracted data into polished invoice, CV, and report layouts instantly.' },
  { icon: ShieldCheck, title: 'Production-grade safety', text: 'Server-side AI, schema validation, and clean ownership boundaries from day one.' },
];

const supportedDocs = ['Invoice', 'Receipt', 'CV / Resume', 'Quotation', 'Purchase Order', 'Reports'];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="section-shell flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">A</div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">AI Document Studio</p>
            <p className="text-sm font-medium text-slate-700">Document workflow platform</p>
          </div>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="#how-it-works">How it works</Link>
          <Link href="#documents">Documents</Link>
          <Link href="#features">Features</Link>
          <Link href="#faq">FAQ</Link>
        </nav>
        <Link href="/dashboard" className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
          Open dashboard
        </Link>
      </header>

      <section className="section-shell grid gap-10 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
            <Sparkles className="h-4 w-4" />
            A calmer way to finish your paperwork
          </div>
          <h1 className="display-font max-w-xl text-5xl font-bold leading-[0.98] text-slate-900 xl:text-7xl">
            Build polished documents from raw files in minutes.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Upload a PDF, image, Excel file, CV, invoice, or receipt. AI extracts the data, you review it, choose a design, and export a clean final version.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">
              Upload a Document
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
              See how it works
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-4 text-sm text-slate-600">
            {['PDF', 'Images', 'Excel', 'Invoices', 'CVs'].map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-card relative overflow-hidden p-6">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400" />
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Document</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">invoice.pdf</p>
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Detected</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Invoice</span>
                <span>95% confidence</span>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-[95%] rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
              </div>
              <div className="mt-5 grid gap-3 text-sm text-slate-700">
                <div className="flex justify-between gap-4"><span>Company</span><strong>ABC Trading Ltd</strong></div>
                <div className="flex justify-between gap-4"><span>Invoice #</span><strong>INV-1001</strong></div>
                <div className="flex justify-between gap-4"><span>Total</span><strong>$1,250.00</strong></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Template</span>
                <span className="font-medium text-slate-900">Modern Invoice</span>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-slate-700">Preview updates live as you edit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-shell pb-20">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">How it works</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">A generic document pipeline built for real workflows</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[
            'Upload any supported file',
            'Detect and extract structured information',
            'Review and edit before export',
            'Choose a template and export to PDF or Excel',
          ].map((step, index) => (
            <div key={step} className="glass-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-bold text-blue-700">0{index + 1}</div>
              <p className="text-lg font-semibold text-slate-900">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="documents" className="section-shell pb-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Supported documents</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Built for invoices, receipts, CVs, and more</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {supportedDocs.map((doc) => (
            <div key={doc} className="glass-card flex items-center gap-3 p-5 text-slate-700">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="font-medium">{doc}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section-shell pb-20">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Features</p>
          <h2 className="mt-3 text-3xl font-bold text-slate-900">Made for modern document operations</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="glass-card p-6">
              <div className="mb-5 inline-flex rounded-xl bg-slate-100 p-3 text-slate-900">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section-shell pb-24">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">FAQ</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Designed to scale from MVP to SaaS</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Can I upload PDF and image files?', 'Yes. The workflow supports PDF, JPG, PNG, WEBP, Excel, CSV, DOCX, Markdown, and text inputs.'],
              ['Can I edit AI results before export?', 'Yes. The editor is built for correction, validation, and manual overrides before any output is generated.'],
              ['Does it support multiple document types?', 'Yes. The architecture is built around a normalized schema that can add new types without rebuilding the product.'],
              ['What about exports?', 'The initial MVP targets PDF and Excel exports, with a clean architecture ready for future document and image exports.'],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="font-semibold text-slate-900">{question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
