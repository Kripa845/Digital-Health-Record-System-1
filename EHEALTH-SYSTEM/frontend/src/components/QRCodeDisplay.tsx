import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Shield, Sparkles } from 'lucide-react';

interface QRCodeDisplayProps {
  healthcareId: string;
  patientName: string;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ healthcareId, patientName }) => {
  return (
    <div className="glass-card" style={{
      background: 'linear-gradient(135deg, rgba(13, 16, 27, 0.75) 0%, rgba(20, 26, 46, 0.7) 100%)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'relative',
      overflow: 'hidden',
      maxWidth: '380px',
      margin: '0 auto',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Background glow effects */}
      <div style={{
        position: 'absolute',
        top: '-50px',
        right: '-50px',
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        background: 'hsla(var(--primary), 0.15)',
        filter: 'blur(40px)',
        pointerEvents: 'none'
      }}></div>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Shield size={20} style={{ color: 'hsl(var(--primary))' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.05em', color: 'rgba(255,255,255,0.85)' }}>
            SECURE HEALTH PASS
          </span>
        </div>
        <Sparkles size={16} style={{ color: 'hsl(var(--secondary))' }} />
      </div>

      {/* QR Code Container */}
      <div style={{
        background: '#ffffff',
        padding: '1.2rem',
        borderRadius: 'var(--radius-md)',
        width: 'fit-content',
        margin: '0 auto 2rem',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* Encoding the Healthcare ID directly */}
        <QRCodeSVG 
          value={healthcareId} 
          size={180} 
          bgColor="#ffffff"
          fgColor="#0d0e15"
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Card Info */}
      <div style={{ textAlign: 'left' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))', marginBottom: '0.2rem' }}>
          Cardholder Name
        </p>
        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'white' }}>
          {patientName}
        </h4>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--text-muted))', marginBottom: '0.2rem' }}>
              Healthcare ID
            </p>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'hsl(var(--primary))', letterSpacing: '0.05em' }}>
              {healthcareId}
            </span>
          </div>
          <span className="badge badge-patient" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>Verified</span>
        </div>
      </div>
    </div>
  );
};
