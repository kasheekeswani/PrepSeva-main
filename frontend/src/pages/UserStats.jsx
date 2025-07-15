// frontend/src/pages/UserStats.jsx
import { useEffect, useState } from 'react';
import API from '../services/api';

export default function UserStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get('/stats/users');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching user stats:', err);
        setError('Failed to load user stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={centeredContainer}>
        <p style={{ fontSize: '1rem', color: '#374151' }}>Loading user statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centeredContainer}>
        <p style={{ color: 'red', fontSize: '1rem' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
          📊 User Statistics
        </h2>

        {/* Stat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div style={statCardStyle('#3b82f6')}>
            <div style={statValue}>{stats?.totalUsers ?? 0}</div>
            <div style={statLabel}>Total Users</div>
          </div>
          <div style={statCardStyle('#10b981')}>
            <div style={statValue}>{stats?.activeUsers ?? 0}</div>
            <div style={statLabel}>Active (7 days)</div>
          </div>
          <div style={statCardStyle('#f59e0b')}>
            <div style={statValue}>{stats?.avgTestsPerUser ?? 0}</div>
            <div style={statLabel}>Avg Tests/User</div>
          </div>
        </div>

        {/* User List Table */}
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: '#111827', marginBottom: '0.75rem' }}>
          🧑‍💻 Registered Users
        </h3>

        <div style={{
          overflowX: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.95rem',
          }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th style={tableHeaderCell}>Name</th>
                <th style={tableHeaderCell}>Email</th>
                <th style={tableHeaderCell}>Date Joined</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.userTestData ?? []).map((user, idx) => (
                <tr
                  key={user._id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f9fafb',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#ffffff' : '#f9fafb'}
                >
                  <td style={tableCell}>{user.name}</td>
                  <td style={tableCell}>{user.email}</td>
                  <td style={tableCell}>
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

const centeredContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
};

const statCardStyle = (borderColor) => ({
  backgroundColor: '#ffffff',
  borderLeft: `6px solid ${borderColor}`,
  borderRadius: '6px',
  padding: '1rem',
  textAlign: 'center',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
});

const statValue = {
  fontSize: '1.5rem',
  fontWeight: '700',
  color: '#111827',
};

const statLabel = {
  fontSize: '0.9rem',
  color: '#6b7280',
  marginTop: '0.25rem',
};

const tableHeaderCell = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: '600',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
};

const tableCell = {
  padding: '0.75rem',
  color: '#374151',
  borderBottom: '1px solid #e5e7eb',
};
