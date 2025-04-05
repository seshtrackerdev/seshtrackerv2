// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from 'react';
import LandingPage from "./components/LandingPage";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Header from './components/Header';
import DebugTool from './utils/DebugTool';
import BugReport from './components/BugReport';
import "./App.css";
import DashboardPlaceholder from "./components/DashboardPlaceholder";
import ContactPage from './pages/ContactPage';

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

// App routes with unified Header
const AppContent = () => {
  return (
    <>
      <Header />
      <main className="main-content-area">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          
          {/* Legacy version route - accessible without login */}
          <Route path="/legacy" element={<ClassicVersionRedirect />} />
          
          {/* Contact page */}
          <Route path="/contact" element={<ContactPage />} />
          
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
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
      <DebugTool />
      <BugReport />
    </Router>
  );
}

export default App;
