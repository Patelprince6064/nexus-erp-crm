import api from './api';
import { ApiResponse, Customer, CustomerFollowUp } from '../types';

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerType?: string;
}

export const customerService = {
  getCustomers: async (params?: CustomerQueryParams): Promise<ApiResponse<Customer[]>> => {
    const response = await api.get<ApiResponse<Customer[]>>('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: string): Promise<ApiResponse<Customer>> => {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const response = await api.post<ApiResponse<Customer>>('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id: string, customerData: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id: string): Promise<ApiResponse<Customer>> => {
    const response = await api.delete<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data;
  },

  getFollowUps: async (customerId: string): Promise<ApiResponse<CustomerFollowUp[]>> => {
    const response = await api.get<ApiResponse<CustomerFollowUp[]>>(`/customers/${customerId}/followups`);
    return response.data;
  },

  addFollowUp: async (
    customerId: string,
    data: { note: string; followUpDate: string }
  ): Promise<ApiResponse<CustomerFollowUp>> => {
    const response = await api.post<ApiResponse<CustomerFollowUp>>(`/customers/${customerId}/followups`, data);
    return response.data;
  },
};
