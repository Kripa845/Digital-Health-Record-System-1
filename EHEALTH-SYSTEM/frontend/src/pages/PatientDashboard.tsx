import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';
import { QRCodeCanvas } from 'qrcode.react';

import { 
  Heart, ClipboardList, PlusCircle, AlertCircle, 
  User, FileText, CheckCircle2, 
  QrCode, Users, Plus, Edit2, Download, Trash2
} 

from 'lucide-react';

interface PatientProfileData {
  id: number;
  healthcare_id: string;
  date_of_birth: string | null;
  gender: string;
  blood_type: string;
  contact_number: string;
  address: string;
  
  // Mero Care Card fields
  age: number | null;
  blood_group: string;
  emergency_contact: string;
  major_allergies: string;
  height: string;
  weight: string;
  active_prescription: string;
  current_medication: string;
  recent_pain: string;
  is_profile_setup: boolean;
  qr_token: string;
  scan_count?: number;
  last_scanned_at?: string | null;
}

interface FamilyMemberData {
  id: number;
  first_name: string;
  last_name: string;
  relationship: string;
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
  scan_count?: number;
  last_scanned_at?: string | null;
}

interface DocumentData {
  id: number;
  title: string;
  file_url: string;
  file_size: string;
  file_type: string;
  uploaded_at: string;
}

export const PatientDashboard: React.FC = () => {
  const { user, token, apiFetch, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tabs: 'profile' | 'documents' | 'qr' | 'family'
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'qr' | 'family'>('profile');

  // Edit states for main profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editAge, setEditAge] = useState<number | ''>('');
  const [editGender, setEditGender] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editEmergencyContact, setEditEmergencyContact] = useState('');
  const [editAllergies, setEditAllergies] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editPrescription, setEditPrescription] = useState('');
  const [editMedication, setEditMedication] = useState('');
  const [editPain, setEditPain] = useState('');
  const [editSuccessMsg, setEditSuccessMsg] = useState(false);

  // Document states
  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('main'); // 'main' or family member ID

  // Family states
  const [showAddFamilyForm, setShowAddFamilyForm] = useState(false);
  const [selectedFamilyMember, setSelectedFamilyMember] = useState<FamilyMemberData | null>(null);
  const [famFirstName, setFamFirstName] = useState('');
  const [famLastName, setFamLastName] = useState('');
  const [famRelationship, setFamRelationship] = useState('');
  const [famAge, setFamAge] = useState<number | ''>('');
  const [famGender, setFamGender] = useState('');
  const [famBloodGroup, setFamBloodGroup] = useState('');
  const [famEmergencyContact, setFamEmergencyContact] = useState('');
  const [famAllergies, setFamAllergies] = useState('');
  const [famHeight, setFamHeight] = useState('');
  const [famWeight, setFamWeight] = useState('');
  const [famPrescription, setFamPrescription] = useState('');
  const [famMedication, setFamMedication] = useState('');
  const [famPain, setFamPain] = useState('');
  const [famError, setFamError] = useState<string | null>(null);
// Account deletion states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // Document vault specific to family members
  const [familyDocs, setFamilyDocs] = useState<DocumentData[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Profile
      const profRes = await apiFetch('/patients/me/');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        
        // Populate edit fields
        setEditAge(profData.age ?? '');
        setEditGender(profData.gender || '');
        setEditBloodGroup(profData.blood_group || '');
        setEditEmergencyContact(profData.emergency_contact || '');
        setEditAllergies(profData.major_allergies || '');
        setEditHeight(profData.height || '');
        setEditWeight(profData.weight || '');
        setEditPrescription(profData.active_prescription || '');
        setEditMedication(profData.current_medication || '');
        setEditPain(profData.recent_pain || '');
        
        // If profile setup, load documents & family members
        if (profData.is_profile_setup) {
          // 2. Fetch family members
          const famRes = await apiFetch('/family/');
          if (famRes.ok) {
            const famData = await famRes.json();
            setFamilyMembers(famData);
          }

          // 3. Fetch documents
          const docRes = await apiFetch('/documents/?family_member_id=main');
          if (docRes.ok) {
            const docData = await docRes.json();
            setDocuments(docData);
          }
        }
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Live scan-count refresh (point 9 & 10): polls only the counters so it
  // never overwrites fields the user is currently editing.
  const refreshScanCounts = async () => {
    try {
      const profRes = await apiFetch('/patients/me/');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(prev => prev ? { ...prev, scan_count: profData.scan_count, last_scanned_at: profData.last_scanned_at } : prev);
      }
      const famRes = await apiFetch('/family/');
      if (famRes.ok) {
        const famData = await famRes.json();
        setFamilyMembers(prev => prev.map(m => {
          const upd = famData.find((f: FamilyMemberData) => f.id === m.id);
          return upd ? { ...m, scan_count: upd.scan_count, last_scanned_at: upd.last_scanned_at } : m;
        }));
        setSelectedFamilyMember(prev => {
          if (!prev) return prev;
          const upd = famData.find((f: FamilyMemberData) => f.id === prev.id);
          return upd ? { ...prev, scan_count: upd.scan_count, last_scanned_at: upd.last_scanned_at } : prev;
        });
      }
    } catch (err) {
      // Ignore transient polling errors.
    }
  };

  useEffect(() => {
    const id = setInterval(refreshScanCounts, 10000);
    return () => clearInterval(id);
  }, []);

  // Fetch documents whenever filter changes
  useEffect(() => {
    if (!profile || !profile.is_profile_setup) return;
    
    const fetchFilteredDocs = async () => {
      const url = `/documents/?family_member_id=${docFilter}`;
      const res = await apiFetch(url);
      if (res.ok) {
        const docData = await res.json();
        if (docFilter === 'main') {
          setDocuments(docData);
        } else {
          setFamilyDocs(docData);
        }
      }
    };
    fetchFilteredDocs();
  }, [docFilter]);

  // Handle first time setup & edits
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch('/patients/me/', {
        method: 'PATCH',
        body: JSON.stringify({
          age: editAge === '' ? null : Number(editAge),
          gender: editGender,
          blood_group: editBloodGroup,
          emergency_contact: editEmergencyContact,
          major_allergies: editAllergies,
          height: editHeight,
          weight: editWeight,
          active_prescription: editPrescription,
          current_medication: editMedication,
          recent_pain: editPain,
          is_profile_setup: true // Always set true on submit
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditingProfile(false);
        setEditSuccessMsg(true);
        setTimeout(() => setEditSuccessMsg(false), 3000);
        // Reload details (especially documents/family list)
        loadDashboardData();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle document upload
  const handleDocUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDocError(null);
    setDocSuccess(false);

    if (!docTitle.trim() || !selectedFile) {
      setDocError("File title and a selected document are required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', docTitle);
      formData.append('file', selectedFile);
      if (docFilter !== 'main') {
        formData.append('family_member', docFilter);
      }

      // Upload file directly using native fetch to handle FormData boundaries
      const response = await fetch(`${API_BASE}/documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const newDoc = await response.json();
        if (docFilter === 'main') {
          setDocuments([newDoc, ...documents]);
        } else {
          setFamilyDocs([newDoc, ...familyDocs]);
        }
        setDocTitle('');
        setSelectedFile(null);
        // reset file input element manually
        const fileInput = document.getElementById('doc-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        setDocSuccess(true);
      } else {
        const errorData = await response.json();
        setDocError(errorData.detail || "Failed to upload document.");
      }
    } catch (err) {
      setDocError("Network error. Unable to upload document.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Password is required to delete your account.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await deleteAccount(deletePassword);
      if (result.success) {
        navigate('/');
      } else {
        setDeleteError(result.error || 'Incorrect password. Please try again.');
      }
    } catch (err) {
      setDeleteError('Network error. Unable to process request.');
    } finally {
      setSubmitting(false);
    }
  };
  // Delete document
  const handleDocDelete = async (id: number) => {
    try {
      const res = await apiFetch(`/documents/${id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(documents.filter(d => d.id !== id));
        setFamilyDocs(familyDocs.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // Handle adding family member
  const handleAddFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setFamError(null);
    if (!famFirstName.trim() || !famLastName.trim() || !famRelationship.trim()) {
      setFamError("First name, Last name, and Relationship are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/family/', {
        method: 'POST',
        body: JSON.stringify({
          first_name: famFirstName,
          last_name: famLastName,
          relationship: famRelationship,
          age: famAge === '' ? null : Number(famAge),
          gender: famGender,
          blood_group: famBloodGroup,
          emergency_contact: famEmergencyContact,
          major_allergies: famAllergies,
          height: famHeight,
          weight: famWeight,
          active_prescription: famPrescription,
          current_medication: famMedication,
          recent_pain: famPain
        })
      });

      if (res.ok) {
        const newFam = await res.json();
        setFamilyMembers([...familyMembers, newFam]);
        
        // Reset form fields
        setFamFirstName('');
        setFamLastName('');
        setFamRelationship('');
        setFamAge('');
        setFamGender('');
        setFamBloodGroup('');
        setFamEmergencyContact('');
        setFamAllergies('');
        setFamHeight('');
        setFamWeight('');
        setFamPrescription('');
        setFamMedication('');
        setFamPain('');
        
        setShowAddFamilyForm(false);
      } else {
        const errJson = await res.json();
        setFamError(errJson.detail || "Unable to save family profile.");
      }
    } catch (err) {
      setFamError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // QR Downloader Action
  const downloadQRCode = (canvasId: string, name: string) => {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `Mero_Care_Pass_${name.replace(/\s+/g, '_')}.png`;
      link.click();
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '80vh', 
        gap: '1rem',
        background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)'
      }}>
        <div className="pulse-glow" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #00897b, #43a047)' }}></div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#1a3a3a' }}>Syncing Health Records...</p>
      </div>
    );
  }

  const patientFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'Patient';

  // SCREEN 1: FIRST-TIME SETUP PROFILE WIZARD
  if (profile && !profile.is_profile_setup) {
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
  }

  // SCREEN 2: MAIN patient DASHBOARD
  const secureQrUrl = `${window.location.origin}/shared-profile/${profile?.qr_token}`;

  return (
    <div className="container" style={{
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
      minHeight: '100vh',
      padding: '2rem 1.5rem'
    }}>
      
      {/* Dashboard Welcome Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 800, marginBottom: '0.2rem', color: '#1a3a3a' }}>
            Welcome, <span style={{ background: 'linear-gradient(135deg, #00695c, #1a3a3a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{patientFullName}</span>
          </h1>
          <p style={{ color: '#2c4a4a', fontSize: '0.9rem' }}>Healthcare ID: <span style={{ color: '#00897b', fontWeight: 600 }}>{profile?.healthcare_id}</span></p>
        </div>
        <button
          onClick={() => { setShowDeleteConfirm(true); setDeletePassword(''); setDeleteError(null); }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1.1rem',
            background: 'rgba(211, 47, 47, 0.08)',
            border: '1px solid rgba(211, 47, 47, 0.35)',
            borderRadius: '8px',
            color: '#c62828',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={14} />
          Delete Account
        </button>
      </header>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'rgba(211, 47, 47, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Trash2 size={20} style={{ color: '#c62828' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#1a3a3a', margin: 0 }}>Delete Account</h3>
                <p style={{ fontSize: '0.8rem', color: '#2c4a4a', margin: 0 }}>This action is permanent and cannot be undone.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#4a4a4a', marginBottom: '1.4rem', lineHeight: 1.6 }}>
              All your health records, documents, family profiles and QR passes will be permanently deleted.
              Enter your account password to confirm.
            </p>

            <form onSubmit={handleDeleteAccount} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#2c4a4a', marginBottom: '0.4rem' }}>
                  Account Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: deleteError ? '1px solid #d32f2f' : '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '10px',
                    fontSize: '0.9rem',
                    color: '#1a3a3a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              {deleteError && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: 'rgba(211, 47, 47, 0.08)',
                  border: '1px solid rgba(211, 47, 47, 0.25)',
                  padding: '0.6rem 0.9rem', borderRadius: '8px',
                  color: '#c62828', fontSize: '0.82rem',
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{deleteError}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); setDeleteError(null); }}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '10px', color: '#1a3a3a',
                    fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    flex: 1, padding: '0.75rem',
                    background: submitting ? 'rgba(211, 47, 47, 0.5)' : 'linear-gradient(135deg, #c62828, #d32f2f)',
                    border: 'none', borderRadius: '10px',
                    color: '#fff', fontWeight: 600, fontSize: '0.9rem',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                  }}
                >
                  {submitting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Main Dashboard Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid rgba(0, 137, 123, 0.15)',
          paddingBottom: '0.5rem',
          flexWrap: 'wrap',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: '0.5rem'
        }}>
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`tab-link-btn ${activeTab === 'profile' ? 'active' : ''}`}
            style={{
              background: activeTab === 'profile' ? '#00897b' : 'none',
              border: 'none',
              font: 'inherit',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              color: activeTab === 'profile' ? '#fff' : '#2c4a4a',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={16} />
              <span>My Profile</span>
            </div>
          </button>
          <button 
            onClick={() => { setActiveTab('documents'); setDocFilter('main'); }} 
            className={`tab-link-btn ${activeTab === 'documents' ? 'active' : ''}`}
            style={{
              background: activeTab === 'documents' ? '#00897b' : 'none',
              border: 'none',
              font: 'inherit',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              color: activeTab === 'documents' ? '#fff' : '#2c4a4a',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} />
              <span>Add Document</span>
            </div>
          </button>
          <button 
            onClick={() => setActiveTab('qr')} 
            className={`tab-link-btn ${activeTab === 'qr' ? 'active' : ''}`}
            style={{
              background: activeTab === 'qr' ? '#00897b' : 'none',
              border: 'none',
              font: 'inherit',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              color: activeTab === 'qr' ? '#fff' : '#2c4a4a',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <QrCode size={16} />
              <span>QR Code</span>
            </div>
          </button>
          <button 
            onClick={() => { setActiveTab('family'); setSelectedFamilyMember(null); }} 
            className={`tab-link-btn ${activeTab === 'family' ? 'active' : ''}`}
            style={{
              background: activeTab === 'family' ? '#00897b' : 'none',
              border: 'none',
              font: 'inherit',
              padding: '0.8rem 1.2rem',
              cursor: 'pointer',
              color: activeTab === 'family' ? '#fff' : '#2c4a4a',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Users size={16} />
              <span>Add Family</span>
            </div>
          </button>
        </div>

        {/* TAB CONTENTS */}

        {/* 1. MY PROFILE TAB */}
        {activeTab === 'profile' && (
          
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
          
        )}

        {/* 2. DOCUMENT LIBRARY TAB */}
        {activeTab === 'documents' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            
            {/* Upload Document Form */}
            <div className="glass-card" style={{
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '1.5rem',
              border: '1px solid rgba(0, 137, 123, 0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 137, 123, 0.15)', paddingBottom: '0.8rem', color: '#1a3a3a' }}>
                <PlusCircle size={18} style={{ color: '#00897b' }} />
                <span>Upload Vitals Document</span>
              </h3>

              {docError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(211, 47, 47, 0.1)', border: '1px solid rgba(211, 47, 47, 0.2)', padding: '0.6rem 1rem', borderRadius: '8px', color: '#d32f2f', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                  <AlertCircle size={14} />
                  <span>{docError}</span>
                </div>
              )}

              {docSuccess && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(67, 160, 71, 0.1)', border: '1px solid rgba(67, 160, 71, 0.3)', padding: '0.6rem 1rem', borderRadius: '8px', color: '#1a3a3a', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                  <CheckCircle2 size={14} style={{ color: '#43a047' }} />
                  <span>File successfully saved to vault!</span>
                </div>
              )}

              <form onSubmit={handleDocUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                
                <div className="form-group">
                  <label className="form-label" style={{ color: '#2c4a4a' }}>For Account</label>
                  <select 
                    value={docFilter} 
                    onChange={(e) => setDocFilter(e.target.value)} 
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
                    <option value="main">Primary Account ({patientFullName})</option>
                    {familyMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.first_name} {m.last_name} ({m.relationship})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Document Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Blood Test Report, MRI Scan" 
                    value={docTitle} 
                    onChange={(e) => setDocTitle(e.target.value)} 
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
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Select File (PDF, Images)</label>
                  <input 
                    id="doc-file-input"
                    type="file" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }} 
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

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #00897b, #43a047)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '0.8rem'
                  }}
                  disabled={submitting}
                >
                  {submitting ? "Uploading file..." : "Upload Document"}
                </button>
              </form>
            </div>

            {/* Document Vault Listing */}
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
                  <FileText size={18} style={{ color: '#00897b' }} />
                  <span>Document Vault</span>
                </h3>
                
                {/* Switch list preview between Main and Family */}
                <select 
                  value={docFilter} 
                  onChange={(e) => setDocFilter(e.target.value)} 
                  style={{ 
                    padding: '0.3rem 0.5rem', 
                    borderRadius: '8px', 
                    background: 'rgba(255,255,255,0.5)', 
                    border: '1px solid rgba(0, 137, 123, 0.15)', 
                    color: '#1a3a3a', 
                    fontSize: '0.8rem' 
                  }}
                >
                  <option value="main">My Documents</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.first_name}'s Docs</option>
                  ))}
                </select>
              </div>

              {/* File list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '420px', overflowY: 'auto' }}>
                {(docFilter === 'main' ? documents : familyDocs).length === 0 ? (
                  <p style={{ color: '#2c4a4a', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No documents uploaded in this folder.</p>
                ) : (
                  (docFilter === 'main' ? documents : familyDocs).map((doc) => (
                    <div key={doc.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.8rem 1rem',
                      background: 'rgba(0, 137, 123, 0.05)',
                      border: '1px solid rgba(0, 137, 123, 0.1)',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        <FileText size={20} style={{ color: '#43a047' }} />
                        <div>
                          <h4 style={{ fontSize: '0.9rem', color: '#1a3a3a', fontWeight: 600 }}>{doc.title}</h4>
                          <p style={{ fontSize: '0.7rem', color: '#2c4a4a' }}>{new Date(doc.uploaded_at).toLocaleDateString()} &bull; {doc.file_size}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <a 
                          href={doc.file_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-secondary" 
                          style={{ 
                            padding: '0.4rem', 
                            borderRadius: '6px',
                            background: 'rgba(0, 137, 123, 0.1)',
                            border: '1px solid rgba(0, 137, 123, 0.2)',
                            color: '#00897b',
                            cursor: 'pointer',
                            display: 'inline-flex'
                          }}
                          title="Download/View file"
                        >
                          <Download size={12} />
                        </a>
                        <button 
                          onClick={() => handleDocDelete(doc.id)} 
                          className="btn btn-danger" 
                          style={{ 
                            padding: '0.4rem', 
                            borderRadius: '6px',
                            background: 'rgba(211, 47, 47, 0.1)',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                            color: '#d32f2f',
                            cursor: 'pointer',
                            display: 'inline-flex'
                          }}
                          title="Delete file"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* 3. QR CODE PASS TAB */}
        {activeTab === 'qr' && (
          <div className="glass-card" style={{ 
            maxWidth: '450px', 
            margin: '0 auto', 
            textAlign: 'center',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            padding: '2rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', justifyContent: 'center', marginBottom: '1.5rem', color: '#1a3a3a' }}>
              <QrCode size={20} style={{ color: '#00897b' }} />
              <span>Digital Mero Care QR Pass</span>
            </h3>

            <p style={{ color: '#2c4a4a', fontSize: '0.85rem', marginBottom: '1.8rem' }}>
              This QR code acts as your dynamic medical pass. It contains only a secure, encrypted token link. Doctors scanning this pass will retrieve your latest live vitals securely.
            </p>

            {/* Render Canvas QR Code */}
            <div style={{
              background: '#ffffff',
              padding: '1.5rem',
              borderRadius: '16px',
              width: 'fit-content',
              margin: '0 auto 2rem',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)'
            }}>
              <QRCodeCanvas 
                id="main-patient-qr-canvas"
                value={secureQrUrl} 
                size={200}
                bgColor="#ffffff"
                fgColor="#1a3a3a"
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ marginBottom: '2rem', textAlign: 'left', background: 'rgba(0, 137, 123, 0.05)', border: '1px solid rgba(0, 137, 123, 0.15)', padding: '1rem', borderRadius: '10px' }}>
              <p style={{ fontSize: '0.7rem', color: '#2c4a4a', textTransform: 'uppercase', fontWeight: 600 }}>Secure QR Link</p>
              <p style={{ fontSize: '0.8rem', color: '#00897b', wordBreak: 'break-all', fontFamily: 'var(--font-display)' }}>
                {secureQrUrl}
              </p>
            </div>

            {/* Live scan count (updates automatically) */}
            {/* <div style={{ marginBottom: '1.5rem', background: 'rgba(0, 137, 123, 0.05)', border: '1px solid rgba(0, 137, 123, 0.15)', padding: '1rem', borderRadius: '10px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', color: '#2c4a4a', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.25rem' }}>Total Scans</p>
              <p style={{ fontSize: '1.6rem', fontWeight: 800, color: '#00897b', lineHeight: 1 }}>
                {profile?.scan_count ?? 0}
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#2c4a4a', marginLeft: '0.4rem' }}>
                  {profile?.last_scanned_at ? `(last ${new Date(profile.last_scanned_at).toLocaleString()})` : '(no scans yet)'}
                </span>
              </p>
            </div> */}

            <button 
              onClick={() => downloadQRCode('main-patient-qr-canvas', patientFullName)}
              className="btn btn-primary" 
              style={{ 
                width: '100%', 
                padding: '1rem',
                background: 'linear-gradient(135deg, #00897b, #43a047)',
                border: 'none',
                borderRadius: '10px',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                gap: '0.5rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Download size={16} />
              <span>Download Health Pass</span>
            </button>
          </div>
        )}

        {/* 4. ADD FAMILY TAB */}
        {activeTab === 'family' && (
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
        )}

      </div>
    </div>
  );
};