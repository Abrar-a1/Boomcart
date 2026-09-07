import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
    <div className="min-h-[85vh] flex items-center justify-center bg-[var(--color-background)] px-4">
      <Helmet><title>Login — Boomcart</title></Helmet>
      
      <div className="w-full max-w-md bg-transparent lg:bg-white lg:p-12 lg:rounded-sm lg:border lg:border-[var(--color-border-light)] lg:shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Login</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">Welcome back. Enter your details to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
              className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex flex-col gap-2 relative">
            <div className="flex items-center justify-between ml-1">
              <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)]">Password</label>
              <Link to="/forgot-password" className="font-body text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-cta)] transition-colors">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] pr-12"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 h-12 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-8">
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            Don't have an account? <Link to="/register" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
