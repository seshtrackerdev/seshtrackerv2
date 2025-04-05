import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';

// Add a timestamp to force cache invalidation
const timestamp = new Date().getTime();

export default defineConfig({
  plugins: [react(), cloudflare()],
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
});
