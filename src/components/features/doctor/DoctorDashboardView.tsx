'use client';

import { useEffect, useMemo, useState } from 'react';
import { doctorService } from '@/services/doctorService';
import { useDoctorAppointments } from '@/hooks/useDoctorAppointments';
import { useDoctorHistory } from '@/hooks/useDoctorHistory';
import { useDoctorUpcoming } from '@/hooks/useDoctorUpcoming';
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
  const { data: upcomingData } = useDoctorUpcoming(doctorId);
  const [totalAppointments, setTotalAppointments] = useState<number | string>('—');
  const [completedAppointments, setCompletedAppointments] = useState<number | string>('—');
  const [totalPatients, setTotalPatients] = useState<number | string>('—');
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

    doctorService
      .getCompletedAppointmentCount(doctorId)
      .then((count) => {
        if (active) setCompletedAppointments(count);
      })
      .catch((err) => {
        console.error('Failed to get completed appointment count:', err);
      });

    doctorService
      .getTotalPatientsCount(doctorId)
      .then((count) => {
        if (active) setTotalPatients(count);
      })
      .catch((err) => {
        console.error('Failed to get total patients count:', err);
      });

    return () => {
      active = false;
    };
  }, [doctorId]);

  // Upcoming dates set
  const upcomingDates = useMemo(() => {
    return new Set(upcomingData.map((a) => a.date));
  }, [upcomingData]);

  // date -> appointments (merged today's + upcoming, sorted by time)
  const byDate = useMemo(() => {
    const map = new Map<string, DoctorAppointment[]>();
    data.forEach((a) => {
      const list = map.get(a.date) ?? [];
      list.push(a);
      map.set(a.date, list);
    });
    upcomingData.forEach((a) => {
      const list = map.get(a.date) ?? [];
      if (!list.some((item) => item.id === a.id)) {
        list.push(a);
      }
      map.set(a.date, list);
    });
    map.forEach((list) => list.sort((x, y) => x.timeSlot.localeCompare(y.timeSlot)));
    return map;
  }, [data, upcomingData]);

  const markedDates = useMemo(() => new Set(data.map((a) => a.date)), [data]);

  const selectedList = byDate.get(selected) ?? [];
  const isToday = selected === today;
  const isUpcoming = upcomingDates.has(selected);

  const stats: DoctorStat[] = [
    { key: 'today', title: "Today's Appointments", value: totalAppointments, subtext: '', tone: 'blue' },
    { key: 'patients', title: 'Total Patients', value: totalPatients, subtext: '', tone: 'green' },
    { key: 'upcoming', title: 'Upcoming', value: upcomingData ? upcomingData.length : 0, subtext: '', tone: 'yellow' },
    { key: 'completed', title: 'Completed Today', value: completedAppointments, subtext: '', tone: 'purple' },
  ];

  const title = isToday
    ? "Today's Appointments"
    : isUpcoming
    ? "Upcoming Appointments"
    : `Appointments · ${formatDateLabel(selected)}`;

  const emptyText = isToday
    ? 'No appointments today.'
    : isUpcoming
    ? 'No upcoming appointments on this date.'
    : 'No appointments on this date.';

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
            emptyText={emptyText}
            isUpcoming={isUpcoming}
          />
          <RecentPatients items={historyData} />
        </div>

        <aside className="space-y-6">
          <MiniCalendar
            selected={selected}
            onSelect={setSelected}
            markedDates={markedDates}
            upcomingDates={upcomingDates}
          />
        </aside>
      </div>
    </div>
  );
}