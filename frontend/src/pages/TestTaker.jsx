// src/pages/tests/TestTaker.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TestTaker() {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('🔍 Fetching questions for testId:', testId);
        setLoading(true);
        setError(null);
        
        const res = await API.get(`/questions/test/${testId}`);
        console.log('✅ API Response:', res.data);
        console.log('📊 Questions count:', res.data.length);
        
        setQuestions(res.data);
        
        if (res.data.length === 0) {
          setError('No questions found for this test. Please contact admin.');
        }
      } catch (err) {
        console.error('❌ Error loading questions:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        setError(`Failed to load questions: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchQuestions();
    } else {
      setError('No test ID provided');
      setLoading(false);
    }
  }, [testId]);

  const handleSelect = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => answers[q._id] === undefined);
    if (unanswered.length > 0) {
      return alert(`You missed ${unanswered.length} question(s). Please answer all.`);
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user._id,
        testId,
        answers: questions.map((q) => ({
          questionId: q._id,
          selected: answers[q._id],
        })),
      };

      await API.post('/attempts', payload);
      alert('✅ Test submitted successfully!');
      navigate('/user/dashboard');
    } catch (err) {
      console.error('Error submitting test:', err);
      alert('❌ Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📝 Take Test</h2>
        <div className="bg-blue-50 p-4 rounded">
          <p>Loading questions for test ID: <code className="bg-gray-200 px-2 py-1 rounded">{testId}</code></p>
          <p className="text-sm text-gray-600 mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">📝 Take Test</h2>
        <div className="bg-red-50 border border-red-200 p-4 rounded">
          <h3 className="font-semibold text-red-800 mb-2">Error Loading Questions</h3>
          <p className="text-red-600">{error}</p>
          <p className="text-sm text-gray-600 mt-2">Test ID: {testId}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📝 Take Test</h2>
      
      <div className="bg-green-50 border border-green-200 p-3 rounded mb-6">
        <p className="text-sm text-green-700">
          ✅ Loaded {questions.length} questions for test ID: <code className="bg-green-100 px-2 py-1 rounded">{testId}</code>
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {questions.map((q, index) => (
          <div key={q._id} className="mb-6 bg-white p-4 rounded shadow border">
            <h4 className="font-semibold mb-2">
              {index + 1}. {q.questionText}
            </h4>
            <ul className="space-y-2">
              {q.options.map((opt, idx) => (
                <li key={idx}>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`question-${q._id}`}
                      value={idx}
                      checked={answers[q._id] === idx}
                      onChange={() => handleSelect(q._id, idx)}
                    />
                    {opt}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </form>
    </div>
  );
}