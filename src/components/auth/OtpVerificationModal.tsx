import React, { useState, useEffect, useRef } from 'react';
import { Mail, ShieldCheck, RefreshCw, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/apiClient';

interface OtpVerificationModalProps {
  isOpen: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (token?: string, user?: any) => void;
  type?: 'verification' | 'forgot_password';
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  isOpen,
  email,
  onClose,
  onSuccess,
  type = 'verification',
}) => {
  const { verifyEmail } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second Cooldown Timer effect
  useEffect(() => {
    let timer: any;
    if (isOpen && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, cooldown]);

  // Focus first input on open
  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setSuccessMsg('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (type === 'verification') {
        const verifiedUser = await verifyEmail(email, otpCode);
        setSuccessMsg('Email verified successfully!');
        const token = localStorage.getItem('homeseva.token') || localStorage.getItem('token') || undefined;
        setTimeout(() => {
          onSuccess(token, verifiedUser);
        }, 1000);
      } else {
        const data = await apiClient.verifyResetOtp(email, otpCode);
        if (!data.success) {
          throw new Error(data.error || 'Verification failed');
        }
        setSuccessMsg('OTP verified successfully!');
        if (data.token && data.user) {
          localStorage.setItem('homeseva.token', data.token);
          localStorage.setItem('token', data.token);
          localStorage.setItem('homeseva.currentUser', JSON.stringify(data.user));
        }
        setTimeout(() => {
          onSuccess(data.token, data.user);
        }, 1000);
      }
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.error || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await apiClient.resendOtp(email, type);
      if (!data.success) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccessMsg('A new OTP has been sent to your email.');
      setCooldown(60); // Reset 60s cooldown
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Verify OTP Code
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            We sent a 6-digit OTP code to <br />
            <strong className="text-slate-900 dark:text-slate-100 font-semibold">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          {/* 6 Digit OTP Inputs */}
          <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-extrabold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            OTP is valid for <strong>10 minutes</strong>. Max 5 wrong attempts allowed.
          </p>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={otp.join('').length !== 6}>
            Verify Email OTP
          </Button>

          {/* Resend Cooldown Section */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            {cooldown > 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Resend OTP available in <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50"
              >
                {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                <span>Resend OTP Code</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
