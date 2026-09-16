import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';

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
      
      <div className="w-full flex flex-col">
        <div className="mb-10 text-center">
          <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-3">SECURITY</span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-4 tracking-tight">Create New Password</h1>
          <p className="font-body text-sm text-text-muted">Choose a strong password for your Boomcart account.</p>
        </div>

        <form onSubmit={handleResetPassword} className="flex flex-col gap-6">

          {[
            { n:'password', l:'New Password',     p:'Min. 6 characters', v: password, set: setPassword },
            { n:'confirm',  l:'Confirm Password', p:'Re-enter password', v: confirm, set: setConfirm  },
          ].map(f => (
            <Input
              key={f.n}
              label={f.l}
              type={showPassword ? 'text' : 'password'}
              placeholder={f.p}
              value={f.v}
              onChange={e => f.set(e.target.value)}
              required
              rightElement={
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="pr-4 flex items-center justify-center text-text-light hover:text-primary transition-colors focus-visible:outline"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              }
            />
          ))}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 h-14 bg-primary text-white font-body text-sm font-bold uppercase tracking-[0.15em] rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline shadow-[0_4px_14px_rgba(30,58,58,0.2)]"
          >
            {loading ? 'Resetting...' : 'Change Password'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-border-light text-center">
          <Link to="/login" className="font-body text-xs font-bold uppercase tracking-widest text-text-muted hover:text-primary transition-colors inline-block focus-visible:outline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
