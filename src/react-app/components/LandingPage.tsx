import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

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
      threshold: 0.1 
    };
    
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
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

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Function to start the tour and scroll
  const startTour = () => {
    setIsTourStarted(true);
    document.body.classList.add('tour-started');
    setTimeout(() => {
      if (section1Ref.current) {
        scrollToRef(section1Ref);
      }
    }, 100);
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
            <div className="hero-cta">
              <button 
                className="btn btn-primary discover-button"
                onClick={startTour}
              >
                Discover SeshTracker <span className="icon">👇</span>
              </button>
            </div>
            
            {/* Cannabis leaf animation */}
            <div className="leaf-animation">
              <div className="leaf leaf-1"></div>
              <div className="leaf leaf-2"></div>
              <div className="leaf leaf-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Conditional Tour Sections */}
      {/* Section 1: What is it? */}
      <section id="section-1" ref={section1Ref} className="tour-section">
        <div className="container">
          <div className="section-content">
            <h2 className="section-title">What's SeshTracker?</h2>
            <p className="section-description">
              Your personal cannabis companion. Effortlessly log sessions, 
              track strains, monitor effects, and understand your patterns over time.
            </p>
            <div className="section-image-container">
              <img 
                src="/images/app-showcase.png" 
                alt="SeshTracker App" 
                className="section-image"
              />
            </div>
            <button 
              className="btn btn-primary next-button"
              onClick={() => scrollToRef(section2Ref)}
            >
              Tell me more
            </button>
          </div>
        </div>
      </section>

      {/* Section 2: Features/Use Cases */}
      <section id="section-2" ref={section2Ref} className="tour-section features-section">
        <div className="container">
          <div className="section-content">
            <h2 className="section-title">Why Use It? <span className="text-sm font-normal">(For Stoners, By Stoners)</span></h2>
            <ul className="features-list">
              <li className="feature-item"> 
                <span className="feature-emoji">🧠</span>
                <div className="feature-text">
                  <strong>Know Your High:</strong> Finally figure out which strains *actually* help you focus, relax, or get creative.
                </div>
              </li>
              <li className="feature-item"> 
                <span className="feature-emoji">💰</span>
                <div className="feature-text">
                  <strong>Smart Stash:</strong> Stop guessing. Track your inventory, know what you have, and maybe save some cash.
                </div>
              </li>
              <li className="feature-item"> 
                <span className="feature-emoji">📈</span>
                <div className="feature-text">
                  <strong>See Your Journey:</strong> Visualize your usage. Are you smoking more? Less? What triggers a session?
                </div>
              </li>
              <li className="feature-item"> 
                <span className="feature-emoji">🚫</span>
                <div className="feature-text">
                  <strong>Avoid the Bad Trips:</strong> Note down strains or methods that didn't vibe with you. Remember what to skip next time.
                </div>
              </li>
            </ul>
            <button 
              className="btn btn-primary next-button"
              onClick={() => scrollToRef(section3Ref)}
            >
              How does it work?
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: How it Works */}
      <section id="section-3" ref={section3Ref} className="tour-section how-section">
        <div className="container">
          <div className="section-content">
            <h2 className="section-title">Simple Tracking, Powerful Insights</h2>
            <div className="how-it-works">
              <p className="how-description">
                Just tap a few buttons after your session. We handle the rest, turning 
                your logs into easy-to-understand charts and summaries.
              </p>
              <ul className="how-features">
                <li className="how-feature">
                  <span className="feature-emoji">📊</span> 
                  Track consumption methods, dosage, and effects
                </li>
                <li className="how-feature">
                  <span className="feature-emoji">🧩</span> 
                  Connect patterns between strains and experiences
                </li>
                <li className="how-feature">
                  <span className="feature-emoji">📱</span> 
                  Access your data anywhere, anytime
                </li>
              </ul>
            </div>
            <div className="analytics-preview">
              <img 
                src="/images/analytics-preview.png" 
                alt="SeshTracker Analytics" 
                className="analytics-image"
              />
            </div>
            <button 
              className="btn btn-primary next-button pulse-effect"
              onClick={() => scrollToRef(finalCTARef)}
            >
              Alright, I'm interested...
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="final-cta" ref={finalCTARef} className="cta-section tour-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-heading">Ready to Roll?</h2>
            <p className="cta-tagline">
              Elevate your experience and gain clarity with personalized insights.
            </p>
            <div className="benefits">
              <div className="benefit">
                <span className="benefit-icon">🔒</span>
                <span className="benefit-text">Private & Secure</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💯</span>
                <span className="benefit-text">100% Free</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <span className="benefit-text">Data Insights</span>
              </div>
            </div>
            <Link to="/register" className="cta-button">
              <img src="/images/cannabis-leaf.svg" alt="" className="cta-icon" />
              <span>Start Tracking</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container">
          <p>© {new Date().getFullYear()} SeshTracker</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 