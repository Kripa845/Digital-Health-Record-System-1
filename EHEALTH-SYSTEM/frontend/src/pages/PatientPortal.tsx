import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { User, FileText, QrCode, ChevronLeft } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';
import type { PatientProfileData } from '../types/patient';

export const PatientPortal: React.FC = () => {
  const { user, apiFetch, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'qr'>('profile');

  useEffect(() => {
    const load = async () => {
      try {
        const profRes = await apiFetch('/patients/me/');
        if (profRes.ok) setProfile(await profRes.json());
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiFetch]);

  const downloadQRCode = (canvasId: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mero_Care_Pass_${user?.first_name}_${user?.last_name || ''}`.trim().replace(/\s+/g, '_') + '.png';
      link.click();
    }
  };

  const patientFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Patient';
  const secureQrUrl = `${window.location.origin}/shared-profile/${profile?.qr_token}`;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '1rem', background: colors.bgPageGradient }}>
        <div className="pulse-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: colors.textPrimary }}>Syncing Health Records...</p>
      </div>
    );
  }

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>
            Welcome, <span style={{ background: colors.gradientPrimaryBtnAlt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{patientFullName}</span>
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Healthcare ID: <span style={{ color: colors.primary, fontWeight: 600 }}>{profile?.healthcare_id}</span></p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', borderBottom: `1px solid ${colors.borderGlass}`, paddingBottom: '0.5rem' }}>
          <button onClick={() => setActiveTab('profile')} style={{ background: activeTab === 'profile' ? colors.primary : 'none', border: 'none', font: 'inherit', padding: '0.8rem 1.2rem', cursor: 'pointer', color: activeTab === 'profile' ? colors.onPrimary : colors.textSecondary, borderRadius: colors.radiusLg, fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={16} /><span>My Profile</span></div>
          </button>
          <button onClick={() => setActiveTab('qr')} style={{ background: activeTab === 'qr' ? colors.primary : 'none', border: 'none', font: 'inherit', padding: '0.8rem 1.2rem', cursor: 'pointer', color: activeTab === 'qr' ? colors.onPrimary : colors.textSecondary, borderRadius: colors.radiusLg, fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.3s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><QrCode size={16} /><span>QR Code</span></div>
          </button>
        </div>

        {activeTab === 'profile' && profile && (
          <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: colors.tealGhostStrong, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusSm, padding: '0.15rem 0.6rem', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>
              <span style={{ fontSize: '0.72rem', color: colors.primary, fontWeight: 700, textTransform: 'uppercase' }}>View Only</span>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: colors.textPrimary, marginBottom: '0.5rem' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <div><p style={label}>Full Name</p><p style={value}>{patientFullName}</p></div>
              <div><p style={label}>Username</p><p style={value}>{user?.username}</p></div>
              <div><p style={label}>Email</p><p style={value}>{user?.email}</p></div>
              <div><p style={label}>Healthcare ID</p><p style={value}>{profile.healthcare_id}</p></div>
              <div><p style={label}>Age</p><p style={value}>{profile.age ?? 'N/A'}</p></div>
              <div><p style={label}>Gender</p><p style={value}>{profile.gender || 'Unspecified'}</p></div>
              <div><p style={label}>Blood Group</p><p style={{ ...value, color: colors.errorMain }}>{profile.blood_group || 'Unspecified'}</p></div>
              <div><p style={label}>Height / Weight</p><p style={value}>{profile.height || '—'} / {profile.weight || '—'}</p></div>
              <div><p style={label}>Emergency Contact</p><p style={value}>{profile.emergency_contact || 'Not provided'}</p></div>
              <div><p style={label}>Address</p><p style={value}>{profile.address || 'Not provided'}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><p style={label}>Major Allergies</p><p style={{ ...value, color: colors.errorMain }}>{profile.major_allergies || 'None known'}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><p style={label}>Active Prescriptions</p><p style={{ ...value, whiteSpace: 'pre-line' }}>{profile.active_prescription || 'None recorded.'}</p></div>
              <div style={{ gridColumn: '1 / -1' }}><p style={label}>Current Medication</p><p style={value}>{profile.current_medication || 'None recorded.'}</p></div>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: colors.textPrimary }}>Your Health Pass QR Code</h3>
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem', textAlign: 'center' }}>Share this QR code with healthcare providers so they can instantly access your profile.</p>
            <div style={{ background: colors.bgGlassInput, padding: '1.5rem', borderRadius: colors.radiusXl, border: `1px solid ${colors.borderGlass}` }}>
              <img src={`${API_BASE}/qr/?data=${encodeURIComponent(secureQrUrl)}`} alt="Health Pass QR" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
            <button onClick={() => downloadQRCode('patient-qr-canvas')} style={{ padding: '0.75rem 1.5rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }}>
              Download QR Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
