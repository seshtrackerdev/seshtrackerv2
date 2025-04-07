import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';
import '../../styles/LandingPage.css';

const dynamicHeadlines = [
  "Track your Strains...",
  "Monitor your Mood...",
  "Understand your Usage...",
  "Optimize your Experience...",
  "Manage your Inventory..."
];

const LandingPage: React.FC = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [isTourStarted, setIsTourStarted] = useState(false);

  // Refs for scrolling targets
  const tourStartRef = useRef<HTMLDivElement>(null);
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

  // Effect for Intersection Observer (only runs if tour started)
  useEffect(() => {
    if (!isTourStarted) return;
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        } 
      });
    };
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = [section1Ref, section2Ref, section3Ref, finalCTARef];
    sections.forEach(ref => { if (ref.current) observer.observe(ref.current); });
    return () => { sections.forEach(ref => { if (ref.current) observer.unobserve(ref.current); }); };
  }, [isTourStarted]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
    document.body.classList.toggle('dark-theme-v6', !isDarkTheme);
    document.body.classList.toggle('light-theme-v6', isDarkTheme);
  };

  const handleAuthRedirect = () => { window.location.href = '/login'; };

  const scrollToRef = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Function to start the tour and scroll
  const startTour = () => {
    setIsTourStarted(true);
    setTimeout(() => {
      if (section1Ref.current) {
        scrollToRef(section1Ref);
      }
    }, 100);
  };

  return (
    <div 
      className={`landing-page-v6 ${isDarkTheme ? 'dark-theme-v6' : 'light-theme-v6'}`}
    >
       {/* --- V6 Main Content (Only Initial View Initially) --- */}
       <main className="main-content-v6">
         <section className="initial-view-v6">
             <div className="dynamic-headline-container-v6">
                 <h1 className="dynamic-headline-v6" key={headlineIndex}>
                     {dynamicHeadlines[headlineIndex]}
                 </h1>
             </div>
             <div className="initial-cta-v6" ref={tourStartRef}>
                 <button 
                     className="tour-button-v6" 
                     onClick={startTour}
                 >
                     Discover SeshTracker 👇
                 </button>
             </div>
         </section>
       </main>

       {/* --- Conditionally Rendered Tour Sections & Footer (Outside Main) --- */}
       {isTourStarted && (
           <>
               {/* Guided Tour Section 1: What is it? */}
               <section id="section-1" ref={section1Ref} className="tour-section-v6 section-what">
               <div className="section-content-v6">
                   <h2>What's SeshTracker?</h2>
                   <p>Your personal cannabis companion. Effortlessly log sessions, track strains, monitor effects, and understand your patterns over time.</p>
                   <div className="visual-placeholder-v6">[Cool Graphic/Animation Here]</div>
                   <button 
                       className="next-section-btn-v6" 
                       onClick={() => { if (section2Ref.current) scrollToRef(section2Ref); }}
                   >
                       Tell me more
                   </button>
               </div>
               </section>

               {/* Guided Tour Section 2: Features/Use Cases */}
               <section id="section-2" ref={section2Ref} className="tour-section-v6 section-features">
               <div className="section-content-v6">
                   <h2>Why Use It? (For Stoners, By Stoners)</h2>
                   <ul>
                       <li data-emoji="🧠"> 
                           <strong>Know Your High:</strong> Finally figure out which strains *actually* help you focus, relax, or get creative.
                       </li>
                       <li data-emoji="💰"> 
                           <strong>Smart Stash:</strong> Stop guessing. Track your inventory, know what you have, and maybe save some cash.
                       </li>
                       <li data-emoji="📈"> 
                           <strong>See Your Journey:</strong> Visualize your usage. Are you smoking more? Less? What triggers a session?
                       </li>
                       <li data-emoji="🚫"> 
                           <strong>Avoid the Bad Trips:</strong> Note down strains or methods that didn't vibe with you. Remember what to skip next time.
                       </li>
                   </ul>
                   <div className="visual-placeholder-v6">[Another Cool Graphic/Animation Here]</div>
                   <button 
                       className="next-section-btn-v6" 
                       onClick={() => { if (section3Ref.current) scrollToRef(section3Ref); }}
                   >
                       How does it work?
                   </button>
               </div>
               </section>

               {/* Guided Tour Section 3: How it Works (Simple) */}
               <section id="section-3" ref={section3Ref} className="tour-section-v6 section-how">
               <div className="section-content-v6">
                   <h2>Simple Tracking, Powerful Insights</h2>
                   <div className="feature-description">
                     <p>Just tap a few buttons after your session. We handle the rest, turning your logs into easy-to-understand charts and summaries.</p>
                     <ul className="feature-highlights">
                       <li data-emoji="📊">Track consumption methods, dosage, and effects</li>
                       <li data-emoji="🧩">Connect patterns between strains and experiences</li>
                       <li data-emoji="📱">Access your data anywhere, anytime</li>
                     </ul>
                   </div>
                   <div className="visual-container">
                     <div className="visual-placeholder-v6">
                       <img src="/images/analytics-preview.png" alt="SeshTracker Analytics" className="section-image" />
                     </div>
                   </div>
                   <button 
                       className="next-section-btn-v6 pulse-effect" 
                       onClick={() => { if (finalCTARef.current) scrollToRef(finalCTARef); }}
                   >
                       Alright, I'm interested...
                   </button>
               </div>
               </section>

               {/* Final Creative CTA Section */}
               <section id="final-cta" ref={finalCTARef} className="final-cta-section-v6">
               <div className="section-content-v6 cta-container">
                       <h2 className="cta-heading">Ready to Roll?</h2>
                       <p className="cta-subtext">Elevate your experience and gain clarity with personalized insights.</p>
                       <div className="benefits-container">
                         <div className="benefit-item">
                           <span className="benefit-icon">🔒</span>
                           <span className="benefit-text">Private & Secure</span>
                         </div>
                         <div className="benefit-item">
                           <span className="benefit-icon">💯</span>
                           <span className="benefit-text">100% Free</span>
                         </div>
                         <div className="benefit-item">
                           <span className="benefit-icon">📊</span>
                           <span className="benefit-text">Data Insights</span>
                         </div>
                       </div>
                       <div 
                         className="creative-cta-element-v6" 
                         onClick={handleAuthRedirect} 
                         title="Sign Up / Log In"
                       >
                           <img src="/images/cannabis-leaf.svg" alt="Cannabis Leaf" className="cta-leaf-v6"/>
                           <span>Start Tracking</span>
                       </div>
               </div>
               </section>

                {/* --- V6 Footer --- */}
               <footer className="footer-v6">
                   <p>© {new Date().getFullYear()} Sesh Tracker</p>
               </footer>
           </>
       )}
     </div>
  );
};

export default LandingPage; 