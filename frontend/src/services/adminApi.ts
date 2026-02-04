/**
 * Admin API service for the Anvaya frontend.
 * Provides functions for authentication and CRUD operations.
 * 
 * @module adminApi
 */

import api, { setAuthToken } from './api';
import { LoginCredentials, AuthToken } from '@/types/auth';
import { Activity } from '@/types/activity';
import { Photo } from '@/types/photo';

// =============================================================================
// Types
// =============================================================================

/** Parameters for creating a new activity */
export interface CreateActivityParams {
  wingId: number;
  title: string;
  description: string;
  activityDate: string;
  facultyCoordinator?: string;
  reportFile?: File;
}

/** Parameters for updating an existing activity */
export interface UpdateActivityParams {
  activityId: number;
  title?: string;
  description?: string;
  activityDate?: string;
  facultyCoordinator?: string;
  reportFile?: File;
}

/** Response for delete operations */
export interface DeleteResponse {
  message: string;
}

// =============================================================================
// Authentication
// =============================================================================

/**
 * Authenticate an admin user.
 * Stores the token automatically on success.
 * 
 * @param credentials - Username and password
 * @returns Promise resolving to the auth token
 * @throws {ApiError} If credentials are invalid (401) or request fails
 * 
 * @example
 * const token = await adminApi.login({ username: 'admin', password: 'secret' });
 */
export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const response = await api.post<AuthToken>('/api/admin/login', credentials);
  
  // Automatically store the token
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  
  return response.data;
}

// =============================================================================
// Photo Management
// =============================================================================

/**
 * Upload multiple photos to a wing.
 * 
 * @param wingId - The wing to upload photos to
 * @param files - Array of image files to upload
 * @returns Promise resolving to the created photo records
 * @throws {ApiError} If wing not found, upload fails, or unauthorized
 * 
 * @example
 * const photos = await adminApi.uploadPhotos(1, [file1, file2]);
 */
export async function uploadPhotos(wingId: number, files: File[]): Promise<Photo[]> {
  if (!files.length) {
    throw new Error('At least one file is required');
  }

  const formData = new FormData();
  formData.append('wing_id', wingId.toString());
  
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await api.post<Photo[]>('/api/admin/photos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
}

/**
 * Delete a photo.
 * 
 * @param photoId - The ID of the photo to delete
 * @throws {ApiError} If photo not found or unauthorized
 * 
 * @example
 * await adminApi.deletePhoto(42);
 */
export async function deletePhoto(photoId: number): Promise<void> {
  await api.delete(`/api/admin/photos/${photoId}`);
}

// =============================================================================
// Activity Management
// =============================================================================

/**
 * Create a new activity with optional PDF report.
 * 
 * @param params - Activity creation parameters
 * @returns Promise resolving to the created activity
 * @throws {ApiError} If wing not found, validation fails, or unauthorized
 * 
 * @example
 * const activity = await adminApi.createActivity({
 *   wingId: 1,
 *   title: 'Workshop on AI',
 *   description: 'Hands-on workshop covering ML basics',
 *   activityDate: '2024-01-15',
 *   facultyCoordinator: 'Dr. Smith',
 *   reportFile: pdfFile,
 * });
 */
export async function createActivity(params: CreateActivityParams): Promise<Activity> {
  const { wingId, title, description, activityDate, facultyCoordinator, reportFile } = params;

  // Client-side validation
  if (!title.trim()) {
    throw new Error('Title is required');
  }
  if (!description.trim()) {
    throw new Error('Description is required');
  }

  const formData = new FormData();
  formData.append('wing_id', wingId.toString());
  formData.append('title', title.trim());
  formData.append('description', description.trim());
  formData.append('activity_date', activityDate);
  
  if (facultyCoordinator?.trim()) {
    formData.append('faculty_coordinator', facultyCoordinator.trim());
  }
  
  if (reportFile) {
    formData.append('report_file', reportFile);
  }

  const response = await api.post<Activity>('/api/admin/activities', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  
  return response.data;
}

/**
 * Update an existing activity.
 * Only provided fields will be updated.
 * 
 * @param params - Activity update parameters
 * @returns Promise resolving to the updated activity
 * @throws {ApiError} If activity not found or unauthorized
 * 
 * @example
 * const updated = await adminApi.updateActivity({
 *   activityId: 42,
 *   title: 'Updated Workshop Title',
 * });
 */
export async function updateActivity(params: UpdateActivityParams): Promise<Activity> {
  const { activityId, title, description, activityDate, facultyCoordinator, reportFile } = params;

  const formData = new FormData();
  
  if (title !== undefined) {
    formData.append('title', title.trim());
  }
  if (description !== undefined) {
    formData.append('description', description.trim());
  }
  if (activityDate !== undefined) {
    formData.append('activity_date', activityDate);
  }
  if (facultyCoordinator !== undefined) {
    formData.append('faculty_coordinator', facultyCoordinator.trim());
  }
  if (reportFile) {
    formData.append('report_file', reportFile);
  }

  const response = await api.put<Activity>(
    `/api/admin/activities/${activityId}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  return response.data;
}

/**
 * Delete an activity.
 * 
 * @param activityId - The ID of the activity to delete
 * @throws {ApiError} If activity not found or unauthorized
 * 
 * @example
 * await adminApi.deleteActivity(42);
 */
export async function deleteActivity(activityId: number): Promise<void> {
  await api.delete(`/api/admin/activities/${activityId}`);
}

// =============================================================================
// Legacy Export (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use individual named exports instead.
 * This object export is maintained for backward compatibility.
 */
export const adminApi = {
  login,
  uploadPhotos,
  deletePhoto,
  createActivity,
  updateActivity,
  deleteActivity,
};
