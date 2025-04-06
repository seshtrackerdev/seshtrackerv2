import React, { useEffect, useCallback, useRef, useState } from 'react';
import HeroSection from './HeroSection';
import FeatureSection from './FeatureSection';
import TourManager from './TourManager';
import '../styles/LandingPage.css';

// Mock components until actual components are created
const PricingSection = ({ forwardedRef, id, ctaOnClick }: any) => (
  <section id={id} ref={forwardedRef} className="tour-section">
    <h2>Pricing Plans</h2>
    <p>Affordable options for every need</p>
    <button onClick={ctaOnClick}>Continue Tour</button>
  </section>
);

const TestimonialSection = ({ forwardedRef, id, testimonials, ctaOnClick }: any) => (
  <section id={id} ref={forwardedRef} className="tour-section">
    <h2>What Users Say</h2>
    <div className="testimonials">
      {testimonials.map((t: any, i: number) => (
        <div key={i} className="testimonial">
          <p>"{t.quote}"</p>
          <h3>{t.name}</h3>
        </div>
      ))}
    </div>
    <button onClick={ctaOnClick}>Final Step</button>
  </section>
);

const CallToAction = ({ forwardedRef, id }: any) => (
  <section id={id} ref={forwardedRef} className="tour-section">
    <h2>Ready to Start?</h2>
    <p>Join thousands of users optimizing their experience</p>
    <button>Get Started</button>
  </section>
);

// Define section data
const sectionIds = [
  'section-hero',
  'section-features',
  'section-pricing',
  'section-testimonials',
  'section-cta'
];

// Define feature data
const featureData = [
  {
    title: 'Strain Tracking',
    description: 'Log and track your favorite strains with detailed notes on effects, potency, and more.',
    icon: '🌿'
  },
  {
    title: 'Session Insights',
    description: 'Track your consumption sessions and get insights into patterns and preferences.',
    icon: '📊'
  },
  {
    title: 'Mood Monitoring',
    description: 'Connect your usage with mood effects to find what works best for you.',
    icon: '😌'
  }
];

// Define testimonial data
const testimonialData = [
  {
    name: 'Alex M.',
    quote: 'SeshTracker has helped me find the perfect strains for my anxiety. Game changer!',
    avatar: '/images/avatar1.jpg'
  },
  {
    name: 'Jamie L.',
    quote: 'I love being able to track which products work best for my sleep issues.',
    avatar: '/images/avatar2.jpg'
  },
  {
    name: 'Sam K.',
    quote: 'The insights feature helped me cut back on my usage while still getting the benefits.',
    avatar: '/images/avatar3.jpg'
  }
];

// Define dynamic headlines for the hero section
const dynamicHeadlines = [
  "Track your Strains...",
  "Monitor your Mood...",
  "Understand your Usage...",
  "Optimize your Experience...",
  "Manage your Inventory..."
];

export const LandingPage: React.FC = () => {
  // State for tour management
  const [isTourStarted, setIsTourStarted] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionIds[0]);
  
  // Create refs for each section
  const landingPageRef = useRef<HTMLDivElement>(null);
  const sectionRefs = sectionIds.map(() => useRef<HTMLElement>(null));
  
  // Create a ref to track if we're currently scrolling programmatically
  const isScrolling = useRef(false);

  // Improved scroll tracking for active section
  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!isTourStarted) return;
      
      // Get all visible tour sections
      const sections = Array.from(document.querySelectorAll('.tour-section'))
        .filter(section => window.getComputedStyle(section).display !== 'none');
        
      if (sections.length === 0) return;
      
      // Get the viewport height and calculate the center point (with 40% offset)
      const viewportHeight = window.innerHeight;
      const viewportCenter = window.scrollY + (viewportHeight * 0.4); // Bias toward top section
      
      // Find the section closest to the viewport center
      let closestSection = sections[0];
      let closestDistance = Math.abs(
        (closestSection as HTMLElement).getBoundingClientRect().top + 
        window.scrollY - viewportCenter
      );
      
      sections.forEach(section => {
        const sectionElement = section as HTMLElement;
        const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
        const distance = Math.abs(sectionTop - viewportCenter);
        
        if (distance < closestDistance) {
          closestSection = section;
          closestDistance = distance;
        }
      });
      
      // Only update if we have a valid section
      if (closestSection) {
        // Update visual state
        sections.forEach(section => section.classList.remove('active-section'));
        closestSection.classList.add('active-section');
        
        // Update active section state if different
        const sectionId = closestSection.id;
        if (sectionId !== activeSection) {
          setActiveSection(sectionId);
        }
        
        // Update progress indicators
        const indicators = document.querySelectorAll('.tour-progress-indicator');
        
        indicators.forEach(indicator => {
          if (indicator.getAttribute('data-section') === sectionId) {
            indicator.classList.add('active');
            indicator.setAttribute('aria-current', 'true');
          } else {
            indicator.classList.remove('active');
            indicator.setAttribute('aria-current', 'false');
          }
        });
        
        // Update URL hash without triggering a scroll
        if (sectionId && !isScrolling.current) {
          window.history.replaceState(null, '', `#${sectionId}`);
        }
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // Run once on mount to set initial active section
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isTourStarted, activeSection]);

  // Improved scroll to section function
  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    // Set this as active section first
    const allSections = document.querySelectorAll('.tour-section');
    allSections.forEach(s => s.classList.remove('active-section'));
    section.classList.add('active-section');
    
    // Update active section state
    setActiveSection(sectionId);
    
    // Set flag to prevent scroll handler from updating URL
    isScrolling.current = true;
    
    // Calculate offset for fixed headers
    const headerOffset = 80; // Adjust based on your header height
    const elementPosition = section.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    
    // Scroll with smooth behavior
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Update URL hash
    window.history.replaceState(null, '', `#${sectionId}`);
    
    // Announce section change for screen readers
    const liveRegion = document.getElementById('tour-announcer');
    if (liveRegion) {
      const sectionTitle = section.querySelector('h2')?.textContent || sectionId;
      liveRegion.textContent = `Navigated to ${sectionTitle} section`;
    }
    
    // Reset scroll flag after animation completes
    setTimeout(() => {
      isScrolling.current = false;
    }, 1000);
  }, []);

  // Handler for next section navigation from buttons
  const handleNextSection = useCallback((targetSectionId: string) => {
    // Start tour if not already started
    if (!isTourStarted) {
      startTour();
      // Add small delay to ensure DOM is updated
      setTimeout(() => {
        scrollToSection(targetSectionId);
      }, 100);
    } else {
      scrollToSection(targetSectionId);
    }
  }, [isTourStarted, scrollToSection]);

  // Check localStorage on component mount
  useEffect(() => {
    // Check if tour was previously started
    const tourStarted = localStorage.getItem('tourStarted') === 'true';
    if (tourStarted) {
      // Auto-start the tour
      startTour();
      
      // Check for hash in URL for direct section navigation
      const hash = window.location.hash;
      if (hash && hash.startsWith('#section-')) {
        const sectionId = hash.slice(1); // Remove the # character
        // Small delay to ensure DOM is updated
        setTimeout(() => {
          scrollToSection(sectionId);
        }, 100);
      }
    }
  }, [scrollToSection]);

  // Updated startTour function
  const startTour = useCallback(() => {
    setIsTourStarted(true);
    localStorage.setItem('tourStarted', 'true');
    
    // Update landing page styling
    const landingPage = document.querySelector('.landing-page') as HTMLElement;
    if (landingPage) {
      landingPage.classList.add('tour-started');
      landingPage.style.height = 'auto';
      landingPage.style.overflow = 'visible';
    }
    
    // Add body class
    document.body.classList.add('tour-started');
    
    // Make all sections visible with staggered animation
    const allSections = document.querySelectorAll('.tour-section');
    allSections.forEach((section, index) => {
      const sectionElement = section as HTMLElement;
      sectionElement.style.display = 'flex';
      sectionElement.style.opacity = '0';
      sectionElement.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        sectionElement.style.opacity = '1';
        sectionElement.style.transform = 'translateY(0)';
      }, 50 * index);
    });
    
    // Set first section as active
    if (allSections.length > 0) {
      allSections.forEach(s => s.classList.remove('active-section'));
      allSections[0].classList.add('active-section');
      setActiveSection(sectionIds[0]);
      
      // Update progress indicators
      const indicators = document.querySelectorAll('.tour-progress-indicator');
      indicators.forEach((indicator, index) => {
        if (index === 0) {
          indicator.classList.add('active');
          indicator.setAttribute('aria-current', 'true');
        } else {
          indicator.classList.remove('active');
          indicator.setAttribute('aria-current', 'false');
        }
      });
    }
  }, []);

  // Helper function for debouncing
  function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return (
    <div className="landing-page" ref={landingPageRef}>
      {/* Tour progress indicators - Improved for better visibility and positioning */}
      <div className="tour-progress" aria-label="Tour progress" role="navigation">
        {sectionIds.map((sectionId, index) => {
          const sectionName = sectionId.replace('section-', '');
          const isActive = sectionId === activeSection;
          return (
            <button
              key={sectionId}
              className={`tour-progress-indicator ${isActive ? 'active' : ''}`}
              data-section={sectionId}
              aria-label={`Go to ${sectionName} section`}
              aria-current={isActive ? 'true' : 'false'}
              onClick={() => {
                // Track click for analytics
                console.log(`Progress indicator clicked: ${sectionId}`);
                
                // Ensure tour is started
                if (!isTourStarted) {
                  startTour();
                  // Add small delay to ensure DOM is updated
                  setTimeout(() => {
                    scrollToSection(sectionId);
                  }, 150);
                } else {
                  scrollToSection(sectionId);
                }
              }}
            >
              <span className="tour-progress-label">{sectionName}</span>
            </button>
          );
        })}
      </div>
      
      <HeroSection 
        dynamicHeadlines={dynamicHeadlines}
        onDiscoverClick={() => handleNextSection(sectionIds[1])}
        forwardedRef={sectionRefs[0] as React.RefObject<HTMLDivElement>}
      />
      
      <FeatureSection 
        id={sectionIds[1]}
        title="Key Features"
        description="Everything you need to track and optimize your experience"
        features={featureData}
        ctaText="Learn More"
        ctaOnClick={() => handleNextSection(sectionIds[2])}
        forwardedRef={sectionRefs[1]}
      />
      
      <PricingSection 
        id={sectionIds[2]}
        forwardedRef={sectionRefs[2]}
        ctaOnClick={() => handleNextSection(sectionIds[3])}
      />
      
      <TestimonialSection 
        id={sectionIds[3]}
        testimonials={testimonialData}
        forwardedRef={sectionRefs[3]}
        ctaOnClick={() => handleNextSection(sectionIds[4])}
      />
      
      <CallToAction 
        id={sectionIds[4]}
        forwardedRef={sectionRefs[4]}
      />
      
      <TourManager
        isTourStarted={isTourStarted}
        sectionRefs={sectionRefs}
      />
    </div>
  );
};

export default LandingPage; 