// src/pages/PDFLibrary.jsx

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function PDFLibrary() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    if (!user) return navigate('/');

    const fetchPDFs = async () => {
      try {
        const res = await API.get('/pdfs');
        setPdfs(res.data);
      } catch (err) {
        console.error('Error fetching PDFs:', err);
        setError('Unable to load PDFs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPDFs();
  }, [user, navigate]);

  const handleDownload = async (pdf) => {
    setDownloadingId(pdf._id);
    try {
      await API.post('/pdfs/track-download', { pdfId: pdf._id });
      window.open(pdf.pdfUrl, '_blank');
    } catch (err) {
      console.error('Failed to track/download PDF:', err);
      alert('Something went wrong while downloading.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          fontSize: '1.2rem',
        }}
      >
        📄 Loading PDFs...
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'red',
          fontSize: '1.1rem',
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '2rem',
        minHeight: '100vh',
        backgroundColor: '#f5f7fa',
      }}
    >
      <h2
        style={{
          fontSize: '1.8rem',
          fontWeight: '600',
          marginBottom: '1.5rem',
          color: '#333',
          textAlign: 'center',
        }}
      >
        📘 Previous Year Papers
      </h2>

      {pdfs.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#555' }}>
          No PDFs available right now.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
          }}
        >
          {pdfs.map((pdf) => (
            <div
              key={pdf._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#222',
                  }}
                >
                  {pdf.title}
                </h3>
                <p
                  style={{
                    fontSize: '0.9rem',
                    color: '#555',
                  }}
                >
                  {pdf.examName} - {pdf.year}
                </p>
              </div>
              <button
                onClick={() => handleDownload(pdf)}
                disabled={downloadingId === pdf._id}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor:
                    downloadingId === pdf._id ? '#adb5bd' : '#007bff',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  cursor:
                    downloadingId === pdf._id ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => {
                  if (downloadingId !== pdf._id) {
                    e.target.style.backgroundColor = '#0069d9';
                  }
                }}
                onMouseOut={(e) => {
                  if (downloadingId !== pdf._id) {
                    e.target.style.backgroundColor = '#007bff';
                  }
                }}
              >
                {downloadingId === pdf._id
                  ? 'Downloading...'
                  : 'Download PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
