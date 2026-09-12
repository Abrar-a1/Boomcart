import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) navigate(from, { replace: true });
  };

  return (
    <AuthLayout>
      <Helmet><title>Login — Boomcart</title></Helmet>
      
          <div className="w-full text-center">
            <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-md">login</h1>
            <p className="font-body text-sm text-white/80">Enter your details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-10">
            
            <Input 
              label="Username / Email"
              type="email" 
              placeholder=""
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              required
              variant="glass"
            />

            <div className="flex flex-col gap-4">
              <Input 
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder=""
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                variant="glass"
                rightElement={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-white/70 hover:text-white transition-colors focus-visible:outline"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />
              
              {/* Remember me and Forgot Password row */}
              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded-sm border-white/40 bg-white/10 text-[var(--color-primary)] focus:ring-white/50 transition-colors" />
                  <span className="font-body text-xs text-white/80 group-hover:text-white transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="font-body text-xs text-white/80 hover:text-white transition-colors drop-shadow-sm">Forgot Password?</Link>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-4 font-bold tracking-widest min-h-[52px] bg-white text-[var(--color-primary)] hover:bg-white/90 rounded-md shadow-lg"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-body text-xs text-white/80">
              Don't have an account? <Link to="/register" className="text-white font-bold hover:text-white/80 transition-colors ml-1">Register</Link>
            </p>
          </div>
    </AuthLayout>
  );
}
