'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { generatePrescriptionNotes } from '@/lib/patientActionMock';
import type { Medication } from '@/types/patientAction';

interface PrescriptionNoteProps {
  medications: Medication[];
}

export function PrescriptionNote({ medications }: PrescriptionNoteProps) {
  const notes = generatePrescriptionNotes(medications);

  if (notes.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg bg-sky-50/50 border border-sky-100/80 p-3 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700">
        <Info className="h-3.5 w-3.5 text-sky-600" />
        <span>Prescription Note (Auto-generated)</span>
      </div>

      <div className="space-y-1 pl-5 text-xs text-slate-700">
        {notes.map((line, idx) => (
          <p key={idx} className="leading-relaxed">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
