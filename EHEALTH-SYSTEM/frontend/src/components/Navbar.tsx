import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, User as UserIcon, ShieldAlert, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const handleScroll = (sectionId: string) => {
    setIsOpen(false);
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

  const navLinkStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    font: 'inherit',
    color: '#b2dfdb',
    padding: '0.5rem 0',
    transition: 'color 0.3s ease',
    fontSize: '0.95rem',
  };

  return (
    <nav 
      className="navbar" 
      style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        background: 'linear-gradient(135deg, rgba(13, 45, 60, 0.95) 0%, rgba(30, 80, 75, 0.95) 50%, rgba(20, 60, 80, 0.95) 100%)',
        backdropFilter: 'blur(10px)', 
        borderBottom: '1px solid rgba(100, 200, 200, 0.15)',
        boxShadow: '0 4px 20px rgba(0, 40, 50, 0.3)'
      }}
    >
      <div className="navbar-container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '0.8rem 1.5rem',
        position: 'relative',
      }}>
        {/* Logo */}
        <div 
          onClick={() => handleScroll('home')} 
          style={{ 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            flexShrink: 0,
          }} 
          className="logo"
        >
          <Activity size={24} style={{ color: '#4dd0e1' }} />
          <span style={{ 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)', 
            fontSize: '1.2rem', 
            color: '#e0f7fa',
            whiteSpace: 'nowrap',
          }}>
            Mero Care<span style={{ 
              background: 'linear-gradient(135deg, #4dd0e1, #66bb6a)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent' 
            }}> Card</span>
          </span>
        </div>

        {/* Hamburger Menu Button - Mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'none',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(100, 200, 200, 0.2)',
            borderRadius: '8px',
            color: '#e0f7fa',
            padding: '0.5rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="hamburger-btn"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Navigation */}
        <div 
          className="desktop-nav" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button onClick={() => handleScroll('home')} style={navLinkStyle}>Home</button>
          <button onClick={() => handleScroll('about')} style={navLinkStyle}>About us</button>
          <button onClick={() => handleScroll('features')} style={navLinkStyle}>Features</button>
          <button onClick={() => handleScroll('contact')} style={navLinkStyle}>Contact</button>
          
          {user ? (
            <>
              {user.role === 'PATIENT' ? (
                <>
                  <Link to="/patient-dashboard" className="nav-link" style={{ fontWeight: 600, color: '#4dd0e1', textDecoration: 'none' }}>Dashboard</Link>
                  <span className="badge badge-patient" style={{ 
                    background: 'rgba(77, 208, 225, 0.2)', 
                    color: '#4dd0e1',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(77, 208, 225, 0.3)',
                    whiteSpace: 'nowrap',
                  }}>
                    <UserIcon size={12} style={{ marginRight: '4px' }} />
                    Patient
                  </span>
                </>
              ) : (
                <>
                  <Link to="/admin-dashboard" className="nav-link" style={{ fontWeight: 600, color: '#81c784', textDecoration: 'none' }}>Scanner Portal</Link>
                  <span className="badge badge-admin" style={{ 
                    background: 'rgba(129, 199, 132, 0.2)', 
                    color: '#81c784',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(129, 199, 132, 0.3)',
                    whiteSpace: 'nowrap',
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
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
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
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
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
                transition: 'all 0.3s ease',
                whiteSpace: 'nowrap',
              }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu - Conditionally rendered based on isOpen state */}
      {isOpen && (
        <div 
          className="mobile-menu"
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(13, 45, 60, 0.98)',
            backdropFilter: 'blur(10px)',
            padding: '1rem 1.5rem 1.5rem',
            borderTop: '1px solid rgba(100, 200, 200, 0.1)',
            gap: '0.75rem',
          }}
        >
          <button onClick={() => handleScroll('home')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '1rem' }}>Home</button>
          <button onClick={() => handleScroll('about')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '1rem' }}>About us</button>
          <button onClick={() => handleScroll('features')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '1rem' }}>Features</button>
          <button onClick={() => handleScroll('contact')} style={{ ...navLinkStyle, textAlign: 'left', fontSize: '1rem' }}>Contact</button>
          
          {user ? (
            <>
              {user.role === 'PATIENT' ? (
                <>
                  <Link to="/patient-dashboard" onClick={() => setIsOpen(false)} style={{ fontWeight: 600, color: '#4dd0e1', textDecoration: 'none', padding: '0.5rem 0' }}>Dashboard</Link>
                  <span style={{ 
                    background: 'rgba(77, 208, 225, 0.2)', 
                    color: '#4dd0e1',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(77, 208, 225, 0.3)',
                    width: 'fit-content',
                  }}>
                    <UserIcon size={12} style={{ marginRight: '4px' }} />
                    Patient
                  </span>
                </>
              ) : (
                <>
                  <Link to="/admin-dashboard" onClick={() => setIsOpen(false)} style={{ fontWeight: 600, color: '#81c784', textDecoration: 'none', padding: '0.5rem 0' }}>Scanner Portal</Link>
                  <span style={{ 
                    background: 'rgba(129, 199, 132, 0.2)', 
                    color: '#81c784',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid rgba(129, 199, 132, 0.3)',
                    width: 'fit-content',
                  }}>
                    <ShieldAlert size={12} style={{ marginRight: '4px' }} />
                    Clinic Admin
                  </span>
                </>
              )}
              
              <button onClick={handleLogout} style={{ 
                padding: '0.6rem 1rem', 
                fontSize: '0.9rem', 
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(100, 200, 200, 0.3)',
                borderRadius: '8px',
                color: '#e0f7fa',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                width: 'fit-content',
              }}>
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link to="/login" onClick={() => setIsOpen(false)} style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.95rem',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(100, 200, 200, 0.2)',
                borderRadius: '8px',
                color: '#b2dfdb',
                textDecoration: 'none',
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}>Log In</Link>
              <Link to="/register" onClick={() => setIsOpen(false)} style={{ 
                padding: '0.6rem 1.2rem', 
                fontSize: '0.95rem',
                background: 'linear-gradient(135deg, #4dd0e1, #66bb6a)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                textAlign: 'center',
                transition: 'all 0.3s ease',
              }}>Sign Up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media screen and (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .hamburger-btn {
            display: flex !important;
          }
        }

        @media screen and (min-width: 901px) {
          .hamburger-btn {
            display: none !important;
          }
        }

        @media screen and (max-width: 480px) {
          .logo span {
            font-size: 1rem !important;
          }
          .navbar-container {
            padding: 0.6rem 1rem !important;
          }
          .mobile-menu {
            padding: 0.75rem 1rem 1rem !important;
          }
        }

        /* Hover effects */
        .nav-link:hover,
        .hamburger-btn:hover {
          opacity: 0.8;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(77, 208, 225, 0.3);
        }
      `}</style>
    </nav>
  );
  };