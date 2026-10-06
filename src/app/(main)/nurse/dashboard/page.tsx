import React from 'react';
import Link from 'next/link';
import { BedCard } from '@/components/features/beds/BedCard';

export default function NurseWardOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-[#0E4749] text-white p-6 rounded-xl relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="text-teal-200 text-sm font-medium uppercase tracking-wider mb-1">General Medicine A (Your Ward)</div>
          <h2 className="text-2xl font-bold">12 Occupied • 2 Available</h2>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-teal-800 to-transparent opacity-50"></div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Link href="/nurse/bed/A-101"><BedCard id="A-101" patient="Robert Jenkins" status="STABLE" /></Link>
        <Link href="/nurse/bed/A-102"><BedCard id="A-102" patient="Sarah Miller" status="MODERATE" /></Link>
        <Link href="/nurse/bed/A-103"><BedCard id="A-103" status="AVAILABLE" /></Link>
        <Link href="/nurse/bed/A-104"><BedCard id="A-104" patient="Michael Chen" status="CRITICAL" /></Link>
        <Link href="/nurse/bed/A-105"><BedCard id="A-105" status="CLEANING" /></Link>
        <Link href="/nurse/bed/A-106"><BedCard id="A-106" patient="Elena R." status="STABLE" /></Link>
        <Link href="/nurse/bed/A-107"><BedCard id="A-107" status="AVAILABLE" /></Link>
      </div>
    </div>
  );
}
