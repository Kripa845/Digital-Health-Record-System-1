import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User as UserIcon, Lock, AlertCircle, ShieldAlert, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { colors, glassCard, glassCardInput, label, value } from '../styles/theme';

export const Login: React.FC = () => {
  const { loginInit, loginVerify, forgotPassword, resetPassword, user, serverStatus, prewarmServer, ensureServerWarm } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP flow states
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);

  // Forgot password flow states
  const [showForgotFlow, setShowForgotFlow] = useState(false);
  const [forgotInput, setForgotInput] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotUserId, setForgotUserId] = useState<number | null>(null);
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // If already authenticated, redirect
  useEffect(() => {
    if (user) {
      if (user.role === 'PATIENT') {
        navigate('/patient-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    }
  }, [user, navigate]);

  // Wake the backend (free tier spins down) so login doesn't hit a cold start.
  useEffect(() => {
    prewarmServer();
  }, [prewarmServer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    // Wait for the backend to be awake (free-tier cold start) so we never
    // hit a "Could not reach the server" error — just a brief warm-up wait.
    await ensureServerWarm();
    const res = await loginInit(username, password);
    if (res.success) {
      // Trigger OTP input screen
      setUserId(res.data.user_id);
      setSimulatedOtp(res.data.simulated_otp);
      setShowOtpScreen(true);
      setLoading(false);
    } else {
      setError(res.error || "Invalid credentials. Verify your username/phone and password.");
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!otpCode || !userId) {
      setError("Please enter the 6-digit verification code.");
      setLoading(false);
      return;
    }

    const result = await loginVerify(userId, otpCode);
    if (result.success) {
      // Redirection handled by useEffect
    } else {
      setError(result.error || "Invalid OTP code. Please check the code and try again.");
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!forgotInput) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    const res = await forgotPassword(forgotInput);
    if (res.success) {
      setForgotUserId(res.data.user_id);
      setSimulatedOtp(res.data.simulated_otp);
      setForgotStep(2);
      setLoading(false);
    } else {
      setError(res.error || "Could not find a user with that credential.");
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!forgotOtp || !newPassword || !forgotUserId) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const result = await resetPassword(forgotUserId, forgotOtp, newPassword, newPassword);
    const success = result.success;
    if (result.success) {
      setForgotSuccessMessage("Password reset successful. You can now login with your new password.");
      setTimeout(() => {
        setShowForgotFlow(false);
        setForgotStep(1);
        setForgotInput('');
        setForgotOtp('');
        setNewPassword('');
        setForgotSuccessMessage(null);
      }, 3000);
      setLoading(false);
    } else {
      setError(result.error || "Invalid reset code. Please check code and try again.");
      setLoading(false);
    }
  };

  // Back actions
  const resetFlow = () => {
    setShowOtpScreen(false);
    setShowForgotFlow(false);
    setForgotStep(1);
    setError(null);
    setSimulatedOtp(null);
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      width: '100%',
      background: colors.bgPageGradient,
      padding: '2rem 1.5rem'
    }}>
      <div style={{ 
        ...glassCard,
        width: '100%', 
        maxWidth: '450px', 
        position: 'relative',
        padding: '2.5rem'
      }}>
        
        {/* Top Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `rgba(0, 137, 123, 0.15)`,
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}></div>

        {/* Server warming-up hint (free tier cold start) */}
        {serverStatus === 'warming' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: colors.primary,
            background: colors.tealGhostStrong,
            border: `1px solid ${colors.borderGlassStrong}`,
            padding: '0.8rem 1rem',
            borderRadius: colors.radiusXl,
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <Sparkles size={16} />
            <span>Waking up the server… (free plan can take up to ~30s on first load)</span>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: colors.errorLight,
            background: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            padding: '0.8rem 1rem',
            borderRadius: colors.radiusXl,
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Simulated MFA Code Banner */}
        {simulatedOtp && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            background: colors.tealGhost,
            border: `1px dashed ${colors.borderGlassStrong}`,
            padding: '0.8rem 1rem',
            borderRadius: colors.radiusXl,
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: colors.primary, fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>Simulated SMS/Email OTP code:</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: colors.textPrimary, letterSpacing: '0.05em' }}>{simulatedOtp}</p>
          </div>
        )}

        {forgotSuccessMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: colors.secondary,
            background: colors.successLight,
            border: `1px solid ${colors.successBorder}`,
            padding: '0.8rem 1rem',
            borderRadius: colors.radiusXl,
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <CheckCircle size={16} />
            <span>{forgotSuccessMessage}</span>
          </div>
        )}

        {/* SCREEN 1: OTP CODE PROMPT */}
        {showOtpScreen ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                margin: '0 auto 1rem', 
                color: colors.primary,
                width: '60px',
                height: '60px',
                background: colors.tealGhostStrong,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Enter OTP</h2>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                A 6-digit verification code has been dispatched. Enter it below to unlock access.
              </p>
            </div>

            <form onSubmit={handleOtpVerify}>
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ ...label }}>Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  style={{ 
                    ...glassCardInput,
                    textAlign: 'center', 
                    letterSpacing: '0.5em', 
                    fontSize: '1.25rem', 
                    fontWeight: 700
                  }}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '1rem',
                  background: colors.gradientPrimaryBtn,
                  border: 'none',
                  borderRadius: colors.radiusLg,
                  color: colors.onPrimary,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: colors.shadowPrimaryBtn
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button 
                type="button" 
                onClick={resetFlow} 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  marginTop: '0.8rem',
                  background: colors.bgGlassLight,
                  border: `1px solid ${colors.borderPrimary}`,
                  borderRadius: colors.radiusLg,
                  color: colors.darkGreen,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Back to Sign In
              </button>
            </form>
          </div>

        ) : showForgotFlow ? (
          /* SCREEN 2: FORGOT PASSWORD FLOW */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                margin: '0 auto 1rem', 
                color: colors.secondary,
                width: '60px',
                height: '60px',
                background: colors.successLight,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Forgot Password</h2>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>
                Enter the email address registered to your account. We will send a reset OTP there.
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPasswordRequest}>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ ...label }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email"
                      placeholder="Enter your registered email"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      style={{ 
                        ...glassCardInput,
                        paddingLeft: '2.5rem'
                      }}
                      disabled={loading}
                    />
                    <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    background: colors.gradientPrimaryBtn,
                    border: 'none',
                    borderRadius: colors.radiusLg,
                    color: colors.onPrimary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: colors.shadowPrimaryBtn
                  }}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Request Reset OTP"}
                </button>

                <button 
                  type="button" 
                  onClick={resetFlow} 
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    marginTop: '0.8rem',
                    background: colors.bgGlassLight,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: colors.radiusLg,
                    color: colors.darkGreen,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ ...label }}>Reset OTP Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter reset code"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    style={{ 
                      ...glassCardInput,
                      textAlign: 'center',
                      letterSpacing: '0.2em',
                      fontWeight: 700
                    }}
                    disabled={loading}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ ...label }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ 
                        ...glassCardInput,
                        paddingLeft: '2.5rem',
                        paddingRight: '2.5rem'
                      }}
                      disabled={loading}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.8rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: colors.textSecondary,
                        cursor: 'pointer',
                        padding: '0.2rem',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    background: colors.gradientPrimaryBtn,
                    border: 'none',
                    borderRadius: colors.radiusLg,
                    color: colors.onPrimary,
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: colors.shadowPrimaryBtn
                  }}
                  disabled={loading}
                >
                  {loading ? "Resetting Password..." : "Update Password"}
                </button>

                <button 
                  type="button" 
                  onClick={() => setForgotStep(1)} 
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    marginTop: '0.8rem',
                    background: colors.bgGlassLight,
                    border: `1px solid ${colors.borderPrimary}`,
                    borderRadius: colors.radiusLg,
                    color: colors.darkGreen,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back
                </button>
              </form>
            )}
          </div>

        ) : (
          /* SCREEN 3: STANDARD LOGIN SCREEN */
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                margin: '0 auto 1rem',
                width: '60px',
                height: '60px',
                background: colors.tealGhostStrong,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Patient Sign In</h2>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Enter credentials to access your Mero Care health profile.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...label }}>Username or Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Enter username or phone"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ 
                      ...glassCardInput,
                      paddingLeft: '2.5rem'
                    }}
                    disabled={loading}
                  />
                  <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ ...label }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ 
                      ...glassCardInput,
                      paddingLeft: '2.5rem',
                      paddingRight: '2.5rem'
                    }}
                    disabled={loading}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Forgot Password trigger */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.8rem' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForgotFlow(true); setError(null); }} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: colors.primary,
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: colors.gradientPrimaryBtn,
                  border: 'none',
                  borderRadius: colors.radiusLg,
                  color: colors.onPrimary,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: colors.shadowPrimaryBtn
                }}
                disabled={loading}
              >
                 {loading ? (serverStatus === 'warming' ? "Waking up server…" : "Authenticating…") : "Log In as Patient"}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: colors.textSecondary }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>
                Create one here
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};