import React, { useState, useEffect, useRef } from 'react';

interface HeroSectionProps {
  dynamicHeadlines: string[];
  onDiscoverClick: () => void;
  forwardedRef: React.RefObject<HTMLDivElement | null>;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  dynamicHeadlines,
  onDiscoverClick,
  forwardedRef
}) => {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  // Effect for dynamic headlines with improved performance
  useEffect(() => {
    const rotateHeadlines = () => {
      setIsAnimating(true);
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      
      // Set timeout to change headline after animation completes
      timeoutRef.current = window.setTimeout(() => {
        setHeadlineIndex((prevIndex) => (prevIndex + 1) % dynamicHeadlines.length);
        setIsAnimating(false);
      }, 1500); // Half of the total animation cycle
    };
    
    // Initial animation after a short delay
    const initialDelayId = window.setTimeout(() => {
      rotateHeadlines();
    }, 1000);
    
    // Set up interval for headline rotation
    const intervalId = window.setInterval(rotateHeadlines, 3000);
    
    // Cleanup function
    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(initialDelayId);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [dynamicHeadlines.length]);

  // Optimize animation performance with will-change
  useEffect(() => {
    const headline = document.querySelector('.dynamic-headline');
    if (headline) {
      headline.classList.add('will-change-transform');
      
      // Remove the will-change property after animation to save memory
      return () => {
        headline.classList.remove('will-change-transform');
      };
    }
  }, [headlineIndex]);

  // Use an explicit click handler to ensure the click function is called
  const handleStartTourClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Help browser optimize animations
    document.body.classList.add('will-change-scroll');
    
    // Call both the component's onDiscoverClick and also global handlers for redundancy
    onDiscoverClick();
    
    // Call any global handlers if they exist
    if (typeof window.handleDiscoverClick === 'function') {
      window.handleDiscoverClick();
    }
    
    // Also try to handle via direct DOM manipulation as a fallback
    const landingPage = document.querySelector('.landing-page') as HTMLElement;
    if (landingPage) {
      landingPage.classList.add('tour-started');
      landingPage.style.height = 'auto';
      landingPage.style.overflow = 'visible';
    }
    
    document.body.classList.add('tour-started');
    
    // Make tour sections visible
    const tourSections = document.querySelectorAll('.tour-section');
    tourSections.forEach(section => {
      const el = section as HTMLElement;
      el.style.display = 'flex';
      
      // Use requestAnimationFrame for smoother animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
    
    // Try to scroll to the first section - use section-features instead of section-1
    const firstSection = document.getElementById('section-features');
    if (firstSection) {
      // Use requestAnimationFrame for smoother scrolling
      requestAnimationFrame(() => {
        firstSection.scrollIntoView({ behavior: 'smooth' });
      });
    }
    
    // Clean up optimization classes after animation
    setTimeout(() => {
      document.body.classList.remove('will-change-scroll');
    }, 1000);
  };

  return (
    <div className="hero-section" ref={forwardedRef}>
      <div className="leaf-animation" aria-hidden="true">
        <div className="leaf leaf-1"></div>
        <div className="leaf leaf-2"></div>
        <div className="leaf leaf-3"></div>
      </div>
      
      <div className="hero-content">
        <div className="headline-container">
          <h1 
            className={`dynamic-headline ${isAnimating ? 'animating' : ''}`} 
            key={headlineIndex}
            aria-live="polite"
          >
            {dynamicHeadlines[headlineIndex]}
          </h1>
        </div>
        
        <p className="hero-tagline">
          Your personal cannabis companion. Track strains, monitor effects, and understand your usage patterns.
        </p>
        
        <div className="hero-cta">
          <button 
            className="btn btn-primary discover-button" 
            onClick={handleStartTourClick}
            aria-label="Discover SeshTracker and start the interactive tour"
          >
            Discover SeshTracker <span className="icon" aria-hidden="true">👇</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 