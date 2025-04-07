/**
 * KushObserver API Client
 */
import { AUTH_CONFIG } from '../config/auth';
import { fetchWithRateLimiting, getKushObserverHeaders } from './api';

// Base URL for KushObserver API
const API_BASE_URL = AUTH_CONFIG.API_URL;

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Default pagination settings
 */
const DEFAULT_PAGINATION: PaginationParams = {
  limit: 25,
  offset: 0,
  sortDirection: 'desc'
};

/**
 * Interface for a paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * KushObserver API Client
 */
export class KushObserverClient {
  private token: string = '';

  /**
   * Set the authentication token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Get the authentication token
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Login a user
   * @param email User email
   * @param password User password
   * @returns Login response with token and user data
   */
  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: any }> {
    return fetchWithRateLimiting(`${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getKushObserverHeaders(),
      body: { email, password }
    });
  }

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Registration response
   */
  async register(userData: any): Promise<{ success: boolean; userId: string }> {
    return fetchWithRateLimiting(`${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: getKushObserverHeaders(),
      body: userData
    });
  }

  /**
   * Validate a token
   * @param token JWT token to validate
   * @returns Validation response
   */
  async validateToken(token: string): Promise<{ valid: boolean; user?: any; newToken?: string }> {
    return fetchWithRateLimiting(`${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.VERIFY}`, {
      method: 'POST',
      headers: getKushObserverHeaders(),
      body: { token }
    });
  }

  /**
   * Refresh a token
   * @param token Current JWT token
   * @returns Refresh response with new token
   */
  async refreshToken(token: string): Promise<{ success: boolean; token: string }> {
    return fetchWithRateLimiting(`${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.REFRESH_TOKEN}`, {
      method: 'POST',
      headers: getKushObserverHeaders(),
      body: { token }
    });
  }

  /**
   * Get user profile
   * @returns User profile data
   */
  async getUserProfile(): Promise<any> {
    return fetchWithRateLimiting(`${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.PROFILE}`, {
      headers: getKushObserverHeaders('application/json', this.token)
    });
  }

  /**
   * Get inventory items with pagination
   * @param params Pagination parameters
   * @returns Paginated inventory items
   */
  async getInventoryItems(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const pagination = { ...DEFAULT_PAGINATION, sortBy: 'purchase_date', ...params };
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', pagination.limit?.toString() || '25');
    queryParams.append('offset', pagination.offset?.toString() || '0');
    
    if (pagination.sortBy) {
      queryParams.append('sortBy', pagination.sortBy);
    }
    
    if (pagination.sortDirection) {
      queryParams.append('sortDirection', pagination.sortDirection);
    }
    
    const url = `${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.INVENTORY}?${queryParams.toString()}`;
    
    return fetchWithRateLimiting(url, {
      headers: getKushObserverHeaders('application/json', this.token)
    });
  }

  /**
   * Get sessions with pagination
   * @param params Pagination parameters
   * @returns Paginated sessions
   */
  async getSessions(params: PaginationParams = {}): Promise<PaginatedResponse<any>> {
    const pagination = { ...DEFAULT_PAGINATION, limit: 50, sortBy: 'start_time', ...params };
    
    const queryParams = new URLSearchParams();
    queryParams.append('limit', pagination.limit?.toString() || '50');
    queryParams.append('offset', pagination.offset?.toString() || '0');
    
    if (pagination.sortBy) {
      queryParams.append('sortBy', pagination.sortBy);
    }
    
    if (pagination.sortDirection) {
      queryParams.append('sortDirection', pagination.sortDirection);
    }
    
    const url = `${API_BASE_URL}${AUTH_CONFIG.ENDPOINTS.SESSIONS}?${queryParams.toString()}`;
    
    return fetchWithRateLimiting(url, {
      headers: getKushObserverHeaders('application/json', this.token)
    });
  }

  /**
   * Get all inventory items (handles pagination automatically)
   * @returns All inventory items
   */
  async getAllInventoryItems(): Promise<any[]> {
    const items: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 25;

    while (hasMore) {
      const response = await this.getInventoryItems({ limit, offset });
      items.push(...response.items);
      
      offset += limit;
      hasMore = response.hasMore;
    }

    return items;
  }

  /**
   * Get all sessions (handles pagination automatically)
   * @returns All sessions
   */
  async getAllSessions(): Promise<any[]> {
    const sessions: any[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 50;

    while (hasMore) {
      const response = await this.getSessions({ limit, offset });
      sessions.push(...response.items);
      
      offset += limit;
      hasMore = response.hasMore;
    }

    return sessions;
  }
} 