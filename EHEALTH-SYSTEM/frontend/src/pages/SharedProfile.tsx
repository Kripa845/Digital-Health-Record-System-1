import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, FileText, Heart, User, Sparkles, Download, Phone, ClipboardList, AlertTriangle } from 'lucide-react';
import { API_BASE } from '../config/api';

interface PublicProfileData {
  type: 'PATIENT';
  profile: {
    first_name?: string;
    last_name?: string;
    user?: {
      first_name: string;
      last_name: string;
      email: string;
      mobile_number: string;
    };
    healthcare_id?: string;
    age: number | null;
    gender: string;
    blood_group: string;
    blood_type?: string;
    emergency_contact: string;
    major_allergies: string;
    height: string;
    weight: string;
    active_prescription: string;
    current_medication: string;
    recent_pain: string;
    scan_count?: number;
    last_scanned_at?: string | null;
  };
  documents?: Array<{
    id: number;
    title: string;
    file_url: string;
    file_size: string;
    file_type: string;
    uploaded_at: string;
  }>;
}

export const SharedProfile: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/public-profile/${token}/`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setError("This Health Card is invalid, expired, or the patient has revoked sharing permissions.");
        }
      } catch (err) {
        setError("Network error. Unable to retrieve health record details.");
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    if (token) {
      fetchPublicProfile();
    }
  }, [token]);

  // Auto-refresh so an openeed pass reflects live changes (point 10).
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      const fetchPublicProfile = async () => {
        try {
        const res = await fetch(`${API_BASE}/public-profile/${token}/`);
          if (res.ok) {
            const json = await res.json();
            setData(json);
          }
        } catch (err) {
          // Ignore transient polling errors.
        }
      };
      fetchPublicProfile();
    }, 15000);
    return () => clearInterval(id);
  }, [token]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        gap: '1rem',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)'
      }}>
        <div className="pulse-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #00897b, #43a047)' }}></div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1a3a3a' }}>Retrieving Live Health Pass Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
        padding: '2rem'
      }}>
        <div className="glass-card" style={{ 
          maxWidth: '500px', 
          textAlign: 'center',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}>
          <AlertTriangle size={48} style={{ color: '#d32f2f', marginBottom: '1rem', margin: '0 auto' }} />
          <h2 style={{ marginBottom: '1rem', color: '#1a3a3a' }}>Access Denied</h2>
          <p style={{ color: '#2c4a4a', marginBottom: '2rem' }}>{error || "Could not retrieve records."}</p>
          <a href="/" className="btn btn-secondary" style={{ 
            width: '100%',
            padding: '0.8rem',
            background: 'linear-gradient(135deg, #00897b, #43a047)',
            border: 'none',
            borderRadius: '10px',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center'
          }}>Go back to home</a>
        </div>
      </div>
    );
  }

  const { profile, type, documents } = data;
  
  const fullName = type === 'PATIENT' 
    ? `${profile.user?.first_name || ''} ${profile.user?.last_name || ''}`.trim() || "Primary Cardholder"
    : `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || "Family Member";

  const bloodGroup = profile.blood_group || profile.blood_type || "Unspecified";

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
      padding: '2rem 1.5rem',
      color: '#1a3a3a'
    }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Top Branding Section */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid rgba(0, 137, 123, 0.15)', 
          paddingBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Shield size={28} style={{ color: '#00897b' }} />
            <div>
              <h2 style={{ fontSize: '1.4rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: '#1a3a3a' }}>Mero Care Card</h2>
              <p style={{ fontSize: '0.75rem', color: '#2c4a4a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Verified Patient Health Pass</p>
            </div>
          </div>
          <span style={{ 
            fontSize: '0.8rem', 
            padding: '0.3rem 0.8rem',
            background: 'rgba(0, 137, 123, 0.1)',
            border: '1px solid rgba(0, 137, 123, 0.2)',
            borderRadius: '8px',
            color: '#00897b',
            fontWeight: 600
          }}>
            {type === 'PATIENT' ? 'Primary Profile' : 'Profile'}
          </span>
          <span style={{
            fontSize: '0.8rem',
            padding: '0.3rem 0.8rem',
            background: 'rgba(0, 137, 123, 0.1)',
            border: '1px solid rgba(0, 137, 123, 0.2)',
            borderRadius: '8px',
            color: '#00897b',
            fontWeight: 600
          }}>
            Scans: {profile.scan_count ?? 1}
          </span>
        </div>

        {/* Profile Card Header */}
        <div className="glass-card" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem', 
          position: 'relative',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}>
          <div style={{ position: 'absolute', top: '1rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#00897b' }}>
            <Sparkles size={16} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Live Sync</span>
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem', color: '#1a3a3a' }}>{fullName}</h1>
            <span style={{ fontFamily: 'var(--font-display)', color: '#00897b', fontWeight: 600 }}>ID: {profile.healthcare_id}</span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '1rem', 
            borderTop: '1px solid rgba(0, 137, 123, 0.15)', 
            paddingTop: '1.2rem' 
          }}>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Age</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a3a3a' }}>{profile.age ?? 'N/A'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Gender</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a3a3a' }}>{profile.gender || 'Unspecified'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#d32f2f' }}>{bloodGroup}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Height / Weight</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a3a3a' }}>{profile.height || 'N/A'} / {profile.weight || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Vitals & History Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              color: '#d32f2f', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              borderBottom: '1px solid rgba(0, 137, 123, 0.15)', 
              paddingBottom: '0.5rem' 
            }}>
              <Heart size={16} />
              <span>Critical Health Info</span>
            </h3>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2c4a4a', fontWeight: 600 }}>Major Allergies</p>
              <p style={{ 
                color: profile.major_allergies ? '#1a3a3a' : '#2c4a4a', 
                fontWeight: profile.major_allergies ? 600 : 400, 
                marginTop: '0.2rem' 
              }}>
                {profile.major_allergies || "No known major allergies self-reported."}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2c4a4a', fontWeight: 600 }}>Recent Pain Log</p>
              <p style={{ color: '#1a3a3a', marginTop: '0.2rem' }}>{profile.recent_pain || "No pain logged."}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2c4a4a', fontWeight: 600 }}>Emergency Contact</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', color: '#1a3a3a', fontWeight: 600 }}>
                <Phone size={14} style={{ color: '#00897b' }} />
                <span>{profile.emergency_contact || "Not provided"}</span>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              fontSize: '1.1rem', 
              color: '#00897b', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              borderBottom: '1px solid rgba(0, 137, 123, 0.15)', 
              paddingBottom: '0.5rem' 
            }}>
              <ClipboardList size={16} />
              <span>Medication & Prescriptions</span>
            </h3>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2c4a4a', fontWeight: 600 }}>Active Doctor Prescriptions</p>
              <p style={{ color: '#1a3a3a', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>{profile.active_prescription || "No active prescriptions uploaded."}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#2c4a4a', fontWeight: 600 }}>Current Medications</p>
              <p style={{ color: '#1a3a3a', marginTop: '0.2rem', whiteSpace: 'pre-line' }}>{profile.current_medication || "None recorded."}</p>
            </div>
          </div>

        </div>

        {/* Documents Library Section */}
        {documents && documents.length > 0 && (
          <div className="glass-card" style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ 
              fontSize: '1.2rem', 
              marginBottom: '1.2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#1a3a3a' 
            }}>
              <FileText size={18} style={{ color: '#00897b' }} />
              <span>Medical Document Vault ({documents.length})</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: 'rgba(0, 137, 123, 0.05)',
                  border: '1px solid rgba(0, 137, 123, 0.1)',
                  borderRadius: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FileText size={20} style={{ color: '#43a047' }} />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a3a3a' }}>{doc.title}</h4>
                      <p style={{ fontSize: '0.75rem', color: '#2c4a4a' }}>Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()} &bull; {doc.file_size}</p>
                    </div>
                  </div>
                  <a 
                    href={doc.file_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      fontSize: '0.8rem', 
                      gap: '0.3rem',
                      background: 'rgba(0, 137, 123, 0.1)',
                      border: '1px solid rgba(0, 137, 123, 0.2)',
                      borderRadius: '8px',
                      color: '#00897b',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={12} />
                    <span>View/Get File</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer branding */}
        <div style={{ 
          textAlign: 'center', 
          padding: '2rem 0', 
          color: '#2c4a4a', 
          fontSize: '0.8rem', 
          borderTop: '1px solid rgba(0, 137, 123, 0.15)' 
        }}>
          Powered by Mero Care Card Digital Ledger &bull; Immutable Vitals Record System.
        </div>

      </div>
    </div>
  );
};