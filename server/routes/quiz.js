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
    const filter = { email };
    if (campaignId) filter.campaign = campaignId;
    const recentAttempts = await Attempt.countDocuments(filter);
    if (recentAttempts >= 1) {
      return res.status(429).json({ error: 'You have already participated in this campaign.' });
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

// GET /api/quiz/video  — requires ?campaignId=
router.get('/video', async (req, res) => {
  try {
    const { campaignId } = req.query;
    if (!campaignId) return res.status(400).json({ error: 'Campaign ID is required.' });
    const campaign = await Campaign.findById(campaignId).select('videoUrl videoTitle isActive');
    if (!campaign || !campaign.isActive) return res.status(404).json({ error: 'Campaign not found or inactive.' });
    if (!campaign.videoUrl) return res.status(404).json({ error: 'No video configured for this campaign.' });
    res.json({ _id: campaign._id, title: campaign.videoTitle || 'Introduction Video', url: campaign.videoUrl, maxViews: 2, isActive: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/quiz/questions  — requires ?campaignId=
router.get('/questions', async (req, res) => {
  try {
    const { campaignId } = req.query;
    if (!campaignId) return res.status(400).json({ error: 'Campaign ID is required.' });
    const campaign = await Campaign.findById(campaignId).select('questions isActive');
    if (!campaign || !campaign.isActive) return res.status(404).json({ error: 'Campaign not found or inactive.' });
    if (!campaign.questions?.length) return res.status(404).json({ error: 'No questions configured for this campaign.' });
    const qs = campaign.questions
      .sort((a, b) => a.order - b.order)
      .map(q => {
        const obj = q.toObject();
        delete obj.correctAnswer;
        obj.options = [...obj.options].sort(() => Math.random() - 0.5);
        return obj;
      });
    res.json(qs);
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

    // Load questions — campaign-specific only
    if (!attempt.campaign) return res.status(400).json({ error: 'No campaign associated with this session.' });
    const campaign = await Campaign.findById(attempt.campaign).select('questions emailTemplate whatsappTemplate telegramTemplate title');
    if (!campaign?.questions?.length) return res.status(400).json({ error: 'No questions found for this campaign.' });
    const questions = campaign.questions;

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

    // Campaign templates (campaign already loaded above)
    const emailTemplate = campaign.emailTemplate;
    const whatsappTemplate = campaign.whatsappTemplate;
    const telegramTemplate = campaign.telegramTemplate;
    const campaignTitle = campaign.title;

    sendResultEmail({ name: attempt.name, email: attempt.email, score: serverScore, rank, totalPlayers, correctAnswers: correctCount, totalQuestions: questions.length, emailTemplate, campaignTitle }).catch(console.error);

    res.json({ score: serverScore, correctAnswers: correctCount, totalQuestions: questions.length, timeTaken: clampedTime, rank, totalPlayers, sessionId });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Server error during submission.' });
  }
});

module.exports = router;
