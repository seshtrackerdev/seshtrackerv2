import React, { useState } from 'react';
import Button from '../Button';

export interface SharingCardProps {
  sessionId?: string;
  sessionTitle?: string;
  onShareClick?: (method: string) => void;
  className?: string;
}

/**
 * SharingCard component - Allows users to share their session with others
 * This is a placeholder implementation that will be expanded later
 */
const SharingCard: React.FC<SharingCardProps> = ({
  sessionId = '12345',
  sessionTitle = 'My Cannabis Session',
  onShareClick,
  className = '',
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  
  const shareUrl = `https://sesh-tracker.com/shared/${sessionId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleShareClick = (method: string) => {
    if (onShareClick) {
      onShareClick(method);
    }
  };

  return (
    <div className={`sharing-card ${className}`} style={{
      padding: '20px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      maxWidth: '450px'
    }}>
      <h3 style={{ marginBottom: '12px' }}>Share Your Experience</h3>
      <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
        Share your "{sessionTitle}" session with friends or the community
      </p>
      
      {/* Share link section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '24px',
        padding: '12px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px'
      }}>
        <div style={{
          flexGrow: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '14px',
          fontFamily: 'monospace',
          padding: '6px 10px',
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px'
        }}>
          {shareUrl}
        </div>
        <div style={{ minWidth: '80px' }}>
          <Button
            onClick={handleCopyLink}
            variant="secondary"
          >
            {copySuccess ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>
      
      {/* Share buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{ flex: '1', textAlign: 'center' }}>
          <Button
            onClick={() => handleShareClick('twitter')}
            variant="secondary"
          >
            Twitter
          </Button>
        </div>
        <div style={{ flex: '1', textAlign: 'center' }}>
          <Button
            onClick={() => handleShareClick('facebook')}
            variant="secondary"
          >
            Facebook
          </Button>
        </div>
        <div style={{ flex: '1', textAlign: 'center' }}>
          <Button
            onClick={() => handleShareClick('email')}
            variant="secondary"
          >
            Email
          </Button>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '16px',
        textAlign: 'center',
        padding: '8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--text-muted)'
      }}>
        Full sharing functionality coming soon...
      </div>
    </div>
  );
};

export default SharingCard; 