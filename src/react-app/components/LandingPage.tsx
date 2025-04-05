import { useState, useRef } from 'react';
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

const LandingPage = () => {
  const [isTourStarted, setIsTourStarted] = useState(false);

  // Refs for scrolling targets
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
    
    // Apply visual changes directly
    const landingPage = document.querySelector('.landing-page') as HTMLElement;
    if (landingPage) {
      landingPage.style.height = 'auto';
      landingPage.style.overflow = 'visible';
    }
    
    // Make all sections visible
    const allSections = document.querySelectorAll('.tour-section');
    allSections.forEach((section) => {
      const sectionElement = section as HTMLElement;
      sectionElement.style.display = 'flex';
      sectionElement.style.opacity = '1';
      sectionElement.style.transform = 'translateY(0)';
    });
    
    // Scroll to first section
    if (section1Ref.current) {
      section1Ref.current.scrollIntoView({ behavior: 'smooth' });
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
      
      {/* Feature sections */}
      <FeatureSection
        id="section-1"
        title="What's SeshTracker?"
        description="Your personal cannabis companion. Effortlessly log sessions, track strains, monitor effects, and understand your patterns over time."
        imageSrc="/images/apptourimage.png"
        imageAlt="SeshTracker app on mobile and desktop"
        ctaText="Tell me more"
        ctaOnClick={() => section2Ref.current?.scrollIntoView({ behavior: 'smooth' })}
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
        ctaOnClick={() => section3Ref.current?.scrollIntoView({ behavior: 'smooth' })}
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
        ctaOnClick={() => finalCTARef.current?.scrollIntoView({ behavior: 'smooth' })}
        gradientColors={{ from: "#e67e22", to: "#f39c12" }}
        forwardedRef={section3Ref}
        className="orange-theme"
      />
      
      {/* Final CTA */}
      <CallToAction
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