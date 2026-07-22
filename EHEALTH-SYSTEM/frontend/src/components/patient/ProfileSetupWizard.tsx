import React from 'react';
import { Heart } from 'lucide-react';

interface ProfileSetupWizardProps {
  editAge: number | '';
  setEditAge: (v: number | '') => void;
  editGender: string;
  setEditGender: (v: string) => void;
  editBloodGroup: string;
  setEditBloodGroup: (v: string) => void;
  editEmergencyContact: string;
  setEditEmergencyContact: (v: string) => void;
  editAllergies: string;
  setEditAllergies: (v: string) => void;
  editHeight: string;
  setEditHeight: (v: string) => void;
  editWeight: string;
  setEditWeight: (v: string) => void;
  editPrescription: string;
  setEditPrescription: (v: string) => void;
  editMedication: string;
  setEditMedication: (v: string) => void;
  editPain: string;
  setEditPain: (v: string) => void;
  handleProfileSave: (e: React.FormEvent) => void;
  submitting: boolean;
}

export const ProfileSetupWizard: React.FC<ProfileSetupWizardProps> = ({
  editAge, setEditAge, editGender, setEditGender, editBloodGroup, setEditBloodGroup,
  editEmergencyContact, setEditEmergencyContact, editAllergies, setEditAllergies,
  editHeight, setEditHeight, editWeight, setEditWeight, editPrescription, setEditPrescription,
  editMedication, setEditMedication, editPain, setEditPain,
  handleProfileSave, submitting
}) => {
  return (
    <div className="container" style={{ 
      maxWidth: '100%', 
      padding: '2rem 1.5rem',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
      minHeight: '100vh'
    }}>
      <div className="glass-card" style={{ 
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '2.5rem',
        border: '1px solid rgba(0, 137, 123, 0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="feature-icon-wrapper" style={{ 
            margin: '0 auto 1rem',
            width: '60px',
            height: '60px',
            background: 'rgba(0, 137, 123, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#00897b'
          }}>
            <Heart size={24} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.4rem', fontFamily: 'var(--font-display)', color: '#1a3a3a' }}>Setup Mero Care Card</h2>
          <p style={{ color: '#2c4a4a', fontSize: '0.95rem' }}>
            Welcome! Please complete your medical profile to generate your dynamic secure QR pass.
          </p>
        </div>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ 
            borderBottom: '1px solid rgba(0, 137, 123, 0.15)', 
            paddingBottom: '0.5rem', 
            fontSize: '1.1rem', 
            color: '#1a3a3a' 
          }}>1. Personal & Physical Vitals</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Age</label>
              <input 
                type="number" 
                placeholder="Enter age" 
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
              <label className="form-label" style={{ color: '#2c4a4a' }}>Emergency Contact Phone</label>
              <input 
                type="text" 
                placeholder="Contact phone" 
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
              <label className="form-label" style={{ color: '#2c4a4a' }}>Height (e.g., cm or ft)</label>
              <input 
                type="text" 
                placeholder="e.g. 175 cm" 
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
              <label className="form-label" style={{ color: '#2c4a4a' }}>Weight (e.g., kg or lbs)</label>
              <input 
                type="text" 
                placeholder="e.g. 70 kg" 
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

          <h3 style={{ 
            borderBottom: '1px solid rgba(0, 137, 123, 0.15)', 
            paddingBottom: '0.5rem', 
            fontSize: '1.1rem', 
            color: '#1a3a3a', 
            marginTop: '1rem' 
          }}>2. Critical History & Prescriptions</h3>
          <div className="form-group">
            <label className="form-label" style={{ color: '#2c4a4a' }}>Major Allergies</label>
            <textarea 
              placeholder="List major allergies (drugs, foods, environmental)..." 
              value={editAllergies} 
              onChange={(e) => setEditAllergies(e.target.value)} 
              className="form-input"
              style={{
                width: '100%',
                padding: '0.8rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                borderRadius: '10px',
                color: '#1a3a3a'
              }}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#2c4a4a' }}>Active Doctor Prescriptions</label>
            <textarea 
              placeholder="List active prescriptions and prescribing doctors..." 
              value={editPrescription} 
              onChange={(e) => setEditPrescription(e.target.value)} 
              className="form-input"
              style={{
                width: '100%',
                padding: '0.8rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                borderRadius: '10px',
                color: '#1a3a3a'
              }}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#2c4a4a' }}>Current Medication</label>
            <textarea 
              placeholder="Active drugs and dosages..." 
              value={editMedication} 
              onChange={(e) => setEditMedication(e.target.value)} 
              className="form-input"
              style={{
                width: '100%',
                padding: '0.8rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                borderRadius: '10px',
                color: '#1a3a3a'
              }}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: '#2c4a4a' }}>Pain Log (Recent Pain description)</label>
            <textarea 
              placeholder="Log details of any recent discomfort, surgical pain, or symptoms..." 
              value={editPain} 
              onChange={(e) => setEditPain(e.target.value)} 
              className="form-input"
              style={{
                width: '100%',
                padding: '0.8rem',
                minHeight: '80px',
                resize: 'vertical',
                background: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                borderRadius: '10px',
                color: '#1a3a3a'
              }}
              rows={2}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '1rem', 
              marginTop: '1.5rem',
              background: 'linear-gradient(135deg, #00897b, #43a047)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            disabled={submitting}
          >
            {submitting ? "Saving Profile..." : "Save & Generate Care Card"}
          </button>
        </form>

      </div>
    </div>
  );
};