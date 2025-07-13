// src/pages/QuestionManager.jsx
import React, { useState, useEffect } from 'react';
import API from '../services/api';

const QuestionManager = () => {
  const [pdfs, setPdfs] = useState([]);
  const [tests, setTests] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [selectedTestId, setSelectedTestId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    if (selectedPdfId) {
      fetchQuestions();
      fetchTestsForPdf(selectedPdfId);
    } else {
      setTests([]);
      setSelectedTestId('');
    }
  }, [selectedPdfId]);

  const fetchPDFs = async () => {
    try {
      const response = await API.get('/pdfs');
      setPdfs(response.data);
    } catch (err) {
      console.error('Error fetching PDFs', err);
      alert('Failed to fetch PDFs');
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await API.get(`/questions/pdf/${selectedPdfId}`);
      setQuestions(response.data);
    } catch (err) {
      console.error('Error fetching questions', err);
      alert('Failed to fetch questions');
    }
  };

  const fetchTestsForPdf = async (pdfId) => {
    try {
      const response = await API.get(`/tests/pdf/${pdfId}`);
      setTests(response.data);
    } catch (err) {
      console.error('Error fetching tests', err);
      alert('Failed to fetch tests');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const resetForm = () => {
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectAnswer(0);
    setExplanation('');
    setEditingQuestionId(null);
    setSelectedTestId('');
  };

  const handleSubmit = async () => {
    if (!selectedPdfId || !questionText.trim()) {
      alert('Please select a PDF and enter a question');
      return;
    }

    setLoading(true);
    const payload = {
      pdfId: selectedPdfId,
      testId: selectedTestId,
      questionText,
      options,
      correctAnswer,
      explanation,
    };

    try {
      if (editingQuestionId) {
        await API.put(`/questions/${editingQuestionId}`, payload);
      } else {
        await API.post('/questions', payload);
      }
      await fetchQuestions();
      resetForm();
      alert('Question saved successfully!');
    } catch (err) {
      console.error('Error submitting question', err);
      alert('Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    setOptions(q.options);
    setCorrectAnswer(q.correctAnswer);
    setExplanation(q.explanation);
    setSelectedTestId(q.testId || '');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await API.delete(`/questions/${id}`);
      setQuestions(questions.filter((q) => q._id !== id));
      alert('Question deleted successfully!');
    } catch (err) {
      console.error('Failed to delete question', err);
      alert('Failed to delete question');
    }
  };

  const styles = {
    container: { padding: '2rem' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' },
    input: { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' },
    textarea: { width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', minHeight: '100px' },
    button: { backgroundColor: '#007bff', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '1rem' },
    questionItem: { backgroundColor: '#f8f9fa', padding: '1rem', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #dee2e6' },
    actionButton: { backgroundColor: '#6c757d', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem' },
    deleteButton: { backgroundColor: '#dc3545', color: 'white', padding: '0.25rem 0.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  };

  return (
    <div style={styles.container}>
      <h2>📘 Question Manager</h2>

      <div style={styles.formGroup}>
        <label style={styles.label}>Select PDF:</label>
        <select
          value={selectedPdfId}
          onChange={(e) => setSelectedPdfId(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Select PDF --</option>
          {pdfs.map((pdf) => (
            <option key={pdf._id} value={pdf._id}>
              {pdf.title}
            </option>
          ))}
        </select>
      </div>

      {selectedPdfId && (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Select Test:</label>
            <select
              value={selectedTestId}
              onChange={(e) => setSelectedTestId(e.target.value)}
              style={styles.input}
            >
              <option value="">-- Select Test (optional) --</option>
              {tests.map((test) => (
                <option key={test._id} value={test._id}>
                  {test.title}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              marginBottom: '2rem',
            }}
          >
            <h3>{editingQuestionId ? 'Edit Question' : 'Add New Question'}</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Question:</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                style={styles.textarea}
                placeholder="Enter your question here..."
              />
            </div>

            {options.map((opt, idx) => (
              <div key={idx} style={styles.formGroup}>
                <label style={styles.label}>Option {idx + 1}:</label>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  style={styles.input}
                  placeholder={`Enter option ${idx + 1}`}
                />
              </div>
            ))}

            <div style={styles.formGroup}>
              <label style={styles.label}>Correct Answer (0-3):</label>
              <input
                type="number"
                min="0"
                max="3"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Explanation:</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                style={styles.textarea}
                placeholder="Enter explanation for the correct answer..."
              />
            </div>

            <button onClick={handleSubmit} disabled={loading} style={styles.button}>
              {loading ? 'Saving...' : editingQuestionId ? 'Update Question' : 'Add Question'}
            </button>

            {editingQuestionId && (
              <button
                onClick={resetForm}
                style={{ ...styles.button, backgroundColor: '#6c757d' }}
              >
                Cancel
              </button>
            )}
          </div>

          <div
            style={{
              backgroundColor: '#fff',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            }}
          >
            <h3>Questions for this PDF ({questions.length})</h3>
            {questions.length === 0 ? (
              <p>No questions added yet.</p>
            ) : (
              <div>
                {questions.map((q) => (
                  <div key={q._id} style={styles.questionItem}>
                    <h4>{q.questionText}</h4>
                    <ul>
                      {q.options.map((option, idx) => (
                        <li key={idx} style={{ color: idx === q.correctAnswer ? 'green' : 'black' }}>
                          {option} {idx === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                    {q.explanation && (
                      <p>
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                    <div style={{ marginTop: '1rem' }}>
                      <button onClick={() => handleEdit(q)} style={styles.actionButton}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(q._id)} style={styles.deleteButton}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionManager;
