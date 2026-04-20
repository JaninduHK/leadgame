const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Video = require('../models/Video');
const Campaign = require('../models/Campaign');

const router = express.Router();
router.use(authMiddleware);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const attemptFilter = { isCompleted: true };
    if (req.admin.role !== 'superAdmin') {
      const myCampaigns = await Campaign.find({ admin: req.admin.id }).select('_id');
      attemptFilter.campaign = { $in: myCampaigns.map(c => c._id) };
    }
    const totalPlayers = await Attempt.countDocuments(attemptFilter);
    const avgScoreResult = await Attempt.aggregate([
      { $match: attemptFilter },
      { $group: { _id: null, avgScore: { $avg: '$score' } } },
    ]);
    const avgScore = Math.round(avgScoreResult[0]?.avgScore || 0);
    const volunteerCount = await Attempt.countDocuments({ ...attemptFilter, volunteerInterest: true });
    const volunteerPercent = totalPlayers > 0 ? Math.round((volunteerCount / totalPlayers) * 100) : 0;
    const domains = await Attempt.aggregate([
      { $match: attemptFilter },
      { $project: { domain: { $arrayElemAt: [{ $split: ['$email', '@'] }, 1] } } },
      { $group: { _id: '$domain' } },
      { $count: 'total' },
    ]);
    const universityCount = domains[0]?.total || 0;
    const campaignCount = await Campaign.countDocuments(req.admin.role === 'superAdmin' ? {} : { admin: req.admin.id });
    const recentAttempts = await Attempt.find(attemptFilter)
      .sort({ createdAt: -1 }).limit(10)
      .populate('campaign', 'title')
      .select('name email score timeTaken correctAnswers totalQuestions volunteerInterest createdAt rank campaign');
    res.json({ totalPlayers, avgScore, volunteerPercent, universityCount, campaignCount, recentAttempts });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/attempts
router.get('/attempts', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', volunteerInterest, startDate, endDate, campaignId } = req.query;
    const filter = { isCompleted: true };
    if (req.admin.role !== 'superAdmin') {
      const myCampaigns = await Campaign.find({ admin: req.admin.id }).select('_id');
      filter.campaign = { $in: myCampaigns.map(c => c._id) };
    }
    if (campaignId) filter.campaign = campaignId;
    if (volunteerInterest === 'true') filter.volunteerInterest = true;
    if (volunteerInterest === 'false') filter.volunteerInterest = false;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate + 'T23:59:59');
    }
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    if (sortBy === 'score') sort.timeTaken = 1;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attempt.countDocuments(filter);
    const attempts = await Attempt.find(filter).sort(sort).skip(skip).limit(parseInt(limit))
      .populate('campaign', 'title')
      .select('name email phone score timeTaken correctAnswers totalQuestions volunteerInterest createdAt rank campaign');
    res.json({ attempts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/admin/attempts/export
router.get('/attempts/export', async (req, res) => {
  try {
    const filter = { isCompleted: true };
    if (req.admin.role !== 'superAdmin') {
      const myCampaigns = await Campaign.find({ admin: req.admin.id }).select('_id');
      filter.campaign = { $in: myCampaigns.map(c => c._id) };
    }
    const attempts = await Attempt.find(filter).sort({ score: -1 })
      .populate('campaign', 'title')
      .select('name email phone score timeTaken correctAnswers totalQuestions volunteerInterest createdAt rank campaign');
    const rows = ['Rank,Name,Email,Phone,Campaign,Score,Correct,Total,Time(s),Volunteer,Date',
      ...attempts.map(a => [a.rank, `"${a.name}"`, a.email, a.phone, `"${a.campaign?.title || 'Global'}"`, a.score, a.correctAnswers, a.totalQuestions, a.timeTaken, a.volunteerInterest ? 'Yes' : 'No', new Date(a.createdAt).toISOString()].join(','))];
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="attempts.csv"');
    res.send(rows.join('\n'));
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Questions ─────────────────────────────────────────────────
router.get('/questions', async (req, res) => {
  try { res.json(await Question.find().sort({ order: 1 })); } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/questions', [
  body('text').trim().notEmpty(), body('options').isArray({ min: 4, max: 4 }),
  body('correctAnswer').isIn(['A', 'B', 'C', 'D']), body('timeLimit').isInt({ min: 10, max: 60 }), body('points').isInt({ min: 50, max: 200 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const count = await Question.countDocuments();
    res.status(201).json(await Question.create({ ...req.body, order: count + 1 }));
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/questions/reorder', async (req, res) => {
  try {
    const { orders } = req.body;
    await Promise.all(orders.map(({ id, order }) => Question.findByIdAndUpdate(id, { order })));
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const q = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!q) return res.status(404).json({ error: 'Not found.' });
    res.json(q);
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.delete('/questions/:id', async (req, res) => {
  try { await Question.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// ── Video ─────────────────────────────────────────────────────
router.get('/video', async (req, res) => {
  try { res.json(await Video.find().sort({ updatedAt: -1 })); } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.post('/video', [
  body('title').trim().notEmpty(), body('url').trim().notEmpty(), body('maxViews').isInt({ min: 1, max: 10 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    await Video.updateMany({}, { isActive: false });
    res.status(201).json(await Video.create({ ...req.body, isActive: true, updatedAt: new Date() }));
  } catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

router.put('/video/:id', async (req, res) => {
  try { res.json(await Video.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true })); }
  catch (err) { res.status(500).json({ error: 'Server error.' }); }
});

// DELETE /api/admin/attempts/:id — superAdmin only
router.delete('/attempts/:id', async (req, res) => {
  if (req.admin.role !== 'superAdmin') return res.status(403).json({ error: 'Forbidden.' });
  try {
    const attempt = await Attempt.findByIdAndDelete(req.params.id);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
