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
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
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
