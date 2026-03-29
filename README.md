# AIESEC Malaysia Quiz Platform 🌍

A full-stack MERN gamified quiz platform for generating leads from university students.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Configure Environment
Edit `.env` in the root directory:
```
MONGODB_URI=mongodb://localhost:27017/aiesec-quiz
JWT_SECRET=your_strong_secret
ADMIN_EMAIL=admin@aiesec.org.my
ADMIN_PASSWORD=Admin@123456
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
PORT=5000
```

### 2. Start the Server
```bash
cd server
npm install
npm run dev
# Server starts on http://localhost:5000
```

### 3. Start the Client
```bash
cd client
npm install
npm run dev
# App opens at http://localhost:5173
```

### 4. Admin Access
Visit `http://localhost:5173/admin/login`
- Email: `admin@aiesec.org.my`
- Password: `Admin@123456`

## Features
- 🎮 Gamified quiz with timed questions & speed bonuses
- 🏆 Real-time leaderboard via Socket.io
- 🤖 Aiko mascot with animated poses
- 📧 Automated email results with AIESEC opportunities
- 📱 Fully responsive, mobile-first design
- 🔐 JWT-secured admin panel
- 📊 CSV export of all attempts

## Tech Stack
- **Frontend**: React 18 + Vite + Framer Motion + Socket.io Client
- **Backend**: Express.js + MongoDB (Mongoose) + Socket.io + JWT
- **Email**: Nodemailer (Gmail SMTP)
