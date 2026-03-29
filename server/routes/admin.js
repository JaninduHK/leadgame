const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Video = require('../models/Video');

const router = express.Router();
router.use(authMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const totalPlayers = await Attempt.countDocuments({ isCompleted: true });
    const avgScoreResult = await Attempt.aggregate([
      { $match: { isCompleted: true } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } },
    ]);
    const avgScore = Math.round(avgScoreResult[0]?.avgScore || 0);

    const volunteerCount = await Attempt.countDocuments({ isCompleted: true, volunteerInterest: true });
    const volunteerPercent = totalPlayers > 0 ? Math.round((volunteerCount / totalPlayers) * 100) : 0;

    // University count from unique email domains
    const domains = await Attempt.aggregate([
      { $match: { isCompleted: true } },
      { $project: { domain: { $arrayElemAt: [{ $split: ['$email', '@'] }, 1] } } },
      { $group: { _id: '$domain' } },
      { $count: 'total' },
    ]);
    const universityCount = domains[0]?.total || 0;

    // Recent attempts
    const recentAttempts = await Attempt.find({ isCompleted: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name email score timeTaken correctAnswers totalQuestions volunteerInterest createdAt rank');

    res.json({
      totalPlayers,
      avgScore,
      volunteerPercent,
      universityCount,
      recentAttempts,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/attempts
router.get('/attempts', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      volunteerInterest,
      startDate,
      endDate,
    } = req.query;

    const filter = { isCompleted: true };
    if (volunteerInterest === 'true') filter.volunteerInterest = true;
    if (volunteerInterest === 'false') filter.volunteerInterest = false;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    if (sortBy === 'score') sort.timeTaken = 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attempt.countDocuments(filter);
    const attempts = await Attempt.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('name email phone score timeTaken correctAnswers totalQuestions volunteerInterest rank createdAt');

    res.json({
      attempts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    console.error('Attempts error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/attempts/export - CSV export
router.get('/attempts/export', async (req, res) => {
  try {
    const attempts = await Attempt.find({ isCompleted: true })
      .sort({ score: -1, timeTaken: 1 })
      .select('name email phone score timeTaken correctAnswers totalQuestions volunteerInterest rank createdAt');

    const csvRows = [
      ['Rank', 'Name', 'Email', 'Phone', 'Score', 'Time (s)', 'Correct', 'Total', 'Volunteer Interest', 'Date'].join(','),
      ...attempts.map((a, i) =>
        [
          i + 1,
          `"${a.name}"`,
          a.email,
          a.phone,
          a.score,
          a.timeTaken,
          a.correctAnswers,
          a.totalQuestions,
          a.volunteerInterest ? 'Yes' : 'No',
          new Date(a.createdAt).toLocaleDateString(),
        ].join(',')
      ),
    ];

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="aiesec_quiz_attempts.csv"');
    res.send(csvRows.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find().sort({ order: 1 });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/questions
router.post(
  '/questions',
  [
    body('text').trim().notEmpty(),
    body('options').isArray({ min: 4, max: 4 }),
    body('correctAnswer').isIn(['A', 'B', 'C', 'D']),
    body('timeLimit').isInt({ min: 10, max: 60 }),
    body('points').isInt({ min: 50, max: 200 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const maxOrder = await Question.findOne().sort({ order: -1 }).select('order');
      const order = (maxOrder?.order || 0) + 1;
      const question = await Question.create({ ...req.body, order });
      res.status(201).json(question);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found.' });
    res.json({ message: 'Question deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/admin/questions/reorder
router.put('/questions/reorder', async (req, res) => {
  try {
    const { orders } = req.body; // [{ id, order }]
    await Promise.all(orders.map(({ id, order }) =>
      Question.findByIdAndUpdate(id, { order })
    ));
    res.json({ message: 'Questions reordered.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/video
router.get('/video', async (req, res) => {
  try {
    const videos = await Video.find().sort({ updatedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/admin/video
router.post(
  '/video',
  [
    body('title').trim().notEmpty(),
    body('url').trim().notEmpty(),
    body('maxViews').isInt({ min: 1, max: 10 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      // Deactivate existing videos
      await Video.updateMany({}, { isActive: false });
      const video = await Video.create({ ...req.body, isActive: true, updatedAt: new Date() });
      res.status(201).json(video);
    } catch (err) {
      res.status(500).json({ error: 'Server error.' });
    }
  }
);

// PUT /api/admin/video/:id
router.put('/video/:id', async (req, res) => {
  try {
    const video = await Video.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true }
    );
    if (!video) return res.status(404).json({ error: 'Video not found.' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
