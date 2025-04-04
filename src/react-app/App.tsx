// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import "./App.css";

function App() {
  const openClassicVersion = () => {
    window.open("/legacy/index.html", "_blank");
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <div className="login-placeholder">
            <h2>Login Page</h2>
            <p>This is a placeholder for the login page that will be implemented later.</p>
            <button onClick={() => window.location.href = '/'}>Back to Home</button>
          </div>
        } />
        <Route path="/sessions" element={
          <div className="placeholder-page">
            <h2>Sessions Page</h2>
            <p>This feature is coming soon!</p>
            <button onClick={() => window.location.href = '/'}>Back to Home</button>
          </div>
        } />
        <Route path="/inventory" element={
          <div className="placeholder-page">
            <h2>Inventory Page</h2>
            <p>This feature is coming soon!</p>
            <button onClick={() => window.location.href = '/'}>Back to Home</button>
          </div>
        } />
        <Route path="/analytics" element={
          <div className="placeholder-page">
            <h2>Analytics Page</h2>
            <p>This feature is coming soon!</p>
            <button onClick={() => window.location.href = '/'}>Back to Home</button>
          </div>
        } />
        <Route path="/classic" element={
          <div className="classic-redirect">
            <h2>Redirecting to Classic Version...</h2>
            <button onClick={openClassicVersion}>
              Click here if you're not redirected automatically
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
