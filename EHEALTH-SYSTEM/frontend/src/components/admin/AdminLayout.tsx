import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Users, UserCheck, ChevronRight } from 'lucide-react';
import { colors, glassCard } from '../../theme/theme';

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/patients', icon: Users, label: 'Patient Management' },
    { to: '/admin/doctors', icon: UserCheck, label: 'Doctor Management' },
    { to: '/admin/recommendations', icon: ChevronRight, label: 'Recommendations' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bgPageGradient }}>
      <aside style={{ width: '260px', background: colors.gradientDark, backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', padding: '1.5rem', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(100,200,200,0.15)' }}>
          <h2 style={{ color: '#e0f7fa', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>Admin Portal</h2>
          <p style={{ color: '#b2dfdb', fontSize: '0.75rem', marginTop: '0.2rem' }}>{user?.first_name} {user?.last_name}</p>
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.8rem 1rem', borderRadius: colors.radiusLg,
              color: isActive ? '#fff' : '#b2dfdb', background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: isActive ? 600 : 400, transition: 'all 0.2s ease'
            })}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(100,200,200,0.2)', borderRadius: colors.radiusLg, color: '#b2dfdb', cursor: 'pointer', fontSize: '0.85rem', marginTop: 'auto' }}>
          <LogOut size={16} /> Sign Out
        </button>
      </aside>
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};
