import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, User as UserIcon, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { colors, glassCard, glassCardInput, label, value } from '../theme/theme';

export const Login: React.FC = () => {
  const { login, user, serverStatus, prewarmServer, ensureServerWarm } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    }
  }, [user, navigate]);

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

    await ensureServerWarm();
    const result = await login(username, password);
    if (!result.success) {
      setError(result.error || "Invalid username or password.");
      setLoading(false);
    }
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
        maxWidth: '420px',
        position: 'relative',
        padding: '2.5rem'
      }}>

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
            <KeyRound size={16} />
            <span>Waking up the server… (free plan can take up to ~30s on first load)</span>
          </div>
        )}

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
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Sign In</h2>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Enter your username and password to continue.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...label }}>Username</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter username"
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

          <div style={{ marginBottom: '1.2rem' }}>
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
            {loading ? (serverStatus === 'warming' ? "Waking up server…" : "Signing in…") : "Sign In"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.85rem', color: colors.textSecondary }}>
          <Link to="/login/admin" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none', marginRight: '1rem' }}>Admin Login</Link>
          <Link to="/login/doctor" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none', marginRight: '1rem' }}>Doctor Login</Link>
          <Link to="/login/patient" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>Patient Login</Link>
        </div>
      </div>
    </div>
  );
};
