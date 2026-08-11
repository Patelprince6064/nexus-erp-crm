import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { sendSuccess } from '../utils/response';

export class ProductController {
  static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getProducts(req.query);
      return sendSuccess(res, 'Products fetched successfully', result.products, 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      return sendSuccess(res, 'Product details fetched successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = createProductSchema.parse(req.body);
      const product = await ProductService.createProduct(validatedInput);
      return sendSuccess(res, 'Product created successfully', product, 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedInput = updateProductSchema.parse(req.body);
      const product = await ProductService.updateProduct(req.params.id, validatedInput);
      return sendSuccess(res, 'Product updated successfully', product);
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.deleteProduct(req.params.id);
      return sendSuccess(res, 'Product deactivated successfully', product);
    } catch (error) {
      next(error);
    }
  }
}
