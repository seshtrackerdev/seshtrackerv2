import React, { useCallback } from 'react';
import { useTheme } from '../ThemeProvider';
import Toggle from '../Toggle';
import "../../../styles/.css";

interface ThemeToggleProps {
  showIcon?: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  showIcon = true,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const { isDark, toggleTheme, setTheme } = useTheme();

  // Use callback to ensure the function doesn't change on re-renders
  const handleToggleChange = useCallback((checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  }, [setTheme]);

  return (
    <div className={`theme-toggle ${className}`}>
      {showIcon && (
        <div className="theme-toggle-icons">
          <div 
            className={`theme-icon ${!isDark ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="sun-icon">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          </div>
          <div 
            className={`theme-icon ${isDark ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="moon-icon">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </div>
        </div>
      )}
      <Toggle
        checked={isDark}
        onChange={handleToggleChange}
        size={size}
        label={showLabel ? (isDark ? 'Dark Mode' : 'Light Mode') : undefined}
        ariaLabel="Toggle dark mode"
      />
    </div>
  );
};

export default ThemeToggle; 
