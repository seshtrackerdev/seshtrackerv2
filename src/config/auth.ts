/**
 * Authentication configuration for Kush.Observer integration
 */
export const AUTH_CONFIG = {
  // This is the URL of the KushObserver service used for authentication
  API_URL: 'https://kushobserver.tmultidev.workers.dev/api',
  
  // Development API URL (used in dev environment)
  DEV_API_URL: 'https://kushobserver.tmultidev.workers.dev/api',
  
  // These are the endpoints for various authentication and user-related operations
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: '/direct-login',
    REGISTER: '/direct-register',
    VERIFY: '/verify',
    REFRESH_TOKEN: '/auth/refresh-token',
    RESET: '/reset',
    PASSWORD_RESET: '/password-reset',
    
    // User data endpoints
    PROFILE: '/protected/user-profile',
    USER_PREFERENCES: '/user/preferences',
    USER_ADVANCED_PREFERENCES: '/user/advanced-preferences',
    SUBSCRIPTION: '/subscription',
    PASSWORD_CHANGE: '/password-change',
    
    // Content endpoints
    SESSIONS: '/protected/sessions',
    INVENTORY: '/protected/inventory',
    STRAINS: '/strains',
    
    // Test environment endpoints
    SANDBOX_USER: '/testing/create-sandbox-user',
    RESET_SANDBOX: '/testing/reset-sandbox'
  },
  
  // Keys used for storing authentication data in localStorage
  STORAGE_KEYS: {
    TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REFRESH_TOKEN: 'refresh_token'
  }
}; 