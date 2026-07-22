import React from 'react';
import { User, Edit2, CheckCircle2, ClipboardList } from 'lucide-react';
import type { PatientProfileData } from '../../types/patient';

interface ProfileTabProps {
  profile: PatientProfileData | null;
  isEditingProfile: boolean;
  setIsEditingProfile: (v: boolean) => void;
  editAge: number | '';
  setEditAge: (v: number | '') => void;
  editGender: string;
  setEditGender: (v: string) => void;
  editBloodGroup: string;
  setEditBloodGroup: (v: string) => void;
  editEmergencyContact: string;
  setEditEmergencyContact: (v: string) => void;
  editHeight: string;
  setEditHeight: (v: string) => void;
  editWeight: string;
  setEditWeight: (v: string) => void;
  editAllergies: string;
  setEditAllergies: (v: string) => void;
  editPrescription: string;
  setEditPrescription: (v: string) => void;
  editMedication: string;
  setEditMedication: (v: string) => void;
  editPain: string;
  setEditPain: (v: string) => void;
  editSuccessMsg: boolean;
  handleProfileSave: (e: React.FormEvent) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile, isEditingProfile, setIsEditingProfile,
  editAge, setEditAge, editGender, setEditGender, editBloodGroup, setEditBloodGroup,
  editEmergencyContact, setEditEmergencyContact, editHeight, setEditHeight, editWeight, setEditWeight,
  editAllergies, setEditAllergies, editPrescription, setEditPrescription,
  editMedication, setEditMedication, editPain, setEditPain,
  editSuccessMsg, handleProfileSave
}) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
      
      {/* Profile Vitals Details */}
      <div className="glass-card" style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(0, 137, 123, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.8rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', color: '#1a3a3a' }}>
            <User size={18} style={{ color: '#00897b' }} />
            <span>Physical Vitals & Details</span>
          </h3>
          {!isEditingProfile && (
            <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary" style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.8rem', 
              gap: '0.3rem',
              background: 'rgba(0, 137, 123, 0.1)',
              border: '1px solid rgba(0, 137, 123, 0.2)',
              borderRadius: '8px',
              color: '#00897b',
              cursor: 'pointer'
            }}>
              <Edit2 size={12} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {editSuccessMsg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(67, 160, 71, 0.1)', border: '1px solid rgba(67, 160, 71, 0.3)', padding: '0.6rem 1rem', borderRadius: '8px', color: '#1a3a3a', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={14} style={{ color: '#43a047' }} />
            <span>Health profile successfully synced!</span>
          </div>
        )}

        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Age</label>
                <input 
                  type="number" 
                  value={editAge} 
                  onChange={(e) => setEditAge(e.target.value === '' ? '' : Number(e.target.value))} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Gender</label>
                <select 
                  value={editGender} 
                  onChange={(e) => setEditGender(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Blood Group</label>
                <select 
                  value={editBloodGroup} 
                  onChange={(e) => setEditBloodGroup(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Emergency Phone</label>
                <input 
                  type="text" 
                  value={editEmergencyContact} 
                  onChange={(e) => setEditEmergencyContact(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }} 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Height</label>
                <input 
                  type="text" 
                  value={editHeight} 
                  onChange={(e) => setEditHeight(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }} 
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Weight</label>
                <input 
                  type="text" 
                  value={editWeight} 
                  onChange={(e) => setEditWeight(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #00897b, #43a047)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, padding: '0.8rem', cursor: 'pointer' }}>Save Vitals</button>
              <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0, 137, 123, 0.3)', borderRadius: '10px', color: '#00695c', fontWeight: 600, padding: '0.8rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Age</p>
              <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{profile?.age ?? 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Gender</p>
              <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{profile?.gender || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Blood Group</p>
              <p style={{ fontWeight: 700, color: '#d32f2f' }}>{profile?.blood_group || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Emergency Contact</p>
              <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{profile?.emergency_contact || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Height</p>
              <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{profile?.height || 'Not set'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Weight</p>
              <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{profile?.weight || 'Not set'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Prescriptions, Allergies & Recent Pain logs */}
      <div className="glass-card" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '1.5rem',
        border: '1px solid rgba(0, 137, 123, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.8rem', color: '#1a3a3a' }}>
          <ClipboardList size={18} style={{ color: '#00897b' }} />
          <span>Clinical History & Diaries</span>
        </h3>

        {isEditingProfile ? (
          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Major Allergies</label>
              <textarea value={editAllergies} onChange={(e) => setEditAllergies(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Active Doctor Prescriptions</label>
              <textarea value={editPrescription} onChange={(e) => setEditPrescription(e.target.value)} className="form-input" rows={3} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Current Medication</label>
              <textarea value={editMedication} onChange={(e) => setEditMedication(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Pain Log (Recent Pain description)</label>
              <textarea value={editPain} onChange={(e) => setEditPain(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontSize: '0.9rem' }}>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Major Allergies</p>
              <p style={{ color: '#1a3a3a', fontWeight: profile?.major_allergies ? 600 : 400 }}>{profile?.major_allergies || 'No known allergies logged.'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Active Doctor Prescription</p>
              <p style={{ color: '#1a3a3a', whiteSpace: 'pre-line' }}>{profile?.active_prescription || 'No active prescriptions recorded.'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Current Medication</p>
              <p style={{ color: '#1a3a3a' }}>{profile?.current_medication || 'None logged.'}</p>
            </div>
            <div>
              <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 600 }}>Pain Log (Recent Pain description)</p>
              <p style={{ color: '#1a3a3a' }}>{profile?.recent_pain || 'No pain logged.'}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};