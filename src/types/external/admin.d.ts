/**
 * Type definitions for My-Cannabis-Tracker.com integration
 */

declare namespace MyCannabisTracker {
  /**
   * Admin report from My-Cannabis-Tracker.com
   */
  export interface AdminReport {
    userId: string;
    displayName?: string;
    email: string;
    sessionCount: number;
    inventoryItems: number;
    subscriptionStatus: string;
    subscriptionTier: string;
    lastLogin: string; // ISO date
    registeredDate: string; // ISO date
  }

  /**
   * User subscription options from My-Cannabis-Tracker.com
   */
  export interface SubscriptionOptions {
    tiers: SubscriptionTier[];
    features: Feature[];
    promotions: Promotion[];
  }

  /**
   * Subscription tier definition
   */
  export interface SubscriptionTier {
    id: string;
    name: string;
    price: number;
    interval: 'monthly' | 'yearly';
    features: string[]; // IDs of features included
    maxSessions: number;
    maxInventoryItems: number;
  }

  /**
   * Feature definition
   */
  export interface Feature {
    id: string;
    name: string;
    description: string;
  }

  /**
   * Promotion definition
   */
  export interface Promotion {
    id: string;
    code: string;
    discountPercent: number;
    validUntil: string; // ISO date
    applicableTiers: string[]; // IDs of tiers this promotion applies to
  }

  /**
   * Error response from My-Cannabis-Tracker.com
   */
  export interface ErrorResponse {
    error: string;
    message: string;
    statusCode: number;
  }
}

export = MyCannabisTracker;
export as namespace MyCannabisTracker; 