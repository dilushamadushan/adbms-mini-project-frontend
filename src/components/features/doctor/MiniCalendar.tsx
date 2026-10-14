'use client';

import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toDateKey, todayKey } from '@/lib/dateUtils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Props {
  selected: string;
  onSelect: (dateKey: string) => void;
  markedDates: Set<string>;
}

export function MiniCalendar({ selected, onSelect, markedDates }: Props) {
  const now = new Date();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const today = todayKey();

  const firstDay = new Date(view.year, view.month, 1).getDay();
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) =>
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

  const goToday = () => {
    setView({ year: now.getFullYear(), month: now.getMonth() });
    onSelect(today);
  };

  const title = new Date(view.year, view.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900">
          <Calendar className="h-5 w-5 text-blue-600" /> {title}
        </h3>
        <div className="flex items-center gap-2">
          <button type="button" onClick={goToday} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50">
            Today
          </button>
          <button type="button" onClick={() => shift(-1)} aria-label="Previous month" className="rounded-full bg-slate-100 p-1.5 hover:bg-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => shift(1)} aria-label="Next month" className="rounded-full bg-slate-100 p-1.5 hover:bg-slate-200">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center text-sm">
        {DAYS.map((d) => (
          <span key={d} className="text-xs font-medium text-slate-500">{d}</span>
        ))}

        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const key = toDateKey(new Date(view.year, view.month, d));
          const isSelected = key === selected;
          const isToday = key === today;
          const hasApt = markedDates.has(key);

          return (
            <div key={i} className="flex justify-center">
              <button
                type="button"
                onClick={() => onSelect(key)}
                className={`relative flex h-9 w-9 items-center justify-center rounded-full transition
                  ${isSelected ? 'bg-blue-600 font-semibold text-white' : 'text-slate-700 hover:bg-slate-100'}
                  ${isToday && !isSelected ? 'ring-2 ring-blue-300' : ''}`}
              >
                {d}
                {hasApt && (
                  <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Has appointments</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full ring-2 ring-blue-300" /> Today</span>
      </div>
    </section>
  );
}