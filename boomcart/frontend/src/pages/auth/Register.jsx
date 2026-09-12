import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import AuthLayout from '../../layouts/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

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
    <AuthLayout>
      <Helmet><title>Create Account — Boomcart</title></Helmet>
      
      <div className="w-full">
        <div className="w-full text-center mb-10">
          <h1 className="font-heading text-4xl lg:text-5xl font-bold text-white mb-3 drop-shadow-md">Register</h1>
          <p className="font-body text-sm text-white/80">Experience modern Indian luxury.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 mt-10">
          {!otpSent ? (
            <>
              <Input 
                label="Full Name"
                type="text" 
                placeholder=""
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                variant="glass"
              />

              <Input 
                label="Email Address"
                type="email" 
                placeholder=""
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
                variant="glass"
              />

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
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />

              <Input 
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder=""
                value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                required
                variant="glass"
                rightElement={
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-white/70 hover:text-white transition-colors focus-visible:outline"
                  >
                    {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                }
              />
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Input 
                label="Verification Code (OTP)"
                type="text" 
                placeholder="Enter 6-digit code"
                value={form.otp}
                onChange={e => setForm({...form, otp: e.target.value})}
                required
                variant="glass"
                className="text-center tracking-[0.5em] text-lg font-bold"
                maxLength={6}
              />
              <div className="mt-1 text-xs text-center">
                {canResend ? (
                  <button type="button" onClick={handleResend} disabled={loading} className="font-bold text-white hover:text-white/80 transition-colors focus-visible:outline">
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-white/70 font-body text-[11px]">Didn't receive code? Resend in {countdown}s</span>
                )}
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            isLoading={loading}
            className="w-full mt-4 font-bold tracking-widest min-h-[52px] bg-white text-[var(--color-primary)] hover:bg-white/90 rounded-md shadow-lg"
          >
            {loading ? 'Creating...' : (!otpSent ? 'Create Account' : 'Verify & Register')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          {!otpSent ? (
            <p className="font-body text-xs text-white/80">
              Already have an account? <Link to="/login" className="text-white font-bold hover:text-white/80 transition-colors ml-1">Sign in</Link>
            </p>
          ) : (
            <button 
              type="button"
              onClick={() => setOtpSent(false)}
              disabled={loading}
              className="font-body text-[11px] font-bold uppercase tracking-[0.1em] text-white/80 hover:text-white transition-colors"
            >
              Back to Registration
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
