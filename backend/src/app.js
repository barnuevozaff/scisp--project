// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const bookRoutes = require('./routes/bookRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// ── Global middleware ─────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Static file serving for uploaded profile pictures, etc.
app.use('/uploads', express.static('uploads'));

// ── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SCISP API is running.', timestamp: new Date().toISOString() });
});

// ── API routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/events', eventRoutes);

// ── Fallbacks ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
