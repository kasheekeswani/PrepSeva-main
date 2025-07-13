// src/pages/bookmarks/Bookmarks.jsx

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    try {
      const res = await API.get(`/bookmarks/${user._id}`);
      setBookmarks(res.data);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError('Could not load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchBookmarks();
  }, [user]);

  const removeBookmark = async (qid) => {
    try {
      await API.delete('/bookmarks', {
        data: { userId: user._id, questionId: qid },
      });
      setBookmarks((prev) => prev.filter((b) => b._id !== qid));
    } catch (err) {
      alert('❌ Failed to remove bookmark.');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1rem', fontSize: '1rem' }}>
        Loading bookmarks...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', color: 'red', fontSize: '1rem' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
        ⭐ Your Bookmarked Questions
      </h2>

      {bookmarks.length === 0 ? (
        <p>You haven't bookmarked anything yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {bookmarks.map((q) => (
            <li
              key={q._id}
              style={{
                backgroundColor: '#fff',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <p style={{ margin: 0, fontSize: '1rem', color: '#333', flex: 1 }}>
                {q.questionText}
              </p>
              <button
                onClick={() => removeBookmark(q._id)}
                style={{
                  marginLeft: '1rem',
                  background: 'none',
                  border: 'none',
                  color: '#d32f2f',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                }}
                aria-label={`Remove bookmark for question: ${q.questionText}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
