# React + Vite + Hono + Cloudflare Workers

This template provides a minimal setup for building a React application with TypeScript and Vite, designed to run on Cloudflare Workers. It features hot module replacement, ESLint integration, and the flexibility of Workers deployments.

![React + TypeScript + Vite + Cloudflare Workers](https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/fc7b4b62-442b-4769-641b-ad4422d74300/public)

<!-- dash-content-start -->

## ✨ Key Features

- **Frontend:** [React 19](https://react.dev/) with [Vite 6](https://vite.dev/) for a fast development experience and build process.
- **Backend:** [Hono 4](https://hono.dev/) lightweight framework running on [Cloudflare Workers](https://developers.cloudflare.com/workers/) for serverless edge functions.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) for utility-first styling.
- **Routing:** [React Router 7](https://reactrouter.com/) for client-side navigation.
- **Language:** [TypeScript 5](https://www.typescriptlang.org/) for type safety.
- **Linting:** [ESLint 9](https://eslint.org/) configured for code quality.
- 🔥 Hot Module Replacement (HMR) via Vite.
- ⚡ Zero-config deployment potential to Cloudflare's global network.

<!-- dash-content-end -->

## 🏗️ Project Structure

- `src/react-app/`: Contains the React frontend application code (components, pages, hooks, main entry point, styles).
- `src/worker/`: Contains the Hono backend API code running on Cloudflare Workers.
- `public/`: Static assets served by Vite.
- `docs/`: Project documentation (architecture, technical details, status).
- `tasks/`: Task tracking and requirements.
- `fixes/`: Documentation for complex bug fixes.
- `vite.config.ts`: Vite build and development server configuration.
- `tailwind.config.js`: Tailwind CSS configuration.
- `wrangler.json`: Cloudflare Workers configuration.
- `package.json`: Project dependencies and scripts.

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

## 💻 Development

Start the Vite development server (frontend) and the Wrangler development server (backend worker) concurrently:

```bash
npm run dev
```

- The frontend application will typically be available at [http://localhost:3000](http://localhost:3000).
  *(Note: Vite will automatically use the next available port, like 3001, if port 3000 is already in use)*.
- The backend worker functions will be accessible through the frontend via relative paths (Vite proxies requests).

**Important: Tailwind CSS v4 Configuration**

This project uses Tailwind CSS v4. Correct PostCSS configuration is required in `vite.config.ts`. See `docs/technical.md` for details if you encounter Tailwind-related errors.

## Production & Deployment

Build the project for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Deploy to Cloudflare Workers:

```bash
npm run deploy # This runs build and then wrangler deploy
# or
# npx wrangler deploy dist/worker.js # Deploy manually after build
```

## 📚 Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [Hono Documentation](https://hono.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
