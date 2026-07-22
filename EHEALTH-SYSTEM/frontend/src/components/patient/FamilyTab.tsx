import React from 'react';
import { User, Users, Plus, Download, Trash2, AlertCircle, ClipboardList } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import type { FamilyMemberData, DocumentData } from '../../types/patient';

interface FamilyTabProps {
  showAddFamilyForm: boolean;
  setShowAddFamilyForm: (v: boolean) => void;
  selectedFamilyMember: FamilyMemberData | null;
  setSelectedFamilyMember: (m: FamilyMemberData | null) => void;
  famFirstName: string;
  setFamFirstName: (v: string) => void;
  famLastName: string;
  setFamLastName: (v: string) => void;
  famRelationship: string;
  setFamRelationship: (v: string) => void;
  famAge: number | '';
  setFamAge: (v: number | '') => void;
  famGender: string;
  setFamGender: (v: string) => void;
  famBloodGroup: string;
  setFamBloodGroup: (v: string) => void;
  famEmergencyContact: string;
  setFamEmergencyContact: (v: string) => void;
  famAllergies: string;
  setFamAllergies: (v: string) => void;
  famHeight: string;
  setFamHeight: (v: string) => void;
  famWeight: string;
  setFamWeight: (v: string) => void;
  famPrescription: string;
  setFamPrescription: (v: string) => void;
  famMedication: string;
  setFamMedication: (v: string) => void;
  famPain: string;
  setFamPain: (v: string) => void;
  famError: string | null;
  handleAddFamily: (e: React.FormEvent) => void;
  handleDocDelete: (id: number) => void;
  submitting: boolean;
  familyMembers: FamilyMemberData[];
  familyDocs: DocumentData[];
  setFamilyDocs: (docs: DocumentData[]) => void;
  setDocFilter: (v: string) => void;
  setActiveTab: (tab: 'profile' | 'documents' | 'qr' | 'family') => void;
  apiFetch: (url: string, options?: any) => Promise<Response>;
  downloadQRCode: (canvasId: string, name: string) => void;
}

export const FamilyTab: React.FC<FamilyTabProps> = ({
  showAddFamilyForm, setShowAddFamilyForm, selectedFamilyMember, setSelectedFamilyMember,
  famFirstName, setFamFirstName, famLastName, setFamLastName, famRelationship, setFamRelationship,
  famAge, setFamAge, famGender, setFamGender, famBloodGroup, setFamBloodGroup,
  famEmergencyContact, setFamEmergencyContact, famAllergies, setFamAllergies,
  famHeight, setFamHeight, famWeight, setFamWeight, famPrescription, setFamPrescription,
  famMedication, setFamMedication, famPain, setFamPain, famError,
  handleAddFamily, handleDocDelete, submitting, familyMembers, familyDocs, setFamilyDocs,
  setDocFilter, setActiveTab, apiFetch, downloadQRCode
}) => {
  return (
    <div>
      
      {/* If a family member sub-profile is selected, show details & QR */}
      {selectedFamilyMember ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setSelectedFamilyMember(null)} className="btn btn-secondary" style={{ 
              padding: '0.4rem 0.8rem', 
              fontSize: '0.85rem',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(0, 137, 123, 0.3)',
              borderRadius: '8px',
              color: '#00695c',
              cursor: 'pointer'
            }}>
              &larr; Back to Family List
            </button>
            <h3 style={{ fontSize: '1.4rem', color: '#1a3a3a' }}>{selectedFamilyMember.first_name}'s Sub-Profile</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Bio & Vitals */}
            <div className="glass-card" style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(0, 137, 123, 0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1.2rem', color: '#00897b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={16} />
                <span>Physical Vitals</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', fontSize: '0.85rem' }}>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Relationship</p>
                  <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{selectedFamilyMember.relationship}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Age</p>
                  <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{selectedFamilyMember.age ?? 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Gender</p>
                  <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{selectedFamilyMember.gender || 'Unspecified'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Blood Group</p>
                  <p style={{ fontWeight: 700, color: '#d32f2f' }}>{selectedFamilyMember.blood_group || 'Unspecified'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Height</p>
                  <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{selectedFamilyMember.height || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Weight</p>
                  <p style={{ fontWeight: 700, color: '#1a3a3a' }}>{selectedFamilyMember.weight || 'N/A'}</p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', margin: '1.5rem 0 1rem', color: '#00897b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ClipboardList size={16} />
                <span>Medical History</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Major Allergies</p>
                  <p style={{ color: '#1a3a3a' }}>{selectedFamilyMember.major_allergies || 'None logged.'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Active Prescriptions</p>
                  <p style={{ color: '#1a3a3a', whiteSpace: 'pre-line' }}>{selectedFamilyMember.active_prescription || 'None logged.'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Current Medications</p>
                  <p style={{ color: '#1a3a3a' }}>{selectedFamilyMember.current_medication || 'None logged.'}</p>
                </div>
                <div>
                  <p style={{ color: '#2c4a4a', textTransform: 'uppercase', fontSize: '0.7rem' }}>Recent Pain Log</p>
                  <p style={{ color: '#1a3a3a' }}>{selectedFamilyMember.recent_pain || 'No pain logged.'}</p>
                </div>
              </div>
            </div>

            {/* Family member QR Pass & Documents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Family Qr Pass */}
              <div className="glass-card" style={{ 
                textAlign: 'center',
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
              }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#43a047' }}>Family Care Pass QR</h3>
                <div style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '12px',
                  width: 'fit-content',
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                }}>
                  <QRCodeCanvas 
                    id={`fam-qr-canvas-${selectedFamilyMember.id}`}
                    value={`${window.location.origin}/shared-profile/${selectedFamilyMember.qr_token}`} 
                    size={150}
                    bgColor="#ffffff"
                    fgColor="#1a3a3a"
                    level="H"
                  />
                </div>
{/* 
                  Live scan count
                  <div style={{ marginBottom: '1rem', background: 'rgba(0, 137, 123, 0.05)', border: '1px solid rgba(0, 137, 123, 0.15)', padding: '0.8rem', borderRadius: '10px', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.7rem', color: '#2c4a4a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>Total Scans</p>
                    <p style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00897b', lineHeight: 1 }}>
                      {selectedFamilyMember.scan_count ?? 0}
                      <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#2c4a4a', marginLeft: '0.4rem' }}>
                        {selectedFamilyMember.last_scanned_at ? `(last ${new Date(selectedFamilyMember.last_scanned_at).toLocaleString()})` : '(no scans yet)'}
                      </span>
                    </p>
                  </div> */}

                <button 
                  onClick={() => downloadQRCode(`fam-qr-canvas-${selectedFamilyMember.id}`, `${selectedFamilyMember.first_name}_${selectedFamilyMember.relationship}`)}
                  className="btn btn-secondary" 
                  style={{ 
                    width: '100%', 
                    fontSize: '0.85rem', 
                    gap: '0.4rem',
                    background: 'rgba(0, 137, 123, 0.1)',
                    border: '1px solid rgba(0, 137, 123, 0.2)',
                    borderRadius: '10px',
                    color: '#00897b',
                    padding: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={14} />
                  <span>Download QR Code</span>
                </button>
              </div>

              {/* Family documents */}
              <div className="glass-card" style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '1.5rem',
                border: '1px solid rgba(0, 137, 123, 0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.5rem' }}>
                  <h4 style={{ fontSize: '1rem', color: '#1a3a3a' }}>Uploaded Health Reports</h4>
                  <button 
                    onClick={() => { setDocFilter(String(selectedFamilyMember.id)); setActiveTab('documents'); }} 
                    className="btn btn-secondary" 
                    style={{ 
                      padding: '0.3rem 0.6rem', 
                      fontSize: '0.75rem', 
                      gap: '0.3rem',
                      background: 'rgba(0, 137, 123, 0.1)',
                      border: '1px solid rgba(0, 137, 123, 0.2)',
                      borderRadius: '6px',
                      color: '#00897b',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={12} />
                    <span>Add Doc</span>
                  </button>
                </div>
                
                {/* We fetch family documents on filter. Let's trigger a fetch */}
                <button 
                  onClick={async () => {
                    const res = await apiFetch(`/documents/?family_member_id=${selectedFamilyMember.id}`);
                    if (res.ok) {
                      const d = await res.json();
                      setFamilyDocs(d);
                    }
                  }}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '0.3rem 0.6rem', 
                    fontSize: '0.75rem', 
                    marginBottom: '0.8rem', 
                    width: '100%',
                    background: 'rgba(67, 160, 71, 0.1)',
                    border: '1px solid rgba(67, 160, 71, 0.2)',
                    borderRadius: '6px',
                    color: '#43a047',
                    cursor: 'pointer'
                  }}
                >
                  Click to Sync/Show Reports Vault
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '180px', overflowY: 'auto' }}>
                  {familyDocs.length === 0 ? (
                    <p style={{ color: '#2c4a4a', fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>No reports uploaded for {selectedFamilyMember.first_name}.</p>
                  ) : (
                    familyDocs.map(doc => (
                      <div key={doc.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '0.6rem 0.8rem', 
                        background: 'rgba(0, 137, 123, 0.05)', 
                        borderRadius: '6px', 
                        border: '1px solid rgba(0, 137, 123, 0.1)' 
                      }}>
                        <span style={{ fontSize: '0.8rem', color: '#1a3a3a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }} title={doc.title}>{doc.title}</span>
                        <div style={{ display: 'flex', gap: '0.3rem' }}>
                          <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(0, 137, 123, 0.1)', border: '1px solid rgba(0, 137, 123, 0.2)', borderRadius: '4px', color: '#00897b', cursor: 'pointer' }}><Download size={10} /></a>
                          <button onClick={() => handleDocDelete(doc.id)} className="btn btn-danger" style={{ padding: '0.2rem 0.4rem', fontSize: '0.7rem', background: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.2)', borderRadius: '4px', color: '#d32f2f', cursor: 'pointer' }}><Trash2 size={10} /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      ) : showAddFamilyForm ? (
        /* Add family member Form */
        <div className="glass-card" style={{ 
          maxWidth: '650px', 
          margin: '0 auto',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.5rem', color: '#1a3a3a' }}>Add Family Sub-Profile</h3>
          
          {famError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.2)', padding: '0.6rem 1rem', borderRadius: '8px', color: '#d32f2f', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              <AlertCircle size={14} />
              <span>{famError}</span>
            </div>
          )}

          <form onSubmit={handleAddFamily} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>First Name</label>
                <input type="text" value={famFirstName} onChange={(e) => setFamFirstName(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Last Name</label>
                <input type="text" value={famLastName} onChange={(e) => setFamLastName(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Relationship</label>
                <input type="text" placeholder="e.g. Spouse, Child, Father" value={famRelationship} onChange={(e) => setFamRelationship(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} required />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Age</label>
                <input type="number" value={famAge} onChange={(e) => setFamAge(e.target.value === '' ? '' : Number(e.target.value))} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Gender</label>
                <select 
                  value={famGender} 
                  onChange={(e) => setFamGender(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Blood Group</label>
                <select 
                  value={famBloodGroup} 
                  onChange={(e) => setFamBloodGroup(e.target.value)} 
                  className="form-input" 
                  style={{ 
                    width: '100%', 
                    padding: '0.8rem', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    borderRadius: '10px', 
                    color: '#1a3a3a' 
                  }}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ color: '#2c4a4a' }}>Emergency Phone</label>
                <input type="text" value={famEmergencyContact} onChange={(e) => setFamEmergencyContact(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Height</label>
                  <input type="text" placeholder="165 cm" value={famHeight} onChange={(e) => setFamHeight(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Weight</label>
                  <input type="text" placeholder="55 kg" value={famWeight} onChange={(e) => setFamWeight(e.target.value)} className="form-input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a' }} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Allergies</label>
              <textarea value={famAllergies} onChange={(e) => setFamAllergies(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Active Prescriptions</label>
              <textarea value={famPrescription} onChange={(e) => setFamPrescription(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Current Medication</label>
              <textarea value={famMedication} onChange={(e) => setFamMedication(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#2c4a4a' }}>Pain Log (Discomfort Description)</label>
              <textarea value={famPain} onChange={(e) => setFamPain(e.target.value)} className="form-input" rows={2} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0, 137, 123, 0.15)', borderRadius: '10px', color: '#1a3a3a', resize: 'vertical' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #00897b, #43a047)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 600, padding: '0.8rem', cursor: 'pointer' }} disabled={submitting}>Add Member</button>
              <button type="button" onClick={() => setShowAddFamilyForm(false)} className="btn btn-secondary" style={{ flex: 1, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(0, 137, 123, 0.3)', borderRadius: '10px', color: '#00695c', fontWeight: 600, padding: '0.8rem', cursor: 'pointer' }}>Cancel</button>
            </div>
          </form>
        </div>

      ) : (
        /* Family list view */
        <div className="glass-card" style={{
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.8rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '1.25rem', color: '#1a3a3a' }}>
              <Users size={20} style={{ color: '#00897b' }} />
              <span>Family Accounts</span>
            </h3>
            <button onClick={() => setShowAddFamilyForm(true)} className="btn btn-primary" style={{ 
              padding: '0.5rem 1rem', 
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #00897b, #43a047)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              gap: '0.3rem',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <Plus size={14} />
              <span>Add Member</span>
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <p style={{ color: '#2c4a4a', textAlign: 'center', padding: '3rem 0', fontSize: '0.95rem' }}>
              No family sub-profiles created yet. You can store separate health histories for family members here.
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {familyMembers.map((member) => (
                <div 
                  key={member.id} 
                  style={{
                    background: 'rgba(0, 137, 123, 0.05)',
                    border: '1px solid rgba(0, 137, 123, 0.1)',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.2rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.2rem', color: '#1a3a3a', marginBottom: '0.2rem' }}>{member.first_name} {member.last_name}</h4>
                    <span className="badge badge-admin" style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(0, 137, 123, 0.1)',
                      border: '1px solid rgba(0, 137, 123, 0.2)',
                      borderRadius: '4px',
                      color: '#00897b'
                    }}>{member.relationship}</span>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#2c4a4a' }}>
                      <span>Age: <strong style={{ color: '#1a3a3a' }}>{member.age ?? 'N/A'}</strong></span>
                      <span>Blood: <strong style={{ color: '#d32f2f' }}>{member.blood_group || 'N/A'}</strong></span>
                    </div>
                  </div>

                  <button 
                    onClick={() => { setSelectedFamilyMember(member); setFamilyDocs([]); }} 
                    className="btn btn-secondary" 
                    style={{ 
                      width: '100%', 
                      fontSize: '0.85rem',
                      background: 'rgba(0, 137, 123, 0.1)',
                      border: '1px solid rgba(0, 137, 123, 0.2)',
                      borderRadius: '8px',
                      color: '#00897b',
                      padding: '0.6rem',
                      cursor: 'pointer'
                    }}
                  >
                    Manage Sub-Profile & QR &rarr;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};