const express    = require('express');
const cors       = require('cors');
const dotenv     = require('dotenv');
const connectDB  = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// ── Validate required env vars BEFORE doing anything ─────────────────────
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
  console.error('\n❌  Missing required environment variables:', missing.join(', '));
  console.error('   Create a .env file in the backend/ folder (see .env.example)\n');
  process.exit(1);
}

connectDB();

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────
// Allow all origins in development; restrict to CLIENT_URL in production
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL || 'http://localhost:5173'
    : true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.options('*', cors());

// ── Body parsers ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',  require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));

// Health / debug — visit http://localhost:5000/api/health to verify setup
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  res.json({
    status:    'ok',
    env:       process.env.NODE_ENV || 'development',
    mongo:     mongoose.connection.readyState === 1 ? '✅ connected' : '❌ not connected',
    mongoUri:  process.env.MONGO_URI   ? '✅ set' : '❌ MISSING',
    jwtSecret: process.env.JWT_SECRET  ? '✅ set' : '❌ MISSING',
  });
});

// 404
app.use('*', (req, res) =>
  res.status(404).json({ success: false, message: `${req.method} ${req.originalUrl} not found` })
);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}  [${process.env.NODE_ENV || 'development'}]`)
);

// Catch unhandled promise rejections (e.g. mongoose errors outside request cycle)
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
});
