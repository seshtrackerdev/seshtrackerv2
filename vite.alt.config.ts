import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// Add a timestamp to force cache invalidation
const timestamp = new Date().getTime();

export default defineConfig({
  // Only use React plugin, omit Cloudflare plugin to avoid WebSocket issues
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Add cache-busting parameter to file names
        entryFileNames: `assets/[name]-${timestamp}-[hash].js`,
        chunkFileNames: `assets/[name]-${timestamp}-[hash].js`,
        assetFileNames: `assets/[name]-${timestamp}-[hash].[ext]`,
      },
    },
  },
  // Explicitly set the port to 4000
  server: {
    port: 4000,
    strictPort: true,
    host: true, // Listen on all addresses
    open: true, // Auto-open browser
  }
}); 