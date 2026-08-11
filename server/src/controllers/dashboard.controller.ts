import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getDashboardMetrics();
      return sendSuccess(res, 'Dashboard metrics fetched successfully', stats);
    } catch (error) {
      next(error);
    }
  }
}
