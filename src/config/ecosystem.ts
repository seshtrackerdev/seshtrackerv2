/**
 * SeshTracker Ecosystem Configuration
 * 
 * This file serves as the single source of truth for all URLs, bindings, and configuration
 * related to the SeshTracker ecosystem components:
 * - Sesh-Tracker.com (Frontend + Worker)
 * - Kush.Observer (Auth + User Management)
 * - My-Cannabis-Tracker.com (Admin Dashboard)
 */

/**
 * Application Endpoints
 */
export const ENDPOINTS = {
  /**
   * Main application - Sesh-Tracker.com
   */
  SESHTRACKER: {
    /** Production environment */
    PRODUCTION: 'https://sesh-tracker.com',
    /** Staging environment */
    STAGING: 'https://staging.sesh-tracker.com',
    /** Development environment */
    DEVELOPMENT: 'https://dev.sesh-tracker.com',
    /** Worker URL (for direct worker access if needed) */
    WORKER: 'https://seshtrackerv2.workers.dev'
  },
  
  /**
   * Authentication & user management - Kush.Observer
   */
  KUSHOBSERVER: {
    /** Production environment */
    PRODUCTION: 'https://kush.observer',
    /** Staging environment */
    STAGING: 'https://staging.kush.observer',
    /** Development environment */
    DEVELOPMENT: 'https://dev.kush.observer',
    /** Worker URL (for direct worker access if needed) */
    WORKER: 'https://kushobserver.workers.dev',
    /** Legacy development worker URL - to be phased out */
    LEGACY_DEV: 'https://kushobserver.tmultidev.workers.dev'
  },
  
  /**
   * Admin dashboard - My-Cannabis-Tracker.com
   */
  MYCANNABIS: {
    /** Production environment */
    PRODUCTION: 'https://my-cannabis-tracker.com',
    /** Staging environment */
    STAGING: 'https://staging.my-cannabis-tracker.com',
    /** Development environment  */
    DEVELOPMENT: 'https://dev.my-cannabis-tracker.com',
    /** Worker URL (for direct worker access if needed) */
    WORKER: 'https://seshadmindash.workers.dev'
  }
};

/**
 * API Endpoints
 */
export const API = {
  /**
   * SeshTracker API endpoints
   */
  SESHTRACKER: {
    /** Base API URL */
    BASE: (env = 'PRODUCTION') => `${ENDPOINTS.SESHTRACKER[env]}/api`,
    /** Sessions API */
    SESSIONS: (env = 'PRODUCTION') => `${API.SESHTRACKER.BASE(env)}/sessions`,
    /** Inventory API */
    INVENTORY: (env = 'PRODUCTION') => `${API.SESHTRACKER.BASE(env)}/inventory`,
    /** Profile API */
    PROFILE: (env = 'PRODUCTION') => `${API.SESHTRACKER.BASE(env)}/profile`
  },
  
  /**
   * Kush.Observer API endpoints
   */
  KUSHOBSERVER: {
    /** Base API URL */
    BASE: (env = 'PRODUCTION') => `${ENDPOINTS.KUSHOBSERVER[env]}/api`,
    /** Authentication API */
    AUTH: {
      /** Login endpoint */
      LOGIN: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/auth/login`,
      /** Token validation endpoint */
      VALIDATE: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/auth/validate-token`,
      /** Token refresh endpoint */
      REFRESH: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/auth/refresh-token`,
      /** Password reset endpoint */
      RESET: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/password-reset`,
      /** Password change endpoint */
      CHANGE: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/password-change`
    },
    /** User profile API */
    PROFILE: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/profile`,
    /** User subscription API */
    SUBSCRIPTION: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/subscription`,
    /** System health endpoint */
    HEALTH: (env = 'PRODUCTION') => `${API.KUSHOBSERVER.BASE(env)}/health`
  },
  
  /**
   * My-Cannabis-Tracker API endpoints
   */
  MYCANNABIS: {
    /** Base API URL */
    BASE: (env = 'PRODUCTION') => `${ENDPOINTS.MYCANNABIS[env]}/api/v3`,
    /** Admin API endpoints */
    ADMIN: {
      /** User management */
      USERS: (env = 'PRODUCTION', userId?: string) => 
        userId 
          ? `${API.MYCANNABIS.BASE(env)}/admin/users/${userId}` 
          : `${API.MYCANNABIS.BASE(env)}/admin/users`,
      /** User report */
      USER_REPORT: (env = 'PRODUCTION', userId: string) => 
        `${API.MYCANNABIS.BASE(env)}/admin/users/${userId}/report`,
      /** Subscription management */
      SUBSCRIPTION: (env = 'PRODUCTION', userId: string) => 
        `${API.MYCANNABIS.BASE(env)}/admin/users/${userId}/subscription`,
      /** Get subscription options */
      SUBSCRIPTION_OPTIONS: (env = 'PRODUCTION') => 
        `${API.MYCANNABIS.BASE(env)}/admin/subscriptions/options`,
      /** System health status */
      HEALTH: (env = 'PRODUCTION') => 
        `${API.MYCANNABIS.BASE(env)}/admin/system/health`
    }
  }
};

/**
 * Database Bindings
 */
export const DATABASE_BINDINGS = {
  /** SeshTracker D1 database */
  SESHTRACKER: {
    /** D1 binding name */
    BINDING: 'DB',
    /** Database name */
    NAME: 'seshtracker-d1-new',
    /** Database ID */
    ID: '0ac38748-f2cd-4980-8e2d-8c3a92729169',
    /** Migrations table */
    MIGRATIONS_TABLE: 'd1_migrations',
    /** Migrations directory */
    MIGRATIONS_DIR: 'migrations'
  },
  
  /** Kush.Observer D1 database */
  KUSHOBSERVER: {
    /** Production database info - for reference only */
    PRODUCTION: {
      BINDING: 'KUSH_DB',
      NAME: 'kushobserver-d1-prod'
    }
  }
};

/**
 * KV Namespace Bindings
 */
export const KV_BINDINGS = {
  /** SeshTracker KV bindings */
  SESHTRACKER: {
    /** User data cache */
    USER_CACHE: 'USER_CACHE',
    /** Session data cache */
    SESSION_CACHE: 'SESSION_CACHE'
  },
  
  /** Kush.Observer KV bindings */
  KUSHOBSERVER: {
    /** Auth token cache */
    AUTH_TOKENS: 'AUTH_TOKENS',
    /** User session cache */
    SESSIONS: 'SESSIONS'
  }
};

/**
 * Feature flags and configuration
 */
export const FEATURE_CONFIG = {
  /** Authentication refresh token settings */
  AUTH: {
    /** Token expiration in seconds */
    TOKEN_EXPIRY: 3600, // 1 hour
    /** Refresh token expiration in seconds */
    REFRESH_TOKEN_EXPIRY: 2592000, // 30 days
    /** Grace period to refresh before expiry (seconds) */
    REFRESH_GRACE_PERIOD: 300 // 5 minutes
  },
  
  /** Rate limiting configuration */
  RATE_LIMITS: {
    /** Auth token validation requests per minute */
    TOKEN_VALIDATION: 60,
    /** API requests per minute (unauthenticated) */
    UNAUTHENTICATED: 30,
    /** API requests per minute (authenticated) */
    AUTHENTICATED: 120
  }
};

/**
 * Helper function to get the appropriate URL based on the current environment
 * @param component Which ecosystem component
 * @param environment Which environment (defaults to process.env.NODE_ENV)
 * @returns The appropriate URL
 */
export function getEndpoint(
  component: 'SESHTRACKER' | 'KUSHOBSERVER' | 'MYCANNABIS',
  environment = getEnvironment()
): string {
  return ENDPOINTS[component][environment];
}

/**
 * Get current environment based on process.env.NODE_ENV
 * Defaults to PRODUCTION if not specified
 */
export function getEnvironment(): 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT' {
  const env = process.env.NODE_ENV || 'production';
  
  if (env === 'development') return 'DEVELOPMENT';
  if (env === 'staging') return 'STAGING';
  return 'PRODUCTION';
}

export default {
  ENDPOINTS,
  API,
  DATABASE_BINDINGS,
  KV_BINDINGS,
  FEATURE_CONFIG,
  getEndpoint,
  getEnvironment
}; 