// src/pages/tests/TestList.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await API.get('/tests');
        setTests(res.data);
      } catch (err) {
        console.error('Error fetching tests:', err);
        setError('Failed to load tests');
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) return <div className="p-6">Loading tests...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-4">🧪 Available Tests</h2>

      {tests.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        <ul className="space-y-4">
          {tests.map((test) => (
            <li
              key={test._id}
              className="bg-white p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{test.title}</h3>
                <p className="text-sm text-gray-500">
                  {test.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => navigate(`/tests/${test._id}`)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Start Test
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
