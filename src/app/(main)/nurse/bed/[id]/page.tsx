"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Activity, Thermometer, Heart, Save, ArrowLeft, CheckCircle2, 
  AlertCircle, Sparkles, RefreshCw, LogOut, ShieldAlert, Pill, 
  ClipboardList, FileText, Droplets, Clock, AlertTriangle, CheckSquare, 
  User, Check, X, ShieldCheck, Stethoscope, Wind, Info
} from 'lucide-react';
import { 
  nurseService, BedDetailResponse, VitalsLogItem, MarOverviewResponse, 
  DoctorOrderItem, NursingNoteItem, IntakeOutputSummaryResponse 
} from '@/services/nurseService';

type ClinicalTab = 'vitals' | 'mar' | 'orders' | 'notes' | 'io' | 'discharge';

interface ToastAlert {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

export default function NurseBedDetail() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bedId = params?.id as string;

  const tabParam = searchParams?.get('tab') as ClinicalTab;
  const validTabs = ['vitals', 'mar', 'orders', 'notes', 'io', 'discharge'];
  const [activeTab, setActiveTab] = useState<ClinicalTab>(
    tabParam && validTabs.includes(tabParam) ? tabParam : 'vitals'
  );

  useEffect(() => {
    const currentTab = searchParams?.get('tab') as ClinicalTab;
    if (currentTab && validTabs.includes(currentTab)) {
      setActiveTab(currentTab);
    }
  }, [searchParams]);

  const [bed, setBed] = useState<BedDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<ToastAlert[]>([]);

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
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

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

      if (res.current_status === 'CRITICAL') {
        showToast('error', 'CRITICAL VITALS ALERT', `Warning: SpO2 ${res.spo2}%, BP ${res.bp} breached threshold! Physician notification dispatched.`);
      } else if (res.current_status === 'MODERATE') {
        showToast('warning', 'Moderate Vitals Warning', `Vitals recorded. Blood Pressure / Pulse outside normal baseline. Frequent observation recommended.`);
      } else {
        showToast('success', 'Vitals Logged Successfully', `Recorded BP ${res.bp}, Pulse ${res.pulse} bpm, SpO2 ${res.spo2 || 98}%. Condition is STABLE.`);
      }
    } catch (err: any) {
      showToast('error', 'Failed to Log Vitals', err?.response?.data?.detail || 'Database error occurred while recording vitals.');
    } finally {
      setSubmittingVitals(false);
    }
  };

  const handleAdministerMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed?.patient_id || !selectedRx) return;
    if (!fiveRightsChecked && marStatus === 'Given') {
      showToast('warning', 'Safety Verification Required', 'Please confirm and check the 5 Rights of Medication Administration before administering.');
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

      showToast('success', 'Medication Recorded', `${selectedRx.med_name} (${selectedRx.dosage}) marked as "${marStatus}" in permanent MAR audit trail.`);
      setSelectedRx(null);
      setMarReason('');
      setMarNotes('');
      setFiveRightsChecked(false);
      const updatedMar = await nurseService.getPatientMar(bed.patient_id);
      setMarData(updatedMar);
    } catch (err: any) {
      showToast('error', 'MAR Administration Failed', err?.response?.data?.detail || 'Could not log medication administration.');
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
      showToast('info', 'Doctor Order Updated', `Order #${orderId} successfully set to "${newStatus}".`);
    } catch (err: any) {
      showToast('error', 'Order Update Failed', err?.response?.data?.detail || 'Failed to update doctor order status.');
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
      showToast('success', 'Nursing Note Saved', `Structured ${noteType} clinical documentation added to patient permanent medical chart.`);
      const updatedNotes = await nurseService.getNursingNotes(bed.patient_id);
      setNursingNotes(updatedNotes);
    } catch (err: any) {
      showToast('error', 'Note Save Failed', err?.response?.data?.detail || 'Failed to document nursing note.');
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
      showToast('info', 'Fluid Balance Logged', `${ioType} of ${ioVolume}ml (${ioCategory}) recorded. 24hr balance updated to ${updatedIo.net_balance_ml > 0 ? '+' : ''}${updatedIo.net_balance_ml}ml.`);
    } catch (err: any) {
      showToast('error', 'I/O Log Failed', err?.response?.data?.detail || 'Failed to record intake/output.');
    } finally {
      setSubmittingIo(false);
    }
  };

  const handleCompleteDischarge = async () => {
    if (!bed?.admission_id) return;
    const pending = doctorOrders.filter(o => o.status !== 'Done');
    if (pending.length > 0) {
      showToast('warning', 'Pending Doctor Orders', `Cannot release bed: There are ${pending.length} pending doctor order(s). Please mark all orders as Done first.`);
      return;
    }
    if (!ivRemoved || !medsCounseled || !summaryHanded) {
      showToast('warning', 'Checklist Incomplete', 'Please verify and complete all 3 items on the nursing discharge checklist before releasing the bed.');
      return;
    }

    setActionLoading(true);
    try {
      await nurseService.completeDischarge(bed.admission_id);
      await fetchBedDetails();
      setDischargeModalOpen(false);
      showToast('success', 'Bed Released & Discharged', `Patient discharge finalized. Bed ${bed.bed_number} has been released and transitioned to Cleaning status.`);
    } catch (err: any) {
      showToast('error', 'Discharge Failed', err?.response?.data?.detail || 'Failed to finalize patient discharge.');
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
      showToast('success', 'Bed Sanitized & Ready', `Bed ${bed.bed_number} is now Available and ready for new patient admissions.`);
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err?.response?.data?.detail || 'Failed to update bed status.');
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
          <ArrowLeft className="w-4 h-4" /> Back to Ward Dashboard
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
  const pendingDoctorOrders = doctorOrders.filter(o => o.status !== 'Done');

  const currentSpo2 = parseInt(spo2 || '98', 10);
  const currentPulse = parseInt(pulse || '72', 10);
  const isVitalsWarning = currentSpo2 < 92 || currentPulse > 115 || currentPulse < 50;


  return (
    <div className="space-y-6 max-w-6xl relative">
      <div className="fixed top-20 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((t) => {
          let bgClass = "bg-white border-emerald-300 text-emerald-950";
          let Icon = CheckCircle2;
          let iconColor = "text-emerald-600";

          if (t.type === 'warning') {
            bgClass = "bg-amber-50 border-amber-300 text-amber-950";
            Icon = AlertTriangle;
            iconColor = "text-amber-600";
          } else if (t.type === 'error') {
            bgClass = "bg-red-50 border-red-300 text-red-950";
            Icon = AlertCircle;
            iconColor = "text-red-600";
          } else if (t.type === 'info') {
            bgClass = "bg-blue-50 border-blue-300 text-blue-950";
            Icon = Info;
            iconColor = "text-blue-600";
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-4 rounded-xl border-2 shadow-xl flex items-start gap-3 transition-all animate-in slide-in-from-top-2 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <h5 className="font-bold text-xs leading-tight">{t.title}</h5>
                <p className="text-[11px] mt-0.5 opacity-90 leading-relaxed">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-700 ml-1 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/nurse/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0E4749] hover:bg-teal-50 bg-white border border-[#DCE3E0] px-3.5 py-2 rounded-lg shadow-2xs transition"
        >
          <ArrowLeft className="w-4 h-4 text-[#E07856]" /> Back to Ward Dashboard
        </Link>

        <div className="flex items-center gap-2">
          {isCleaning && (
            <button
              onClick={handleMarkCleaned}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" /> Mark Bed Available
            </button>
          )}


          <button
            onClick={fetchBedDetails}
            disabled={loading}
            className="text-xs text-[#5B6472] hover:text-[#0E4749] bg-white border border-[#DCE3E0] px-3 py-2 rounded-lg flex items-center gap-1.5 font-semibold shadow-2xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#DCE3E0] p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-[#0E4749] tracking-tight">
                  {bed.patient_name || 'Empty Bed'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-[#0E4749] border border-teal-200">
                  Bed {bed.bed_number}
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isOccupied
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : isCleaning
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {bed.bed_status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[#5B6472]">
                <span className="font-semibold text-gray-700">{bed.ward_name}</span>
                {bed.age && <span>• Age: {bed.age} yrs</span>}
                {bed.blood_group && (
                  <span className="bg-red-50 text-red-700 font-bold px-1.5 py-0.2 rounded border border-red-200 text-[10px]">
                    Blood: {bed.blood_group}
                  </span>
                )}
                {bed.emergency_contact && (
                  <span>• Emergency: <strong className="text-gray-800">{bed.emergency_contact}</strong></span>
                )}
              </div>

              <div className="text-xs text-gray-600 flex flex-wrap items-center gap-2 pt-0.5">
                <span className="flex items-center gap-1 font-medium text-[#0E4749]">
                  <Stethoscope className="w-3.5 h-3.5 text-[#E07856]" />
                  Attending: {bed.attending_doctor || 'Dr. John Smith'}
                </span>
                <span>•</span>
                <span>Admitted: {bed.admitted_at ? new Date(bed.admitted_at).toLocaleDateString() : 'Active'}</span>
                {bed.admission_reason && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-gray-800 italic">&ldquo;{bed.admission_reason}&rdquo;</span>
                  </>
                )}
              </div>

              {bed.allergies && bed.allergies !== 'None' && (
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-700 font-bold bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                  <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                  Allergy Safety Warning: {bed.allergies}
                </div>
              )}
            </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
            {hasAuthorizedDischarge && (
              <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl flex items-center justify-between gap-3 w-full sm:w-auto">
                <div className="text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" /> Discharge Authorized
                  </div>
                  <div className="text-[11px] opacity-80">Doctor approved release</div>
                </div>
                <button
                  onClick={() => setDischargeModalOpen(true)}
                  className="bg-[#E07856] hover:bg-[#d06846] text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition active:scale-95 flex items-center gap-1 flex-shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" /> Release Bed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOccupied && (
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#DCE3E0] shadow-sm">
          {[
            { id: 'vitals', label: 'Vitals Charting', icon: Activity },
            { id: 'mar', label: 'MAR (Medications)', icon: Pill, badge: marData?.prescriptions?.length },
            { id: 'orders', label: 'Doctor Orders', icon: ClipboardList, badge: doctorOrders?.filter(o => o.status === 'Pending').length },
            { id: 'notes', label: 'Nursing Notes', icon: FileText, badge: nursingNotes?.length },
            { id: 'io', label: 'Intake / Output', icon: Droplets, badgeText: ioSummary ? `${ioSummary.net_balance_ml > 0 ? '+' : ''}${ioSummary.net_balance_ml}ml` : undefined },
            { id: 'discharge', label: 'Discharge & Release Bed', icon: LogOut, alert: hasAuthorizedDischarge },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ClinicalTab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all relative ${
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
                {tab.badgeText && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                    isActive ? 'bg-teal-800 text-teal-100' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tab.badgeText}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E07856] animate-ping absolute top-1 right-1" />
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
                    <Wind className="w-3.5 h-3.5 text-blue-500" /> SpO2 (%)
                  </label>
                  <input
                    type="number"
                    value={spo2}
                    onChange={(e) => setSpo2(e.target.value)}
                    min="50"
                    max="100"
                    className={`w-full p-2.5 border rounded-lg font-mono text-sm focus:outline-none ${
                      currentSpo2 < 92 ? 'border-red-400 bg-red-50 text-red-700 font-bold' : 'border-[#DCE3E0] focus:border-[#0E4749]'
                    }`}
                    required
                  />
                  <span className={`text-[10px] mt-0.5 block ${currentSpo2 < 92 ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                    Warning if &lt; 92%
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">Resp. Rate (/min)</label>
                  <input
                    type="number"
                    value={respRate}
                    onChange={(e) => setRespRate(e.target.value)}
                    min="5"
                    max="60"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Normal: 12-20</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">Blood Sugar (mg/dL)</label>
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    min="20"
                    max="600"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Fasting / Random</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="1"
                    max="300"
                    className="w-full p-2.5 border border-[#DCE3E0] rounded-lg font-mono text-sm focus:outline-none focus:border-[#0E4749]"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">Current inpatient weight</span>
                </div>
              </div>

              {isVitalsWarning && (
                <div className="bg-red-50 border border-red-300 p-3 rounded-xl flex items-center gap-2 text-xs text-red-800 font-medium animate-pulse">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>Clinical Alert: Entered vitals (SpO2 &lt; 92% or abnormal pulse) fall in the critical warning range. Physician notification will trigger automatically.</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submittingVitals}
                  className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-[#E07856]" />
                  {submittingVitals ? 'Recording Vitals...' : 'Log Vitals (Now)'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-4">Historical Vital Logs</h4>
            {bed.recent_vitals && bed.recent_vitals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                    <tr>
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">BP</th>
                      <th className="py-2.5 px-3">Pulse</th>
                      <th className="py-2.5 px-3">Temp</th>
                      <th className="py-2.5 px-3">SpO2</th>
                      <th className="py-2.5 px-3">Resp. Rate</th>
                      <th className="py-2.5 px-3">Blood Sugar</th>
                      <th className="py-2.5 px-3">Nurse</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bed.recent_vitals.map((v) => (
                      <tr key={v.vital_id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{v.recorded_at}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900">{v.bp}</td>
                        <td className="py-2.5 px-3">{v.pulse} bpm</td>
                        <td className="py-2.5 px-3">{v.temperature}°F</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold px-1.5 py-0.5 rounded ${
                            v.spo2 && v.spo2 < 92 ? 'bg-red-100 text-red-700' : 'text-emerald-700'
                          }`}>
                            {v.spo2 ? `${v.spo2}%` : 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{v.resp_rate || '--'}</td>
                        <td className="py-2.5 px-3">{v.blood_sugar ? `${v.blood_sugar} mg/dL` : '--'}</td>
                        <td className="py-2.5 px-3 text-[#5B6472]">{v.recorded_by_name || 'Staff Nurse'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No previous vitals logged for this admission.</p>
            )}
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'mar' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">Active Prescriptions Awaiting Administration</h3>
              </div>
              <span className="text-xs text-[#5B6472]">{marData?.prescriptions?.length || 0} active orders</span>
            </div>

            {marData?.prescriptions && marData.prescriptions.length > 0 ? (
              <div className="space-y-3">
                {marData.prescriptions.map((rx) => (
                  <div
                    key={rx.rx_id}
                    className="p-4 rounded-xl border border-[#DCE3E0] bg-[#F8FAF9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-white transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{rx.med_name}</span>
                        <span className="text-xs bg-teal-50 text-[#0E4749] font-bold px-2 py-0.5 rounded border border-teal-200">
                          {rx.dosage}
                        </span>
                        {rx.has_allergy_conflict && (
                          <span className="text-[11px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse border border-red-300">
                            <ShieldAlert className="w-3 h-3" /> Allergy Conflict ({rx.patient_allergies})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#5B6472]">
                        Prescribed by: {rx.doctor_name || 'Attending Physician'} • Duration: {rx.duration || 'Daily'}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedRx(rx)}
                      className="bg-[#0E4749] hover:bg-[#0a3335] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-[#E07856]" /> Administer Dose
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No active prescriptions pending administration.</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-4">Medication Administration Audit History</h4>
            {marData?.history && marData.history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAF9] text-[#5B6472] uppercase border-b border-[#DCE3E0]">
                    <tr>
                      <th className="py-2.5 px-3">Date / Time</th>
                      <th className="py-2.5 px-3">Medication</th>
                      <th className="py-2.5 px-3">Dosage</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Nurse</th>
                      <th className="py-2.5 px-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {marData.history.map((h) => (
                      <tr key={h.mar_id}>
                        <td className="py-2.5 px-3 font-semibold text-gray-800">{h.administered_at}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{h.med_name}</td>
                        <td className="py-2.5 px-3">{h.dosage}</td>
                        <td className="py-2.5 px-3">
                          <span className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                            h.status === 'Given' ? 'bg-emerald-100 text-emerald-800' :
                            h.status === 'Held' ? 'bg-amber-100 text-amber-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[#5B6472]">{h.administered_by_name || 'Staff Nurse'}</td>
                        <td className="py-2.5 px-3 text-gray-500 italic">{h.notes || h.reason || '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No medication administration records logged yet.</p>
            )}
          </div>
        </div>
      )}

      {selectedRx && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#DCE3E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <Pill className="w-5 h-5 text-[#0E4749]" />
                <h3 className="font-bold text-base text-[#0E4749]">Record Medication Administration</h3>
              </div>
              <button onClick={() => setSelectedRx(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs space-y-1">
              <div><strong>Drug:</strong> {selectedRx.med_name}</div>
              <div><strong>Dosage:</strong> {selectedRx.dosage}</div>
              <div><strong>Patient:</strong> {bed.patient_name}</div>
              {selectedRx.has_allergy_conflict && (
                <div className="text-red-700 font-bold bg-red-100 p-2 rounded border border-red-300 mt-1">
                  CRITICAL: Patient has a documented allergy to {selectedRx.patient_allergies}! Verify with physician.
                </div>
              )}
            </div>

            <form onSubmit={handleAdministerMedication} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Administration Status</label>
                <select
                  value={marStatus}
                  onChange={(e) => setMarStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]"
                >
                  <option value="Given">Given (Administered on time)</option>
                  <option value="Held">Held (Withheld due to clinical reason)</option>
                  <option value="Refused">Refused by Patient</option>
                  <option value="Not Given">Not Given</option>
                </select>
              </div>

              {marStatus === 'Given' && (
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-2">
                  <div className="font-bold text-xs text-[#0E4749] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-700" /> 5 Rights Safety Verification:
                  </div>
                  <label className="flex items-start gap-2 text-xs text-teal-950 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fiveRightsChecked}
                      onChange={(e) => setFiveRightsChecked(e.target.checked)}
                      className="mt-0.5 text-[#0E4749] focus:ring-[#0E4749]"
                    />
                    <span>I confirm Right Patient, Right Drug, Right Dose, Right Route, and Right Time.</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Clinical Notes</label>
                <textarea
                  value={marNotes}
                  onChange={(e) => setMarNotes(e.target.value)}
                  placeholder="e.g. Tolerated oral medication with water. Vitals verified."
                  rows={2}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg focus:outline-none focus:border-[#0E4749]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
                <button
                  type="button"
                  onClick={() => setSelectedRx(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMar}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-[#0E4749] hover:bg-[#0a3335] text-white transition disabled:opacity-50"
                >
                  {submittingMar ? 'Submitting...' : 'Confirm MAR Administration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'orders' && (
        <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-[#0E4749]" />
              <h3 className="font-bold text-base text-[#0E4749]">Doctor's Inpatient Clinical Orders</h3>
            </div>
            <span className="text-xs text-[#5B6472]">{doctorOrders.length} orders total</span>
          </div>

          {doctorOrders && doctorOrders.length > 0 ? (
            <div className="space-y-3">
              {doctorOrders.map((order) => {
                const isPending = order.status === 'Pending';
                const isAcked = order.status === 'Acknowledged';
                const isDone = order.status === 'Done';

                return (
                  <div
                    key={order.order_id}
                    className={`p-4 rounded-xl border transition ${
                      isDone
                        ? 'bg-gray-50/60 border-gray-200 opacity-75'
                        : isPending
                        ? 'bg-amber-50/50 border-amber-300'
                        : 'bg-white border-[#DCE3E0]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-[#0E4749] border border-teal-200">
                            {order.order_type}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isDone ? 'bg-emerald-100 text-emerald-800' :
                            isPending ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-gray-900 mt-1">{order.instruction}</p>
                        <div className="text-[11px] text-[#5B6472]">
                          Ordered by: {order.doctor_name || 'Attending Physician'} • Ordered at: {order.created_at}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'Acknowledged')}
                            className="bg-teal-700 hover:bg-teal-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Acknowledge
                          </button>
                        )}
                        {!isDone && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.order_id, 'Done')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No doctor orders logged for this patient.</p>
          )}
        </div>
      )}

      {isOccupied && activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#0E4749] mb-4 pb-2 border-b border-[#DCE3E0] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#E07856]" /> Add Clinical Nursing Note (SOAP)
            </h3>

            <form onSubmit={handleAddNote} className="space-y-4">
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
                  <option value="General">General Note</option>
                </select>
              </div>

              {noteType === 'SOAP' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">S - Subjective (Patient complaints)</label>
                    <textarea
                      value={subj}
                      onChange={(e) => setSubj(e.target.value)}
                      placeholder="e.g. Patient states chest pressure has subsided. Slept well."
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
                      placeholder="e.g. Stable hemodynamics."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">P - Plan (Care actions)</label>
                    <textarea
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      placeholder="e.g. Continue telemetry monitoring, encourage fluid intake."
                      rows={2}
                      className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Content</label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={6}
                    className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    required
                  />
                </div>
              )}

              {noteType === 'SOAP' && (
                <div>
                  <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Summary Summary Note</label>
                  <input
                    type="text"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Brief summary line for chart"
                    className="w-full p-2 text-xs border border-[#DCE3E0] rounded-lg"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submittingNote}
                className="w-full bg-[#0E4749] hover:bg-[#0a3335] text-white p-2.5 rounded-lg text-xs font-bold shadow-sm"
              >
                {submittingNote ? 'Saving...' : 'Save Nursing Note'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h3 className="font-bold text-base text-[#0E4749] mb-4 pb-2 border-b border-[#DCE3E0]">
              Patient Nursing Notes History
            </h3>

            {nursingNotes && nursingNotes.length > 0 ? (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {nursingNotes.map((note) => (
                  <div key={note.note_id} className="p-3.5 bg-[#F8FAF9] rounded-xl border border-[#DCE3E0] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#0E4749]">{note.note_type}</span>
                      <span className="text-[#5B6472]">{note.created_at}</span>
                    </div>
                    {note.subjective && <div className="text-xs text-gray-700"><strong>S:</strong> {note.subjective}</div>}
                    {note.objective && <div className="text-xs text-gray-700"><strong>O:</strong> {note.objective}</div>}
                    {note.assessment && <div className="text-xs text-gray-700"><strong>A:</strong> {note.assessment}</div>}
                    {note.plan && <div className="text-xs text-gray-700"><strong>P:</strong> {note.plan}</div>}
                    <div className="text-xs text-gray-800 font-medium pt-1 border-t border-gray-200/60 mt-1">
                      {note.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No nursing notes logged yet.</p>
            )}
          </div>
        </div>
      )}

      {isOccupied && activeTab === 'io' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <span className="text-xs font-medium text-[#5B6472]">Today's Total Intake</span>
              <div className="text-2xl font-bold text-teal-700 mt-1">+{ioSummary?.total_intake_ml || 0} ml</div>
              <span className="text-[11px] text-gray-400">Oral fluids, IV infusions, blood</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <span className="text-xs font-medium text-[#5B6472]">Today's Total Output</span>
              <div className="text-2xl font-bold text-rose-700 mt-1">-{ioSummary?.total_output_ml || 0} ml</div>
              <span className="text-[11px] text-gray-400">Urine, drainage, emesis</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DCE3E0] shadow-sm">
              <span className="text-xs font-medium text-[#5B6472]">Net Fluid Balance (24hr)</span>
              <div className={`text-2xl font-bold mt-1 ${
                (ioSummary?.net_balance_ml || 0) >= 0 ? 'text-[#0E4749]' : 'text-amber-600'
              }`}>
                {(ioSummary?.net_balance_ml || 0) > 0 ? '+' : ''}{ioSummary?.net_balance_ml || 0} ml
              </div>
              <span className="text-[11px] text-gray-400">Intake minus Output balance</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#DCE3E0] p-6 shadow-sm">
            <h4 className="font-bold text-[#0E4749] text-sm mb-4">Log Fluid Intake or Output</h4>
            <form onSubmit={handleLogIo} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Type</label>
                <select
                  value={ioType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    setIoType(newType);
                    setIoCategory(newType === 'Intake' ? 'Oral' : 'Urine');
                  }}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg"
                >
                  <option value="Intake">Intake (Fluid Entering)</option>
                  <option value="Output">Output (Fluid Exiting)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase mb-1">Category</label>
                <select
                  value={ioCategory}
                  onChange={(e) => setIoCategory(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#DCE3E0] rounded-lg"
                >
                  {ioType === 'Intake' ? (
                    <>
                      <option value="Oral">Oral (Water / Soup)</option>
                      <option value="IV Saline">IV Saline 0.9%</option>
                      <option value="IV Medication">IV Infusion / Meds</option>
                      <option value="Blood">Blood Products</option>
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
            <LogOut className="w-5 h-5 text-[#E07856]" /> Inpatient Discharge Nursing Checklist & Bed Release
          </div>

          {hasAuthorizedDischarge ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs">
                <strong>Doctor Authorization Status:</strong> Approved by physician. Clinical notes: "{bed.discharge_notes || 'Patient stable for home recovery.'}"
              </div>

              {pendingDoctorOrders.length > 0 ? (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Pending Doctor Orders ({pendingDoctorOrders.length}) — Must be Marked Done Before Bed Release</span>
                  </div>
                  <div className="space-y-2">
                    {pendingDoctorOrders.map((order) => (
                      <div key={order.order_id} className="bg-white p-3 rounded-lg border border-amber-200 flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold text-[#0E4749] mr-2">[{order.order_type}]</span>
                          <span className="text-gray-800">{order.instruction}</span>
                        </div>
                        <button
                          onClick={() => handleUpdateOrderStatus(order.order_id, 'Done')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-2xs flex-shrink-0 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Done
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>All doctor orders marked Done. Pre-discharge orders cleared.</span>
                </div>
              )}

              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Mandatory Nursing Completion Checklist:</h5>

                <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ivRemoved}
                    onChange={(e) => setIvRemoved(e.target.checked)}
                  />
                  <span>Peripheral IV Cannula / lines removed safely; sterile dressing applied.</span>
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
                  disabled={actionLoading || pendingDoctorOrders.length > 0 || !ivRemoved || !medsCounseled || !summaryHanded}
                  className="bg-[#E07856] hover:bg-[#d06846] disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2"
                >
                  <Check className="w-4 h-4" /> 
                  {actionLoading 
                    ? 'Finalizing Discharge...' 
                    : pendingDoctorOrders.length > 0 
                    ? `Mark ${pendingDoctorOrders.length} Doctor Order(s) Done First` 
                    : 'Release Bed & Complete Discharge'}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#5B6472] border border-dashed rounded-xl space-y-2">
              <Clock className="w-8 h-8 text-[#0E4749] opacity-40 mx-auto" />
              <p className="font-bold text-sm">Discharge Not Yet Authorized by Doctor</p>
              <p className="text-xs text-gray-500">
                The attending physician has not yet entered a discharge order for this patient in the HMS.
              </p>
            </div>
          )}
        </div>
      )}

      {dischargeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#DCE3E0] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE3E0]">
              <div className="flex items-center gap-2">
                <LogOut className="w-5 h-5 text-[#E07856]" />
                <h3 className="font-bold text-base text-[#0E4749]">Confirm Patient Discharge & Bed Release</h3>
              </div>
              <button onClick={() => setDischargeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs space-y-1">
              <div><strong>Patient:</strong> {bed.patient_name} (Bed {bed.bed_number})</div>
              <div><strong>Physician Approval:</strong> Authorized by {bed.attending_doctor || 'Attending Physician'}</div>
              <div><em>&ldquo;{bed.discharge_notes || 'Patient vitals stabilized. Approved for discharge.'}&rdquo;</em></div>
            </div>

            <div className="space-y-2.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h5 className="font-bold text-xs text-gray-800 uppercase tracking-wider">Nursing Safety Verification:</h5>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ivRemoved}
                  onChange={(e) => setIvRemoved(e.target.checked)}
                />
                <span>IV Cannula removed and puncture site dressed</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={medsCounseled}
                  onChange={(e) => setMedsCounseled(e.target.checked)}
                />
                <span>Take-home medications and counseling provided</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={summaryHanded}
                  onChange={(e) => setSummaryHanded(e.target.checked)}
                />
                <span>Discharge nursing summary delivered to patient</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DCE3E0]">
              <button
                type="button"
                onClick={() => setDischargeModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#5B6472] hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading || pendingDoctorOrders.length > 0 || !ivRemoved || !medsCounseled || !summaryHanded}
                onClick={handleCompleteDischarge}
                className="px-5 py-2.5 rounded-lg text-xs font-bold bg-[#E07856] hover:bg-[#d06846] text-white shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                {actionLoading 
                  ? 'Releasing Bed...' 
                  : pendingDoctorOrders.length > 0 
                  ? `Mark ${pendingDoctorOrders.length} Order(s) Done First` 
                  : `Release Bed ${bed.bed_number} & Finish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
