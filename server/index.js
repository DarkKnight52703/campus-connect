require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const { startScheduler } = require('./cron/scheduler');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const pingRoute = require('./routes/ping');

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Allow: no origin (curl/Postman), localhost, any vercel.app subdomain, and the configured FRONTEND_URL
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:3000',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin) || /\.vercel\.app$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/ping', pingRoute);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'Campus Connect API running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDB();
  startScheduler();
});
