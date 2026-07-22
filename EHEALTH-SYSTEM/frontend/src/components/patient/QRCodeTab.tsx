import React from 'react';
import { QrCode, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeTabProps {
  secureQrUrl: string;
  patientFullName: string;
  downloadQRCode: (canvasId: string, name: string) => void;
}

export const QRCodeTab: React.FC<QRCodeTabProps> = ({
  secureQrUrl, patientFullName, downloadQRCode
}) => {
  return (
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
  );
};