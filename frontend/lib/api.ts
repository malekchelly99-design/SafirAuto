/**
 * API client — all backend calls go through here.
 * Base URL is configured once; swap to production URL via env var.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  Vehicle, PaginatedVehicles, VehicleFilters, Brand,
  AuthTokens, User, DashboardStats, ActivityItem, ContactMessage, FilterOptions
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ── Axios instance ────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
        if (refresh) {
          const { data } = await axios.post(`${API_BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers['Authorization'] = `Bearer ${data.access}`;
          return api(original);
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post('/auth/login/', { email, password });
    return data;
  },
  register: async (firstName: string, email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post('/auth/register/', { first_name: firstName, email, password });
    return data;
  },
  logout: async (refresh: string) => {
    await api.post('/auth/logout/', { refresh });
  },
  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me/');
    return data;
  },
  updateProfile: async (payload: { first_name?: string; last_name?: string; email?: string; current_password?: string; new_password?: string }): Promise<User> => {
    const { data } = await api.patch('/auth/profile/', payload);
    return data;
  },
};

// ── Vehicles (public) ────────────────────────────────────────────────────

export const vehiclesApi = {
  list: async (filters?: VehicleFilters): Promise<PaginatedVehicles> => {
    const params: Record<string, unknown> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params[k] = v;
      });
    }
    const { data } = await api.get('/vehicles/', { params });
    return data;
  },

  get: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/${id}/`);
    return data;
  },

  filterOptions: async (brand?: string): Promise<FilterOptions> => {
    const params = brand ? { brand } : {};
    const { data } = await api.get('/vehicles/filter-options/', { params });
    return data;
  },
};

// ── Vehicles (admin) ─────────────────────────────────────────────────────

export const adminVehiclesApi = {
  list: async (filters?: VehicleFilters): Promise<PaginatedVehicles> => {
    const params: Record<string, unknown> = {};
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== '' && v !== null) params[k] = v;
      });
    }
    const { data } = await api.get('/vehicles/admin/list/', { params });
    return data;
  },

  get: async (id: string): Promise<Vehicle> => {
    const { data } = await api.get(`/vehicles/admin/${id}/detail/`);
    return data;
  },

  create: async (vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.post('/vehicles/admin/create/', vehicle);
    return data;
  },

  update: async (id: string, vehicle: Partial<Vehicle>): Promise<Vehicle> => {
    const { data } = await api.patch(`/vehicles/admin/${id}/detail/`, vehicle);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/vehicles/admin/${id}/detail/`);
  },

  action: async (id: string, action: 'publish' | 'unpublish' | 'sold' | 'reserved' | 'duplicate'): Promise<Vehicle> => {
    const { data } = await api.post(`/vehicles/admin/${id}/action/${action}/`);
    return data;
  },

  uploadImages: async (id: string, files: File[]): Promise<{ images: string[]; primary_image: string }> => {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const { data } = await api.post(`/vehicles/admin/${id}/images/upload/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteImage: async (id: string, imageIndex: number): Promise<{ images: string[]; primary_image: string }> => {
    const { data } = await api.delete(`/vehicles/admin/${id}/images/${imageIndex}/delete/`);
    return data;
  },

  reorderImages: async (id: string, images: string[]): Promise<{ images: string[]; primary_image: string }> => {
    const { data } = await api.post(`/vehicles/admin/${id}/images/reorder/`, { images });
    return data;
  },
};

// ── Brands ───────────────────────────────────────────────────────────────

export const brandsApi = {
  list: async (): Promise<Brand[]> => {
    const { data } = await api.get('/brands/');
    return data;
  },
  get: async (slug: string): Promise<Brand> => {
    const { data } = await api.get(`/brands/${slug}/`);
    return data;
  },
  create: async (brand: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.post('/brands/create/', brand);
    return data;
  },
  update: async (slug: string, brand: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.patch(`/brands/${slug}/update/`, brand);
    return data;
  },
  delete: async (slug: string): Promise<void> => {
    await api.delete(`/brands/${slug}/update/`);
  },
  uploadLogo: async (slug: string, file: File): Promise<{ logo: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const { data } = await api.post(`/brands/${slug}/logo/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

// ── Favorites ────────────────────────────────────────────────────────────

export const favoritesApi = {
  list: async (): Promise<{ favorites: string[] }> => {
    const { data } = await api.get('/favorites/');
    return data;
  },
  add: async (vehicle_id: string): Promise<{ favorites: string[] }> => {
    const { data } = await api.post('/favorites/add/', { vehicle_id });
    return data;
  },
  remove: async (vehicle_id: string): Promise<{ favorites: string[] }> => {
    const { data } = await api.delete(`/favorites/${vehicle_id}/`);
    return data;
  },
};

// ── Messages ─────────────────────────────────────────────────────────────

export const messagesApi = {
  list: async (): Promise<ContactMessage[]> => {
    const { data } = await api.get('/messages/');
    return data;
  },
  mine: async (): Promise<ContactMessage[]> => {
    const { data } = await api.get('/messages/mine/');
    return data;
  },
  byVehicle: async (vehicleId: string): Promise<ContactMessage[]> => {
    const { data } = await api.get(`/messages/vehicle/${vehicleId}/`);
    return data;
  },
  create: async (msg: {
    name: string; email: string; phone?: string;
    subject: string; message: string;
    vehicle_id?: string; vehicle_ref?: string;
  }): Promise<ContactMessage> => {
    const { data } = await api.post('/messages/create/', msg);
    return data;
  },
  reply: async (id: string, text: string): Promise<ContactMessage> => {
    const { data } = await api.post(`/messages/${id}/reply/`, { text });
    return data;
  },
  userReply: async (id: string, text: string): Promise<ContactMessage> => {
    const { data } = await api.post(`/messages/${id}/user-reply/`, { text });
    return data;
  },
  markRead: async (id: string): Promise<ContactMessage> => {
    const { data } = await api.patch(`/messages/${id}/read/`);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/messages/${id}/delete/`);
  },
};

// ── Dashboard ────────────────────────────────────────────────────────────

export const dashboardApi = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/dashboard/stats/');
    return data;
  },
  activity: async (): Promise<ActivityItem[]> => {
    const { data } = await api.get('/dashboard/activity/');
    return data;
  },
  salesChart: async () => {
    const { data } = await api.get('/dashboard/sales-chart/');
    return data;
  },
  brandDistribution: async () => {
    const { data } = await api.get('/dashboard/brand-distribution/');
    return data;
  },
};

export default api;

