// frontend/src/pages/AdminTestAttempts.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';

export default function AdminTestAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await API.get('/attempts'); // Fetch all attempts
        setAttempts(res.data);
      } catch (err) {
        console.error('Error fetching attempts:', err);
        setError('Failed to fetch test attempts');
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '960px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif',
    },
    header: {
      fontSize: '1.8rem',
      fontWeight: 'bold',
      marginBottom: '1.5rem',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
    },
    th: {
      border: '1px solid #ccc',
      padding: '0.75rem',
      backgroundColor: '#f2f2f2',
      textAlign: 'left',
    },
    td: {
      border: '1px solid #ddd',
      padding: '0.75rem',
    },
    row: {
      backgroundColor: '#fff',
    },
    evenRow: {
      backgroundColor: '#f9f9f9',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '1.5rem',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
    },
    error: {
      color: '#b91c1c',
      fontSize: '1rem',
      padding: '1rem',
      backgroundColor: '#fee2e2',
      borderRadius: '6px',
    },
    loading: {
      fontSize: '1.1rem',
    },
  };

  if (loading) {
    return <div style={styles.container}><p style={styles.loading}>Loading attempts...</p></div>;
  }

  if (error) {
    return <div style={styles.container}><div style={styles.error}>{error}</div></div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📊 All User Test Attempts</h2>

      {attempts.length === 0 ? (
        <p>No attempts found.</p>
      ) : (
        <div style={styles.card}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>👤 User</th>
                <th style={styles.th}>📧 Email</th>
                <th style={styles.th}>🧪 Test</th>
                <th style={styles.th}>📈 Score</th>
                <th style={styles.th}>🕒 Date</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, idx) => (
                <tr key={a._id} style={idx % 2 === 0 ? styles.row : styles.evenRow}>
                  <td style={styles.td}>{a.userId?.name || 'N/A'}</td>
                  <td style={styles.td}>{a.userId?.email || 'N/A'}</td>
                  <td style={styles.td}>{a.testId?.title || 'Untitled Test'}</td>
                  <td style={styles.td}>{a.score != null ? `${a.score}%` : 'N/A'}</td>
                  <td style={styles.td}>
                    {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
