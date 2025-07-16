import React, { useState, useEffect } from 'react';
import API from '../services/api';

const TestManager = () => {
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPDFs();
  }, []);

  useEffect(() => {
    if (selectedPdfId) fetchQuestions();
    else {
      setQuestions([]);
      setSelectedQuestionIds([]);
    }
  }, [selectedPdfId]);

  const fetchPDFs = async () => {
    try {
      const response = await API.get('/pdfs');
      setPdfs(response.data);
    } catch (err) {
      console.error('Error loading PDFs', err);
      alert('Failed to load PDFs');
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

  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleCreateTest = async () => {
    if (!title.trim()) return alert('Please enter a test title');
    if (!selectedPdfId) return alert('Please select a PDF');
    if (selectedQuestionIds.length === 0) return alert('Please select questions');
    if (!startTime) return alert('Please set a start time');

    const duration = {
      hours: parseInt(durationHours, 10),
      minutes: parseInt(durationMinutes, 10),
      seconds: parseInt(durationSeconds, 10),
    };

    setLoading(true);
    try {
      await API.post('/tests/create', {
        title,
        description,
        pdfId: selectedPdfId,
        questionIds: selectedQuestionIds,
        startTime,
        duration,
      });
      alert('✅ Test created successfully!');
      setTitle('');
      setDescription('');
      setSelectedPdfId('');
      setSelectedQuestionIds([]);
      setQuestions([]);
      setStartTime('');
      setDurationHours(0);
      setDurationMinutes(0);
      setDurationSeconds(0);
    } catch (err) {
      console.error('Failed to create test', err);
      alert('❌ Failed to create test');
    } finally {
      setLoading(false);
    }
  };

  const selectedQuestions = questions.filter((q) => selectedQuestionIds.includes(q._id));

  return (
    <div style={{ padding: '2rem' }}>
      <h2>🧪 Test Creator</h2>

      <div style={{ marginBottom: '2rem' }}>
        <label>Select PDF:</label>
        <select
          value={selectedPdfId}
          onChange={(e) => setSelectedPdfId(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        >
          <option value="">-- Select PDF --</option>
          {pdfs.map((pdf) => (
            <option key={pdf._id} value={pdf._id}>
              {pdf.title}
            </option>
          ))}
        </select>

        <label>Test Title:</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter test title"
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <label>Description (optional):</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Test description"
          style={{ width: '100%', padding: '0.5rem', minHeight: '80px', marginBottom: '1rem' }}
        />

        <label>📅 Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
        />

        <label>⏱️ Duration:</label>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input
            type="number"
            min="0"
            value={durationHours}
            onChange={(e) => setDurationHours(e.target.value)}
            placeholder="Hours"
            style={{ width: '30%', padding: '0.5rem' }}
          />
          <input
            type="number"
            min="0"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="Minutes"
            style={{ width: '30%', padding: '0.5rem' }}
          />
          <input
            type="number"
            min="0"
            value={durationSeconds}
            onChange={(e) => setDurationSeconds(e.target.value)}
            placeholder="Seconds"
            style={{ width: '30%', padding: '0.5rem' }}
          />
        </div>
      </div>

      {selectedPdfId && (
        <div>
          <h3>📌 Select Questions</h3>
          {questions.length === 0 ? (
            <p>No questions available for this PDF.</p>
          ) : (
            <>
              <button onClick={() => setSelectedQuestionIds(questions.map((q) => q._id))}>
                Select All
              </button>
              <button onClick={() => setSelectedQuestionIds([])} style={{ marginLeft: '1rem' }}>
                Clear All
              </button>
              <ul>
                {questions.map((q) => (
                  <li key={q._id} style={{ marginBottom: '1rem' }}>
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(q._id)}
                        onChange={() => toggleQuestionSelection(q._id)}
                      />{' '}
                      {q.questionText}
                    </label>
                    <ul>
                      {q.options.map((opt, i) => (
                        <li key={i} style={{ color: i === q.correctAnswer ? 'green' : 'black' }}>
                          {opt} {i === q.correctAnswer && '✓'}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {selectedQuestions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3>🧾 Preview ({selectedQuestions.length} questions)</h3>
          <button onClick={handleCreateTest} disabled={loading}>
            {loading ? 'Creating...' : 'Create Test'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TestManager;
