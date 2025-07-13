// admin-panel/src/pages/AddCourse.jsx
import React, { useState } from 'react';
import { createCourse } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AddCourse = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    affiliateCommission: '',
  });
  const [thumbnail, setThumbnail] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));
      data.append('thumbnail', thumbnail);

      await createCourse(data);
      alert('✅ Course added successfully!');
      navigate('/courses');
    } catch (err) {
      console.error('❌ Error submitting course:', err);
      alert(err.response?.data?.message || 'Failed to add course');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📚 Add New Course</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="title"
          placeholder="Course Title"
          value={form.title}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <textarea
          name="description"
          placeholder="Course Description"
          value={form.description}
          onChange={handleChange}
          required
          style={{ ...styles.input, height: '100px', resize: 'vertical' }}
        />
        <input
          name="price"
          type="number"
          placeholder="Price (₹)"
          value={form.price}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          name="affiliateCommission"
          type="number"
          placeholder="Affiliate Commission %"
          value={form.affiliateCommission}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="file"
          onChange={(e) => setThumbnail(e.target.files[0])}
          required
          style={styles.fileInput}
        />
        <button
          type="submit"
          style={styles.button}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#218838')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#28a745')}
          onMouseDown={(e) => (e.target.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.target.style.transform = 'scale(1)')}
        >
          ➕ Submit Course
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '450px',
    margin: '60px auto',
    padding: '30px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    marginBottom: '24px',
    fontSize: '22px',
    fontWeight: '600',
    textAlign: 'center',
    color: '#2d3748',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
  },
  fileInput: {
    padding: '10px 0',
    fontSize: '14px',
  },
  button: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '12px',
    border: 'none',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    fontSize: '15px',
    transition: 'background 0.2s, transform 0.1s',
  },
};

export default AddCourse;
