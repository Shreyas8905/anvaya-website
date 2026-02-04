/**
 * Public API service for the Anvaya frontend.
 * Provides functions for fetching wing, activity, and photo data.
 * 
 * @module publicApi
 */

import api from './api';
import { Wing, WingWithRelations } from '@/types/wing';
import { Activity } from '@/types/activity';
import { Photo } from '@/types/photo';

// =============================================================================
// Types
// =============================================================================

/** Statistics for a single wing's activity count */
export interface ActivityStatistic {
  wing_id: number;
  wing_name: string;
  wing_slug: string;
  activity_count: number;
}

/** Response structure for activity statistics endpoint */
export interface ActivityStatisticsResponse {
  statistics: ActivityStatistic[];
  available_years: number[];
  filtered_year: number | null;
}

/** Pagination options for list endpoints */
export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

// =============================================================================
// Wing Endpoints
// =============================================================================

/**
 * Fetch all wings.
 * 
 * @returns Promise resolving to array of all wings
 * @throws {ApiError} If the request fails
 * 
 * @example
 * const wings = await publicApi.getAllWings();
 */
export async function getAllWings(): Promise<Wing[]> {
  const response = await api.get<Wing[]>('/api/wings');
  return response.data;
}

/**
 * Fetch a wing by its slug with related activities and photos.
 * 
 * @param slug - The unique slug identifier for the wing
 * @returns Promise resolving to the wing with its relations
 * @throws {ApiError} If wing not found (404) or request fails
 * 
 * @example
 * const wing = await publicApi.getWingBySlug('codezero');
 */
export async function getWingBySlug(slug: string): Promise<WingWithRelations> {
  const response = await api.get<WingWithRelations>(`/api/wings/${encodeURIComponent(slug)}`);
  return response.data;
}

/**
 * Fetch photos for a specific wing with pagination.
 * 
 * @param slug - The wing's slug identifier
 * @param options - Pagination options (limit, offset)
 * @returns Promise resolving to array of photos
 * @throws {ApiError} If wing not found or request fails
 * 
 * @example
 * const photos = await publicApi.getWingPhotos('codezero', { limit: 20, offset: 0 });
 */
export async function getWingPhotos(
  slug: string,
  options: PaginationOptions = {}
): Promise<Photo[]> {
  const { limit = 100, offset = 0 } = options;
  
  const response = await api.get<Photo[]>(`/api/wings/${encodeURIComponent(slug)}/photos`, {
    params: { limit, offset },
  });
  return response.data;
}

/**
 * Fetch all activities for a specific wing.
 * 
 * @param slug - The wing's slug identifier
 * @returns Promise resolving to array of activities, sorted by date descending
 * @throws {ApiError} If wing not found or request fails
 * 
 * @example
 * const activities = await publicApi.getWingActivities('nexus');
 */
export async function getWingActivities(slug: string): Promise<Activity[]> {
  const response = await api.get<Activity[]>(
    `/api/wings/${encodeURIComponent(slug)}/activities`
  );
  return response.data;
}

// =============================================================================
// Activity Endpoints
// =============================================================================

/**
 * Fetch a single activity by its ID.
 * 
 * @param id - The activity's unique identifier
 * @returns Promise resolving to the activity
 * @throws {ApiError} If activity not found (404) or request fails
 * 
 * @example
 * const activity = await publicApi.getActivity(42);
 */
export async function getActivity(id: number): Promise<Activity> {
  const response = await api.get<Activity>(`/api/activities/${id}`);
  return response.data;
}

/**
 * Fetch all activities across all wings.
 * 
 * @param limit - Maximum number of activities to return (default: 1000)
 * @returns Promise resolving to array of activities
 * @throws {ApiError} If request fails
 * 
 * @example
 * const activities = await publicApi.getAllActivities(50);
 */
export async function getAllActivities(limit: number = 1000): Promise<Activity[]> {
  const response = await api.get<Activity[]>('/api/activities', {
    params: { limit },
  });
  return response.data;
}

// =============================================================================
// Statistics Endpoints
// =============================================================================

/**
 * Fetch activity statistics grouped by wing.
 * 
 * @param year - Optional year to filter statistics
 * @returns Promise resolving to statistics with available years
 * @throws {ApiError} If request fails
 * 
 * @example
 * // Get all-time statistics
 * const stats = await publicApi.getActivityStatistics();
 * 
 * // Get statistics for a specific year
 * const stats2024 = await publicApi.getActivityStatistics(2024);
 */
export async function getActivityStatistics(
  year?: number
): Promise<ActivityStatisticsResponse> {
  const response = await api.get<ActivityStatisticsResponse>('/api/statistics/activities', {
    params: year !== undefined ? { year } : undefined,
  });
  return response.data;
}

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use individual named exports instead.
 * This object export is maintained for backward compatibility.
 */
export const publicApi = {
  getAllWings,
  getWingBySlug,
  getWingPhotos,
  getWingActivities,
  getActivity,
  getAllActivities,
  getActivityStatistics,
};
