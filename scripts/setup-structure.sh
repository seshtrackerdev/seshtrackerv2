#!/bin/bash

# SeshTracker Ecosystem Structure Setup Script
# This script creates the directory structure for the SeshTracker ecosystem

echo "Creating SeshTracker ecosystem directory structure..."

# Root directories
mkdir -p .cursor/{WORKFLOWS,REFERENCES}
mkdir -p src/react-app/components/{dashboard,inventory,sessions,common,layouts}
mkdir -p src/react-app/hooks
mkdir -p src/react-app/contexts
mkdir -p src/react-app/utils
mkdir -p src/api/{routes,middleware,kush-proxy}
mkdir -p src/types
mkdir -p src/config
mkdir -p tests/{unit,integration,e2e,_fixtures}
mkdir -p docs
mkdir -p migrations
mkdir -p public/{images,branding,legacy}

# Create test fixture directories
mkdir -p tests/_fixtures

# Ensure all src directories have an index.js to prevent git ignoring empty dirs
touch src/react-app/components/{dashboard,inventory,sessions,common,layouts}/index.js
touch src/react-app/hooks/index.js
touch src/react-app/contexts/index.js
touch src/react-app/utils/index.js
touch src/api/{routes,middleware,kush-proxy}/index.js
touch src/types/index.js
touch src/config/index.js

# Create .cursor reference files
touch .cursor/WORKFLOWS/auth-flow.md
touch .cursor/WORKFLOWS/component-creation.md
touch .cursor/REFERENCES/strain-component.jsx
touch .cursor/REFERENCES/api-client.js

# Create basic README files in key directories
echo "# React Components" > src/react-app/components/README.md
echo "# API Routes" > src/api/routes/README.md
echo "# TypeScript Types" > src/types/README.md
echo "# Test Fixtures" > tests/_fixtures/README.md
echo "# Database Migrations" > migrations/README.md

# Create .env.example
cat > .env.example << EOL
# SeshTracker Environment Configuration

# Kush.Observer API
KUSH_OBSERVER_URL=https://kush.observer/api/v1

# Environment
ENVIRONMENT=development # or production

# Deployment configuration
SITE_URL=http://localhost:3000

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_NOTIFICATIONS=false
EOL

echo "Creating basic configuration files..."

# Create environment validation 
cat > src/config/env.js << EOL
/**
 * Environment configuration and validation
 */

const getEnvironment = () => {
  return process.env.ENVIRONMENT || 'development';
};

const getApiBaseUrl = () => {
  return process.env.KUSH_OBSERVER_URL || 'https://kush.observer/api/v1';
};

const getSiteUrl = () => {
  return process.env.SITE_URL || 'http://localhost:3000';
};

// Feature flags
const isAnalyticsEnabled = () => {
  return process.env.ENABLE_ANALYTICS === 'true';
};

const isNotificationsEnabled = () => {
  return process.env.ENABLE_NOTIFICATIONS === 'true';
};

// Validate required environment variables
const validateEnv = () => {
  const required = ['KUSH_OBSERVER_URL', 'ENVIRONMENT'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(\`Missing required environment variables: \${missing.join(', ')}\`);
    return false;
  }
  
  return true;
};

module.exports = {
  getEnvironment,
  getApiBaseUrl,
  getSiteUrl,
  isAnalyticsEnabled,
  isNotificationsEnabled,
  validateEnv
};
EOL

echo "Creating README.md files..."

# Create directory READMEs for key sections
cat > .cursor/README.md << EOL
# AI Assistant Resources

This directory contains resources for AI assistants working with the SeshTracker codebase.

- **WORKFLOWS/** - Common development workflows
- **REFERENCES/** - Code snippets and reference implementations
EOL

cat > docs/README.md << EOL
# SeshTracker Documentation

This directory contains documentation for the SeshTracker ecosystem:

- **ARCHITECTURE.md** - System architecture overview
- **API.md** - API documentation
- **KUSH_INTEGRATION.md** - Kush.Observer integration
EOL

cat > tests/README.md << EOL
# SeshTracker Tests

This directory contains tests for the SeshTracker ecosystem:

- **unit/** - Unit tests for individual components and functions
- **integration/** - Integration tests for API endpoints
- **e2e/** - End-to-end tests for user flows
- **_fixtures/** - Mock data for testing
EOL

echo "Structure setup complete!"
echo "Next steps:"
echo "1. Copy existing files to their new locations"
echo "2. Update import paths"
echo "3. Run tests to verify everything works" 