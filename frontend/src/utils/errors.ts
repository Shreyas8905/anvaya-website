import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  detail: string;
  status_code?: number;
}

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
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  get isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  get isServerError(): boolean {
    return this.statusCode >= 500;
  }

  get isAuthError(): boolean {
    return this.statusCode === 401;
  }

  get isForbidden(): boolean {
    return this.statusCode === 403;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof AxiosError) {
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please check your connection and try again.';
      }
      return 'Unable to connect to the server. Please check your internet connection.';
    }

    const data = error.response.data as ApiErrorResponse | undefined;
    if (data?.detail) {
      return data.detail;
    }

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

export function isNetworkError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isNetworkError;
  }

  if (error instanceof AxiosError) {
    return !error.response;
  }

  return false;
}

export function isAuthenticationRequired(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.isAuthError;
  }

  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }

  return false;
}
