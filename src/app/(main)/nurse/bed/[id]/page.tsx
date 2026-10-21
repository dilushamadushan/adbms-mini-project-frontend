"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, Thermometer, Heart, Save, ArrowLeft, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, LogOut, ShieldAlert, Pill, 
  ClipboardList, FileText, Droplets, Clock, AlertTriangle, CheckSquare, 
  User, Check, X, ShieldCheck
} from 'lucide-react';
import { 
  nurseService, BedDetailResponse, VitalsLogItem, MarOverviewResponse, 
  DoctorOrderItem, NursingNoteItem, IntakeOutputSummaryResponse 
} from '@/services/nurseService';

type ClinicalTab = 'vitals' | 'mar' | 'orders' | 'notes' | 'io' | 'discharge';

export default function NurseBedDetail() {
  const params = useParams();
  const router = useRouter();
  const bedId = params?.id as string;

  const [activeTab, setActiveTab] = useState<ClinicalTab>('vitals');
  const [bed, setBed] = useState<BedDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [marData, setMarData] = useState<MarOverviewResponse | null>(null);
  const [doctorOrders, setDoctorOrders] = useState<DoctorOrderItem[]>([]);
  const [nursingNotes, setNursingNotes] = useState<NursingNoteItem[]>([]);
  const [ioSummary, setIoSummary] = useState<IntakeOutputSummaryResponse | null>(null);

  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState('72');
  const [temperature, setTemperature] = useState('98.6');
  const [spo2, setSpo2] = useState('98');
  const [respRate, setRespRate] = useState('16');
  const [bloodSugar, setBloodSugar] = useState('105');
  const [weight, setWeight] = useState('70');
  const [submittingVitals, setSubmittingVitals] = useState(false);
  const [vitalsFeedback, setVitalsFeedback] = useState<{ message: string; isError?: boolean } | null>(null);

  const [selectedRx, setSelectedRx] = useState<any | null>(null);
  const [marStatus, setMarStatus] = useState<'Given' | 'Not Given' | 'Refused' | 'Held'>('Given');
  const [marReason, setMarReason] = useState('');
  const [marNotes, setMarNotes] = useState('');
  const [fiveRightsChecked, setFiveRightsChecked] = useState(false);
  const [submittingMar, setSubmittingMar] = useState(false);

  const [noteType, setNoteType] = useState('SOAP');
  const [subj, setSubj] = useState('');
  const [obj, setObj] = useState('');
  const [assess, setAssess] = useState('');
  const [plan, setPlan] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [ioType, setIoType] = useState<'Intake' | 'Output'>('Intake');
  const [ioCategory, setIoCategory] = useState('Oral');
  const [ioVolume, setIoVolume] = useState('250');
  const [ioNotes, setIoNotes] = useState('');
  const [submittingIo, setSubmittingIo] = useState(false);

  const [ivRemoved, setIvRemoved] = useState(false);
  const [medsCounseled, setMedsCounseled] = useState(false);
  const [summaryHanded, setSummaryHanded] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBedDetails = async () => {
    if (!bedId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await nurseService.getBedDetails(bedId);
      setBed(data);

      if (data.patient_id) {
        const [marRes, ordersRes, notesRes, ioRes] = await Promise.all([
          nurseService.getPatientMar(data.patient_id).catch(() => null),
          nurseService.getDoctorOrders(data.patient_id).catch(() => []),
          nurseService.getNursingNotes(data.patient_id).catch(() => []),
          nurseService.getPatientIo(data.patient_id).catch(() => null),
        ]);
        setMarData(marRes);
        setDoctorOrders(ordersRes);
        setNursingNotes(notesRes);
        setIoSummary(ioRes);
      }
    } catch (err: any) {
      console.error('Failed to load bed details:', err);
      setError(err?.response?.data?.detail || 'Bed details not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBedDetails();
  }, [bedId]);

  const handleLogVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed || !bed.patient_id) return;

    setSubmittingVitals(true);
    setVitalsFeedback(null);
    try {
      const res = await nurseService.recordVitals(bed.bed_id, {
        bp: bp.trim(),
        pulse: parseInt(pulse, 10),
        temperature: parseFloat(temperature),
        spo2: spo2 ? parseInt(spo2, 10) : undefined,
        resp_rate: respRate ? parseInt(respRate, 10) : undefined,
        blood_sugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
      });

      setVitalsFeedback({
        message: `Vitals logged. Patient status evaluated as: ${res.current_status || 'STABLE'}.`,
        isError: res.current_status === 'CRITICAL',
      });

      const newLog: VitalsLogItem = {
        vital_id: res.vital_id,
        patient_id: res.patient_id,
        bp: res.bp,
        pulse: res.pulse,
        temperature: res.temperature,
        spo2: res.spo2,
        resp_rate: res.resp_rate,
        blood_sugar: res.blood_sugar,
        weight: res.weight,
        recorded_at: res.recorded_at,
        recorded_by_name: res.recorded_by_name || 'Nurse Sarah',
      };
      setBed((prev) => prev ? { ...prev, recent_vitals: [newLog, ...(prev.recent_vitals || [])] } : null);
    } catch (err: any) {
      setVitalsFeedback({
        message: err?.response?.data?.detail || 'Failed to save vitals.',
        isError: true,
      });
    } finally {
      setSubmittingVitals(false);
    }
  };

  const handleAdministerMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed?.patient_id || !selectedRx) return;
    if (!fiveRightsChecked && marStatus === 'Given') {
      alert('Please verify and confirm the 5 Rights of Medication Administration.');
      return;
    }

    setSubmittingMar(true);
    try {
      await nurseService.administerMedication(bed.patient_id, {
        rx_id: selectedRx.rx_id,
        status: marStatus,
        reason: marReason,
        notes: marNotes,
      });
      alert(`Medication marked as ${marStatus}.`);
      setSelectedRx(null);
      setMarReason('');
      setMarNotes('');
      setFiveRightsChecked(false);
      const updatedMar = await nurseService.getPatientMar(bed.patient_id);
      setMarData(updatedMar);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to record administration.');
    } finally {
      setSubmittingMar(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, newStatus: 'Acknowledged' | 'Done') => {
    try {
      await nurseService.updateDoctorOrderStatus(orderId, newStatus);
      if (bed?.patient_id) {
        const updated = await nurseService.getDoctorOrders(bed.patient_id);
        setDoctorOrders(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update order status.');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed?.patient_id || !noteContent.trim()) return;

    setSubmittingNote(true);
    try {
      await nurseService.addNursingNote(bed.patient_id, {
        note_type: noteType,
        subjective: subj,
        objective: obj,
        assessment: assess,
        plan: plan,
        content: noteContent,
      });
      setNoteContent('');
      setSubj('');
      setObj('');
      setAssess('');
      setPlan('');
      alert('Nursing note documented.');
      const updatedNotes = await nurseService.getNursingNotes(bed.patient_id);
      setNursingNotes(updatedNotes);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to document note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleLogIo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed?.patient_id) return;

    setSubmittingIo(true);
    try {
      await nurseService.logIntakeOutput(bed.patient_id, {
        io_type: ioType,
        category: ioCategory,
        volume_ml: parseInt(ioVolume, 10),
        notes: ioNotes,
      });
      setIoNotes('');
      const updatedIo = await nurseService.getPatientIo(bed.patient_id);
      setIoSummary(updatedIo);
      alert(`${ioType} of ${ioVolume}ml recorded.`);
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to record I/O.');
    } finally {
      setSubmittingIo(false);
    }
  };

  const handleCompleteDischarge = async () => {
    if (!bed?.admission_id) return;
    if (!ivRemoved || !medsCounseled || !summaryHanded) {
      alert('Please complete all 3 items on the nursing discharge checklist first.');
      return;
    }

    setActionLoading(true);
    try {
      await nurseService.completeDischarge(bed.admission_id);
      await fetchBedDetails();
      alert('Discharge completed. Bed is now in Cleaning status.');
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to finalize discharge.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCleaned = async () => {
    if (!bed) return;
    setActionLoading(true);
    try {
      await nurseService.updateBedStatus(bed.bed_id, 'Available');
      await fetchBedDetails();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'Failed to update bed status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !bed) {
    return (
      <div className="p-12 text-center text-[#5B6472]">
        <RefreshCw className="w-6 h-6 animate-spin text-[#0E4749] mx-auto mb-2" />
        <p className="font-semibold text-sm">Opening Inpatient Station...</p>
      </div>
    );
  }

  if (error || !bed) {
    return (
      <div className="space-y-4 max-w-2xl">
        <Link href="/nurse/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E4749] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Ward
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <div className="font-bold">Bed Not Found</div>
            <div className="text-sm">{error || 'No bed record matches this identifier.'}</div>
          </div>
        </div>
      </div>
    );
  }

  const isOccupied = bed.bed_status === 'Occupied';
  const isCleaning = bed.bed_status === 'Cleaning';
  const hasAuthorizedDischarge = bed.discharge_status === 'Authorized';

  const currentSpo2 = parseInt(spo2 || '98', 10);
  const currentPulse = parseInt(pulse || '72', 10);
  const isVitalsWarning = currentSpo2 < 92 || currentPulse > 115 || currentPulse < 50;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link
          href="/nurse/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E4749] hover:underline bg-white border border-[#DCE3E0] px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Ward Dashboard
        </Link>
        <button
          onClick={fetchBedDetails}
          disabled={loading}
          className="text-xs text-[#5B6472] hover:text-[#0E4749] flex items-center gap-1 font-semibold"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Station
        </button>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-[#0E4749]">Bed {bed.bed_number}</h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isOccupied
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : isCleaning
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
              }`}
            >
              {bed.bed_status}
            </span>
          </div>

          <div className="text-xs text-[#5B6472] font-medium">{bed.ward_name}</div>

          {isOccupied && bed.patient_name ? (
            <div className="mt-2 space-y-0.5">
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Patient: {bed.patient_name}</span>
                {bed.age && <span className="text-xs text-gray-500 font-normal">({bed.age} yrs • Blood: {bed.blood_group || 'N/A'})</span>}
                {bed.emergency_contact && (
                  <span className="text-xs text-[#5B6472]">Emergency: {bed.emergency_contact}</span>
                )}
              </div>
              <div className="text-xs text-[#5B6472]">
                Admitted: {bed.admitted_at ? new Date(bed.admitted_at).toLocaleDateString() : 'Active'} • Attending: {bed.attending_doctor || 'Staff Physician'}
                {bed.admission_reason && <span className="ml-1 text-slate-700 font-medium">({bed.admission_reason})</span>}
              </div>
              {bed.allergies && bed.allergies !== 'None' && (
                <div className="text-xs text-red-600 font-bold flex items-center gap-1 mt-1 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg w-fit">
                  <ShieldAlert className="w-3.5 h-3.5" /> Allergy Warning: {bed.allergies}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 italic mt-1">Bed is currently available for incoming admissions.</div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isCleaning && (
            <button
              onClick={handleMarkCleaned}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Mark as Available
            </button>
          )}

          {hasAuthorizedDischarge && (
            <button
              onClick={() => setActiveTab('discharge')}
              className="bg-[#E07856] hover:bg-[#d06846] text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm animate-pulse"
            >
              <LogOut className="w-4 h-4" /> Doctor Authorized Discharge
            </button>
          )}
        </div>
      </div>

      {isOccupied && (
        <div className="flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-xl border border-[#DCE3E0] shadow-sm">
          {[
            { id: 'vitals', label: 'Vitals Charting', icon: Activity },
            { id: 'mar', label: 'MAR (Medications)', icon: Pill, badge: marData?.prescriptions?.length },
            { id: 'orders', label: 'Doctor Orders', icon: ClipboardList, badge: doctorOrders?.filter(o => o.status === 'Pending').length },
            { id: 'notes', label: 'Nursing Notes', icon: FileText, badge: nursingNotes?.length },
            { id: 'io', label: 'Intake / Output', icon: Droplets },
            { id: 'discharge', label: 'Discharge', icon: LogOut, alert: hasAuthorizedDischarge },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ClinicalTab)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-[#0E4749] text-white shadow-sm'
                    : 'text-[#5B6472] hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E07856]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    isActive ? 'bg-[#E07856] text-white' : 'bg-teal-100 text-[#0E4749]'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-1 right-1" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {isOccupied && activeTab === 'vitals' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            <div className="bg-[#0E4749] text-white p-4 font-bold flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm tracking-wide">
                <Activity className="w-5 h-5 text-[#E07856]" /> Comprehensive Vital Signs Charting
              </span>
              <span className="text-xs text-teal-200 font-normal">Normal ranges enforced with automated doctor alerts</span>
            </div>

            <form onSubmit={handleLogVitals} className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500" /> Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={bp}
                    onChange={(e) => setBp(e.target.value)}
                    placeholder="120/80"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Systolic / Diastolic</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" /> Pulse (bpm)
                  </label>
                  <input
                    type="number"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    min="30"
                    max="250"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Normal: 60-100 bpm</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°F)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    min="90"
                    max="110"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                    required
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Normal: 98.6°F</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" /> SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    min="50"
                    max="100"
                    className={`w-full p-2.5 border rounded-lg font-mono text-sm focus:outline-none ${
                      parseInt(spo2, 10) < 92 ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#DCE3E0]'
                    }`}
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Warning if &lt; 92%</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                    Resp. Rate (/min)
                  </label>
                  <input
                    type="number"
                    value={respRate}
                    onChange={(e) => setRespRate(e.target.value)}
                    min="6"
                    max="60"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Normal: 12-20</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                    Blood Sugar (mg/dL)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Fasting / Random</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Current inpatient weight</span>
                </div>
              </div>

              {isVitalsWarning && (
                <div className="bg-red-50 border border-red-300 p-3 rounded-lg text-xs text-red-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Warning: Entered vitals fall outside normal physiological limits. Saving will trigger an automated alert notification to the attending physician.</span>
                </div>
              )}

              {vitalsFeedback && (
                <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  vitalsFeedback.isError ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  {vitalsFeedback.isError ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{vitalsFeedback.message}</span>
                </div>
              )}

              <div className="flex justify-end pt-3 border-t border-[#DCE3E0]">
                <button
                  type="submit"
                  disabled={submittingVitals}
                  className="bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" /> {submittingVitals ? 'Saving Vitals...' : 'Log Vitals (Now)'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-4 flex items-center justify-between">
              <span>24-Hour Vitals History</span>
              <span className="text-xs text-[#5B6472] font-normal">{bed.recent_vitals?.length || 0} recorded entries</span>
            </h4>

            {bed.recent_vitals && bed.recent_vitals.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {bed.recent_vitals.map((log) => (
                  <div key={log.vital_id} className="py-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <div className="font-bold text-gray-800">{log.recorded_at}</div>
                      <div className="text-[11px] text-[#5B6472]">Recorded by: {log.recorded_by_name || 'Nurse'}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded font-bold">BP: {log.bp}</span>
                      <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded font-bold">HR: {log.pulse} bpm</span>
                      <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded font-bold">T: {log.temperature}°F</span>
                      {log.spo2 && (
                        <span className={`px-2 py-0.5 rounded font-bold border ${log.spo2 < 92 ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200'}`}>
                          SpO2: {log.spo2}%
                        </span>
                      )}
                      {log.resp_rate && <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">RR: {log.resp_rate}/m</span>}
                      {log.blood_sugar && <span className="bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">Sugar: {log.blood_sugar}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No vitals logged yet.</p>
            )}
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'mar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#0E4749] text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#E07856]" /> Medication Administration Record (MAR)
                </h3>
                <p className="text-xs text-teal-200 mt-0.5">
                  Verify Doctor Prescriptions, 5 Rights, and Allergy Conflicts prior to administration.
                </p>
              </div>
            </div>

            <div className="p-5">
              <h4 className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-3">Active Doctor Prescriptions</h4>
              {marData?.prescriptions && marData.prescriptions.length > 0 ? (
                <div className="divide-y divide-gray-100 border border-[#DCE3E0] rounded-xl overflow-hidden">
                  {marData.prescriptions.map((rx) => (
                    <div key={rx.rx_id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{rx.med_name}</span>
                          <span className="text-xs bg-teal-50 text-[#0E4749] border border-teal-200 px-2 py-0.5 rounded font-mono">
                            {rx.dosage}
                          </span>
                          {rx.has_allergy_conflict && (
                            <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Allergy Conflict!
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#5B6472] mt-1">
                          Prescribed by: {rx.doctor_name || 'Attending Doctor'} • Duration: {rx.duration || 'Active'}
                          {rx.last_status && (
                            <span className="ml-2 font-medium">Last: <strong className="text-gray-800">{rx.last_status}</strong> at {rx.last_administered_at}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedRx(rx);
                          setMarStatus('Given');
                          setFiveRightsChecked(false);
                        }}
                        className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
                      >
                        Administer Dose
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-gray-400 italic border border-dashed rounded-xl">
                  No active prescriptions documented for this inpatient.
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#DCE3E0] bg-gray-50/50">
              <h4 className="text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-3">MAR Administration Audit Log (Immutable)</h4>
              {marData?.history && marData.history.length > 0 ? (
                <div className="space-y-2">
                  {marData.history.map((hist) => (
                    <div key={hist.mar_id} className="bg-white p-3 rounded-lg border border-[#DCE3E0] flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-gray-800">{hist.med_name} ({hist.dosage})</div>
                        <div className="text-[11px] text-[#5B6472]">
                          Nurse: {hist.administered_by_name || 'Sarah Connor'} • {hist.administered_at}
                          {hist.reason && <span className="ml-2 text-amber-700 italic">Reason: {hist.reason}</span>}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        hist.status === 'Given' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        hist.status === 'Refused' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {hist.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No administration records yet.</p>
              )}
            </div>
          </div>

          {selectedRx && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#DCE3E0] space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-base text-[#0E4749] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#E07856]" /> MAR Administration
                  </h3>
                  <button onClick={() => setSelectedRx(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-teal-50 border border-teal-200 p-3 rounded-xl text-xs space-y-1">
                  <div><strong>Drug:</strong> {selectedRx.med_name}</div>
                  <div><strong>Dosage:</strong> {selectedRx.dosage}</div>
                  <div><strong>Patient:</strong> {bed.patient_name} (Bed {bed.bed_number})</div>
                </div>

                {selectedRx.has_allergy_conflict && (
                  <div className="bg-red-50 border border-red-300 p-3 rounded-xl text-xs text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>Warning: Potential allergy conflict with patient profile ({selectedRx.patient_allergies})!</span>
                  </div>
                )}

                <form onSubmit={handleAdministerMedication} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">Action Status</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(['Given', 'Held', 'Refused', 'Not Given'] as const).map((st) => (
                        <button
                          type="button"
                          key={st}
                          onClick={() => setMarStatus(st)}
                          className={`py-1.5 text-xs font-bold rounded-lg border transition-all ${
                            marStatus === st ? 'bg-[#0E4749] text-white border-[#0E4749]' : 'bg-gray-50 border-gray-200 text-[#5B6472]'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {marStatus !== 'Given' && (
                    <div>
                      <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1">Reason (Mandatory)</label>
                      <input
                        type="text"
                        value={marReason}
                        onChange={(e) => setMarReason(e.target.value)}
                        placeholder="e.g. Patient nauseous / Doctor instructed to hold"
                        className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg focus:outline-none"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1">Clinical Notes</label>
                    <input
                      type="text"
                      value={marNotes}
                      onChange={(e) => setMarNotes(e.target.value)}
                      placeholder="Optional notes..."
                      className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg focus:outline-none"
                    />
                  </div>

                  {marStatus === 'Given' && (
                    <label className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-200 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={fiveRightsChecked}
                        onChange={(e) => setFiveRightsChecked(e.target.checked)}
                        className="mt-0.5"
                      />
                      <span className="text-[#5B6472]">
                        I confirm the <strong>5 Rights of Administration</strong>: Right Patient, Right Drug, Right Dose, Right Route, and Right Time.
                      </span>
                    </label>
                  )}

                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setSelectedRx(null)}
                      className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingMar}
                      className="px-5 py-2 bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
                    >
                      {submittingMar ? 'Recording...' : 'Confirm MAR Log'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {isOccupied && activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
          <div className="p-4 bg-[#0E4749] text-white flex justify-between items-center">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#E07856]" /> Doctor Orders & Care Tasks
            </h3>
            <span className="text-xs text-teal-200 font-normal">Acknowledge orders and update completion status</span>
          </div>

          <div className="p-5">
            {doctorOrders && doctorOrders.length > 0 ? (
              <div className="divide-y divide-gray-100 border border-[#DCE3E0] rounded-xl overflow-hidden">
                {doctorOrders.map((ord) => (
                  <div key={ord.order_id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-gray-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[#0E4749] border border-teal-200 px-2 py-0.5 rounded">
                          {ord.order_type}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          ord.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          ord.status === 'Acknowledged' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-300'
                        }`}>
                          {ord.status}
                        </span>
                      </div>
                      <div className="font-bold text-sm text-gray-900 mt-1">{ord.instruction}</div>
                      <div className="text-xs text-[#5B6472] mt-0.5">
                        Ordered by {ord.doctor_name || 'Attending Doctor'} on {ord.created_at}
                        {ord.acknowledged_by_name && (
                          <span className="ml-2 font-medium">Ack by: {ord.acknowledged_by_name}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ord.status === 'Pending' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.order_id, 'Acknowledged')}
                          className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        >
                          Acknowledge
                        </button>
                      )}
                      {ord.status === 'Acknowledged' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.order_id, 'Done')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic text-center p-8">No doctor orders documented for this patient.</p>
            )}
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#0E4749] text-white flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E07856]" /> Document Nursing Note (SOAP)
              </h3>
            </div>

            <form onSubmit={handleAddNote} className="p-5 space-y-4">
              <div className="flex gap-4">
                <div className="w-48">
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1">Note Type</label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg bg-white focus:outline-none"
                  >
                    <option value="SOAP">SOAP Note</option>
                    <option value="CarePlan">Care Plan</option>
                    <option value="WoundCare">Wound Care</option>
                    <option value="Diet">Diet / Nutrition</option>
                    <option value="General">General Note</option>
                  </select>
                </div>
              </div>

              {noteType === 'SOAP' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6472] uppercase mb-1">S - Subjective (Patient Report)</label>
                    <textarea
                      value={subj}
                      onChange={(e) => setSubj(e.target.value)}
                      placeholder="e.g. Patient reports pain subsided, slept 6 hours..."
                      className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg h-20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6472] uppercase mb-1">O - Objective (Clinical Observations)</label>
                    <textarea
                      value={obj}
                      onChange={(e) => setObj(e.target.value)}
                      placeholder="e.g. Alert, oriented. Vitals stable. IV site intact..."
                      className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg h-20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6472] uppercase mb-1">A - Assessment (Nursing Diagnosis)</label>
                    <textarea
                      value={assess}
                      onChange={(e) => setAssess(e.target.value)}
                      placeholder="e.g. Hemodynamically stable. Recovery on track..."
                      className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg h-20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5B6472] uppercase mb-1">P - Plan (Nursing Interventions)</label>
                    <textarea
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="e.g. Continue telemetry, encourage ambulation..."
                      className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg h-20 focus:outline-none"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1">Summary / Note Content</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter full nursing documentation summary..."
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg h-24 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingNote}
                  className="bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-50 text-white px-5 py-2 rounded-lg text-xs font-bold shadow-sm"
                >
                  {submittingNote ? 'Documenting...' : 'Save Nursing Note'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-3">Nursing Documentation History</h4>
            {nursingNotes && nursingNotes.length > 0 ? (
              <div className="space-y-3">
                {nursingNotes.map((note) => (
                  <div key={note.note_id} className="bg-gray-50/70 p-4 rounded-xl border border-[#DCE3E0] text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[#5B6472]">
                      <span className="font-bold text-[#0E4749] bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                        {note.note_type} Note
                      </span>
                      <span>Documented by: <strong>{note.nurse_name}</strong> on {note.created_at}</span>
                    </div>
                    <div className="text-gray-900 font-medium whitespace-pre-wrap">{note.content}</div>
                    {note.subjective && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-[#5B6472] pt-2 border-t border-gray-200">
                        <div><strong>S:</strong> {note.subjective}</div>
                        <div><strong>O:</strong> {note.objective}</div>
                        <div><strong>A:</strong> {note.assessment}</div>
                        <div><strong>P:</strong> {note.plan}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No previous nursing notes documented.</p>
            )}
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'io' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <div className="text-xs font-bold text-teal-700 uppercase">Total Intake (Today)</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{ioSummary?.total_intake_ml ?? 0} ml</div>
              <div className="text-[11px] text-gray-500">Oral &amp; IV fluids</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <div className="text-xs font-bold text-rose-700 uppercase">Total Output (Today)</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{ioSummary?.total_output_ml ?? 0} ml</div>
              <div className="text-[11px] text-gray-500">Urine &amp; drainage</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <div className="text-xs font-bold text-[#0E4749] uppercase">Net Fluid Balance</div>
              <div className={`text-2xl font-bold mt-1 ${
                (ioSummary?.net_balance_ml ?? 0) >= 0 ? 'text-blue-700' : 'text-amber-700'
              }`}>
                {(ioSummary?.net_balance_ml ?? 0) > 0 ? `+${ioSummary?.net_balance_ml}` : ioSummary?.net_balance_ml} ml
              </div>
              <div className="text-[11px] text-gray-500">Auto-calculated balance</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-sm text-[#0E4749] mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-[#E07856]" /> Log Fluid Intake / Output Entry
            </h4>
            <form onSubmit={handleLogIo} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Type</label>
                <select
                  value={ioType}
                  onChange={(e) => setIoType(e.target.value as any)}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg bg-white"
                >
                  <option value="Intake">Intake (+)</option>
                  <option value="Output">Output (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Category</label>
                <select
                  value={ioCategory}
                  onChange={(e) => setIoCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg bg-white"
                >
                  {ioType === 'Intake' ? (
                    <>
                      <option value="Oral">Oral (Water / Soup)</option>
                      <option value="IV Fluids">IV Normal Saline</option>
                      <option value="IV Antibiotic">IV Infusion</option>
                      <option value="NG Tube">NG Tube Feeding</option>
                    </>
                  ) : (
                    <>
                      <option value="Urine">Urine</option>
                      <option value="Drain">Surgical Drain</option>
                      <option value="Emesis">Vomiting / Emesis</option>
                      <option value="Stool">Stool / Liquid</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Volume (ml)</label>
                <input
                  type="number"
                  value={ioVolume}
                  onChange={(e) => setIoVolume(e.target.value)}
                  min="1"
                  max="5000"
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg"
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submittingIo}
                  className="w-full bg-[#0E4749] hover:bg-[#0a3335] text-white p-2.5 rounded-lg text-xs font-bold shadow-sm"
                >
                  {submittingIo ? 'Logging...' : 'Record I/O'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-3">Today's Chronological Fluid Chart</h4>
            {ioSummary?.entries && ioSummary.entries.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {ioSummary.entries.map((item) => (
                  <div key={item.io_id} className="py-2 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-gray-800">{item.entry_time}</span>
                      <span className="text-[#5B6472] ml-2">{item.category}</span>
                      {item.notes && <span className="text-gray-400 ml-1 italic">({item.notes})</span>}
                    </div>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      item.io_type === 'Intake' ? 'bg-teal-50 text-teal-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      {item.io_type === 'Intake' ? `+${item.volume_ml} ml` : `-${item.volume_ml} ml`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No fluid intake or output entries recorded today.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'discharge' && (
        <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-base font-bold text-[#0E4749]">
            <LogOut className="w-5 h-5 text-[#E07856]" /> Inpatient Discharge Nursing Checklist
          </div>

          {hasAuthorizedDischarge ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs">
                <strong>Doctor Authorization Status:</strong> Approved by physician. Clinical notes: "{bed.discharge_notes || 'Patient stable for home recovery.'}"
              </div>

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Mandatory Nursing Completion Checklist:</h5>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ivRemoved}
                    onChange={(e) => setIvRemoved(e.target.checked)}
                  />
                  <span>Peripheral IV Cannula / line removed safely; dressing applied.</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medsCounseled}
                    onChange={(e) => setMedsCounseled(e.target.checked)}
                  />
                  <span>Discharge prescription medications delivered and usage instructions explained to patient/guardian.</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={summaryHanded}
                    onChange={(e) => setSummaryHanded(e.target.checked)}
                  />
                  <span>Discharge summary document handed over and follow-up appointment date confirmed.</span>
                </label>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCompleteDischarge}
                  disabled={actionLoading || !ivRemoved || !medsCounseled || !summaryHanded}
                  className="bg-[#E07856] hover:bg-[#d06846] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> {actionLoading ? 'Finalizing Discharge...' : 'Finalize Discharge & Clear Bed'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#5B6472] border border-dashed rounded-xl space-y-2">
              <Clock className="w-8 h-8 text-[#0E4749] opacity-40 mx-auto" />
              <p className="font-bold text-sm">Discharge Not Yet Authorized</p>
              <p className="text-xs text-gray-500">
                The attending physician has not yet entered a discharge order for this patient in the HMS.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
