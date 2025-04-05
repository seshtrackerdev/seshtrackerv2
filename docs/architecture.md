# System Architecture

This document describes the high-level architecture of the SeshTrackerV3 application.

## Overview

The application follows a standard client-server model deployed on the edge:

- **Frontend:** A Single Page Application (SPA) built with React and Vite, responsible for the user interface and user interactions.
- **Backend:** A serverless API built with Hono running on Cloudflare Workers, handling business logic, data persistence (if applicable), and external API interactions.

## Components

- **React Client (`src/react-app/`)**
    - **Pages:** Top-level route components (e.g., `HomePage`, `ContactPage`).
    - **Components:** Reusable UI elements (e.g., `Button`, `Header`, `FormField`).
    - **Hooks:** Custom React hooks for reusable logic (e.g., `useAuth`).
    - **Services/API:** Functions for interacting with the backend API.
    - **Styles:** Global styles (`index.css`) and potentially component-specific styles.
- **Hono API Worker (`src/worker/`)**
    - **Routes:** API endpoint definitions.
    - **Middleware:** Request/response processing logic (e.g., authentication, logging).
    - **Services:** Business logic modules.

## Data Flow

1.  User interacts with the React frontend in the browser.
2.  Frontend components make API requests to relative paths (e.g., `/api/users`).
3.  Vite dev server (during development) or Cloudflare (in production) routes these requests to the Hono API Worker.
4.  The Worker processes the request, potentially interacting with data stores or external services.
5.  The Worker sends a JSON response back to the frontend.
6.  The frontend updates the UI based on the response.

## Deployment

- The frontend (React/Vite) is built into static assets (`dist/`).
- The backend (Hono/Worker) is built into a single JavaScript file (`dist/worker.js`).
- Wrangler deploys the worker script and maps routes to it. Cloudflare Pages can be used to serve the static frontend assets, configured to proxy API calls to the worker.

*(Add more detailed diagrams or specific component interactions as the application grows.)*
