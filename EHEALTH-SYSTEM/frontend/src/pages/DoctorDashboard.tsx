import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, UserCheck, Search, ChevronLeft, FilePlus2 } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

interface DoctorStats {
  my_patients_count: number;
  today_appointments: number;
  profile_completion: number;
}

interface MyPatient {
  id: number;
  first_name: string;
  last_name: string;
  healthcare_id: string;
  contact_number: string;
  gender: string;
  blood_group: string;
}

interface DoctorProfileData {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  specialization: string;
  department: string;
  hospital: string;
  experience_years: number;
  medical_license_number: string;
  phone_number: string;
  status: string;
}

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>
            Welcome, <span style={{ background: colors.gradientPrimaryBtnAlt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dr. {user?.first_name} {user?.last_name}</span>
          </h1>
          <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>This is your doctor portal dashboard.</p>
        </div>
        <DashboardStats />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: colors.textPrimary }}>&#128101; My Patients</h3>
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>View assigned patients and their health records.</p>
          </div>
          <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: colors.textPrimary }}>&#128221; Recommendations</h3>
            <p style={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Review AI-assisted doctor recommendations and patient care plans here.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardStats: React.FC = () => {
  const { apiFetch } = useAuth();
  const [stats, setStats] = useState<DoctorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [patientsRes, profileRes] = await Promise.all([
          apiFetch('/doctors/my-patients/'),
          apiFetch('/doctors/me/'),
        ]);
        const patientsCount = patientsRes.ok ? (await patientsRes.json()).length ?? 0 : 0;
        let profileCompletion = 0;
        if (profileRes.ok) {
          const profile: DoctorProfileData = await profileRes.json();
          const fields = ['first_name', 'last_name', 'email', 'specialization', 'department', 'medical_license_number', 'phone_number'];
          const filled = fields.filter((f) => profile[f as keyof DoctorProfileData]).length;
          profileCompletion = Math.round((filled / fields.length) * 100);
        }
        setStats({ my_patients_count: patientsCount, today_appointments: 0, profile_completion: profileCompletion });
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [apiFetch]);

  const statCards = [
    { title: 'My Patients', value: stats?.my_patients_count ?? 0, icon: <Users size={22} />, accent: colors.primary },
    { title: "Today's Appointments", value: stats?.today_appointments ?? 0, icon: <FileText size={22} />, accent: '#e65100' },
    { title: 'Profile Completion', value: `${stats?.profile_completion ?? 0}%`, icon: <UserCheck size={22} />, accent: colors.secondary },
  ];

  if (loading) {
    return (
      <div style={{ ...glassCardLight, display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
      {statCards.map((s) => (
        <div key={s.title} style={{ ...glassCard, display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
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
  );
};

export const MyPatients: React.FC = () => {
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();
  const [patients, setPatients] = useState<MyPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/doctors/my-patients/');
        if (res.ok) setPatients(await res.json());
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [apiFetch]);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (`${p.first_name} ${p.last_name}`).toLowerCase().includes(q) ||
      (p.healthcare_id || '').toLowerCase().includes(q) ||
      (p.contact_number || '').toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>My Patients</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Assigned patients under your care.</p>
          </div>
          <button onClick={() => navigate('/doctor/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><ChevronLeft size={15} /> Back to Dashboard</button>
        </div>
        <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: colors.textSecondary }} />
            <input type="text" placeholder="Search by Patient ID, Name, or Phone…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...glassCardInput, paddingLeft: '2.8rem' }} />
          </div>
          {loading ? (
            <p style={{ color: colors.textSecondary }}>Loading patients…</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filtered.map((p) => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: colors.bgGlassInput, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusLg, flexWrap: 'wrap', gap: '0.8rem' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: colors.textPrimary }}>{p.first_name} {p.last_name}</p>
                    <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>{p.healthcare_id} &bull; {p.contact_number || '—'} &bull; {p.gender || '—'}</p>
                  </div>
                  <span style={{ padding: '0.3rem 0.8rem', borderRadius: colors.radiusSm, fontSize: '0.75rem', fontWeight: 600, background: colors.tealGhostStrong, color: colors.primary, border: `1px solid ${colors.borderGlass}` }}>Patient</span>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: colors.textMuted, textAlign: 'center' }}>No patients assigned.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const DoctorProfile: React.FC = () => {
  const navigate = useNavigate();
  const { apiFetch, user } = useAuth();
  const [profile, setProfile] = useState<DoctorProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch('/doctors/me/');
        if (res.ok) setProfile(await res.json());
      } catch { } finally { setLoading(false); }
    };
    load();
  }, [apiFetch]);

  if (loading) {
    return (
      <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.gradientPrimaryBtn }} />
      </div>
    );
  }

  const displayName = `${profile?.first_name || user?.first_name} ${profile?.last_name || user?.last_name}`.trim();

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: colors.textPrimary, marginBottom: '0.2rem' }}>My Profile</h1>
            <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>View your professional details.</p>
          </div>
          <button onClick={() => navigate('/doctor/dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: colors.bgGlassLight, border: `1px solid ${colors.borderPrimary}`, borderRadius: colors.radiusLg, color: colors.darkGreen, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}><ChevronLeft size={15} /> Back to Dashboard</button>
        </div>
        <div style={{ ...glassCard, display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: colors.tealGhostStrong, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radiusSm, padding: '0.15rem 0.6rem', marginBottom: '0.5rem', alignSelf: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', color: colors.primary, fontWeight: 700, textTransform: 'uppercase' }}>View Only</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.2rem' }}>
            <div><p style={label}>Full Name</p><p style={value}>{displayName}</p></div>
            <div><p style={label}>Username</p><p style={value}>{profile?.username || user?.username}</p></div>
            <div><p style={label}>Email</p><p style={value}>{profile?.email || user?.email}</p></div>
            <div><p style={label}>Specialization</p><p style={value}>{profile?.specialization || '—'}</p></div>
            <div><p style={label}>Department</p><p style={value}>{profile?.department || '—'}</p></div>
            <div><p style={label}>Hospital</p><p style={value}>{profile?.hospital || '—'}</p></div>
            <div><p style={label}>Phone</p><p style={value}>{profile?.phone_number || '—'}</p></div>
            <div><p style={label}>Medical License</p><p style={value}>{profile?.medical_license_number || '—'}</p></div>
            <div><p style={label}>Experience</p><p style={value}>{profile?.experience_years ?? '—'} years</p></div>
            <div><p style={label}>Status</p><p style={value}>{profile?.status || user?.role || '—'}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};
