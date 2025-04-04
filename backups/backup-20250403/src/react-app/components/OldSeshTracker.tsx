import { useEffect } from 'react';
import './OldSeshTracker.css';

const OldSeshTracker = () => {
  useEffect(() => {
    // Set the title when this component mounts
    document.title = 'Sesh Tracker 🌿';
    
    return () => {
      // Reset title when component unmounts
      document.title = 'SeshTracker V2';
    };
  }, []);

  return (
    <div className="old-seshtracker-container">
      <iframe
        src="/legacy/index.html"
        title="Old SeshTracker"
        className="old-seshtracker-iframe"
      />
    </div>
  );
};

export default OldSeshTracker; 
