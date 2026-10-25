import { CalendarPlus, User, BriefcaseMedical, FileText } from 'lucide-react';
import type { DoctorStat, StatTone } from '@/types/doctor';

const TONES: Record<StatTone, { card: string; icon: string; Icon: typeof User }> = {
  blue:   { card: 'bg-blue-50/70 border-blue-100',     icon: 'bg-blue-100 text-blue-600',     Icon: CalendarPlus },
  green:  { card: 'bg-green-50/70 border-green-100',   icon: 'bg-green-100 text-green-600',   Icon: User },
  red:    { card: 'bg-red-50/70 border-red-100',       icon: 'bg-red-100 text-red-500',       Icon: BriefcaseMedical },
  purple: { card: 'bg-purple-50/70 border-purple-100', icon: 'bg-purple-100 text-purple-600', Icon: FileText },
  yellow: { card: 'bg-amber-50/80 border-amber-200',   icon: 'bg-amber-100 text-amber-700',   Icon: CalendarPlus },
  amber:  { card: 'bg-amber-50/80 border-amber-200',   icon: 'bg-amber-100 text-amber-700',   Icon: CalendarPlus },
};

export function DoctorStatCard({ title, value, subtext, tone }: Omit<DoctorStat, 'key'>) {
  const { card, icon, Icon } = TONES[tone];

  return (
    <div className={`flex h-full flex-col justify-between gap-3 rounded-xl border p-4 ${card}`}>
      {/* Row: round icon + (title on one line, number below it) */}
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

      {/* Subtext below, left-aligned */}
      {subtext ? <p className="whitespace-nowrap text-xs text-slate-500">{subtext}</p> : null}
    </div>
  );
}