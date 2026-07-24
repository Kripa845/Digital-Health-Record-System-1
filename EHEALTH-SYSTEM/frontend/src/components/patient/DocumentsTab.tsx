import React from 'react';
import { PlusCircle, AlertCircle, CheckCircle2, FileText, Download, Trash2 } from 'lucide-react';
import type { DocumentData } from '../../types/patient';

interface DocumentsTabProps {
  docTitle: string;
  setDocTitle: (v: string) => void;
  selectedFile: File | null;
  setSelectedFile: (v: File | null) => void;
  docError: string | null;
  docSuccess: boolean;
  docFilter: string;
  setDocFilter: (v: string) => void;
  handleDocUpload: (e: React.FormEvent) => void;
  handleDocDelete: (id: number) => void;
  submitting: boolean;
  documents: DocumentData[];
  patientFullName: string;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  docTitle, setDocTitle, selectedFile, setSelectedFile, docError, docSuccess,
  docFilter, setDocFilter, handleDocUpload, handleDocDelete, submitting,
  documents, patientFullName
}) => {
  return (
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
              disabled
              value="main" 
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
        </div>

        {/* File list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '420px', overflowY: 'auto' }}>
          {documents.length === 0 ? (
            <p style={{ color: '#2c4a4a', fontSize: '0.9rem', textAlign: 'center', padding: '2rem 0' }}>No documents uploaded in this folder.</p>
          ) : (
            documents.map((doc) => (
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
  );
};
