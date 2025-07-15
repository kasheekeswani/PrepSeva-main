// frontend/src/pages/UserDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API, { getAffiliateEarnings } from '../services/api';

export default function UserDashboard() {
  const { user, isUser, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [earnings, setEarnings] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || !isUser) {
      navigate('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await API.get(`/userstats/${user._id}`);
        setStats(res.data);
      } catch (err) {
        console.error('Error loading stats', err);
      }
    };

    const fetchEarnings = async () => {
      try {
        const res = await getAffiliateEarnings();
        setEarnings(res.data.totalEarned ?? 0);
      } catch (err) {
        console.error('Error loading affiliate earnings', err);
      }
    };

    fetchStats();
    fetchEarnings();
  }, [user, isUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const quickActions = [
    {
      icon: '📘',
      title: 'PDF Library',
      desc: 'Access and download study materials',
      route: '/pdf-library',
      color: '#3b82f6',
    },
    {
      icon: '🧪',
      title: 'Available Tests',
      desc: 'Take practice tests and quizzes',
      route: '/tests/list',
      color: '#10b981',
    },
    {
      icon: '📊',
      title: 'Test Results',
      desc: 'View your performance history',
      route: '/results',
      color: '#8b5cf6',
    },
    {
      icon: '⭐',
      title: 'Bookmarks',
      desc: 'Your saved questions and materials',
      route: '/bookmarks',
      color: '#f59e0b',
    },
    {
      icon: '🔔',
      title: 'Notifications',
      desc: 'Check latest updates and alerts',
      route: '/notifications',
      color: '#ef4444',
    },
    {
      icon: '👤',
      title: 'Profile',
      desc: 'Manage your account settings',
      route: '/profile',
      color: '#6b7280',
    },
    {
      icon: '🎓',
      title: 'Courses',
      desc: 'Explore all available courses',
      route: '/courses',
      color: '#facc15',
    },
  ];

  const cardStyle = (color) => ({
    backgroundColor: '#ffffff',
    border: `2px solid ${color}`,
    borderRadius: '8px',
    padding: '1rem',
    textAlign: 'center',
  });

  const cardTitle = {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
    color: '#374151',
  };

  const cardValue = {
    fontSize: '1.5rem',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'quick-actions', label: '🚀 Quick Actions' },
  ];

  const renderSection = () => {
    if (activeTab === 'overview') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <div style={cardStyle('#3b82f6')}>
            <h3 style={cardTitle}>📊 Total Tests Taken</h3>
            <p style={cardValue}>{stats?.totalTests ?? '0'}</p>
          </div>
          <div style={cardStyle('#10b981')}>
            <h3 style={cardTitle}>🎯 Average Score</h3>
            <p style={cardValue}>{stats?.avgScore ?? '0'}%</p>
          </div>
          <div style={cardStyle('#f59e0b')}>
            <h3 style={cardTitle}>⭐ Bookmarked Items</h3>
            <p style={cardValue}>{stats?.bookmarks ?? '0'}</p>
          </div>
          <div style={cardStyle('#6366f1')}>
            <h3 style={cardTitle}>💰 Affiliate Earnings</h3>
            <p style={cardValue}>₹{earnings.toFixed(2)}</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'quick-actions') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {quickActions.map(({ icon, title, desc, route, color }) => (
            <div
              key={title}
              onClick={() => navigate(route)}
              style={{
                backgroundColor: color,
                color: '#fff',
                padding: '1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = 'scale(1.02)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = 'scale(1)')
              }
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  if (!user || !isUser) return null;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <h1 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#111827' }}>
            👋 Welcome, {user?.name || user?.email}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>{user?.email}</span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 0.75rem',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <nav style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: activeTab === tab.key ? '2px solid #3b82f6' : '1px solid #d1d5db',
                backgroundColor: activeTab === tab.key ? '#e0f2fe' : '#ffffff',
                cursor: 'pointer',
                fontWeight: activeTab === tab.key ? '600' : '500',
                color: activeTab === tab.key ? '#1e40af' : '#374151',
                transition: 'background 0.2s, border 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main>{renderSection()}</main>
      </div>
    </div>
  );
}
