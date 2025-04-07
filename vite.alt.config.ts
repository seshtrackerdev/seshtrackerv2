import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/postcss';
import autoprefixer from 'autoprefixer';
import { resolve } from 'path';

// Add a timestamp to force cache invalidation
const timestamp = new Date().getTime();

export default defineConfig({
  // Only use React plugin, omit Cloudflare plugin to avoid WebSocket issues
  plugins: [
    react(),
    // Custom plugin to handle API routes
    {
      name: 'api-routes-handler',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Check if this is an API request
          if (req.url && req.url.startsWith('/api/')) {
            try {
              // Import the API handler dynamically
              const apiModule = await import('./src/api/index.js');
              const app = apiModule.default;
              
              // Create a fetch-like Request object that hono can understand
              const url = new URL(req.url, `http://${req.headers.host}`);
              const headers = new Headers();
              
              // Copy request headers
              Object.entries(req.headers).forEach(([key, value]) => {
                if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
              });
              
              // Create body from request
              let body: BodyInit | null = null;
              if (req.method !== 'GET' && req.method !== 'HEAD') {
                const chunks: Buffer[] = [];
                for await (const chunk of req) {
                  chunks.push(chunk);
                }
                body = Buffer.concat(chunks);
              }
              
              // Create a fetch Request
              const request = new Request(url.toString(), {
                method: req.method,
                headers,
                body
              });
              
              // Pass the request to the hono app
              const response = await app.fetch(request, {
                // Mock Cloudflare environment that might be expected by the app
                ASSETS: {
                  fetch: (req: Request) => new Response('Not found', { status: 404 })
                }
              });
              
              // Set status code
              res.statusCode = response.status;
              
              // Set headers
              response.headers.forEach((value, key) => {
                res.setHeader(key, value);
              });
              
              // Send body
              const responseBody = await response.text();
              res.end(responseBody);
              return;
            } catch (error) {
              console.error('API route error:', error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Internal Server Error' }));
              return;
            }
          }
          
          // For non-API routes, continue with the next middleware
          next();
        });
      }
    }
  ],
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
  resolve: {
    alias: {
      // Add any aliases needed for proper module resolution
      '@': resolve(__dirname, './src')
    }
  },
  // Explicitly set the port to 4000
  server: {
    port: 4000,
    strictPort: true,
    host: true, // Listen on all addresses
    open: true, // Auto-open browser
  }
}); 