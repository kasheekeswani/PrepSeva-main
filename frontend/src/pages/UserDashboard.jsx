// frontend/src/pages/UserDashboard.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API, { getAffiliateEarnings } from '../services/api';
import AffiliateLeaderboard from './AffiliateLeaderboard'; // ✅ Load from pages, not components

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
    borderLeft: `6px solid ${color}`,
    borderRadius: '10px',
    padding: '1rem',
    boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s ease',
  });

  const cardTitle = {
    fontSize: '1rem',
    fontWeight: '600',
    margin: '0 0 0.4rem 0',
    color: '#374151',
  };

  const cardValue = {
    fontSize: '1.7rem',
    fontWeight: '700',
    margin: 0,
    color: '#111827',
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'quick-actions', label: '🚀 Quick Actions' },
    { key: 'leaderboard', label: '🏆 Leaderboard' }, // ✅ Added tab
  ];

  const renderSection = () => {
    if (activeTab === 'overview') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
              <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{title}</h3>
              <p style={{ margin: 0, fontSize: '1rem' }}>{desc}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'leaderboard') {
      return <AffiliateLeaderboard />; // ✅ Render leaderboard component
    }

    return null;
  };

  if (!user || !isUser) return null;

  return (
    <div style={{ padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '0.25rem',
              }}
            >
              👋 Welcome, {user?.name || user?.email.split('@')[0]}
            </h1>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {user?.email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
          >
            Logout
          </button>
        </header>

        <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeTab === tab.key ? '#3b82f6' : '#e5e7eb',
                color: activeTab === tab.key ? '#ffffff' : '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem',
                transition: 'all 0.2s',
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
