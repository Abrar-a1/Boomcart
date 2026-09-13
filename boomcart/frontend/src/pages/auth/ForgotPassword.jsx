import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';

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
    <AuthLayout>
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>

      <div className="w-full flex flex-col">
        <div className="mb-10 text-center">
          <span className="block font-body text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-3">
            VERIFICATION
          </span>
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-[var(--color-primary)] mb-4 tracking-tight">
            Recover Password
          </h1>
          <p className="font-body text-sm text-[var(--color-text-muted)]">
            {!otpSent ? 'Enter the email address associated with your Boomcart account.' : (
              <span>We've sent a 6-digit verification code to:<br/><strong className="text-[var(--color-primary)] mt-1 inline-block">{email}</strong></span>
            )}
          </p>
        </div>

        <form onSubmit={!otpSent ? handleSendOtp : handleVerifyOtp} className="flex flex-col gap-6">
          {!otpSent ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              inputMode="email"
            />
          ) : (
            <div className="flex flex-col gap-6">
              <Input
                label="6-Digit Code"
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                maxLength={6}
                autoComplete="one-time-code"
                inputMode="numeric"
                className="text-center text-3xl tracking-[0.3em] sm:tracking-[0.5em] font-heading h-16 bg-white"
              />
              <div className="text-center mt-2">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} className="font-body text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-cta)] transition-colors focus-visible:outline underline underline-offset-4">
                    Resend code
                  </button>
                ) : (
                  <p className="text-[var(--color-text-muted)] font-body text-sm">
                    Didn't receive the code? <br className="sm:hidden" />
                    <span className="font-bold ml-1">Resend in {countdown}s</span>
                  </p>
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 h-14 bg-[var(--color-primary)] text-white font-body text-sm font-bold uppercase tracking-[0.15em] rounded-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline shadow-[0_4px_14px_rgba(30,58,58,0.2)]"
          >
            {loading ? 'Processing...' : (!otpSent ? 'Continue' : 'Verify OTP')}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-[var(--color-border-light)] text-center flex flex-col gap-4">
          {!otpSent ? (
            <Link to="/login" className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors inline-block focus-visible:outline">
              ← Back to Sign In
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOtpSent(false)}
              disabled={loading}
              className="font-body text-xs font-bold uppercase tracking-widest text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors focus-visible:outline"
            >
              Use a different email
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
