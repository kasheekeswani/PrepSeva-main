const Question = require('../models/Question')

exports.createQuestion = async (req, res) => {
  try {
    const question = new Question(req.body)
    await question.save()
    res.status(201).json(question)
  } catch (err) {
    res.status(500).json({ message: 'Failed to add question', error: err })
  }
}

exports.getQuestionsByPdf = async (req, res) => {
  try {
    const questions = await Question.find({ pdfId: req.params.pdfId })
    res.json(questions)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch questions' })
  }
}

// ✅ ADD THIS NEW FUNCTION
exports.getQuestionsByTest = async (req, res) => {
  try {
    const questions = await Question.find({ testId: req.params.testId })
    res.json(questions)
  } catch (err) {
    console.error('Error fetching questions by test:', err)
    res.status(500).json({ message: 'Failed to fetch questions for test' })
  }
}