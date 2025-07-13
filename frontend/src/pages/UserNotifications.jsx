// src/pages/notifications/UserNotifications.jsx

import { useEffect, useState } from 'react';
import API from '../services/api';

export default function UserNotifications() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await API.get('/notifications');
        setNotes(res.data);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError('Failed to load notifications.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div style={centeredContainer}>
        <p style={{ fontSize: '1.1rem', color: '#333' }}>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={centeredContainer}>
        <p style={{ fontSize: '1.1rem', color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        background: 'linear-gradient(to bottom, #f0f4f8, #ffffff)',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.07)',
        }}
      >
        <h2
          style={{
            fontSize: '1.7rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '1.5rem',
            textAlign: 'center',
          }}
        >
          🔔 Notifications
        </h2>

        {notes.length === 0 ? (
          <p style={{ fontSize: '1rem', color: '#555', textAlign: 'center' }}>
            No announcements yet.
          </p>
        ) : (
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: 0, listStyle: 'none' }}>
            {notes.map((n) => (
              <li
                key={n._id}
                style={{
                  background: 'linear-gradient(to right, #ffffff, #f8fafc)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  borderLeft: '5px solid #3b82f6',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                }}
              >
                <h4
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    color: '#0f172a',
                    marginBottom: '0.5rem',
                  }}
                >
                  {n.title}
                </h4>
                <p style={{ fontSize: '1rem', color: '#334155', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                  {n.message}
                </p>
                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#2563eb',
                      fontSize: '0.95rem',
                      wordBreak: 'break-all',
                      display: 'inline-block',
                      marginBottom: '0.5rem',
                      textDecoration: 'none',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseOut={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    🔗 {n.link}
                  </a>
                )}
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {new Date(n.createdAt).toLocaleString(undefined, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const centeredContainer = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '50vh',
  padding: '2rem',
};
