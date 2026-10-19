import { User, Calendar } from 'lucide-react';

export function PatientGreetingBanner({ name }: { name: string }) {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const date = now.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between rounded-xl border border-teal-100 bg-teal-50/60 p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0E4749] text-white">
          <User className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">{greeting}, {name}!</h2>
          <p className="text-xs text-[#5B6472]">Your health information and care plan, all in one place.</p>
        </div>
      </div>
      <div className="hidden items-center gap-2 text-sm text-slate-600 sm:flex">
        <Calendar className="h-4 w-4" /> {date}
      </div>
    </div>
  );
}
