'use client';

import React, { useState } from 'react';
import { FileEdit, ChevronUp, ChevronDown } from 'lucide-react';

interface ClinicalNotesProps {
  notes: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export function ClinicalNotes({
  notes,
  onChange,
  maxLength = 1000,
}: ClinicalNotesProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      onChange(text);
    }
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {/* Header with Collapsible Toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left focus:outline-none"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <FileEdit className="h-5 w-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Clinical Notes</h3>
          </div>
          <span className="text-slate-400 hover:text-slate-600">
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </span>
        </button>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-4 space-y-2">
          <div className="relative">
            <textarea
              value={notes}
              onChange={handleChange}
              placeholder="Type your clinical notes here..."
              rows={4}
              maxLength={maxLength}
              className="w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-y min-h-[90px]"
            />
            <div className="text-right text-xs text-slate-400 pt-1">
              {notes.length}/{maxLength}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
