const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const Campaign = require('../models/Campaign');
const Attempt = require('../models/Attempt');

const router = express.Router();

// ── PUBLIC ────────────────────────────────────────────────────

// GET /api/campaigns  — active campaigns for leaderboard page
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ isActive: true })
      .populate('admin', 'name lcName location')
      .sort({ startTime: 1 })
      .select('-questions -emailTemplate -whatsappTemplate -telegramTemplate');
    res.json({ campaigns });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/campaigns/validate-pin  — validate a PIN and return campaign info
router.post('/validate-pin', async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: 'PIN is required.' });
    const campaign = await Campaign.findOne({ pin: pin.toUpperCase().trim(), isActive: true })
      .populate('admin', 'name lcName location')
      .select('_id title pin location startTime endTime admin');
    if (!campaign) return res.status(404).json({ error: 'Invalid or expired PIN. Please check and try again.' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/campaigns/:id  — single campaign (public info only)
router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('admin', 'name lcName location')
      .select('-emailTemplate -whatsappTemplate -telegramTemplate');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/campaigns/:id/leaderboard  — campaign leaderboard
router.get('/:id/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Attempt.find({ campaign: req.params.id, isCompleted: true })
      .sort({ score: -1, timeTaken: 1 })
      .limit(50)
      .select('name email score timeTaken correctAnswers totalQuestions rank createdAt');
    const total = await Attempt.countDocuments({ campaign: req.params.id, isCompleted: true });
    res.json({ leaderboard, total });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── PROTECTED ─────────────────────────────────────────────────

// GET /api/campaigns/admin/mine  — campaigns for the logged-in admin
router.get('/admin/mine', authMiddleware, async (req, res) => {
  try {
    const filter = req.admin.role === 'superAdmin' ? {} : { admin: req.admin.id };
    const campaigns = await Campaign.find(filter)
      .populate('admin', 'name lcName location')
      .sort({ createdAt: -1 })
      .select('-emailTemplate -whatsappTemplate -telegramTemplate');
    // Attach entry counts
    const withCounts = await Promise.all(campaigns.map(async (c) => {
      const count = await Attempt.countDocuments({ campaign: c._id, isCompleted: true });
      return { ...c.toObject(), entryCount: count };
    }));
    res.json({ campaigns: withCounts });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/campaigns/admin/:id/full  — full campaign (with templates) for editing
router.get('/admin/:id/full', authMiddleware, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.admin.role !== 'superAdmin') filter.admin = req.admin.id;
    const campaign = await Campaign.findOne(filter).populate('admin', 'name lcName');
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/campaigns  — create campaign
router.post('/', authMiddleware, [
  body('title').trim().notEmpty().withMessage('Title is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const campaign = new Campaign({ ...req.body, admin: req.admin.id });
    await campaign.save();
    res.status(201).json({ campaign });
  } catch (err) {
    console.error('Create campaign error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/campaigns/:id  — update campaign
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.admin.role !== 'superAdmin') filter.admin = req.admin.id;
    const campaign = await Campaign.findOneAndUpdate(filter, req.body, { new: true, runValidators: true });
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ campaign });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/campaigns/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.admin.role !== 'superAdmin') filter.admin = req.admin.id;
    const campaign = await Campaign.findOneAndDelete(filter);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/campaigns/:id/entries  — entries for a campaign (admin)
router.get('/:id/entries', authMiddleware, async (req, res) => {
  try {
    const filter = { _id: req.params.id };
    if (req.admin.role !== 'superAdmin') filter.admin = req.admin.id;
    const campaign = await Campaign.findOne(filter);
    if (!campaign) return res.status(403).json({ error: 'Not authorised.' });

    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Attempt.countDocuments({ campaign: req.params.id, isCompleted: true });
    const entries = await Attempt.find({ campaign: req.params.id, isCompleted: true })
      .sort({ score: -1, timeTaken: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('name email phone score timeTaken correctAnswers totalQuestions rank volunteerInterest createdAt');
    res.json({ entries, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
