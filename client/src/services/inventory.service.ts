import api from './api';
import { ApiResponse, Product, StockMovement, MovementType } from '../types';

export interface MovementQueryParams {
  page?: number;
  limit?: number;
  productId?: string;
  movementType?: MovementType;
}

export const inventoryService = {
  getLowStockProducts: async (): Promise<ApiResponse<Product[]>> => {
    const response = await api.get<ApiResponse<Product[]>>('/inventory/low-stock');
    return response.data;
  },

  getMovements: async (params?: MovementQueryParams): Promise<ApiResponse<StockMovement[]>> => {
    const response = await api.get<ApiResponse<StockMovement[]>>('/inventory/movements', { params });
    return response.data;
  },

  createMovement: async (data: {
    productId: string;
    quantity: number;
    movementType: MovementType;
    reason: string;
    referenceId?: string;
  }): Promise<ApiResponse<StockMovement>> => {
    const response = await api.post<ApiResponse<StockMovement>>('/inventory/movement', data);
    return response.data;
  },
};
