"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, ChevronRight, AlertCircle, Activity, Shield, Zap } from 'lucide-react';

const DUMMY_USERS = [
  { id: 'admin',     pass: 'admin123',  role: 'ADMIN',        name: 'System Admin' },
  { id: 'doctor',    pass: 'doc123',    role: 'DOCTOR',       name: 'Dr. Sarah Jenkins' },
  { id: 'nurse',     pass: 'nurse123',  role: 'NURSE',        name: 'Nurse Michael Chen' },
  { id: 'reception', pass: 'rec123',    role: 'RECEPTIONIST', name: 'Front Desk' },
  { id: 'patient',   pass: 'pat123',    role: 'PATIENT',      name: 'Robert C. Miller' },
];

const ROLE_COLORS: Record<string, string> = {
  ADMIN:        'bg-purple-500/20 text-purple-500 border-purple-500/30',
  DOCTOR:       'bg-teal-500/20   text-teal-500   border-teal-500/30',
  NURSE:        'bg-blue-500/20   text-blue-500   border-blue-500/30',
  RECEPTIONIST: 'bg-amber-500/20  text-amber-500  border-amber-500/30',
  PATIENT:      'bg-rose-500/20   text-rose-500   border-rose-500/30',
};

export default function Login() {
  const router = useRouter();
  const [userId, setUserId]         = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    const user = DUMMY_USERS.find(u => u.id === userId && u.pass === password);

    if (user) {
      localStorage.setItem('medicore_role', user.role);
      localStorage.setItem('medicore_user', user.name);
      router.push(`/${user.role.toLowerCase()}/dashboard`);
    } else {
      setLoading(false);
      setError('Invalid credentials. Please try again.');
    }
  };

  const fillCredentials = (id: string, pass: string) => {
    setUserId(id);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex font-sans">

      <div className="hidden lg:flex lg:w-[58%] relative overflow-hidden flex-col justify-between p-12">
        <Image
          src="/back.webp"
          alt="Hospital background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0E4749]/85 via-[#0E4749]/60 to-[#0a3335]/80" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">MediCore</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Clinical Precision<br />
              <span className="text-[#E07856]">Platform</span>
            </h1>
            <p className="text-teal-200 mt-3 text-base leading-relaxed max-w-sm">
              Integrated hospital management for staff, doctors, nurses, and patients — all in one secure platform.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-sm">
            {[
              { icon: Shield, label: 'HIPAA Secure' },
              { icon: Zap,    label: 'Real-Time' },
              { icon: Activity, label: 'Live Monitoring' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
                <Icon className="w-5 h-5 text-[#E07856] mx-auto mb-1" />
                <span className="text-white text-xs font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-teal-300 text-xs">© 2026 MediCore HMS. All rights reserved.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-[#F6F7F5] p-6 lg:p-12">
        <div className="w-full max-w-sm">

          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0E4749] rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#0E4749] text-lg">MediCore</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-[#5B6472] text-sm mt-1">Sign in to access your portal</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                Staff / Patient ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={userId}
                  onChange={e => setUserId(e.target.value)}
                  placeholder="e.g. doctor"
                  className="w-full pl-10 pr-4 py-3 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/10 bg-white transition-all text-sm font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider">
                  Password
                </label>
                <button type="button" className="text-xs font-semibold text-[#0E4749] hover:underline">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/10 bg-white transition-all text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-70 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-2 shadow-lg shadow-[#0E4749]/20 hover:shadow-[#0E4749]/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Secure Access <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#DCE3E0]">
            <p className="text-xs font-bold text-[#5B6472] uppercase tracking-wider text-center mb-3">
              Quick Demo Login
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DUMMY_USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillCredentials(u.id, u.pass)}
                  className={`text-left text-xs p-2.5 rounded-lg border transition-all hover:-translate-y-0.5 hover:shadow-sm ${ROLE_COLORS[u.role]}`}
                >
                  <div className="font-bold">{u.role}</div>
                  <div className="font-mono opacity-70 mt-0.5">ID: {u.id}</div>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Need access?{' '}
            <button className="font-semibold text-[#0E4749] hover:underline">Contact IT Support</button>
          </p>
        </div>
      </div>
    </div>
  );
}
