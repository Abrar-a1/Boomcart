import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../services/authService';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiCheckCircle } from 'react-icons/fi';
import './Auth.css';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSendLink = async (e) => {
    if (e) e.preventDefault();
    if (!email) return toast.error('Email is required');
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent! Check your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Forgot Password — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>

        {!sent ? (
          <>
            <p className="auth-subtitle">Enter your email to receive a password reset link.</p>
            <form className="auth-form" onSubmit={handleSendLink}>
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
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <FiCheckCircle size={56} style={{ color: '#22c55e', marginBottom: 16 }} />
            <h2 style={{ color: 'var(--color-primary, #1E3A3A)', fontSize: 20, marginBottom: 8 }}>Check your email!</h2>
            <p style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to set a new password.
            </p>
            <p style={{ color: '#999', fontSize: 13, marginBottom: 24 }}>
              Didn't receive it? Check your spam folder or{' '}
              <button type="button" style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 13 }}
                onClick={() => { setSent(false); }} disabled={loading}>
                try again
              </button>
            </p>
            <div className="auth-switch" style={{ marginTop: 12 }}>
              <Link to="/login">← Back to login</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

