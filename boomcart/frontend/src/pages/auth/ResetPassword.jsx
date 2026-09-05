import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (!email) return toast.error('Email is required');
    if (!otp || otp.length !== 6) return toast.error('Please enter a valid 6-digit OTP');
    setLoading(true);
    try {
      const { data } = await resetPassword({ email, otp, password });
      updateUser({ token: data.data.token });
      toast.success('Password reset! You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may be invalid or expired');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Reset Password — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>
        <p className="auth-subtitle">Enter your email, the 6-digit OTP, and new password below.</p>

        <form className="auth-form" onSubmit={handleResetPassword}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>6-Digit OTP</label>
            <input type="text" className="form-input" placeholder="Enter OTP from email"
              value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} style={{ letterSpacing: '2px', fontWeight: 'bold' }} />
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

          <div className="auth-switch" style={{ marginTop: 12 }}>
            Remember it? <Link to="/login">Back to login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
