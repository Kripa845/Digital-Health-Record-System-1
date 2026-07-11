import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User as UserIcon, Lock, AlertCircle, ShieldAlert, Sparkles, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginInit, loginVerify, forgotPassword, resetPassword, user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!username || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

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

    const success = await loginVerify(userId, otpCode);
    if (success) {
      // Redirection handled by useEffect
    } else {
      setError("Invalid OTP code. Please enter the correct code printed to console.");
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!forgotInput) {
      setError("Please enter your Username or Phone number.");
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
    <div className="container" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
      padding: '2rem 1.5rem'
    }}>
      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2.5rem',
        border: '1px solid rgba(0, 137, 123, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
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
          background: 'hsla(var(--primary), 0.15)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}></div>

        {/* Global Error Banner */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#d32f2f',
            background: 'rgba(211, 47, 47, 0.1)',
            border: '1px solid rgba(211, 47, 47, 0.2)',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
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
            background: 'rgba(0, 137, 123, 0.05)',
            border: '1px dashed rgba(0, 137, 123, 0.4)',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#00897b', fontWeight: 600 }}>
              <Sparkles size={14} />
              <span>Simulated SMS/Email OTP code:</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1a3a3a', letterSpacing: '0.05em' }}>{simulatedOtp}</p>
          </div>
        )}

        {forgotSuccessMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: '#43a047',
            background: 'rgba(67, 160, 71, 0.1)',
            border: '1px solid rgba(67, 160, 71, 0.2)',
            padding: '0.8rem 1rem',
            borderRadius: '12px',
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
              <div className="feature-icon-wrapper" style={{ 
                margin: '0 auto 1rem', 
                color: '#00897b',
                width: '60px',
                height: '60px',
                background: 'rgba(0, 137, 123, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldAlert size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: '#1a3a3a' }}>Enter OTP</h2>
              <p style={{ color: '#2c4a4a', fontSize: '0.9rem' }}>
                A 6-digit verification code has been dispatched. Enter it below to unlock access.
              </p>
            </div>

            <form onSubmit={handleOtpVerify}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label" style={{ color: '#2c4a4a' }}>Verification Code</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="form-input"
                  style={{ 
                    textAlign: 'center', 
                    letterSpacing: '0.5em', 
                    fontSize: '1.25rem', 
                    fontWeight: 700,
                    width: '100%',
                    padding: '0.8rem',
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(0, 137, 123, 0.15)',
                    borderRadius: '10px',
                    color: '#1a3a3a'
                  }}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #00897b, #43a047)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </button>

              <button 
                type="button" 
                onClick={resetFlow} 
                className="btn btn-secondary" 
                style={{ 
                  width: '100%', 
                  padding: '1rem', 
                  marginTop: '0.8rem',
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(0, 137, 123, 0.3)',
                  borderRadius: '10px',
                  color: '#00695c',
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
              <div className="feature-icon-wrapper" style={{ 
                margin: '0 auto 1rem', 
                color: '#43a047',
                width: '60px',
                height: '60px',
                background: 'rgba(67, 160, 71, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: '#1a3a3a' }}>Forgot Password</h2>
              <p style={{ color: '#2c4a4a', fontSize: '0.9rem' }}>
                Recover your credentials using your username or phone number.
              </p>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotPasswordRequest}>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Username or Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="text" 
                      placeholder="Enter username or registered phone"
                      value={forgotInput}
                      onChange={(e) => setForgotInput(e.target.value)}
                      className="form-input"
                      style={{ 
                        width: '100%',
                        padding: '0.8rem 0.8rem 0.8rem 2.5rem',
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(0, 137, 123, 0.15)',
                        borderRadius: '10px',
                        color: '#1a3a3a'
                      }}
                      disabled={loading}
                    />
                    <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2c4a4a' }} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #00897b, #43a047)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Request Reset OTP"}
                </button>

                <button 
                  type="button" 
                  onClick={resetFlow} 
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    marginTop: '0.8rem',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(0, 137, 123, 0.3)',
                    borderRadius: '10px',
                    color: '#00695c',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back to Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Reset OTP Code</label>
                  <input 
                    type="text" 
                    maxLength={6}
                    placeholder="Enter reset code"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="form-input"
                    style={{ 
                      width: '100%',
                      padding: '0.8rem',
                      textAlign: 'center',
                      letterSpacing: '0.2em',
                      fontWeight: 700,
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0, 137, 123, 0.15)',
                      borderRadius: '10px',
                      color: '#1a3a3a'
                    }}
                    disabled={loading}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ color: '#2c4a4a' }}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="form-input"
                      style={{ 
                        width: '100%',
                        padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                        background: 'rgba(255,255,255,0.5)',
                        border: '1px solid rgba(0, 137, 123, 0.15)',
                        borderRadius: '10px',
                        color: '#1a3a3a'
                      }}
                      disabled={loading}
                    />
                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2c4a4a' }} />
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
                        color: '#2c4a4a',
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
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #00897b, #43a047)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  disabled={loading}
                >
                  {loading ? "Resetting Password..." : "Update Password"}
                </button>

                <button 
                  type="button" 
                  onClick={() => setForgotStep(1)} 
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem', 
                    marginTop: '0.8rem',
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(0, 137, 123, 0.3)',
                    borderRadius: '10px',
                    color: '#00695c',
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
              <div className="feature-icon-wrapper" style={{
                margin: '0 auto 1rem',
                width: '60px',
                height: '60px',
                background: 'rgba(0, 137, 123, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00897b'
              }}>
                <KeyRound size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: '#1a3a3a' }}>Patient Sign In</h2>
              <p style={{ color: '#2c4a4a', fontSize: '0.9rem' }}>Enter credentials to access your Mero Care health profile.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ color: '#2c4a4a' }}>Username or Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Enter username or phone"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    style={{ 
                      width: '100%',
                      padding: '0.8rem 0.8rem 0.8rem 2.5rem',
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0, 137, 123, 0.15)',
                      borderRadius: '10px',
                      color: '#1a3a3a'
                    }}
                    disabled={loading}
                  />
                  <UserIcon size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2c4a4a' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ color: '#2c4a4a' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    style={{ 
                      width: '100%',
                      padding: '0.8rem 2.5rem 0.8rem 2.5rem',
                      background: 'rgba(255,255,255,0.5)',
                      border: '1px solid rgba(0, 137, 123, 0.15)',
                      borderRadius: '10px',
                      color: '#1a3a3a'
                    }}
                    disabled={loading}
                  />
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2c4a4a' }} />
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
                      color: '#2c4a4a',
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
                    color: '#00897b',
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
                className="btn btn-primary" 
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #00897b, #43a047)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
                disabled={loading}
              >
                {loading ? "Authenticating..." : "Log In as Patient"}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: '#2c4a4a' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#00897b', fontWeight: 600, textDecoration: 'none' }}>
                Create one here
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};