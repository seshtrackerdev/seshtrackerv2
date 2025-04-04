# Project Organization Rules

## Directory Structure
- `/src/` - All source code
  - `/src/react-app/` - Frontend React application
    - `/src/react-app/components/` - React components (one component per file)
    - `/src/react-app/hooks/` - Custom React hooks
    - `/src/react-app/assets/` - Frontend assets (SVGs, small images)
  - `/src/api/` - Backend API code

- `/public/` - Static assets served directly
  - `/public/images/` - Image assets (no duplication)
  - `/public/legacy/` - Single location for old version (if needed)

## File Organization
1. No duplicate files across directories
2. Large binary files (images, etc.) stored in one location only
3. CSS files should be co-located with their components
4. Legacy code kept in single `/public/legacy/` directory

## Naming Conventions
1. React components: PascalCase (e.g., `LandingPage.tsx`)
2. Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
3. CSS modules named after component (e.g., `LandingPage.module.css`)
4. Utilities: camelCase (e.g., `formatDate.ts`)

## Clean-up Tasks
1. Remove `.oldseshtracker/` directory (merge to `/public/legacy/`)
2. Consolidate duplicate images
3. Move all legacy code to single `/public/legacy/` location
4. Standardize CSS approach (CSS modules preferred) 