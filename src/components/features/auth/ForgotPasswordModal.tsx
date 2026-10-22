"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  X,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { authService } from '@/services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess?: (email: string) => void;
}

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resend cooldown timer in seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  // Input refs for 6-digit OTP fields
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset state when opened or closed
  useEffect(() => {
    if (isOpen) {
      setStep('EMAIL');
      setEmail(initialEmail);
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);
      setResendCooldown(0);
    }
  }, [isOpen, initialEmail]);

  // Handle countdown for resend button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const extractErrorMessage = (err: unknown, fallback: string): string => {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as {
        response?: { data?: { detail?: string | Array<{ msg: string }>; message?: string } };
      };
      const detail = axiosErr.response?.data?.detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
      if (axiosErr.response?.data?.message) return axiosErr.response.data.message;
    } else if (err instanceof Error) {
      return err.message;
    }
    return fallback;
  };

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your email address');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await authService.forgotPassword(cleanEmail);
      setSuccessMsg(res.message || 'Verification code sent to your email.');
      setStep('OTP');
      setResendCooldown(60); // 60s cooldown for resending
      // Focus first OTP input on next tick
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to send verification code. Please check your email.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP Digits change
  const handleOtpChange = (index: number, value: string) => {
    // If multiple characters pasted (e.g. from clipboard into one input)
    if (value.length > 1) {
      const cleanChars = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      cleanChars.forEach((ch, i) => {
        if (i < 6) newDigits[i] = ch;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(cleanChars.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);

    // Auto-advance to next input if filled
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pastedData[i] || '';
    }
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusTarget]?.focus();
  };

  const fullOtp = otpDigits.join('');

  // Step 2 Submit: Verify OTP
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullOtp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await authService.verifyOtp(email.trim(), fullOtp);
      if (res.valid) {
        setSuccessMsg(res.message || 'OTP verified. Now choose a new password.');
        setStep('PASSWORD');
      } else {
        setError(res.message || 'Invalid verification code');
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Invalid or expired verification code'));
    } finally {
      setLoading(false);
    }
  };

  // Step 3 Submit: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword({
        email: email.trim(),
        otp: fullOtp,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMsg(res.message || 'Password has been successfully reset.');
      setStep('SUCCESS');
      if (onSuccess) {
        onSuccess(email.trim());
      }
    } catch (err: unknown) {
      setError(extractErrorMessage(err, 'Failed to reset password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DCE3E0] overflow-hidden transition-all transform scale-100">
        {/* Header Bar */}
        <div className="bg-[#0E4749] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <KeyRound className="w-5 h-5 text-[#E07856]" />
            </div>
            <div>
              <h3 id="forgot-password-title" className="text-lg font-bold leading-tight">
                {step === 'EMAIL' && 'Reset Password'}
                {step === 'OTP' && 'Verify Code'}
                {step === 'PASSWORD' && 'Set New Password'}
                {step === 'SUCCESS' && 'Password Updated'}
              </h3>
              <p className="text-teal-200 text-xs">
                {step === 'EMAIL' && 'Step 1 of 3: Identify Account'}
                {step === 'OTP' && 'Step 2 of 3: Verify Identity'}
                {step === 'PASSWORD' && 'Step 3 of 3: New Credentials'}
                {step === 'SUCCESS' && 'Success'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close dialog"
            className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        {step !== 'SUCCESS' && (
          <div className="w-full bg-[#E8EEEC] h-1.5 flex">
            <div
              className="bg-[#E07856] h-full transition-all duration-300"
              style={{
                width: step === 'EMAIL' ? '33.3%' : step === 'OTP' ? '66.6%' : '100%',
              }}
            />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span className="flex-1 text-xs leading-relaxed">{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'EMAIL' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-sm text-[#5B6472]">
                Enter your registered hospital account email address. We&apos;ll send you a 6-digit verification code valid for 10 minutes.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@hospital.org"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-3 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/10 bg-white text-sm"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-70 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0E4749]/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      Send Verification Code <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-semibold text-[#5B6472] hover:text-gray-900 transition-colors"
                >
                  Cancel and Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'OTP' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#5B6472]">
                  We sent a 6-digit code to{' '}
                  <span className="font-semibold text-gray-900">{email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('EMAIL');
                  }}
                  className="mt-1 text-xs text-[#0E4749] hover:underline flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-3 h-3" /> Change email address
                </button>
              </div>

              {/* 6-box OTP entry */}
              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-2 text-center">
                  6-Digit Verification Code
                </label>
                <div className="flex justify-between gap-2 max-w-xs mx-auto">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="w-11 h-13 text-center text-xl font-bold font-mono border-2 border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/15 bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* Resend OTP button */}
              <div className="text-center pt-1">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-[#5B6472]">
                    Resend code available in{' '}
                    <span className="font-semibold text-gray-800">{resendCooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRequestOtp()}
                    disabled={loading}
                    className="text-xs font-semibold text-[#0E4749] hover:text-[#0a3335] hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Didn&apos;t receive code? Resend
                  </button>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || fullOtp.length !== 6}
                  className="w-full bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0E4749]/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      Verify & Continue <ChevronRight className="w-4 h-4" />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep('EMAIL');
                  }}
                  disabled={loading}
                  className="w-full py-2 text-xs font-semibold text-[#5B6472] hover:text-gray-900 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Set New Password */}
          {step === 'PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-[#5B6472]">
                Code verified for <span className="font-semibold text-gray-900">{email}</span>. Please choose a strong new password.
              </p>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoFocus
                    className="w-full pl-10 pr-11 py-3 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/10 bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#5B6472] uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-11 py-3 border border-[#DCE3E0] rounded-xl focus:outline-none focus:border-[#0E4749] focus:ring-2 focus:ring-[#0E4749]/10 bg-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Helper */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      newPassword.length >= 6
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </span>
                  <span className={newPassword.length >= 6 ? 'text-emerald-800 font-medium' : 'text-[#5B6472]'}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      newPassword && newPassword === confirmPassword
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={
                      newPassword && newPassword === confirmPassword
                        ? 'text-emerald-800 font-medium'
                        : 'text-[#5B6472]'
                    }
                  >
                    Passwords match
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                  className="w-full bg-[#0E4749] hover:bg-[#0a3335] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0E4749]/20"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting Password...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4" /> Reset Password Now
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: Success View */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-gray-900">Password Reset Successfully!</h4>
                <p className="text-sm text-[#5B6472] mt-2 max-w-xs mx-auto">
                  {successMsg ||
                    'Your password has been changed. For security, all active sessions have been signed out.'}
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#0E4749] hover:bg-[#0a3335] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md shadow-[#0E4749]/20 flex items-center justify-center gap-2"
                >
                  Sign In with New Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
