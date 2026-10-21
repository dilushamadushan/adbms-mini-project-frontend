import { Activity, Plus } from 'lucide-react';

const sampleItems = [
  { description: 'General ward stay', details: '3 nights × LKR 1,000.00', quantity: '3 days', amount: 3000 },
  { description: 'Laboratory services', details: 'Complete blood count', quantity: '1', amount: 1200 },
  { description: 'Diagnostic services', details: 'Chest X-ray', quantity: '1', amount: 2500 },
];

function formatLkr(amount: number): string {
  return `LKR ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function BillTemplate({
  patientName = 'Alex Morgan',
  patientId,
  patientContact = '+94 77 123 4567',
}: {
  patientName?: string;
  patientId?: number;
  patientContact?: string;
}) {
  const subtotal = sampleItems.reduce((total, item) => total + item.amount, 0);
  const amountPaid = 3000;
  const balance = subtotal - amountPaid;

  return (
    <article className="bill-template mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-[#DCE3E0] bg-white shadow-xl">
      <div className="h-2 bg-[#E07856]" />
      <div className="space-y-8 p-6 sm:p-10 lg:p-12">
        <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#DCE3E0] pb-8">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0E4749] text-white">
              <Activity className="h-7 w-7" />
            </span>
            <div>
              <p className="text-2xl font-extrabold tracking-tight text-[#0E4749]">MediCore</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5B6472]">Hospital Management System</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#E07856]">Discharge bill</p>
            <p className="mt-2 text-2xl font-extrabold text-[#0E4749]">INV-2026-00482</p>
            <p className="mt-1 text-sm text-[#5B6472]">Issued 18 October 2026</p>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5B6472]">Billed to</p>
            <h2 className="mt-2 text-lg font-bold text-gray-900">{patientName}</h2>
            <p className="mt-1 text-sm text-[#5B6472]">Patient ID: {patientId ?? 'PT-001284'}</p>
            <p className="mt-1 text-sm text-[#5B6472]">Contact: {patientContact}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs font-bold uppercase tracking-widest text-[#5B6472]">Admission details</p>
            <p className="mt-2 text-sm text-gray-900"><strong>Ward:</strong> General Medicine Ward · Bed 08</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Admitting doctor:</strong> Dr. Sample Provider</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Stay:</strong> 15 Oct 2026 – 18 Oct 2026 (3 days)</p>
          </div>
        </section>

        <section aria-label="Bill items">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0E4749]">Itemized charges</h3>
            <span className="text-xs text-[#5B6472]">Currency: LKR</span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-[#DCE3E0]">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-[#F6F8F7] text-xs uppercase tracking-wide text-[#5B6472]">
                <tr>
                  <th className="px-4 py-3 font-bold">Description</th>
                  <th className="px-4 py-3 font-bold">Quantity</th>
                  <th className="px-4 py-3 text-right font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDEA]">
                {sampleItems.map((item) => (
                  <tr key={item.description}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{item.description}</p>
                      <p className="mt-1 text-xs text-[#5B6472]">{item.details}</p>
                    </td>
                    <td className="px-4 py-4 text-[#5B6472]">{item.quantity}</td>
                    <td className="px-4 py-4 text-right font-medium text-gray-900">{formatLkr(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="ml-auto w-full max-w-sm space-y-3">
          <div className="flex justify-between gap-4 text-sm text-[#5B6472]">
            <span>Subtotal</span><span>{formatLkr(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm text-[#5B6472]">
            <span>Adjustments</span><span>{formatLkr(0)}</span>
          </div>
          <div className="flex justify-between gap-4 border-t border-[#DCE3E0] pt-3 text-base font-bold text-gray-900">
            <span>Total</span><span>{formatLkr(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4 text-sm text-[#5B6472]">
            <span>Amount paid</span><span>− {formatLkr(amountPaid)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[#0E4749] px-4 py-3 text-white">
            <span className="text-sm font-semibold">Balance due</span>
            <span className="text-lg font-extrabold">{formatLkr(balance)}</span>
          </div>
        </section>

        <section className="border-t border-dashed border-[#DCE3E0] pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#5B6472]">Payment details</p>
            <p className="mt-2 text-sm text-gray-900"><strong>Status:</strong> Partially paid</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Method:</strong> Cash</p>
            <p className="mt-1 text-sm text-gray-900"><strong>Receipt:</strong> RCPT-2026-00217</p>
          </div>
        </section>

        <footer className="rounded-xl bg-[#F6F8F7] p-4 text-center">
          <p className="text-sm font-semibold text-[#0E4749]">Thank you for choosing MediCore</p>
          <p className="mt-1 text-xs text-[#5B6472]">Please keep this bill for your records. Contact the billing desk if you have questions.</p>
        </footer>

        <div className="flex items-center justify-center gap-2 border-t border-[#E8EDEA] pt-5 text-xs font-semibold uppercase tracking-widest text-[#9CA3AF]">
          <Plus className="h-3.5 w-3.5" /> Sample template preview · Not a live bill
        </div>
      </div>
    </article>
  );
}
