import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>
        <p className="auth-subtitle">
          {sent ? 'Check your inbox!' : 'Enter your email to reset your password.'}
        </p>
        {sent ? (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <p style={{ fontSize:48, marginBottom:16 }}>📧</p>
            <p style={{ color:'var(--gray-500)', fontSize:14, lineHeight:1.7 }}>
              We've sent a password reset link to <strong>{email}</strong>.<br/>
              Check your spam folder if you don't see it.
            </p>
            <Link to="/login" className="btn btn-primary btn-block" style={{ marginTop:24 }}>
              Back to Login
            </Link>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <div className="auth-switch" style={{ marginTop:12 }}>
              Remember it? <Link to="/login">Back to login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
