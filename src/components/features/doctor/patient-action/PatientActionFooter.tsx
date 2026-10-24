'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface PatientActionFooterProps {
  onEscalate: () => void;
  onComplete: () => void;
  isCompleting: boolean;
  isCompleted: boolean;
}

export function PatientActionFooter({
  onEscalate,
  onComplete,
  isCompleting,
  isCompleted,
}: PatientActionFooterProps) {
  const [confirmModal, setConfirmModal] = useState<'escalate' | 'complete' | null>(null);

  const handleConfirmAction = () => {
    if (confirmModal === 'escalate') {
      onEscalate();
    } else if (confirmModal === 'complete') {
      onComplete();
    }
    setConfirmModal(null);
  };

  return (
    <>
      {/* Sticky Action Footer Bar */}
      <footer className="sticky bottom-0 z-20 -mx-4 md:-mx-8 border-t border-slate-200 bg-white/95 backdrop-blur px-4 py-3 md:px-8 shadow-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setConfirmModal('escalate')}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Escalate for Admission
            </button>

            {!isCompleted && (
              <button
                type="button"
                onClick={() => setConfirmModal('complete')}
                disabled={isCompleting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0E4749] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0a3536] transition-colors shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 className="h-4 w-4" />
                {isCompleting ? 'Saving...' : 'Complete Appointment'}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  confirmModal === 'escalate' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {confirmModal === 'escalate' ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <CheckCircle2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {confirmModal === 'escalate' ? 'Confirm Urgent Escalation' : 'Complete Appointment'}
                </h3>
                <p className="text-xs text-slate-500">
                  {confirmModal === 'escalate'
                    ? 'Are you sure you want to escalate this patient for admission?'
                    : 'Are you sure you want to mark this consultation as completed?'}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal(null)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isCompleting}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold text-white shadow-sm ${
                  confirmModal === 'escalate' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0E4749] hover:bg-[#0a3536]'
                }`}
              >
                {confirmModal === 'complete' && isCompleting ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
