import Link from 'next/link';
import { ArrowUpRight, ReceiptText } from 'lucide-react';

export default function TemplatesPage() {
  return (
    <main className="min-h-screen bg-[#F3F5F4] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">MediCore HMS</p>
          <h1 className="mt-1 text-3xl font-bold text-[#0E4749]">Templates</h1>
          <p className="mt-2 text-sm text-[#5B6472]">Preview document templates used by the hospital.</p>
        </header>

        <Link
          href="/templates/bill"
          className="group flex max-w-2xl items-center gap-5 rounded-2xl border border-[#DCE3E0] bg-white p-6 shadow-sm transition hover:border-[#0E4749] hover:shadow-md"
        >
          <span className="rounded-xl bg-teal-50 p-4 text-[#0E4749]">
            <ReceiptText className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-lg font-bold text-[#0E4749]">Discharge bill</span>
            <span className="mt-1 block text-sm text-[#5B6472]">Patient and admission details, itemized charges, payment summary, and receipt area.</span>
            <span className="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-[#E07856]">Sample preview only</span>
          </span>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-[#5B6472] transition group-hover:text-[#0E4749]" />
        </Link>
      </div>
    </main>
  );
}
