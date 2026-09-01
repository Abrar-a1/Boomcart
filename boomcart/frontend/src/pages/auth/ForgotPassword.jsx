import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      await forgotPassword({ email });
      setStep(2);
      toast.success('OTP sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('OTP is required');
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await resetPassword({ email, otp, password });
      updateUser({ token: data.data.token });
      toast.success('Password reset! You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — OTP may be invalid or expired');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>
        <p className="auth-subtitle">
          {step === 1 ? 'Enter your email to receive an OTP.' : 'Enter the OTP and your new password.'}
        </p>

        {step === 1 ? (
          <form className="auth-form" onSubmit={handleSendOTP}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </button>
            <div className="auth-switch" style={{ marginTop:12 }}>
              Remember it? <Link to="/login">Back to login</Link>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>OTP</label>
              <input type="text" className="form-input" placeholder="Enter 6-digit OTP"
                value={otp} onChange={e => setOtp(e.target.value)} required />
            </div>
            
            {[
              { n:'password', l:'New Password',     p:'Min. 6 characters', v: password, set: setPassword },
              { n:'confirm',  l:'Confirm Password', p:'Re-enter password', v: confirm, set: setConfirm  },
            ].map(f => (
              <div key={f.n} className="form-group">
                <label>{f.l}</label>
                <div className="password-wrapper">
                  <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder={f.p}
                    value={f.v} onChange={e => f.set(e.target.value)} required style={{ paddingRight: '40px' }} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
            ))}
            
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
            
            <div className="auth-switch" style={{ marginTop:12 }}>
              Didn't receive OTP? <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0 }} onClick={handleSendOTP} disabled={loading}>Resend</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
