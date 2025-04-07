import { useState, useEffect } from 'react';
import { useAuth  } from "../../hooks";
import "../../styles/.css";

interface ProfileFormData {
  name: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
}

interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
}

const ProfilePage = () => {
  const { user, updateProfile, isLoading, getUserSubscription } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });
  const [subscription, setSubscription] = useState<{
    plan: string;
    status: string;
    expiresAt?: string;
    features?: string[];
  } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Features available in different subscription tiers
  const subscriptionFeatures: SubscriptionFeature[] = [
    { name: 'Unlimited Sessions', description: 'Track as many sessions as you want', included: true },
    { name: 'Basic Analytics', description: 'View simple charts and trends', included: true },
    { name: 'Inventory Management', description: 'Track your cannabis products', included: true },
    { name: 'Advanced Analytics', description: 'Get deeper insights and patterns', included: subscription?.plan !== 'free' },
    { name: 'Data Export', description: 'Export your data in various formats', included: subscription?.plan === 'premium' },
    { name: 'Custom Tags', description: 'Create and use custom tags', included: subscription?.plan !== 'free' },
    { name: 'Priority Support', description: 'Get faster support response', included: subscription?.plan === 'premium' }
  ];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }));
    }
    
    // Load subscription data
    const loadSubscription = async () => {
      const subscriptionData = await getUserSubscription();
      if (subscriptionData) {
        setSubscription(subscriptionData);
      }
    };
    
    loadSubscription();
  }, [user, getUserSubscription]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    try {
      const success = await updateProfile({ name: formData.name });
      
      if (success) {
        setMessage({ type: 'success', text: 'Profile updated successfully' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while updating profile' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    if (!formData.currentPassword) {
      setMessage({ type: 'error', text: 'Current password is required' });
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_AUTH_API_URL || 'https://api.kushobserver.com'}/api/password-change`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
        setFormData(prev => ({
          ...prev,
          newPassword: '',
          confirmPassword: '',
          currentPassword: ''
        }));
        setIsChangingPassword(false);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while changing password' });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanBadgeClass = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'badge-premium';
      case 'pro':
        return 'badge-pro';
      default:
        return 'badge-free';
    }
  };

  if (isLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="error-message">Please log in to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Your Profile</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="profile-grid">
        <div className="profile-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="form-input"
              />
              <p className="form-help">Email cannot be changed</p>
            </div>
            
            <div className="form-group">
              <label htmlFor="name">Display Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>
            
            <div className="form-actions">
              {isEditing ? (
                <>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </>
              ) : (
                <button type="submit" className="btn-primary">
                  Edit Profile
                </button>
              )}
            </div>
          </form>
          
          <div className="password-section">
            <h3>Password Management</h3>
            {!isChangingPassword ? (
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handlePasswordChange} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  <p className="form-help">Minimum 8 characters</p>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsChangingPassword(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Your Subscription</h2>
          
          {subscription ? (
            <div className="subscription-info">
              <div className="subscription-header">
                <div className="subscription-plan">
                  <span className={`plan-badge ${getPlanBadgeClass(subscription.plan)}`}>
                    {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                  </span>
                  <span className="subscription-status">{subscription.status}</span>
                </div>
                
                {subscription.expiresAt && (
                  <div className="subscription-expiry">
                    Renews: {formatDate(subscription.expiresAt)}
                  </div>
                )}
              </div>
              
              <div className="subscription-features">
                <h3>Included Features</h3>
                <ul className="features-list">
                  {subscriptionFeatures.map((feature, index) => (
                    <li key={index} className={feature.included ? 'feature-included' : 'feature-excluded'}>
                      <span className="feature-icon">{feature.included ? '✓' : '×'}</span>
                      <div className="feature-content">
                        <span className="feature-name">{feature.name}</span>
                        <span className="feature-description">{feature.description}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              {subscription.plan !== 'premium' && (
                <div className="upgrade-section">
                  <h4>Want more features?</h4>
                  <button className="btn-upgrade">Upgrade Your Plan</button>
                </div>
              )}
            </div>
          ) : (
            <div className="subscription-loading">
              Loading subscription information...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 
