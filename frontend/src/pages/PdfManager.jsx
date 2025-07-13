// src/pages/PdfManager.jsx

import { useEffect, useState } from 'react';
import API from '../services/api';

export default function PdfManager() {
  const [pdfs, setPdfs] = useState([]);
  const [title, setTitle] = useState('');
  const [examName, setExamName] = useState('');
  const [year, setYear] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const fetchPDFs = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get('/pdfs');
      setPdfs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load PDFs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPDFs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please choose a PDF file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('examName', examName);
    formData.append('year', year);

    try {
      setUploading(true);
      await API.post('/pdfs/upload', formData);
      alert('PDF uploaded successfully!');
      setTitle('');
      setExamName('');
      setYear('');
      setFile(null);
      fetchPDFs();
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;
    try {
      await API.delete(`/pdfs/${id}`);
      fetchPDFs();
    } catch (err) {
      console.error(err);
      alert('Failed to delete PDF.');
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '1.8rem', fontWeight: '600', marginBottom: '1rem', textAlign: 'center', color: '#333' }}>
        📄 PDF Upload Manager
      </h2>

      <form
        onSubmit={handleUpload}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          borderRadius: '8px',
          maxWidth: '600px',
          margin: '0 auto 2rem auto'
        }}
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Exam Name"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          required
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <input
          type="text"
          placeholder="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ padding: '0.5rem' }}
            required
          />
          {file && (
            <p style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
              Selected file: {file.name}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={uploading}
          style={{
            backgroundColor: uploading ? '#6c757d' : '#007bff',
            color: 'white',
            padding: '0.75rem',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '1rem',
            transition: 'background-color 0.2s',
          }}
          onMouseOver={(e) => {
            if (!uploading) e.target.style.backgroundColor = '#0056b3';
          }}
          onMouseOut={(e) => {
            if (!uploading) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {uploading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>

      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
          📚 Uploaded PDFs
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading PDFs...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
        ) : pdfs.length === 0 ? (
          <p style={{ textAlign: 'center' }}>No PDFs uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {pdfs.map((pdf) => (
              <li
                key={pdf._id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: '6px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <p style={{ fontWeight: '600', margin: 0, color: '#222' }}>{pdf.title}</p>
                  <p style={{ fontSize: '0.9rem', color: '#555', margin: 0 }}>
                    {pdf.examName} - {pdf.year}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <a
                    href={pdf.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      color: '#007bff',
                      textDecoration: 'underline',
                      fontSize: '0.95rem',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => (e.target.style.color = '#0056b3')}
                    onMouseOut={(e) => (e.target.style.color = '#007bff')}
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleDelete(pdf._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'red',
                      fontSize: '0.95rem',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                    onMouseOver={(e) => (e.target.style.color = '#b30000')}
                    onMouseOut={(e) => (e.target.style.color = 'red')}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
