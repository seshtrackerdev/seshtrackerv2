import React, { useState } from 'react';
import Button from '../Button';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

export interface CollaborativePanelProps {
  sessionId?: string;
  users?: User[];
  onInvite?: (email: string) => void;
  className?: string;
}

/**
 * CollaborativePanel component - Enables real-time collaboration during cannabis sessions
 * This is a placeholder implementation that will be expanded later
 */
const CollaborativePanel: React.FC<CollaborativePanelProps> = ({
  sessionId = 'session-123',
  users = [],
  onInvite,
  className = '',
}) => {
  const [email, setEmail] = useState('');
  const [isLive, setIsLive] = useState(false);
  
  // Mock users if none provided
  const displayUsers = users.length > 0 ? users : [
    { id: 'user1', name: 'You', online: true },
    { id: 'user2', name: 'Jane D.', online: false },
  ];
  
  const handleInvite = () => {
    if (email && onInvite) {
      onInvite(email);
      setEmail('');
    }
  };
  
  const toggleLiveSession = () => {
    setIsLive(!isLive);
  };

  return (
    <div className={`collaborative-panel ${className}`} style={{
      padding: '20px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      maxWidth: '450px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0 }}>Collaborative Session</h3>
        <div style={{
          padding: '6px 12px',
          backgroundColor: isLive ? 'rgba(67, 160, 71, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderRadius: '16px',
          fontSize: '14px',
          fontWeight: 500,
          color: isLive ? 'var(--cannabis-green)' : 'var(--text-muted)'
        }}>
          {isLive ? 'Live' : 'Offline'}
        </div>
      </div>
      
      <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
        Track your session with friends in real-time
      </p>
      
      {/* Live session toggle */}
      <div style={{ marginBottom: '20px' }}>
        <Button
          onClick={toggleLiveSession}
          variant={isLive ? "secondary" : "primary"}
        >
          {isLive ? 'End Live Session' : 'Start Live Session'}
        </Button>
      </div>
      
      {/* Participants */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Participants</h4>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {displayUsers.map(user => (
            <div key={user.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '6px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--cannabis-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                marginRight: '12px'
              }}>
                {user.name.charAt(0)}
              </div>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontWeight: 500 }}>{user.name}</div>
              </div>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: user.online ? 'var(--cannabis-green)' : 'var(--text-muted)'
              }} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Invite form */}
      <div>
        <h4 style={{ fontSize: '16px', marginBottom: '12px' }}>Invite Others</h4>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <div style={{ flexGrow: 1 }}>
            <input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--input-bg)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <Button
            onClick={handleInvite}
            variant="secondary"
          >
            Invite
          </Button>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '24px',
        textAlign: 'center',
        padding: '8px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--text-muted)'
      }}>
        Full collaborative features coming soon...
      </div>
    </div>
  );
};

export default CollaborativePanel; 