import { useState } from 'react';
import { useAuth } from '../hooks';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="auth-container">
      {/* Navigation buttons */}
      <div className="auth-nav">
        <Link to="/" className="auth-logo">SeshTracker</Link>
        <div className="auth-nav-links">
          <Link to="/login" className="auth-nav-link active">Login</Link>
          <Link to="/register" className="auth-nav-link btn">Register</Link>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-content">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Welcome Back</h2>
            <p className="auth-form-subtitle">Sign in to track your sessions</p>
          </div>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email
              </label>
              <input
                className="form-input"
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <div className="form-group-row">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="form-link">
                  Forgot password?
                </Link>
              </div>
              <input
                className="form-input"
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <button
                className="form-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="spinner"></span>
                    Signing in...
                  </div>
                ) : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
        
        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="form-link">
              Create one now
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

export default LoginForm; 