import api from './api';
import { ApiResponse, Product } from '../types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
}

export const productService = {
  getProducts: async (params?: ProductQueryParams): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  },

  getProductById: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  createProduct: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/products', productData);
    return response.data;
  },

  updateProduct: async (id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, productData);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<ApiResponse<Product>> => {
    const response = await api.delete<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },
};
