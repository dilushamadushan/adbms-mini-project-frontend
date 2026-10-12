"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Lock, Eye, EyeOff, ChevronRight, AlertCircle, Activity, Shield, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/lib/constants';
import { Role } from '@/types';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login({ username: username.trim(), password });
      
      const userRole = (loggedInUser.role?.toUpperCase() || 'PATIENT') as Role;
      const targetRoute = ROUTES[userRole] || `/${userRole.toLowerCase()}/dashboard`;
      
      router.push(targetRoute);
    } catch (err: unknown) {
      setLoading(false);
      let errorMsg = 'Invalid username or password. Please try again.';
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { detail?: string; message?: string } } };
        if (axiosErr.response?.data?.detail) {
          errorMsg = axiosErr.response.data.detail;
        } else if (axiosErr.response?.data?.message) {
          errorMsg = axiosErr.response.data.message;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
    }
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
            <p className="text-[#5B6472] text-sm mt-1">Sign in to access your hospital portal</p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                Username / Staff ID
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
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
                  onChange={(e) => setPassword(e.target.value)}
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
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Secure Access <ChevronRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            Need access?{' '}
            <button className="font-semibold text-[#0E4749] hover:underline">Contact Hospital IT</button>
          </p>
        </div>
      </div>
    </div>
  );
}
