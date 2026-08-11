import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

// Low-stock alert view (ADMIN, WAREHOUSE, SALES, ACCOUNTS)
router.get(
  '/low-stock',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.SALES, Role.ACCOUNTS),
  InventoryController.getLowStock
);

// View stock movements (ADMIN, WAREHOUSE, ACCOUNTS)
router.get(
  '/movements',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE, Role.ACCOUNTS),
  InventoryController.getMovements
);

// Record stock movement IN/OUT (ADMIN, WAREHOUSE)
router.post(
  '/movement',
  authorizeRoles(Role.ADMIN, Role.WAREHOUSE),
  InventoryController.createMovement
);

export default router;
