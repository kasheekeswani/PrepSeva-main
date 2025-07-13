const express = require('express')
const router = express.Router()

const {
  createQuestion,
  getQuestionsByPdf,
  getQuestionsByTest,
} = require('../controllers/questionController')

// Add new question
router.post('/', createQuestion)

// Get all questions linked to a PDF
router.get('/pdf/:pdfId', getQuestionsByPdf)

// Get all questions linked to a test
router.get('/test/:testId', getQuestionsByTest)

// 🔍 DEBUG ROUTES - Add these temporarily
router.get('/debug/all', async (req, res) => {
  try {
    const Question = require('../models/Question')
    const questions = await Question.find({}).limit(10)
    res.json({
      totalQuestions: await Question.countDocuments(),
      sampleQuestions: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText?.substring(0, 50) + '...',
        testId: q.testId,
        pdfId: q.pdfId,
        hasOptions: q.options?.length || 0
      }))
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/debug/test/:testId', async (req, res) => {
  try {
    const Question = require('../models/Question')
    const Test = require('../models/Test')
    
    const test = await Test.findById(req.params.testId)
    const questions = await Question.find({ testId: req.params.testId })
    
    res.json({
      testExists: !!test,
      testDetails: test ? {
        _id: test._id,
        title: test.title,
        createdAt: test.createdAt
      } : null,
      questionsCount: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        questionText: q.questionText?.substring(0, 50) + '...',
        testId: q.testId,
        optionsCount: q.options?.length || 0
      }))
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// 🔧 QUICK FIX ROUTE - Add this temporarily
router.post('/debug/link-to-test', async (req, res) => {
  try {
    const Question = require('../models/Question')
    const { testId, pdfId } = req.body
    
    // Update all questions with the given pdfId to also have the testId
    const result = await Question.updateMany(
      { pdfId: pdfId, testId: null }, // Find questions with pdfId but no testId
      { $set: { testId: testId } }    // Set the testId
    )
    
    res.json({
      message: 'Questions linked to test successfully',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router