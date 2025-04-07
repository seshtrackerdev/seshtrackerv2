import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import topLevelAwait from "vite-plugin-top-level-await";
import react from "@vitejs/plugin-react";

// Import Cloudflare Workers types
import type { D1Database } from "@cloudflare/workers-types";

// Import our standardized domains
import { ENDPOINTS } from "./src/config/ecosystem";

// Configuration with real database connections
export default defineConfig({
  // Base URL is / for production
  base: '/',
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    ViteMinifyPlugin({}),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    minify: 'terser',
    target: 'es2022',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the wrangler dev server with detailed logging
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
    host: true,
  },
  // Output to dist directory
  assetsInclude: ['**/*.md'],
  publicDir: 'public',
  // Define environment variables for production
  define: {
    'process.env.VITE_AUTH_API_URL': JSON.stringify(`${ENDPOINTS.KUSHOBSERVER.PRODUCTION}/api`),
    'process.env.VITE_APP_ENV': JSON.stringify('production')
  },
});
