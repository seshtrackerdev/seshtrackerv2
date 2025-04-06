import { useState, useRef, useEffect } from 'react';
import './LandingPage.css';
import { 
  HeroSection, 
  FeatureSection, 
  CallToAction, 
  TourManager 
} from './landing';

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    handleDiscoverClick: () => void;
    showAllSections: () => void;
    showBasicTour: () => void;
    isTourInitializing: boolean;
  }
}

const dynamicHeadlines = [
  "Track your Strains...",
  "Monitor your Mood...",
  "Understand your Usage...",
  "Optimize your Experience...",
  "Manage your Inventory..."
];

// Tour section data for progress indicators
const tourSections = [
  { id: "section-1", label: "What's SeshTracker?" },
  { id: "section-2", label: "Why Use It?" },
  { id: "section-3", label: "Features" },
  { id: "section-cta", label: "Get Started" }
];

const LandingPage = () => {
  const [isTourStarted, setIsTourStarted] = useState(false);
  const [activeSection, setActiveSection] = useState('section-1');

  // Check localStorage on component mount to restore tour state
  useEffect(() => {
    // Check if URL has a tour section hash like #section-1
    const hashTarget = window.location.hash;
    const isTourInProgress = localStorage.getItem('tourStarted') === 'true';
    const shouldShowTour = hashTarget.includes('section-') || isTourInProgress;
    
    if (shouldShowTour && !isTourStarted) {
      console.log('Auto-starting tour from URL hash or localStorage');
      // Use timeout to ensure DOM is ready
      setTimeout(() => {
        startTour();
        
        // If we have a hash target, scroll to it and set as active
        if (hashTarget) {
          const sectionId = hashTarget.replace('#', '');
          setActiveSection(sectionId);
          
          const targetElement = document.querySelector(hashTarget);
          if (targetElement) {
            setTimeout(() => {
              targetElement.scrollIntoView({ behavior: 'smooth' });
            }, 200);
          }
        }
      }, 100);
    }
  }, []);

  // Track scroll position to update active section more precisely
  useEffect(() => {
    if (!isTourStarted) return;

    const handleScroll = () => {
      // Get the current scroll position including a small offset to improve detection
      const scrollPosition = window.scrollY + window.innerHeight * 0.4;
      let closestSection = null;
      let closestDistance = Infinity;
      
      // Find which section is currently in view using the closest one to the viewport center
      for (const section of tourSections) {
        const element = document.getElementById(section.id);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        const sectionTop = rect.top + window.pageYOffset;
        const sectionMiddle = sectionTop + rect.height / 2;
        const distance = Math.abs(scrollPosition - sectionMiddle);
        
        // Keep track of the closest section to the center of the viewport
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section;
        }
      }
      
      if (closestSection && activeSection !== closestSection.id) {
        setActiveSection(closestSection.id);
        
        // Update visual active state on all sections
        const allSections = document.querySelectorAll('.tour-section');
        allSections.forEach(sectionEl => {
          sectionEl.classList.remove('active-section');
        });
        
        const activeElement = document.getElementById(closestSection.id);
        if (activeElement) {
          activeElement.classList.add('active-section');
        }
      }
    };
    
    // Use a debounced scroll handler for better performance
    let timeoutId: number | null = null;
    const debouncedHandleScroll = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(handleScroll, 50);
    };
    
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isTourStarted, activeSection, tourSections]);

  // Refs for scrolling targets - explicitly typed as HTMLElement
  const heroRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const finalCTARef = useRef<HTMLElement>(null);

  const allSectionRefs = [section1Ref, section2Ref, section3Ref, finalCTARef];

  // Function to start the tour and scroll
  const startTour = () => {
    console.log('Button clicked - startTour function called');
    
    // Update React state
    setIsTourStarted(true);
    
    // Apply visual changes directly to both the landing page and document body
    const landingPage = document.querySelector('.landing-page') as HTMLElement;
    if (landingPage) {
      landingPage.classList.add('tour-started');
      landingPage.style.height = 'auto';
      landingPage.style.overflow = 'visible';
    }
    
    // Add tour-started class to body as well for broader CSS selector support
    document.body.classList.add('tour-started');
    document.body.setAttribute('data-sections-shown', 'true');
    
    // Save to localStorage for page refresh persistence
    localStorage.setItem('tourStarted', 'true');
    
    // Make all sections visible with a staggered effect
    const allSections = document.querySelectorAll('.tour-section');
    allSections.forEach((section, index) => {
      const sectionElement = section as HTMLElement;
      // Immediate display change
      sectionElement.style.display = 'flex';
      
      // Staggered animation - shorter delay for better responsiveness
      setTimeout(() => {
        sectionElement.style.opacity = '1';
        sectionElement.style.transform = 'translateY(0)';
        sectionElement.classList.add('is-visible');
      }, index * 50); // Faster stagger by index
    });
    
    // Set first section as active
    setActiveSection('section-1');
    
    // Scroll to first section with a slight delay for smoother transition
    // Use our improved scrollToSection function instead of direct scrollIntoView
    setTimeout(() => {
      if (section1Ref.current) {
        scrollToSection(section1Ref, 'section-1');
      }
    }, 100);
  };

  // Function to handle CTA button clicks within sections to improve navigation accuracy
  const handleNextSection = (ref: React.RefObject<HTMLElement | null>, sectionId: string) => {
    // First make sure the tour is started if it wasn't already
    if (!isTourStarted) {
      startTour();
    }
    
    // Short delay to ensure the DOM has updated after any state changes
    setTimeout(() => {
      scrollToSection(ref, sectionId);
    }, 50);
  };

  // Handle sections scroll navigation with smooth transitions
  const scrollToSection = (ref: React.RefObject<HTMLElement | null>, sectionId: string) => {
    if (ref.current) {
      // First update the active section state
      setActiveSection(sectionId);
      
      // Highlight the section being scrolled to
      const allSections = document.querySelectorAll('.tour-section');
      allSections.forEach(section => {
        section.classList.remove('active-section');
      });
      
      ref.current.classList.add('active-section');
      
      // Calculate offset to account for any fixed headers
      const headerOffset = 80; // Adjust based on your header height
      const elementPosition = ref.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      // Use window.scrollTo for more precise control
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      // Update URL hash for direct linking without triggering page reload
      window.history.replaceState(null, '', `#${sectionId}`);
      
      // Announce for screen readers
      const liveRegion = document.getElementById('tour-announcer');
      if (liveRegion) {
        const sectionTitle = ref.current.querySelector('h2')?.textContent || sectionId;
        liveRegion.textContent = `Navigated to ${sectionTitle} section`;
      }
    }
  };

  // Initialize global functions
  window.handleDiscoverClick = startTour;
  window.showAllSections = startTour;
  window.showBasicTour = startTour;

  return (
    <div className={`landing-page ${isTourStarted ? 'tour-started' : ''}`}>
      {/* Hero section */}
      <HeroSection 
        dynamicHeadlines={dynamicHeadlines} 
        onDiscoverClick={startTour} 
        forwardedRef={heroRef} 
      />
      
      {/* Tour progress navigation - improved positioning and visibility */}
      {isTourStarted && (
        <div className="tour-progress visible" role="navigation" aria-label="Tour progress">
          {tourSections.map((section, index) => {
            const isActive = activeSection === section.id;
            let ref;
            
            switch (index) {
              case 0: ref = section1Ref; break;
              case 1: ref = section2Ref; break;
              case 2: ref = section3Ref; break;
              case 3: ref = finalCTARef; break;
              default: ref = null;
            }
            
            return (
              <div 
                key={section.id}
                className={`tour-progress-indicator ${isActive ? 'active' : ''}`}
                data-section={section.id}
                onClick={() => {
                  if (ref) {
                    // Track click for analytics
                    console.log(`Progress indicator clicked: ${section.id}`);
                    
                    // Use setTimeout to ensure the DOM has time to update
                    setTimeout(() => scrollToSection(ref, section.id), 10);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (ref) {
                      console.log(`Progress indicator activated via keyboard: ${section.id}`);
                      setTimeout(() => scrollToSection(ref, section.id), 10);
                    }
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Go to ${section.label} section`}
                aria-current={isActive ? 'true' : 'false'}
              >
                <span className="tour-progress-label">{section.label}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Feature sections */}
      <FeatureSection
        id="section-1"
        title="What's SeshTracker?"
        description="Your personal cannabis companion. Effortlessly log sessions, track strains, monitor effects, and understand your patterns over time."
        imageSrc="/images/apptourimage.png"
        imageAlt="SeshTracker app on mobile and desktop"
        ctaText="Tell me more"
        ctaOnClick={() => handleNextSection(section2Ref, 'section-2')}
        forwardedRef={section1Ref}
      />
      
      <FeatureSection
        id="section-2"
        title="Why Use It? (For Stoners, By Stoners)"
        features={[
          {
            icon: "🧠",
            title: "Know Your High",
            description: "Finally figure out which strains actually help you focus, relax, or get creative."
          },
          {
            icon: "💰",
            title: "Smart Stash",
            description: "Stop guessing. Track your inventory, know what you have, and maybe save some cash."
          },
          {
            icon: "📈",
            title: "See Your Journey",
            description: "Visualize your usage. Are you smoking more? Less? What triggers a session?"
          }
        ]}
        ctaText="Show me the features"
        ctaOnClick={() => handleNextSection(section3Ref, 'section-3')}
        gradientColors={{ from: "#7b2cbf", to: "#ae52f4" }}
        forwardedRef={section2Ref}
        className="purple-theme"
      />
      
      <FeatureSection
        id="section-3"
        title="Powerful Features, Simple Interface"
        description="SeshTracker gives you everything you need to track, analyze, and optimize your cannabis experience."
        features={[
          {
            icon: "🌿",
            title: "Strain Library",
            description: "Build your personal strain database with effects, notes, and ratings."
          },
          {
            icon: "📱",
            title: "Mobile-Friendly",
            description: "Log sessions on-the-go with our responsive web app - no download required."
          },
          {
            icon: "🔒",
            title: "Private & Secure",
            description: "Your data belongs to you. We use strong encryption and don't sell your information."
          }
        ]}
        ctaText="Let's get started"
        ctaOnClick={() => handleNextSection(finalCTARef, 'section-cta')}
        gradientColors={{ from: "#e67e22", to: "#f39c12" }}
        forwardedRef={section3Ref}
        className="orange-theme"
      />
      
      {/* Final CTA */}
      <CallToAction
        id="section-cta"
        title="Ready to elevate your cannabis experience?"
        description="Create your free account today and start your journey toward more mindful consumption."
        primaryButtonText="Create Account"
        primaryButtonLink="/register"
        secondaryButtonText="Try the Classic Version"
        secondaryButtonLink="/classic"
        forwardedRef={finalCTARef}
      />
      
      {/* Tour manager handles tour animations and auto-starting */}
      <TourManager 
        isTourStarted={isTourStarted}
        sectionRefs={allSectionRefs}
        autoStartTimeout={5000}
      />
    </div>
  );
};

export default LandingPage;