/**
 * Calculate score for a quiz attempt.
 * Must mirror the server-side logic in server/routes/quiz.js
 */
export function calculateScore(answers, questions) {
  let totalScore = 0;

  answers.forEach((answer) => {
    const question = questions.find(
      (q) => q._id === answer.questionId || q.id === answer.questionId
    );
    if (!question) return;

    if (answer.isCorrect) {
      const basePoints = question.points || 100;
      const timeLimit = question.timeLimit || 30;
      const timeTaken = answer.timeTaken || 0;

      // Speed bonus: faster = more points
      const speedMultiplier = Math.max(0.5, (timeLimit - timeTaken) / timeLimit);
      const questionScore = Math.round(basePoints * (1 + speedMultiplier));
      totalScore += questionScore;
    }
  });

  return totalScore;
}

/**
 * Format time in seconds to mm:ss display
 */
export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Calculate accuracy percentage
 */
export function calcAccuracy(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Get score grade label
 */
export function getScoreGrade(accuracy) {
  if (accuracy >= 90) return { label: 'Outstanding!', color: '#0DB14B' };
  if (accuracy >= 70) return { label: 'Great Job!', color: '#037EF3' };
  if (accuracy >= 50) return { label: 'Good Effort!', color: '#FFC845' };
  return { label: 'Keep Learning!', color: '#F85A40' };
}
