import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Home, Wrench } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';

export function RegisterPage() {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name) e.name = 'Name is required';
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
      await signUp(name, email, password, role);
      toast('Account created! Please check your email to verify.', 'success');
      navigate('/login');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join HomeSeva to book trusted home services.">
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Input label="Full name" name="name" placeholder="John Doe" leftIcon={<User className="w-4 h-4" />} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input label="Email address" type="email" name="email" placeholder="you@example.com" leftIcon={<Mail className="w-4 h-4" />} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Input
          label="Password"
          type={show ? 'text' : 'password'}
          name="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={<button type="button" onClick={() => setShow(!show)}>{show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint="Minimum 6 characters"
        />

        <Button type="submit" fullWidth size="lg" loading={loading}>Create account</Button>
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        Already have an account? <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
