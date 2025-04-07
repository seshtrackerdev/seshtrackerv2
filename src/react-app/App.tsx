// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from 'react';
import { DebugTool } from './utils';
import "./styles/App.css";
import ContactPage from './pages/ContactPage';

// Simplified App component for deployment
function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>SeshTracker</h1>
        </header>
        
        <main className="main-content-area">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        
        <footer className="app-footer">
          <p>SeshTracker v2 - Your personal cannabis tracking solution</p>
        </footer>
      </div>
    </Router>
  );
}

// Simple Home component
function Home() {
  return (
    <div className="home-container">
      <h2>Welcome to SeshTracker</h2>
      <p>The site is currently being updated with new features.</p>
      <p>Check back soon for the full experience!</p>
    </div>
  );
}

export default App;

