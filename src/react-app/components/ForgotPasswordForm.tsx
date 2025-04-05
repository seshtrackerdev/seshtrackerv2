import { useState } from 'react';
import { useAuth } from '../hooks';
import { Link } from 'react-router-dom';
import './Auth.css'; // Reuse existing auth styles

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { resetPassword, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // --- IMPORTANT DISCLAIMER ---
    setError(
      'Password resets via email are currently unavailable. If you need to reset your password, please contact support.' // TODO: Add link when available
    );
    // In the future, the actual API call would go here:
    /*
    const success = await resetPassword(email);
    if (success) {
      setMessage('If an account exists for this email, a password reset link has been sent (Feature currently disabled).');
      setEmail(''); // Clear email field on "success"
    } else {
      // Show a generic error to avoid revealing if an email exists or not
      setError('Could not process password reset request. Please try again later or contact support.');
    }
    */
  };

  return (
    <div className="auth-container">
      {/* Remove the static navigation block */}
      {/* <div className="auth-nav"> ... </div> */}

      <div className="auth-form-container">
        <div className="auth-form-content">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Reset Password</h2>
            <p className="auth-form-subtitle">Enter your email to request a reset</p>
          </div>

          {message && (
            <div className="auth-success">
              {message}
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
              {/* Placeholder for support link */}
               {' '} <Link to="/contact" className="form-link">[Contact Support]</Link>
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
                required
              />
            </div>

            <div style={{ paddingTop: '0.5rem' }}>
              <button
                className="form-submit"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Sending Request...' : 'Request Reset'}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Remembered your password?{' '}
            <Link to="/login" className="form-link">
              Sign in
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

export default ForgotPasswordForm; 