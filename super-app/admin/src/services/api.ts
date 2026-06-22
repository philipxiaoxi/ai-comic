import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AppInfo {
  _id: string;
  name: string;
  description: string;
  version: string;
  icon: string;
  packageUrl: string;
  packageSize: number;
  status: 'draft' | 'published' | 'archived';
  developer: string;
  category: string;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export const authService = {
  login: (credentials: LoginCredentials) =>
    api.post<{ token: string; admin: any }>('/auth/login', credentials),
  register: (data: LoginCredentials & { role?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile')
};

export const appService = {
  getApps: (params?: { category?: string; search?: string }) =>
    api.get<AppInfo[]>('/apps', { params }),
  getAppById: (id: string) => api.get<AppInfo>(`/apps/${id}`),
  createApp: (formData: FormData) =>
    api.post<AppInfo>('/apps', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateApp: (id: string, formData: FormData) =>
    api.put<AppInfo>(`/apps/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteApp: (id: string) => api.delete(`/apps/${id}`)
};

export default api;
