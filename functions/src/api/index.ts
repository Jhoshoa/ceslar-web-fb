/**
 * Express API Application
 *
 * Main Express app for Firebase Cloud Functions HTTP endpoints.
 * Configures middleware, routes, and error handling.
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { verifyToken } from '../middleware/auth.middleware';

// Import routes
import usersRoutes from './users.routes';
import churchesRoutes from './churches.routes';
import eventsRoutes from './events.routes';
import sermonsRoutes from './sermons.routes';
import ministriesRoutes from './ministries.routes';
import membershipsRoutes from './memberships.routes';
import questionsRoutes from './questions.routes';
import publicRoutes from './public.routes';
import mediaRoutes from './media.routes';

// Create Express app
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ==========================================
// API ROUTES
// ==========================================

// Public routes (no auth required)
app.use('/public', publicRoutes);

// Protected routes (auth required)
app.use('/users', verifyToken, usersRoutes);
app.use('/churches', churchesRoutes); // Mixed auth (some public, some protected)
app.use('/events', eventsRoutes); // Mixed auth
app.use('/sermons', sermonsRoutes); // Mixed auth
app.use('/ministries', ministriesRoutes); // Mixed auth
app.use('/memberships', verifyToken, membershipsRoutes);
app.use('/questions', questionsRoutes); // Mixed auth
app.use('/media', mediaRoutes); // Protected (auth in route handlers)

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'not-found',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
interface AppError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

app.use((err: AppError, _req: Request, res: Response, _next: NextFunction): void => {
  console.error('API Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'validation-error',
        message: err.message,
        details: err.details || [],
      },
    });
    return;
  }

  // Handle Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    res.status(401).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle Firestore errors
  if (err.code && (err.code.includes('firestore') || err.code === 'not-found')) {
    const status = err.code === 'not-found' ? 404 : 500;
    res.status(status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Generic server error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'internal-error',
      message:
        process.env.NODE_ENV === 'production'
          ? 'An unexpected error occurred'
          : err.message,
    },
  });
});

export default app;
