// server/controllers/attemptController.js
const TestAttempt = require('../models/TestAttempt');
const Question = require('../models/Question'); // Add this

exports.submitAttempt = async (req, res) => {
  try {
    const { userId, testId, answers } = req.body;

    let correctCount = 0;
    const total = answers.length;

    // Calculate score and flag correctness
    const enrichedAnswers = await Promise.all(
      answers.map(async (answer) => {
        const question = await Question.findById(answer.questionId);

        const isCorrect = question && question.correctAnswer === answer.selectedOption;
        if (isCorrect) correctCount++;

        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          isCorrect,
        };
      })
    );

    const score = Math.round((correctCount / total) * 100);

    const attempt = new TestAttempt({
      userId,
      testId,
      answers: enrichedAnswers,
      score,
      total,
    });

    const saved = await attempt.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error saving attempt:', err);
    res.status(500).json({ error: 'Failed to submit attempt' });
  }
};

exports.getUserAttempts = async (req, res) => {
  try {
    const { userId } = req.params;
    const attempts = await TestAttempt.find({ userId }).populate('testId');
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
};

// Get all attempts (for admin)
exports.getAllAttempts = async (req, res) => {
  try {
    const attempts = await TestAttempt.find()
      .populate('userId', 'name email') // populate user info
      .populate('testId', 'title');     // populate test info
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all attempts' });
  }
};
