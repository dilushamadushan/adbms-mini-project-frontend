import { CalendarDays, Clock3, FileText, ReceiptText, Stethoscope, User } from 'lucide-react';
import type { PatientStat, PatientStatTone } from '@/types/patient';

const TONES: Record<PatientStatTone, { card: string; icon: string; Icon: typeof User }> = {
  blue:   { card: 'bg-blue-50/70 border-blue-100',     icon: 'bg-blue-100 text-blue-600',       Icon: CalendarDays },
  green:  { card: 'bg-emerald-50/70 border-emerald-100', icon: 'bg-emerald-100 text-emerald-700', Icon: Stethoscope },
  red:    { card: 'bg-red-50/70 border-red-100',       icon: 'bg-red-100 text-red-500',         Icon: Clock3 },
  purple: { card: 'bg-purple-50/70 border-purple-100', icon: 'bg-purple-100 text-purple-600',   Icon: FileText },
  yellow: { card: 'bg-amber-50/80 border-amber-200',   icon: 'bg-amber-100 text-amber-700',     Icon: ReceiptText },
  amber:  { card: 'bg-amber-50/80 border-amber-200',   icon: 'bg-amber-100 text-amber-700',     Icon: ReceiptText },
};

export function PatientStatCard({ title, value, subtext, tone }: Omit<PatientStat, 'key'>) {
  const { card, icon, Icon } = TONES[tone] || TONES.blue;

  return (
    <div className={`flex h-full flex-col justify-between gap-3 rounded-xl border p-4 ${card}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${icon}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate whitespace-nowrap text-[13px] font-semibold text-slate-700">
            {title}
          </p>
          <p className="text-3xl font-bold leading-tight text-slate-900">{value}</p>
        </div>
      </div>

      {subtext ? <p className="whitespace-nowrap text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}
