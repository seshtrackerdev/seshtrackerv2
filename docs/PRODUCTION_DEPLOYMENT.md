# 🚀 SeshTracker Production Deployment Guide

This comprehensive guide details the process for deploying SeshTracker to production, focusing exclusively on the live environment.

## 📋 Prerequisites

Before starting the deployment process, ensure you have:

- Access to the SeshTracker GitHub repository
- Cloudflare Workers account access
- Cloudflare API token with Workers deployment permissions
- Node.js (v16+) and npm (v7+) installed
- Wrangler CLI (`npm install -g wrangler`)
- Administrator access to the production domain

## 🔄 Deployment Process

### 1. Code Preparation

```bash
# Clone the repository (if not already done)
git clone https://github.com/your-org/seshtrackerv2.git
cd seshtrackerv2

# Make sure you're on the main branch
git checkout main

# Pull the latest changes
git pull origin main
```

### 2. Configuration Verification

Before deploying, verify the production configuration:

1. Check `wrangler.toml` for correct production settings:

```toml
[env.production]
name = "seshtrackerv2"
workers_dev = false
route = "https://sesh-tracker.com/api/*"
zone_id = "your_zone_id"
```

2. Verify environment variables are set in Cloudflare dashboard:
   - `KUSH_API_URL`
   - `KUSH_API_KEY`
   - `AUTH_API_URL`
   - `NODE_ENV=production`

3. Ensure `src/config/ecosystem.ts` has the correct production endpoints:
   - Kush.Observer: `https://kush.observer`
   - SeshTracker: `https://sesh-tracker.com`
   - AdminDash: `https://my-cannabis-tracker.com`

### 3. Build and Deploy

Run the deployment script or follow these steps:

```bash
# Install dependencies
npm ci --production

# Build the frontend
npm run build

# Verify build
npm run lint
npm run typecheck

# Deploy to Cloudflare Workers
npx wrangler deploy --env production
```

### 4. Verify Deployment

After deployment, verify that:

1. The frontend is accessible at https://sesh-tracker.com
2. The API is responding at https://sesh-tracker.com/api/health
3. Authentication with Kush.Observer is working
4. Test login with test account: tester@email.com / Superbowl9-Veggie0-Credit4-Watch1

## ⚠️ Common Issues and Solutions

### Authentication Issues

If users cannot authenticate:

1. Check the Kush.Observer integration in the browser console
2. Verify authentication endpoints are correct in `src/config/auth.ts`
3. Check that CORS is properly configured for production domains
4. Validate JWT token flow in `useAuth.tsx`

### API Connection Problems

If frontend can't connect to the API:

1. Verify the Pages project is correctly proxying `/api/*` to the Worker
2. Check Worker route configuration in Cloudflare dashboard
3. Test the API endpoints directly with curl or Postman
4. Check error logs in Cloudflare dashboard

### Database Connectivity

If database operations fail:

1. Verify D1 database binding in Cloudflare dashboard
2. Check that migration version matches between local and production
3. Test simple database queries through the dashboard

## 📊 Post-Deployment Checks

After successful deployment, perform these final checks:

1. **User Flow Testing**:
   - Complete user registration process
   - Test login/logout cycle
   - Create and retrieve sessions
   - Manage inventory items

2. **Performance Check**:
   - Test load times on mobile and desktop
   - Verify API response times
   - Check for any console errors

3. **Security Verification**:
   - Ensure authentication tokens are properly transmitted
   - Verify protected routes require authentication
   - Check CORS headers are correctly set

## 🔄 Rollback Plan

If critical issues are discovered after deployment:

1. Identify the last stable worker version:
   ```bash
   npx wrangler versions list
   ```

2. Roll back to that version:
   ```bash
   npx wrangler rollback --version=VERSION_ID
   ```

3. For frontend issues, you can also roll back the Pages deployment:
   - Go to Cloudflare dashboard > Pages > seshtracker
   - Select Deployments > Select previous deployment > Revert to this version

## 📅 Deployment Schedule

For optimal results, schedule deployments:

- **Best times**: Monday-Wednesday, 9AM-11AM PST
- **Avoid**: Fridays, weekends, and peak usage hours (4PM-8PM PST)
- **Post-deployment monitoring**: 30 minutes minimum

## 🔐 Security Procedures

1. **After deployment**:
   - Rotate any deployment-specific API keys
   - Verify no sensitive data appears in logs
   - Perform a quick security scan of exposed endpoints

2. **Access management**:
   - Audit deployment access permissions quarterly
   - Use scoped access tokens for CI/CD deployments

## 📝 Deployment Documentation

For each production deployment, document:

1. Date and time of deployment
2. Version deployed
3. Changes included in the deployment
4. Any issues encountered and their resolution
5. Performance metrics before and after deployment

## 📞 Support Contacts

If issues arise during deployment:

- **Primary Contact**: DevOps Lead (devops@seshtracker.com)
- **Secondary**: CTO (cto@seshtracker.com)
- **Cloudflare Issues**: Cloudflare Support Portal or support@cloudflare.com
- **Kush.Observer Integration**: api-support@kushobserver.com 