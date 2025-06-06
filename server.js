const express = require('express');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Backend will be imported directly from the compiled files
const demographicsRoutes = require('./backend/dist/routes/demographics');
const simulationRoutes = require('./backend/dist/routes/simulation');
const suggestionsRoutes = require('./backend/dist/routes/suggestions');

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/demographics', demographicsRoutes.default);
app.use('/api/simulation', simulationRoutes.default);
app.use('/api/suggestions', suggestionsRoutes.default);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// For any other request, send the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
