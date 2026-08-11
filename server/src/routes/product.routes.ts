import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

// View products (All roles: ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ProductController.getProducts
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ProductController.getProductById
);

// Create / Edit products (ADMIN, WAREHOUSE)
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  ProductController.createProduct
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  ProductController.updateProduct
);

// Delete product (ADMIN only)
router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN),
  ProductController.deleteProduct
);

export default router;
