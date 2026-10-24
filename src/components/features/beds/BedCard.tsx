"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { WardBedItem } from '@/services/nurseService';
import { 
  Sparkles, CheckCircle2, UserPlus, ArrowRight, 
  Check, Clock, LogOut
} from 'lucide-react';

interface BedCardProps {
  bed?: WardBedItem;
  id?: string;
  patient?: string;
  status?: string;
  time?: string;
  onQuickClean?: (bedId: number, e: React.MouseEvent) => void;
  onOpenAssignModal?: (bed: WardBedItem, e: React.MouseEvent) => void;
  onReleaseBed?: (bed: WardBedItem, e: React.MouseEvent) => void;
  cleaningLoading?: boolean;
}

export function BedCard({ 
  bed, 
  id, 
  patient, 
  status, 
  time, 
  onQuickClean,
  onOpenAssignModal,
  onReleaseBed,
  cleaningLoading 
}: BedCardProps) {
  const router = useRouter();

  const activeBed: WardBedItem = bed || {
    bed_id: 0,
    bed_number: id || 'BED',
    ward_id: 1,
    bed_status: (status === 'AVAILABLE' ? 'Available' : status === 'CLEANING' ? 'Cleaning' : 'Occupied'),
    patient_name: patient || null,
    vitals_status: (status === 'CRITICAL' ? 'CRITICAL' : status === 'MODERATE' ? 'MODERATE' : status === 'STABLE' ? 'STABLE' : null),
    latest_vitals_summary: time || null,
  };

  const isOccupied = activeBed.bed_status === 'Occupied';
  const isAvailable = activeBed.bed_status === 'Available';
  const isCleaning = activeBed.bed_status === 'Cleaning';
  const isDischargeReady = isOccupied && activeBed.discharge_status === 'Authorized';
  const isCritical = activeBed.vitals_status === 'CRITICAL' || status === 'CRITICAL';
  const isModerate = activeBed.vitals_status === 'MODERATE' || status === 'MODERATE';

  let cardBorder = "border-[#DCE3E0] hover:border-[#0E4749]/60 hover:shadow-md";
  let statusColor = "text-emerald-600";
  let dotColor = "bg-emerald-500";
  let statusText = "AVAILABLE";

  if (isDischargeReady) {
    cardBorder = "border-[#E07856] hover:border-[#d06846] shadow-xs ring-1 ring-[#E07856]/40";
    statusColor = "text-[#E07856]";
    dotColor = "bg-[#E07856] animate-pulse";
    statusText = "DISCHARGED";
  } else if (isCritical) {
    cardBorder = "border-red-400 hover:border-red-500 shadow-xs ring-1 ring-red-400/50";
    statusColor = "text-red-600";
    dotColor = "bg-red-500 animate-pulse";
    statusText = "CRITICAL";
  } else if (isModerate) {
    cardBorder = "border-amber-300 hover:border-amber-400 shadow-xs";
    statusColor = "text-amber-600";
    dotColor = "bg-amber-500";
    statusText = "MODERATE";
  } else if (isOccupied) {
    cardBorder = "border-teal-200 hover:border-teal-400 shadow-xs";
    statusColor = "text-[#0E4749]";
    dotColor = "bg-[#0E4749]";
    statusText = "STABLE";
  } else if (isCleaning) {
    cardBorder = "border-amber-200 hover:border-amber-400";
    statusColor = "text-amber-600";
    dotColor = "bg-amber-400";
    statusText = "CLEANING";
  }

  const getAge = (dobString?: string | null) => {
    if (!dobString) return null;
    const birthYear = new Date(dobString).getFullYear();
    const currYear = new Date().getFullYear();
    return Math.max(0, currYear - birthYear);
  };

  const patientAge = getAge(activeBed.dob) || (isOccupied ? 54 : null);

  const handleCardClick = () => {
    if (isOccupied && activeBed.bed_id > 0) {
      router.push(`/nurse/bed/${activeBed.bed_id}`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-2xl border-2 ${cardBorder} p-4 flex flex-col justify-between min-h-[220px] transition-all duration-200 cursor-pointer relative group overflow-hidden shadow-2xs`}
    >
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <h3 className="font-bold text-base text-gray-900 tracking-tight group-hover:text-[#0E4749] transition-colors whitespace-nowrap flex-shrink-0">
          {activeBed.bed_number}
        </h3>

        {isDischargeReady ? (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-50 text-[#E07856] border border-orange-200 flex items-center gap-1 shadow-2xs whitespace-nowrap flex-shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5 text-[#E07856] flex-shrink-0" />
            Discharged
          </span>
        ) : isOccupied && (isModerate || isCritical) ? (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs whitespace-nowrap flex-shrink-0">
            <Clock className="w-2.5 h-2.5 text-amber-600 flex-shrink-0" />
            1 due
          </span>
        ) : null}
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isOccupied && activeBed.patient_name ? (
          <div className="space-y-1.5">
            <div>
              <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#0E4749] transition-colors truncate">
                {activeBed.patient_name}
              </h4>
              <p className="text-[11px] text-[#5B6472] truncate">
                {patientAge ? `${patientAge}y` : ''}
                {patientAge && activeBed.admission_reason ? ' • ' : ''}
                {activeBed.admission_reason || 'Inpatient Observation'}
              </p>
            </div>

            <div className="text-xs font-semibold text-gray-700 tracking-tight whitespace-nowrap truncate">
              BP {activeBed.latest_bp || '120/80'} • HR {activeBed.latest_pulse || 72} • SpO₂ {activeBed.latest_spo2 ? `${activeBed.latest_spo2}%` : '98%'}
            </div>

            <div className="pt-2 pb-1">
              <svg className="w-full h-7 overflow-visible" viewBox="0 0 200 30" preserveAspectRatio="none">
                {isCritical ? (
                  <path
                    d="M 0,22 L 30,22 L 45,5 L 60,26 L 75,18 L 95,22 L 120,4 L 140,28 L 160,20 L 200,22"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : isModerate ? (
                  <path
                    d="M 0,20 Q 30,8 65,22 T 130,12 T 200,18"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M 0,18 Q 30,12 60,18 T 120,14 T 200,16"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </div>

            {isDischargeReady && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onReleaseBed) {
                    onReleaseBed(activeBed, e);
                  } else {
                    router.push(`/nurse/bed/${activeBed.bed_id}`);
                  }
                }}
                className="w-full py-1.5 px-2 bg-[#E07856] hover:bg-[#d06846] text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-98"
              >
                <LogOut className="w-3.5 h-3.5" />
                Release Bed
              </button>
            )}
          </div>
        ) : isAvailable ? (
          <div className="space-y-2 py-1">
            <div className="h-24 w-full rounded-xl overflow-hidden relative border border-[#DCE3E0] shadow-inner bg-gray-50">
              <img
                src="/images/beds/bed_available.jpg"
                alt="Available Bed"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-emerald-900/10 group-hover:bg-transparent transition-colors" />
            </div>
            
            {onOpenAssignModal && activeBed.bed_id > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAssignModal(activeBed, e);
                }}
                className="w-full py-1.5 px-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-lg text-xs font-bold border border-emerald-200 transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Assign Inpatient
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2 py-1">
            <div className="h-24 w-full rounded-xl overflow-hidden relative border border-[#DCE3E0] shadow-inner bg-gray-50">
              <img
                src="/images/beds/bed_cleaning.jpg"
                alt="Cleaning Bed"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-amber-900/10 group-hover:bg-transparent transition-colors" />
            </div>

            {onQuickClean && activeBed.bed_id > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickClean(activeBed.bed_id, e);
                }}
                disabled={cleaningLoading}
                className="w-full py-1.5 px-2 bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white rounded-lg text-xs font-bold border border-amber-200 transition flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                {cleaningLoading ? 'Updating...' : 'Mark Available'}
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
        <div className={`font-bold uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap text-[11px] ${statusColor}`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`}></span>
          {statusText}
        </div>

        {isOccupied && (
          <span className="text-[11px] font-bold text-[#0E4749] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 whitespace-nowrap">
            Open Station <ArrowRight className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
}
