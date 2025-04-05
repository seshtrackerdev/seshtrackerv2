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
