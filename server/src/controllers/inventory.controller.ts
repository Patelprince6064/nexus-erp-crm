import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';
import { createStockMovementSchema } from '../validators/inventory.validator';
import { sendSuccess } from '../utils/response';

export class InventoryController {
  static async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const lowStockProducts = await InventoryService.getLowStockProducts();
      return sendSuccess(res, 'Low stock products retrieved successfully', lowStockProducts);
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InventoryService.getStockMovements(req.query);
      return sendSuccess(res, 'Stock movements retrieved successfully', result.movements, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async createMovement(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createStockMovementSchema.parse(req.body);
      const movement = await InventoryService.recordStockMovement(validatedInput, req.user!.id);
      return sendSuccess(res, 'Stock movement recorded successfully', movement, 201);
    } catch (error) {
      next(error);
    }
  }
}
