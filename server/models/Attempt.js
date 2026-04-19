const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.Mixed }, // ObjectId or embedded campaign question _id
  selectedOption: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
  isCorrect: { type: Boolean, default: false },
  timeTaken: { type: Number, default: 0 },
}, { _id: false });

const attemptSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  score: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  correctAnswers: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  answers: [answerSchema],
  volunteerInterest: { type: Boolean, default: false },
  rank: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
});

attemptSchema.index({ campaign: 1, score: -1, timeTaken: 1 });
attemptSchema.index({ score: -1, timeTaken: 1 });
attemptSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('Attempt', attemptSchema);
