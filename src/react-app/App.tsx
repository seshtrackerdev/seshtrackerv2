// src/App.tsx

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  // Auth components
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  AuthDebugger,
  
  // Layout components
  ProtectedRoute,
  
  // Common components
  Header,
  BugReport,
  PageTransition,
  
  // Feature pages
  Dashboard,
  SessionsPage,
  InventoryPage,
  AnalyticsPage,
  ProfilePage,
  TestPage,
  
  // Test components
  ComponentShowcase,
  
  // Landing components
  LandingPage,
  
  // UI components
  ThemeProvider
} from './components';

import DebugTool from './utils/DebugTool';
import "./styles/.css";
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

// App routes with unified Header and AnimatePresence for transitions
const AppContent = () => {
  const location = useLocation();
  
  return (
    <>
      <Header />
      <main className="main-content-area">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            } />
            <Route path="/login" element={
              <PageTransition>
                <LoginForm />
              </PageTransition>
            } />
            <Route path="/register" element={
              <PageTransition>
                <RegisterForm />
              </PageTransition>
            } />
            <Route path="/forgot-password" element={
              <PageTransition>
                <ForgotPasswordForm />
              </PageTransition>
            } />
            
            {/* UI Component Showcase Route */}
            <Route path="/ui-components" element={
              <PageTransition>
                <ComponentShowcase />
              </PageTransition>
            } />
            
            {/* Legacy version route - accessible without login */}
            <Route path="/legacy" element={<ClassicVersionRedirect />} />
            
            {/* Contact page */}
            <Route path="/contact" element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            } />
            
            {/* Test page for KushObserver integration */}
            <Route path="/test-integration" element={
              <PageTransition>
                <TestPage />
              </PageTransition>
            } />
            
            {/* Protected routes that require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="/sessions" element={
              <ProtectedRoute>
                <PageTransition>
                  <SessionsPage />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute>
                <PageTransition>
                  <InventoryPage />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="/analytics" element={
              <ProtectedRoute>
                <PageTransition>
                  <AnalyticsPage />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <PageTransition>
                  <ProfilePage />
                </PageTransition>
              </ProtectedRoute>
            } />
            
            {/* Redirect /classic to /legacy */}
            <Route path="/classic" element={<Navigate to="/legacy" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider storageKey="theme">
        <AppContent />
        <AuthDebugger />
        <DebugTool />
        <BugReport />
      </ThemeProvider>
    </Router>
  );
}

export default App;

