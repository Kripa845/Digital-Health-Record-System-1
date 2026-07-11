import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QRScanner } from '../components/QRScanner';
import {
  AlertCircle, Activity, MapPin, Phone,
  Search, ChevronLeft, User as UserIcon, Heart,
} from 'lucide-react';

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

  const [searchId, setSearchId] = useState('');
  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── QR scan handler ──────────────────────────────────────────────────────
  const handleScan = (raw: string) => {
    setError(null);
    // If it's a shared-profile URL, navigate directly
    if (raw.includes('/shared-profile/')) {
      const token = raw.split('/shared-profile/').pop();
      if (token) {
        navigate(`/shared-profile/${token}`);
        return;
      }
    }
    // Otherwise treat it as a Healthcare ID
    lookupPatient(raw.trim());
  };

  // ── Manual Healthcare-ID lookup ──────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    lookupPatient(searchId.trim());
  };

  const lookupPatient = async (healthcareId: string) => {
    setError(null);
    setPatient(null);
    setLoading(true);
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
      setLoading(false);
    }
  };

  const patientName = patient
    ? `${patient.user.first_name} ${patient.user.last_name}`.trim() ||
      patient.user.email
    : '';

  // ── Style helpers ────────────────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    padding: '1.5rem',
    border: '1px solid rgba(0,137,123,0.15)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  };

  const label: React.CSSProperties = {
    color: '#2c4a4a',
    fontSize: '0.72rem',
    textTransform: 'uppercase',
    fontWeight: 600,
    marginBottom: '0.2rem',
  };

  const value: React.CSSProperties = {
    fontWeight: 700,
    color: '#1a3a3a',
    fontSize: '0.95rem',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg,#e8f5e9 0%,#e0f2f1 30%,#b2dfdb 60%,#c8e6c9 100%)',
        padding: '2rem 1.5rem',
      }}
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1a3a3a', marginBottom: '0.2rem' }}>
              Clinic <span style={{ background: 'linear-gradient(135deg,#00695c,#1a3a3a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Scanner Portal</span>
            </h1>
            <p style={{ color: '#2c4a4a', fontSize: '0.9rem' }}>
              Scan a patient QR pass or enter a Healthcare ID to retrieve their live health record.
            </p>
          </div>
          {patient && (
            <button
              onClick={() => { setPatient(null); setError(null); setSearchId(''); }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,137,123,0.3)', borderRadius: '8px',
                color: '#00695c', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
              }}
            >
              <ChevronLeft size={15} /> Scan Another
            </button>
          )}
        </header>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.7rem',
            background: 'rgba(211,47,47,0.08)', border: '1px solid rgba(211,47,47,0.25)',
            padding: '0.9rem 1.2rem', borderRadius: '12px', color: '#c62828', fontSize: '0.9rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '30vh', gap: '1rem' }}>
            <div className="pulse-glow" style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg,#00897b,#43a047)' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1a3a3a' }}>Querying Health Database...</p>
          </div>
        )}

        {/* Scanner + manual lookup — shown when no patient loaded */}
        {!loading && !patient && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* QR Scanner */}
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1a3a3a', marginBottom: '1.2rem', borderBottom: '1px solid rgba(0,137,123,0.12)', paddingBottom: '0.7rem' }}>
                <Activity size={18} style={{ color: '#00897b' }} />
                Scan Patient QR Pass
              </h3>
              <QRScanner onScanSuccess={handleScan} />
            </div>

            {/* Manual search */}
            <div style={card}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', color: '#1a3a3a', marginBottom: '1.2rem', borderBottom: '1px solid rgba(0,137,123,0.12)', paddingBottom: '0.7rem' }}>
                <Search size={18} style={{ color: '#00897b' }} />
                Manual Healthcare ID Lookup
              </h3>
              <p style={{ color: '#2c4a4a', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                Enter the patient's unique Healthcare ID (e.g. <strong>EH-2025-AB12C</strong>) to pull their live profile.
              </p>
              <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="EH-2025-XXXXX"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                  style={{
                    width: '100%', padding: '0.8rem 1rem',
                    background: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(0,137,123,0.2)',
                    borderRadius: '10px', fontSize: '0.95rem',
                    color: '#1a3a3a', letterSpacing: '0.05em',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: '100%', padding: '0.85rem',
                    background: 'linear-gradient(135deg,#00897b,#43a047)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  Search Patient
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Patient result card */}
        {!loading && patient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Bio card */}
            <div style={{ ...card, borderLeft: '4px solid #00897b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,137,123,0.1)', border: '1px solid rgba(0,137,123,0.2)', borderRadius: '6px', padding: '0.15rem 0.6rem', marginBottom: '0.5rem' }}>
                    <UserIcon size={12} style={{ color: '#00897b' }} />
                    <span style={{ fontSize: '0.72rem', color: '#00897b', fontWeight: 700, textTransform: 'uppercase' }}>Patient Profile</span>
                  </div>
                  <h2 style={{ fontSize: '1.6rem', color: '#1a3a3a', marginBottom: '0.2rem' }}>{patientName}</h2>
                  <p style={{ color: '#00897b', fontWeight: 700, fontSize: '0.9rem' }}>ID: {patient.healthcare_id}</p>
                </div>
                {/* View full care card */}
                <button
                  onClick={() => navigate(`/shared-profile/${patient.qr_token}`)}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'linear-gradient(135deg,#00897b,#43a047)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                  }}
                >
                  View Full Care Card →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.2rem', fontSize: '0.88rem' }}>
                <div>
                  <p style={label}>Age</p>
                  <p style={value}>{patient.age ?? 'N/A'}</p>
                </div>
                <div>
                  <p style={label}>Gender</p>
                  <p style={value}>{patient.gender || 'Unspecified'}</p>
                </div>
                <div>
                  <p style={label}>Blood Group</p>
                  <p style={{ ...value, color: '#d32f2f' }}>{patient.blood_group || 'Unspecified'}</p>
                </div>
                <div>
                  <p style={label}>Height / Weight</p>
                  <p style={value}>{patient.height || '—'} / {patient.weight || '—'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <Phone size={13} style={{ color: '#2c4a4a', marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <p style={label}>Emergency Contact</p>
                    <p style={value}>{patient.emergency_contact || 'Not provided'}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                  <MapPin size={13} style={{ color: '#2c4a4a', marginTop: '0.2rem', flexShrink: 0 }} />
                  <div>
                    <p style={label}>Address</p>
                    <p style={value}>{patient.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>

              <div style={card}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#d32f2f', marginBottom: '1rem', borderBottom: '1px solid rgba(0,137,123,0.1)', paddingBottom: '0.6rem' }}>
                  <Heart size={16} /> Critical Health Info
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.87rem' }}>
                  <div>
                    <p style={label}>Major Allergies</p>
                    <p style={{ color: patient.major_allergies ? '#1a3a3a' : '#6a8a8a', fontWeight: patient.major_allergies ? 600 : 400 }}>
                      {patient.major_allergies || 'No known allergies recorded.'}
                    </p>
                  </div>
                  <div>
                    <p style={label}>Recent Pain Log</p>
                    <p style={{ color: '#1a3a3a' }}>{patient.recent_pain || 'No pain logged.'}</p>
                  </div>
                </div>
              </div>

              <div style={card}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#00897b', marginBottom: '1rem', borderBottom: '1px solid rgba(0,137,123,0.1)', paddingBottom: '0.6rem' }}>
                  <Activity size={16} /> Medication & Prescriptions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.87rem' }}>
                  <div>
                    <p style={label}>Active Prescriptions</p>
                    <p style={{ color: '#1a3a3a', whiteSpace: 'pre-line' }}>
                      {patient.active_prescription || 'None recorded.'}
                    </p>
                  </div>
                  <div>
                    <p style={label}>Current Medication</p>
                    <p style={{ color: '#1a3a3a' }}>{patient.current_medication || 'None recorded.'}</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
