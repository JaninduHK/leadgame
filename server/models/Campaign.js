const mongoose = require('mongoose');

const campaignQuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{
    label: { type: String, required: true },
    value: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    _id: false,
  }],
  correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
  timeLimit: { type: Number, default: 30, min: 10, max: 60 },
  points: { type: Number, default: 100, min: 50, max: 500 },
  order: { type: Number, default: 0 },
});

// Default email template with variable placeholders
const DEFAULT_EMAIL_TEMPLATE = `<p>Hi {{name}},</p>
<p>Thank you for playing the <strong>{{campaign}}</strong> LEAD GAME!</p>
<p>Your score: <strong>{{score}} points</strong> · Rank: <strong>#{{rank}}</strong> · Accuracy: <strong>{{accuracy}}%</strong></p>
<p>Top players win a fully-funded volunteer placement abroad with AIESEC. Stay tuned!</p>
<p>— AIESEC Malaysia</p>`;

const DEFAULT_WA_TEMPLATE = `Hi {{name}} 👋\n\nThanks for playing the {{campaign}} LEAD GAME!\n\nYour score: *{{score}} pts* | Rank: *#{{rank}}* | Accuracy: *{{accuracy}}%*\n\nTop players win a volunteer placement abroad with AIESEC 🌍\n\nFollow our socials for updates!`;

const DEFAULT_TG_TEMPLATE = `Hi {{name}}! 🎉\n\nYou scored *{{score}} pts* (Rank #{{rank}}) in the {{campaign}} LEAD GAME.\n\nTop scorers get a shot at a fully-funded abroad placement with AIESEC. Good luck! 🌍`;

const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  location: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  videoTitle: { type: String, default: 'Introduction Video' },
  questions: [campaignQuestionSchema],
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  pin: { type: String, unique: true, uppercase: true },
  emailTemplate: { type: String, default: DEFAULT_EMAIL_TEMPLATE },
  whatsappTemplate: { type: String, default: DEFAULT_WA_TEMPLATE },
  telegramTemplate: { type: String, default: DEFAULT_TG_TEMPLATE },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Auto-generate a unique 6-char PIN before save
campaignSchema.pre('validate', async function (next) {
  if (!this.pin) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let pin, exists;
    do {
      pin = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      exists = await mongoose.model('Campaign').findOne({ pin });
    } while (exists);
    this.pin = pin;
  }
  next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
