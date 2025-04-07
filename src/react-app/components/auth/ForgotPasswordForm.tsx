import { useState, useEffect } from 'react';
import { useAuth  } from "../../hooks";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import "./Auth.css"; // Use the Auth.css file in the same directory

const ForgotPasswordForm = () => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { isLoading, resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check for token in URL on component mount
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    if (token) {
      setResetToken(token);
      setIsResetting(true);
    }
  }, [location]);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      const success = await resetPassword(email);
      if (success) {
        setSuccess(true);
        setEmail(''); // Clear email field on success
      } else {
        // Show a generic error to avoid revealing if an email exists or not
        setError('Could not process password reset request. Please try again later or contact support.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred during the password reset request. Please try again later.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL || 'https://api.kushobserver.com'}/api/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          password: newPassword,
          domain: 'sesh-tracker.com'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        // Redirect to login after successful reset
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password. The link may have expired.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An error occurred while resetting your password. Please try again.');
    }
  };

  // Render the password reset form if a token is present
  if (isResetting) {
    return (
      <div className="auth-container">
        <div className="auth-form-container">
          <div className="auth-form-content">
            <div className="auth-form-header">
              <h2 className="auth-form-title">Reset Your Password</h2>
              <p className="auth-form-subtitle">Enter your new password</p>
            </div>

            {success && (
              <div className="auth-success">
                Password has been successfully reset! Redirecting to login...
              </div>
            )}

            {error && (
              <div className="auth-error">
                {error}
                {' '} <Link to="/contact" className="form-link">[Contact Support]</Link>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  className="form-input"
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <p className="form-help-text">Must be at least 8 characters</p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  className="form-input"
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ paddingTop: '0.5rem' }}>
                <button
                  className="form-submit"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Remember your password?{' '}
              <Link to="/login" className="form-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Password reset request form (default view)
  return (
    <div className="auth-container">
      <div className="auth-nav">
        <Link to="/" className="auth-logo">SeshTracker</Link>
        <div className="auth-nav-links">
          <Link to="/login" className="auth-nav-link">Login</Link>
          <Link to="/register" className="auth-nav-link btn">Register</Link>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="auth-form-content">
          <div className="auth-form-header">
            <h2 className="auth-form-title">Reset Password</h2>
            <p className="auth-form-subtitle">Enter your email to request a reset</p>
          </div>

          {success && (
            <div className="auth-success">
              If an account exists for this email, a password reset link has been sent.
            </div>
          )}

          {error && (
            <div className="auth-error">
              {error}
              {' '} <Link to="/contact" className="form-link">[Contact Support]</Link>
            </div>
          )}

          <form onSubmit={handleResetRequest} className="auth-form">
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
       
       <Link to="/legacy" className="classic-link">
         Switch to Classic Version
       </Link>
    </div>
  );
};

export default ForgotPasswordForm; 
