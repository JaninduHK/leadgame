const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendResultEmail = async ({ name, email, score, rank, totalPlayers, correctAnswers, totalQuestions }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('Email not configured, skipping email send.');
    return;
  }

  const transporter = createTransporter();
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your AIESEC Quiz Results</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#037EF3,#0DB14B);padding:40px 30px;text-align:center;">
            <div style="color:white;font-size:28px;font-weight:900;letter-spacing:-0.5px;">AIESEC MALAYSIA</div>
            <div style="color:rgba(255,255,255,0.85);font-size:14px;margin-top:4px;">Activating Leadership. Impacting Communities.</div>
          </td>
        </tr>
        <!-- Congrats Banner -->
        <tr>
          <td style="background:#0A1628;padding:30px;text-align:center;">
            <div style="color:#FFC845;font-size:40px;margin-bottom:8px;">🎉</div>
            <div style="color:#ffffff;font-size:26px;font-weight:800;">Congratulations, ${name}!</div>
            <div style="color:rgba(255,255,255,0.7);font-size:16px;margin-top:8px;">You completed the AIESEC Malaysia Quiz!</div>
          </td>
        </tr>
        <!-- Score Cards -->
        <tr>
          <td style="padding:30px;background:#f8faff;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td width="32%" style="background:#037EF3;border-radius:12px;padding:20px;text-align:center;">
                  <div style="color:white;font-size:32px;font-weight:900;">${score}</div>
                  <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:4px;">TOTAL POINTS</div>
                </td>
                <td width="4%"></td>
                <td width="32%" style="background:#0DB14B;border-radius:12px;padding:20px;text-align:center;">
                  <div style="color:white;font-size:32px;font-weight:900;">#${rank}</div>
                  <div style="color:rgba(255,255,255,0.8);font-size:12px;margin-top:4px;">YOUR RANK</div>
                </td>
                <td width="4%"></td>
                <td width="32%" style="background:#FFC845;border-radius:12px;padding:20px;text-align:center;">
                  <div style="color:#0A1628;font-size:32px;font-weight:900;">${accuracy}%</div>
                  <div style="color:rgba(10,22,40,0.7);font-size:12px;margin-top:4px;">ACCURACY</div>
                </td>
              </tr>
            </table>
            <div style="text-align:center;color:#555;font-size:14px;margin-top:16px;">
              You ranked <strong>#${rank}</strong> out of <strong>${totalPlayers}</strong> players worldwide! 🌍
            </div>
          </td>
        </tr>
        <!-- Opportunities -->
        <tr>
          <td style="padding:30px;">
            <div style="font-size:20px;font-weight:800;color:#0A1628;margin-bottom:20px;">🌏 Your AIESEC Opportunities</div>
            <!-- Global Volunteer -->
            <table width="100%" style="background:#f0f7ff;border-radius:12px;padding:16px;margin-bottom:12px;" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50" style="padding:0 12px 0 0;">
                  <div style="width:48px;height:48px;background:#037EF3;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;">🤝</div>
                </td>
                <td>
                  <div style="font-weight:800;color:#037EF3;font-size:16px;">Global Volunteer</div>
                  <div style="color:#555;font-size:13px;margin-top:3px;">6–8 week volunteering projects on education, environment & more across 120+ countries.</div>
                </td>
              </tr>
            </table>
            <!-- Global Talent -->
            <table width="100%" style="background:#f0fff4;border-radius:12px;padding:16px;margin-bottom:12px;" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50" style="padding:0 12px 0 0;">
                  <div style="width:48px;height:48px;background:#0DB14B;border-radius:12px;font-size:24px;line-height:48px;text-align:center;">💼</div>
                </td>
                <td>
                  <div style="font-weight:800;color:#0DB14B;font-size:16px;">Global Talent</div>
                  <div style="color:#555;font-size:13px;margin-top:3px;">Professional internships and career development programs with top companies worldwide.</div>
                </td>
              </tr>
            </table>
            <!-- Global Teacher -->
            <table width="100%" style="background:#fff8ee;border-radius:12px;padding:16px;" cellpadding="0" cellspacing="0">
              <tr>
                <td width="50" style="padding:0 12px 0 0;">
                  <div style="width:48px;height:48px;background:#FFC845;border-radius:12px;font-size:24px;line-height:48px;text-align:center;">📚</div>
                </td>
                <td>
                  <div style="font-weight:800;color:#e6a800;font-size:16px;">Global Teacher</div>
                  <div style="color:#555;font-size:13px;margin-top:3px;">Educational exchange programs — teach, inspire, and grow as a young educator abroad.</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Testimonials -->
        <tr>
          <td style="padding:0 30px 30px;">
            <div style="font-size:18px;font-weight:800;color:#0A1628;margin-bottom:16px;">💬 Hear From Past Participants</div>
            <div style="background:#f8faff;border-left:4px solid #037EF3;padding:16px;border-radius:0 12px 12px 0;margin-bottom:12px;">
              <div style="color:#333;font-style:italic;font-size:14px;">"AIESEC gave me the courage to step outside my comfort zone. I volunteered in India and it changed my entire perspective on leadership and life!"</div>
              <div style="color:#037EF3;font-weight:700;font-size:13px;margin-top:8px;">— Aishah R., UM Graduate</div>
            </div>
            <div style="background:#f8faff;border-left:4px solid #0DB14B;padding:16px;border-radius:0 12px 12px 0;">
              <div style="color:#333;font-style:italic;font-size:14px;">"The Global Talent internship in Germany was the best decision I made as a student. I came back with skills I couldn't learn in any classroom."</div>
              <div style="color:#0DB14B;font-weight:700;font-size:13px;margin-top:8px;">— Fariz H., UTM Alumnus</div>
            </div>
          </td>
        </tr>
        <!-- CTA -->
        <tr>
          <td style="background:#0A1628;padding:30px;text-align:center;">
            <div style="color:white;font-size:18px;font-weight:700;margin-bottom:20px;">Ready to take the leap? 🚀</div>
            <a href="https://aiesec.org/malaysia" style="display:inline-block;background:linear-gradient(135deg,#037EF3,#0DB14B);color:white;font-weight:800;font-size:16px;text-decoration:none;padding:14px 40px;border-radius:50px;">Explore Opportunities →</a>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 30px;text-align:center;border-top:1px solid #eee;">
            <div style="color:#888;font-size:12px;">
              © 2024 AIESEC in Malaysia. All rights reserved.<br/>
              <a href="https://www.instagram.com/aiesec.my" style="color:#037EF3;">Instagram</a> &nbsp;|&nbsp;
              <a href="https://www.facebook.com/AIESECMalaysia" style="color:#037EF3;">Facebook</a> &nbsp;|&nbsp;
              <a href="https://aiesec.org/malaysia" style="color:#037EF3;">Website</a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'AIESEC Malaysia <noreply@aiesec.org.my>',
      to: email,
      subject: `🎉 ${name}, you scored ${score} pts! Your AIESEC Results are here`,
      html,
    });
    console.log(`📧 Result email sent to ${email}`);
  } catch (err) {
    console.error('Email send error:', err.message);
  }
};

module.exports = { sendResultEmail };
