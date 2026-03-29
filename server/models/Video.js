const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  maxViews: { type: Number, default: 2, min: 1, max: 10 },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Video', videoSchema);
