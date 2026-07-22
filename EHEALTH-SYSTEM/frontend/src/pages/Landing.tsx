import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, HeartHandshake, QrCode, FilePlus2, UserCheck, Stethoscope, Mail, Phone, MapPin, Send } from 'lucide-react';
import { colors, glassCard, glassCardLight, glassCardInput, label, value } from '../theme/theme';

export const Landing: React.FC = () => {
  const navItemStyle: React.CSSProperties = {
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '0.4rem 0.8rem',
    borderRadius: colors.radiusMd,
    transition: 'background 0.2s ease',
  };

  return (
    <div style={{ background: colors.bgPageGradient, minHeight: '100vh', color: colors.textPrimary }}>
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: colors.gradientDark,
        backdropFilter: 'blur(10px)',
        padding: '0.9rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${colors.navGhostBorder}`,
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link to="/#home" style={{ ...navItemStyle }}>Home</Link>
          <Link to="/#features" style={{ ...navItemStyle }}>Features</Link>
          <Link to="/#services" style={{ ...navItemStyle }}>Services</Link>
          <Link to="/#contact" style={{ ...navItemStyle }}>Contact</Link>
          <Link to="/#about" style={{ ...navItemStyle }}>About</Link>
        </div>
        <Link to="/login" style={{
          background: colors.gradientPrimaryBtn,
          border: 'none',
          padding: '0.55rem 1.4rem',
          borderRadius: colors.radiusXl,
          color: colors.onPrimary,
          fontWeight: 700,
          textDecoration: 'none',
          fontSize: '0.9rem',
        }}>
          Login
        </Link>
      </nav>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', padding: '2rem 1.5rem' }}>
        <section id="home" style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '3rem', lineHeight: 1.2, marginBottom: '1.5rem', color: colors.textPrimary }}>
            Mero Care Card <br />
            <span style={{ background: colors.gradientPrimaryBtnAlt, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Your Health, Unified. Your Vitals, Secured.</span>
          </h1>
          <p style={{ maxWidth: '700px', margin: '0 auto 2.5rem', fontSize: '1.1rem', color: colors.textSecondary }}>
            Streamline how you manage and share your medical history. Mero Care Card acts as your central digital health ledger.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ background: colors.gradientPrimaryBtn, border: 'none', padding: '0.8rem 2rem', borderRadius: colors.radiusXl, color: colors.onPrimary, fontWeight: 600, textDecoration: 'none', boxShadow: colors.shadowPrimaryBtn }}>Login</Link>
          </div>
        </section>

        <section id="about" style={{ scrollMarginTop: '100px' }}>
          <div style={{ ...glassCard, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: colors.primary, letterSpacing: '0.1em' }}>About Mero Care Card</span>
              <h2 style={{ fontSize: '2.2rem', marginTop: '0.5rem', marginBottom: '1.2rem', color: colors.textPrimary }}>Empowering Patients, Simplifying Healthcare.</h2>
              <p style={{ marginBottom: '1rem', color: colors.textSecondary }}>Mero Care Card was founded with a single mission: to make personal health histories securely portable.</p>
              <p style={{ color: colors.textSecondary }}>By combining high-security dynamic QR technology with encrypted local vaults.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ padding: '1.5rem', background: colors.tealGhostStrong, border: `1px solid ${colors.borderGlass}`, borderRadius: colors.radius2Xl, backdropFilter: 'blur(5px)' }}>
                <Stethoscope size={28} style={{ color: colors.primary, marginBottom: '0.8rem' }} />
                <h4 style={{ marginBottom: '0.4rem', color: colors.textPrimary }}>Provider Sync</h4>
                <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Doctors scan and fetch live records directly from your database profile.</p>
              </div>
              <div style={{ padding: '1.5rem', background: colors.successGhostStrong, border: `1px solid ${colors.successBorder}`, borderRadius: colors.radius2Xl, backdropFilter: 'blur(5px)' }}>
                <ShieldCheck size={28} style={{ color: colors.secondary, marginBottom: '0.8rem' }} />
                <h4 style={{ marginBottom: '0.4rem', color: colors.textPrimary }}>Secure Vault</h4>
                <p style={{ fontSize: '0.8rem', color: colors.textSecondary }}>Your personal details are hidden behind random cryptographic UUID tokens.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" style={{ scrollMarginTop: '100px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.2rem', color: colors.textPrimary }}>Key Features &amp; Capabilities</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div style={{ ...glassCard, transition: 'all 0.3s ease', border: `1px solid ${colors.borderGlass}` }}>
              <div style={{ color: colors.primary }}><QrCode size={24} /></div>
              <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: colors.textPrimary }}>Dynamic E-Pass (QR)</h3>
              <p style={{ fontSize: '0.9rem', color: colors.textSecondary }}>Generate custom QR cards that point only to secure UUID endpoints.</p>
            </div>
            <div style={{ ...glassCard, transition: 'all 0.3s ease', border: `1px solid ${colors.successBorder}` }}>
              <div style={{ color: colors.secondary }}><ShieldCheck size={24} /></div>
              <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: colors.textPrimary }}>MFA &amp; OTP Protection</h3>
              <p style={{ fontSize: '0.9rem', color: colors.textSecondary }}>Login securely using mobile username, backed by random 6-digit OTP verification codes.</p>
            </div>
            <div style={{ ...glassCard, transition: 'all 0.3s ease', border: `1px solid ${colors.borderGlass}` }}>
              <div style={{ color: colors.primary }}><FilePlus2 size={24} /></div>
              <h3 style={{ marginBottom: '0.8rem', fontSize: '1.25rem', color: colors.textPrimary }}>Document Library</h3>
              <p style={{ fontSize: '0.9rem', color: colors.textSecondary }}>Upload and organize files directly from your device storage.</p>
            </div>
          </div>
        </section>

        <section id="services" style={{ margin: '2rem 0' }}>
          <div style={{ ...glassCard, textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem', color: colors.textPrimary }}>Access Control Portal</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto 2.5rem', color: colors.textSecondary }}>Access your health pass, maintain prescriptions, and upload clinic reports.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ padding: '1.5rem', background: colors.tealGhostStrong, borderRadius: colors.radius2Xl, border: `1px solid ${colors.borderGlass}`, maxWidth: '350px', margin: '0 auto' }}>
                <UserCheck size={32} style={{ color: colors.primary, marginBottom: '1rem' }} />
                <h4 style={{ marginBottom: '0.5rem', color: colors.textPrimary }}>For Patients</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '1.2rem', color: colors.textSecondary }}>Access your health pass, maintain prescriptions, and upload clinic reports.</p>
                <Link to="/login?role=patient" style={{ color: colors.primary, fontWeight: 600, fontSize: '0.9rem', textDecoration: 'none', display: 'inline-block', padding: '0.5rem 1.5rem', borderRadius: colors.radiusMd, border: `1px solid ${colors.primary}`, transition: 'all 0.3s ease' }}>Patient Login &rarr;</Link>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" style={{ scrollMarginTop: '100px', marginBottom: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: colors.textPrimary }}>Contact Mero Care Card</h2>
            <p style={{ color: colors.textSecondary }}>Have questions about security, integration, or patient management? Get in touch with our team.</p>
          </div>
          <div style={{ ...glassCard, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: colors.textPrimary }}>Reach Our Support</h3>
                <p style={{ fontSize: '0.95rem', marginBottom: '1.5rem', color: colors.textSecondary }}>Our compliance and technology support desk is open 24/7.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: colors.tealGhostStrong, borderRadius: colors.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}><Mail size={16} /></div>
                  <div><p style={{ fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase' }}>Email Support</p><p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '0.9rem' }}>support@merocarecard.com</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: colors.successGhostStrong, borderRadius: colors.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondary }}><Phone size={16} /></div>
                  <div><p style={{ fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase' }}>Emergency Desk</p><p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '0.9rem' }}>+977 (1) 456-7890</p></div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', background: colors.tealGhostStrong, borderRadius: colors.radiusLg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}><MapPin size={16} /></div>
                  <div><p style={{ fontSize: '0.75rem', color: colors.textMuted, textTransform: 'uppercase' }}>Office HQ</p><p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '0.9rem' }}>Kathmandu, Nepal</p></div>
                </div>
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', color: colors.textPrimary }}>Send an Instant Message</h3>
              <form onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div><label style={{ ...label }}>Your Name</label><input type="text" placeholder="Enter full name" style={glassCardInput} /></div>
                <div><label style={{ ...label }}>Email Address</label><input type="email" placeholder="Enter email address" style={glassCardInput} /></div>
                <div><label style={{ ...label }}>Message Details</label><textarea placeholder="Describe your inquiry..." rows={4} style={{ ...glassCardInput, resize: 'none' }} /></div>
                <button type="submit" style={{ width: '100%', gap: '0.5rem', background: colors.gradientPrimaryBtn, border: 'none', padding: '0.8rem', borderRadius: colors.radiusLg, color: colors.onPrimary, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: colors.shadowPrimaryBtn }}><Send size={16} /><span>Send Message</span></button>
              </form>
            </div>
          </div>
        </section>

        <footer style={{ textAlign: 'center', padding: '2.5rem 0', borderTop: `1px solid ${colors.borderGlass}`, color: colors.textMuted, fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} Mero Care Card Digital Health Ledger. All rights reserved.
        </footer>
      </div>
    </div>
  );
};
