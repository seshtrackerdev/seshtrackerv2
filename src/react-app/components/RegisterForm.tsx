import { useState } from 'react';
import { useAuth } from '../hooks';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const result = await register({ email, password, name });

    if (result.success) {
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      {/* Navigation buttons */}
      <div className="auth-nav">
        <Link to="/" className="auth-logo">SeshTracker</Link>
        <div className="auth-nav-links">
          <Link to="/login" className="auth-nav-link">Login</Link>
          <Link to="/register" className="auth-nav-link active btn">Register</Link>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-content">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Join Sesh Tracker</h2>
            <p className="auth-form-subtitle">Create your account to get started</p>
          </div>
          
          {successMessage && (
            <div className="auth-success">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Name <span style={{ color: '#6b7280' }}>(Optional)</span>
              </label>
              <input
                className="form-input"
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email <span style={{ color: '#818cf8' }}>*</span>
              </label>
              <input
                className="form-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span style={{ color: '#818cf8' }}>*</span>
              </label>
              <input
                className="form-input"
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="form-help-text">Must be at least 8 characters</p>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password <span style={{ color: '#818cf8' }}>*</span>
              </label>
              <input
                className="form-input"
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            
            <div style={{ paddingTop: '0.5rem' }}>
              <button
                className="form-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="spinner"></span>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="form-link">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>

      {/* Add legacy version link at the bottom */}
      <Link to="/legacy" className="classic-link">
        Switch to Classic Version
      </Link>
    </div>
  );
};

export default RegisterForm; 