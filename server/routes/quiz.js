const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('crypto').webcrypto ? 
  { v4: () => require('crypto').randomUUID() } : 
  { v4: () => require('crypto').randomUUID() };
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Video = require('../models/Video');
const { sendResultEmail } = require('../utils/sendEmail');

const router = express.Router();

// Scoring algorithm (mirrors client-side)
function calculateScore(answers, questions) {
  let totalScore = 0;
  answers.forEach((answer) => {
    const question = questions.find(q => q._id.toString() === answer.questionId.toString());
    if (!question) return;
    if (answer.isCorrect) {
      const basePoints = question.points || 100;
      const timeLimit = question.timeLimit || 30;
      const timeTaken = answer.timeTaken || 0;
      const speedMultiplier = Math.max(0.5, (timeLimit - timeTaken) / timeLimit);
      totalScore += Math.round(basePoints * (1 + speedMultiplier));
    }
  });
  return totalScore;
}

// POST /api/quiz/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, consent } = req.body;

    try {
      // Rate limiting: max 3 attempts per email per day
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentAttempts = await Attempt.countDocuments({
        email,
        createdAt: { $gte: oneDayAgo },
      });

      if (recentAttempts >= 3) {
        return res.status(429).json({
          error: 'Maximum 3 quiz attempts per day reached. Please try again tomorrow.',
        });
      }

      const sessionId = require('crypto').randomUUID();
      const attempt = await Attempt.create({
        sessionId,
        name,
        email,
        phone,
        isCompleted: false,
      });

      res.status(201).json({ sessionId, attemptId: attempt._id, name, email });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Server error during registration.' });
    }
  }
);

// GET /api/quiz/video
router.get('/video', async (req, res) => {
  try {
    const video = await Video.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!video) {
      return res.status(404).json({ error: 'No active video found.' });
    }
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/quiz/questions
router.get('/questions', async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true })
      .sort({ order: 1 })
      .select('-correctAnswer'); // Don't expose correct answers

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No active questions found.' });
    }

    // Shuffle options for each question
    const shuffledQuestions = questions.map(q => {
      const qObj = q.toObject();
      // Shuffle the options array order (but keep A/B/C/D values intact)
      const shuffled = [...qObj.options].sort(() => Math.random() - 0.5);
      return { ...qObj, options: shuffled };
    });

    res.json(shuffledQuestions);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/quiz/submit
router.post(
  '/submit',
  [
    body('sessionId').notEmpty(),
    body('answers').isArray({ min: 1 }),
    body('volunteerInterest').isBoolean(),
    body('totalTimeTaken').isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, answers, volunteerInterest, totalTimeTaken } = req.body;

    try {
      // Find the attempt
      const attempt = await Attempt.findOne({ sessionId });
      if (!attempt) {
        return res.status(404).json({ error: 'Session not found.' });
      }

      if (attempt.isCompleted) {
        return res.status(400).json({ error: 'This quiz has already been submitted.' });
      }

      // Get questions for server-side validation
      const questionIds = answers.map(a => a.questionId);
      const questions = await Question.find({ _id: { $in: questionIds }, isActive: true });

      if (questions.length === 0) {
        return res.status(400).json({ error: 'No valid questions found.' });
      }

      // Server-side answer validation & scoring
      const validatedAnswers = answers.map(answer => {
        const question = questions.find(q => q._id.toString() === answer.questionId);
        if (!question) return { ...answer, isCorrect: false };
        const isCorrect = answer.selectedOption === question.correctAnswer;
        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
          timeTaken: Math.min(answer.timeTaken || 0, question.timeLimit + 2),
        };
      });

      // Server-side score calculation (ignores client-submitted score)
      const serverScore = calculateScore(validatedAnswers, questions);
      const correctCount = validatedAnswers.filter(a => a.isCorrect).length;
      const clampedTime = Math.min(totalTimeTaken, 3600);

      // Update attempt
      attempt.answers = validatedAnswers;
      attempt.score = serverScore;
      attempt.timeTaken = clampedTime;
      attempt.correctAnswers = correctCount;
      attempt.totalQuestions = questions.length;
      attempt.volunteerInterest = volunteerInterest;
      attempt.isCompleted = true;
      await attempt.save();

      // Calculate rank
      const betterCount = await Attempt.countDocuments({
        isCompleted: true,
        $or: [
          { score: { $gt: serverScore } },
          { score: serverScore, timeTaken: { $lt: clampedTime } },
        ],
      });
      const rank = betterCount + 1;
      attempt.rank = rank;
      await attempt.save();

      const totalPlayers = await Attempt.countDocuments({ isCompleted: true });

      // Send email (non-blocking)
      sendResultEmail({
        name: attempt.name,
        email: attempt.email,
        score: serverScore,
        rank,
        totalPlayers,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
      }).catch(console.error);

      res.json({
        score: serverScore,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
        timeTaken: clampedTime,
        rank,
        totalPlayers,
        sessionId,
      });
    } catch (err) {
      console.error('Submit error:', err);
      res.status(500).json({ error: 'Server error during submission.' });
    }
  }
);

module.exports = router;
