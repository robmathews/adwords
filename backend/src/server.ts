// backend/src/server.ts
// Updated server with MySQL database and global leaderboard support

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import demographicsRoutes from './routes/demographics';
import simulationRoutes from './routes/simulation';
import suggestionsRoutes from './routes/suggestions';
import leaderboardRoutes from './routes/leaderboard';
import { testConnection, initializeDatabase, closeDatabase } from './config/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'AdWords Tycoon Backend is working!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /health',
      'GET /api/test',
      'POST /api/demographics/generate',
      'POST /api/simulation/response',
      'POST /api/simulation/batch',
      'POST /api/suggestions/generate',
      'POST /api/suggestions/optimized',
      'GET /api/leaderboard',
      'POST /api/leaderboard',
      'GET /api/leaderboard/stats',
      'GET /api/leaderboard/player/:playerName',
      'GET /api/leaderboard/qualify',
      'GET /api/leaderboard/recent'
    ]
  });
});

// Routes
app.use('/api/demographics', demographicsRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/suggestions', suggestionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes); // New global leaderboard routes

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AdWords Tycoon Backend'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/test',
      'POST /api/demographics/generate',
      'POST /api/simulation/response',
      'POST /api/simulation/batch',
      'POST /api/suggestions/generate',
      'POST /api/suggestions/optimized',
      'GET /api/leaderboard',
      'POST /api/leaderboard',
      'GET /api/leaderboard/stats',
      'GET /api/leaderboard/player/:playerName',
      'GET /api/leaderboard/qualify',
      'GET /api/leaderboard/recent'
    ]
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting AdWords Tycoon Backend...');

    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Database connection failed. Please check your MySQL configuration.');
      process.exit(1);
    }

    // Initialize database (create tables)
    await initializeDatabase();

    // Start server
    const server = app.listen(PORT, () => {
      console.log('\n=== ADWORDS TYCOON BACKEND ===');
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`🏆 Leaderboard: http://localhost:${PORT}/api/leaderboard`);
      console.log(`📊 Stats: http://localhost:${PORT}/api/leaderboard/stats`);
      console.log('===============================\n');
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n📢 Received ${signal}. Starting graceful shutdown...`);

      server.close(async () => {
        console.log('🔒 HTTP server closed');

        try {
          await closeDatabase();
          console.log('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('❌ Error during shutdown:', error);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
