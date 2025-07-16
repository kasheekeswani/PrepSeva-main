const Question = require('../models/Question');
const Test = require('../models/Test');
const TestAttempt = require('../models/TestAttempt');

// ✅ Submit a test attempt
const submitTest = async (req, res) => {
  const { userId, testId, answers } = req.body;

  if (!userId || !testId || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Missing or invalid userId, testId, or answers' });
  }

  try {
    const questionIds = answers.map(a => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let correctCount = 0;

    const processedAnswers = answers.map(answer => {
      const question = questions.find(q => q._id.equals(answer.questionId));
      const isCorrect = question?.correctOption === answer.selectedOption;
      if (isCorrect) correctCount++;
      return {
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    const attempt = new TestAttempt({
      userId,
      testId,
      answers: processedAnswers,
      score: scorePercent,
      total: questions.length,
    });

    await attempt.save();

    res.status(201).json({ message: 'Test submitted successfully', score: scorePercent });
  } catch (err) {
    console.error('❌ Error submitting test:', err);
    res.status(500).json({ error: 'Failed to submit test' });
  }
};

// ✅ Get all tests
const getAllTests = async (req, res) => {
  const tests = await Test.find().populate('pdfId questionIds');
  res.json(tests);
};

// ✅ Get test by ID
const getTestById = async (req, res) => {
  const test = await Test.findById(req.params.id).populate('pdfId questionIds');
  if (!test) return res.status(404).json({ error: 'Test not found' });
  res.json(test);
};

// ✅ Create test (includes scheduling)
const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      pdfId,
      questionIds,
      userId,
      startTime,
      duration, // expected as { hours, minutes, seconds }
    } = req.body;

    if (!startTime || !duration) {
      return res.status(400).json({ error: 'startTime and duration are required' });
    }

    const test = new Test({
      title,
      description,
      pdfId,
      questionIds,
      userId,
      startTime,
      duration,
    });

    await test.save();
    res.status(201).json(test);
  } catch (err) {
    console.error('❌ Error creating test:', err);
    res.status(500).json({ error: 'Failed to create test' });
  }
};

// ✅ Update test (includes rescheduling)
const updateTest = async (req, res) => {
  try {
    const updated = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('❌ Error updating test:', err);
    res.status(500).json({ error: 'Failed to update test' });
  }
};

// ✅ Delete test
const deleteTest = async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted' });
  } catch (err) {
    console.error('❌ Error deleting test:', err);
    res.status(500).json({ error: 'Failed to delete test' });
  }
};

// ✅ Get tests by PDF ID
const getTestsByPdf = async (req, res) => {
  try {
    const tests = await Test.find({ pdfId: req.params.pdfId }).populate('pdfId questionIds');
    res.json(tests);
  } catch (err) {
    console.error('❌ Failed to get tests by PDF:', err);
    res.status(500).json({ error: 'Failed to fetch tests for this PDF' });
  }
};

// ✅ Export
module.exports = {
  submitTest,
  getAllTests,
  getTestById,
  getTestsByPdf,
  createTest,
  updateTest,
  deleteTest,
};
