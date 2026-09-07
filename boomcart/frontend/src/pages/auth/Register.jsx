import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const { register, verifyRegistration, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    const result = await register(form.name, form.email, form.password);
    if (!result.success) {
      setCanResend(true);
      setCountdown(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
      if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      const result = await register(form.name, form.email, form.password);
      if (result.success) {
        setOtpSent(true);
        setCountdown(60);
        setCanResend(false);
      }
    } else {
      if (otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
      const result = await verifyRegistration(form.name, form.email, form.password, otp);
      if (result.success) navigate('/');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <Helmet><title>Create Account — Boomcart</title></Helmet>
      
      <div className="w-full max-w-md bg-transparent lg:bg-white lg:p-12 lg:rounded-sm lg:border lg:border-[var(--color-border-light)] lg:shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Create Account</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            {!otpSent ? 'Join Boomcart today.' : `Enter the OTP sent to ${form.email}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {!otpSent ? (
            <>
              {[
                {n:'name',    l:'Full Name',         t:'text',     p:'John Doe'},
                {n:'email',   l:'Email Address',     t:'email',    p:'you@example.com'},
                {n:'password',l:'Password',          t:'password', p:'Min. 6 characters'},
                {n:'confirm', l:'Confirm Password',  t:'password', p:'Re-enter password'},
              ].map(f => (
                <div key={f.n} className="flex flex-col gap-2 relative">
                  <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">{f.l}</label>
                  {f.t === 'password' ? (
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder={f.p}
                        value={form[f.n]}
                        onChange={e => setForm({...form, [f.n]: e.target.value})}
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
                  ) : (
                    <input 
                      type={f.t}
                      placeholder={f.p}
                      value={form[f.n]}
                      onChange={e => setForm({...form, [f.n]: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
                    />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">6-Digit OTP</label>
              <input 
                type="text" 
                placeholder="Enter OTP from email"
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                required 
                maxLength={6}
                className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-lg font-bold tracking-[0.2em] text-center text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <div className="mt-2 text-right text-xs">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} className="font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors">
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-[var(--color-text-light)] font-body text-xs">Didn't receive code? Resend in {countdown}s</span>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 h-12 bg-[var(--color-cta)] text-white font-body text-sm font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Processing...' : (!otpSent ? 'Send OTP' : 'Verify & Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-8">
          {!otpSent ? (
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Already have an account? <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors">Sign in</Link>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setOtpSent(false)} 
              disabled={loading}
              className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors"
            >
              ← Back to registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
