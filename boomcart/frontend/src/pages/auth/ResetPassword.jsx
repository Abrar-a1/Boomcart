import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
    <div className="min-h-[85vh] flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <Helmet><title>Reset Password — Boomcart</title></Helmet>
      
      <div className="w-full max-w-md bg-transparent lg:bg-white lg:p-12 lg:rounded-sm lg:border lg:border-[var(--color-border-light)] lg:shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Set New Password</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">Please enter your new password below.</p>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">

          {[
            { n:'password', l:'New Password',     p:'Min. 6 characters', v: password, set: setPassword },
            { n:'confirm',  l:'Confirm Password', p:'Re-enter password', v: confirm, set: setConfirm  },
          ].map(f => (
            <div key={f.n} className="flex flex-col gap-2 relative">
              <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">{f.l}</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  placeholder={f.p}
                  value={f.v}
                  onChange={e => f.set(e.target.value)}
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
          ))}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 h-12 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-8">
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            Remember it? <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
