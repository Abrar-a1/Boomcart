import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email:'', password:'' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <Helmet><title>Login — Musaar</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Musaar</h1>
        <p className="auth-subtitle">Welcome back! Sign in to continue.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" className="form-input" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder="••••••••" value={form.password}
                onChange={e => setForm({...form, password:e.target.value})} required style={{ paddingRight: '40px' }} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          <button className="btn btn-primary btn-block btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{ textAlign: 'right', marginTop: '16px', marginBottom: '8px' }}>
          <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--color-text-muted, #6b7c6e)', padding: '8px 4px', display: 'inline-block', fontWeight: '500', transition: 'color 0.2s' }}>Forgot password?</Link>
        </div>
        <div className="auth-switch" style={{ marginTop:20 }}>
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
