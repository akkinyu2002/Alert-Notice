const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const emergencyRoutes = require('./routes/emergencyAlerts');
const bloodRequestRoutes = require('./routes/bloodRequests');
const donorResponseRoutes = require('./routes/donorResponses');
const notificationRoutes = require('./routes/notifications');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';
const enableRateLimit = process.env.RATE_LIMIT_ENABLED
  ? process.env.RATE_LIMIT_ENABLED === 'true'
  : isProduction;
const uploadsDir = path.join(__dirname, '..', 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000), // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX || (isProduction ? 100 : 1000)),
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again shortly.' },
});
if (enableRateLimit) {
  app.use('/api/', limiter);
}

// Body parsing
app.use(express.json({ limit: '8mb' }));
app.use('/api/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/emergency-alerts', emergencyRoutes);
app.use('/api/blood-requests', bloodRequestRoutes);
app.use('/api/donor-responses', donorResponseRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
