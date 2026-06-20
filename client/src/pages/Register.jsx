import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// Reusable password field with show/hide toggle
const PasswordField = ({ id, label, value, onChange, show, onToggle, placeholder, autoComplete }) => (
  <div className="input-group">
    <label htmlFor={id}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ paddingRight: '2.75rem', width: '100%' }}
      />
      <button
        type="button"
        onClick={onToggle}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: '0.75rem', top: '50%',
          transform: 'translateY(-50%)', background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-light)', display: 'flex',
          alignItems: 'center', padding: 0,
        }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  </div>
);

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { register } = useAuth();

  // Prefill email if redirected from login ("no account found")
  const [username, setUsername]         = useState('');
  const [email, setEmail]               = useState(location.state?.prefillEmail || '');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirm]   = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return { label: '', color: 'transparent', width: '0%' };
    if (pw.length < 6)  return { label: 'Weak',   color: '#ef4444', width: '33%' };
    if (pw.length < 10 || !/[0-9]/.test(pw)) return { label: 'Fair', color: '#f59e0b', width: '66%' };
    return { label: 'Strong', color: '#22c55e', width: '100%' };
  };
  const strength = getStrength(password);
  const passwordsMatch = confirmPassword !== '' && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side checks before hitting the server
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Register saves the user to MongoDB via POST /api/auth/register
      await register(username, email, password);

      // After successful signup, go to home (already logged in via register())
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Join CodeSphere</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Create your account and start coding together
        </p>

        {/* Show prefill notice if coming from login redirect */}
        {location.state?.prefillEmail && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '0.875rem' }}>
            ℹ️ No account found for <strong>{location.state.prefillEmail}</strong>. Create one below.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="input-group">
            <label htmlFor="reg-username">Username</label>
            <input
              type="text"
              id="reg-username"
              name="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              required
              placeholder="Choose a unique username"
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div className="input-group">
            <label htmlFor="reg-email">Email address</label>
            <input
              type="email"
              id="reg-email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <PasswordField
            id="reg-password"
            label="Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            show={showPassword}
            onToggle={() => setShowPassword((p) => !p)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
          />

          {/* Strength bar */}
          {password && (
            <div style={{ marginTop: '-0.75rem', marginBottom: '1rem' }}>
              <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: strength.width }}
                  transition={{ duration: 0.3 }}
                  style={{ height: '100%', background: strength.color, borderRadius: '2px' }}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem', fontWeight: 600 }}>
                {strength.label}
              </p>
            </div>
          )}

          {/* Confirm Password */}
          <PasswordField
            id="reg-confirm"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => { setConfirm(e.target.value); setError(''); }}
            show={showConfirm}
            onToggle={() => setShowConfirm((p) => !p)}
            placeholder="Repeat your password"
            autoComplete="new-password"
          />

          {/* Match indicator */}
          {confirmPassword && (
            <p style={{ fontSize: '0.75rem', marginTop: '-0.75rem', marginBottom: '1rem', fontWeight: 600, color: passwordsMatch ? '#22c55e' : '#ef4444' }}>
              {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
