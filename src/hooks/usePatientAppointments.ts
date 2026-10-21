'use client';

import { useEffect, useState } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { unwrapAppointments, normalizeAppointment } from '@/lib/patientAppointments';
import type { Appointment } from '@/types';

export function usePatientAppointments(patientId?: string | number) {
  const [data, setData] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setLoading(false);
      return;
    }
    let active = true;

    appointmentService
      .getAll({ patientId: String(patientId) })
      .then(({ data: rawData }) => {
        if (active) {
          setData(unwrapAppointments(rawData).map(normalizeAppointment));
        }
      })
      .catch((e) => {
        if (active) {
          setError(e instanceof Error ? e.message : 'Failed to load appointments');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [patientId]);

  return { data, setData, loading, error };
}
