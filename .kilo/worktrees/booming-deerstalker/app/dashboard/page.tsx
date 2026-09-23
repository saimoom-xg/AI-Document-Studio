import Link from 'next/link';
import { ArrowUpRight, FileText, MoreHorizontal, Plus, Sparkles, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total documents', value: '1,284', accent: 'bg-blue-100 text-blue-700' },
  { label: 'Processing', value: '18', accent: 'bg-amber-100 text-amber-700' },
  { label: 'Exports', value: '492', accent: 'bg-emerald-100 text-emerald-700' },
  { label: 'Avg. confidence', value: '94%', accent: 'bg-violet-100 text-violet-700' },
];

const recentDocuments = [
  { name: 'invoice.pdf', type: 'Invoice', status: 'Ready', updated: '2 hours ago', action: 'Open' },
  { name: 'resume-final.docx', type: 'CV', status: 'Reviewing', updated: 'Today', action: 'Edit' },
  { name: 'receipt-aug.pdf', type: 'Receipt', status: 'Exported', updated: 'Yesterday', action: 'Export' },
  { name: 'quote-12.xlsx', type: 'Quotation', status: 'Processing', updated: '3 days ago', action: 'View' },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-8">
        <aside className="hidden w-72 shrink-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">A</div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Studio</p>
              <p className="text-sm font-medium text-slate-700">AI Document Studio</p>
            </div>
          </div>

          <nav className="space-y-2 text-sm font-medium text-slate-600">
            {[['Dashboard', '/dashboard'], ['Documents', '/dashboard'], ['Templates', '/templates'], ['Create Document', '/upload'], ['Settings', '/dashboard']].map(([item, href], index) => (
              <Link key={item} href={href} className={`block rounded-xl px-3 py-2 transition ${index === 0 ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}>
                {item}
              </Link>
            ))}
          </nav>

          <div className="mt-10 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Next action</p>
            <p className="mt-2 text-base font-semibold text-slate-900">Upload a document</p>
            <Link href="/upload" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white"> <Plus className="h-4 w-4" /> New upload </Link>
          </div>
        </aside>

        <div className="flex-1 space-y-6">
          <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Overview</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">Dashboard</h1>
            </div>
            <Link href="/upload" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              + Upload Document
            </Link>
          </header>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map(({ label, value, accent }) => (
              <div key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${accent}`}>
                  {label}
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-3xl font-bold text-slate-900">{value}</p>
                  <TrendingUp className="h-5 w-5 text-slate-400" />
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent documents</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Latest activity</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
                <Sparkles className="h-4 w-4 text-blue-600" />
                12 documents this week
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-3 pr-4 font-medium">Document</th>
                    <th className="pb-3 pr-4 font-medium">Type</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Updated</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map(({ name, type, status, updated, action }) => (
                    <tr key={name} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><FileText className="h-4 w-4" /></div>
                          <div>
                            <p className="font-medium text-slate-900">{name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4">{type}</td>
                      <td className="py-4 pr-4">
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{status}</span>
                      </td>
                      <td className="py-4 pr-4">{updated}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600">{action}</button>
                          <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600"><MoreHorizontal className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Processing queue</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Active jobs</h3>
              <div className="mt-5 space-y-4">
                {[
                  ['invoice-2026-final.pdf', 'Extracting invoice data', '84%'],
                  ['candidate-profile.docx', 'Reviewing CV details', '62%'],
                  ['purchase-order-11.xlsx', 'Normalizing line items', '91%'],
                ].map(([name, detail, percentage]) => (
                  <div key={name} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                      <span>{name}</span>
                      <span>{percentage}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: percentage }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Document mix</p>
              <h3 className="mt-2 text-xl font-bold text-slate-900">Type statistics</h3>
              <div className="mt-5 space-y-4">
                {[
                  ['Invoices', '42%'],
                  ['CVs', '26%'],
                  ['Receipts', '20%'],
                  ['Other', '12%'],
                ].map(([type, share]) => (
                  <div key={type}>
                    <div className="mb-2 flex justify-between text-sm text-slate-700">
                      <span>{type}</span>
                      <span>{share}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-blue-500" style={{ width: share }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
