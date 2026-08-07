import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, Home, Wrench, ShieldCheck, RefreshCw, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import type { Role } from '../types';

export function RegisterPage() {
  const { signUp, verifyEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Registration step: 'form' | 'verify'
  const [step, setStep] = useState<'form' | 'verify'>('form');

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [showPwd, setShowPwd] = useState(false);

  // Verification & OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 60-second Resend Cooldown Timer effect for step === 'verify'
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Focus first OTP input box when entering verify step
  useEffect(() => {
    if (step === 'verify') {
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  }, [step]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required';
    if (!email.trim()) e.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // STEP 1: Submit Registration Details -> Generate & Send Email OTP
  const handleRegisterSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);
    try {
      const res = await signUp(name, email, password, role, mobile);
      if (res?.requiresVerification) {
        toast('Verification OTP sent! Please check your email inbox.', 'info');
        setStep('verify');
        setCooldown(60);
      }
    } catch (err: any) {
      const msg = err.message || 'Registration failed. Please try again.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify 6-Digit OTP Code
  const handleVerifyOtpSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await verifyEmail(email, otpCode);
      toast('Email verified successfully! Registration complete.', 'success');
      
      setTimeout(() => {
        if (user?.role === 'admin') {
          navigate('/admin');
        } else if (user?.role === 'professional') {
          navigate('/pro/dashboard');
        } else {
          navigate('/');
        }
      }, 600);
    } catch (err: any) {
      const msg = err.message || 'Invalid or expired OTP. Please try again.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler in Step 2
  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');

    try {
      await apiClient.resendOtp(email, 'verification');
      toast('A new OTP has been sent! Please check your email inbox.', 'success');
      setCooldown(60); // Reset 60s cooldown
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Failed to resend OTP.';
      setError(msg);
      toast(msg, 'error');
    } finally {
      setResending(false);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  return (
    <AuthLayout
      title={step === 'form' ? 'Create your account' : 'Verify Email OTP'}
      subtitle={
        step === 'form'
          ? 'Join Bhale Padharya to book trusted home services.'
          : `We sent a 6-digit verification code to ${email}`
      }
    >
      {error && (
        <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Registration Form */}
      {step === 'form' && (
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I want to</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`p-4 rounded-xl border text-left transition ${role === 'customer' ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
              >
                <Home className={`w-5 h-5 mb-2 ${role === 'customer' ? 'text-brand-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">Book services</p>
                <p className="text-xs text-gray-500">As a customer</p>
              </button>
              <button
                type="button"
                onClick={() => setRole('professional')}
                className={`p-4 rounded-xl border text-left transition ${role === 'professional' ? 'border-brand-600 bg-brand-50 dark:bg-brand-950/40' : 'border-gray-200 dark:border-slate-700 hover:border-gray-300'}`}
              >
                <Wrench className={`w-5 h-5 mb-2 ${role === 'professional' ? 'text-brand-600' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">Offer services</p>
                <p className="text-xs text-gray-500">As a professional</p>
              </button>
            </div>
          </div>

          <Input
            label="Full name"
            name="name"
            placeholder="John Doe"
            leftIcon={<User className="w-4 h-4" />}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(''); }}
            error={errors.name}
          />
          <Input
            label="Email address"
            type="email"
            name="email"
            placeholder="you@example.com"
            leftIcon={<Mail className="w-4 h-4" />}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={errors.email}
          />
          <Input
            label="Mobile number (optional)"
            type="tel"
            name="mobile"
            placeholder="+91 98765 43210"
            leftIcon={<Phone className="w-4 h-4" />}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={<button type="button" onClick={() => setShowPwd(!showPwd)}>{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            error={errors.password}
            hint="Minimum 6 characters"
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send Verification OTP
          </Button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </form>
      )}

      {/* STEP 2: In-Page 6-Digit OTP Verification Form */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyOtpSubmit} className="space-y-6 animate-in fade-in">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 text-center">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
              Enter the 6-digit OTP code sent to:
            </p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono mt-0.5 break-all">
              {email}
            </p>
            <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-2 font-medium">
              📩 Check your email inbox. If you don't see it, please check your <strong>Spam / Junk</strong> folder.
            </p>
          </div>

          {/* 6 Digit Inputs */}
          <div className="flex items-center justify-between gap-2 sm:gap-3" onPaste={handleOtpPaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (otpInputRefs.current[idx] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-extrabold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            ))}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            OTP is valid for <strong>10 minutes</strong>. Maximum 5 attempts allowed.
          </p>

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={otp.join('').length !== 6}>
            Verify OTP & Complete Registration
          </Button>

          {/* Resend Cooldown Section */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setStep('form'); setError(''); }}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Change Email
            </button>

            {cooldown > 0 ? (
              <span className="text-slate-500 dark:text-slate-400">
                Resend OTP in <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resend OTP Code
              </button>
            )}
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
