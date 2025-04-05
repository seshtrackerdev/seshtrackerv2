# Technical Specifications & Patterns

This document outlines key technical specifications, configurations, and established patterns within the project.

## Frontend Stack

- **Framework/Library:** React 19
- **Build Tool:** Vite 6
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Routing:** React Router 7
- **State Management:** (Currently using standard React state, e.g., `useState`. Document if a dedicated library like Zustand or Redux Toolkit is added.)

## Backend Stack

- **Framework:** Hono 4
- **Runtime:** Cloudflare Workers
- **Language:** TypeScript 5

## Styling: Tailwind CSS v4 Configuration

This project utilizes Tailwind CSS v4. A critical configuration aspect involves how Tailwind integrates with the build process via PostCSS, especially when using Vite.

**Problem:** Tailwind v4 separated its PostCSS plugin into a dedicated package, `@tailwindcss/postcss`. Directly using the `tailwindcss` package as a PostCSS plugin in `vite.config.ts` (as was common in older versions or other setups) will result in build errors like:

```
[postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin... install `@tailwindcss/postcss` and update your PostCSS configuration.
```

**Solution:** Ensure your `vite.config.ts` explicitly imports and uses `@tailwindcss/postcss` within the `css.postcss.plugins` array:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/postcss'; // <-- Correct import
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react(), cloudflare()],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // <-- Use the imported plugin
        autoprefixer
      ],
    },
  },
});
```

**Key Files:**

- `tailwind.config.js`: Main Tailwind configuration (content paths, theme extensions, plugins).
- `src/react-app/index.css`: Global CSS file where `@tailwind` directives are included.
- `src/react-app/main.tsx`: Application entry point where `index.css` must be imported.
- `vite.config.ts`: Vite configuration handling the PostCSS integration.

## Established Patterns

*(Document common coding patterns, component structures, or architectural decisions here as they emerge. E.g., API interaction patterns, state management strategies, component libraries used, etc.)*
