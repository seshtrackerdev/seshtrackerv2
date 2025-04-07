/**
 * Authentication configuration for Kush.Observer integration
 */
import { API, ENDPOINTS } from './ecosystem';

export const AUTH_CONFIG = {
  // Production API URL (from ecosystem config)
  API_URL: ENDPOINTS.KUSHOBSERVER.PRODUCTION + '/api/auth',
  
  // Development API URL (from ecosystem config)
  DEV_API_URL: ENDPOINTS.KUSHOBSERVER.DEVELOPMENT + '/api/auth',
  
  // These are the endpoints for various authentication and user-related operations
  ENDPOINTS: {
    // Authentication endpoints
    LOGIN: '/direct-login',
    REGISTER: '/direct-register',
    VERIFY: '/validate-token',
    REFRESH_TOKEN: '/refresh-token',
    RESET: '/reset',
    PASSWORD_RESET: '/password-reset',
    
    // User data endpoints
    PROFILE: '/user/profile',
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