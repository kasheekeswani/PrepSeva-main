// src/pages/Dashboard.jsx

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import PdfManager from './PdfManager';
import QuestionManager from './QuestionManager';
import TestManager from './TestManager';
import UserStats from './UserStats';
import NotificationManager from './NotificationManager';
import AddCourse from './AddCourse';
import CourseMarketplace from './CourseMarketplace';
import AffiliateLeaderboard from './AffiliateLeaderboard';
import AdminTestAttempts from './AdminTestAttempts'; // ✅ Import the new tab component

export default function Dashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pdfs');

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
    }
  }, [user, isAdmin, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderSection = () => {
    switch (activeTab) {
      case 'pdfs':
        return <PdfManager />;
      case 'questions':
        return <QuestionManager />;
      case 'tests':
        return <TestManager />;
      case 'users':
        return <UserStats />;
      case 'notifications':
        return <NotificationManager />;
      case 'addCourse':
        return <AddCourse />;
      case 'courses':
        return <CourseMarketplace />;
      case 'leaderboard':
        return <AffiliateLeaderboard />;
      case 'attempts': // ✅ Render the new component
        return <AdminTestAttempts />;
      default:
        return <PdfManager />;
    }
  };

  const tabs = [
    { key: 'pdfs', label: '📄 PDFs' },
    { key: 'questions', label: '❓ Questions' },
    { key: 'tests', label: '🧪 Tests' },
    { key: 'users', label: '👤 Users' },
    { key: 'notifications', label: '🔔 Notifications' },
    { key: 'addCourse', label: '➕ Add Course' },
    { key: 'courses', label: '📦 Courses' },
    { key: 'leaderboard', label: '🏆 Leaderboard' },
    { key: 'attempts', label: '📋 Attempts' }, // ✅ New Tab
  ];

  if (!user || !isAdmin) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>📊 Admin Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#333' }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = '#c82333')}
            onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
          >
            Logout
          </button>
        </div>
      </header>

      <nav
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              border: activeTab === tab.key ? '2px solid #007bff' : '1px solid #ccc',
              backgroundColor: activeTab === tab.key ? '#e9f3ff' : '#fff',
              cursor: 'pointer',
              fontWeight: activeTab === tab.key ? 'bold' : 'normal',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.backgroundColor = '#f0f0f0';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.key) {
                e.target.style.backgroundColor = '#fff';
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main
        style={{
          backgroundColor: '#fff',
          padding: '1rem',
          borderRadius: '8px',
          boxShadow: '0 0 10px rgba(0,0,0,0.05)',
        }}
      >
        {renderSection()}
      </main>
    </div>
  );
}
