import React, { useState } from 'react';
import FAQBot from './FAQBot';

const FAQFloatingButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="faq-floating-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open FAQ Bot"
      >
        <span className="faq-icon">❓</span>
        <span className="faq-text">Help</span>
      </button>

      <FAQBot isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* ✅ Fixed style tag */}
      <style>
        {`
          .faq-floating-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            z-index: 999;
            font-size: 14px;
            font-weight: 500;
          }

          .faq-floating-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
          }

          .faq-floating-btn:active {
            transform: translateY(0);
          }

          .faq-icon {
            font-size: 18px;
            animation: bounce 2s infinite;
          }

          .faq-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateY(0);
            }
            40% {
              transform: translateY(-3px);
            }
            60% {
              transform: translateY(-2px);
            }
          }

          @media (max-width: 768px) {
            .faq-floating-btn {
              bottom: 15px;
              right: 15px;
              padding: 12px 16px;
            }

            .faq-text {
              display: none;
            }

            .faq-icon {
              font-size: 20px;
            }
          }
        `}
      </style>
    </>
  );
};

export default FAQFloatingButton;
