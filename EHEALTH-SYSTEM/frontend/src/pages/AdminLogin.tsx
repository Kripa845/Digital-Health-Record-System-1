import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { colors, glassCard, glassCardInput, label, value } from '../theme/theme';

const HARDCODED_ADMIN = { username: 'admin', password: 'admin123' };

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('eh_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    if (username === HARDCODED_ADMIN.username && password === HARDCODED_ADMIN.password) {
      const fakeToken = 'admin-hardcoded-token';
      const fakeUser = { id: 1, username: 'admin', email: 'admin@merocare.com', role: 'ADMIN', first_name: 'System', last_name: 'Admin' };
      localStorage.setItem('eh_token', fakeToken);
      localStorage.setItem('eh_user', JSON.stringify(fakeUser));
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('Invalid admin credentials.');
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: colors.bgPageGradient, padding: '2rem 1.5rem' }}>
      <div style={{ ...glassCard, width: '100%', maxWidth: '420px', position: 'relative', padding: '2.5rem' }}>
        <div style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(0,137,123,0.15)', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ margin: '0 auto 1rem', width: '60px', height: '60px', background: colors.tealGhostStrong, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
            <ShieldAlert size={24} />
          </div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Admin Sign In</h2>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Use your predefined admin credentials.</p>
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: colors.errorLight, background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, padding: '0.8rem 1rem', borderRadius: colors.radiusXl, fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} /><span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...label }}>Username</label>
            <input type="text" placeholder="admin" value={username} onChange={(e) => setUsername(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem' }} disabled={loading} />
          </div>
          <div style={{ marginBottom: '1.8rem' }}>
            <label style={{ ...label }}>Password</label>
            <input type="password" placeholder="admin123" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.5rem' }} disabled={loading} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '1rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In as Admin'}
          </button>
          <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: '1.2rem', color: colors.primary, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none' }}>&larr; Back to role selection</Link>
        </form>
      </div>
    </div>
  );
};
