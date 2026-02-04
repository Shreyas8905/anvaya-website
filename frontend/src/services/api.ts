/**
 * Axios API client configuration for the Anvaya frontend.
 * Provides centralized HTTP client with interceptors for auth and error handling.
 */

import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toApiError } from '@/utils/errors';

// =============================================================================
// Configuration
// =============================================================================

/** API base URL from environment or localhost fallback */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT_MS = 30000;

/** Local storage key for auth token */
const AUTH_TOKEN_KEY = 'authToken';

/** Routes that should trigger redirect on 401 */
const PROTECTED_ROUTE_PREFIX = '/admin';

// =============================================================================
// Axios Instance
// =============================================================================

/**
 * Configured Axios instance for API requests.
 * Features:
 * - Automatic auth token injection
 * - Request timeout
 * - Centralized error handling
 * - Auto-redirect on 401 for protected routes
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// Request Interceptor
// =============================================================================

/**
 * Injects the auth token into request headers if available.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(toApiError(error));
  }
);

// =============================================================================
// Response Interceptor
// =============================================================================

/**
 * Handles response errors globally.
 * - Clears auth token on 401
 * - Redirects to login for protected routes
 * - Converts errors to ApiError for consistent handling
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      
      // Redirect to login if on a protected route
      if (window.location.pathname.startsWith(PROTECTED_ROUTE_PREFIX)) {
        window.location.href = '/admin/login';
      }
    }

    // Convert to ApiError for consistent handling downstream
    return Promise.reject(toApiError(error));
  }
);

// =============================================================================
// Auth Helpers
// =============================================================================

/**
 * Store the authentication token.
 * @param token - JWT token to store
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove the authentication token.
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a token).
 * Note: This doesn't validate the token, just checks presence.
 */
export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}

/**
 * Get the current auth token.
 * @returns The token or null if not authenticated
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export default api;
