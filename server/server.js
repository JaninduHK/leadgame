require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// General rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Default questions for seeding
const defaultQuestions = [
  {
    text: 'What does AIESEC stand for?',
    options: [
      { label: 'Association Internationale des Étudiants en Sciences Économiques et Commerciales', value: 'A' },
      { label: 'Asian International Exchange Student Economic Club', value: 'B' },
      { label: 'Association of International Exchange Students for Education and Commerce', value: 'C' },
      { label: 'Advanced International Exchange for Students in Economics and Commerce', value: 'D' },
    ],
    correctAnswer: 'A',
    timeLimit: 30,
    points: 100,
    order: 1,
    isActive: true,
  },
  {
    text: 'How many countries and territories does AIESEC operate in?',
    options: [
      { label: 'Around 50 countries', value: 'A' },
      { label: 'Around 80 countries', value: 'B' },
      { label: 'Around 120 countries and territories', value: 'C' },
      { label: 'Around 200 countries', value: 'D' },
    ],
    correctAnswer: 'C',
    timeLimit: 25,
    points: 100,
    order: 2,
    isActive: true,
  },
  {
    text: 'What is AIESEC\'s core purpose?',
    options: [
      { label: 'To provide scholarship opportunities for students', value: 'A' },
      { label: 'Peace and the fulfilment of humankind\'s potential', value: 'B' },
      { label: 'To develop professional marketing skills', value: 'C' },
      { label: 'To promote international trade between nations', value: 'D' },
    ],
    correctAnswer: 'B',
    timeLimit: 25,
    points: 100,
    order: 3,
    isActive: true,
  },
  {
    text: 'Which AIESEC program focuses on short-term volunteering projects abroad?',
    options: [
      { label: 'Global Talent', value: 'A' },
      { label: 'Global Teacher', value: 'B' },
      { label: 'Global Volunteer', value: 'C' },
      { label: 'Global Exchange', value: 'D' },
    ],
    correctAnswer: 'C',
    timeLimit: 20,
    points: 100,
    order: 4,
    isActive: true,
  },
  {
    text: 'The Global Talent program primarily offers what type of experience?',
    options: [
      { label: 'Teaching English to children abroad', value: 'A' },
      { label: 'Professional internships and career development worldwide', value: 'B' },
      { label: 'Environmental conservation volunteering', value: 'C' },
      { label: 'Cultural tourism and heritage visits', value: 'D' },
    ],
    correctAnswer: 'B',
    timeLimit: 25,
    points: 100,
    order: 5,
    isActive: true,
  },
  {
    text: 'In which year was AIESEC founded?',
    options: [
      { label: '1948', value: 'A' },
      { label: '1965', value: 'B' },
      { label: '1955', value: 'C' },
      { label: '1972', value: 'D' },
    ],
    correctAnswer: 'A',
    timeLimit: 20,
    points: 150,
    order: 6,
    isActive: true,
  },
  {
    text: 'AIESEC in Malaysia is headquartered in which city?',
    options: [
      { label: 'Penang', value: 'A' },
      { label: 'Johor Bahru', value: 'B' },
      { label: 'Kuala Lumpur', value: 'C' },
      { label: 'Kuching', value: 'D' },
    ],
    correctAnswer: 'C',
    timeLimit: 20,
    points: 100,
    order: 7,
    isActive: true,
  },
  {
    text: 'Which United Nations Sustainable Development Goal is AIESEC most aligned with?',
    options: [
      { label: 'Zero Hunger', value: 'A' },
      { label: 'Quality Education', value: 'B' },
      { label: 'Peace, Justice and Strong Institutions', value: 'C' },
      { label: 'All SDGs through youth leadership', value: 'D' },
    ],
    correctAnswer: 'D',
    timeLimit: 30,
    points: 100,
    order: 8,
    isActive: true,
  },
];

// Lazy DB connection — reuses connection across serverless invocations
let dbConnected = false;

async function connectDB() {
  if (dbConnected && mongoose.connection.readyState === 1) return;

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aiesec-quiz');
  dbConnected = true;
  console.log('✅ Connected to MongoDB');

  // Seed admin
  const bcrypt = require('bcryptjs');
  const Admin = require('./models/Admin');
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await Admin.create({
      email: process.env.ADMIN_EMAIL || 'admin@aiesec.org.my',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12),
      name: 'AIESEC Super Admin',
      role: 'superAdmin',
      lcName: 'AIESEC Malaysia',
    });
    console.log('✅ Super admin user created');
  } else if (!existingAdmin.role || existingAdmin.role !== 'superAdmin') {
    await Admin.findByIdAndUpdate(existingAdmin._id, { role: 'superAdmin', lcName: existingAdmin.lcName || 'AIESEC Malaysia' });
    console.log('✅ Existing admin upgraded to superAdmin');
  }

  // Seed questions
  const Question = require('./models/Question');
  const questionCount = await Question.countDocuments();
  if (questionCount === 0) {
    await Question.insertMany(defaultQuestions);
    console.log('✅ Default questions seeded');
  }

  // Seed video
  const Video = require('./models/Video');
  const videoCount = await Video.countDocuments();
  if (videoCount === 0) {
    await Video.create({
      title: 'AIESEC in Malaysia - Discover Your Potential',
      url: 'https://youtu.be/y_GpIJFM51k?si=OLk4QgFgNWjlrwuP',
      maxViews: 2,
      isActive: true,
    });
    console.log('✅ Default video seeded');
  }
}

// Connect DB before every request (no-op if already connected)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ DB connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Only listen locally — Vercel handles this in production
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 AIESEC Quiz Server running on port ${PORT}`);
  });
}

module.exports = app;
