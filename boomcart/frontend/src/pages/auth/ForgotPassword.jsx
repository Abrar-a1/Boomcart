import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

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
    <div className="auth-page">
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>

        <p className="auth-subtitle">
          {!otpSent ? 'Enter your email to receive a password reset OTP.' : `Enter the OTP sent to ${email}`}
        </p>
        <form className="auth-form" onSubmit={!otpSent ? handleSendOtp : handleVerifyOtp}>
          {!otpSent ? (
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          ) : (
            <div className="form-group">
              <label>6-Digit OTP</label>
              <input type="text" className="form-input" placeholder="Enter OTP"
                value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
              <div style={{ marginTop: 8, fontSize: 13, textAlign: 'right' }}>
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} style={{ background:'none', border:'none', color:'var(--color-primary)', cursor:'pointer', fontWeight:'bold', padding:0 }}>
                    Resend OTP
                  </button>
                ) : (
                  <span style={{ color: '#888' }}>Didn't receive code? Resend in {countdown}s</span>
                )}
              </div>
            </div>
          )}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Processing…' : (!otpSent ? 'Send OTP' : 'Verify OTP')}
          </button>
          <div className="auth-switch" style={{ marginTop:12 }}>
            {!otpSent ? (
              <>Remember it? <Link to="/login">Back to login</Link></>
            ) : (
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 13 }}
                  onClick={() => setOtpSent(false)} disabled={loading}>
                  ← Use a different email
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

