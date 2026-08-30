import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './Auth.css';

export default function ResetPassword() {
  const { token }   = useParams();
  const navigate    = useNavigate();
  const { updateUser } = useAuth();
  const [form, setForm]     = useState({ password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      const { data } = await resetPassword(token, { password: form.password });
      updateUser({ token: data.data.token });
      toast.success('Password reset! You are now logged in.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed — link may have expired');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <Helmet><title>Reset Password — Musaar</title></Helmet>
      <div className="auth-card">
        <h1 className="auth-logo">Musaar</h1>
        <p className="auth-subtitle">Enter your new password below.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { n:'password', l:'New Password',     p:'Min. 6 characters' },
            { n:'confirm',  l:'Confirm Password', p:'Re-enter password'  },
          ].map(f => (
            <div key={f.n} className="form-group">
              <label>{f.l}</label>
              <div className="password-wrapper">
                <input type={showPassword ? 'text' : 'password'} className="form-input" placeholder={f.p}
                  value={form[f.n]} onChange={e => setForm({...form, [f.n]: e.target.value})} required style={{ paddingRight: '40px' }} />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
