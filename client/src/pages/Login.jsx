import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pick up any message passed via redirect (e.g. "Account created, please log in")
  const redirectMsg = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrorCode('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const code = err.response?.data?.code || '';
      const msg  = err.response?.data?.message || 'Login failed. Please try again.';
      setErrorCode(code);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // When "USER_NOT_FOUND" — redirect to register, carrying the email along
  const handleGoToSignup = () => {
    navigate('/register', { state: { prefillEmail: email } });
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ width: '100%', maxWidth: '420px' }}
      >
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          Sign in to your CodeSphere account
        </p>

        {/* Success message from redirect (e.g. after registration) */}
        {redirectMsg && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.875rem' }}>
            ✅ {redirectMsg}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>

            {/* "User not found" — show signup button */}
            {errorCode === 'USER_NOT_FOUND' && (
              <button
                onClick={handleGoToSignup}
                style={{
                  marginTop: '0.75rem',
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                }}
              >
                Create an account <ArrowRight size={15} />
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="input-group">
            <label htmlFor="login-email">Email address</label>
            <input
              type="email"
              id="login-email"
              name="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); setErrorCode(''); }}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); setErrorCode(''); }}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                style={{ paddingRight: '2.75rem', width: '100%' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                title={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%',
                  transform: 'translateY(-50%)', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'var(--text-light)', display: 'flex',
                  alignItems: 'center', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-light)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
