'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Calendar,
  Clock,
  RotateCcw,
  User,
  ArrowRight,
  Activity,
  Eye,
  ChevronRight,
  X,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { doctorService } from '@/services/doctorService';
import type { DoctorUserAppointment } from '@/types/doctor';

const FALLBACK_APPOINTMENTS: DoctorUserAppointment[] = [
  {
    apt_id: 5,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-21',
    appointment_time: '09:30 AM',
    status: 'Scheduled',
    day_group: 'Today',
  },
  {
    apt_id: 6,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-25',
    appointment_time: '10:00 AM',
    status: 'Scheduled',
    day_group: 'Upcoming',
  },
  {
    apt_id: 7,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-27',
    appointment_time: '10:00 AM',
    status: 'Scheduled',
    day_group: 'Upcoming',
  },
  {
    apt_id: 8,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-27',
    appointment_time: '11:00 AM',
    status: 'Scheduled',
    day_group: 'Upcoming',
  },
  {
    apt_id: 9,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-27',
    appointment_time: '01:00 PM',
    status: 'Scheduled',
    day_group: 'Upcoming',
  },
  {
    apt_id: 10,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-11-03',
    appointment_time: '01:30 PM',
    status: 'Scheduled',
    day_group: 'Upcoming',
  },
  {
    apt_id: 18,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '09:00 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 11,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '09:00 AM',
    status: 'Cancelled',
    day_group: 'Past',
  },
  {
    apt_id: 12,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '09:30 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 13,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '10:00 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 15,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '10:30 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 22,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '11:00 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 17,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '11:30 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 20,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-19',
    appointment_time: '01:00 PM',
    status: 'Scheduled',
    day_group: 'Past',
  },
  {
    apt_id: 21,
    patient_id: 1,
    patient_name: 'Jane Doe',
    apt_date: '2026-10-18',
    appointment_time: '10:00 AM',
    status: 'Scheduled',
    day_group: 'Past',
  },
];

function formatDisplayDate(dateStr: string, timeStr: string): string {
  if (!dateStr) return timeStr;
  if (dateStr.toLowerCase() === 'tomorrow') {
    return `Tomorrow ${timeStr}`;
  }

  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (d.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow ${timeStr}`;
      }
      const formatted = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return `${formatted} ${timeStr}`;
    }
  } catch {
    // fallback to original
  }
  return `${dateStr} ${timeStr}`;
}

export default function PatientActionPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DoctorUserAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'Today' | 'Upcoming' | 'Past'>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    let active = true;
    const fetchAppointments = async () => {
      try {
        const userId = user?.user_id ? Number(user.user_id) : 2;
        const res = await doctorService.getAppointmentsByUser(userId);
        if (active) {
          if (res && res.length > 0) {
            setAppointments(res);
          } else {
            setAppointments(FALLBACK_APPOINTMENTS);
          }
        }
      } catch (err) {
        console.warn('Could not load user appointments from backend, using fallback data', err);
        if (active) {
          setAppointments(FALLBACK_APPOINTMENTS);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAppointments();
    return () => {
      active = false;
    };
  }, [user]);

  // Counts calculated on total list before search filters
  const counts = useMemo(() => {
    return {
      today: appointments.filter((a) => a.day_group === 'Today').length,
      upcoming: appointments.filter((a) => a.day_group === 'Upcoming').length,
      past: appointments.filter((a) => a.day_group === 'Past').length,
    };
  }, [appointments]);

  // Filtered by Search & Date
  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.patient_id).includes(searchQuery) ||
        String(item.apt_id).includes(searchQuery);

      const matchDate = !selectedDate || item.apt_date === selectedDate;

      return matchSearch && matchDate;
    });
  }, [appointments, searchQuery, selectedDate]);

  const todayList = useMemo(
    () => filteredAppointments.filter((a) => a.day_group === 'Today'),
    [filteredAppointments]
  );
  const upcomingList = useMemo(
    () => filteredAppointments.filter((a) => a.day_group === 'Upcoming'),
    [filteredAppointments]
  );
  const pastList = useMemo(
    () => filteredAppointments.filter((a) => a.day_group === 'Past'),
    [filteredAppointments]
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate('');
    setActiveTab('all');
  };

  const handleTabClick = (tab: 'Today' | 'Upcoming' | 'Past') => {
    // If clicking current active tab, toggle to show all; otherwise focus that tab
    setActiveTab((prev) => (prev === tab ? 'all' : tab));
  };

  const todayDateLabel = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-slate-900">
          Patient Action
        </h1>
       
      </div>

      {/* Top Tabs: Today, Upcoming, Past */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Today Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('Today')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-xs ${
            activeTab === 'Today'
              ? 'bg-[#0D5C58] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Calendar
            className={`w-5 h-5 ${
              activeTab === 'Today' ? 'text-white' : 'text-slate-500'
            }`}
          />
          <span>Today</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'Today'
                ? 'bg-[#186f6a] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.today}
          </span>
        </button>

        {/* Upcoming Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('Upcoming')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-xs ${
            activeTab === 'Upcoming'
              ? 'bg-[#0D5C58] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock
            className={`w-5 h-5 ${
              activeTab === 'Upcoming' ? 'text-white' : 'text-slate-500'
            }`}
          />
          <span>Upcoming</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'Upcoming'
                ? 'bg-[#186f6a] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.upcoming}
          </span>
        </button>

        {/* Past Tab */}
        <button
          type="button"
          onClick={() => handleTabClick('Past')}
          className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-xs ${
            activeTab === 'Past'
              ? 'bg-[#0D5C58] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <RotateCcw
            className={`w-5 h-5 ${
              activeTab === 'Past' ? 'text-white' : 'text-slate-500'
            }`}
          />
          <span>Past</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'Past'
                ? 'bg-[#186f6a] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {counts.past}
          </span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient name..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#0D5C58] focus:ring-1 focus:ring-[#0D5C58] transition-colors"
          />
        </div>

        {/* Date Selector */}
        <div className="relative w-full sm:w-64">
          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            placeholder="Select Date"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 focus:outline-none focus:border-[#0D5C58] focus:ring-1 focus:ring-[#0D5C58] transition-colors"
          />
        </div>

        {/* Clear Filters Button */}
        <button
          type="button"
          onClick={clearFilters}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap shadow-xs"
        >
          <X className="w-3.5 h-3.5 text-slate-400" />
          Clear Filters
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400">Loading appointments…</div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Today's Appointments */}
          {(activeTab === 'all' || activeTab === 'Today') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#0D5C58]" />
                  <h2 className="font-bold text-slate-900 text-sm">
                    Today&apos;s Appointments
                  </h2>
                  <span className="bg-teal-50 text-[#0D5C58] text-xs font-bold px-2 py-0.5 rounded-full">
                    {todayList.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{todayDateLabel}</span>
                </div>
              </div>

              {todayList.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl py-8 px-4 text-center text-xs text-slate-400">
                  No appointments scheduled for today.
                </div>
              ) : (
                <div className="space-y-3">
                  {todayList.map((item) => (
                    <div
                      key={item.apt_id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0D5C58] flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {item.patient_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{item.appointment_time}</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/doctor/patient-action/${item.apt_id}`}
                        className="inline-flex items-center justify-center gap-2 bg-[#0D5C58] hover:bg-[#094340] text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors self-end sm:self-auto"
                      >
                        <Activity className="w-4 h-4" />
                        Open Action
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 2: Upcoming Appointments */}
          {(activeTab === 'all' || activeTab === 'Upcoming') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-700" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Upcoming Appointments
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {upcomingList.length}
                </span>
              </div>

              {upcomingList.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-2xl py-8 px-4 text-center text-xs text-slate-400">
                  No upcoming appointments.
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingList.map((item) => (
                    <div
                      key={item.apt_id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0D5C58] flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">
                            {item.patient_name}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {formatDisplayDate(item.apt_date, item.appointment_time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/doctor/patient-action/${item.apt_id}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors self-end sm:self-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        View
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Section 3: Past Appointments */}
          {(activeTab === 'all' || activeTab === 'Past') && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-slate-700" />
                <h2 className="font-bold text-slate-900 text-sm">
                  Past Appointments
                </h2>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pastList.length}
                </span>
              </div>

              {pastList.length === 0 ? (
                /* Empty state as seen in screenshot */
                <div className="bg-white border border-slate-200/90 rounded-2xl py-12 px-4 flex flex-col items-center justify-center text-center shadow-xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 mb-2">
                    <FileText className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">No past appointments</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try changing the date filter or search by name.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pastList.map((item) => (
                    <div
                      key={item.apt_id}
                      className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-teal-50 text-[#0D5C58] flex items-center justify-center flex-shrink-0">
                          <User className="w-6 h-6 stroke-[1.75]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm">
                              {item.patient_name}
                            </h3>
                            {item.status?.toLowerCase() === 'cancelled' && (
                              <span className="text-[10px] font-semibold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200">
                                Cancelled
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {formatDisplayDate(item.apt_date, item.appointment_time)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Link
                        href={`/doctor/patient-action/${item.apt_id}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors self-end sm:self-auto"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        View
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
