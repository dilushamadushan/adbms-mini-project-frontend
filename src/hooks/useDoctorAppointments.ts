'use client';

import { useEffect, useState } from 'react';
import { doctorService } from '@/services/doctorService';
import type { DoctorAppointment } from '@/types/doctor';

export function useDoctorAppointments(doctorId: number) {
  const [data, setData] = useState<DoctorAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    doctorService
      .getAppointments(doctorId)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e instanceof Error ? e.message : 'Failed to load appointments'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [doctorId]);

  return { data, loading, error };
}