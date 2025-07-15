const Question = require('../models/Question');
const Test = require('../models/Test');

exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add question', error: err });
  }
};

exports.getQuestionsByPdf = async (req, res) => {
  try {
    const questions = await Question.find({ pdfId: req.params.pdfId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

// ✅ FIXED: Load questions via test.questionIds
exports.getQuestionsByTest = async (req, res) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await Question.find({ _id: { $in: test.questionIds } });
    res.json(questions);
  } catch (err) {
    console.error('Error fetching questions by test:', err);
    res.status(500).json({ message: 'Failed to fetch questions for test' });
  }
};
