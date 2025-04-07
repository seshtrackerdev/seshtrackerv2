import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDemoProfile } from '../utils/DemoDataGenerator';
import "../../styles/.css";

// Profile definitions with descriptions
const profiles = [
  {
    id: 'light',
    name: 'Light User',
    description: 'Occasional user with less frequent sessions, fewer strains, and lower potency preferences.',
    icon: '🌱'
  },
  {
    id: 'average',
    name: 'Average User',
    description: 'Regular but moderate user with a varied strain collection and balanced consumption patterns.',
    icon: '🌿'
  },
  {
    id: 'heavy',
    name: 'Heavy User',
    description: 'Frequent user with extensive strain variety, higher potency preferences, and regular sessions.',
    icon: '🌳'
  }
];

interface DemoProfileSelectorProps {
  onSelectProfile: (profile: ReturnType<typeof generateDemoProfile>) => void;
}

const DemoProfileSelector = ({ onSelectProfile }: DemoProfileSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSelectedProfile(null);
    }
  };

  const handleSelectProfile = (profileId: string) => {
    setSelectedProfile(profileId);
  };

  const handleGenerateProfile = () => {
    if (!selectedProfile) return;
    
    setGenerating(selectedProfile);
    
    // Small timeout to show the loading state
    setTimeout(() => {
      const profile = generateDemoProfile(selectedProfile as 'light' | 'average' | 'heavy');
      onSelectProfile(profile);
      setGenerating(null);
      setIsOpen(false);
      
      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'demo-toast';
      toast.textContent = `${profiles.find(p => p.id === selectedProfile)?.name} profile loaded!`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 3000);
      }, 10);
    }, 800);
  };

  return (
    <>
      <div className="demo-profile-button-container">
        <button className="demo-profile-button" onClick={toggleOpen}>
          <span className="demo-icon">🧪</span>
          <span>Demo Data</span>
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="demo-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleOpen}
          >
            <motion.div 
              className="demo-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="demo-modal-header">
                <h2>Load Demo Profile</h2>
                <button className="close-button" onClick={toggleOpen}>×</button>
              </div>
              
              <div className="demo-modal-content">
                <p className="demo-description">
                  Select a user profile to load sample data into the application. 
                  This will generate realistic sessions, strains, and statistics for demonstration purposes.
                </p>
                
                <div className="profile-options">
                  {profiles.map(profile => (
                    <div 
                      key={profile.id}
                      className={`profile-option ${selectedProfile === profile.id ? 'selected' : ''}`}
                      onClick={() => handleSelectProfile(profile.id)}
                    >
                      <div className="profile-icon">{profile.icon}</div>
                      <h3>{profile.name}</h3>
                      <p>{profile.description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="demo-actions">
                  <button 
                    className="cancel-button" 
                    onClick={toggleOpen}
                  >
                    Cancel
                  </button>
                  <button 
                    className="generate-button"
                    disabled={!selectedProfile || !!generating}
                    onClick={handleGenerateProfile}
                  >
                    {generating ? (
                      <>
                        <span className="loading-spinner-small"></span>
                        <span>Generating...</span>
                      </>
                    ) : (
                      'Generate Demo Data'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DemoProfileSelector; 
