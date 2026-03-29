const express = require('express');
const Attempt = require('../models/Attempt');

const router = express.Router();

// GET /api/leaderboard
router.get('/', async (req, res) => {
  try {
    const leaderboard = await Attempt.find({ isCompleted: true })
      .sort({ score: -1, timeTaken: 1 })
      .limit(50)
      .select('name email score timeTaken correctAnswers totalQuestions rank volunteerInterest createdAt');

    const total = await Attempt.countDocuments({ isCompleted: true });

    // Recalculate ranks
    const ranked = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1,
    }));

    res.json({ leaderboard: ranked, total });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/leaderboard/stats
router.get('/stats', async (req, res) => {
  try {
    const total = await Attempt.countDocuments({ isCompleted: true });
    const avgScoreResult = await Attempt.aggregate([
      { $match: { isCompleted: true } },
      { $group: { _id: null, avgScore: { $avg: '$score' } } },
    ]);
    const avgScore = avgScoreResult[0]?.avgScore || 0;

    res.json({
      totalPlayers: total,
      avgScore: Math.round(avgScore),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
