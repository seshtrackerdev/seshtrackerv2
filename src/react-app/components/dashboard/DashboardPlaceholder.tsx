import { useState, useEffect } from 'react';
import { useAuth  } from "../../hooks";
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import DemoProfileSelector from './DemoProfileSelector';
import type { DemoSession, DemoStrain, DemoProfileSummary } from '../utils/DemoDataGenerator';
import "../../styles/.css";

// Define the expected structure of the user profile data from the API
interface UserProfile {
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

// Interactive modal component for actions
interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="modal-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>{title}</h3>
              <button className="modal-close" onClick={onClose}>×</button>
            </div>
            <div className="modal-content">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DashboardPlaceholder = () => {
  const { user: contextUser, fetchProtected, logout } = useAuth();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for demo data
  const [sessionSummary, setSessionSummary] = useState<DemoProfileSummary['sessions']>({ count: 0, last: '' });
  const [strainSummary, setStrainSummary] = useState<DemoProfileSummary['strains']>({ count: 0, favorite: '' });
  const [moodSummary, setMoodSummary] = useState<DemoProfileSummary['mood']>({ average: 0, trend: 'stable' });
  const [demoSessions, setDemoSessions] = useState<DemoSession[]>([]);
  const [demoStrains, setDemoStrains] = useState<DemoStrain[]>([]);
  
  // States for interactive elements
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [findStrainModalOpen, setFindStrainModalOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchProtected('/api/protected/user-profile');
        if (!response.ok) {
          throw new Error(`Failed to fetch profile: ${response.statusText}`);
        }
        const data: UserProfile = await response.json();
        setProfileData(data);
        
        // Initialize with default demo data
        setSessionSummary({ count: 0, last: '' });
        setStrainSummary({ count: 0, favorite: '' });
        setMoodSummary({ average: 0, trend: 'stable' });
      } catch (err: any) {
        console.error("Error fetching user profile:", err);
        if (err.message !== 'Unauthorized' && err.message !== 'No authentication token available.') {
          setError(err.message || 'Could not load user profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [fetchProtected]);

  // Handler for applying selected demo profile
  const handleSelectProfile = (profile: any) => {
    setSessionSummary(profile.summary.sessions);
    setStrainSummary(profile.summary.strains);
    setMoodSummary(profile.summary.mood);
    setDemoSessions(profile.sessions);
    setDemoStrains(profile.strains);
  };

  // Handler for toggling insights
  const toggleInsight = (index: number) => {
    if (selectedInsight === index) {
      setSelectedInsight(null);
    } else {
      setSelectedInsight(index);
    }
  };

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
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to SeshTracker</h1>
        <p className="dashboard-welcome">
          {profileData?.user.name ? `Hello, ${profileData.user.name}!` : 'Welcome back!'}
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Quick summary cards with animations */}
        <motion.div 
          className="summary-card"
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <div className="summary-card-header">
            <h3>Session Summary</h3>
            <span className="material-icon">📊</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">{sessionSummary.count}</p>
            <p className="summary-label">Sessions Tracked</p>
            {sessionSummary.last && (
              <p className="summary-detail">Last session: {sessionSummary.last}</p>
            )}
          </div>
          <Link to="/sessions" className="card-action-link">View All Sessions</Link>
        </motion.div>
        
        <motion.div 
          className="summary-card"
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <div className="summary-card-header">
            <h3>Strains</h3>
            <span className="material-icon">🌿</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">{strainSummary.count}</p>
            <p className="summary-label">Strains Tracked</p>
            {strainSummary.favorite && (
              <p className="summary-detail">Favorite: {strainSummary.favorite}</p>
            )}
          </div>
          <Link to="/inventory" className="card-action-link">Manage Inventory</Link>
        </motion.div>
        
        <motion.div 
          className="summary-card"
          whileHover={{ y: -5 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          <div className="summary-card-header">
            <h3>Mood Tracker</h3>
            <span className="material-icon">
              {moodSummary.trend === 'up' ? '😊' : moodSummary.trend === 'down' ? '😔' : '😐'}
            </span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">{moodSummary.average.toFixed(1)}/10</p>
            <p className="summary-label">Average Mood</p>
            <p className="summary-trend">
              {moodSummary.trend === 'up' ? 'Trending up' : 
               moodSummary.trend === 'down' ? 'Trending down' : 'Stable'}
            </p>
          </div>
          <Link to="/analytics" className="card-action-link">View Analytics</Link>
        </motion.div>
      </div>

      {/* Quick actions section with interactive buttons */}
      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          <motion.button 
            className="action-button primary"
            whileTap={{ scale: 0.95 }}
            onClick={() => setNewSessionModalOpen(true)}
          >
            <span className="button-icon">➕</span>
            <span>Log New Session</span>
          </motion.button>
          
          <motion.button 
            className="action-button"
            whileTap={{ scale: 0.95 }}
            onClick={() => setFindStrainModalOpen(true)}
          >
            <span className="button-icon">🔍</span>
            <span>Find Strain</span>
          </motion.button>
          
          <motion.button 
            className="action-button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Show toast notification
              const toast = document.createElement('div');
              toast.className = 'demo-toast';
              toast.textContent = 'Feature coming soon!';
              document.body.appendChild(toast);
              
              setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                  toast.classList.remove('show');
                  setTimeout(() => {
                    document.body.removeChild(toast);
                  }, 300);
                }, 2000);
              }, 10);
            }}
          >
            <span className="button-icon">📝</span>
            <span>Add to Inventory</span>
          </motion.button>
          
          <motion.button 
            className="action-button"
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Show toast notification
              const toast = document.createElement('div');
              toast.className = 'demo-toast';
              toast.textContent = 'Reports coming soon!';
              document.body.appendChild(toast);
              
              setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                  toast.classList.remove('show');
                  setTimeout(() => {
                    document.body.removeChild(toast);
                  }, 300);
                }, 2000);
              }, 10);
            }}
          >
            <span className="button-icon">📈</span>
            <span>View Reports</span>
          </motion.button>
        </div>
      </div>

      {/* Insights section - now with interactive elements */}
      <div className="insights-section">
        <h2 className="section-title">Your Insights</h2>
        <div className="insights-content">
          {demoSessions.length > 0 ? (
            <div className="insights-grid">
              {[
                {
                  title: "Best Time of Day",
                  value: "Evening",
                  detail: "Your evening sessions have an average rating of 8.2/10",
                  icon: "🌙"
                },
                {
                  title: "Optimal Strain Type",
                  value: "Hybrid",
                  detail: "Hybrid strains provide the most consistent mood improvement",
                  icon: "🌿"
                },
                {
                  title: "Consumption Pattern",
                  value: "Consistent",
                  detail: "Your usage has been steady for the last 30 days",
                  icon: "📊"
                }
              ].map((insight, index) => (
                <motion.div
                  key={index}
                  className={`insight-card ${selectedInsight === index ? 'expanded' : ''}`}
                  onClick={() => toggleInsight(index)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <h3>{insight.title}</h3>
                  </div>
                  <p className="insight-value">{insight.value}</p>
                  <AnimatePresence>
                    {selectedInsight === index && (
                      <motion.div
                        className="insight-detail"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <p>{insight.detail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div>
              <p className="insights-placeholder">
                Your personal insights will appear here as you track more sessions.
                Start logging your experiences to receive personalized recommendations and patterns.
              </p>
              {/* This would be replaced with actual charts and insights in production */}
              <div className="placeholder-chart">
                <div className="chart-bar" style={{ height: '40%' }}></div>
                <div className="chart-bar" style={{ height: '65%' }}></div>
                <div className="chart-bar" style={{ height: '30%' }}></div>
                <div className="chart-bar" style={{ height: '70%' }}></div>
                <div className="chart-bar" style={{ height: '50%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User profile section */}
      <div className="user-profile-section">
        {profileData ? (
          <div className="user-profile-card">
            <h3 className="profile-section-title">Your Profile</h3>
            <p className="profile-item"><strong>Email:</strong> {profileData.user.email}</p>
            {profileData.user.name && <p className="profile-item"><strong>Name:</strong> {profileData.user.name}</p>}
            <button
              onClick={logout}
              className="btn-primary logout-btn"
            >
              Logout
            </button>
          </div>
        ) : (
          <p className="no-profile-message">Could not load user profile details.</p>
        )}
      </div>

      {/* Demo profile selector */}
      <DemoProfileSelector onSelectProfile={handleSelectProfile} />

      {/* Modal for logging a new session */}
      <ActionModal
        isOpen={newSessionModalOpen}
        onClose={() => setNewSessionModalOpen(false)}
        title="Log New Session"
      >
        <form className="demo-form">
          <div className="form-group">
            <label htmlFor="strain">Strain</label>
            <select id="strain" defaultValue="">
              <option value="" disabled>Select a strain</option>
              {demoStrains.map(strain => (
                <option key={strain.id} value={strain.name}>{strain.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="method">Method</label>
            <select id="method" defaultValue="">
              <option value="" disabled>Select a method</option>
              <option value="vaporizer">Vaporizer</option>
              <option value="joint">Joint</option>
              <option value="bong">Bong</option>
              <option value="pipe">Pipe</option>
              <option value="edible">Edible</option>
              <option value="dab">Dab</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="pre-mood">Pre-Session Mood (1-10)</label>
              <input type="number" id="pre-mood" min="1" max="10" defaultValue="5" />
            </div>
            
            <div className="form-group">
              <label htmlFor="post-mood">Post-Session Mood (1-10)</label>
              <input type="number" id="post-mood" min="1" max="10" defaultValue="7" />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea id="notes" rows={3} placeholder="Enter any session notes..."></textarea>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => setNewSessionModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="primary-button"
              onClick={() => {
                setNewSessionModalOpen(false);
                
                // Show success notification
                const toast = document.createElement('div');
                toast.className = 'demo-toast';
                toast.textContent = 'Session logged successfully!';
                document.body.appendChild(toast);
                
                setTimeout(() => {
                  toast.classList.add('show');
                  setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                      document.body.removeChild(toast);
                    }, 300);
                  }, 2000);
                }, 10);
              }}
            >
              Save Session
            </button>
          </div>
        </form>
      </ActionModal>
      
      {/* Modal for finding a strain */}
      <ActionModal
        isOpen={findStrainModalOpen}
        onClose={() => setFindStrainModalOpen(false)}
        title="Find Strain"
      >
        <div className="strain-finder">
          <div className="search-container">
            <input type="text" placeholder="Search by name, effect, or type..." className="strain-search" />
          </div>
          
          <div className="filter-options">
            <div className="filter-group">
              <h4>Type</h4>
              <div className="filter-options-group">
                <label className="filter-option">
                  <input type="checkbox" checked /> Indica
                </label>
                <label className="filter-option">
                  <input type="checkbox" checked /> Sativa
                </label>
                <label className="filter-option">
                  <input type="checkbox" checked /> Hybrid
                </label>
              </div>
            </div>
            
            <div className="filter-group">
              <h4>Effects</h4>
              <div className="filter-options-group">
                <label className="filter-option">
                  <input type="checkbox" /> Relaxing
                </label>
                <label className="filter-option">
                  <input type="checkbox" /> Energizing
                </label>
                <label className="filter-option">
                  <input type="checkbox" /> Uplifting
                </label>
                <label className="filter-option">
                  <input type="checkbox" /> Sleepy
                </label>
              </div>
            </div>
          </div>
          
          <div className="strain-results">
            <h4>Popular Strains</h4>
            <div className="strain-list">
              {demoStrains.slice(0, 5).map(strain => (
                <div key={strain.id} className="strain-list-item">
                  <div className="strain-info">
                    <h5>{strain.name}</h5>
                    <span className={`strain-type ${strain.type.toLowerCase()}`}>{strain.type}</span>
                  </div>
                  <div className="strain-stats">
                    <span>THC: {strain.thcContent}</span>
                    <span className="strain-rating">⭐ {strain.rating}/10</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="primary-button"
              onClick={() => setFindStrainModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </ActionModal>
    </div>
  );
};

export default DashboardPlaceholder; 
