// frontend/src/pages/tests/TestTaker.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

export default function TestTaker() {
  const { testId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('loading');
  const [timeLeft, setTimeLeft] = useState(0);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      try {
        setError(null);
        const testRes = await API.get(`/tests/${testId}`);
        const qRes = await API.get(`/questions/test/${testId}`);

        setTest(testRes.data);
        setQuestions(qRes.data);

        const now = dayjs();
        const start = dayjs(testRes.data.startTime);
        const durationMs = testRes.data.duration * 60 * 1000;
        const end = start.add(durationMs, 'millisecond');

        if (now.isBefore(start)) {
          setStatus('not-started');
          setTimeLeft(start.diff(now, 'second'));
        } else if (now.isAfter(end)) {
          setStatus('ended');
        } else {
          setStatus('in-progress');
          setTimeLeft(end.diff(now, 'second'));
        }
      } catch (err) {
        console.error('Error loading test/questions:', err);
        setError(`Failed to load test: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [testId]);

  useEffect(() => {
    if (status !== 'in-progress') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelect = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter((q) => answers[q._id] === undefined);
    if (unanswered.length > 0 && status !== 'auto-submit') {
      return alert(`You missed ${unanswered.length} question(s). Please answer all.`);
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user._id,
        testId,
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedOption: answers[q._id],
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

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '1rem',
      color: '#111827',
    },
    alert: {
      backgroundColor: '#ecfdf5',
      border: '1px solid #bbf7d0',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
      color: '#065f46',
    },
    errorBox: {
      backgroundColor: '#fee2e2',
      border: '1px solid #fca5a5',
      padding: '1rem',
      borderRadius: '8px',
      marginBottom: '1.5rem',
    },
    questionCard: {
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.5rem',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
    },
    questionText: {
      fontWeight: '600',
      marginBottom: '0.75rem',
      color: '#1f2937',
    },
    optionLabel: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '0.5rem',
      cursor: 'pointer',
      fontSize: '0.95rem',
      color: '#374151',
    },
    radio: {
      marginRight: '0.5rem',
    },
    submitButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
      padding: '0.75rem 1.5rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '1rem',
    },
    submitDisabled: {
      backgroundColor: '#9ca3af',
      cursor: 'not-allowed',
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Take Test</h2>
        <div style={styles.alert}>
          <p>Loading test and questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Take Test</h2>
        <div style={styles.errorBox}>
          <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#b91c1c' }}>Error Loading</h3>
          <p style={{ color: '#b91c1c' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ ...styles.submitButton, backgroundColor: '#ef4444', marginTop: '1rem' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (status === 'not-started') {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Take Test</h2>
        <div style={styles.alert}>Test will start at: {dayjs(test?.startTime).format('YYYY-MM-DD HH:mm:ss')}</div>
      </div>
    );
  }

  if (status === 'ended') {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>📝 Take Test</h2>
        <div style={styles.alert}>Test has ended.</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📝 Take Test</h2>

      <div style={styles.alert}>
        ⏳ Time Left: {formatTime(timeLeft)} — {questions.length} questions loaded
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        {questions.map((q, index) => (
          <div key={q._id} style={styles.questionCard}>
            <h4 style={styles.questionText}>{index + 1}. {q.questionText}</h4>
            {q.options.map((opt, idx) => (
              <label key={idx} style={styles.optionLabel}>
                <input
                  type="radio"
                  name={`question-${q._id}`}
                  value={idx}
                  checked={answers[q._id] === idx}
                  onChange={() => handleSelect(q._id, idx)}
                  style={styles.radio}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}

        <button
          type="submit"
          disabled={submitting}
          style={{
            ...styles.submitButton,
            ...(submitting ? styles.submitDisabled : {}),
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Test'}
        </button>
      </form>
    </div>
  );
}
