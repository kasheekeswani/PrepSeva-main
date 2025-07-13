import React, { useState, useEffect } from 'react';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ, getFAQStats } from '../services/api';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    keywords: '',
    category: 'general',
    priority: 0,
    isActive: true
  });

  const categories = ['general', 'courses', 'exams', 'affiliate', 'technical', 'payment'];

  useEffect(() => {
    fetchFAQs();
    fetchStats();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await getAllFAQs();
      setFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getFAQStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFAQ) {
        await updateFAQ(editingFAQ._id, formData);
      } else {
        await createFAQ(formData);
      }
      
      setFormData({
        question: '',
        answer: '',
        keywords: '',
        category: 'general',
        priority: 0,
        isActive: true
      });
      setEditingFAQ(null);
      setShowForm(false);
      fetchFAQs();
      fetchStats();
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(', '),
      category: faq.category,
      priority: faq.priority,
      isActive: faq.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        await deleteFAQ(id);
        fetchFAQs();
        fetchStats();
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="faq-manager">
      <div className="faq-manager-header">
        <h1>FAQ Management</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          Add New FAQ
        </button>
      </div>

      {/* Stats Section */}
      <div className="faq-stats">
        <div className="stat-card">
          <h3>Total FAQs</h3>
          <p>{stats.totalFAQs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Active FAQs</h3>
          <p>{stats.activeFAQs || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p>{stats.categoryStats?.length || 0}</p>
        </div>
      </div>

      {/* FAQ Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowForm(false);
                  setEditingFAQ(null);
                  setFormData({
                    question: '',
                    answer: '',
                    keywords: '',
                    category: 'general',
                    priority: 0,
                    isActive: true
                  });
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="faq-form">
              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  name="answer"
                  value={formData.answer}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Keywords (comma-separated)</label>
                <input
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleInputChange}
                  placeholder="exam, paper, download"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Priority</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="faq-list">
        {faqs.length === 0 ? (
          <div className="no-faqs">
            <p>No FAQs found. Create your first FAQ to get started.</p>
          </div>
        ) : (
          <div className="faq-table">
            <table>
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faqs.map(faq => (
                  <tr key={faq._id}>
                    <td>
                      <div className="faq-question">
                        <h4>{faq.question}</h4>
                        <p>{faq.answer.substring(0, 100)}...</p>
                      </div>
                    </td>
                    <td>
                      <span className={`category-badge ${faq.category}`}>
                        {faq.category}
                      </span>
                    </td>
                    <td>{faq.priority}</td>
                    <td>{faq.viewCount}</td>
                    <td>
                      <span className={`status-badge ${faq.isActive ? 'active' : 'inactive'}`}>
                        {faq.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(faq)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(faq._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .faq-manager {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .faq-manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .faq-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 0.5rem 0;
          color: #666;
          font-size: 0.9rem;
        }

        .stat-card p {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          color: #333;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
        }

        .faq-form {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checkbox-label input {
          width: auto;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-edit {
          background: #28a745;
          color: white;
        }

        .btn-delete {
          background: #dc3545;
          color: white;
        }

        .faq-table {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .faq-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .faq-table th,
        .faq-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .faq-table th {
          background: #f8f9fa;
          font-weight: 600;
        }

        .faq-question h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .faq-question p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .category-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: uppercase;
          color: white;
        }

        .category-badge.general { background: #6c757d; }
        .category-badge.courses { background: #007bff; }
        .category-badge.exams { background: #28a745; }
        .category-badge.affiliate { background: #ffc107; color: #333; }
        .category-badge.technical { background: #dc3545; }
        .category-badge.payment { background: #17a2b8; }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: uppercase;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .status-badge.inactive {
          background: #f8d7da;
          color: #721c24;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .no-faqs {
          text-align: center;
          padding: 3rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .faq-manager {
            padding: 1rem;
          }
          
          .faq-manager-header {
            flex-direction: column;
            gap: 1rem;
          }
          
          .faq-table {
            overflow-x: auto;
          }
          
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default FAQManager;
