import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
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
        navigate('/dashboard');
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Login failed', 'error');
    } finally {
      setLoading(false);
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

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-800" /></div>
        <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-slate-900 text-xs text-gray-400">or continue with</span></div>
      </div>

      <Button variant="outline" fullWidth size="lg" onClick={() => toast('Google sign-in is a placeholder in this demo', 'info')}>
        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
        Google
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
        New to HomeSeva? <Link to="/register" className="text-brand-600 font-semibold hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
