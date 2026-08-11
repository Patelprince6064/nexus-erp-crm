import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.use(authenticateToken);

// View customers (ADMIN, SALES, ACCOUNTS)
router.get(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  CustomerController.getCustomers
);

router.get(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  CustomerController.getCustomerById
);

// Create / Edit customer (ADMIN, SALES)
router.post(
  '/',
  authorizeRoles(Role.ADMIN, Role.SALES),
  CustomerController.createCustomer
);

router.put(
  '/:id',
  authorizeRoles(Role.ADMIN, Role.SALES),
  CustomerController.updateCustomer
);

// Delete customer (ADMIN only)
router.delete(
  '/:id',
  authorizeRoles(Role.ADMIN),
  CustomerController.deleteCustomer
);

// Customer follow-ups (ADMIN, SALES)
router.get(
  '/:id/followups',
  authorizeRoles(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  CustomerController.getFollowUps
);

router.post(
  '/:id/followups',
  authorizeRoles(Role.ADMIN, Role.SALES),
  CustomerController.addFollowUp
);

export default router;
