import { useState, useEffect } from 'react';
import { useAuth } from '../hooks'; // Assuming useAuth hook provides user info and fetchProtected
import './Dashboard.css';

// Define the expected structure of the user profile data from the API
interface UserProfile {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

const DashboardPlaceholder = () => {
  const { user: contextUser, fetchProtected, logout } = useAuth(); // Get fetchProtected and logout from context
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchProtected('/api/protected/user-profile'); // Use the helper
        if (!response.ok) {
          // fetchProtected should ideally handle 401, but catch other errors
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const data: UserProfile = await response.json();
        setProfileData(data);
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        // Avoid setting error if it's an Unauthorized error handled by fetchProtected leading to logout
        if (err.message !== 'Unauthorized' && err.message !== 'No authentication token available.') {
           setError(err.message || 'Could not load user profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [fetchProtected]); // Depend on fetchProtected from context

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-welcome">Welcome back!</p>

      {profileData ? (
        <div className="user-profile-card">
          <p className="profile-item"><strong>User ID:</strong> {profileData.user.id}</p>
          <p className="profile-item"><strong>Email:</strong> {profileData.user.email}</p>
          {profileData.user.name && <p className="profile-item"><strong>Name:</strong> {profileData.user.name}</p>}
        </div>
      ) : (
        <p className="no-profile-message">Could not load user profile details.</p>
      )}

      {contextUser &&
        <p className="logged-in-as">Logged in as: {contextUser.email}</p>
      }

      <button
        onClick={logout}
        className="btn-primary logout-btn"
      >
        Logout
      </button>
    </div>
  );
};

export default DashboardPlaceholder; 