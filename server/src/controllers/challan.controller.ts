import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { createChallanSchema, updateChallanSchema } from '../validators/challan.validator';
import { sendSuccess } from '../utils/response';

export class ChallanController {
  static async getChallans(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ChallanService.getChallans(req.query);
      return sendSuccess(res, 'Sales challans fetched successfully', result.challans, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getChallanById(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      return sendSuccess(res, 'Sales challan details fetched successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async createChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createChallanSchema.parse(req.body);
      const challan = await ChallanService.createChallan(validatedInput, req.user!.id);
      return sendSuccess(res, 'Sales challan created successfully', challan, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = updateChallanSchema.parse(req.body);
      const challan = await ChallanService.updateChallan(req.params.id, validatedInput);
      return sendSuccess(res, 'Sales challan updated successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async confirmChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.confirmChallan(req.params.id, req.user!.id);
      return sendSuccess(res, 'Sales challan confirmed & inventory deducted successfully', challan);
    } catch (error) {
      next(error);
    }
  }

  static async cancelChallan(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.cancelChallan(req.params.id, req.user!.id);
      return sendSuccess(res, 'Sales challan cancelled successfully', challan);
    } catch (error) {
      next(error);
    }
  }
}
