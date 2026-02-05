import api, { setAuthToken } from './api';
import { LoginCredentials, AuthToken } from '@/types/auth';
import { Activity } from '@/types/activity';
import { Photo } from '@/types/photo';

export interface CreateActivityParams {
  wingId: number;
  title: string;
  description: string;
  activityDate: string;
  facultyCoordinator?: string;
  reportFile?: File;
}

export interface UpdateActivityParams {
  activityId: number;
  title?: string;
  description?: string;
  activityDate?: string;
  facultyCoordinator?: string;
  reportFile?: File;
}

export async function login(credentials: LoginCredentials): Promise<AuthToken> {
  const response = await api.post<AuthToken>('/api/admin/login', credentials);
  
  if (response.data.access_token) {
    setAuthToken(response.data.access_token);
  }
  
  return response.data;
}

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

export async function deletePhoto(photoId: number): Promise<void> {
  await api.delete(`/api/admin/photos/${photoId}`);
}

export async function createActivity(params: CreateActivityParams): Promise<Activity> {
  const { wingId, title, description, activityDate, facultyCoordinator, reportFile } = params;

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

export async function deleteActivity(activityId: number): Promise<void> {
  await api.delete(`/api/admin/activities/${activityId}`);
}

export const adminApi = {
  login,
  uploadPhotos,
  deletePhoto,
  createActivity,
  updateActivity,
  deleteActivity,
};
