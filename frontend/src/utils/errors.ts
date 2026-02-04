/**
 * Error handling utilities for the Anvaya frontend.
 * Provides typed errors and helper functions for consistent error handling.
 */

import { AxiosError } from 'axios';

/**
 * Standard API error response structure from the backend.
 */
export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}

/**
 * Custom error class for API-related errors.
 * Provides structured error information for consistent handling.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly isNetworkError: boolean;
  public readonly originalError?: Error;

  constructor(
    message: string,
    statusCode: number = 500,
    isNetworkError: boolean = false,
    originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.isNetworkError = isNetworkError;
    this.originalError = originalError;
    
    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Returns true if this is a client-side error (4xx).
   */
  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Returns true if this is a server-side error (5xx).
   */
  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  /**
   * Returns true if this is an authentication error (401).
   */
  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  /**
   * Returns true if this is an authorization error (403).
   */
  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Returns true if the resource was not found (404).
   */
  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Extract a user-friendly error message from an Axios error.
 * 
 * @param error - The error to extract the message from
 * @returns A user-friendly error message string
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    // Network error (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
      }
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    // Server returned an error response
    const data = error.response.data as ApiErrorResponse | undefined;
    if (data?.detail) {
      return data.detail;
    }

    // Fallback based on status code
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'An internal server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'The server is temporarily unavailable. Please try again later.';
      default:
        return `An error occurred (${error.response.status}). Please try again.`;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Convert an Axios error to an ApiError for consistent handling.
 * 
 * @param error - The Axios error to convert
 * @returns An ApiError instance with structured information
 */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const isNetwork = !error.response;
    const statusCode = error.response?.status ?? 0;
    const message = getErrorMessage(error);

    return new ApiError(message, statusCode, isNetwork, error);
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500, false, error);
  }

  return new ApiError('An unexpected error occurred', 500);
}

/**
 * Check if an error is a network-related error.
 * 
 * @param error - The error to check
 * @returns True if the error is network-related
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isNetworkError;
  }

  if (error instanceof AxiosError) {
    return !error.response;
  }

  return false;
}

/**
 * Check if an error indicates the user needs to re-authenticate.
 * 
 * @param error - The error to check
 * @returns True if authentication is required
 */
export function isAuthenticationRequired(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isAuthError;
  }

  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }

  return false;
}
