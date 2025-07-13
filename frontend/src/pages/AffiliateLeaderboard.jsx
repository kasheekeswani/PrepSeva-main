import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../services/api';

const AffiliateLeaderboard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    getLeaderboard().then((res) => setData(res.data));
  }, []);

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
            {data.map((u, i) => (
              <tr
                key={u.email}
                style={{
                  ...styles.bodyRow,
                  backgroundColor: i % 2 === 0 ? '#f9f9f9' : '#ffffff',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e6f0fa')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = i % 2 === 0 ? '#f9f9f9' : '#ffffff')}
              >
                <td style={styles.cell}>{i + 1}</td>
                <td style={styles.cell}>{u.name}</td>
                <td style={styles.cell}>{u.email}</td>
                <td style={styles.cell}>{u.totalCommission.toFixed(2)}</td>
              </tr>
            ))}
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
