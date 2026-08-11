import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { loginSchema, createUserSchema, toggleUserStatusSchema } from '../validators/auth.validator';
import { sendSuccess } from '../utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedInput);
      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getCurrentUser(userId);
      return sendSuccess(res, 'User profile fetched successfully', user);
    } catch (error) {
      next(error);
    }
  }

  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await AuthService.getUsers();
      return sendSuccess(res, 'Users fetched successfully', users);
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createUserSchema.parse(req.body);
      const user = await AuthService.createUser(validatedInput);
      return sendSuccess(res, 'User created successfully', user, 201);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = toggleUserStatusSchema.parse(req.body);
      const user = await AuthService.toggleUserStatus(req.params.id, validatedInput.isActive);
      return sendSuccess(res, 'User status updated successfully', user);
    } catch (error) {
      next(error);
    }
  }
}

