import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

// View dashboard metrics (ALL roles)
router.get(
  '/stats',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  DashboardController.getStats
);

export default router;
