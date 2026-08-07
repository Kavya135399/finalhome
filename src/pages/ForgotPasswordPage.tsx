import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, ShieldCheck, Lock, Eye, EyeOff, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../services/apiClient';

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'otp' | 'new_password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input when step changes to 'otp'
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // 60-second Cooldown timer for resend button in step 2
  useEffect(() => {
    let timer: any;
    if (step === 'otp' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Step 1: Send OTP to Email
  const handleRequestOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }

    setError('');
    setLoading(true);
    try {
      const data = await apiClient.forgotPassword(email);
      toast(data.message || 'Password reset OTP sent to your email', 'success');
      setStep('otp');
      setCooldown(60);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to send OTP';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP Code
  const handleVerifyOtp = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await apiClient.verifyResetOtp(email, otpCode);
      toast(data.message || 'OTP verified successfully!', 'success');
      setStep('new_password');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Invalid or expired OTP';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    try {
      const data = await apiClient.resendOtp(email, 'forgot_password');
      toast(data.message || 'A new OTP has been sent to your email', 'success');
      setCooldown(60);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to resend OTP';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  // Step 3: Reset Password with new password
  const handleResetPassword = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const otpCode = otp.join('');
      const data = await apiClient.resetPassword(email, otpCode, newPassword);
      toast(data.message || 'Password reset successfully!', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to reset password';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (val && index < 5) {
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
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').trim();
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <AuthLayout
      title={step === 'email' ? 'Forgot password?' : step === 'otp' ? 'Enter Reset OTP' : 'Create New Password'}
      subtitle={
        step === 'email'
          ? "Enter your email address and we'll send a 6-digit OTP code."
          : step === 'otp'
          ? `Verification OTP sent to ${email}`
          : 'Set a strong password for your Bhale Padharya account.'
      }
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Enter Registered Email */}
      {step === 'email' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send Reset OTP Code
          </Button>
        </form>
      )}

      {/* STEP 2: Enter 6-digit OTP Code */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-extrabold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            OTP expires in <strong>10 minutes</strong>. Max 5 attempts allowed.
          </p>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={otp.join('').length !== 6}>
            Verify OTP Code
          </Button>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            {cooldown > 0 ? (
              <p className="text-xs text-slate-500">
                Resend OTP available in <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cooldown}s</span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resend OTP Code</span>
              </button>
            )}
          </div>
        </form>
      )}

      {/* STEP 3: Enter New Password */}
      {step === 'new_password' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New password"
            type={showPwd ? 'text' : 'password'}
            name="newPassword"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={<button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
            hint="Minimum 6 characters"
          />

          <Input
            label="Confirm new password"
            type={showPwd ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Update & Reset Password
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Remembered your password? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
