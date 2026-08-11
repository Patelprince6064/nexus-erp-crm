import api from './api';
import { ApiResponse, Challan, ChallanStatus } from '../types';

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
}

export interface CreateChallanPayload {
  customerId: string;
  items: Array<{ productId: string; quantity: number }>;
  status?: ChallanStatus;
  notes?: string;
  taxPercentage?: number;
}

export const challanService = {
  getChallans: async (params?: ChallanQueryParams): Promise<ApiResponse<Challan[]>> => {
    const response = await api.get<ApiResponse<Challan[]>>('/challans', { params });
    return response.data;
  },

  getChallanById: async (id: string): Promise<ApiResponse<Challan>> => {
    const response = await api.get<ApiResponse<Challan>>(`/challans/${id}`);
    return response.data;
  },

  createChallan: async (payload: CreateChallanPayload): Promise<ApiResponse<Challan>> => {
    const response = await api.post<ApiResponse<Challan>>('/challans', payload);
    return response.data;
  },

  updateChallan: async (id: string, payload: Partial<CreateChallanPayload>): Promise<ApiResponse<Challan>> => {
    const response = await api.put<ApiResponse<Challan>>(`/challans/${id}`, payload);
    return response.data;
  },

  confirmChallan: async (id: string): Promise<ApiResponse<Challan>> => {
    const response = await api.post<ApiResponse<Challan>>(`/challans/${id}/confirm`);
    return response.data;
  },

  cancelChallan: async (id: string): Promise<ApiResponse<Challan>> => {
    const response = await api.post<ApiResponse<Challan>>(`/challans/${id}/cancel`);
    return response.data;
  },
};
