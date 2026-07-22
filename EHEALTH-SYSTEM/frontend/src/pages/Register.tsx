import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, CheckCircle, AlertCircle, Eye, EyeOff, Check } from 'lucide-react';
import { colors, glassCard, glassCardInput, label, value } from '../styles/theme';

export const Register: React.FC = () => {
  const { registerPatient } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form Fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password validation states
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [passwordTouched, setPasswordTouched] = useState(false);
  
  // Patient Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [address, setAddress] = useState('');

  // Password validation function
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8) {
      errors.push("At least 8 characters long");
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push("At least one uppercase letter");
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push("At least one lowercase letter");
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push("At least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.push("At least one special character (!@#$%^&* etc.)");
    }
    return errors;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordTouched(true);
    setPasswordErrors(validatePassword(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    // Validate password strength
    const errors = validatePassword(password);
    if (errors.length > 0) {
      setError("Password does not meet security requirements. Please check the requirements below.");
      setPasswordTouched(true);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const payload = {
      username,
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob || null,
      gender,
      blood_type: bloodType,
      contact_number: contactNumber,
      address
    };
    
    const result = await registerPatient(payload);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(result.error || "Registration failed. Username or email may already be taken.");
      setLoading(false);
    }
  };

  // Check if password meets all requirements
  const isPasswordValid = passwordErrors.length === 0 && password.length > 0;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '85vh', 
      padding: '3rem 1.5rem',
      background: colors.bgPageGradient
    }}>
      <div style={{ 
        ...glassCard,
        width: '100%', 
        maxWidth: '600px', 
        position: 'relative',
        padding: '2.5rem',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Top Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `rgba(0, 137, 123, 0.15)`,
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}></div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <CheckCircle size={64} style={{ color: colors.secondary, marginBottom: '1.5rem' }} />
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: colors.textPrimary }}>Account Created!</h2>
            <p style={{ color: colors.textSecondary }}>Redirecting to secure portal sign-in...</p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ 
                margin: '0 auto 1rem',
                width: '60px',
                height: '60px',
                background: colors.tealGhostStrong,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colors.primary
              }}>
                <UserPlus size={24} />
              </div>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem', color: colors.textPrimary }}>Register Patient Account</h2>
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>Create a secure electronic medical passport.</p>
            </div>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: colors.errorLight,
                background: colors.errorBg,
                border: `1px solid ${colors.errorBorder}`,
                padding: '0.8rem 1rem',
                borderRadius: colors.radiusXl,
                fontSize: '0.85rem',
                marginBottom: '1.5rem'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              
              <h4 style={{ 
                fontSize: '1rem', 
                color: colors.textPrimary, 
                borderBottom: `1px solid ${colors.borderGlass}`, 
                paddingBottom: '0.5rem', 
                marginBottom: '1rem' 
              }}>
                1. System Credentials
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label }}>Username *</label>
                  <input 
                    type="text" 
                    placeholder="john_doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={glassCardInput}
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label style={{ ...label }}>Email *</label>
                  <input 
                    type="email" 
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={glassCardInput}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label style={{ ...label }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    style={{
                      ...glassCardInput,
                      paddingRight: '2.5rem',
                      borderColor: passwordTouched 
                        ? (isPasswordValid ? colors.successBorder : colors.errorBorder)
                        : colors.borderGlass
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {passwordTouched && (
                <div style={{
                  background: colors.tealGhost,
                  border: `1px solid ${colors.borderGlass}`,
                  borderRadius: colors.radiusLg,
                  padding: '0.8rem 1rem',
                  marginBottom: '1rem',
                  fontSize: '0.8rem'
                }}>
                  <p style={{ color: colors.textPrimary, fontWeight: 600, marginBottom: '0.4rem' }}>Password Requirements:</p>
                  <ul style={{ 
                    listStyle: 'none', 
                    padding: 0, 
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem'
                  }}>
                    {[
                      { check: password.length >= 8, text: "At least 8 characters" },
                      { check: /[A-Z]/.test(password), text: "At least one uppercase letter" },
                      { check: /[a-z]/.test(password), text: "At least one lowercase letter" },
                      { check: /[0-9]/.test(password), text: "At least one number" },
                      { check: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "At least one special character" }
                    ].map((req, idx) => (
                      <li key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        color: req.check ? colors.secondary : colors.textSecondary
                      }}>
                        <Check size={14} style={{ 
                          color: req.check ? colors.secondary : colors.textSecondary,
                          opacity: req.check ? 1 : 0.3
                        }} />
                        <span>{req.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confirm Password Field */}
              <div>
                <label style={{ ...label }}>Confirm Password *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      ...glassCardInput,
                      paddingRight: '2.5rem',
                      borderColor: confirmPassword 
                        ? (password === confirmPassword ? colors.successBorder : colors.errorBorder)
                        : colors.borderGlass
                    }}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: colors.textSecondary,
                      cursor: 'pointer',
                      padding: '0.2rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p style={{ color: colors.errorLight, fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password.length > 0 && (
                  <p style={{ color: colors.secondary, fontSize: '0.8rem', marginTop: '0.3rem' }}>
                    ✓ Passwords match
                  </p>
                )}
              </div>

              <h4 style={{ 
                fontSize: '1rem', 
                color: colors.textPrimary, 
                borderBottom: `1px solid ${colors.borderGlass}`, 
                paddingBottom: '0.5rem', 
                marginTop: '1.8rem', 
                marginBottom: '1rem' 
              }}>
                2. Patient Profile Information
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label }}>First Name</label>
                  <input 
                    type="text" 
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={glassCardInput}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={{ ...label }}>Last Name</label>
                  <input 
                    type="text" 
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    style={glassCardInput}
                    disabled={loading}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ ...label }}>Date of Birth</label>
                  <input 
                    type="date" 
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    style={glassCardInput}
                    disabled={loading}
                  />
                </div>
                <div>
                  <label style={{ ...label }}>Gender</label>
                  <select 
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={glassCardInput}
                    disabled={loading}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ ...label }}>Blood Type</label>
                  <select 
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    style={glassCardInput}
                    disabled={loading}
                  >
                    <option value="">Select</option>
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

              <div>
                <label style={{ ...label }}>Contact Number</label>
                <input 
                  type="text" 
                  placeholder="+1 (555) 000-0000"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  style={glassCardInput}
                  disabled={loading}
                />
              </div>

              <div style={{ marginBottom: '2rem' }}>
                <label style={{ ...label }}>Address</label>
                <textarea 
                  placeholder="Street, City, Country"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    ...glassCardInput,
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: colors.gradientPrimaryBtn,
                  border: 'none',
                  borderRadius: colors.radiusLg,
                  color: colors.onPrimary,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: colors.shadowPrimaryBtn,
                  opacity: loading ? 0.7 : 1
                }}
                disabled={loading}
              >
                {loading ? "Registering..." : "Create Account"}
              </button>

            </form>

            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.85rem', color: colors.textSecondary }}>
              Already registered?{' '}
              <Link to="/login" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>
                Sign In here
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
};