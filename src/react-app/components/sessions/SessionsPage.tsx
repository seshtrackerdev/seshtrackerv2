import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSession  } from "../../contexts";
import { 
  SessionSummary, 
  SessionCreate, 
  ConsumptionMethod 
} from '../../types/session';
import './Dashboard.css';

const SessionsPage = () => {
  const { 
    sessions, 
    loadSessions, 
    createSession, 
    deleteSession, 
    isLoading, 
    error 
  } = useSession();
  
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);
  const [formData, setFormData] = useState<Partial<SessionCreate>>({
    title: '',
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    consumptionMethod: 'Vape' as ConsumptionMethod,
    rating: 7,
    notes: '',
    isPublic: false
  });
  
  useEffect(() => {
    // Load sessions when component mounts
    loadSessions();
  }, [loadSessions]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.startTime && formData.consumptionMethod) {
      await createSession({
        ...formData,
        userId: '', // This will be set by the backend
        isPublic: formData.isPublic ?? false,
      } as SessionCreate);
      setShowNewSessionForm(false);
      setFormData({
        title: '',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        consumptionMethod: 'Vape' as ConsumptionMethod,
        rating: 7,
        notes: '',
        isPublic: false
      });
    }
  };
  
  const handleDelete = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      await deleteSession(sessionId);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calculate duration
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMs = endDate.getTime() - startDate.getTime();
    const minutes = Math.floor(durationMs / 60000);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Sessions</h1>
        <p className="dashboard-welcome">Track and review your experiences</p>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="page-actions">
        <button 
          className="action-button primary"
          onClick={() => setShowNewSessionForm(!showNewSessionForm)}
        >
          <span className="button-icon">➕</span>
          <span>{showNewSessionForm ? 'Cancel' : 'New Session'}</span>
        </button>
        <button className="action-button">
          <span className="button-icon">📊</span>
          <span>Filter</span>
        </button>
        <button className="action-button">
          <span className="button-icon">📥</span>
          <span>Export</span>
        </button>
      </div>

      {showNewSessionForm && (
        <div className="content-section">
          <h2 className="section-title">New Session</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime ? new Date(formData.endTime).toISOString().slice(0, 16) : ''}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="consumptionMethod">Method</label>
                <select
                  id="consumptionMethod"
                  name="consumptionMethod"
                  value={formData.consumptionMethod}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Flower">Flower</option>
                  <option value="Vape">Vape</option>
                  <option value="Concentrate">Concentrate</option>
                  <option value="Edible">Edible</option>
                  <option value="Tincture">Tincture</option>
                  <option value="Topical">Topical</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="rating">Rating (1-10)</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic === true}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isPublic: e.target.checked
                }))}
              />
              <label htmlFor="isPublic">Make this session public</label>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="action-button primary">
                Create Session
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="content-section">
        <h2 className="section-title">Recent Sessions</h2>
        
        {isLoading ? (
          <div className="loading-indicator">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-state">
            <p>No sessions recorded yet. Create your first session to start tracking!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Method</th>
                  <th>Duration</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id}>
                    <td>{formatDate(session.startTime)}</td>
                    <td>{session.title}</td>
                    <td>{session.consumptionMethod}</td>
                    <td>{session.endTime ? calculateDuration(session.startTime, session.endTime) : 'N/A'}</td>
                    <td>
                      <div className="rating-display">
                        <span className="rating-value">{session.rating ?? 'N/A'}</span>
                        {session.rating && (
                          <div className="rating-bar" style={{ width: `${session.rating * 10}%` }}></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="action-icons">
                        <button className="icon-button" title="View Details">👁️</button>
                        <button className="icon-button" title="Edit">✏️</button>
                        <button 
                          className="icon-button" 
                          title="Delete"
                          onClick={() => handleDelete(session.id)}
                        >🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="navigation-links">
        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/inventory" className="nav-link">
          <span className="nav-icon">🌿</span>
          <span>Inventory</span>
        </Link>
        <Link to="/analytics" className="nav-link">
          <span className="nav-icon">📈</span>
          <span>Analytics</span>
        </Link>
      </div>
    </div>
  );
};

export default SessionsPage; 