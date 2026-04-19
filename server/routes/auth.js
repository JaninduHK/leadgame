const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign(
      { id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role, lcName: admin.lcName, location: admin.location } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/auth/me — get current admin profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ error: 'Not found.' });
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Super Admin: Manage LC admins ────────────────────────────

// GET /api/auth/admins — list all admins (superAdmin only)
router.get('/admins', authMiddleware, async (req, res) => {
  if (req.admin.role !== 'superAdmin') return res.status(403).json({ error: 'Forbidden.' });
  try {
    const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
    res.json({ admins });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/admins — create LC admin (superAdmin only)
router.post('/admins', authMiddleware, [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  if (req.admin.role !== 'superAdmin') return res.status(403).json({ error: 'Forbidden.' });
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
  try {
    const { name, email, password, lcName, location, role } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already in use.' });
    const hashed = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ name, email, password: hashed, lcName: lcName || name, location: location || '', role: role === 'superAdmin' ? 'superAdmin' : 'lc' });
    res.status(201).json({ admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role, lcName: admin.lcName, location: admin.location } });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PUT /api/auth/admins/:id — update admin (superAdmin only)
router.put('/admins/:id', authMiddleware, async (req, res) => {
  if (req.admin.role !== 'superAdmin') return res.status(403).json({ error: 'Forbidden.' });
  try {
    const { name, lcName, location, role, password } = req.body;
    const update = { name, lcName, location, role };
    if (password) update.password = await bcrypt.hash(password, 12);
    const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json({ admin });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/auth/admins/:id (superAdmin only)
router.delete('/admins/:id', authMiddleware, async (req, res) => {
  if (req.admin.role !== 'superAdmin') return res.status(403).json({ error: 'Forbidden.' });
  if (req.params.id === req.admin.id) return res.status(400).json({ error: 'Cannot delete yourself.' });
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
