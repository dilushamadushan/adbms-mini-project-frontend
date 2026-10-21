"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, Mail, Printer } from 'lucide-react';
import Link from 'next/link';
import { BillTemplate } from '@/components/templates/BillTemplate';
import { receptionistService, type RecepPatientRecord } from '@/services/receptionistService';
import { BillEmailTemplate } from '@/components/templates/BillEmailTemplate';

export default function BillTemplatePreview() {
  const [patients, setPatients] = useState<RecepPatientRecord[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientName, setPatientName] = useState('Alex Morgan');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [patientLoadError, setPatientLoadError] = useState('');
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);

  useEffect(() => {
    const patientParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('patient_id') || '' : '';

    receptionistService.getPatients()
      .then((rows) => {
        setPatients(rows);
        if (patientParam) {
          // If the page was opened with a patient_id query param, select that patient from the loaded rows
          const p = rows.find((record) => String(record.patient_id) === patientParam);
          if (p) {
            setSelectedPatientId(patientParam);
            setPatientName(`${p.first_name} ${p.last_name}`);
            setRecipientEmail(p.email || '');
          }
        }
      })
      .catch(() => setPatientLoadError('Patient emails could not be loaded. Enter the recipient email manually.'));
  }, []);

  function openEmailApp() {
    const subject = 'MediCore discharge bill INV-2026-00482';
    const body = [
      `Dear ${patientName},`,
      '',
      'Please find the summary of your MediCore discharge bill below.',
      '',
      'Bill number: INV-2026-00482',
      'General ward stay: LKR 3,000.00',
      'Laboratory services - Complete blood count: LKR 1,200.00',
      'Diagnostic services - Chest X-ray: LKR 2,500.00',
      'Total: LKR 6,700.00',
      'Amount paid: LKR 3,000.00',
      'Balance due: LKR 3,700.00',
      '',
      'Thank you,',
      'MediCore Hospital Billing Team',
    ].join('\n');
    window.location.href = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  const selectedPatient = patients.find((patient) => String(patient.patient_id) === selectedPatientId);

  return (
    <main className="min-h-screen bg-[#F3F5F4] px-4 py-8 sm:px-8">
      <div className="bill-template-toolbar mx-auto mb-6 flex max-w-4xl flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/receptionist/admissions" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0E4749] hover:underline">
            <ArrowLeft className="h-4 w-4" /> Discharge and Billing
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-[#0E4749]">Discharge bill template</h1>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-2">
              <label htmlFor="bill-recipient-email" className="block text-xs font-semibold text-[#5B6472]">
                Recipient email
                <input
                  id="bill-recipient-email"
                  required
                  type="email"
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="patient@example.com"
                  className="mt-1 block w-full min-w-56 rounded-lg border border-[#DCE3E0] bg-white px-3 py-2.5 text-sm font-normal text-gray-900 focus:border-[#0E4749] focus:outline-none focus:ring-2 focus:ring-teal-900/10"
                />
              </label>
              {patientLoadError && <p role="status" className="max-w-64 text-xs text-amber-800">{patientLoadError}</p>}
            </div>
            <button
              type="button"
              onClick={() => setShowEmailTemplate(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E07856] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c96749]"
            >
              <Mail className="h-4 w-4" /> Email bill
            </button>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0E4749] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#093234]"
          >
            <Printer className="h-4 w-4" /> Print preview
          </button>
        </div>
      </div>
      <div className={`mx-auto grid max-w-7xl items-start gap-6 ${showEmailTemplate ? 'lg:grid-cols-2' : ''}`}>
        <BillTemplate
          patientName={patientName}
          patientId={selectedPatient?.patient_id}
          patientContact={selectedPatient?.emergency_contact || (selectedPatient ? 'Not on record' : undefined)}
        />
        {showEmailTemplate && (
          <div className="space-y-4">
            <BillEmailTemplate recipientName={patientName} recipientEmail={recipientEmail} />
            <button
              type="button"
              onClick={openEmailApp}
              disabled={!recipientEmail}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E07856] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c96749] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Mail className="h-4 w-4" /> Open email app
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
