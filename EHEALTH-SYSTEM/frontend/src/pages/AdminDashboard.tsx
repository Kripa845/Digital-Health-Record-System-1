import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRScanner } from '../components/QRScanner';
import {
  AlertCircle, Activity, MapPin, Phone,
  Search, ChevronLeft, User as UserIcon, Heart,
  Users, UserCheck, ShieldCheck, Stethoscope
} from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

interface AdminStats {
  total_users: number;
  total_patients: number;
  total_admins: number;
  total_doctors: number;
  active_users: number;
}

interface PatientSummary {
  id: number;
  healthcare_id: string;
  age: number | null;
  gender: string;
  blood_group: string;
  emergency_contact: string;
  major_allergies: string;
  height: string;
  weight: string;
  active_prescription: string;
  current_medication: string;
  recent_pain: string;
  qr_token: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
    mobile_number: string;
  };
  contact_number: string;
  address: string;
}

export const AdminDashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [loadingScan, setLoadingScan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await apiFetch('/admin-stats/');
        if (res.ok) setStats(await res.json());
      } catch { } finally { setLoadingStats(false); }
    };
    loadStats();
  }, [apiFetch]);

  const statCards = [
    { title: 'Total Users', value: stats?.total_users ?? 0, icon: <Users size={22} />, accent: colors.primary },
    { title: 'Total Patients', value: stats?.total_patients ?? 0, icon: <UserIcon size={22} />, accent: colors.secondary },
    { title: 'Total Admins', value: stats?.total_admins ?? 0, icon: <ShieldCheck size={22} />, accent: '#1565c0' },
    { title: 'Total Doctors', value: stats?.total_doctors ?? 0, icon: <Stethoscope size={22} />, accent: '#6a1b9a' },
    { title: 'Active Users', value: stats?.active_users ?? 0, icon: <UserCheck size={22} />, accent: '#e65100' },
  ];

  const handleScan = (raw: string) => {
    setError(null);
    if (raw.includes('/shared-profile/')) {
      const token = raw.split('/shared-profile/').pop();
      if (token) {
        navigate(`/shared-profile/${token}`);
        return;
      }
    }
    lookupPatient(raw.trim());
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    lookupPatient(searchId.trim());
  };

  const lookupPatient = async (healthcareId: string) => {
    setError(null);
    setPatient(null);
    setLoadingScan(true);
    try {
      const res = await apiFetch(`/patients/by-healthcare-id/${healthcareId}/`);
      if (!res.ok) {
        setError(`No patient found with Healthcare ID "${healthcareId}".`);
        return;
      }
      const data: PatientSummary = await res.json();
      setPatient(data);
    } catch {
      setError('Network error. Could not reach the health database.');
    } finally {
      setLoadingScan(false);
    }
  };

  const card: React.CSSProperties = {
    background: colors.bgGlass,
    backdropFilter: 'blur(10px)',
    borderRadius: colors.radius3Xl,
    padding: '1.5rem',
    border: `1px solid ${colors.borderGlass}`,
    boxShadow: colors.shadowCard,
  };

  const patientName = patient
    ? `${patient.user.first_name} ${patient.user.last_name}`.trim() || patient.user.email
    : '';

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>
              Admin <span style={{ background: colors.gradientPrimaryBtnAlt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>System overview and patient lookup tools.</p>
          </div>
          {patient && (
            <button onClick={() => { setPatient(null); setError(null); setSearchId(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
              <ChevronLeft size={15} /> Scan Another
            </button>
          )}
        </header>

        {loadingStats ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {statCards.map((s) => (
              <div key={s.title} style={{ ...card, display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: colors.radiusLg, background: `${s.accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.accent, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: colors.textSecondary, textTransform: 'uppercase', fontWeight: 600 }}>{s.title}</p>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: colors.textPrimary, lineHeight: 1 }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', background: colors.errorBg, border: `1px solid ${colors.errorBorder}`, padding: '0.9rem 1.2rem', borderRadius: colors.radiusXl, color: colors.errorMain, fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} /><span>{error}</span>
          </div>
        )}

        {(loadingScan || patient) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {!loadingScan && patient && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ ...card, borderLeft: '4px solid ' + colors.primary }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: colors.tealGhostStrong, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusSm, padding: '0.15rem 0.6rem', marginBottom: '0.5rem' }}>
                        <UserIcon size={12} style={{ color: colors.primary }} />
                        <span style={{ fontSize: '0.72rem', color: colors.primary, fontWeight: 700, textTransform: 'uppercase' }}>Patient Profile</span>
                      </div>
                      <h2 style={{ fontSize: '1.6rem', color: colors.textPrimary, marginBottom: '0.2rem' }}>{patientName}</h2>
                      <p style={{ color: colors.primary, fontWeight: 700, fontSize: '0.9rem' }}>ID: {patient.healthcare_id}</p>
                    </div>
                    <button onClick={() => navigate(`/shared-profile/${patient.qr_token}`)} style={{ padding: '0.6rem 1.2rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                      View Full Care Card &rarr;
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.2rem', fontSize: '0.88rem' }}>
                    <div><p style={label}>Age</p><p style={value}>{patient.age ?? 'N/A'}</p></div>
                    <div><p style={label}>Gender</p><p style={value}>{patient.gender || 'Unspecified'}</p></div>
                    <div><p style={label}>Blood Group</p><p style={{ ...value, color: colors.errorMain }}>{patient.blood_group || 'Unspecified'}</p></div>
                    <div><p style={label}>Height / Weight</p><p style={value}>{patient.height || '—'} / {patient.weight || '—'}</p></div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <Phone size={13} style={{ color: colors.textSecondary, marginTop: '0.2rem', flexShrink: 0 }} />
                      <div><p style={label}>Emergency Contact</p><p style={value}>{patient.emergency_contact || 'Not provided'}</p></div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <MapPin size={13} style={{ color: colors.textSecondary, marginTop: '0.2rem', flexShrink: 0 }} />
                      <div><p style={label}>Address</p><p style={value}>{patient.address || 'Not provided'}</p></div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  <div style={card}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: colors.errorMain, marginBottom: '1rem', borderBottom: `1px solid ${colors.borderGlassSubtle}`, paddingBottom: '0.6rem' }}>
                      <Heart size={16} /> Critical Health Info
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.87rem' }}>
                      <div><p style={label}>Major Allergies</p><p style={{ color: patient.major_allergies ? colors.textPrimary : colors.textSecondary, fontWeight: patient.major_allergies ? 600 : 400 }}>{patient.major_allergies || 'No known allergies recorded.'}</p></div>
                      <div><p style={label}>Recent Pain Log</p><p style={{ color: colors.textPrimary }}>{patient.recent_pain || 'No pain logged.'}</p></div>
                    </div>
                  </div>
                  <div style={card}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: colors.primary, marginBottom: '1rem', borderBottom: `1px solid ${colors.borderGlassSubtle}`, paddingBottom: '0.6rem' }}>
                      <Activity size={16} /> Medication &amp; Prescriptions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.87rem' }}>
                      <div><p style={label}>Active Prescriptions</p><p style={{ color: colors.textPrimary, whiteSpace: 'pre-line' }}>{patient.active_prescription || 'None recorded.'}</p></div>
                      <div><p style={label}>Current Medication</p><p style={{ color: colors.textPrimary }}>{patient.current_medication || 'None recorded.'}</p></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {loadingScan && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '1rem' }}>
                <div className="pulse-glow" style={{ width: '44px', height: '44px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: colors.textPrimary }}>Querying Health Database...</p>
              </div>
            )}
          </div>
        )}

        {!loadingScan && !patient && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: colors.textPrimary, marginBottom: '1.2rem', borderBottom: `1px solid ${colors.borderGlassSubtle}`, paddingBottom: '0.7rem' }}>
                <Activity size={18} style={{ color: colors.primary }} /> Scan Patient QR Pass
              </h3>
              <QRScanner onScanSuccess={handleScan} />
            </div>
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: colors.textPrimary, marginBottom: '1.2rem', borderBottom: `1px solid ${colors.borderGlassSubtle}`, paddingBottom: '0.7rem' }}>
                <Search size={18} style={{ color: colors.primary }} /> Manual Healthcare ID Lookup
              </h3>
              <p style={{ color: colors.textSecondary, fontSize: '0.85rem', marginBottom: '1.2rem' }}>Enter the patient's unique Healthcare ID (e.g. <strong>EH-2025-AB12C</strong>) to pull their live profile.</p>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input type="text" placeholder="EH-2025-XXXXX" value={searchId} onChange={(e) => setSearchId(e.target.value.toUpperCase())} style={{ ...glassCardInput, letterSpacing: '0.05em' }} />
                <button type="submit" style={{ width: '100%', padding: '0.85rem', background: colors.gradientPrimaryBtn, border: 'none', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
                  Search
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminDashboardHome: React.FC = () => {
  return (
    <AdminDashboard />
  );
};
