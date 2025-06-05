import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import demographicsRoutes from './routes/demographics';
import simulationRoutes from './routes/simulation';
import suggestionsRoutes from './routes/suggestions';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add a simple test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    routes: [
      'GET /health',
      'GET /api/test',
      'POST /api/demographics/generate',
      'POST /api/simulation/response',
      'POST /api/simulation/batch',
      'POST /api/suggestions/generate'
    ]
  });
});

// Routes
app.use('/api/demographics', demographicsRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/suggestions', suggestionsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple route listing without TypeScript issues
console.log('\n=== EXPECTED ROUTES ===');
console.log('GET /health');
console.log('GET /api/test');
console.log('POST /api/demographics/generate');
console.log('POST /api/simulation/response');
console.log('POST /api/simulation/batch');
console.log('POST /api/suggestions/generate');
console.log('========================\n');

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`Suggestions endpoint: http://localhost:${PORT}/api/suggestions/generate`);
});

export default app;
