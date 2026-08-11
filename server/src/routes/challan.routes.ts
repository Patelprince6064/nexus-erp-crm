import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

// View challans (ADMIN, SALES, WAREHOUSE, ACCOUNTS)
router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ChallanController.getChallans
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE, Role.ACCOUNTS),
  ChallanController.getChallanById
);

// Create / Edit draft challan (ADMIN, SALES)
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  ChallanController.createChallan
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  ChallanController.updateChallan
);

// Confirm challan & deduct inventory (ADMIN, SALES, WAREHOUSE)
router.post(
  '/:id/confirm',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  ChallanController.confirmChallan
);

// Cancel challan (ADMIN, SALES)
router.post(
  '/:id/cancel',
  authorizeRoles(Role.ADMIN, Role.SALES),
  ChallanController.cancelChallan
);

export default router;
