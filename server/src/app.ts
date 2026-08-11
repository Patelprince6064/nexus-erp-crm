import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler, NotFoundError } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';
import routes from './routes';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: config.clientUrl || '*',
    credentials: true,
  })
);

// Rate limiter for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  return sendSuccess(res, 'Mini ERP + CRM API is running cleanly', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Mount All Domain REST API Routes
app.use('/api', routes);

// 404 Route Handler
app.use((_req: Request, _res: Response) => {
  throw new NotFoundError('API endpoint not found');
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
