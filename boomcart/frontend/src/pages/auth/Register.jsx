import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register(form.name, form.email, form.password);
    if (result.success) navigate('/');
  };

  return (
    <div className="auth-page">
      <Helmet><title>Create Account — Boomcart</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Boomcart</h1>
        <p className="auth-subtitle">Create your free account today.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
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
          <button className="btn btn-primary btn-block btn-lg auth-submit" type="submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <div className="auth-switch" style={{ marginTop: 20 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
