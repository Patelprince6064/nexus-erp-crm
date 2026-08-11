import api from './api';
import { ApiResponse, DashboardData } from '../types';

export const dashboardService = {
  getStats: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard/stats');
    return response.data;
  },
};
