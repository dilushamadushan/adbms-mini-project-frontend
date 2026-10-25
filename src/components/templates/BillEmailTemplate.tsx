import { Activity, Mail } from 'lucide-react';

export function BillEmailTemplate({
  recipientName = 'Alex Morgan',
  recipientEmail = 'alex.morgan@example.com',
}: {
  recipientName?: string;
  recipientEmail?: string;
}) {
  return (
    <article className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[#DCE3E0] bg-white shadow-xl">
      <div className="h-2 bg-[#E07856]" />
      <div className="p-6 sm:p-10">
        <header className="flex items-center gap-3 border-b border-[#E8EDEA] pb-6">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0E4749] text-white">
            <Activity className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xl font-extrabold text-[#0E4749]">MediCore</p>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#5B6472]">Hospital Billing</p>
          </div>
          <Mail className="ml-auto h-5 w-5 text-[#E07856]" />
        </header>

        <div className="space-y-5 py-7">
          <div className="rounded-lg bg-[#F6F8F7] p-4 text-sm">
            <p><span className="font-semibold text-[#5B6472]">To:</span> <span className="text-gray-900">{recipientEmail}</span></p>
            <p className="mt-2"><span className="font-semibold text-[#5B6472]">Subject:</span> <span className="text-gray-900">Your MediCore discharge bill · INV-2026-00482</span></p>
          </div>

          <div className="space-y-4 text-sm leading-6 text-gray-700">
            <p>Dear <strong className="text-gray-900">{recipientName}</strong>,</p>
            <p>Please find the summary of your MediCore discharge bill below. The itemized charges and payment details are included for your reference.</p>
          </div>

          <section className="overflow-hidden rounded-xl border border-[#DCE3E0]">
            <div className="flex items-center justify-between bg-[#F6F8F7] px-4 py-3">
              <span className="text-sm font-bold text-[#0E4749]">Bill summary</span>
              <span className="text-xs font-semibold text-[#5B6472]">INV-2026-00482</span>
            </div>
            <div className="space-y-3 p-4 text-sm">
              <div className="flex justify-between gap-4"><span className="text-[#5B6472]">General ward stay</span><span className="font-medium text-gray-900">LKR 3,000.00</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#5B6472]">Laboratory services</span><span className="font-medium text-gray-900">LKR 1,200.00</span></div>
              <div className="flex justify-between gap-4"><span className="text-[#5B6472]">Diagnostic services</span><span className="font-medium text-gray-900">LKR 2,500.00</span></div>
              <div className="flex justify-between gap-4 border-t border-[#E8EDEA] pt-3 font-bold text-gray-900"><span>Total</span><span>LKR 6,700.00</span></div>
              <div className="flex justify-between gap-4 text-[#5B6472]"><span>Amount paid</span><span>LKR 3,000.00</span></div>
              <div className="flex justify-between gap-4 rounded-lg bg-[#0E4749] px-3 py-2 font-bold text-white"><span>Balance due</span><span>LKR 3,700.00</span></div>
            </div>
          </section>

          <div className="space-y-4 text-sm leading-6 text-gray-700">
            <p>Thank you,<br /><strong className="text-[#0E4749]">MediCore Hospital Billing Team</strong></p>
          </div>
        </div>
      </div>
    </article>
  );
}
