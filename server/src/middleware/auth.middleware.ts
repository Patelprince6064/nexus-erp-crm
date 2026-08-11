import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '../types/enums';
import { config } from '../config/env';
import { UnauthorizedError, ForbiddenError } from './error.middleware';
import { AuthUser } from '../types/express';

export const authenticateToken = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    throw new UnauthorizedError('Authentication token is required');
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
};

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('User authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Required role: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`
      );
    }

    next();
  };
};
