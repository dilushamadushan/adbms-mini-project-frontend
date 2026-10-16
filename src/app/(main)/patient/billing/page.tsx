import Link from 'next/link';
import { ReceiptText } from 'lucide-react';

export default function PatientBilling() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wide text-[#5B6472]">Account</p>
        <h2 className="mt-1 text-2xl font-bold text-[#0E4749]">Billing history</h2>
      </header>
      <section className="rounded-xl border border-dashed border-[#DCE3E0] bg-white px-6 py-12 text-center">
        <ReceiptText className="mx-auto h-8 w-8 text-amber-700" />
        <h3 className="mt-3 font-bold text-gray-900">No billing records available</h3>
        <p className="mt-1 text-sm text-[#5B6472]">Billing information will appear here when it is added to your account.</p>
        <Link href="/patient/dashboard" className="mt-4 inline-block text-sm font-bold text-[#0E4749] hover:underline">Back to dashboard</Link>
      </section>
    </div>
  );
}
