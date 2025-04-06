import { useEffect, useState, useCallback } from 'react';

interface TourManagerProps {
  isTourStarted: boolean;
  sectionRefs: React.RefObject<HTMLElement | null>[];
  autoStartTimeout?: number;
}

const TourManager: React.FC<TourManagerProps> = ({
  isTourStarted,
  sectionRefs,
  autoStartTimeout = 5000,
}) => {
  const [initialized, setInitialized] = useState(false);

  // Function to handle keyboard navigation with better section tracking
  const handleKeyNavigation = useCallback((event: KeyboardEvent) => {
    if (!isTourStarted || !initialized) return;
    
    // Prevent keyboard navigation during user input in form fields
    if (document.activeElement instanceof HTMLInputElement || 
        document.activeElement instanceof HTMLTextAreaElement) {
      return;
    }
    
    // Find current active section
    const activeSection = document.querySelector('.tour-section.active-section');
    if (!activeSection) return;
    
    // Get all visible tour sections
    const allSections = Array.from(document.querySelectorAll('.tour-section')).filter(
      section => window.getComputedStyle(section).display !== 'none'
    );
    
    const currentIndex = allSections.indexOf(activeSection as Element);
    
    let targetIndex = currentIndex;
    
    // Handle arrow key navigation
    if (event.key === 'ArrowDown' || event.key === 'PageDown') {
      event.preventDefault();
      targetIndex = Math.min(currentIndex + 1, allSections.length - 1);
    } else if (event.key === 'ArrowUp' || event.key === 'PageUp') {
      event.preventDefault();
      targetIndex = Math.max(currentIndex - 1, 0);
    } else if (event.key === 'Home') {
      event.preventDefault();
      targetIndex = 0;
    } else if (event.key === 'End') {
      event.preventDefault();
      targetIndex = allSections.length - 1;
    } else {
      return; // Not a navigation key
    }
    
    // Only scroll if the index has changed
    if (targetIndex !== currentIndex) {
      // First find the sidebar indicator that corresponds with this section
      const targetSection = allSections[targetIndex] as HTMLElement;
      const sectionId = targetSection.id;
      const progressIndicators = document.querySelectorAll('.tour-progress-indicator');
      
      // Remove active class from all sections
      allSections.forEach(section => {
        section.classList.remove('active-section');
      });
      
      // Add active class to target section
      targetSection.classList.add('active-section');
      
      // Update progress indicators classes
      progressIndicators.forEach(indicator => {
        indicator.classList.remove('active');
        indicator.setAttribute('aria-current', 'false');
        
        // Check if this indicator is for the current section
        if (indicator.getAttribute('data-section') === sectionId) {
          indicator.classList.add('active');
          indicator.setAttribute('aria-current', 'true');
        }
      });
      
      // Update URL hash for direct linking
      if (sectionId) {
        window.history.replaceState(null, '', `#${sectionId}`);
      }
      
      // Ensure tour progress is visible (in case it's faded out)
      const tourProgress = document.querySelector('.tour-progress');
      if (tourProgress) {
        tourProgress.classList.add('visible');
      }
      
      // Scroll the section into view with offset
      const headerOffset = 80;
      const elementPosition = targetSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Announce for screen readers
      const liveRegion = document.getElementById('tour-announcer');
      if (liveRegion) {
        const sectionTitle = targetSection.querySelector('h2')?.textContent || sectionId;
        liveRegion.textContent = `Navigated to ${sectionTitle} section`;
      }
      
      // Ensure tour progress indicator appears on mobile too
      if (window.innerWidth <= 768) {
        const tourProgress = document.querySelector('.tour-progress');
        if (tourProgress && tourProgress instanceof HTMLElement) {
          // Ensure it's visible for a few seconds
          tourProgress.style.opacity = '1';
          setTimeout(() => {
            tourProgress.style.opacity = '';
          }, 3000);
        }
      }
    }
  }, [isTourStarted, initialized]);

  // Set up keyboard navigation
  useEffect(() => {
    if (isTourStarted) {
      window.addEventListener('keydown', handleKeyNavigation);
      
      // Add aria-live region for screen readers if it doesn't exist
      if (!document.getElementById('tour-announcer')) {
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.id = 'tour-announcer';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('role', 'status');
        document.body.appendChild(liveRegion);
      }
      
      return () => {
        window.removeEventListener('keydown', handleKeyNavigation);
      };
    }
  }, [isTourStarted, handleKeyNavigation]);

  // Effect to track tour status in localStorage for page refreshes
  useEffect(() => {
    // Check if tour was previously started
    const savedTourState = localStorage.getItem('tourStarted');
    
    if (isTourStarted && !initialized) {
      // Mark as initialized to prevent double initialization
      setInitialized(true);
      
      // Save state to localStorage for persistence
      localStorage.setItem('tourStarted', 'true');
      
      // Announce tour start for screen readers
      const liveRegion = document.getElementById('tour-announcer');
      if (liveRegion) {
        liveRegion.textContent = 'Tour started. Use arrow keys to navigate between sections.';
      }
      
      // Log for debugging
      console.log('Tour initialized, setting localStorage');
    }
    
    // If tour was previously started (on page refresh), auto-apply styles
    if (savedTourState === 'true' && !isTourStarted && !initialized) {
      console.log('Restoring tour state from localStorage');
      showTourSections();
      setInitialized(true);
    }
    
    // Cleanup function to ensure proper reset on unmount
    return () => {
      if (isTourStarted) {
        document.body.classList.add('tour-started');
      }
    };
  }, [isTourStarted, initialized]);

  // Effect to apply classes immediately when isTourStarted changes
  useEffect(() => {
    if (isTourStarted) {
      showTourSections();
    }
  }, [isTourStarted]);

  // Helper function to apply all tour visibility styles
  const showTourSections = () => {
    // Apply tour-started to both the landing page and body
    const landingPage = document.querySelector('.landing-page') as HTMLElement;
    if (landingPage) {
      landingPage.classList.add('tour-started');
      landingPage.style.height = 'auto';
      landingPage.style.overflow = 'visible';
    }
    
    document.body.classList.add('tour-started');
    document.body.setAttribute('data-sections-shown', 'true');
    
    // Make sure the tour progress indicator is visible
    const tourProgress = document.querySelector('.tour-progress');
    if (tourProgress && tourProgress instanceof HTMLElement) {
      tourProgress.style.opacity = '1';
      tourProgress.style.pointerEvents = 'auto';
    }
    
    // Make all sections visible with inline styles as a fallback
    const allSections = document.querySelectorAll('.tour-section');
    allSections.forEach((section) => {
      const sectionElement = section as HTMLElement;
      sectionElement.style.display = 'flex';
      
      // Add proper ARIA attributes for accessibility
      sectionElement.setAttribute('aria-hidden', 'false');
      
      // Use a staggered delay for more natural appearance
      setTimeout(() => {
        sectionElement.style.opacity = '1';
        sectionElement.style.transform = 'translateY(0)';
      }, 50); // Shorter delay for better responsiveness
    });
    
    // Add skip link for accessibility
    if (!document.getElementById('skip-tour-link')) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-tour-link';
      skipLink.href = '#section-cta';
      skipLink.className = 'skip-tour-link';
      skipLink.textContent = 'Skip to end of tour';
      skipLink.addEventListener('click', (e) => {
        const target = document.getElementById('section-cta');
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
          
          // Update URL hash and active section
          window.history.replaceState(null, '', '#section-cta');
          
          // Set active classes
          const allSections = document.querySelectorAll('.tour-section');
          allSections.forEach(section => {
            section.classList.remove('active-section');
          });
          target.classList.add('active-section');
          
          // Focus the section for better keyboard navigation
          target.setAttribute('tabindex', '-1');
          target.focus();
          setTimeout(() => target.removeAttribute('tabindex'), 1000);
        }
      });
      document.body.prepend(skipLink);
    }
    
    // Mark as initialized to track state
    setInitialized(true);
  };

  // Effect for Intersection Observer to animate sections as they come into view
  useEffect(() => {
    if (!isTourStarted && !initialized) return;
    
    // Configure observer with higher threshold for better timing
    const observerOptions = { 
      root: null, 
      rootMargin: '-10% 0px -10% 0px', // Narrower margin for more precise detection
      threshold: [0.1, 0.5] // Multiple thresholds for better detection
    };
    
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a small delay for a staggered effect
          setTimeout(() => {
            entry.target.classList.add('is-visible');
            
            // Also ensure inline styles as a fallback
            const target = entry.target as HTMLElement;
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
            
            // Check if we should make this the active section based on visibility
            if (entry.intersectionRatio > 0.5) {
              const allSections = document.querySelectorAll('.tour-section');
              const sectionId = target.id;
              
              // Update active section on progress indicators
              if (sectionId) {
                const indicators = document.querySelectorAll('.tour-progress-indicator');
                indicators.forEach(indicator => {
                  if (indicator.getAttribute('aria-label')?.includes(sectionId)) {
                    indicator.classList.add('active');
                  } else {
                    indicator.classList.remove('active');
                  }
                });
              }
            }
          }, 100);
        } 
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // Observe all section refs
    sectionRefs.forEach(ref => { 
      if (ref.current) observer.observe(ref.current); 
    });
    
    return () => { 
      sectionRefs.forEach(ref => { 
        if (ref.current) observer.unobserve(ref.current); 
      }); 
    };
  }, [isTourStarted, sectionRefs, initialized]);

  // Auto-trigger as a last resort
  useEffect(() => {
    // Add this data attribute to track if sections have been shown
    if (!document.body.hasAttribute('data-sections-shown')) {
      document.body.setAttribute('data-sections-shown', 'false');
    }
    
    // Set a timeout to auto-trigger after specified timeout
    const timeoutId = setTimeout(() => {
      // Check if sections have been shown already
      if (document.body.getAttribute('data-sections-shown') === 'false' && 
          !document.getElementById('tour-content-container') &&
          !isTourStarted && 
          !initialized) {
        console.log('Auto-trigger activated after timeout');
        
        showTourSections();
        setInitialized(true);
        
        // Auto-scroll to first section if it exists
        if (sectionRefs[0]?.current) {
          // Get the section ID directly from the ref to ensure we're using the correct ID
          const sectionId = sectionRefs[0].current.id;
          console.log('Auto-scrolling to section:', sectionId);
          
          setTimeout(() => {
            // First try using the section ref directly
            if (sectionRefs[0].current) {
              sectionRefs[0].current.scrollIntoView({ behavior: 'smooth' });
            } 
            // Fallback to finding the element by ID (in case the ref doesn't work)
            else if (sectionId) {
              const section = document.getElementById(sectionId);
              if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }, 300);
        }
      }
    }, autoStartTimeout);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoStartTimeout, sectionRefs, isTourStarted, initialized]);

  // Add CSS for the skip link
  useEffect(() => {
    if (!document.getElementById('tour-skip-link-style')) {
      const style = document.createElement('style');
      style.id = 'tour-skip-link-style';
      style.textContent = `
        .skip-tour-link {
          position: absolute;
          top: -100px;
          left: 0;
          background: var(--accent-color);
          color: white;
          padding: 10px;
          z-index: 10000;
          transition: top 0.3s;
          text-decoration: none;
        }
        .skip-tour-link:focus {
          top: 0;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const styleElement = document.getElementById('tour-skip-link-style');
      if (styleElement) document.head.removeChild(styleElement);
      
      const skipLink = document.getElementById('skip-tour-link');
      if (skipLink) document.body.removeChild(skipLink);
    };
  }, []);

  return null; // This is a behavior-only component
};

export default TourManager; 