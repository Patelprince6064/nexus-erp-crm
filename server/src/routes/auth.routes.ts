import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import { Role } from '../types/enums';

const router = Router();

router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.me);

// User Management (ADMIN only)
router.get('/users', authenticateToken, authorizeRoles(Role.ADMIN), AuthController.getUsers);
router.post('/register', authenticateToken, authorizeRoles(Role.ADMIN), AuthController.createUser);
router.patch('/users/:id/status', authenticateToken, authorizeRoles(Role.ADMIN), AuthController.toggleUserStatus);

export default router;

