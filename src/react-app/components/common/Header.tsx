import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth  } from "../../hooks";
import { useTheme  } from "../../components/ui/ThemeProvider";
import SettingsMenu from './SettingsMenu';

const Header: React.FC = () => {
  const { isAuthenticated, logout, isLoading } = useAuth();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  // Check if we're on landing-related pages
  const isLandingPage = ['/', '/login', '/register', '/forgot-password', '/contact'].includes(location.pathname);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSettings = () => setIsSettingsOpen(!isSettingsOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  const handleAuthRedirect = () => { window.location.href = '/login'; };

  return (
    <header className="app-header">
      <div className="header-content">
        {/* Logo and brand */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="header-brand">
          <img src="/images/favicon.png" alt="SeshTracker" className="header-logo" />
          <span className="brand-text">
            <span className="brand-gradient">Sesh</span>-Tracker<span className="domain">.com</span>
          </span>
        </Link>

        {/* Navigation for desktop */}
        <nav className="desktop-nav">
          {!isLoading && isAuthenticated ? (
            <>
              <Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>Dashboard</Link>
              <Link to="/sessions" className={location.pathname === "/sessions" ? "active" : ""}>Sessions</Link>
              <Link to="/inventory" className={location.pathname === "/inventory" ? "active" : ""}>Inventory</Link>
              <Link to="/analytics" className={location.pathname === "/analytics" ? "active" : ""}>Analytics</Link>
            </>
          ) : (
            <>
              <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""}>Contact</Link>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="header-actions">
          {!isLoading && isAuthenticated ? (
            <>
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              <button 
                className="settings-button" 
                onClick={toggleSettings} 
                title="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </>
          ) : isLandingPage && (
            <>
              <button 
                className="theme-toggle"
                onClick={toggleTheme}
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              <button className="login-button" onClick={handleAuthRedirect}>
                Login
              </button>
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className={`mobile-menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
                <small className="cannabis-icon" aria-hidden="true">🍃</small>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Cannabis leaf decorations */}
        <div className="menu-decoration" aria-hidden="true">
          <div className="menu-leaf menu-leaf-1">🍃</div>
          <div className="menu-leaf menu-leaf-2">🍃</div>
          <div className="menu-leaf menu-leaf-3">🍃</div>
        </div>
        
        {/* Navigation section */}
        <div className="nav-section">Navigation</div>
        
        {/* Contact link for all users */}
        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/contact" ? "active" : ""}>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Contact
          </span>
        </Link>
        
        {/* Navigation links for authenticated users */}
        {!isLoading && isAuthenticated && (
          <>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/dashboard" ? "active" : ""}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Dashboard
              </span>
            </Link>
            <Link to="/sessions" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/sessions" ? "active" : ""}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Sessions
              </span>
            </Link>
            <Link to="/inventory" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/inventory" ? "active" : ""}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
                Inventory
              </span>
            </Link>
            <Link to="/analytics" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/analytics" ? "active" : ""}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10"></line>
                  <line x1="12" y1="20" x2="12" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
                Analytics
              </span>
            </Link>
          </>
        )}
        
        {/* Settings section */}
        <div className="nav-section">Settings</div>
        
        {/* UI Components link */}
        <Link to="/ui-components" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/ui-components" ? "active" : ""}>
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
            UI Components
          </span>
        </Link>
        
        {/* Theme toggle */}
        <button 
          onClick={() => { toggleTheme(); setIsMobileMenuOpen(false); }}
          className={isDark ? 'theme-toggle-light' : 'theme-toggle-dark'}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isDark ? (
                <circle cx="12" cy="12" r="5"></circle>
              ) : (
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              )}
            </svg>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </button>
        
        {/* Authentication section */}
        <div className="nav-section">Account</div>
        
        {/* Authentication actions */}
        {!isLoading && isAuthenticated ? (
          <>
            <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={location.pathname === "/profile" ? "active" : ""}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </span>
            </Link>
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                Logout
              </span>
            </button>
          </>
        ) : (
          isLandingPage && (
            <button onClick={() => { handleAuthRedirect(); setIsMobileMenuOpen(false); }}>
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                Login
              </span>
            </button>
          )
        )}
        
        {/* Classic version link with cannabis-purple styling */}
        <Link 
          to="/legacy" 
          onClick={() => setIsMobileMenuOpen(false)}
          className="classic-version-link"
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            Classic Version
          </span>
        </Link>
      </nav>

      {/* Settings Menu - Only shown for authenticated users */}
      {!isLoading && isAuthenticated && (
        <SettingsMenu isOpen={isSettingsOpen} onClose={toggleSettings} />
      )}
    </header>
  );
};

export default Header; 