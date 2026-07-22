import React from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Stethoscope, ShieldAlert, ArrowRight } from 'lucide-react';
import { colors, glassCard, glassCardLight } from '../theme/theme';

export const RoleSelectLogin: React.FC = () => {
  const roles = [
    { path: '/login/admin', label: 'Admin Login', desc: 'Clinic &amp; system administration', icon: ShieldAlert, color: colors.adminBadgeColor, bg: colors.adminBadgeBg },
    { path: '/login/patient', label: 'Patient Login', desc: 'Access your personal health portal', icon: UserPlus, color: colors.textPrimary, bg: colors.tealGhostStrong },
    { path: '/login/doctor', label: 'Doctor Login', desc: 'Access patient records &amp; recommendations', icon: Stethoscope, color: colors.secondary, bg: colors.successGhostStrong },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: colors.bgPageGradient, padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: colors.textPrimary }}>Sign In to Mero Care Card</h2>
          <p style={{ color: colors.textSecondary, fontSize: '0.95rem' }}>Choose your portal below to continue.</p>
        </div>
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {roles.map((role) => (
            <Link key={role.path} to={role.path} style={{ textDecoration: 'none' }}>
              <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease', border: `1px solid ${colors.borderGlass}` }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: role.color }}><role.icon size={28} /></div>
                <div>
                  <h3 style={{ marginBottom: '0.3rem', color: colors.textPrimary, fontSize: '1.1rem' }}>{role.label}</h3>
                  <p style={{ fontSize: '0.82rem', color: colors.textSecondary, marginBottom: '0.8rem' }}>{role.desc}</p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: colors.primary, fontWeight: 600, fontSize: '0.85rem' }}>Continue <ArrowRight size={14} /></span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
