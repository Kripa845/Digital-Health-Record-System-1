import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleScroll = (sectionId: string) => {
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav 
      className="navbar" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        background: 'linear-gradient(135deg, rgba(13, 45, 60, 0.92) 0%, rgba(30, 80, 75, 0.92) 50%, rgba(20, 60, 80, 0.92) 100%)',
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(100, 200, 200, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 40, 50, 0.3)'
      }}
    >
      <div className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', padding: '0.8rem 1.5rem' }}>
        <div onClick={() => handleScroll('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="logo">
          <Activity size={24} style={{ color: '#4dd0e1' }} />
          <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#e0f7fa' }}>Mero Care<span style={{ background: 'linear-gradient(135deg, #4dd0e1, #66bb6a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}> Card</span></span>
        </div>
        
        <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => handleScroll('home')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: '#b2dfdb' }}>Home</button>
          <button onClick={() => handleScroll('about')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: '#b2dfdb' }}>About us</button>
          <button onClick={() => handleScroll('features')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: '#b2dfdb' }}>Features</button>
          <button onClick={() => handleScroll('contact')} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit', color: '#b2dfdb' }}>Contact</button>
          
          {user ? (
            <>
              {user.role === 'PATIENT' ? (
                <>
                  <Link to="/patient-dashboard" className="nav-link" style={{ fontWeight: 600, color: '#4dd0e1' }}>Dashboard</Link>
                  <span className="badge badge-patient" style={{ 
                    background: 'rgba(77, 208, 225, 0.2)', 
                    color: '#4dd0e1',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(77, 208, 225, 0.3)'
                  }}>
                    <UserIcon size={12} style={{ marginRight: '4px' }} />
                    Patient
                  </span>
                </>
              ) : (
                <>
                  <Link to="/admin-dashboard" className="nav-link" style={{ fontWeight: 600, color: '#81c784' }}>Scanner Portal</Link>
                  <span className="badge badge-admin" style={{ 
                    background: 'rgba(129, 199, 132, 0.2)', 
                    color: '#81c784',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(129, 199, 132, 0.3)'
                  }}>
                    <ShieldAlert size={12} style={{ marginRight: '4px' }} />
                    Clinic Admin
                  </span>
                </>
              )}
              
              <button onClick={handleLogout} className="btn btn-secondary" style={{ 
                padding: '0.5rem 1rem', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(100, 200, 200, 0.3)',
                borderRadius: '8px',
                color: '#e0f7fa',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease'
              }}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" style={{ 
                padding: '0.5rem 1.2rem', 
                fontSize: '0.9rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(100, 200, 200, 0.2)',
                borderRadius: '8px',
                color: '#b2dfdb',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}>Log In</Link>
              <Link to="/register" className="btn btn-primary" style={{ 
                padding: '0.5rem 1.2rem', 
                fontSize: '0.9rem',
                background: 'linear-gradient(135deg, #4dd0e1, #66bb6a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                transition: 'all 0.3s ease'
              }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};