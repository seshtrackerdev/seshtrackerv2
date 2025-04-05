import { useEffect } from 'react';

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
  // Effect for Intersection Observer to animate sections as they come into view
  useEffect(() => {
    if (!isTourStarted) return;
    
    const observerOptions = { 
      root: null, 
      rootMargin: '0px', 
      threshold: 0.25
    };
    
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add a small delay for a staggered effect
          setTimeout(() => {
            entry.target.classList.add('is-visible');
          }, 150);
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
  }, [isTourStarted, sectionRefs]);

  // Auto-trigger as a last resort
  useEffect(() => {
    // Add this data attribute to track if sections have been shown
    document.body.setAttribute('data-sections-shown', 'false');
    
    // Set a timeout to auto-trigger after specified timeout
    const timeoutId = setTimeout(() => {
      // Check if sections have been shown already
      if (document.body.getAttribute('data-sections-shown') === 'false' && 
          !document.getElementById('tour-content-container')) {
        console.log('Auto-trigger activated after timeout');
        
        // Show tour sections
        document.body.classList.add('tour-started');
        document.body.setAttribute('data-sections-shown', 'true');
        
        // Make all tour sections visible
        const allSections = document.querySelectorAll('.tour-section');
        allSections.forEach((section) => {
          const sectionElement = section as HTMLElement;
          sectionElement.style.display = 'flex';
          sectionElement.style.opacity = '1';
          sectionElement.style.transform = 'translateY(0)';
        });
        
        // Scroll to first section if it exists
        if (sectionRefs[0]?.current) {
          sectionRefs[0].current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, autoStartTimeout);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [autoStartTimeout, sectionRefs]);

  return null; // This is a behavior-only component
};

export default TourManager; 