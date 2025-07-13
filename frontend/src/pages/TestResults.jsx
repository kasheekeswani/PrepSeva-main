// src/pages/tests/TestResults.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

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

  if (loading) return <div className="p-6">Loading test results...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">📊 Test Results</h2>

      {attempts.length === 0 ? (
        <p>No test attempts found.</p>
      ) : (
        <ul className="space-y-4">
          {attempts.map((a) => (
            <li key={a._id} className="bg-white rounded shadow p-4">
              <p><strong>Test:</strong> {a.testId?.title || 'Untitled Test'}</p>
              <p><strong>Score:</strong> {a.score != null ? `${a.score}%` : 'N/A'}</p>
              <p><strong>Date:</strong> {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'Unknown Date'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
