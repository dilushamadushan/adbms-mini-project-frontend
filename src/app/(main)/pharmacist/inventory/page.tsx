"use client";

import React from 'react';
import { Pill } from 'lucide-react';

export default function PharmacistInventory() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-bold text-[#0E4749] text-2xl tracking-tight flex items-center gap-2">
            <Pill className="w-7 h-7 text-[#0E4749]" /> Pharmacy Inventory
          </h1>
          <p className="text-sm text-[#5B6472] mt-0.5">
            Monitor stock levels, expiry dates, and restock medications.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#DCE3E0] shadow-sm p-8 text-center">
        <p className="text-sm text-[#5B6472]">
          Inventory shell initialized. Ready for Screen 3: Inventory.
        </p>
      </div>
    </div>
  );
}
