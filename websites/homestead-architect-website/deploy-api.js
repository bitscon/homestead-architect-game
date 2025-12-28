// OVH VPS Deployment Script
// Save this as deploy-api.js on your VPS

const express = require('express');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Use the existing checkout session handler
const createCheckoutSession = require('./api/create-checkout-session');

app.use(express.json());

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Checkout session endpoint
app.post('/api/create-checkout-session', createCheckoutSession.default);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Homestead Architect API running on port ${PORT}`);
  console.log(`Health check: http://your-server-ip:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});