import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

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
    <div className="auth-page">
      <Helmet><title>Create Account — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>
        <p className="auth-subtitle">
          {!otpSent ? 'Create your free account today.' : `Enter the OTP sent to ${form.email}`}
        </p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {!otpSent ? (
            <>
              {[
                {n:'name',    l:'Full Name',         t:'text',     p:'John Doe'},
                {n:'email',   l:'Email Address',     t:'email',    p:'you@example.com'},
                {n:'password',l:'Password',          t:'password', p:'Min. 6 characters'},
                {n:'confirm', l:'Confirm Password',  t:'password', p:'Re-enter password'},
              ].map(f => (
                <div key={f.n} className="form-group">
                  <label>{f.l}</label>
                  {f.t === 'password' ? (
                    <div className="password-wrapper">
                      <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder={f.p}
                        value={form[f.n]} onChange={e => setForm({...form, [f.n]: e.target.value})} required style={{ paddingRight: '40px' }} />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  ) : (
                    <input type={f.t} className="form-input" placeholder={f.p}
                      value={form[f.n]} onChange={e => setForm({...form, [f.n]: e.target.value})} required />
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="form-group">
              <label>6-Digit OTP</label>
              <input type="text" className="form-input" placeholder="Enter OTP from email"
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
          <button className="btn btn-primary btn-block btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? 'Processing…' : (!otpSent ? 'Send OTP' : 'Verify & Create Account')}
          </button>
        </form>
        <div className="auth-switch" style={{ marginTop: 20 }}>
          {!otpSent ? (
            <>Already have an account? <Link to="/login">Sign in</Link></>
          ) : (
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 13 }}
                onClick={() => setOtpSent(false)} disabled={loading}>
                ← Back to registration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
