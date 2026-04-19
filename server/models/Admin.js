const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superAdmin', 'lc'], default: 'lc' },
  lcName: { type: String, default: '' },   // Display name for the LC
  location: { type: String, default: '' }, // City / campus
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Admin', adminSchema);
