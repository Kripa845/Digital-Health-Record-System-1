import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, Search, AlertCircle } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (healthcareId: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerId = "qr-reader-viewport";

  useEffect(() => {
    // Clean up scanner on unmount
    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const startScanner = async () => {
    setError(null);
    setScanning(true);
    
    // Give DOM a tick to render viewport
    setTimeout(async () => {
      try {
        const html5Qrcode = new Html5Qrcode(scannerId);
        qrCodeRef.current = html5Qrcode;

        await html5Qrcode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: (width, height) => {
              const size = Math.min(width, height) * 0.7;
              return { width: size, height: size };
            }
          },
          (decodedText) => {
            // Success callback
            onScanSuccess(decodedText);
            stopScanner();
          },
          () => {
            // Verbose error logging can be skipped as it fires constantly during scanning
          }
        );
      } catch (err: any) {
        console.error("Camera init error:", err);
        setError("Could not access camera. Please check permissions or use manual lookup below.");
        setScanning(false);
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      try {
        await qrCodeRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Failed to stop scanning:", err);
      }
    } else {
      setScanning(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualId.trim()) {
      onScanSuccess(manualId.trim().toUpperCase());
    }
  };

  return (
    <div className="glass-card" style={{ textAlign: 'center' }}>
      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>Scan Patient QR</h3>
      <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        Point your camera at a patient's E-Health Pass or search using their ID manually.
      </p>

      {/* Camera Scanning Viewport */}
      {scanning ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <div id={scannerId} className="scanner-viewport" style={{ height: '300px' }}></div>
          <button 
            onClick={stopScanner} 
            className="btn btn-danger" 
            style={{ marginTop: '1rem', width: '100%', maxWidth: '200px' }}
          >
            Cancel Scanning
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div 
            onClick={startScanner}
            className="pulse-glow"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, hsla(var(--primary), 0.1) 0%, hsla(var(--secondary), 0.1) 100%)',
              border: '2px dashed hsla(var(--primary), 0.4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              marginBottom: '1rem'
            }}
          >
            <Camera size={36} style={{ color: 'hsl(var(--primary))', marginBottom: '0.2rem' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>
              Launch Cam
            </span>
          </div>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'hsl(var(--accent-red))',
              background: 'rgba(235, 87, 87, 0.1)',
              padding: '0.6rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              maxWidth: '400px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', margin: '2rem 0', color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
        <span style={{ padding: '0 1rem', textTransform: 'uppercase', fontWeight: 600 }}>Or Manual Lookup</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }}></div>
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.8rem', maxWidth: '400px', margin: '0 auto' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="text" 
            placeholder="e.g. EH-2026-X8Y9Z"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
        </div>
        <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem' }}>
          Search
        </button>
      </form>
    </div>
  );
};
