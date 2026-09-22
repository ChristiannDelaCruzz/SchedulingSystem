// src/pages/Login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import Input from '../../components/ui/Input/Input';
import Logo from '../../components/ui/Logo/Logo';
import ProductPreview from './components/ProductPreview';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('admin123');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!email.trim()) next.email = 'Email address is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = 'Please enter a valid email address';
    }
    if (!password) next.password = 'Password is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      showToast('success', 'Welcome back!', 'Your workspace is ready.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to sign in.';
      setErrors((prev) => ({ ...prev, form: message }));
      showToast('error', 'Sign in failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const busy = isSubmitting || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex flex-col">
      {/* ─── Top navigation ─── */}
      <nav className="w-full px-6 sm:px-10 lg:px-16 py-5 flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-slate-500">New here?</span>
          <button
            type="button"
            onClick={() =>
              showToast(
                'info',
                'Enrollment',
                'Enrollment is available from the dashboard after sign-in.'
              )
            }
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-navy to-navy-dark rounded-xl shadow-md shadow-navy/20 hover:shadow-lg hover:shadow-navy/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            Create account
          </button>
        </div>
      </nav>

      {/* ─── Main ─── */}
      <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-16 py-8">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ───── LEFT — Product preview (swapped) ───── */}
          <div className="hidden lg:block">
            <ProductPreview />
          </div>

          {/* ───── RIGHT — Login form (swapped) ───── */}
          <div className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-bold rounded-full mb-5 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              WORKSPACE ACCESS
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h1>
            <p className="mt-3 text-slate-500 text-lg">
              Sign in to continue managing your schedule.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 mt-8">
              <Input
                label={
                  <>
                    Email address <span className="text-red-500">*</span>
                  </>
                }
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                }}
                error={errors.email}
                placeholder="Enter your email address"
                autoComplete="email"
                disabled={busy}
                icon={<Mail className="w-4 h-4" />}
              />

              <Input
                label={
                  <>
                    Password <span className="text-red-500">*</span>
                  </>
                }
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={busy}
                icon={<Lock className="w-4 h-4" />}
              />

              {/* Options */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 text-sm text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-navy focus:ring-cyan focus:ring-offset-0 transition"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={() =>
                    showToast(
                      'info',
                      'Password reset',
                      'Contact your administrator to reset your password.'
                    )
                  }
                  className="text-sm font-semibold text-navy hover:text-cyan transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="group w-full py-3.5 bg-gradient-to-r from-navy to-navy-dark hover:from-navy-dark hover:to-navy text-white text-sm font-bold rounded-xl shadow-lg shadow-navy/20 hover:shadow-xl hover:shadow-navy/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              {errors.form && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errors.form}</span>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 text-xs text-slate-400 font-medium">
                  Demo accounts
                </span>
              </div>
            </div>

            {/* Demo accounts */}
            <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <p>
                <span className="text-slate-400">admin   </span> admin@test.com / admin123
              </p>
              <p>
                <span className="text-slate-400">prof    </span> prof@test.com / prof123
              </p>
              <p>
                <span className="text-slate-400">student </span> student@test.com / student123
              </p>
              <p>
                <span className="text-slate-400">staff   </span> staff@test.com / staff123
              </p>
              <p>
                <span className="text-slate-400">super   </span> super@test.com / super123
              </p>
            </div>

            {/* Mobile preview (shown on small screens) */}
            <div className="mt-12 lg:hidden">
              <ProductPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;