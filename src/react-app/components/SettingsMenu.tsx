import React, { useState, useEffect } from 'react';
import './SettingsMenu.css';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [theme, setTheme] = useState(() => localStorage.getItem('themeColorV2') || 'material-dark');

  // Apply theme class to body
  useEffect(() => {
    document.body.className = 'theme-' + theme; // Add prefix for clarity
    localStorage.setItem('themeColorV2', theme);
  }, [theme]);

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(event.target.value);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="settings-overlay" onClick={onClose}> {/* Close on overlay click */} 
      <div className="settings-menu-react" onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking inside */} 
        <div className="settings-header">
          <h3>Settings</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            Appearance
          </button>
          <button
            className={`tab-button ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            Data
          </button>
          <button
            className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
            onClick={() => setActiveTab('goals')}
          >
            Goals
          </button>
           <button
            className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          {/* Contact tab is removed, handled by main nav/page */}
        </div>
        <div className="settings-content">
          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <div className="tab-content">
              <h4>Choose Theme</h4>
              <select value={theme} onChange={handleThemeChange} className="input-react">
                 {/* Keep theme options simple for now */}
                 <option value="material-dark">Material Dark</option>
                 <option value="material-light">Material Light</option>
                 {/* Add more theme options later */}
                 <option value="neutral-dark">Neutral Dark</option>
                 <option value="neutral-light">Neutral Light</option>
                 <option value="ocean-dark">Ocean Dark</option>
                 <option value="ocean-light">Ocean Light</option>
                 {/* ... other themes */}
              </select>
            </div>
          )}

          {/* Data Tab */}
          {activeTab === 'data' && (
            <div className="tab-content">
              <h4>Import / Export Data</h4>
              <p>(Functionality to be implemented)</p>
              {/* Add Import/Export buttons and logic here */}
               <button className="btn-react">Export Data</button>
               <button className="btn-react">Import Data</button>
               {/* Hidden input for file import */}
            </div>
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <div className="tab-content">
              <h4>Monthly Limits & Goals</h4>
              <p>(Functionality to be implemented)</p>
               {/* Add goal inputs and save button here */}
               <div className="form-group-react">
                  <label>Daily Goal (g):</label>
                  <input type="number" placeholder="e.g., 5" className="input-react" />
               </div>
                <div className="form-group-react">
                  <label>Weekly Goal (g):</label>
                  <input type="number" placeholder="e.g., 20" className="input-react" />
               </div>
                <div className="form-group-react">
                  <label>Monthly Goal (g):</label>
                  <input type="number" placeholder="e.g., 80" className="input-react" />
               </div>
               <button className="btn-react">Save Goals</button>
            </div>
          )}
          
          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
             <div className="tab-content">
                <h4>Notifications</h4>
                <p>(Functionality to be implemented)</p>
                {/* Add notification checkboxes/inputs here */}
                <div className="checkbox-group-react">
                   <label><input type="checkbox" /> Enable Pop-Up Notifications</label>
                   <label><input type="checkbox" /> Enable Sound Alerts</label>
                   <label><input type="checkbox" /> Enable Flashing Tab</label>
                   <label><input type="checkbox" /> Enable System Notifications</label>
                </div>
                <div className="form-group-react">
                   <label>Reminder Interval (minutes):</label>
                   <input type="number" defaultValue="60" min="1" className="input-react" />
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsMenu; 