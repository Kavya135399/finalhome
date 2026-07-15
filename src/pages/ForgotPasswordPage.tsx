import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast('Reset link sent to your email', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a password reset link.">
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We sent a reset link to <span className="font-semibold text-gray-900 dark:text-gray-100">{email}</span>. Follow the link to reset your password.</p>
          <Link to="/login"><Button variant="outline" fullWidth leftIcon={<ArrowLeft className="w-4 h-4" />}>Back to login</Button></Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Forgot password?" subtitle="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email address" type="email" name="email" placeholder="you@example.com" leftIcon={<Mail className="w-4 h-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" fullWidth size="lg" loading={loading}>Send reset link</Button>
      </form>
      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Remembered your password? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
