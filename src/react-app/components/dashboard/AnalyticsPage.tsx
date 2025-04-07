import { Link } from 'react-router-dom';
import "../../styles/.css";

const AnalyticsPage = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Analytics</h1>
        <p className="dashboard-welcome">Insights and patterns from your sessions</p>
      </div>

      <div className="page-actions">
        <button className="action-button">
          <span className="button-icon">🗓️</span>
          <span>Last Month</span>
        </button>
        <button className="action-button primary">
          <span className="button-icon">📅</span>
          <span>Last 3 Months</span>
        </button>
        <button className="action-button">
          <span className="button-icon">📆</span>
          <span>All Time</span>
        </button>
        <button className="action-button">
          <span className="button-icon">⚙️</span>
          <span>Custom</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Usage Patterns</h3>
            <span className="material-icon">📊</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">Evening</p>
            <p className="summary-label">Most Common Time</p>
            <p className="summary-detail">65% of sessions</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Mood Impact</h3>
            <span className="material-icon">😊</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">+2.5</p>
            <p className="summary-label">Average Mood Improvement</p>
            <p className="summary-detail">From pre-session to post-session</p>
          </div>
        </div>
        
        <div className="summary-card">
          <div className="summary-card-header">
            <h3>Top Method</h3>
            <span className="material-icon">💨</span>
          </div>
          <div className="summary-card-content">
            <p className="summary-stat">Vaporizer</p>
            <p className="summary-label">Most Used Method</p>
            <p className="summary-detail">40% of all sessions</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="analytics-section">
        <h2 className="section-title">Mood Analysis</h2>
        <div className="analytics-grid">
          <div className="chart-container">
            <h3 className="chart-title">Pre vs. Post Session Mood</h3>
            <div className="placeholder-chart-area">
              <div className="chart-placeholder">
                <div className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Pre</div>
                    <div className="chart-bar" style={{ height: '40%' }}></div>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Post</div>
                    <div className="chart-bar accent" style={{ height: '70%' }}></div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Pre</div>
                    <div className="chart-bar" style={{ height: '30%' }}></div>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Post</div>
                    <div className="chart-bar accent" style={{ height: '80%' }}></div>
                  </div>
                </div>
                <div className="chart-bar-group">
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Pre</div>
                    <div className="chart-bar" style={{ height: '50%' }}></div>
                  </div>
                  <div className="chart-bar-wrapper">
                    <div className="chart-label">Post</div>
                    <div className="chart-bar accent" style={{ height: '85%' }}></div>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color"></div>
                    <div className="legend-label">Pre-Session</div>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color accent"></div>
                    <div className="legend-label">Post-Session</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">Mood by Strain Type</h3>
            <div className="placeholder-chart-area">
              <div className="horizontal-bars">
                <div className="horizontal-bar-item">
                  <div className="bar-label">Indica</div>
                  <div className="horizontal-bar-track">
                    <div className="horizontal-bar indica" style={{ width: '65%' }}></div>
                  </div>
                  <div className="bar-value">6.5</div>
                </div>
                <div className="horizontal-bar-item">
                  <div className="bar-label">Sativa</div>
                  <div className="horizontal-bar-track">
                    <div className="horizontal-bar sativa" style={{ width: '80%' }}></div>
                  </div>
                  <div className="bar-value">8.0</div>
                </div>
                <div className="horizontal-bar-item">
                  <div className="bar-label">Hybrid</div>
                  <div className="horizontal-bar-track">
                    <div className="horizontal-bar hybrid" style={{ width: '72%' }}></div>
                  </div>
                  <div className="bar-value">7.2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analytics-section">
        <h2 className="section-title">Usage Analysis</h2>
        <div className="analytics-grid">
          <div className="chart-container">
            <h3 className="chart-title">Session Frequency</h3>
            <div className="placeholder-chart-area">
              <div className="line-chart-placeholder">
                <div className="line-chart-bg">
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                  <div className="grid-line"></div>
                </div>
                <div className="line-chart-line"></div>
                <div className="line-chart-dots">
                  <div className="chart-dot" style={{ left: '10%', bottom: '20%' }}></div>
                  <div className="chart-dot" style={{ left: '25%', bottom: '35%' }}></div>
                  <div className="chart-dot" style={{ left: '40%', bottom: '50%' }}></div>
                  <div className="chart-dot" style={{ left: '55%', bottom: '30%' }}></div>
                  <div className="chart-dot" style={{ left: '70%', bottom: '60%' }}></div>
                  <div className="chart-dot" style={{ left: '85%', bottom: '45%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="chart-container">
            <h3 className="chart-title">Consumption by Method</h3>
            <div className="placeholder-chart-area">
              <div className="pie-chart-placeholder">
                <div className="pie-segment" style={{ transform: 'rotate(0deg)', backgroundColor: '#4f46e5', clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}></div>
                <div className="pie-segment" style={{ transform: 'rotate(90deg)', backgroundColor: '#10b981', clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}></div>
                <div className="pie-segment" style={{ transform: 'rotate(180deg)', backgroundColor: '#f59e0b', clipPath: 'polygon(50% 50%, 50% 0%, 75% 0%, 100% 50%)' }}></div>
                <div className="pie-segment" style={{ transform: 'rotate(225deg)', backgroundColor: '#ef4444', clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 75% 100%)' }}></div>
                <div className="pie-center"></div>
              </div>
              <div className="pie-legend">
                <div className="pie-legend-item">
                  <div className="pie-legend-color" style={{ backgroundColor: '#4f46e5' }}></div>
                  <div className="pie-legend-label">Vaporizer (40%)</div>
                </div>
                <div className="pie-legend-item">
                  <div className="pie-legend-color" style={{ backgroundColor: '#10b981' }}></div>
                  <div className="pie-legend-label">Joint (25%)</div>
                </div>
                <div className="pie-legend-item">
                  <div className="pie-legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                  <div className="pie-legend-label">Edible (20%)</div>
                </div>
                <div className="pie-legend-item">
                  <div className="pie-legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                  <div className="pie-legend-label">Other (15%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <h2 className="section-title">Recommendations</h2>
        <div className="recommendations-container">
          <div className="recommendation-card">
            <div className="recommendation-icon">💡</div>
            <div className="recommendation-content">
              <h3 className="recommendation-title">Try evening sessions</h3>
              <p className="recommendation-text">Your mood improvement is highest during evening sessions.</p>
            </div>
          </div>
          
          <div className="recommendation-card">
            <div className="recommendation-icon">🌿</div>
            <div className="recommendation-content">
              <h3 className="recommendation-title">Explore more Sativa strains</h3>
              <p className="recommendation-text">They consistently provide your highest mood ratings.</p>
            </div>
          </div>
          
          <div className="recommendation-card">
            <div className="recommendation-icon">⏱️</div>
            <div className="recommendation-content">
              <h3 className="recommendation-title">Optimal duration: 30-45 minutes</h3>
              <p className="recommendation-text">This session length has provided your best experiences.</p>
            </div>
          </div>
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
        <Link to="/inventory" className="nav-link">
          <span className="nav-icon">🌿</span>
          <span>Inventory</span>
        </Link>
      </div>
    </div>
  );
};

export default AnalyticsPage; 
