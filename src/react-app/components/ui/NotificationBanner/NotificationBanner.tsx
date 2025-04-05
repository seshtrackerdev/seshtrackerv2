import React, { useState, useEffect } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationBannerProps {
  type?: NotificationType;
  message?: string;
  autoHide?: boolean;
  hideAfter?: number; // milliseconds
  onClose?: () => void;
  className?: string;
}

/**
 * NotificationBanner component - Displays notification banners for session events
 * This is a placeholder implementation that will be expanded later
 */
const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type = 'info',
  message = '',
  autoHide = true,
  hideAfter = 5000,
  onClose,
  className = '',
}) => {
  const [visible, setVisible] = useState(!!message);
  
  useEffect(() => {
    setVisible(!!message);
    
    let timer: ReturnType<typeof setTimeout>;
    if (autoHide && message) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, hideAfter);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [message, autoHide, hideAfter, onClose]);
  
  if (!visible) return null;
  
  // Get appropriate colors based on notification type
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'rgba(67, 160, 71, 0.15)';
      case 'warning': return 'rgba(255, 193, 7, 0.15)';
      case 'error': return 'rgba(244, 67, 54, 0.15)';
      case 'info':
      default: return 'rgba(33, 150, 243, 0.15)';
    }
  };
  
  const getIconColor = () => {
    switch (type) {
      case 'success': return 'var(--cannabis-green)';
      case 'warning': return 'var(--cannabis-gold)';
      case 'error': return 'var(--error-color)';
      case 'info':
      default: return 'var(--accent-color)';
    }
  };
  
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <div 
      className={`notification-banner ${type} ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        borderRadius: '8px',
        backgroundColor: getBgColor(),
        marginBottom: '16px',
        border: `1px solid ${getIconColor()}`,
        position: 'relative',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(-10px)'
      }}
    >
      {/* Icon placeholder */}
      <div style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        backgroundColor: getIconColor(),
        marginRight: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px'
      }}>
        {type === 'info' ? 'i' : type === 'success' ? '✓' : type === 'warning' ? '!' : '×'}
      </div>
      
      {/* Message */}
      <div style={{ flexGrow: 1 }}>
        {message || `This is a ${type} notification`}
      </div>
      
      {/* Close button */}
      <button
        onClick={handleClose}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '16px',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: '12px',
          color: 'var(--text-secondary)',
          opacity: 0.7,
          transition: 'opacity 0.2s ease'
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
      >
        ×
      </button>
    </div>
  );
};

export default NotificationBanner; 