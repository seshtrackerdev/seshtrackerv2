/**
 * Kush.Observer Authentication Client
 * Handles integration with the Kush.Observer authentication service
 */

import type { KushObserver } from '../../types/external/kush';

const KUSH_ENDPOINT = import.meta.env.VITE_KUSH_ENDPOINT || 'https://kush.observer/api/v2';
const KUSH_API_KEY = import.meta.env.VITE_KUSH_API_KEY;

/**
 * Kush.Observer client for authentication
 */
export class KushObserverClient {
  private endpoint: string;
  private apiKey: string;
  private token: string | null = null;

  /**
   * Create a new Kush.Observer client
   * @param options Configuration options
   */
  constructor(options?: { endpoint?: string; apiKey?: string }) {
    this.endpoint = options?.endpoint || KUSH_ENDPOINT;
    this.apiKey = options?.apiKey || KUSH_API_KEY;
    
    // Load token from localStorage if available
    this.token = localStorage.getItem('kush_token');
  }

  /**
   * Get authentication headers for requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Redirect to Kush.Observer login page
   */
  redirectToLogin(): void {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `${this.endpoint}/auth/login?redirect=${encodeURIComponent(redirectUrl)}`;
  }

  /**
   * Handle authentication callback
   * @param code Auth code from Kush.Observer
   */
  async handleCallback(code: string): Promise<KushObserver.UserProfile> {
    const response = await fetch(`${this.endpoint}/auth/callback`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      const error = await response.json() as KushObserver.ErrorResponse;
      throw new Error(`Authentication error: ${error.message}`);
    }

    const data = await response.json() as KushObserver.LoginResponse;
    this.token = data.token;
    localStorage.setItem('kush_token', data.token);

    return data.user;
  }

  /**
   * Verify current auth token
   */
  async verifyToken(): Promise<KushObserver.UserProfile | null> {
    if (!this.token) {
      return null;
    }

    try {
      const response = await fetch(`${this.endpoint}/auth/verify`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        localStorage.removeItem('kush_token');
        this.token = null;
        return null;
      }

      const data = await response.json() as { user: KushObserver.UserProfile };
      return data.user;
    } catch (error) {
      localStorage.removeItem('kush_token');
      this.token = null;
      return null;
    }
  }

  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('kush_token');
    this.token = null;
    
    // Redirect to Kush.Observer logout page
    window.location.href = `${this.endpoint}/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`;
  }

  /**
   * Check if user has specific permission
   * @param permission Permission to check
   * @param user User profile
   */
  hasPermission(permission: string, user: KushObserver.UserProfile): boolean {
    return user.permissions.includes(permission);
  }
}

// Create and export a singleton instance
export const kushClient = new KushObserverClient();

export default kushClient; 