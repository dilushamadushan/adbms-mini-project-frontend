"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  FileText, Plus, Search, RefreshCw, CheckCircle2, 
  X, Filter, Calendar, User, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { nurseService } from '@/services/nurseService';

export default function NurseNotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [noteType, setNoteType] = useState('SOAP');
  const [subj, setSubj] = useState('');
  const [obj, setObj] = useState('');
  const [assess, setAssess] = useState('');
  const [plan, setPlan] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchNotesAndPatients = async () => {
    setLoading(true);
    try {
      const [notesData, patientsData] = await Promise.all([
        nurseService.getWardNursingNotes(),
        nurseService.getWardPatients().catch(() => []),
      ]);
      setNotes(notesData || []);
      setPatients(patientsData || []);
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to load nursing notes.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndPatients();
  }, []);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      setToast({ type: 'error', message: 'Please select a patient for this clinical note.' });
      return;
    }

    const finalContent = noteType === 'SOAP'
      ? `S: ${subj}\nO: ${obj}\nA: ${assess}\nP: ${plan}`
      : content;

    if (!finalContent.trim()) {
      setToast({ type: 'error', message: 'Please provide note details.' });
      return;
    }

    setSubmitting(true);
    try {
      await nurseService.addNursingNote(Number(selectedPatientId), {
        note_type: noteType,
        subjective: subj.trim() || undefined,
        objective: obj.trim() || undefined,
        assessment: assess.trim() || undefined,
        plan: plan.trim() || undefined,
        content: finalContent.trim(),
      });

      setAddModalOpen(false);
      setSelectedPatientId('');
      setSubj('');
      setObj('');
      setAssess('');
      setPlan('');
      setContent('');
      setToast({ type: 'success', message: `${noteType} clinical note saved successfully.` });
      setTimeout(() => setToast(null), 3500);
      await fetchNotesAndPatients();
    } catch (err: any) {
      setToast({ type: 'error', message: err?.response?.data?.detail || 'Failed to save nursing note.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotes = notes.filter((n) => {
    const matchesType = filterType === 'All' ? true : n.note_type === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = 
      !q ||
      (n.patient_name && n.patient_name.toLowerCase().includes(q)) ||
      (n.bed_number && n.bed_number.toLowerCase().includes(q)) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      (n.nurse_name && n.nurse_name.toLowerCase().includes(q));
    return matchesType && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {toast && (
        <div className={`fixed top-20 right-6 z-50 p-4 rounded-xl border-2 shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-red-50 border-red-300 text-red-950'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          )}
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#0E4749]" />
            <h1 className="text-2xl font-bold text-[#0E4749] tracking-tight">Nursing Notes & Clinical Care Plans</h1>
          </div>
          <p className="text-xs text-[#5B6472] mt-1">
            Ward-wide chronological SOAP notes, wound care observations, and multidisciplinary care planning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddModalOpen(true)}
            className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#E07856]" /> Add Clinical Note
          </button>

          <button
            onClick={fetchNotesAndPatients}
            disabled={loading}
            className="bg-white border border-[#DCE3E0] hover:bg-teal-50 text-[#0E4749] px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F8FAF9] border border-[#DCE3E0] rounded-xl self-start">
            {['All', 'SOAP', 'CarePlan', 'WoundCare', 'Diet', 'General'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterType === t
                    ? 'bg-[#0E4749] text-white shadow-2xs'
                    : 'text-[#5B6472] hover:text-[#0E4749] hover:bg-gray-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search note text, patient, nurse..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749]" />
            <span>Loading ward nursing notes...</span>
          </div>
        ) : filteredNotes.length > 0 ? (
          <div className="space-y-4">
            {filteredNotes.map((n) => (
              <div key={n.note_id} className="p-5 rounded-xl border border-[#DCE3E0] bg-white hover:border-teal-300 transition space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-gray-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#0E4749]">{n.patient_name}</span>
                    {n.bed_number && (
                      <Link
                        href={n.bed_id ? `/nurse/bed/${n.bed_id}?tab=notes` : '/nurse/dashboard'}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-[#0E4749] border border-teal-200 hover:bg-teal-200 transition"
                      >
                        Bed {n.bed_number}
                      </Link>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {n.note_type} Note
                    </span>
                  </div>

                  <div className="text-[11px] text-[#5B6472]">
                    Documented by <strong>{n.nurse_name || 'Staff Nurse'}</strong> • {n.created_at}
                  </div>
                </div>

                {n.note_type === 'SOAP' && (n.subjective || n.objective || n.assessment || n.plan) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {n.subjective && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#0E4749] block mb-0.5">S - Subjective:</strong>
                        <span className="text-gray-700">{n.subjective}</span>
                      </div>
                    )}
                    {n.objective && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#0E4749] block mb-0.5">O - Objective:</strong>
                        <span className="text-gray-700">{n.objective}</span>
                      </div>
                    )}
                    {n.assessment && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#0E4749] block mb-0.5">A - Assessment:</strong>
                        <span className="text-gray-700">{n.assessment}</span>
                      </div>
                    )}
                    {n.plan && (
                      <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                        <strong className="text-[#0E4749] block mb-0.5">P - Plan:</strong>
                        <span className="text-gray-700">{n.plan}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs italic">
            No nursing notes match your search or filter.
          </div>
        )}
      </div>

      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-[#DCE3E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">Add Clinical Nursing Note</h3>
              </div>
              <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Select Inpatient</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg"
                    required
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.patient_id} value={p.patient_id}>
                        {p.patient_name} {p.bed_number ? `(Bed ${p.bed_number})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Note Type</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg"
                  >
                    <option value="SOAP">SOAP Note</option>
                    <option value="CarePlan">Care Plan</option>
                    <option value="WoundCare">Wound Care</option>
                    <option value="Diet">Dietary / Nutrition</option>
                    <option value="General">General Clinical Note</option>
                  </select>
                </div>
              </div>

              {noteType === 'SOAP' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">S - Subjective (Patient complaints)</label>
                    <textarea
                      value={subj}
                      onChange={(e) => setSubj(e.target.value)}
                      placeholder="e.g. Patient reports pain is well controlled. Slept comfortably."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">O - Objective (Vitals & observations)</label>
                    <textarea
                      value={obj}
                      onChange={(e) => setObj(e.target.value)}
                      placeholder="e.g. BP 120/80, HR 72 regular, lungs clear."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">A - Assessment (Nursing evaluation)</label>
                    <textarea
                      value={assess}
                      onChange={(e) => setAssess(e.target.value)}
                      placeholder="e.g. Hemodynamically stable."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">P - Plan (Care actions)</label>
                    <textarea
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="e.g. Continue scheduled telemetry monitoring and medication administration."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Clinical Note Content</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter detailed clinical care plan or observation..."
                    rows={6}
                    className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    required
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0E4749] hover:bg-[#0a3335] text-white transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
