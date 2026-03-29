const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
}, { _id: false });

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: {
    type: [optionSchema],
    validate: {
      validator: function(v) { return v.length === 4; },
      message: 'A question must have exactly 4 options.',
    },
  },
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  timeLimit: { type: Number, default: 30, min: 10, max: 60 },
  points: { type: Number, default: 100, min: 50, max: 200 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

questionSchema.index({ order: 1 });

module.exports = mongoose.model('Question', questionSchema);
