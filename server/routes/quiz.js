const express = require('express');
const { body, validationResult } = require('express-validator');
const Attempt = require('../models/Attempt');
const Question = require('../models/Question');
const Video = require('../models/Video');
const Campaign = require('../models/Campaign');
const { sendResultEmail } = require('../utils/sendEmail');

const router = express.Router();

function calculateScore(answers, questions) {
  let totalScore = 0;
  answers.forEach((answer) => {
    const question = questions.find(q => q._id.toString() === answer.questionId?.toString());
    if (!question || !answer.isCorrect) return;
    const basePoints = question.points || 100;
    const timeLimit = question.timeLimit || 30;
    const speedMultiplier = Math.max(0.5, (timeLimit - (answer.timeTaken || 0)) / timeLimit);
    totalScore += Math.round(basePoints * (1 + speedMultiplier));
  });
  return totalScore;
}

// POST /api/quiz/register
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { name, email, phone, campaignId } = req.body;
  try {
    // Rate limiting: max 3 per email per day per campaign
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const filter = { email, createdAt: { $gte: oneDayAgo } };
    if (campaignId) filter.campaign = campaignId;
    const recentAttempts = await Attempt.countDocuments(filter);
    if (recentAttempts >= 3) {
      return res.status(429).json({ error: 'Maximum 3 attempts per day reached. Try again tomorrow.' });
    }

    // Validate campaign if provided
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign || !campaign.isActive) {
        return res.status(404).json({ error: 'Campaign not found or inactive.' });
      }
    }

    const sessionId = require('crypto').randomUUID();
    await Attempt.create({ sessionId, name, email, phone, campaign: campaignId || null, isCompleted: false });
    res.status(201).json({ sessionId, name, email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// GET /api/quiz/video  — accepts ?campaignId=
router.get('/video', async (req, res) => {
  try {
    const { campaignId } = req.query;
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId).select('videoUrl videoTitle');
      if (campaign?.videoUrl) {
        return res.json({ _id: campaign._id, title: campaign.videoTitle || 'Introduction Video', url: campaign.videoUrl, maxViews: 2, isActive: true });
      }
    }
    const video = await Video.findOne({ isActive: true }).sort({ updatedAt: -1 });
    if (!video) return res.status(404).json({ error: 'No active video found.' });
    res.json(video);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/quiz/questions  — accepts ?campaignId=
router.get('/questions', async (req, res) => {
  try {
    const { campaignId } = req.query;
    if (campaignId) {
      const campaign = await Campaign.findById(campaignId).select('questions');
      if (campaign?.questions?.length > 0) {
        const qs = campaign.questions
          .sort((a, b) => a.order - b.order)
          .map(q => {
            const obj = q.toObject();
            delete obj.correctAnswer; // don't leak answers
            obj.options = [...obj.options].sort(() => Math.random() - 0.5);
            return obj;
          });
        return res.json(qs);
      }
    }
    // Fallback to global questions
    const questions = await Question.find({ isActive: true }).sort({ order: 1 }).select('-correctAnswer');
    if (!questions.length) return res.status(404).json({ error: 'No questions found.' });
    res.json(questions.map(q => ({ ...q.toObject(), options: [...q.toObject().options].sort(() => Math.random() - 0.5) })));
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/quiz/submit
router.post('/submit', [
  body('sessionId').notEmpty(),
  body('answers').isArray({ min: 1 }),
  body('volunteerInterest').isBoolean(),
  body('totalTimeTaken').isNumeric(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });

  const { sessionId, answers, volunteerInterest, totalTimeTaken } = req.body;
  try {
    const attempt = await Attempt.findOne({ sessionId });
    if (!attempt) return res.status(404).json({ error: 'Session not found.' });
    if (attempt.isCompleted) return res.status(400).json({ error: 'Quiz already submitted.' });

    // Load questions — campaign-specific or global
    let questions = [];
    if (attempt.campaign) {
      const campaign = await Campaign.findById(attempt.campaign).select('questions emailTemplate whatsappTemplate telegramTemplate title');
      if (campaign?.questions?.length > 0) {
        questions = campaign.questions;
      }
    }
    if (!questions.length) {
      const questionIds = answers.map(a => a.questionId);
      questions = await Question.find({ _id: { $in: questionIds }, isActive: true });
    }
    if (!questions.length) return res.status(400).json({ error: 'No valid questions found.' });

    // Server-side validation
    const validatedAnswers = answers.map(answer => {
      const question = questions.find(q => q._id.toString() === answer.questionId?.toString());
      if (!question) return { questionId: answer.questionId, selectedOption: answer.selectedOption, isCorrect: false, timeTaken: 0 };
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect: answer.selectedOption === question.correctAnswer,
        timeTaken: Math.min(answer.timeTaken || 0, (question.timeLimit || 30) + 2),
      };
    });

    const serverScore = calculateScore(validatedAnswers, questions);
    const correctCount = validatedAnswers.filter(a => a.isCorrect).length;
    const clampedTime = Math.min(totalTimeTaken, 3600);

    attempt.answers = validatedAnswers;
    attempt.score = serverScore;
    attempt.timeTaken = clampedTime;
    attempt.correctAnswers = correctCount;
    attempt.totalQuestions = questions.length;
    attempt.volunteerInterest = volunteerInterest;
    attempt.isCompleted = true;
    await attempt.save();

    // Rank within campaign (or global)
    const rankFilter = { isCompleted: true };
    if (attempt.campaign) rankFilter.campaign = attempt.campaign;
    const betterCount = await Attempt.countDocuments({
      ...rankFilter,
      $or: [{ score: { $gt: serverScore } }, { score: serverScore, timeTaken: { $lt: clampedTime } }],
    });
    const rank = betterCount + 1;
    attempt.rank = rank;
    await attempt.save();
    const totalPlayers = await Attempt.countDocuments(rankFilter);

    // Get campaign templates if applicable
    let emailTemplate, whatsappTemplate, telegramTemplate, campaignTitle;
    if (attempt.campaign) {
      const campaign = await Campaign.findById(attempt.campaign).select('emailTemplate whatsappTemplate telegramTemplate title');
      emailTemplate = campaign?.emailTemplate;
      whatsappTemplate = campaign?.whatsappTemplate;
      telegramTemplate = campaign?.telegramTemplate;
      campaignTitle = campaign?.title;
    }

    sendResultEmail({ name: attempt.name, email: attempt.email, score: serverScore, rank, totalPlayers, correctAnswers: correctCount, totalQuestions: questions.length, emailTemplate, campaignTitle }).catch(console.error);

    res.json({ score: serverScore, correctAnswers: correctCount, totalQuestions: questions.length, timeTaken: clampedTime, rank, totalPlayers, sessionId });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error during submission.' });
  }
});

module.exports = router;
