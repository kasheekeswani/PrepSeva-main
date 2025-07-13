// src/pages/TestManager.jsx
import React, { useState, useEffect } from 'react'
import API from '../services/api'

const TestManager = () => {
  const [pdfs, setPdfs] = useState([])
  const [selectedPdfId, setSelectedPdfId] = useState('')
  const [questions, setQuestions] = useState([])
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchPDFs()
  }, [])

  useEffect(() => {
    if (selectedPdfId) {
      fetchQuestions()
    } else {
      setQuestions([])
      setSelectedQuestionIds([])
    }
  }, [selectedPdfId])

  const fetchPDFs = async () => {
    try {
      const response = await API.get('/pdfs')
      setPdfs(response.data)
    } catch (err) {
      console.error('Error loading PDFs', err)
      alert('Failed to load PDFs')
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await API.get(`/questions/pdf/${selectedPdfId}`)
      setQuestions(response.data)
    } catch (err) {
      console.error('Error fetching questions', err)
      alert('Failed to fetch questions')
    }
  }

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds(prev =>
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    )
  }

  const handleCreateTest = async () => {
    if (!title.trim()) {
      alert('Please enter a test title')
      return
    }
    if (!selectedPdfId) {
      alert('Please select a PDF')
      return
    }
    if (selectedQuestionIds.length === 0) {
      alert('Please select at least one question')
      return
    }

    setLoading(true)
    try {
      await API.post('/tests', {
        title,
        description,
        pdfId: selectedPdfId,
        questionIds: selectedQuestionIds
      })
      alert('Test created successfully!')
      setTitle('')
      setDescription('')
      setSelectedQuestionIds([])
      setSelectedPdfId('')
    } catch (err) {
      console.error('Failed to create test', err)
      alert('Failed to create test')
    } finally {
      setLoading(false)
    }
  }

  const selectedQuestions = questions.filter(q => selectedQuestionIds.includes(q._id))

  const styles = {
    container: { padding: '2rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
    input: { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' },
    textarea: { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' },
    button: { backgroundColor: '#007bff', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    card: { backgroundColor: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', marginBottom: '2rem' },
    questionItem: { backgroundColor: '#f8f9fa', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #dee2e6' },
    checkbox: { marginRight: '0.5rem' },
    previewItem: { backgroundColor: '#e9ecef', padding: '1rem', marginBottom: '1rem', borderRadius: '4px' }
  }

  return (
    <div style={styles.container}>
      <h2>🧪 Test Creator</h2>

      <div style={styles.card}>
        <h3>Test Configuration</h3>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Select PDF:</label>
          <select 
            value={selectedPdfId} 
            onChange={(e) => setSelectedPdfId(e.target.value)}
            style={styles.input}
          >
            <option value="">-- Select PDF --</option>
            {pdfs.map(pdf => (
              <option key={pdf._id} value={pdf._id}>{pdf.title}</option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Test Title:</label>
          <input 
            type="text"
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            placeholder="Enter test title"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Description:</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)}
            style={styles.textarea}
            placeholder="Enter test description (optional)"
          />
        </div>
      </div>

      {selectedPdfId && (
        <div style={styles.card}>
          <h3>Select Questions ({questions.length} available)</h3>
          {questions.length === 0 ? (
            <p>No questions available for this PDF. Please add questions first.</p>
          ) : (
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <button 
                  onClick={() => setSelectedQuestionIds(questions.map(q => q._id))}
                  style={{ ...styles.button, backgroundColor: '#28a745', marginRight: '1rem' }}
                >
                  Select All
                </button>
                <button 
                  onClick={() => setSelectedQuestionIds([])}
                  style={{ ...styles.button, backgroundColor: '#6c757d' }}
                >
                  Clear All
                </button>
              </div>
              
              {questions.map(q => (
                <div key={q._id} style={styles.questionItem}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={selectedQuestionIds.includes(q._id)}
                      onChange={() => toggleQuestionSelection(q._id)}
                      style={styles.checkbox}
                    />
                    <div>
                      <strong>{q.questionText}</strong>
                      <ul style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>
                        {q.options.map((opt, idx) => (
                          <li key={idx} style={{ color: idx === q.correctAnswer ? 'green' : 'black' }}>
                            {opt} {idx === q.correctAnswer && '✓'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedQuestions.length > 0 && (
        <div style={styles.card}>
          <h3>Test Preview ({selectedQuestions.length} questions selected)</h3>
          {selectedQuestions.map((q, index) => (
            <div key={q._id} style={styles.previewItem}>
              <h4>Question {index + 1}: {q.questionText}</h4>
              <ul>
                {q.options.map((opt, idx) => (
                  <li key={idx} style={{ color: idx === q.correctAnswer ? 'green' : 'black' }}>
                    {opt} {idx === q.correctAnswer && '(Correct)'}
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <p><strong>Explanation:</strong> {q.explanation}</p>
              )}
            </div>
          ))}
          
          <button 
            onClick={handleCreateTest}
            disabled={loading}
            style={styles.button}
          >
            {loading ? 'Creating Test...' : 'Create Test'}
          </button>
        </div>
      )}
    </div>
  )
}

export default TestManager