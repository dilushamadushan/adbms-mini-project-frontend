"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar,
  ClipboardList, TestTube, BarChart3,
  LogOut, Menu, X, Plus, User, Search, Bell,
  CalendarPlus, Pill, UserCircle, FileText, UserPlus, FileSearch, Grid, BookUser, Activity,
  History, ReceiptText, HeartPulse
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { nurseService } from '@/services/nurseService';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingLabCount, setPendingLabCount] = useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();
  const { role, userName, isLoaded, isAuthenticated, logout: authLogout } = useAuth();

  React.useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoaded, isAuthenticated, router]);

  React.useEffect(() => {
    if (role === 'NURSE') {
      const fetchCount = async () => {
        try {
          const res = await nurseService.getPendingLabCount();
          setPendingLabCount(res.count || 0);
        } catch {}
      };
      fetchCount();
      const interval = setInterval(fetchCount, 15000);
      return () => clearInterval(interval);
    }
  }, [role]);

  if (!isLoaded || !isAuthenticated) {
    return null; 
  }


  const patientNavItems = [
    { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patient/book", label: "Book Appointment", icon: CalendarPlus },
    { href: "/patient/appointments", label: "My Appointments", icon: Calendar },
    { href: "/patient/records", label: "My Medical Records", icon: ClipboardList },
    { href: "/patient/prescriptions", label: "Prescriptions", icon: Pill },
    { href: "/patient/profile", label: "Profile", icon: UserCircle },
  ];

  const doctorNavItems = [
    { href: "/doctor/dashboard", label: "Today's Patients", icon: LayoutDashboard },
    { href: "/doctor/patient-action", label: "Patient Action", icon: Activity },
    { href: "/doctor/schedule", label: "My Schedule", icon: Calendar },
    { href: "/doctor/patients", label: "Lab Orders", icon: TestTube },
    { href: "/patients", label: "Patient List", icon: Search },
  ];

  const nurseNavItems = [
    { href: "/nurse/dashboard", label: "Ward Overview", icon: Grid },
    { href: "/nurse/patients", label: "My Ward's Patients", icon: Users },
    { href: "/nurse/orders", label: "Doctor Orders", icon: ClipboardList },
    { href: "/nurse/labs", label: "Lab Tests", icon: TestTube, badgeCount: pendingLabCount },
    { href: "/nurse/mar", label: "MAR (Medications)", icon: Pill },
    { href: "/nurse/notes", label: "Nursing Notes", icon: FileText },
  ];

  const receptionistNavItems = [
    { href: "/receptionist/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/receptionist/book", label: "Patient Registration", icon: UserPlus },
    { href: "/receptionist/patients", label: "Patient Records", icon: FileSearch },
    { href: "/receptionist/appointments", label: "Manage Appointments", icon: Calendar },
    { href: "/receptionist/admit", label: "Admit Patient", icon: UserPlus },
    { href: "/receptionist/admissions", label: "Discharge", icon: ReceiptText },
  ];

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Hospital Overview", icon: LayoutDashboard },
    { href: "/admin/staff", label: "Staff Management", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: BookUser },
    { href: "/admin/audit", label: "Audit Logs", icon: FileSearch },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  ];

  const pharmacistNavItems = [
    { href: "/pharmacist/dashboard", label: "Pending Prescriptions", icon: ClipboardList },
    { href: "/pharmacist/inventory", label: "Inventory", icon: Pill },
    { href: "/pharmacist/history", label: "Dispensing History", icon: History },
    { href: "/pharmacist/reports", label: "Reports", icon: BarChart3 },
  ];

  let navItems = [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }];
  if (role === "PATIENT") navItems = patientNavItems;
  else if (role === "DOCTOR") navItems = doctorNavItems;
  else if (role === "NURSE") navItems = nurseNavItems;
  else if (role === "RECEPTIONIST") navItems = receptionistNavItems;
  else if (role === "ADMIN") navItems = adminNavItems;
  else if (role === "PHARMACIST") navItems = pharmacistNavItems;

  const logout = async () => {
    await authLogout();
    router.push('/');
  };

  return (
    <div className="h-screen bg-[#F6F7F5] flex flex-col md:flex-row font-sans overflow-hidden">
      <div className="md:hidden bg-[#0E4749] text-white p-4 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2 font-bold text-lg"><Plus className="w-5 h-5" /> MediCore</div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      <aside className={`${mobileMenuOpen ? 'fixed inset-0 z-40 flex' : 'hidden'} md:flex md:static w-full md:w-64 bg-[#0E4749] text-white md:h-screen flex-col flex-shrink-0 border-r border-teal-900/50`}>
        <div className="p-6 items-center gap-2 font-bold text-xl border-b border-teal-800 flex justify-between md:justify-start flex-shrink-0">
          <div className="flex items-center gap-2">
            <Plus className="w-6 h-6 text-[#E07856]" /> MediCore
          </div>
          <button className="md:hidden text-teal-200" onClick={() => setMobileMenuOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 border-b border-teal-800 flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 bg-teal-800 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="text-sm font-bold truncate">{userName}</div>
            <div className="text-xs text-teal-300 font-medium uppercase tracking-wider">{role}</div>
          </div>
        </div>
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/pharmacist/dashboard' && pathname.startsWith(item.href)) ||
              (item.href === '/pharmacist/dashboard' &&
                (pathname === '/pharmacist/dashboard' ||
                  pathname.startsWith('/pharmacist/dispense') ||
                  pathname.startsWith('/pharmacist/prescriptions')));
            const badgeCount = (item as any).badgeCount;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${isActive ? 'bg-teal-800 text-white' : 'text-teal-100 hover:bg-teal-800/50'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {typeof badgeCount === 'number' && badgeCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#E07856] text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-2xs">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        {role === "DOCTOR" && (
          <div className="hidden px-5 pb-5 lg:block" aria-hidden="true">
            <div className="relative mx-auto flex h-32 w-40 items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full bg-teal-700/40 blur-[1px]" />
              <div className="absolute -left-1 bottom-3 h-10 w-10 rounded-full bg-teal-700/30" />
              <div className="absolute -right-1 top-2 h-11 w-11 rounded-full bg-teal-700/30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-teal-300/50 bg-teal-800/70 text-teal-200 shadow-inner">
                <HeartPulse className="h-10 w-10" strokeWidth={1.4} />
              </div>
            </div>
            <p className="text-center text-xs font-semibold text-teal-200">Better Care</p>
            <p className="mt-1 text-center text-[10px] text-teal-400">For a Healthier Tomorrow</p>
          </div>
        )}
        <div className="p-4 mt-auto border-t border-teal-800/60 flex-shrink-0">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-teal-200 hover:bg-teal-800 transition-colors text-sm font-medium">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        <header className="bg-white border-b border-[#DCE3E0] h-16 flex items-center justify-between px-6 flex-shrink-0">
          <h2 className="text-xl font-semibold text-[#0E4749] capitalize">
            {pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            {role !== "PATIENT" && role !== "DOCTOR" && !pathname.startsWith("/doctor") && (
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-[#5B6472] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" placeholder="Search MRN or name..." className="pl-9 pr-4 py-1.5 border border-[#DCE3E0] rounded-full text-sm w-64 focus:outline-none focus:border-[#0E4749]" />
              </div>
            )}
            <NotificationBell />
          </div>

        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
