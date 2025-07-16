import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';

const AffiliateLeaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getLeaderboard()
      .then((res) => {
        console.log('📊 Leaderboard API response:', res.data);
        setData(res.data?.leaderboard || []);
        setError(null);
      })
      .catch((err) => {
        console.error('❌ Failed to fetch leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  const maskEmail = (email) => {
    const [user, domain] = email.split('@');
    return user.slice(0, 2) + '***@' + domain;
  };

  const renderRank = (i) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return i + 1;
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🏆 Affiliate Leaderboard</h1>
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.headerCell}>#</th>
              <th style={styles.headerCell}>User</th>
              <th style={styles.headerCell}>Email</th>
              <th style={styles.headerCell}>Earnings (₹)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={styles.cell}>Loading...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" style={{ ...styles.cell, color: 'red' }}>{error}</td>
              </tr>
            ) : data.length > 0 ? (
              data.map((u, i) => (
                <tr
                  key={u.email || i}
                  style={{
                    ...styles.bodyRow,
                    backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff',
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f0fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff')}
                >
                  <td style={styles.cell}>{renderRank(i)}</td>
                  <td style={styles.cell}>{u.name || 'N/A'}</td>
                  <td style={styles.cell}>{u.email ? maskEmail(u.email) : 'N/A'}</td>
                  <td style={styles.cell}>
                    {typeof u.totalCommission === 'number'
                      ? u.totalCommission.toFixed(2)
                      : '—'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={styles.cell}>No data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '40px auto',
    padding: '20px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#2d3748',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  headerRow: {
    backgroundColor: '#f1f5f9',
    textAlign: 'left',
  },
  headerCell: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    fontWeight: '600',
    color: '#4a5568',
  },
  bodyRow: {
    transition: 'background 0.2s ease',
  },
  cell: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0',
    color: '#2d3748',
  },
};

export default AffiliateLeaderboard;
