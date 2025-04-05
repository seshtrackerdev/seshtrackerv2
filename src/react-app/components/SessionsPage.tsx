import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Sample session data for the placeholder
interface Session {
  id: string;
  date: string;
  strain: string;
  method: string;
  duration: string;
  rating: number;
}

const SessionsPage = () => {
  // Sample sessions data
  const [sessions] = useState<Session[]>([
    {
      id: '1',
      date: '2023-04-02',
      strain: 'Blue Dream',
      method: 'Vaporizer',
      duration: '45 min',
      rating: 8
    },
    {
      id: '2',
      date: '2023-03-28',
      strain: 'Northern Lights',
      method: 'Joint',
      duration: '30 min',
      rating: 7
    },
    {
      id: '3',
      date: '2023-03-25',
      strain: 'Sour Diesel',
      method: 'Edible',
      duration: '2 hrs',
      rating: 9
    },
    {
      id: '4',
      date: '2023-03-20',
      strain: 'Girl Scout Cookies',
      method: 'Pipe',
      duration: '40 min',
      rating: 6
    }
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Sessions</h1>
        <p className="dashboard-welcome">Track and review your experiences</p>
      </div>

      <div className="page-actions">
        <button className="action-button primary">
          <span className="button-icon">➕</span>
          <span>New Session</span>
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

      <div className="content-section">
        <h2 className="section-title">Recent Sessions</h2>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Strain</th>
                <th>Method</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(session => (
                <tr key={session.id}>
                  <td>{session.date}</td>
                  <td>{session.strain}</td>
                  <td>{session.method}</td>
                  <td>{session.duration}</td>
                  <td>
                    <div className="rating-display">
                      <span className="rating-value">{session.rating}/10</span>
                      <div className="rating-bar" style={{ width: `${session.rating * 10}%` }}></div>
                    </div>
                  </td>
                  <td>
                    <div className="action-icons">
                      <button className="icon-button" title="View Details">👁️</button>
                      <button className="icon-button" title="Edit">✏️</button>
                      <button className="icon-button" title="Delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content-section">
        <h2 className="section-title">Session Trends</h2>
        <div className="placeholder-chart-container">
          <div className="placeholder-text">Session frequency and rating trends will appear here</div>
          <div className="placeholder-graph">
            <div className="graph-line"></div>
            <div className="graph-line"></div>
          </div>
        </div>
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