import api from './api';
import { LoginCredentials, AuthToken } from '@/types/auth';
import { Activity } from '@/types/activity';
import { Photo } from '@/types/photo';

/**
 * Admin API functions for authentication and CRUD operations
 */

export const adminApi = {
  // Authentication
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await api.post<AuthToken>('/api/admin/login', credentials);
    return response.data;
  },

  // Photo management
  uploadPhotos: async (wingId: number, files: File[]): Promise<Photo[]> => {
    const formData = new FormData();
    formData.append('wing_id', wingId.toString());
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post<Photo[]>('/api/admin/photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async (photoId: number): Promise<void> => {
    await api.delete(`/api/admin/photos/${photoId}`);
  },

  // Activity management
  createActivity: async (
    wingId: number,
    title: string,
    description: string,
    activityDate: string,
    reportFile?: File
  ): Promise<Activity> => {
    const formData = new FormData();
    formData.append('wing_id', wingId.toString());
    formData.append('title', title);
    formData.append('description', description);
    formData.append('activity_date', activityDate);
    if (reportFile) {
      formData.append('report_file', reportFile);
    }

    const response = await api.post<Activity>('/api/admin/activities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateActivity: async (
    activityId: number,
    title?: string,
    description?: string,
    activityDate?: string,
    reportFile?: File
  ): Promise<Activity> => {
    const formData = new FormData();
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (activityDate) formData.append('activity_date', activityDate);
    if (reportFile) formData.append('report_file', reportFile);

    const response = await api.put<Activity>(
      `/api/admin/activities/${activityId}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },

  deleteActivity: async (activityId: number): Promise<void> => {
    await api.delete(`/api/admin/activities/${activityId}`);
  },
};
