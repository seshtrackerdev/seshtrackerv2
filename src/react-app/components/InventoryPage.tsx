import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

// Sample strain data for the placeholder
interface Strain {
  id: string;
  name: string;
  type: 'Indica' | 'Sativa' | 'Hybrid';
  thcContent: string;
  cbdContent: string;
  quantity: string;
  rating: number;
}

const InventoryPage = () => {
  // Sample inventory data
  const [strains] = useState<Strain[]>([
    {
      id: '1',
      name: 'Blue Dream',
      type: 'Hybrid',
      thcContent: '18%',
      cbdContent: '0.5%',
      quantity: '7g',
      rating: 9
    },
    {
      id: '2',
      name: 'Northern Lights',
      type: 'Indica',
      thcContent: '16%',
      cbdContent: '0.2%',
      quantity: '3.5g',
      rating: 8
    },
    {
      id: '3',
      name: 'Sour Diesel',
      type: 'Sativa',
      thcContent: '20%',
      cbdContent: '0.3%',
      quantity: '1g',
      rating: 7
    },
    {
      id: '4',
      name: 'Girl Scout Cookies',
      type: 'Hybrid',
      thcContent: '22%',
      cbdContent: '0.1%',
      quantity: '5g',
      rating: 10
    },
    {
      id: '5',
      name: 'OG Kush',
      type: 'Hybrid',
      thcContent: '19%',
      cbdContent: '0.3%',
      quantity: '2g',
      rating: 8
    }
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Strain Inventory</h1>
        <p className="dashboard-welcome">Manage your collection</p>
      </div>

      <div className="page-actions">
        <button className="action-button primary">
          <span className="button-icon">➕</span>
          <span>Add Strain</span>
        </button>
        <button className="action-button">
          <span className="button-icon">🔍</span>
          <span>Search</span>
        </button>
        <button className="action-button">
          <span className="button-icon">📋</span>
          <span>Shopping List</span>
        </button>
      </div>

      {/* Inventory summary cards */}
      <div className="dashboard-grid">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Total Strains</h3>
            <span className="material-icon">🌿</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">{strains.length}</p>
            <p className="summary-label">Strains Tracked</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Type Breakdown</h3>
            <span className="material-icon">📊</span>
          </div>
          <div className="summary-card-content">
            <div className="type-breakdown">
              <div className="type-item">
                <span className="type-label">Indica</span>
                <div className="type-bar indica" style={{ width: '30%' }}></div>
                <span className="type-percentage">30%</span>
              </div>
              <div className="type-item">
                <span className="type-label">Sativa</span>
                <div className="type-bar sativa" style={{ width: '20%' }}></div>
                <span className="type-percentage">20%</span>
              </div>
              <div className="type-item">
                <span className="type-label">Hybrid</span>
                <div className="type-bar hybrid" style={{ width: '50%' }}></div>
                <span className="type-percentage">50%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Top Rated</h3>
            <span className="material-icon">⭐</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">Girl Scout Cookies</p>
            <p className="summary-label">Rated 10/10</p>
            <p className="summary-detail">Hybrid - 22% THC</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2 className="section-title">Your Collection</h2>
        
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>THC</th>
                <th>CBD</th>
                <th>Quantity</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {strains.map(strain => (
                <tr key={strain.id}>
                  <td>{strain.name}</td>
                  <td>
                    <span className={`strain-type ${strain.type.toLowerCase()}`}>
                      {strain.type}
                    </span>
                  </td>
                  <td>{strain.thcContent}</td>
                  <td>{strain.cbdContent}</td>
                  <td>{strain.quantity}</td>
                  <td>
                    <div className="rating-display">
                      <span className="rating-value">{strain.rating}/10</span>
                      <div className="rating-bar" style={{ width: `${strain.rating * 10}%` }}></div>
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

      <div className="navigation-links">
        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/sessions" className="nav-link">
          <span className="nav-icon">📝</span>
          <span>Sessions</span>
        </Link>
        <Link to="/analytics" className="nav-link">
          <span className="nav-icon">📈</span>
          <span>Analytics</span>
        </Link>
      </div>
    </div>
  );
};

export default InventoryPage; 