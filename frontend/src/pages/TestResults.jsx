// frontend/src/pages/TestResults.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

export default function TestResults() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await API.get(`/attempts/${user._id}`);
        setAttempts(res.data);
      } catch (err) {
        console.error('Error loading attempts:', err);
        setError('Failed to load test history');
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchResults();
    }
  }, [user]);

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '1.25rem',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e5e7eb',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    label: {
      fontWeight: '600',
      color: '#374151',
    },
    value: {
      marginLeft: '0.25rem',
      fontWeight: '500',
      color: '#111827',
    },
    scoreHighlight: (score) => ({
      color: score >= 80 ? '#16a34a' : score >= 50 ? '#f59e0b' : '#dc2626',
      fontWeight: 'bold',
    }),
    error: {
      color: '#b91c1c',
      backgroundColor: '#fee2e2',
      padding: '1rem',
      borderRadius: '6px',
    },
  };

  const chartData = attempts.map((a, i) => ({
    name: a.testId?.title || `Test ${i + 1}`,
    score: a.score || 0,
  }));

  const getBarColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  if (loading) {
    return <div style={styles.container}><p>Loading test results...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Test Results</h2>

      {attempts.length === 0 ? (
        <p>No test attempts found.</p>
      ) : (
        <>
          {/* Chart Block */}
          <div style={{ backgroundColor: '#fff', padding: '1rem', marginBottom: '2rem', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', color: '#111827' }}>📈 Score Overview</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-10} textAnchor="end" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="score">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* List of Test Attempts */}
          <ul style={styles.list}>
            {attempts.map((a) => (
              <li key={a._id} style={styles.card}>
                <p><span style={styles.label}>Test:</span><span style={styles.value}>{a.testId?.title || 'Untitled Test'}</span></p>
                <p>
                  <span style={styles.label}>Score:</span>
                  <span style={{ ...styles.value, ...styles.scoreHighlight(a.score ?? 0) }}>
                    {typeof a.score === 'number' ? `${a.score}%` : 'N/A'}
                  </span>
                </p>
                <p>
                  <span style={styles.label}>Correct:</span>
                  <span style={styles.value}>
                    {a.answers?.filter(ans => ans.isCorrect).length} / {a.total ?? a.answers?.length}
                  </span>
                </p>
                <p>
                  <span style={styles.label}>Date:</span>
                  <span style={styles.value}>
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'Unknown Date'}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
