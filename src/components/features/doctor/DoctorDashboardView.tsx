'use client';

import { useEffect, useMemo, useState } from 'react';
import { doctorService } from '@/services/doctorService';
import { useDoctorAppointments } from '@/hooks/useDoctorAppointments';
import { useDoctorHistory } from '@/hooks/useDoctorHistory';
import { formatDateLabel, todayKey } from '@/lib/dateUtils';
import type { DoctorAppointment, DoctorStat } from '@/types/doctor';
import { GreetingBanner } from './GreetingBanner';
import { DoctorStatCard } from './DoctorStatCard';
import { AppointmentsTable } from './AppointmentsTable';
import { RecentPatients } from './RecentPatients';
import { MiniCalendar } from './MiniCalendar';

export function DoctorDashboardView({ doctorId, doctorName }: { doctorId: number; doctorName: string }) {
  const { data, loading, error } = useDoctorAppointments(doctorId);
  const { data: historyData } = useDoctorHistory(doctorId);
  const [totalAppointments, setTotalAppointments] = useState<number | string>('—');
  const today = todayKey();
  const [selected, setSelected] = useState(today);

  useEffect(() => {
    let active = true;
    doctorService
      .getAppointmentCount(doctorId)
      .then((count) => {
        if (active) setTotalAppointments(count);
      })
      .catch((err) => {
        console.error('Failed to get appointment count:', err);
      });
    return () => {
      active = false;
    };
  }, [doctorId]);

  // date -> appointments (sorted by time)
  const byDate = useMemo(() => {
    const map = new Map<string, DoctorAppointment[]>();
    data.forEach((a) => {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    });
    map.forEach((list) => list.sort((x, y) => x.timeSlot.localeCompare(y.timeSlot)));
    return map;
  }, [data]);

  const markedDates = useMemo(() => new Set(byDate.keys()), [byDate]);

  const selectedList = byDate.get(selected) ?? [];
  const todayList = byDate.get(today) ?? [];

  const stats: DoctorStat[] = [
    { key: 'today', title: "Today's Appointments", value: totalAppointments, subtext: '', tone: 'blue' },
    { key: 'patients', title: 'Total Patients', value: '—', subtext: '', tone: 'green' },
    { key: 'upcoming', title: 'Upcoming', value: '—', subtext: '', tone: 'red' },
    { key: 'completed', title: 'Completed', value: '—', subtext: '', tone: 'purple' },
  ];

  const title = selected === today ? "Today's Appointments" : `Appointments · ${formatDateLabel(selected)}`;

  return (
    <div className="space-y-6">
      <GreetingBanner name={doctorName} />

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Loading appointments…</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {stats.map(({ key, ...s }) => (
          <DoctorStatCard key={key} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <AppointmentsTable
            title={title}
            items={selectedList}
            emptyText={selected === today ? 'No appointments today.' : 'No appointments on this date.'}
          />
          <RecentPatients items={historyData} />
        </div>

        <aside className="space-y-6">
          <MiniCalendar selected={selected} onSelect={setSelected} markedDates={markedDates} />
        </aside>
      </div>
    </div>
  );
}