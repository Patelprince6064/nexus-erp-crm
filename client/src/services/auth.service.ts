import api from './api';
import { ApiResponse, User } from '../types';

export interface LoginResponseData {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponseData>> => {
    const response = await api.post<ApiResponse<LoginResponseData>>('/auth/login', { email, password });
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  getUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get<ApiResponse<User[]>>('/auth/users');
    return response.data;
  },

  createUser: async (data: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  },

  toggleUserStatus: async (userId: string, isActive: boolean): Promise<ApiResponse<User>> => {
    const response = await api.patch<ApiResponse<User>>(`/auth/users/${userId}/status`, { isActive });
    return response.data;
  },
};

