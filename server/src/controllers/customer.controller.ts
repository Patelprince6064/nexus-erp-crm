import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
} from '../validators/customer.validator';
import { sendSuccess } from '../utils/response';

export class CustomerController {
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getCustomers(req.query);
      return sendSuccess(res, 'Customers fetched successfully', result.customers, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getCustomerById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      return sendSuccess(res, 'Customer details fetched successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createCustomerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(validatedInput, req.user!.id);
      return sendSuccess(res, 'Customer created successfully', customer, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = updateCustomerSchema.parse(req.body);
      const customer = await CustomerService.updateCustomer(req.params.id, validatedInput);
      return sendSuccess(res, 'Customer updated successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.deleteCustomer(req.params.id);
      return sendSuccess(res, 'Customer deactivated successfully', customer);
    } catch (error) {
      next(error);
    }
  }

  static async getFollowUps(req: Request, res: Response, next: NextFunction) {
    try {
      const followUps = await CustomerService.getFollowUps(req.params.id);
      return sendSuccess(res, 'Customer follow-up history fetched successfully', followUps);
    } catch (error) {
      next(error);
    }
  }

  static async addFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createFollowUpSchema.parse(req.body);
      const followUp = await CustomerService.addFollowUp(req.params.id, validatedInput, req.user!.id);
      return sendSuccess(res, 'Follow-up note added successfully', followUp, 201);
    } catch (error) {
      next(error);
    }
  }
}
