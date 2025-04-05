import { useEffect, useState } from 'react';

interface HeroSectionProps {
  dynamicHeadlines: string[];
  onDiscoverClick: () => void;
  forwardedRef: React.RefObject<HTMLDivElement | null>;
}

const HeroSection = ({ dynamicHeadlines, onDiscoverClick, forwardedRef }: HeroSectionProps) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);

  // Effect for dynamic headlines
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHeadlineIndex((prevIndex) => (prevIndex + 1) % dynamicHeadlines.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, [dynamicHeadlines]);

  return (
    <div ref={forwardedRef} className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          <span className="title-accent">Sesh</span>Tracker
        </h1>
        <div className="hero-headline-container">
          <p className="hero-headline">
            {dynamicHeadlines[headlineIndex]}
          </p>
        </div>
        <div className="hero-description">
          <p>Your personal cannabis companion for mindful consumption.</p>
        </div>
        <div className="hero-cta">
          <button 
            id="discoverButton" 
            className="discover-button" 
            onClick={onDiscoverClick}
          >
            Discover SeshTracker <span className="icon">👇</span>
          </button>
        </div>
      </div>
      <div className="hero-scroll-indicator">
        <div className="scroll-arrow"></div>
      </div>
    </div>
  );
};

export default HeroSection; 