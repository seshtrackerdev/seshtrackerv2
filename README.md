# Sesh-Tracker.com

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Hono](https://img.shields.io/badge/Hono-4-E36002?logo=cloudflare)](https://hono.dev/)

> A comprehensive platform for tracking, analyzing, and optimizing your cannabis consumption habits.

## 🌟 Overview

Sesh-Tracker.com is a modern web application designed to help cannabis users track their consumption habits, manage their inventory, and gain valuable insights through data visualization and analytics. The platform provides a personalized, data-driven experience to promote mindful consumption and self-quantification.

### Key Features

- **Session Logging**: Track your sessions with detailed metadata and tagging
- **Inventory Management**: Monitor your product stock levels and consumption patterns
- **Interactive Dashboard**: Customizable widgets to visualize your data
- **Advanced Analytics**: Gain insights through comprehensive data visualization
- **Personalization**: Tailor the experience to your specific tracking needs

## 📊 Project Ecosystem

Sesh-Tracker.com operates as part of a connected ecosystem consisting of three repositories:

1. **Sesh-Tracker.com** (this repository) - Main user-facing application
   - Frontend interface and core session tracking functionality
   - Tech Stack: Vite, React 18.3.1, TypeScript, TailwindCSS 3.4.17, Hono

2. **Kush.observer** - Authentication and account management
   - Manages user authentication, account creation, and access control
   - Already integrated via API endpoints for login, registration, and token verification
   - Tech Stack: Cloudflare Workers, OpenAuth, Cloudflare D1 + KV Storage

3. **My-Cannabis-Tracker.com** - Administrative dashboard
   - Internal tool for platform management and monitoring
   - Tech Stack: Astro, Shadcn UI, TailwindCSS, TypeScript

## 🏗️ Project Structure

```
src/
├── react-app/           # Frontend React application
│   ├── components/      # UI components (Dashboard, Auth forms, etc.)
│   ├── hooks/           # Custom React hooks (useAuth)
│   ├── pages/           # Route components (Contact, etc.)
│   ├── utils/           # Utility functions
│   ├── styles/          # Global styles and Tailwind imports
│   ├── App.tsx          # Main application component
│   └── main.tsx         # Application entry point
├── api/                 # Backend API using Hono
│   ├── middleware/      # Request middlewares (auth)
│   └── index.ts         # API routes and handlers
└── worker/              # (Future) Worker-specific code 

docs/                    # Project documentation
├── architecture.md      # System architecture overview
├── technical.md         # Technical specifications
├── status.md            # Project status and progress
└── mobile-first-theme.md # Mobile design guidelines

development-plan/        # Development planning
├── README.md            # Development plan overview
├── TODO.md              # Task breakdown by phases
├── ROADMAP.md           # Timeline and milestones
├── ARCHITECTURE.md      # Detailed architecture documentation
└── phases/              # Phase-specific implementation plans

public/                  # Static assets
├── images/              # Image assets (no duplication)
└── legacy/              # Legacy code (old versions)
```

## 💻 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/seshtrackerdev/seshtrackerv2.git
   cd seshtrackerv2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000)

## 🧰 Development Workflow

1. Run cleanup script to ensure proper structure:
   ```
   ./cleanup.ps1
   ```

2. Follow these organization rules when adding new files:
   - Components go in `src/react-app/components/`
   - CSS files should be named after their component (e.g. `Button.css`)
   - All images should be stored in `public/images/`
   - No duplicate files allowed across directories

3. Use the VSCode file explorer to visually verify the correct directory structure
4. Run the cleanup script periodically if you notice file organization issues

## 🔑 Authentication Integration

The application integrates with the Kush.observer service for user authentication:

- **Login Flow**: Implemented in `src/react-app/hooks/useAuth.tsx` and `src/api/index.ts`
- **Registration**: Connected to the Kush.observer registration endpoint
- **Token Management**: JWT tokens stored in localStorage with proper refresh mechanisms
- **Protected Routes**: Components wrapped with `ProtectedRoute` for access control

## 📱 User Journey

### Landing Page
Educational and engaging entry point showcasing the platform's value with clear CTAs to guide users.

### Authentication
Secure login and registration system powered by Kush.observer with forms for account creation, login, and password reset.

### Dashboard
After authentication, users access their personalized dashboard with:
- Session logging widgets
- Inventory status
- Analytics visualization
- Navigation to detailed features

### Core Features
- **Sessions Page**: Detailed session tracking and history
- **Inventory Page**: Product management and consumption tracking
- **Analytics Page**: Data visualization and insights
- **Settings**: User preferences and account management

## 🌐 Classic Version Integration

The original SeshTracker web application has been preserved for backward compatibility:

### How to Access the Classic Version

1. **From the main app**: Click the "Open Classic SeshTracker" button on the homepage
2. **Direct access**: Navigate to `/classic/index.html` or `/classic.html`

### Implementation Details

- All original files are preserved in the `public/legacy/` directory
- The original JavaScript, CSS, and HTML are kept intact
- Local storage data is preserved
- All classic features work as before

## 🔄 Development Plan

The project follows a phased development approach as detailed in the `/development-plan` directory:

1. **Foundation Phase**: Core infrastructure, authentication, UI components (Current Focus)
2. **Core Functionality**: Session logging, inventory management, basic dashboard
3. **Enhanced Features**: Widget system, advanced analytics, rich session tracking
4. **Refinement**: Performance optimization, UX enhancements, mobile optimization

## 🔄 SeshTracker Migration

The project includes a migration from the existing Kush.observer backend to a dedicated SeshTracker backend:

### Migration Components

1. **Database Schema**: New D1 database schema in `migrations/0002_sessions_inventory_schema.sql`
2. **API Routes**: New versioned API endpoints:
   - `/api/v2/inventory` - Full inventory management
   - `/api/v2/sessions` - Session tracking and management
3. **Authentication**: Integration with Kush.observer for token validation
4. **Testing**: Connection testing and validation with `scripts/test-connection.js`

### API Documentation

The new API endpoints follow RESTful conventions:

- **Inventory Endpoints**:
  - `GET /api/v2/inventory` - List inventory items with pagination and sorting
  - `POST /api/v2/inventory` - Create new inventory item
  - `GET /api/v2/inventory/:id` - Get specific inventory item
  - `PUT /api/v2/inventory/:id` - Update inventory item
  - `DELETE /api/v2/inventory/:id` - Delete inventory item

- **Session Endpoints**:
  - `GET /api/v2/sessions` - List sessions with pagination and sorting
  - `POST /api/v2/sessions` - Create new session
  - `GET /api/v2/sessions/:id` - Get specific session
  - `PUT /api/v2/sessions/:id` - Update session
  - `DELETE /api/v2/sessions/:id` - Delete session

For detailed API documentation, see the `/docs/api.md` file.

## 🚀 Deployment

The application is designed to be deployed on Cloudflare's global network:

```bash
# Build the application
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

The deployment script (deploy.ps1) is already configured to work with the project structure.

## 📚 Additional Resources

- [Development Plan](/development-plan/README.md) - Detailed phased development approach
- [Technical Documentation](/docs/technical.md) - Technical specifications and patterns
- [Architecture Overview](/docs/architecture.md) - System architecture and component relationships
- [Mobile Design Guidelines](/docs/mobile-first-theme.md) - Mobile-first design approach

## 🏢 Project Architecture

SeshTracker is a modern serverless application built with:
- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Cloudflare Workers (Hono framework)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Auth**: Token-based via Kush.Observer integration

### Directory Structure

```
seshtrackerv2/
├── src/                      # Source code
│   ├── react-app/           # React frontend application
│   │   ├── components/      # UI components by feature
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Top-level pages
│   │   ├── contexts/        # React contexts (auth, etc.)
│   │   └── utils/           # Frontend utilities
│   │
│   ├── api/                 # Backend API using Hono
│   │   ├── routes/          # API route handlers
│   │   ├── middleware/      # Request middlewares
│   │   └── kush-proxy/      # Kush.Observer integrations
│   │
│   ├── worker/              # Cloudflare Worker specific code
│   ├── types/               # TypeScript type definitions
│   └── config/              # Configuration files
│
├── public/                   # Static assets
├── migrations/               # D1 database migrations
├── docs/                     # Documentation
│   ├── architecture/        # System architecture
│   ├── api/                 # API documentation
│   └── config/              # Configuration reference
└── scripts/                  # Automation scripts
```

For more details, see:
- [Architecture Documentation](docs/architecture/SeshTracker_Architecture_and_Integration.md)
- [API Reference](docs/api/README.md)
- [Development Guidelines](docs/CONTRIBUTING.md)

### Deployment

The application deploys to:
- **Frontend**: Cloudflare Pages (`sesh-tracker.com`)
- **API**: Cloudflare Workers (proxied via Pages as `/api/*`)
- **Database**: Cloudflare D1

# SeshTracker Production Deployment Guide

This guide provides comprehensive instructions for deploying the SeshTracker application to production.

## 🚀 Quick Deployment

### Using the Deployment Script

For a quick deployment to production, use the provided deployment script:

**Linux/macOS**:
```bash
./deploy.sh
```

**Windows**:
```powershell
.\deploy.ps1
```

## 📋 Manual Deployment Steps

If you prefer to deploy manually or need more control over the process, follow these steps:

### 1. Prepare Your Environment

Ensure you have the following prerequisites installed:
- Node.js (v16+)
- npm (v7+)
- Git
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 2. Get the Latest Code

```bash
# Pull the latest changes from the main branch
git pull origin main

# If you have local changes to save first
git add .
git commit -m "Your descriptive commit message"
git push origin main
```

### 3. Install Dependencies

```bash
# Clean install production dependencies
npm ci --production
```

### 4. Build the Application

```bash
# Build the frontend
npm run build
```

### 5. Verify the Build

```bash
# Run linting checks
npm run lint

# Run TypeScript type checks
npm run typecheck
```

### 6. Deploy to Cloudflare Workers

```bash
# Deploy to production environment
npx wrangler deploy --env production
```

### 7. Verify the Deployment

Check that the production site and API are functioning correctly:

- Visit [https://sesh-tracker.com](https://sesh-tracker.com)
- Check the API health endpoint: [https://sesh-tracker.com/api/health](https://sesh-tracker.com/api/health)

## ⚙️ Configuration

### Wrangler Configuration

The `wrangler.toml` file contains the configuration for the Cloudflare Worker deployment. Ensure the production environment is properly configured:

```toml
[env.production]
name = "seshtrackerv2"
route = "https://sesh-tracker.com/api/*"
zone_id = "your_zone_id"

# ... other configuration options
```

### Environment Variables

Production-specific environment variables are stored in Cloudflare's dashboard. To update them:

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Workers & Pages > seshtrackerv2
3. Go to Settings > Variables
4. Update the environment variables as needed

Critical environment variables include:
- `KUSH_API_URL`
- `KUSH_API_KEY`
- `AUTH_API_URL`

## 🔄 Rollback Procedure

If issues occur after deployment, you can roll back to a previous version:

1. Find the version ID you want to roll back to:
   ```bash
   npx wrangler versions list
   ```

2. Roll back to that version:
   ```bash
   npx wrangler rollback --version=VERSION_ID
   ```

## 🔍 Troubleshooting

### Common Issues

1. **Deployment fails with authentication errors**:
   - Ensure you're logged in with `wrangler login`
   - Check your account permissions in Cloudflare

2. **API requests failing**:
   - Verify your environment variables in Cloudflare
   - Check CORS settings if browser requests are failing
   - Look at the Worker logs in Cloudflare dashboard

3. **Frontend build issues**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm ci`
   - Check for TypeScript errors with `npm run typecheck`

### Viewing Logs

Monitor Worker logs in Cloudflare Dashboard:
1. Navigate to Workers & Pages > seshtrackerv2
2. Go to Logs > Real-time logs

## 📊 Monitoring Production

After deployment, monitor the application using:

- Cloudflare Analytics (in the Cloudflare Dashboard)
- Worker Exception monitoring
- HTTP status codes via Cloudflare analytics

## 🔐 Security Considerations

- Never commit `.env` files to the repository
- Ensure all authentication endpoints are properly secured
- Verify CORS settings are correctly configured
- Use production-specific API keys

---

## 💡 Tips for Smooth Deployments

1. **Deploy during off-peak hours** to minimize user impact
2. **Test in production-like environment** before deploying
3. **Monitor closely** for the first 15-30 minutes after deployment
4. **Have a rollback plan** ready in case of issues
5. **Document all deployment issues** for future reference
