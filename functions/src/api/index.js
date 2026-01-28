/**
 * Express API Application
 *
 * Main Express app for Firebase Cloud Functions HTTP endpoints.
 * Configures middleware, routes, and error handling.
 */

const express = require('express');
const cors = require('cors');
const { verifyToken, optionalAuth } = require('../middleware/auth.middleware');

// Create Express app
const app = express();

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
const corsOptions = {
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
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==========================================
// HEALTH CHECK
// ==========================================
app.get('/health', (req, res) => {
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

// Import routes
const usersRoutes = require('./users.routes');
const churchesRoutes = require('./churches.routes');
const eventsRoutes = require('./events.routes');
const sermonsRoutes = require('./sermons.routes');
const ministriesRoutes = require('./ministries.routes');
const membershipsRoutes = require('./memberships.routes');
const questionsRoutes = require('./questions.routes');
const publicRoutes = require('./public.routes');

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

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'not-found',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'validation-error',
        message: err.message,
        details: err.details || [],
      },
    });
  }

  // Handle Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Handle Firestore errors
  if (err.code && (err.code.includes('firestore') || err.code === 'not-found')) {
    const status = err.code === 'not-found' ? 404 : 500;
    return res.status(status).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
  }

  // Generic server error
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'internal-error',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    },
  });
});

module.exports = app;
