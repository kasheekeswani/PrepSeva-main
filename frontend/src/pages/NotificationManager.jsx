// src/pages/NotificationManager.jsx

import { useState, useEffect } from 'react';
import API from '../services/api';

export default function NotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null); // ✅ Edit mode state

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateNotification = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Title and message are required.');
      return;
    }
    try {
      if (editId) {
        // Update
        await API.put(`/notifications/${editId}`, { title, message, link });
        setEditId(null);
      } else {
        // Create
        await API.post('/notifications', { title, message, link });
      }
      setTitle('');
      setMessage('');
      setLink('');
      fetchNotifications();
    } catch (err) {
      console.error('Error saving notification:', err);
      alert('Failed to save notification.');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await API.delete(`/notifications/${id}`);
      fetchNotifications();
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification.');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.2rem' }}>
        Loading notifications...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red', fontSize: '1.1rem' }}>
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '2rem auto',
        backgroundColor: '#ffffff',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
      }}
    >
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          textAlign: 'center',
          color: '#333',
        }}
      >
        {editId ? 'Edit Notification' : 'Create Notification'}
      </h2>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        style={inputStyle}
      />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
      />

      <input
        value={link}
        onChange={(e) => setLink(e.target.value)}
        placeholder="Optional Link (https://...)"
        style={inputStyle}
      />

      <button
        onClick={createOrUpdateNotification}
        style={buttonStyle}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#0069d9')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
      >
        {editId ? 'Update Notification' : 'Create Notification'}
      </button>

      <h3
        style={{
          fontSize: '1.3rem',
          fontWeight: '600',
          margin: '1.5rem 0 1rem',
          color: '#333',
          textAlign: 'center',
        }}
      >
        All Notifications
      </h3>

      {notifications.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#666' }}>No notifications found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {notifications.map((n, i) => (
            <li
              key={i}
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              <strong style={{ fontSize: '1.05rem', color: '#222' }}>{n.title}</strong>
              <p style={{ margin: '0.5rem 0 0', color: '#444' }}>{n.message}</p>
              {n.link && (
                <a
                  href={n.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#007bff',
                    fontSize: '0.9rem',
                    wordBreak: 'break-all',
                    display: 'block',
                    marginTop: '0.5rem',
                  }}
                >
                  🔗 {n.link}
                </a>
              )}
              <div style={{ marginTop: '0.5rem' }}>
                <button
                  onClick={() => {
                    setEditId(n._id);
                    setTitle(n.title);
                    setMessage(n.message);
                    setLink(n.link || '');
                  }}
                  style={editButtonStyle}
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteNotification(n._id)}
                  style={deleteButtonStyle}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Inline styles for consistent, clean aesthetic
const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '0.75rem',
  marginBottom: '1rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border 0.2s, box-shadow 0.2s',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: '#ffffff',
  padding: '0.75rem 1.25rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background 0.2s',
  width: '100%',
  marginBottom: '1.5rem',
};

const editButtonStyle = {
  marginRight: '0.5rem',
  backgroundColor: '#ffc107',
  border: 'none',
  padding: '0.4rem 0.75rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  color: '#fff',
};

const deleteButtonStyle = {
  backgroundColor: '#dc3545',
  border: 'none',
  padding: '0.4rem 0.75rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  color: '#fff',
};
