'use client';

import React, { useState } from 'react';
import { FileText, Calendar, Clock, Plus, Info, Check, Trash2 } from 'lucide-react';

interface DischargeData {
  dischargeDate: string;
  dischargeTime: string;
  finalDiagnosis: string;
  conditionAtDischarge: string;
  dischargeSummary: string;
  followUpInstructions: string;
  medications: string[];
}

interface DischargePatientFormProps {
  onConfirmDischarge: (data: DischargeData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function DischargePatientForm({
  onConfirmDischarge,
  onCancel,
  isSubmitting = false,
}: DischargePatientFormProps) {
  const [dischargeDate, setDischargeDate] = useState('26 Oct 2026');
  const [dischargeTime, setDischargeTime] = useState('02:00 PM');
  const [finalDiagnosis, setFinalDiagnosis] = useState('');
  const [conditionAtDischarge, setConditionAtDischarge] = useState('Stable');
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [followUpInstructions, setFollowUpInstructions] = useState('');
  const [dischargeMeds, setDischargeMeds] = useState<string[]>([]);
  const [newMedInput, setNewMedInput] = useState('');
  const [showAddMed, setShowAddMed] = useState(false);

  const handleAddMed = () => {
    if (newMedInput.trim()) {
      setDischargeMeds([...dischargeMeds, newMedInput.trim()]);
      setNewMedInput('');
      setShowAddMed(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmDischarge({
      dischargeDate,
      dischargeTime,
      finalDiagnosis: finalDiagnosis || 'Acute gastroenteritis - resolved',
      conditionAtDischarge,
      dischargeSummary,
      followUpInstructions,
      medications: dischargeMeds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
        <FileText className="h-4 w-4 text-blue-600" />
        <span>Discharge Patient</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Discharge Date &amp; Time</label>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                <input
                  type="text"
                  value={dischargeDate}
                  onChange={(e) => setDischargeDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 bg-white focus:outline-none focus:border-[#0E4749]"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-500" />
                <input
                  type="text"
                  value={dischargeTime}
                  onChange={(e) => setDischargeTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 bg-white focus:outline-none focus:border-[#0E4749]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Condition at Discharge</label>
            <select
              value={conditionAtDischarge}
              onChange={(e) => setConditionAtDischarge(e.target.value)}
              className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 bg-white focus:outline-none focus:border-[#0E4749]"
            >
              <option value="Stable">Stable</option>
              <option value="Recovered">Recovered</option>
              <option value="Improved">Improved</option>
              <option value="DAMA / Disagree with Admission">DAMA / Disagree with Admission</option>
              <option value="Guarded">Guarded</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Discharge Medications</label>
            <button
              type="button"
              onClick={() => setShowAddMed((p) => !p)}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Medication
            </button>
            {showAddMed && (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newMedInput}
                  onChange={(e) => setNewMedInput(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="flex-1 rounded-lg border border-slate-200 px-2 py-1 focus:outline-none focus:border-[#0E4749]"
                />
                <button type="button" onClick={handleAddMed} className="rounded-lg bg-[#0E4749] px-3 py-1 font-bold text-white">Add</button>
              </div>
            )}
            <div className="pt-1.5 text-slate-400">
              {dischargeMeds.length === 0 ? 'No medications added yet' : (
                <ul className="divide-y divide-slate-100 border rounded-lg p-1.5 bg-slate-50/50">
                  {dischargeMeds.map((m, i) => (
                    <li key={i} className="flex justify-between py-1 text-slate-700">
                      <span>{m}</span>
                      <button type="button" onClick={() => setDischargeMeds(dischargeMeds.filter((_, idx) => idx !== i))} className="text-red-500">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Final Diagnosis</label>
            <input
              type="text"
              value={finalDiagnosis}
              onChange={(e) => setFinalDiagnosis(e.target.value)}
              placeholder="Enter final diagnosis"
              className="w-full rounded-lg border border-slate-200 py-1.5 px-2.5 bg-white focus:outline-none focus:border-[#0E4749]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Discharge Summary</label>
            <textarea
              rows={2}
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              placeholder="Enter treatment and discharge summary..."
              className="w-full rounded-lg border border-slate-200 p-2 bg-white focus:outline-none focus:border-[#0E4749]"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Follow-up Instructions</label>
            <textarea
              rows={2}
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Enter follow-up instructions..."
              className="w-full rounded-lg border border-slate-200 p-2 bg-white focus:outline-none focus:border-[#0E4749]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-sky-50 border border-sky-100 p-3 text-slate-700">
        <Info className="h-4 w-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-sky-900">Discharge Summary</span>
          <p className="text-slate-600 text-[11px] leading-relaxed mt-0.5">
            After confirming the discharge, the patient&apos;s status will be updated to Discharged and the admission record will be preserved for future visits and medical history.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#0E4749] px-4 py-1.5 font-bold text-white hover:bg-teal-900 shadow-sm disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" /> {isSubmitting ? 'Confirming…' : 'Confirm Discharge'}
        </button>
      </div>
    </form>
  );
}
