# Fix: Tailwind CSS v4 PostCSS Configuration Error with Vite

**Date:** 2025-04-05 *(Adjust date as needed)*

## Problem Description

After upgrading to or setting up the project with Tailwind CSS v4, the Vite development server (`npm run dev`) would fail with errors related to PostCSS processing. Initial symptoms might include Tailwind utility classes (like `rounded-lg`) not being applied and appearing as errors in the browser console or Vite overlay.

The primary error message observed in the Vite console output was:

```
[plugin:vite:css] [postcss] It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin. The PostCSS plugin has moved to a separate package, so to continue using Tailwind CSS with PostCSS you'll need to install `@tailwindcss/postcss` and update your PostCSS configuration.
```

This indicated that the PostCSS setup within Vite was incorrectly configured for Tailwind CSS v4.

## Investigation Steps

1.  **Verified Tailwind Config (`tailwind.config.js`):** Checked that the `content` array correctly included paths to source files (`./src/**/*.{js,ts,jsx,tsx}`, etc.) where Tailwind classes were used.
2.  **Verified CSS Import:** Ensured the main CSS file (`src/react-app/index.css`) containing the `@tailwind` directives was correctly imported into the application entry point (`src/react-app/main.tsx`).
3.  **Checked Tailwind Directives:** Confirmed that `src/react-app/index.css` contained `@tailwind base;`, `@tailwind components;`, and `@tailwind utilities;`.
4.  **Inspected Vite Config (`vite.config.ts`):** Initially, the config lacked explicit PostCSS settings. An attempt to add `tailwindcss` directly to `css.postcss.plugins` resulted in the error mentioned above.

## Solution

Tailwind CSS v4 requires using the dedicated `@tailwindcss/postcss` package for PostCSS integration, not the main `tailwindcss` package.

The fix involved updating `vite.config.ts` to explicitly configure PostCSS with the correct plugin:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
// Import the correct PostCSS plugin for Tailwind v4
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react(), cloudflare()],
  css: {
    postcss: {
      plugins: [
        tailwindcss, // Use the imported @tailwindcss/postcss plugin
        autoprefixer
      ],
    },
  },
});
```

After applying this change and restarting the Vite development server, the PostCSS errors were resolved, and Tailwind utility classes were correctly processed and applied.

## Related Documentation

- See `docs/technical.md` for general Tailwind configuration details. 