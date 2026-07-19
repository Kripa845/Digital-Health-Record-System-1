import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, HeartHandshake, QrCode, FilePlus2, UserCheck, Stethoscope, Mail, Phone, MapPin, Send, Fullscreen } from 'lucide-react';

export const Home: React.FC = () => {
  const { user } = useAuth();
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactName && contactEmail && contactMessage) {
      setContactSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setContactSuccess(false), 4000);
    }
  };

  // Light health theme colors
  const lightBgStart = '#e8f5e9'; // Light green
  const lightBgEnd = '#e0f2f1'; // Light teal
  const primaryTeal = '#00897b';
  const primaryGreen = '#43a047';
  const lightTeal = '#b2dfdb';
  const lightGreen = '#c8e6c9';
  const cardBg = 'rgba(255,255,255,0.85)';
  const borderColor = 'rgba(0, 137, 123, 0.15)';

  return (
    <div className="container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '4rem',
      background: 'linear-gradient(135deg, #e8f5e9 0%, #e0f2f1 30%, #b2dfdb 60%, #c8e6c9 100%)',
      minHeight: '100vh',
      padding: '2rem 1.5rem',
      color: '#1a2a2a'
    }}>
      
      {/* Hero Section */}
      <section id="home" className="hero" style={{ 
       minHeight: '75vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        textAlign: 'center',
        
        paddingTop: '2rem' 
      }}>
        <h1 className="hero-title" style={{ 
          fontSize: '3rem', 
          lineHeight: 1.2, 
          marginBottom: '1.5rem',
          color: '#1a3a3a'
        }}>
          Mero Care Card <br />
          <span style={{ 
            background: 'linear-gradient(135deg, #00695c, #1a3a3a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Your Health, Unified. Your Vitals, Secured.</span>
        </h1>
        <p className="hero-subtitle" style={{ 
          maxWidth: '700px', 
          margin: '0 auto 2.5rem', 
          fontSize: '1.1rem', 
          color: '#2c4a4a'
        }}>
         Streamline how you manage and share your medical history. Mero Care Card acts as your central digital health ledger, allowing you to securely organize your medical records and grant instant access to verified healthcare professionals via a secure, quick-scan QR code.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link 
              to={user.role === 'PATIENT' ? '/patient-dashboard' : '/admin-dashboard'} 
              className="btn btn-primary btn-lg pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #00897b, #43a047)',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0, 137, 123, 0.2)'
              }}
            >
              Enter Dashboard
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary btn-lg pulse-glow" style={{
                background: 'linear-gradient(135deg, #00897b, #43a047)',
                border: 'none',
                padding: '0.8rem 2rem',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 20px rgba(0, 137, 123, 0.2)'
              }}>Create Free Account</Link>
              <Link to="/login" className="btn btn-secondary btn-lg" style={{
                background: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0, 137, 123, 0.3)',
                padding: '0.8rem 2rem',
                borderRadius: '12px',
                color: '#00695c',
                fontWeight: 600,
                textDecoration: 'none'
              }}>Access Portal</Link>
            </>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ scrollMarginTop: '100px' }}>
        <div className="glass-card" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '3rem', 
          alignItems: 'center',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
        }}>
          <div>
            <span style={{ 
              fontSize: '0.8rem', 
              fontWeight: 800, 
              textTransform: 'uppercase', 
              color: '#00897b', 
              letterSpacing: '0.1em' 
            }}>About Mero Care Card</span>
            <h2 style={{ 
              fontSize: '2.2rem', 
              marginTop: '0.5rem', 
              marginBottom: '1.2rem', 
              fontFamily: 'var(--font-display)',
              color: '#1a3a3a'
            }}>
              Empowering Patients, <br />Simplifying Healthcare.
            </h2>
            <p style={{ marginBottom: '1rem', color: '#2c4a4a' }}>
              Mero Care Card was founded with a single mission: to make personal health histories securely portable. No more carries of bulky health logs, lost prescriptions, or forgotten medication names.
            </p>
            <p style={{ color: '#2c4a4a' }}>
              By combining high-security dynamic QR technology with encrypted local vaults, we ensure that you are always in control of your health data. Medical institutions read exactly what you provide, without storing static data on vulnerable pages.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(0, 137, 123, 0.05)', 
              border: '1px solid rgba(0, 137, 123, 0.15)', 
              borderRadius: '16px',
              backdropFilter: 'blur(5px)'
            }}>
              <Stethoscope size={28} style={{ color: '#00897b', marginBottom: '0.8rem' }} />
              <h4 style={{ marginBottom: '0.4rem', color: '#1a3a3a' }}>Provider Sync</h4>
              <p style={{ fontSize: '0.8rem', color: '#2c4a4a' }}>Doctors scan and fetch live records directly from your database profile.</p>
            </div>
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(67, 160, 71, 0.05)', 
              border: '1px solid rgba(67, 160, 71, 0.15)', 
              borderRadius: '16px',
              backdropFilter: 'blur(5px)'
            }}>
              <ShieldCheck size={28} style={{ color: '#43a047', marginBottom: '0.8rem' }} />
              <h4 style={{ marginBottom: '0.4rem', color: '#1a3a3a' }}>Secure Vault</h4>
              <p style={{ fontSize: '0.8rem', color: '#2c4a4a' }}>Your personal details are hidden behind random cryptographic UUID tokens.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ scrollMarginTop: '100px' }}>
        <h2 style={{ 
          textAlign: 'center', 
          fontFamily: 'var(--font-display)', 
          marginBottom: '3rem', 
          fontSize: '2.2rem',
          color: '#1a3a3a'
        }}>
          Key Features & Capabilities
        </h2>
        
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div className="glass-card feature-card" style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div className="feature-icon-wrapper" style={{ color: '#00897b' }}>
              <QrCode size={24} />
            </div>
            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: '#1a3a3a' }}>Dynamic E-Pass (QR)</h3>
            <p style={{ fontSize: '0.9rem', color: '#2c4a4a' }}>
              Generate custom QR cards that point only to secure UUID endpoints. Medical responders retrieve your latest details instantly when scanning.
            </p>
          </div>

          <div className="glass-card feature-card" style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(67, 160, 71, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div className="feature-icon-wrapper" style={{ color: '#43a047' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: '#1a3a3a' }}>MFA & OTP Protection</h3>
            <p style={{ fontSize: '0.9rem', color: '#2c4a4a' }}>
              Login securely using mobile username, backed by random 6-digit OTP verification codes sent during each access request.
            </p>
          </div>

          <div className="glass-card feature-card" style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(0, 137, 123, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div className="feature-icon-wrapper" style={{ color: '#00897b' }}>
              <FilePlus2 size={24} />
            </div>
            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: '#1a3a3a' }}>Document Library</h3>
            <p style={{ fontSize: '0.9rem', color: '#2c4a4a' }}>
              Upload and organize files directly from your device storage—prescriptions, imaging scans, and clinic lab reports in one place.
            </p>
          </div>

          <div className="glass-card feature-card" style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(67, 160, 71, 0.15)',
            transition: 'all 0.3s ease'
          }}>
            <div className="feature-icon-wrapper" style={{ color: '#43a047' }}>
              <UserCheck size={24} />
            </div>
            <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: '#1a3a3a' }}>Family Sub-Profiles</h3>
            <p style={{ fontSize: '0.9rem', color: '#2c4a4a' }}>
              Add sub-profiles for family members to keep emergency medical records, allergy diaries, and unique download passes for the whole house.
            </p>
          </div>

        </div>
      </section>

      {/* Dual Portal Selection Callout - Updated to Patient Only */}
      <section style={{ margin: '2rem 0' }}>
        <div className="glass-card" style={{
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '3rem 2rem',
          border: '1px solid rgba(0, 137, 123, 0.15)',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)', color: '#1a3a3a' }}>Access Control Portal</h2>
          <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', color: '#2c4a4a' }}>
            Access your health pass, maintain prescriptions, and upload clinic reports.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(0, 137, 123, 0.05)', 
              borderRadius: '16px', 
              border: '1px solid rgba(0, 137, 123, 0.15)',
              maxWidth: '350px',
              margin: '0 auto'
            }}>
              <UserCheck size={32} style={{ color: '#00897b', marginBottom: '1rem' }} />
              <h4 style={{ marginBottom: '0.5rem', color: '#1a3a3a' }}>For Patients</h4>
              <p style={{ fontSize: '0.85rem', marginBottom: '1.2rem', color: '#2c4a4a' }}>Access your health pass, maintain prescriptions, and upload clinic reports.</p>
              <Link to="/login?role=patient" style={{ 
                color: '#00897b', 
                fontWeight: 600, 
                fontSize: '0.9rem', 
                textDecoration: 'none',
                display: 'inline-block',
                padding: '0.5rem 1.5rem',
                borderRadius: '8px',
                border: '1px solid #00897b',
                transition: 'all 0.3s ease'
              }}>Patient Login &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ scrollMarginTop: '100px', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', marginBottom: '0.5rem', color: '#1a3a3a' }}>Contact Mero Care Card</h2>
          <p style={{ color: '#2c4a4a' }}>Have questions about security, integration, or patient management? Get in touch with our team.</p>
        </div>

        <div className="glass-card" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '3rem',
          background: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          padding: '2.5rem',
          border: '1px solid rgba(0, 137, 123, 0.15)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#1a3a3a' }}>Reach Our Support</h3>
              <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: '#2c4a4a' }}>
                Our compliance and technology support desk is open 24/7 to handle critical clinical integrations and data concerns.
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="feature-icon-wrapper" style={{ 
                  width: '40px', 
                  height: '40px', 
                  fontSize: '1rem',
                  background: 'rgba(0, 137, 123, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00897b'
                }}>
                  <Mail size={16} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>Email Support</p>
                  <p style={{ color: '#1a3a3a', fontWeight: 600, fontSize: '0.9rem' }}>support@merocarecard.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="feature-icon-wrapper" style={{ 
                  width: '40px', 
                  height: '40px', 
                  fontSize: '1rem',
                  background: 'rgba(67, 160, 71, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#43a047'
                }}>
                  <Phone size={16} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>Emergency Desk</p>
                  <p style={{ color: '#1a3a3a', fontWeight: 600, fontSize: '0.9rem' }}>+977 (1) 456-7890</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="feature-icon-wrapper" style={{ 
                  width: '40px', 
                  height: '40px', 
                  fontSize: '1rem',
                  background: 'rgba(0, 137, 123, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#00897b'
                }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase' }}>Office HQ</p>
                  <p style={{ color: '#1a3a3a', fontWeight: 600, fontSize: '0.9rem' }}>Kathmandu, Nepal</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: '#1a3a3a' }}>Send an Instant Message</h3>
            
            {contactSuccess ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem',
                padding: '1.5rem',
                background: 'rgba(67, 160, 71, 0.1)',
                border: '1px solid rgba(67, 160, 71, 0.3)',
                borderRadius: '16px',
                color: '#1a3a3a',
                height: '100%',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center'
              }}>
                <ShieldCheck size={40} style={{ color: '#43a047', marginBottom: '0.5rem' }} />
                <h4 style={{ color: '#1a3a3a' }}>Message Received</h4>
                <p style={{ fontSize: '0.85rem', color: '#2c4a4a' }}>Thank you. Our compliance officer will reach back to your email within 1 hour.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Your Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name" 
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
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
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address" 
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
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
                  <label className="form-label" style={{ color: '#2c4a4a' }}>Message Details</label>
                  <textarea 
                    placeholder="Describe your inquiry..." 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="form-input" 
                    rows={4} 
                    style={{ 
                      resize: 'none',
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
                
                <button type="submit" className="btn btn-primary" style={{ 
                  width: '100%', 
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #00897b, #43a047)',
                  border: 'none',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  color: '#fff',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}>
                  <Send size={16} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2.5rem 0', 
        borderTop: '1px solid rgba(0, 137, 123, 0.1)', 
        color: 'rgba(0,0,0,0.4)', 
        fontSize: '0.85rem' 
      }}>
        &copy; {new Date().getFullYear()} Mero Care Card Digital Health Ledger. All rights reserved.
      </footer>
    </div>
  );
};  
