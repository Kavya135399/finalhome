import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { OtpVerificationModal } from '../components/auth/OtpVerificationModal';

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const loggedUser = await signIn(email, password);
      toast('Welcome back!', 'success');
      
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'professional') {
        navigate('/pro/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      const errorMsg = err?.message || '';
      const requiresVerif = err?.requiresVerification || err?.response?.data?.requiresVerification || errorMsg.toLowerCase().includes('verify your email');
      
      if (requiresVerif) {
        toast('Please verify your email to continue. We sent an OTP code to your inbox.', 'info');
        setShowOtpModal(true);
      } else {
        toast(errorMsg || 'Login failed', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = (_token?: string, user?: any) => {
    setShowOtpModal(false);
    toast('Email verified successfully! Logging you in...', 'success');
    if (user?.role === 'admin') {
      navigate('/admin');
    } else if (user?.role === 'professional') {
      navigate('/pro/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your bookings and services.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          name="email"
          placeholder="you@example.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Input
          label="Password"
          type={show ? 'text' : 'password'}
          name="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button type="button" onClick={() => setShow(!show)} className="hover:text-gray-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <input type="checkbox" className="rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm text-brand-600 hover:underline">Forgot password?</Link>
        </div>

        <Button type="submit" fullWidth size="lg" loading={loading}>Sign in</Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        New to HomeSeva? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create an account</Link>
      </p>

      {/* OTP Modal */}
      <OtpVerificationModal
        isOpen={showOtpModal}
        email={email}
        onClose={() => setShowOtpModal(false)}
        onSuccess={handleOtpVerified}
        type="verification"
      />
    </AuthLayout>
  );
}
