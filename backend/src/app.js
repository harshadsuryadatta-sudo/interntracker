const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const internRoutes = require('./routes/intern.routes');
const reportRoutes = require('./routes/report.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const instagramRoutes = require('./routes/instagram.routes');
const adminRoutes = require('./routes/admin.routes');
const exportRoutes = require('./routes/export.routes');

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.netlify.app')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Intern Report Tracker API',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interns', internRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/instagram', instagramRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/export', exportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

