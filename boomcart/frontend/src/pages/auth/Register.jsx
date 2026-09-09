import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';

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
    <AuthLayout>
      <Helmet><title>Create Account — Boomcart</title></Helmet>
      
      <div className="w-full">
        <div className="mb-10">
          <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">
            {!otpSent ? 'Join Us' : 'Verification'}
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">
            {!otpSent ? 'Create Account' : 'Enter OTP'}
          </h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            {!otpSent ? 'Experience modern Indian luxury.' : `Enter the 6-digit code sent to ${form.email}`}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {!otpSent ? (
            <>
              {[
                {n:'name',    l:'Full Name',         t:'text',     p:'John Doe'},
                {n:'email',   l:'Email Address',     t:'email',    p:'you@example.com'},
                {n:'password',l:'Password',          t:'password', p:'Min. 6 characters'},
                {n:'confirm', l:'Confirm Password',  t:'password', p:'Re-enter password'},
              ].map(f => (
                <div key={f.n} className="flex flex-col gap-1 relative">
                  <label className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">{f.l}</label>
                  {f.t === 'password' ? (
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        placeholder={f.p}
                        value={form[f.n]}
                        onChange={e => setForm({...form, [f.n]: e.target.value})}
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
                  ) : (
                    <input 
                      type={f.t}
                      placeholder={f.p}
                      value={form[f.n]}
                      onChange={e => setForm({...form, [f.n]: e.target.value})}
                      required
                      className="w-full py-2 bg-transparent border-b border-[var(--color-border-main)] rounded-none font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-light)]"
                    />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <label className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">6-Digit OTP</label>
              <input 
                type="text" 
                placeholder="Enter OTP from email"
                value={otp} 
                onChange={e => setOtp(e.target.value)} 
                required 
                maxLength={6}
                className="w-full py-3 bg-transparent border-b border-[var(--color-border-main)] rounded-none font-body text-2xl tracking-[0.3em] text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-accent)] placeholder:text-[var(--color-text-light)] placeholder:text-sm placeholder:tracking-normal placeholder:font-normal"
              />
              <div className="mt-2 text-xs">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} className="font-bold text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors focus-visible:outline">
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-[var(--color-text-light)] font-body text-[11px]">Didn't receive code? Resend in {countdown}s</span>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 h-12 bg-[var(--color-primary)] text-white font-body text-xs font-bold uppercase tracking-widest rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline"
          >
            {loading ? 'Processing...' : (!otpSent ? 'Create Account' : 'Verify & Sign In')}
          </button>
        </form>

        <div className="mt-8 pt-8">
          {!otpSent ? (
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
              Already have an account? <Link to="/login" className="text-[var(--color-primary)] underline underline-offset-4 hover:text-[var(--color-accent)] transition-colors">Sign in</Link>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setOtpSent(false)} 
              disabled={loading}
              className="font-body text-[11px] font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline"
            >
              ← Back to registration
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
