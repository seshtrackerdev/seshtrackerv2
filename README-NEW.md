# Sesh-Tracker.com

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-latest-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.17-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

> A comprehensive platform for tracking, analyzing, and optimizing your cannabis consumption habits.

![Sesh-Tracker Banner](public/banner.jpg)

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
   - Tech Stack: Vite, React 18.3.1, TypeScript, TailwindCSS 3.4.17

2. **Kush.observer** - Authentication and account management
   - Manages user authentication, account creation, and access control
   - Tech Stack: Cloudflare Workers, OpenAuth, Cloudflare D1 + KV Storage

3. **My-Cannabis-Tracker.com** - Administrative dashboard
   - Internal tool for platform management and monitoring
   - Tech Stack: Astro, Shadcn UI, TailwindCSS, TypeScript

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
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000)

## 📱 User Journey

### Landing Page
Visitors are greeted with an educational and engaging entry point showcasing the platform's value. Interactive elements preview key functionality, and clear CTAs guide users to sign up or explore further.

### Authentication
Users can easily create an account or log in using the secure authentication system powered by Kush.observer.

### Dashboard
After authentication, users are presented with a customizable dashboard that serves as their command center. The dashboard offers different layout templates:

- **Basic Layout**: Minimalist interface for beginners
- **Advanced Layout**: Feature-rich dashboard for power users
- **Start From Scratch**: Fully customizable blank canvas
- **Import Layout**: Upload previously exported configurations

### Core Functionality
- **Session Logging**: Record and categorize consumption sessions
- **Inventory Management**: Track products, stock levels, and consumption rates
- **Analytics**: Visualize patterns and gain insights from personal data

## 🛠️ Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature-specific components and logic
├── hooks/            # Custom React hooks
├── pages/            # Route components for each page
├── services/         # API services and data access
├── types/            # TypeScript type definitions
├── utils/            # Utility functions and helpers
├── context/          # React context providers
└── styles/           # Global styles and Tailwind imports
```

## 🔄 Development Workflow

The project follows a phased development approach:

1. **Foundation**: Core infrastructure, authentication, and UI components
2. **Core Functionality**: Session logging, inventory management, basic dashboard
3. **Enhanced Features**: Widget system, advanced analytics, rich session tracking
4. **Refinement**: Performance optimization, UX enhancements, mobile optimization

Refer to the `/development-plan` directory for detailed phase information.

## 🚀 Deployment

The application is designed to be deployed on Cloudflare's global network:

```bash
# Build the application
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

## 👥 Contributing

We welcome contributions to Sesh-Tracker.com! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get involved.

## 📄 License

Sesh-Tracker.com is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Additional Resources

- [Development Plan](/development-plan/README.md) - Detailed phased development approach
- [Technical Documentation](/docs/technical.md) - Technical specifications and patterns
- [Architecture Overview](/docs/architecture.md) - System architecture and component relationships
- [Mobile Design Guidelines](/docs/mobile-first-theme.md) - Mobile-first design approach 