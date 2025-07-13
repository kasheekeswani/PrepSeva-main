import React, { useState, useEffect, useRef } from 'react';
import { searchFAQs, getActiveFAQs, getFAQCategories } from '../services/api';
import './FAQBot.css';

const FAQBot = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hi! I'm here to help you with questions about our platform. You can ask me about:",
      suggestions: [
        "How to access previous year papers?",
        "Course enrollment process",
        "Affiliate program details",
        "Payment methods",
        "Technical issues"
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [popularFAQs, setPopularFAQs] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      fetchPopularFAQs();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCategories = async () => {
    try {
      const response = await getFAQCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPopularFAQs = async () => {
    try {
      const response = await getActiveFAQs({ limit: 5 });
      setPopularFAQs(response.data);
    } catch (error) {
      console.error('Error fetching popular FAQs:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query
    };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await searchFAQs({ q: query, category: selectedCategory });
      
      setTimeout(() => {
        if (response.data.length > 0) {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: "I found some relevant answers:",
            faqs: response.data.slice(0, 3)
          };
          setMessages(prev => [...prev, botMessage]);
        } else {
          const botMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: "I couldn't find a specific answer to your question. Here are some popular FAQs that might help:",
            faqs: popularFAQs.slice(0, 3),
            suggestions: [
              "Contact support for more help",
              "Browse all FAQs",
              "Check our documentation"
            ]
          };
          setMessages(prev => [...prev, botMessage]);
        }
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: "Sorry, I'm having trouble searching right now. Please try again later or contact support.",
          suggestions: ["Try again", "Contact support"]
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    handleSearch(suggestion);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      handleSearch(input);
      setInput('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="faq-bot-overlay">
      <div className="faq-bot-container">
        <div className="faq-bot-header">
          <div className="faq-bot-title">
            <div className="bot-avatar">🤖</div>
            <div>
              <h3>FAQ Assistant</h3>
              <span className="bot-status">Online</span>
            </div>
          </div>
          <button className="faq-bot-close" onClick={onClose}>×</button>
        </div>

        <div className="faq-bot-category-filter">
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="faq-bot-messages">
          {messages.map(message => (
            <div key={message.id} className={`message ${message.type}`}>
              {message.type === 'bot' && <div className="message-avatar">🤖</div>}
              <div className="message-content">
                <p>{message.content}</p>
                
                {message.faqs && (
                  <div className="faq-results">
                    {message.faqs.map(faq => (
                      <div key={faq._id} className="faq-item">
                        <h4>{faq.question}</h4>
                        <p>{faq.answer}</p>
                        <span className="faq-category">{faq.category}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {message.suggestions && (
                  <div className="suggestions">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="suggestion-btn"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="faq-bot-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default FAQBot;

