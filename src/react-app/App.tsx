// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import LandingPage from "./components/LandingPage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks";
import "./App.css";
import DashboardPlaceholder from "./components/DashboardPlaceholder";

// Classic version redirect component
const ClassicVersionRedirect = () => {
  useEffect(() => {
    window.location.href = "/legacy/index.html";
  }, []);

  return (
    <div className="classic-redirect">
      <h2>Redirecting to Classic Version...</h2>
      <p>If you're not redirected automatically, <a href="/legacy/index.html" className="text-indigo-400">click here</a></p>
    </div>
  );
};

// AppContent component that conditionally renders the header
const AppContent = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  
  // Check if current path is login, register, OR the landing page
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isLandingPage = location.pathname === '/';

  return (
    <>
      {/* Hide header on auth pages AND on the landing page */}
      {!isAuthPage && !isLandingPage && (
        <header className="bg-green-600 text-white p-4 flex justify-between items-center z-50 relative">
          <a href="/dashboard" className="text-xl font-bold">SeshTracker</a>
          <div>
            {isAuthenticated ? (
              <button 
                onClick={logout} 
                className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            ) : (
              <div className="space-x-2">
                <a 
                  href="/login" 
                  className="bg-white text-green-700 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-transparent border border-white text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Register
                </a>
              </div>
            )}
          </div>
        </header>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        
        {/* Legacy version route - accessible without login */}
        <Route path="/legacy" element={<ClassicVersionRedirect />} />
        
        {/* Protected routes that require authentication */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        } />
        
        <Route path="/sessions" element={
          <ProtectedRoute>
            <div className="placeholder-page">
              <h2>Sessions Page</h2>
              <p>This feature is coming soon!</p>
              <button onClick={() => window.location.href = '/'}>Back to Home</button>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/inventory" element={
          <ProtectedRoute>
            <div className="placeholder-page">
              <h2>Inventory Page</h2>
              <p>This feature is coming soon!</p>
              <button onClick={() => window.location.href = '/'}>Back to Home</button>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/analytics" element={
          <ProtectedRoute>
            <div className="placeholder-page">
              <h2>Analytics Page</h2>
              <p>This feature is coming soon!</p>
              <button onClick={() => window.location.href = '/'}>Back to Home</button>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Redirect /classic to /legacy */}
        <Route path="/classic" element={<Navigate to="/legacy" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
