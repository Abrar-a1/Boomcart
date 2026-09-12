import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!email || !resetToken) return toast.error('Invalid reset request. Please restart process.');
    setLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword: password });
      toast.success('Password reset! Please log in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — token may be invalid or expired');
    } finally { setLoading(false); }
  };

  return (
    <AuthLayout>
      <Helmet><title>Reset Password — Boomcart</title></Helmet>
      
      <div className="w-full">
        <div className="mb-10">
          <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">Security</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Set New Password</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-8">

          {[
            { n:'password', l:'New Password',     p:'Min. 6 characters', v: password, set: setPassword },
            { n:'confirm',  l:'Confirm Password', p:'Re-enter password', v: confirm, set: setConfirm  },
          ].map(f => (
            <div key={f.n} className="flex flex-col gap-1 relative">
              <label className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder={f.p}
                  value={f.v}
                  onChange={e => f.set(e.target.value)}
                  required
                  className="w-full py-2 bg-transparent border-b border-[var(--color-border-light)] rounded-none font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-light)] pr-10"
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
          ))}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 h-12 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 pt-8">
          <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
            Remember it? <Link to="/login" className="text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors">Back to login</Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
