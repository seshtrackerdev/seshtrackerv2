@echo off
echo Setting up environment variables...
set VITE_AUTH_API_URL=https://api.kushobserver.com
set VITE_APP_ENV=production
set VITE_APP_NAME=SeshTracker
set VITE_APP_VERSION=2.0

echo Starting SeshTracker application...
npm run dev 