/**
 * My-Cannabis-Tracker.com Admin Client
 * Handles integration with the My-Cannabis-Tracker.com admin service
 */

import type MyCannabisTracker from '../../types/external/admin';
import { API, getEnvironment } from '../../config/ecosystem';

// Get the appropriate API endpoint based on the current environment
const environment = getEnvironment();
const ADMIN_API_ENDPOINT = import.meta.env.VITE_ADMIN_API_ENDPOINT || API.MYCANNABIS.BASE(environment);
const ADMIN_API_KEY = import.meta.env.VITE_ADMIN_API_KEY;

/**
 * My-Cannabis-Tracker.com admin client
 */
export class CannabisTrackerClient {
  private endpoint: string;
  private apiKey: string;

  /**
   * Create a new My-Cannabis-Tracker.com client
   * @param options Configuration options
   */
  constructor(options?: { endpoint?: string; apiKey?: string }) {
    this.endpoint = options?.endpoint || ADMIN_API_ENDPOINT;
    this.apiKey = options?.apiKey || ADMIN_API_KEY;
  }

  /**
   * Get authentication headers for requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };
  }

  /**
   * Get user report for admin dashboard
   * @param userId User ID to get report for
   */
  async getUserReport(userId: string): Promise<MyCannabisTracker.AdminReport> {
    const url = API.MYCANNABIS.ADMIN.USER_REPORT(environment, userId);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json() as MyCannabisTracker.ErrorResponse;
      throw new Error(`Admin API error: ${error.message}`);
    }

    return response.json() as Promise<MyCannabisTracker.AdminReport>;
  }

  /**
   * Get subscription options for user
   */
  async getSubscriptionOptions(): Promise<MyCannabisTracker.SubscriptionOptions> {
    const url = API.MYCANNABIS.ADMIN.SUBSCRIPTION_OPTIONS(environment);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const error = await response.json() as MyCannabisTracker.ErrorResponse;
      throw new Error(`Admin API error: ${error.message}`);
    }

    return response.json() as Promise<MyCannabisTracker.SubscriptionOptions>;
  }

  /**
   * Update user subscription
   * @param userId User ID to update
   * @param tierId New subscription tier ID
   */
  async updateUserSubscription(userId: string, tierId: string): Promise<void> {
    const url = API.MYCANNABIS.ADMIN.SUBSCRIPTION(environment, userId);
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ tierId })
    });

    if (!response.ok) {
      const error = await response.json() as MyCannabisTracker.ErrorResponse;
      throw new Error(`Admin API error: ${error.message}`);
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<{ status: string; uptime: number; activeUsers: number }> {
    const url = API.MYCANNABIS.ADMIN.HEALTH(environment);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get system health status');
    }

    return response.json();
  }
}

// Create and export a singleton instance
export const adminClient = new CannabisTrackerClient();

export default adminClient; 