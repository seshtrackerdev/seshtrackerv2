import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

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
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTourStarted, setIsTourStarted] = useState(false);

  // Refs for scrolling targets
  const heroRef = useRef<HTMLDivElement>(null);
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const finalCTARef = useRef<HTMLElement>(null);

  // Effect for dynamic headlines
  useEffect(() => {
    const intervalId = setInterval(() => {
      setHeadlineIndex((prevIndex) => (prevIndex + 1) % dynamicHeadlines.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  // Effect for Intersection Observer to animate sections as they come into view
  useEffect(() => {
    if (!isTourStarted) return;
    
    const observerOptions = { 
      root: null, 
      rootMargin: '0px', 
      threshold: 0.25  // Increase threshold to make sure more of section is visible
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
    const sections = [section1Ref, section2Ref, section3Ref, finalCTARef];
    
    sections.forEach(ref => { 
      if (ref.current) observer.observe(ref.current); 
    });
    
    return () => { 
      sections.forEach(ref => { 
        if (ref.current) observer.unobserve(ref.current); 
      }); 
    };
  }, [isTourStarted]);

  // Use useLayoutEffect for immediate DOM interaction before render
  useEffect(() => {
    console.log('Setting up direct button listener');
    
    // Try to find button by ID first (most reliable)
    let button = document.getElementById('discoverButton');
    
    // Set up the handler
    const handleButtonClick = (e: MouseEvent) => {
      console.log('Button clicked via direct DOM event');
      e.preventDefault();
      e.stopPropagation();
      startTour();
      
      // Visual feedback that click was registered
      if (e.target instanceof Element) {
        const target = e.target.closest('button');
        if (target) {
          target.style.backgroundColor = '#ff6b6b';
          target.textContent = 'Starting Tour...';
          
          setTimeout(() => {
            target.style.backgroundColor = '';
            target.innerHTML = 'Discover SeshTracker <span class="icon">👇</span>';
          }, 1000);
        }
      }
    };
    
    // Try to set up handler as soon as button is available
    if (button) {
      button.addEventListener('click', handleButtonClick);
      console.log('Added click listener to button by ID');
    } else {
      // Fallback - try to find by class
      console.log('Button not found by ID, trying by class');
      
      // Set up a short interval to keep trying to find the button
      const buttonCheckInterval = setInterval(() => {
        button = document.querySelector('.discover-button');
        if (button) {
          clearInterval(buttonCheckInterval);
          button.addEventListener('click', handleButtonClick);
          console.log('Added click listener to button by class');
        }
      }, 100);
      
      // Clean up interval after 5 seconds if button not found
      setTimeout(() => clearInterval(buttonCheckInterval), 5000);
    }
    
    return () => {
      if (button) {
        button.removeEventListener('click', handleButtonClick);
      }
    };
  }, []);

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    if (ref.current) {
      // Using scrollIntoView with smooth behavior for a nicer transition
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
      
      // Add the is-visible class after a small delay to trigger animation
      setTimeout(() => {
        ref.current?.classList.add('is-visible');
      }, 100);
    }
  };

  // Function to start the tour and scroll
  const startTour = () => {
    console.log('Button clicked - startTour function called');
    
    // Apply visual changes directly
    try {
      // First update React state
      setIsTourStarted(true);
      
      // Force visual changes with direct style changes
      const allSections = document.querySelectorAll('.tour-section');
      console.log(`Found ${allSections.length} tour sections to display`);
      
      // Make all sections visible immediately with direct style
      allSections.forEach((section, index) => {
        const sectionElement = section as HTMLElement;
        sectionElement.style.display = 'flex';
        sectionElement.style.opacity = '1';
        sectionElement.style.transform = 'translateY(0)';
      });
      
      // Unlock scrolling on the page
      const landingPage = document.querySelector('.landing-page') as HTMLElement;
      if (landingPage) {
        landingPage.style.height = 'auto';
        landingPage.style.overflow = 'visible';
      }
      
      // Scroll to first section
      if (section1Ref.current) {
        section1Ref.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        // Direct element selection fallback
        const firstSection = document.getElementById('section-1');
        if (firstSection) {
          firstSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Last resort fallback - just scroll down
          window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Error in startTour:', error);
      // Emergency fallback - use location.hash
      window.location.hash = 'section-1';
    }
  };

  // Global function to avoid React event binding
  const handleDiscoverClick = () => {
    console.log('Global onclick function called');
    // Fallback approach - jump to first section
    const firstSection = document.querySelector('.tour-section');
    if (firstSection) {
      (firstSection as HTMLElement).style.display = 'flex';
      firstSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Just scroll down the page
      window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  // Define functions in the window scope
  useEffect(() => {
    window.handleDiscoverClick = handleDiscoverClick;
    window.showBasicTour = showBasicTour;
    
    return () => {
      // TypeScript-safe way to delete properties
      window.handleDiscoverClick = undefined as any;
      window.showBasicTour = undefined as any;
    };
  }, []);

  // Add a direct script to the document as a last resort solution
  useEffect(() => {
    // Create a script element
    const script = document.createElement('script');
    
    // Define the script content as a self-executing function
    script.textContent = `
      (function() {
        // Function to show all sections and enable scrolling
        function showAllSections() {
          console.log("Direct script executed");
          
          // Get all the sections
          var sections = document.querySelectorAll('.tour-section');
          console.log("Found " + sections.length + " sections");
          
          // Show all sections with direct style
          for (var i = 0; i < sections.length; i++) {
            sections[i].style.display = 'flex';
            sections[i].style.opacity = '1';
            sections[i].style.transform = 'translateY(0)';
            sections[i].style.visibility = 'visible';
          }
          
          // Enable scrolling on the page
          document.body.style.overflow = 'auto';
          document.body.style.height = 'auto';
          
          var landingPage = document.querySelector('.landing-page');
          if (landingPage) {
            landingPage.style.overflow = 'visible';
            landingPage.style.height = 'auto';
            landingPage.style.minHeight = 'auto';
          }
          
          // Scroll to first section
          var firstSection = document.getElementById('section-1');
          if (firstSection) {
            firstSection.scrollIntoView({behavior: 'smooth'});
          }
        }
        
        // Attach click handler to all buttons
        var allButtons = document.querySelectorAll('button');
        for (var i = 0; i < allButtons.length; i++) {
          var button = allButtons[i];
          
          // Match discover button by text content or ID
          if (button.id === 'discoverButton' || 
              button.textContent.includes('Discover SeshTracker') ||
              button.classList.contains('discover-button')) {
            
            button.addEventListener('click', function(e) {
              console.log("Direct click handler executed");
              showAllSections();
              e.preventDefault();
            });
            
            // Add a fixed attribute as a marker
            button.setAttribute('data-handler-attached', 'true');
            console.log("Found and attached handler to discover button");
          }
        }
        
        // Also create a global function for direct access
        window.showAllSections = showAllSections;
        console.log("Global showAllSections function created");
      })();
    `;
    
    // Append the script to the document
    document.body.appendChild(script);
    
    // Clean up
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Auto-trigger as a last resort - will fire after 5 seconds if nothing else worked
  useEffect(() => {
    // Add this data attribute to track if sections have been shown
    document.body.setAttribute('data-sections-shown', 'false');
    
    // Set a timeout to auto-trigger after 5 seconds
    const timeoutId = setTimeout(() => {
      // Check if sections have been shown already
      if (document.body.getAttribute('data-sections-shown') === 'false' && 
          !document.getElementById('tour-content-container')) {
        console.log('Auto-trigger activated after timeout');
        
        // Use our showBasicTour function instead of direct CSS manipulation
        showBasicTour();
        
        // Mark sections as shown
        document.body.setAttribute('data-sections-shown', 'true');
      }
    }, 5000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Simple function to show basic tour content directly
  const showBasicTour = () => {
    console.log('showBasicTour called - creating content');
    
    // Check if tour is already initialized to prevent duplicates
    if (document.body.classList.contains('tour-loaded')) {
      console.log('Tour already loaded - scrolling to existing content');
      const existingContainer = document.getElementById('tour-content-container');
      if (existingContainer) {
        existingContainer.scrollIntoView({ behavior: 'smooth' });
        return existingContainer;
      }
    }
    
    // Check if container already exists - remove it if so
    const existingContainer = document.getElementById('tour-content-container');
    if (existingContainer) {
      document.body.removeChild(existingContainer);
    }
    
    // Create basic tour content directly in the DOM
    const contentContainer = document.createElement('div');
    contentContainer.id = 'tour-content-container';
    contentContainer.className = 'tour-section'; // Add tour-section class
    contentContainer.style.cssText = `
      position: relative;
      width: 100%;
      display: flex !important; /* Change to flex and add !important */
      flex-direction: column;
      background-color: var(--bg-primary, white);
      color: var(--text-primary, black);
      z-index: 1000;
      padding-bottom: 50px;
      border-top: 5px solid var(--cannabis-green, #43a047);
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      opacity: 1 !important; /* Ensure visibility */
      transform: translateY(0) !important;
      visibility: visible !important;
      margin-top: 100vh; /* Push content down below the hero section */
      box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.1);
    `;
    
    // Force the tour to start
    document.body.classList.add('tour-started');
    document.body.classList.add('tour-loaded');
    setIsTourStarted(true);
    
    // Add the container to body
    document.body.appendChild(contentContainer);
    
    // Section 1
    const section1 = document.createElement('div');
    section1.id = 'dynamic-section-1';
    section1.className = 'tour-section'; // Add tour-section class
    section1.style.cssText = `
      min-height: 100vh;
      width: 100%;
      padding: 80px 20px;
      background-color: var(--bg-primary, #f8f9fa);
      margin-bottom: 0;
      text-align: center;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
      display: flex !important; /* Ensure display */
      opacity: 1 !important;
      transform: translateY(0) !important;
      visibility: visible !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    section1.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 30px; color: var(--text-primary, #121212); 
                    background: linear-gradient(135deg, var(--cannabis-green-light, #76d275), var(--cannabis-green, #43a047));
                    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
          What's SeshTracker?
        </h2>
        <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 40px auto; color: var(--text-secondary, #6c757d); line-height: 1.6;">
          Your personal cannabis companion. Effortlessly log sessions, 
          track strains, monitor effects, and understand your patterns over time.
        </p>
        <div style="margin: 50px auto; max-width: 800px;">
          <img src="/images/apptourimage.png" alt="SeshTracker app on mobile and desktop" style="width: 100%; height: auto; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid rgba(67, 160, 71, 0.2);">
        </div>
        <button style="background: linear-gradient(90deg, var(--cannabis-green, #43a047), var(--cannabis-green-light, #76d275));
                      color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 1rem;
                      cursor: pointer; box-shadow: 0 4px 15px rgba(67, 160, 71, 0.3); transition: all 0.3s ease;"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(67, 160, 71, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(67, 160, 71, 0.3)';"
                onclick="document.getElementById('dynamic-section-2').scrollIntoView({behavior: 'smooth'});">
          Tell me more
        </button>
      </div>
    `;
    contentContainer.appendChild(section1);
    
    // Section 2
    const section2 = document.createElement('div');
    section2.id = 'dynamic-section-2';
    section2.className = 'tour-section';
    section2.style.cssText = `
      min-height: 100vh;
      width: 100%;
      padding: 80px 20px;
      background-color: var(--bg-secondary, rgba(67, 160, 71, 0.05));
      margin-bottom: 0;
      text-align: center;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
      display: flex !important;
      opacity: 1 !important;
      transform: translateY(0) !important;
      visibility: visible !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    section2.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 30px; color: var(--text-primary, #121212);
                   background: linear-gradient(135deg, var(--cannabis-purple-light, #ae52f4), var(--cannabis-purple, #7b2cbf));
                   -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
          Why Use It? (For Stoners, By Stoners)
        </h2>
        <div style="max-width: 650px; margin: 40px auto; text-align: left;">
          <div style="padding: 20px; background-color: var(--card-bg, white); border-radius: 12px; margin-bottom: 20px; color: var(--text-primary, #333);
                      box-shadow: var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08)); border: 1px solid var(--border-color, rgba(0,0,0,0.05));
                      transition: all 0.3s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08))';">
            <div style="display: flex; gap: 15px; align-items: flex-start;">
              <span style="font-size: 28px; line-height: 1;">🧠</span>
              <div>
                <strong style="font-size: 1.1rem; color: var(--cannabis-green, #43a047); display: block; margin-bottom: 8px;">Know Your High:</strong>
                <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Finally figure out which strains actually help you focus, relax, or get creative.</span>
              </div>
            </div>
          </div>
          <div style="padding: 20px; background-color: var(--card-bg, white); border-radius: 12px; margin-bottom: 20px; color: var(--text-primary, #333);
                      box-shadow: var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08)); border: 1px solid var(--border-color, rgba(0,0,0,0.05));
                      transition: all 0.3s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08))';">
            <div style="display: flex; gap: 15px; align-items: flex-start;">
              <span style="font-size: 28px; line-height: 1;">💰</span>
              <div>
                <strong style="font-size: 1.1rem; color: var(--cannabis-green, #43a047); display: block; margin-bottom: 8px;">Smart Stash:</strong>
                <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Stop guessing. Track your inventory, know what you have, and maybe save some cash.</span>
              </div>
            </div>
          </div>
          <div style="padding: 20px; background-color: var(--card-bg, white); border-radius: 12px; margin-bottom: 20px; color: var(--text-primary, #333);
                      box-shadow: var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08)); border: 1px solid var(--border-color, rgba(0,0,0,0.05));
                      transition: all 0.3s ease; cursor: default;"
               onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.1)';"
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='var(--shadow-sm, 0 2px 5px rgba(0,0,0,0.08))';">
            <div style="display: flex; gap: 15px; align-items: flex-start;">
              <span style="font-size: 28px; line-height: 1;">📈</span>
              <div>
                <strong style="font-size: 1.1rem; color: var(--cannabis-green, #43a047); display: block; margin-bottom: 8px;">See Your Journey:</strong>
                <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Visualize your usage. Are you smoking more? Less? What triggers a session?</span>
              </div>
            </div>
          </div>
        </div>
        <button style="background: linear-gradient(90deg, var(--cannabis-purple, #7b2cbf), var(--cannabis-purple-light, #ae52f4));
                      color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 1rem;
                      cursor: pointer; box-shadow: 0 4px 15px rgba(123, 44, 191, 0.3); transition: all 0.3s ease;"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(123, 44, 191, 0.4)';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(123, 44, 191, 0.3)';"
                onclick="document.getElementById('dynamic-section-3').scrollIntoView({behavior: 'smooth'});">
          How does it work?
        </button>
      </div>
    `;
    contentContainer.appendChild(section2);
    
    // Section 3
    const section3 = document.createElement('div');
    section3.id = 'dynamic-section-3';
    section3.className = 'tour-section';
    section3.style.cssText = `
      min-height: 100vh;
      width: 100%;
      padding: 80px 20px;
      background-color: var(--bg-primary, white);
      margin-bottom: 0;
      text-align: center;
      border-bottom: 1px solid var(--border-color, rgba(0,0,0,0.1));
      display: flex !important;
      opacity: 1 !important;
      transform: translateY(0) !important;
      visibility: visible !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    section3.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 30px; color: var(--text-primary, #121212);
                   background: linear-gradient(135deg, var(--cannabis-green-light, #76d275), var(--cannabis-green, #43a047));
                   -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
          Simple Tracking, Powerful Insights
        </h2>
        <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 30px auto; color: var(--text-secondary, #6c757d); line-height: 1.6;">
          Just tap a few buttons after your session. We handle the rest, turning 
          your logs into easy-to-understand charts and summaries.
        </p>
        <div style="margin: 40px auto; max-width: 650px; background-color: var(--card-bg, white); border-radius: 12px; padding: 30px;
                    box-shadow: var(--shadow-md, 0 4px 15px rgba(0,0,0,0.1)); border: 1px solid var(--border-color, rgba(0,0,0,0.05));">
          <div style="display: flex; flex-direction: column; gap: 20px; text-align: left;">
            <div style="display: flex; gap: 15px; align-items: center;">
              <span style="font-size: 28px; background-color: rgba(67, 160, 71, 0.1); width: 50px; height: 50px; 
                          display: flex; align-items: center; justify-content: center; border-radius: 50%;">📊</span>
              <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Track consumption methods, dosage, and effects</span>
            </div>
            <div style="display: flex; gap: 15px; align-items: center;">
              <span style="font-size: 28px; background-color: rgba(67, 160, 71, 0.1); width: 50px; height: 50px; 
                          display: flex; align-items: center; justify-content: center; border-radius: 50%;">🧩</span>
              <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Connect patterns between strains and experiences</span>
            </div>
            <div style="display: flex; gap: 15px; align-items: center;">
              <span style="font-size: 28px; background-color: rgba(67, 160, 71, 0.1); width: 50px; height: 50px; 
                          display: flex; align-items: center; justify-content: center; border-radius: 50%;">📱</span>
              <span style="color: var(--text-secondary, #6c757d); line-height: 1.5;">Access your data anywhere, anytime</span>
            </div>
          </div>
        </div>
        <button style="background: linear-gradient(90deg, var(--cannabis-green-dark, #00701a), var(--cannabis-green, #43a047));
                      color: white; border: none; padding: 12px 30px; border-radius: 8px; font-weight: 600; font-size: 1rem;
                      cursor: pointer; box-shadow: 0 4px 15px rgba(67, 160, 71, 0.3); transition: all 0.3s ease;
                      animation: pulse 2s infinite;"
                onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 6px 20px rgba(67, 160, 71, 0.4)'; this.style.animation='none';"
                onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 15px rgba(67, 160, 71, 0.3)'; this.style.animation='pulse 2s infinite';"
                onclick="document.getElementById('dynamic-final-cta').scrollIntoView({behavior: 'smooth'});">
          I'm interested...
        </button>
      </div>
    `;
    contentContainer.appendChild(section3);
    
    // Final CTA
    const finalCTA = document.createElement('div');
    finalCTA.id = 'dynamic-final-cta';
    finalCTA.className = 'tour-section';
    finalCTA.style.cssText = `
      min-height: 100vh;
      width: 100%;
      padding: 80px 20px;
      background: linear-gradient(135deg, #121212, #1e1e1e);
      color: white;
      text-align: center;
      display: flex !important;
      opacity: 1 !important;
      transform: translateY(0) !important;
      visibility: visible !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `;
    finalCTA.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="font-size: 2.8rem; font-weight: 700; margin-bottom: 30px; color: white;
                   background: linear-gradient(135deg, var(--cannabis-gold, #ffc107), var(--cannabis-green-light, #76d275));
                   -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;">
          Ready to Roll?
        </h2>
        <p style="font-size: 1.2rem; max-width: 600px; margin: 0 auto 40px auto; color: #e0e0e0; line-height: 1.6;">
          Elevate your experience and gain clarity with personalized insights.
        </p>
        <a href="/register" style="display: inline-block; padding: 15px 35px; background-color: var(--cannabis-green, #43a047); color: white; 
                                 font-weight: 700; text-decoration: none; border-radius: 8px; font-size: 1.1rem;
                                 box-shadow: 0 5px 20px rgba(67, 160, 71, 0.4); transition: all 0.3s ease;
                                 background: linear-gradient(90deg, var(--cannabis-green, #43a047), var(--cannabis-green-light, #76d275));
                                 background-size: 200% auto;"
           onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(67, 160, 71, 0.5)'; this.style.backgroundPosition='right center';"
           onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 5px 20px rgba(67, 160, 71, 0.4)'; this.style.backgroundPosition='left center';">
          Start Tracking Now
        </a>
        <div style="margin-top: 30px; color: #999; font-size: 0.9rem;">No credit card required • Free to use • Try it today</div>
      </div>
    `;
    contentContainer.appendChild(finalCTA);
    
    // Add style to ensure proper section stacking
    const styleElement = document.createElement('style');
    styleElement.id = 'tour-custom-styles';
    styleElement.textContent = `
      #tour-content-container {
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      #tour-content-container > div {
        min-height: 100vh;
        width: 100%;
        flex-shrink: 0;
      }
      
      /* Ensure body can scroll */
      body.tour-loaded {
        overflow: auto !important;
        height: auto !important;
      }
      
      /* Clear any floats */
      #tour-content-container::after {
        content: "";
        display: table;
        clear: both;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Immediately scroll to the content container after adding all sections
    setTimeout(() => {
      // First try to scroll to the container
      const container = document.getElementById('tour-content-container');
      if (container) {
        console.log('Scrolled to tour container');
        window.scrollTo({
          top: window.innerHeight,
          behavior: 'smooth'
        });
      }
      
      // Make sure body can scroll
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      
      // Check if any tour sections were created
      const sectionCount = document.querySelectorAll('.tour-section').length;
      console.log(`Tour initialized with ${sectionCount} sections`);
      
      // Apply a class to all created tour sections
      document.querySelectorAll('.tour-section').forEach(section => {
        section.classList.add('is-visible');
      });
    }, 100); // Short timeout to ensure DOM is updated
    
    return contentContainer;
  };

  // Helper function to force scroll to tour content with multiple attempts
  const forceScrollToTour = () => {
    // Try to find tour content
    const tourContainer = document.getElementById('tour-content-container');
    if (!tourContainer) {
      console.log('No tour container found to scroll to');
      return;
    }

    // Immediate scroll
    const scrollToPosition = () => {
      // Calculate position (below the viewport)
      const yOffset = window.innerHeight; 
      
      console.log(`Forcing scroll to y=${yOffset}`);
      window.scrollTo({
        top: yOffset,
        behavior: 'smooth'
      });
    };
    
    // First attempt
    scrollToPosition();
    
    // Multiple backup attempts with increasing delays
    setTimeout(scrollToPosition, 300);
    setTimeout(scrollToPosition, 800);
    setTimeout(scrollToPosition, 1500);
  };

  return (
    <div className={`landing-page ${isTourStarted ? 'tour-started' : ''}`}>
      {/* Hero Section */}
      <section className="hero-section" ref={heroRef}>
        <div className="container">
          <div className="hero-content">
            <div className="headline-container">
              <h1 className="dynamic-headline" key={headlineIndex}>
                {dynamicHeadlines[headlineIndex]}
              </h1>
            </div>
            <p className="hero-tagline">
              Your personal cannabis companion.
            </p>
            <div className="hero-cta" 
              onClick={(e) => {
                // Check if the click was directly on the div (not on a button)
                if (e.target === e.currentTarget) {
                  console.log('Click detected on hero-cta div');
                  // If no button was clicked, assume they tried to click the main button
                  showBasicTour();
                  forceScrollToTour(); // Add force scroll
                  document.body.setAttribute('data-sections-shown', 'true');
                }
              }}
              style={{ position: 'relative', zIndex: 50 }}
            >
              <button 
                id="discoverButton"
                className="btn btn-primary discover-button"
                onClick={(e) => {
                  console.log('Discover button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Show visual feedback
                  const target = e.target as HTMLElement;
                  target.style.backgroundColor = '#ff6b6b';
                  target.textContent = 'Starting Tour...';
                  
                  // Call our showBasicTour function directly
                  showBasicTour();
                  
                  // Also call forceScrollToTour to ensure scrolling happens
                  forceScrollToTour();
                  
                  // Reset button after delay
                  setTimeout(() => {
                    target.style.backgroundColor = '#43a047';
                    target.innerHTML = 'Discover SeshTracker <span class="icon">👇</span>';
                  }, 1000);
                }}
                style={{
                  backgroundColor: '#43a047',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  zIndex: 100
                }}
                onMouseOver={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#2e7d32';
                  (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#43a047';
                  (e.target as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Discover SeshTracker <span className="icon">👇</span>
              </button>
            </div>
            
            {/* Cannabis leaf animation */}
            <div className="leaf-animation" style={{ pointerEvents: 'none' }}>
              <div className="leaf leaf-1"></div>
              <div className="leaf leaf-2"></div>
              <div className="leaf leaf-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* We're removing the original sections here because they're not working */}
      {/* They will be replaced by direct DOM manipulation in showBasicTour() */}
    </div>
  );
};

export default LandingPage;