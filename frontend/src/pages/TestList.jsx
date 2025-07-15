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

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto',
      backgroundColor: '#f9fafb',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
    },
    heading: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '1rem 1.5rem',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: '1.1rem',
      fontWeight: '600',
      marginBottom: '0.3rem',
      color: '#1f2937',
    },
    description: {
      fontSize: '0.9rem',
      color: '#6b7280',
    },
    button: {
      backgroundColor: '#10b981',
      color: '#fff',
      padding: '0.6rem 1.2rem',
      border: 'none',
      borderRadius: '6px',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'background 0.2s',
    },
    buttonHover: {
      backgroundColor: '#059669',
    },
    error: {
      color: '#b91c1c',
      fontSize: '1rem',
      marginTop: '1rem',
      backgroundColor: '#fee2e2',
      padding: '0.75rem',
      borderRadius: '6px',
    },
  };

  if (loading) return <div style={styles.container}><p>Loading tests...</p></div>;
  if (error) return <div style={styles.container}><p style={styles.error}>{error}</p></div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🧪 Available Tests</h2>

      {tests.length === 0 ? (
        <p>No tests found.</p>
      ) : (
        <ul style={styles.list}>
          {tests.map((test) => (
            <li
              key={test._id}
              style={styles.card}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'}
            >
              <div>
                <h3 style={styles.title}>{test.title}</h3>
                <p style={styles.description}>{test.description || 'No description provided'}</p>
              </div>
              <button
                style={styles.button}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = styles.button.backgroundColor}
                onClick={() => navigate(`/tests/${test._id}`)}
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
