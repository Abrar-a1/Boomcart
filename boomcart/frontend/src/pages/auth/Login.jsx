import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <AuthLayout>
      <Helmet><title>Login — Boomcart</title></Helmet>
      
      <div className="w-full">
        <div className="mb-10">
          <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Welcome Back</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Sign in to Boomcart</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">Enter your details to continue shopping.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          <div className="flex flex-col gap-1">
            <label className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
              className="w-full py-2 bg-transparent border-b border-[var(--color-border-main)] rounded-none font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-light)]"
            />
          </div>

          <div className="flex flex-col gap-1 relative">
            <div className="flex items-center justify-between">
              <label className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Password</label>
              <Link to="/forgot-password" className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                className="w-full py-2 bg-transparent border-b border-[var(--color-border-main)] rounded-none font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-light)] pr-10"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 h-12 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            New to Boomcart? <Link to="/register" className="text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors">Create an account</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
