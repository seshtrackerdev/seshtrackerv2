# Sesh-Tracker.com Architecture

This document outlines the architectural patterns, component relationships, and data flow for the Sesh-Tracker.com platform, aligned with the current implementation.

## System Architecture Overview

Sesh-Tracker.com uses a modern frontend-focused architecture with serverless backend components. The system is designed to be modular, scalable, and performance-optimized.

### High-Level Architecture

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│  Sesh-Tracker.com │      │   Kush.observer   │      │My-Cannabis-Tracker│
│  (Main App)       │◄────►│  (Auth Service)   │◄────►│  (Admin Dashboard)│
└───────────────────┘      └───────────────────┘      └───────────────────┘
         │                          │                           │
         ▼                          ▼                           ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                           Cloudflare Services                              │
│                                                                            │
│    ┌──────────┐          ┌──────────┐          ┌──────────────────┐       │
│    │  Workers │          │    D1    │          │    KV Storage    │       │
│    └──────────┘          └──────────┘          └──────────────────┘       │
└───────────────────────────────────────────────────────────────────────────┘
```

### Repository Structure

The platform is divided into three repositories, each with a specific focus:

1. **Sesh-Tracker.com** (Main App - Current Repository)
   - Core user-facing application
   - Session tracking, inventory management, analytics
   - React-based SPA with Vite build system
   - Hono API for backend functionality

2. **Kush.observer** (Auth Service - Already Implemented)
   - User authentication and account management
   - Token-based security
   - Data segregation and validation
   - Already integrated via API endpoints

3. **My-Cannabis-Tracker.com** (Admin Dashboard - Future Integration)
   - Administrative interface
   - Platform monitoring and management
   - User support tools

## Current Implementation Architecture

### Frontend Architecture

The frontend follows the current structure:

```
src/
├── react-app/
│   ├── components/         # UI components
│   │   ├── LandingPage.tsx # Site landing page
│   │   ├── LoginForm.tsx   # User login
│   │   ├── RegisterForm.tsx # User registration
│   │   ├── DashboardPlaceholder.tsx # Dashboard mockup
│   │   ├── SessionsPage.tsx # Sessions feature placeholder
│   │   ├── InventoryPage.tsx # Inventory feature placeholder
│   │   ├── AnalyticsPage.tsx # Analytics feature placeholder
│   │   ├── Header.tsx     # Navigation and app header
│   │   ├── ProtectedRoute.tsx # Auth protection wrapper
│   │   └── PageTransition.tsx # Animation between pages
│   ├── hooks/
│   │   └── useAuth.tsx    # Authentication logic and context
│   ├── pages/             # Standalone page components
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component with routing
│   └── main.tsx           # App entry point
├── api/
│   ├── middleware/
│   │   └── auth.ts        # Token verification middleware
│   └── index.ts           # API endpoints, including auth proxying
```

### Backend Integration

Current API implementation proxies authentication requests to Kush.observer:

```
┌───────────────────┐      ┌─────────────────────────┐
│  React Frontend   │      │   Hono API (src/api/)   │
│  (src/react-app/) │◄────►│                         │
└───────────────────┘      └─────────────────────────┘
                                       │
                                       ▼
                           ┌─────────────────────────┐
                           │    Kush.observer API    │
                           │ (Authentication Service) │
                           └─────────────────────────┘
```

### Authentication Flow (Implemented)

The current authentication flow works as follows:

1. **User Login/Registration:**
   - Frontend forms capture credentials (src/react-app/components/LoginForm.tsx, RegisterForm.tsx)
   - useAuth hook manages auth state and API calls (src/react-app/hooks/useAuth.tsx)

2. **API Proxy:**
   - Local API endpoints proxy requests to Kush.observer (src/api/index.ts)
   - `/api/auth/login` → `kushobserver.tmultidev.workers.dev/api/direct-login`
   - `/api/auth/register` → `kushobserver.tmultidev.workers.dev/api/direct-register`
   - `/api/auth/reset-password` → `kushobserver.tmultidev.workers.dev/reset`

3. **Token Management:**
   - JWT tokens received from Kush.observer stored in localStorage
   - Tokens attached to protected API requests
   - Token verification for protected routes

4. **Protected Routes:**
   - ProtectedRoute component wraps authenticated pages
   - Redirects to login if no valid token exists

### State Management

- **Auth Context:** Global authentication state managed through React Context
- **Local Component State:** UI state managed within components
- **Future Enhancement:** Implement more sophisticated state management as features develop

## Data Storage Integration

### Current Data Models

#### User (From Kush.observer)
- ID
- Email
- Name (optional)

### Planned Data Models

#### Session
- Timestamp information
- Consumption details
- Tags and metadata
- Mood/effects tracking

#### Inventory
- Product information
- Stock levels
- Purchase details
- Consumption rate

#### Dashboard
- Layout configuration
- Widget settings
- Personalization options

### Database Strategy

The application currently relies on Kush.observer for user data storage. Future implementation will expand to store application data:

- **User Data:** Already using Kush.observer (Cloudflare D1)
- **Session Data:** To be implemented (Cloudflare D1)
- **Inventory Data:** To be implemented (Cloudflare D1)
- **User Preferences:** To be implemented (Cloudflare KV Storage)

## API Layer

### Current Endpoints

- `/api/auth/login` - Authentication
- `/api/auth/register` - User registration
- `/api/auth/reset-password` - Password reset
- `/api/protected/user-profile` - User profile (protected)
- `/api/protected/sessions` - Example sessions endpoint (protected)

### Planned Endpoints

- `/api/protected/sessions/*` - Session CRUD operations
- `/api/protected/inventory/*` - Inventory management
- `/api/protected/dashboard/*` - Dashboard configuration
- `/api/protected/analytics/*` - Data aggregation and analysis

## Next Implementation Steps

Based on the current architecture and implementation status:

1. **Standardize UI Components:**
   - Extract reusable components from existing pages
   - Create a unified design system

2. **Implement Data Models:**
   - Define comprehensive TypeScript interfaces
   - Set up data validation

3. **Build Core Features:**
   - Complete the Sessions feature
   - Complete the Inventory feature
   - Implement the Dashboard with widgets

4. **Enhance API Layer:**
   - Expand the API service to support all data operations
   - Implement proper error handling and request validation

## Security Considerations

- **Authentication:** Already implemented with JWT-based tokens via Kush.observer
- **Authorization:** Role-based access control to be implemented
- **Data Isolation:** Ensure user data segregation in database design
- **Input Validation:** Implement comprehensive validation on both client and server
- **HTTPS:** All communication encrypted
- **Token Refresh:** Implement proper token expiration and refresh mechanism 