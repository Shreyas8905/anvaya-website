import api from './api';
import { Wing, WingWithRelations } from '@/types/wing';
import { Activity } from '@/types/activity';
import { Photo } from '@/types/photo';

export interface ActivityStatistic {
  wing_id: number;
  wing_name: string;
  wing_slug: string;
  activity_count: number;
}

export interface ActivityStatisticsResponse {
  statistics: ActivityStatistic[];
  available_years: number[];
  filtered_year: number | null;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export async function getAllWings(): Promise<Wing[]> {
  const response = await api.get<Wing[]>('/api/wings');
  return response.data;
}

export async function getWingBySlug(slug: string): Promise<WingWithRelations> {
  const response = await api.get<WingWithRelations>(`/api/wings/${encodeURIComponent(slug)}`);
  return response.data;
}

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

export async function getWingActivities(slug: string): Promise<Activity[]> {
  const response = await api.get<Activity[]>(
    `/api/wings/${encodeURIComponent(slug)}/activities`
  );
  return response.data;
}

export async function getActivity(id: number): Promise<Activity> {
  const response = await api.get<Activity>(`/api/activities/${id}`);
  return response.data;
}

export async function getAllActivities(limit: number = 1000): Promise<Activity[]> {
  const response = await api.get<Activity[]>('/api/activities', {
    params: { limit },
  });
  return response.data;
}

export async function getActivityStatistics(
  year?: number
): Promise<ActivityStatisticsResponse> {
  const response = await api.get<ActivityStatisticsResponse>('/api/statistics/activities', {
    params: year !== undefined ? { year } : undefined,
  });
  return response.data;
}

export const publicApi = {
  getAllWings,
  getWingBySlug,
  getWingPhotos,
  getWingActivities,
  getActivity,
  getAllActivities,
  getActivityStatistics,
};
