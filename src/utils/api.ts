/**
 * API Utilities for KushObserver Integration
 */

/**
 * Creates standard headers for KushObserver API requests
 * @param contentType Content type header
 * @param token Authentication token
 * @returns Headers object
 */
export const getKushObserverHeaders = (contentType = 'application/json', token = '') => {
  const headers: Record<string, string> = {
    'Content-Type': contentType,
    'Origin': 'https://sesh-tracker.com',
    'Referer': 'https://sesh-tracker.com'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  /** HTTP method */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** Request headers */
  headers?: Record<string, string>;
  /** Request body */
  body?: any;
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial backoff time in milliseconds */
  initialBackoff?: number;
  /** Maximum backoff time in milliseconds */
  maxBackoff?: number;
  /** Whether to parse the response as JSON */
  parseJson?: boolean;
}

/**
 * Default options for API requests
 */
const DEFAULT_OPTIONS: ApiRequestOptions = {
  method: 'GET',
  maxRetries: 5,
  initialBackoff: 1000, // 1 second
  maxBackoff: 30000, // 30 seconds
  parseJson: true
};

/**
 * Fetches data from the API with exponential backoff for rate limiting
 * @param url API URL
 * @param options Request options
 * @returns Response data
 */
export async function fetchWithRateLimiting<T = any>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  // Merge default options
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Setup request
  const fetchOptions: RequestInit = {
    method: opts.method,
    headers: opts.headers || {},
  };
  
  // Add body if present
  if (opts.body) {
    fetchOptions.body = typeof opts.body === 'string' 
      ? opts.body 
      : JSON.stringify(opts.body);
  }

  // Initialize retry counter and backoff time
  let retries = 0;
  let backoffTime = opts.initialBackoff || DEFAULT_OPTIONS.initialBackoff;
  
  while (true) {
    try {
      const response = await fetch(url, fetchOptions);
      
      // Handle rate limiting (429 Too Many Requests)
      if (response.status === 429) {
        // Check if we've reached max retries
        if (retries >= (opts.maxRetries || DEFAULT_OPTIONS.maxRetries)) {
          throw new Error(`Rate limit exceeded after ${retries} retries`);
        }
        
        // Get retry-after header or use exponential backoff
        const retryAfter = response.headers.get('retry-after');
        let waitTime = backoffTime;
        
        if (retryAfter) {
          // retry-after is in seconds, convert to milliseconds
          waitTime = parseInt(retryAfter, 10) * 1000;
        }
        
        console.log(`Rate limited, retrying after ${waitTime}ms (retry ${retries + 1})`);
        
        // Wait for the specified time
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
        // Increase backoff for next attempt (exponential backoff with jitter)
        backoffTime = Math.min(
          backoffTime * 2 * (0.9 + 0.2 * Math.random()), // Add jitter
          opts.maxBackoff || DEFAULT_OPTIONS.maxBackoff
        );
        
        retries++;
        continue;
      }
      
      // Handle other error status codes
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Parse and return response
      if (opts.parseJson !== false) {
        return await response.json() as T;
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      // If it's not a rate limiting error and we've used all retries, throw
      if (retries >= (opts.maxRetries || DEFAULT_OPTIONS.maxRetries)) {
        throw error;
      }
      
      console.error(`API request error (retry ${retries + 1}):`, error);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      // Increase backoff for next attempt
      backoffTime = Math.min(
        backoffTime * 2,
        opts.maxBackoff || DEFAULT_OPTIONS.maxBackoff
      );
      
      retries++;
    }
  }
} 