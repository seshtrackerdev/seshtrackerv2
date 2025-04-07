import { useAuth  } from "../../hooks";
import { useState } from 'react';

const AuthDebugger = () => {
  const { user, isAuthenticated, isLoading, getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  const token = getToken();
  const storedToken = localStorage.getItem('auth_token');
  const storedUserData = localStorage.getItem('user_data');
  
  return (
    <div className="auth-debugger" style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      zIndex: 9999,
      backgroundColor: '#111',
      color: '#0f0',
      padding: '10px',
      borderRadius: '5px',
      fontFamily: 'monospace',
      fontSize: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
      maxWidth: isOpen ? '400px' : '150px',
      maxHeight: isOpen ? '500px' : '40px',
      overflow: 'auto'
    }}>
      <div onClick={() => setIsOpen(!isOpen)} style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '5px' }}>
        {isOpen ? '[-] AUTH DEBUG' : '[+] AUTH DEBUG'}
      </div>
      
      {isOpen && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <div><strong>Loading:</strong> {isLoading ? 'true' : 'false'}</div>
            <div><strong>Is Authenticated:</strong> {isAuthenticated ? 'true' : 'false'}</div>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <div><strong>User Object:</strong></div>
            <pre>{user ? JSON.stringify(user, null, 2) : 'null'}</pre>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <div><strong>Memory Token:</strong></div>
            <div style={{ wordBreak: 'break-all' }}>{token ? token.substring(0, 20) + '...' : 'null'}</div>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <div><strong>localStorage auth_token:</strong></div>
            <div style={{ wordBreak: 'break-all' }}>{storedToken ? storedToken.substring(0, 20) + '...' : 'null'}</div>
          </div>
          
          <div>
            <div><strong>localStorage user_data:</strong></div>
            <pre>{storedUserData || 'null'}</pre>
          </div>
          
          <button 
            onClick={() => {
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
              window.location.reload();
            }}
            style={{
              backgroundColor: '#900',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '3px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            Clear Auth Storage
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger; 