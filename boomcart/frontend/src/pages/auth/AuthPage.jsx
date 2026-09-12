import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock } from 'react-icons/fi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyRegistration, loading } = useAuth();
  const from = location.state?.from || '/';

  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);

  // Register state
  const [regForm, setRegForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showRegPw, setShowRegPw] = useState(false);
  const [showConfPw, setShowConfPw] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // OTP countdown
  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Sync URL silently (without re-rendering the component)
  useEffect(() => {
    const newPath = isLogin ? '/login' : '/register';
    if (location.pathname !== newPath) {
      window.history.replaceState(null, '', newPath);
    }
  }, [isLogin]);

  const toggleMode = () => {
    setIsLogin(prev => !prev);
  };

  // Login submit
  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) navigate(from, { replace: true });
  };

  // Register submit
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpSent) {
      if (regForm.password !== regForm.confirm) { toast.error('Passwords do not match'); return; }
      if (regForm.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
      const result = await register(regForm.name, regForm.email, regForm.password);
      if (result.success) { setOtpSent(true); setCountdown(60); setCanResend(false); }
    } else {
      if (otp.length !== 6) { toast.error('Please enter a valid 6-digit OTP'); return; }
      const result = await verifyRegistration(regForm.name, regForm.email, regForm.password, otp);
      if (result.success) navigate('/');
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setCountdown(60);
    const result = await register(regForm.name, regForm.email, regForm.password);
    if (!result.success) { setCanResend(true); setCountdown(0); }
  };

  /* ─────────────────────────────────────────────────────────────
   *  LAYOUT EXPLANATION
   *  
   *  ┌─────────────────────────────────────────────────────────┐
   *  │              900px  auth-container                       │
   *  │  ┌──────────────────┬──────────────────┐                │
   *  │  │   LEFT  50%      │   RIGHT  50%     │                │
   *  │  │                  │                  │                │
   *  │  │  Login Form      │  Register Form   │                │
   *  │  │  (always here)   │  (always here)   │                │
   *  │  │                  │                  │                │
   *  │  └──────────────────┴──────────────────┘                │
   *  │       ┌───────────────────┐                             │
   *  │       │  Welcome Panel    │ ← slides between            │
   *  │       │  (absolute, z-20) │   left ↔ right              │
   *  │       └───────────────────┘                             │
   *  └─────────────────────────────────────────────────────────┘
   *
   *  Login mode:   Panel sits on RIGHT  → covers Register form
   *  Register mode: Panel slides to LEFT → covers Login form
   * ───────────────────────────────────────────────────────────── */

  return (
    <>
      <Helmet><title>{isLogin ? 'Login' : 'Create Account'} — Boomcart</title></Helmet>
      
      <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center p-4 sm:p-8"
           style={{ backgroundColor: 'var(--color-background)' }}>

        {/* ── Main Container ── */}
        <div className="w-full max-w-[800px] min-h-[540px] bg-[#2A2B2D] rounded-xl shadow-[0_0_20px_rgba(194,90,60,0.4)] relative overflow-hidden animate-smooth-reveal border border-[var(--color-cta)]/50">

          {/* ── Form Layer (behind the welcome panel) ── */}
          <div className="flex w-full min-h-[540px] relative">

            {/* ═══ LEFT HALF: Login Form ═══ */}
            <div className={`w-full lg:w-1/2 absolute lg:relative inset-0 lg:inset-auto flex items-center justify-center p-6 sm:p-8 lg:p-10 transition-opacity duration-700 ${isLogin ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
              <div 
                className="w-full max-w-[340px] transition-all duration-700 ease-in-out"
                style={{
                  opacity: isLogin ? 1 : 0,
                  transform: isLogin ? 'translateX(0)' : 'translateX(-30px)',
                  filter: isLogin ? 'blur(0)' : 'blur(6px)',
                  pointerEvents: isLogin ? 'auto' : 'none',
                }}
              >
                <h1 className="font-heading text-4xl font-bold text-white mb-2 text-center">Login</h1>
                <p className="font-body text-sm text-white/70 text-center mb-8">Welcome back! Enter your credentials.</p>

                <form onSubmit={handleLogin} className="flex flex-col gap-6 mt-8">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={e => setLoginForm({...loginForm, email: e.target.value})}
                    required
                    variant="slider"
                    rightElement={<FiMail size={16} className="text-white/40" />}
                  />
                  <Input
                    label="Password"
                    type={showLoginPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                    required
                    variant="slider"
                    rightElement={
                      <div className="flex gap-3 text-white/40">
                        <button type="button" onClick={() => setShowLoginPw(!showLoginPw)}
                          className="hover:text-white transition-colors">
                          {showLoginPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                        </button>
                        <FiLock size={16} />
                      </div>
                    }
                  />
                  
                  <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded-sm border-white/40 bg-white/10 accent-[var(--color-cta)]" />
                      <span className="font-body text-xs text-white/70">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="font-body text-xs text-white/70 hover:text-white transition-colors">
                      Forgot Password?
                    </Link>
                  </div>

                  <Button type="submit" variant="primary" size="md" isLoading={loading}
                    className="w-full mt-6 font-medium bg-gradient-to-b from-[#e76f51] to-[#c25a3c] text-white rounded-full shadow-[0_4px_14px_0_rgba(194,90,60,0.39)] border-none min-h-[44px]">
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                {/* Mobile toggle */}
                <div className="mt-8 pt-6 border-t border-white/10 lg:hidden text-center">
                  <p className="font-body text-xs text-white/70 mb-4">Don't have an account?</p>
                  <Button type="button" onClick={toggleMode} size="sm" 
                    className="w-full border border-white/30 text-white bg-transparent hover:bg-white/10 transition-colors uppercase tracking-widest font-bold">
                    Register
                  </Button>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT HALF: Register Form ═══ */}
            <div className={`w-full lg:w-1/2 absolute lg:relative inset-0 lg:inset-auto flex items-center justify-center p-6 sm:p-8 lg:p-10 transition-opacity duration-700 ${!isLogin ? 'z-10 opacity-100' : 'z-0 opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
              <div 
                className="w-full max-w-[340px] transition-all duration-700 ease-in-out"
                style={{
                  opacity: !isLogin ? 1 : 0,
                  transform: !isLogin ? 'translateX(0)' : 'translateX(30px)',
                  filter: !isLogin ? 'blur(0)' : 'blur(6px)',
                  pointerEvents: !isLogin ? 'auto' : 'none',
                }}
              >
                <h1 className="font-heading text-4xl font-bold text-white mb-2 text-center">Register</h1>
                <p className="font-body text-sm text-white/70 text-center mb-6">Create your Boomcart account.</p>

                <form onSubmit={handleRegister} className="flex flex-col gap-5 mt-6">
                  {!otpSent ? (
                    <>
                      <Input label="Username" type="text" placeholder="John Doe"
                        value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})}
                        required variant="slider" rightElement={<FiUser size={16} className="text-white/40" />} />
                      <Input label="Email" type="email" placeholder="you@example.com"
                        value={regForm.email} onChange={e => setRegForm({...regForm, email: e.target.value})}
                        required variant="slider" rightElement={<FiMail size={16} className="text-white/40" />} />
                      <Input label="Password" type={showRegPw ? 'text' : 'password'} placeholder="Min. 6 characters"
                        value={regForm.password} onChange={e => setRegForm({...regForm, password: e.target.value})}
                        required variant="slider" 
                        rightElement={
                          <div className="flex gap-3 text-white/40">
                            <button type="button" onClick={() => setShowRegPw(!showRegPw)}
                              className="hover:text-white transition-colors">
                              {showRegPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                            <FiLock size={16} />
                          </div>
                        } />
                      <Input label="Confirm Password" type={showConfPw ? 'text' : 'password'} placeholder="Re-enter password"
                        value={regForm.confirm} onChange={e => setRegForm({...regForm, confirm: e.target.value})}
                        required variant="slider" 
                        rightElement={
                          <div className="flex gap-3 text-white/40">
                            <button type="button" onClick={() => setShowConfPw(!showConfPw)}
                              className="hover:text-white transition-colors">
                              {showConfPw ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                            </button>
                            <FiLock size={16} />
                          </div>
                        } />
                    </>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <p className="font-body text-sm text-white/70 text-center">
                        Enter the 6-digit code sent to <strong>{regForm.email}</strong>
                      </p>
                      <Input label="OTP Code" type="text" placeholder="Enter 6-digit code"
                        value={otp} onChange={e => setOtp(e.target.value)}
                        required maxLength={6} variant="glass"
                        className="text-center tracking-[0.4em] text-lg font-bold" />
                      <div className="text-xs text-center">
                        {canResend ? (
                          <button type="button" onClick={handleResend} disabled={loading}
                            className="font-bold text-[var(--color-cta)] hover:underline">Resend OTP</button>
                        ) : (
                          <span className="text-white/70">Resend in {countdown}s</span>
                        )}
                      </div>
                    </div>
                  )}

                  <Button type="submit" variant="primary" size="md" isLoading={loading}
                    className="w-full mt-4 font-medium bg-gradient-to-b from-[#e76f51] to-[#c25a3c] text-white rounded-full shadow-[0_4px_14px_0_rgba(194,90,60,0.39)] border-none min-h-[44px]">
                    {loading ? 'Creating...' : (!otpSent ? 'Register' : 'Verify & Register')}
                  </Button>
                </form>

                {/* Mobile toggle */}
                <div className="mt-8 pt-6 border-t border-white/10 lg:hidden text-center">
                  <p className="font-body text-xs text-white/70 mb-4">Already have an account?</p>
                  <Button type="button" onClick={toggleMode} size="sm" 
                    className="w-full border border-white/30 text-white bg-transparent hover:bg-white/10 transition-colors uppercase tracking-widest font-bold">
                    Sign in
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
           *  WELCOME PANEL (Absolute, z-20, slides between halves)
           *  - Login mode:    sits on RIGHT half (covers Register form)
           *  - Register mode: slides to LEFT half (covers Login form)
           * ═══════════════════════════════════════════════════════════ */}
          <div 
            className="hidden lg:flex absolute top-0 bottom-0 w-1/2 items-center justify-center text-center z-20 transition-all duration-700 ease-in-out"
            style={{
              right: isLogin ? '0' : '50%',
              background: 'linear-gradient(135deg, var(--color-cta) 0%, var(--color-cta-dark) 100%)',
              borderRadius: isLogin ? '0 12px 12px 0' : '12px 0 0 12px',
            }}
          >
            {/* Decorative radial accents */}
            <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit' }}>
              <div className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full opacity-10"
                   style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}></div>
              <div className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 rounded-full opacity-10"
                   style={{ background: 'radial-gradient(circle, var(--color-accent), transparent 70%)' }}></div>
            </div>

            <div className="relative z-10 px-10 max-w-[340px]">
              {isLogin ? (
                <>
                  <h2 className="font-heading text-4xl font-bold text-white mb-6">Welcome!</h2>
                  <p className="font-body text-sm text-white/80 mb-4 leading-relaxed">
                    We're delighted to have you here. If you need any assistance, feel free to reach out.
                  </p>
                  <div className="w-12 h-[2px] bg-white/30 mx-auto my-8"></div>
                  <p className="font-body text-xs text-white/80 mb-10 italic font-heading">
                    "Timeless pieces, made for every occasion."
                  </p>
                  <Button 
                    onClick={toggleMode}
                    className="px-8 py-3 border-2 border-white text-white bg-transparent font-body text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[var(--color-cta)] transition-all duration-300"
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-4xl font-bold text-white mb-6">Welcome Back!</h2>
                  <p className="font-body text-sm text-white/80 mb-4 leading-relaxed">
                    Already have an account? Sign in to continue your luxury shopping experience.
                  </p>
                  <div className="w-12 h-[2px] bg-white/30 mx-auto my-8"></div>
                  <p className="font-body text-xs text-white/80 mb-10 italic font-heading">
                    "Experience modern Indian luxury."
                  </p>
                  <Button 
                    onClick={toggleMode}
                    className="px-8 py-3 border-2 border-white text-white bg-transparent font-body text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-[var(--color-cta)] transition-all duration-300"
                  >
                    Login
                  </Button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
