import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

import { AlertCircle, User, FileText, QrCode, Users, Trash2 } from 'lucide-react';

import type { PatientProfileData, FamilyMemberData, DocumentData } from '../types/patient';
import { ProfileSetupWizard } from '../components/patient/ProfileSetupWizard';
import { ProfileTab } from '../components/patient/ProfileTab';
import { DocumentsTab } from '../components/patient/DocumentsTab';
import { QRCodeTab } from '../components/patient/QRCodeTab';
import { FamilyTab } from '../components/patient/FamilyTab';

export const PatientDashboard: React.FC = () => {
  const { user, token, apiFetch, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<PatientProfileData | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'qr' | 'family'>('profile');

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

  const [docTitle, setDocTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [docSuccess, setDocSuccess] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('main');

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [familyDocs, setFamilyDocs] = useState<DocumentData[]>([]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const profRes = await apiFetch('/patients/me/');
      if (profRes.ok) {
        const profData = await profRes.json();
        setProfile(profData);
        
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
        
        if (profData.is_profile_setup) {
          const famRes = await apiFetch('/family/');
          if (famRes.ok) {
            const famData = await famRes.json();
            setFamilyMembers(famData);
          }

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
    }
  };

  useEffect(() => {
    const id = setInterval(refreshScanCounts, 10000);
    return () => clearInterval(id);
  }, []);

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
          is_profile_setup: true
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setIsEditingProfile(false);
        setEditSuccessMsg(true);
        setTimeout(() => setEditSuccessMsg(false), 3000);
        loadDashboardData();
      }
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setSubmitting(false);
    }
  };

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
  const secureQrUrl = `${window.location.origin}/shared-profile/${profile?.qr_token}`;

  if (profile && !profile.is_profile_setup) {
    return (
      <ProfileSetupWizard
        editAge={editAge} setEditAge={setEditAge}
        editGender={editGender} setEditGender={setEditGender}
        editBloodGroup={editBloodGroup} setEditBloodGroup={setEditBloodGroup}
        editEmergencyContact={editEmergencyContact} setEditEmergencyContact={setEditEmergencyContact}
        editAllergies={editAllergies} setEditAllergies={setEditAllergies}
        editHeight={editHeight} setEditHeight={setEditHeight}
        editWeight={editWeight} setEditWeight={setEditWeight}
        editPrescription={editPrescription} setEditPrescription={setEditPrescription}
        editMedication={editMedication} setEditMedication={setEditMedication}
        editPain={editPain} setEditPain={setEditPain}
        handleProfileSave={handleProfileSave}
        submitting={submitting}
      />
    );
  }

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
        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            isEditingProfile={isEditingProfile}
            setIsEditingProfile={setIsEditingProfile}
            editAge={editAge} setEditAge={setEditAge}
            editGender={editGender} setEditGender={setEditGender}
            editBloodGroup={editBloodGroup} setEditBloodGroup={setEditBloodGroup}
            editEmergencyContact={editEmergencyContact} setEditEmergencyContact={setEditEmergencyContact}
            editHeight={editHeight} setEditHeight={setEditHeight}
            editWeight={editWeight} setEditWeight={setEditWeight}
            editAllergies={editAllergies} setEditAllergies={setEditAllergies}
            editPrescription={editPrescription} setEditPrescription={setEditPrescription}
            editMedication={editMedication} setEditMedication={setEditMedication}
            editPain={editPain} setEditPain={setEditPain}
            editSuccessMsg={editSuccessMsg}
            handleProfileSave={handleProfileSave}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsTab
            docTitle={docTitle} setDocTitle={setDocTitle}
            selectedFile={selectedFile} setSelectedFile={setSelectedFile}
            docError={docError} docSuccess={docSuccess}
            docFilter={docFilter} setDocFilter={setDocFilter}
            handleDocUpload={handleDocUpload}
            handleDocDelete={handleDocDelete}
            submitting={submitting}
            documents={documents}
            familyDocs={familyDocs}
            familyMembers={familyMembers}
            patientFullName={patientFullName}
          />
        )}

        {activeTab === 'qr' && (
          <QRCodeTab
            secureQrUrl={secureQrUrl}
            patientFullName={patientFullName}
            downloadQRCode={downloadQRCode}
          />
        )}

        {activeTab === 'family' && (
          <FamilyTab
            showAddFamilyForm={showAddFamilyForm} setShowAddFamilyForm={setShowAddFamilyForm}
            selectedFamilyMember={selectedFamilyMember} setSelectedFamilyMember={setSelectedFamilyMember}
            famFirstName={famFirstName} setFamFirstName={setFamFirstName}
            famLastName={famLastName} setFamLastName={setFamLastName}
            famRelationship={famRelationship} setFamRelationship={setFamRelationship}
            famAge={famAge} setFamAge={setFamAge}
            famGender={famGender} setFamGender={setFamGender}
            famBloodGroup={famBloodGroup} setFamBloodGroup={setFamBloodGroup}
            famEmergencyContact={famEmergencyContact} setFamEmergencyContact={setFamEmergencyContact}
            famAllergies={famAllergies} setFamAllergies={setFamAllergies}
            famHeight={famHeight} setFamHeight={setFamHeight}
            famWeight={famWeight} setFamWeight={setFamWeight}
            famPrescription={famPrescription} setFamPrescription={setFamPrescription}
            famMedication={famMedication} setFamMedication={setFamMedication}
            famPain={famPain} setFamPain={setFamPain}
            famError={famError}
            handleAddFamily={handleAddFamily}
            handleDocDelete={handleDocDelete}
            submitting={submitting}
            familyMembers={familyMembers}
            familyDocs={familyDocs} setFamilyDocs={setFamilyDocs}
            setDocFilter={setDocFilter}
            setActiveTab={setActiveTab}
            apiFetch={apiFetch}
            downloadQRCode={downloadQRCode}
          />
        )}

      </div>
    </div>
  );
};