'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PatientActionView } from '@/components/features/doctor/patient-action';

export default function PatientActionDetailsPage() {
  const params = useParams();
  const appointmentId = typeof params?.appointmentId === 'string'
    ? params.appointmentId
    : Array.isArray(params?.appointmentId)
    ? params.appointmentId[0]
    : 'apt-10284';

  return <PatientActionView appointmentId={appointmentId} />;
}
