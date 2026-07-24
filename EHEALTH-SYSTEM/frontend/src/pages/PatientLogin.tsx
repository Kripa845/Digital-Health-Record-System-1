import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import { User as UserIcon, AlertCircle, ShieldAlert, Sparkles, Eye, EyeOff, Lock } from 'lucide-react';
import { colors, glassCard, glassCardInput, label, value } from '../theme/theme';

export const PatientLogin: React.FC = () => {
  const { loginInit, loginVerify, user } = useAuth();
=======
import { User as UserIcon, AlertCircle, ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react';
import { colors, glassCard, glassCardInput, label } from '../theme/theme';

export const PatientLogin: React.FC = () => {
  const { login, user } = useAuth();
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
<<<<<<< HEAD
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
=======
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9

  useEffect(() => {
    if (user && user.role === 'PATIENT') navigate('/patient/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
<<<<<<< HEAD
    const res = await loginInit(username, password);
    if (res.success) {
      setUserId(res.data.user_id);
      setSimulatedOtp(res.data.simulated_otp);
      setShowOtpScreen(true);
      setLoading(false);
    } else {
      setError(res.error || 'Invalid credentials.');
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!otpCode || !userId) {
      setError('Please enter the 6-digit verification code.');
      setLoading(false);
      return;
    }
    const result = await loginVerify(userId, otpCode);
    if (result.success) {
      navigate('/patient/dashboard', { replace: true });
    } else {
      setError(result.error || 'Invalid OTP code.');
=======
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || 'Invalid credentials.');
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: colors.bgPageGradient, padding: '2rem 1.5rem' }}>
      <div style={{ ...glassCard, width: '100%', maxWidth: '420px', position: 'relative', padding: '2.5rem' }}>
        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(0,137,123,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', background: colors.tealGhostStrong, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}><UserIcon size={24} /></div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Patient Sign In</h2>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Enter credentials provided by your clinic administrator.</p>
        </div>
<<<<<<< HEAD
        {showOtpScreen ? (
          <form onSubmit={handleOtpVerify}>
            {simulatedOtp && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', background: colors.tealGhost, border: `1px dashed ${colors.borderGlassStrong}`, padding: '0.8rem 1rem', borderRadius: colors.radiusXl, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colors.primary, fontWeight: 600 }}><Sparkles size={14} /><span>Simulated OTP:</span></div>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.textPrimary, letterSpacing: '0.05em' }}>{simulatedOtp}</p>
              </div>
            )}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: colors.errorLight, background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, padding: '0.8rem 1rem', borderRadius: colors.radiusXl, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ ...label }}>Verification Code</label>
              <input type="text" maxLength={6} placeholder="e.g. 123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} style={{ ...glassCardInput, textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 700 }} disabled={loading} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '1rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
            <button type="button" onClick={() => { setShowOtpScreen(false); setError(null); }} style={{ width: '100%', padding: '1rem', marginTop: '0.8rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, cursor: 'pointer' }}>Back to Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: colors.errorLight, background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, padding: '0.8rem 1rem', borderRadius: colors.radiusXl, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                <AlertCircle size={16} /><span>{error}</span>
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ ...label }}>Username or Mobile Number</label>
              <input type="text" placeholder="Enter username or phone" value={username} onChange={(e) => setUsername(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem' }} disabled={loading} />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '2.1rem', color: colors.textSecondary }} />
            </div>
            <div style={{ marginBottom: '1.8rem', position: 'relative' }}>
              <label style={{ ...label }}>Password</label>
              <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} disabled={loading} />
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '2.1rem', color: colors.textSecondary }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.8rem', top: '2.1rem', background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" style={{ width: '100%', padding: '1rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }} disabled={loading}>
              {loading ? 'Signing in…' : 'Log In as Patient'}
            </button>
            <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.2rem', color: colors.primary, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>&larr; Back to role selection</Link>
          </form>
        )}
=======
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: colors.errorLight, background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, padding: '0.8rem 1rem', borderRadius: colors.radiusXl, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...label }}>Username</label>
            <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem' }} disabled={loading} required />
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '2.1rem', color: colors.textSecondary }} />
          </div>
          <div style={{ marginBottom: '1.8rem', position: 'relative' }}>
            <label style={{ ...label }}>Password</label>
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem', paddingRight: '2.5rem' }} disabled={loading} required />
            <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '2.1rem', color: colors.textSecondary }} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.8rem', top: '2.1rem', background: 'none', border: 'none', color: colors.textSecondary, cursor: 'pointer', padding: '0.2rem', display: 'flex', alignItems: 'center' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" style={{ width: '100%', padding: '1rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }} disabled={loading}>
            {loading ? 'Signing in…' : 'Log In as Patient'}
          </button>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.2rem', color: colors.primary, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>&larr; Back to role selection</Link>
        </form>
>>>>>>> c47456f7800640b06be9d45b184323eeaa77dee9
      </div>
    </div>
  );
};
