import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

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

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      await sendOtp({ email, type: 'reset' });
      toast.success('OTP sent! Check your email.');
      setOtpSent(true);
      setCountdown(60);
      setCanResend(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    try {
      await sendOtp({ email, type: 'reset' });
      toast.success('OTP resent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
      setCanResend(true);
      setCountdown(0);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length !== 6) return toast.error('Enter valid 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ email, otp, type: 'reset' });
      navigate('/reset-password', { state: { email, resetToken: data.resetToken } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[var(--color-background)] px-4 py-12">
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>
      
      <div className="w-full max-w-md bg-transparent lg:bg-white lg:p-12 lg:rounded-sm lg:border lg:border-[var(--color-border-light)] lg:shadow-sm">
        
        <div className="text-center mb-10">
          <h1 className="font-heading text-4xl font-bold text-[var(--color-primary)] mb-3 tracking-tight">Recover Password</h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            {!otpSent ? 'Enter your email to receive a password reset OTP.' : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        <form onSubmit={!otpSent ? handleSendOtp : handleVerifyOtp} className="flex flex-col gap-6">
          {!otpSent ? (
            <div className="flex flex-col gap-2 relative">
              <label className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] ml-1">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 bg-white border border-[var(--color-border-main)] rounded-sm font-body text-sm text-[var(--color-text)] transition-colors focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 relative">
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
            {loading ? 'Processing...' : (!otpSent ? 'Send OTP' : 'Verify OTP')}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-[var(--color-border-light)] pt-8">
          {!otpSent ? (
            <p className="font-body text-sm text-[var(--color-text-muted)]">
              Remember it? <Link to="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors">Back to login</Link>
            </p>
          ) : (
            <button 
              type="button" 
              onClick={() => setOtpSent(false)} 
              disabled={loading}
              className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors"
            >
              ← Use a different email
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
