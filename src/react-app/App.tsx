// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import LandingPage from "./components/landing/LandingPage";
import { LoginForm, RegisterForm } from "./components/auth/index.ts";
import { ProtectedRoute } from "./components/layouts/index.ts";
import { Header } from "./components/common/index.ts";
import ContactPage from "./pages/ContactPage";
import { useAuth } from "./hooks";
import ThemeProvider from "./components/ui/ThemeProvider";
import "./styles/App.css";
import React from "react";
import UIComponentsPage from "./pages/UIComponentsPage";
import {
  DashboardSelector,
  BasicDashboard,
  AdvancedDashboard,
  DashboardEditorPlaceholder,
  ImportDashboardPlaceholder
} from './components/dashboard/index.ts';

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

// AppContent component that renders the main content
const AppContent = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <>
      <Header />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/contact" element={<ContactPage />} />
          
          {/* Legacy version route - accessible without login */}
          <Route path="/legacy" element={<ClassicVersionRedirect />} />
          
          {/* Protected routes that require authentication */}
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
          
          <Route path="/ui-components" element={
            <React.Suspense fallback={<div className="loading">Loading...</div>}>
              <UIComponentsPage />
            </React.Suspense>
          } />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardSelector /></ProtectedRoute>} />
          <Route path="/dashboard/basic" element={<ProtectedRoute><BasicDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/advanced" element={<ProtectedRoute><AdvancedDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/editor" element={<ProtectedRoute><DashboardEditorPlaceholder /></ProtectedRoute>} />
          <Route path="/dashboard/import" element={<ProtectedRoute><ImportDashboardPlaceholder /></ProtectedRoute>} />
          
          {/* Profile route */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="placeholder-page">
                <h2>User Profile</h2>
                <p>Profile management will be available soon!</p>
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
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

