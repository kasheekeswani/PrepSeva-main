import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, isAdmin }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleCardClick = () => navigate(`/courses/${course._id}`);

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: isHovered
      ? '0 8px 20px rgba(0,0,0,0.08)'
      : '0 4px 12px rgba(0,0,0,0.06)',
    padding: '16px',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: isHovered ? '1px solid #90cdf4' : '1px solid #e2e8f0',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'all 0.2s ease',
  };

  const thumbnailStyle = {
    width: '96px',
    height: '96px',
    overflow: 'hidden',
    borderRadius: '12px',
    flexShrink: 0,
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease',
    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
  };

  const titleStyle = {
    fontSize: '18px',
    fontWeight: 600,
    color: isHovered ? '#3182ce' : '#2d3748',
    margin: '0 0 4px 0',
    transition: 'color 0.2s ease',
  };

  const descriptionStyle = {
    fontSize: '14px',
    color: '#4a5568',
    margin: 0,
    maxHeight: '40px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(to right, #f7fafc, #ebf8ff)',
    borderRadius: '12px',
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    marginTop: '8px',
  };

  const boxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const priceStyle = {
    fontWeight: 600,
    color: '#2d3748',
    margin: 0,
  };

  const commissionStyle = {
    fontWeight: 600,
    color: '#38a169',
    margin: 0,
  };

  const labelStyle = {
    fontSize: '12px',
    color: '#718096',
    margin: 0,
  };

  const adminBadgeStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#faf5ff',
    color: '#805ad5',
    padding: '4px 10px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: 500,
  };

  return (
    <div
      style={cardStyle}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div style={thumbnailStyle}>
          <img
            src={course.thumbnail}
            alt={course.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={titleStyle}>{course.title}</h2>
          <p style={descriptionStyle}>{course.description}</p>
        </div>
      </div>

      <div style={footerStyle}>
        <div style={boxStyle}>
          💰
          <div>
            <p style={priceStyle}>₹{course.price}</p>
            <p style={labelStyle}>Price</p>
          </div>
        </div>
        <div style={boxStyle}>
          🎯
          <div>
            <p style={commissionStyle}>{course.affiliateCommission}%</p>
            <p style={labelStyle}>Commission</p>
          </div>
        </div>
      </div>

      {isAdmin && <div style={adminBadgeStyle}>Admin View</div>}
    </div>
  );
};

export default CourseCard;
