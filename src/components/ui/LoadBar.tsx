import React from 'react';

interface LoadBarProps {
  label: string;
  percent: number;
  colorClassName?: string;
  rightLabel?: React.ReactNode;
}

export function LoadBar({ label, percent, colorClassName, rightLabel }: LoadBarProps) {
  const safePercent = Math.min(100, Math.max(0, percent));
  
  return (
    <div>
      <div className="flex justify-between items-center text-sm mb-1.5">
        <span className="font-medium text-[#2C3E50]">{label}</span>
        {rightLabel ? (
          <span className="text-xs font-semibold">{rightLabel}</span>
        ) : (
          <span className="text-xs font-medium text-gray-500">{safePercent}%</span>
        )}
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 rounded-full ${colorClassName || 'bg-[#0E4749]'}`} 
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}
