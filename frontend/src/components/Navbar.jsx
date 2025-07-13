// src/components/Navbar.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { logout, admin } = useAuth();
  const [hoveredLink, setHoveredLink] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a202c',
    color: 'white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
  };

  const linkStyle = (isHovered) => ({
    color: isHovered ? '#63b3ed' : 'white',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0.4rem 0.6rem',
    borderRadius: '8px',
    backgroundColor: isHovered ? 'rgba(255,255,255,0.1)' : 'transparent',
    transition: 'all 0.2s ease',
  });

  const logoutButtonStyle = {
    background: isLogoutHovered ? '#c53030' : '#e53e3e',
    border: 'none',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 0.2s ease, transform 0.1s ease',
    transform: isLogoutHovered ? 'scale(1.05)' : 'scale(1)',
  };

  return (
    <nav style={navStyle}>
      <div style={linksContainerStyle}>
        {[
          { to: '/dashboard', label: 'Dashboard' },
          { to: '/users', label: 'User Stats' },
          { to: '/questions', label: 'Question Manager' },
          { to: '/tests', label: 'Test Creator' },
          { to: '/notifications', label: 'Notification Manager' },
        ].map((link, index) => (
          <Link
            key={index}
            to={link.to}
            style={linkStyle(hoveredLink === index)}
            onMouseEnter={() => setHoveredLink(index)}
            onMouseLeave={() => setHoveredLink(null)}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {admin?.email && (
          <span style={{ fontSize: '14px', color: '#e2e8f0' }}>
            {admin.email}
          </span>
        )}
        <button
          onClick={logout}
          style={logoutButtonStyle}
          onMouseEnter={() => setIsLogoutHovered(true)}
          onMouseLeave={() => setIsLogoutHovered(false)}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
