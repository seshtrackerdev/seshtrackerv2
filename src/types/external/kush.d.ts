/**
 * Type definitions for Kush.Observer integration
 */

declare namespace KushObserver {
  /**
   * User profile from Kush.Observer
   */
  export interface UserProfile {
    id: string;
    email: string;
    name?: string;
    subscription: SubscriptionInfo;
    permissions: string[];
    createdAt: string;
    lastLogin: string;
  }

  /**
   * Subscription information
   */
  export interface SubscriptionInfo {
    tier: 'free' | 'premium' | 'professional';
    expiresAt: string; // ISO date
    features: string[];
    maxSessions?: number;
    maxInventoryItems?: number;
  }

  /**
   * Authentication token payload
   */
  export interface AuthToken {
    userId: string;
    exp: number; // Expiration timestamp
    iat: number; // Issued at timestamp
    scope: string[];
  }

  /**
   * Login response from Kush.Observer
   */
  export interface LoginResponse {
    token: string;
    user: UserProfile;
  }

  /**
   * Error response from Kush.Observer
   */
  export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
  }
}

export = KushObserver;
export as namespace KushObserver; 