import axios from 'axios';

// ✅ Token storage utility that works without localStorage
class TokenStorage {
  constructor() {
    this.token = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        this.token = localStorage.getItem('token');
      }
    } catch (error) {
      console.warn('localStorage not available, using memory storage');
    }
    
    this.initialized = true;
  }

  setToken(token) {
    this.token = token;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('token', token);
      }
    } catch (error) {
      console.warn('Cannot store token in localStorage');
    }
  }

  getToken() {
    this.init();
    return this.token;
  }

  removeToken() {
    this.token = null;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.warn('Cannot remove token from localStorage');
    }
  }
}

const tokenStorage = new TokenStorage();

// ✅ Create main API instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

// ✅ Request Interceptor: Attach JWT token with improved error handling
API.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Request Interceptor Fired');
      console.log('🔍 Request URL:', config.url);
      console.log('🔍 Request Method:', config.method);
      console.log('🔍 Token available:', !!token);
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// ✅ Response Interceptor: Handle token refresh and errors
API.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Response Success:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Response Error:', error.response?.status);
      console.error('❌ Error Message:', error.response?.data?.message || error.message);
    }

    if (error.response?.status === 401) {
      tokenStorage.removeToken();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Export token storage for use in other components
export { tokenStorage };

/* ----------------------- Course Service Functions ----------------------- */
export const fetchCourses = () => API.get('/courses');

export const createCourse = (formData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 createCourse called with:', formData);
  }
  return API.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCourseById = (id) => {
  if (!id) {
    throw new Error('Course ID is required');
  }
  return API.get(`/courses/${id}`);
};

export const updateCourse = (id, formData) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 updateCourse called for ID:', id, 'Data:', formData);
  }
  return API.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/* ----------------------- Affiliate Service Functions ----------------------- */
export const createOrder = async (courseId, affiliateCode) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Creating order for:', { courseId, affiliateCode });
    }
    
    const response = await API.post('/affiliate/order', { courseId, affiliateCode });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Order created:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Order creation error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 400) {
      const message = error.response.data?.message || 'Invalid request';
      if (message.includes('receipt')) {
        throw new Error('Receipt generation failed. Please try again.');
      }
      if (message.includes('Course')) {
        throw new Error('Course not found or unavailable.');
      }
      if (message.includes('affiliate')) {
        throw new Error('Invalid affiliate code.');
      }
      throw new Error(message);
    }
    
    if (error.response?.status === 401) {
      throw new Error('Please log in to continue.');
    }
    
    if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error('Failed to create order. Please try again.');
  }
};

export const verifyAndSavePurchase = async (data) => {
  try {
    const requiredFields = ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature', 'courseId'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const response = await API.post('/affiliate/verify', data);
    return response.data;
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    if (error.response?.status === 400) {
      throw new Error('Payment verification failed. Invalid payment data.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Course not found.');
    }
    
    throw new Error('Payment verification failed. Please contact support.');
  }
};

export const getAffiliateEarnings = () => API.get('/affiliate/earnings');

export const getLeaderboard = () => API.get('/affiliate/leaderboard');

/* ----------------------- Affiliate Link Service Functions ----------------------- */
export const createAffiliateLink = (data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 createAffiliateLink called with:', data);
  }
  return API.post('/affiliate-links', data);
};

export const getAffiliateLinks = () => API.get('/affiliate-links');

export const getAffiliateLinkById = (id) => {
  if (!id) {
    throw new Error('Affiliate link ID is required');
  }
  return API.get(`/affiliate-links/${id}`);
};

export const updateAffiliateLink = (id, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 updateAffiliateLink called for ID:', id, 'Data:', data);
  }
  return API.put(`/affiliate-links/${id}`, data);
};

export const deleteAffiliateLink = (id) => {
  if (!id) {
    throw new Error('Affiliate link ID is required');
  }
  return API.delete(`/affiliate-links/${id}`);
};

/* ----------------------- Affiliate Link Analytics ----------------------- */
export const getAffiliateLinkAnalytics = (period = '30d') => {
  const validPeriods = ['7d', '30d', '90d', '1y'];
  if (!validPeriods.includes(period)) {
    throw new Error('Invalid period. Use: 7d, 30d, 90d, or 1y');
  }
  return API.get(`/affiliate-links/analytics?period=${period}`);
};

export const getAffiliateLinkStats = (id) => {
  if (!id) {
    throw new Error('Affiliate link ID is required');
  }
  return API.get(`/affiliate-links/${id}/stats`);
};

/* ----------------------- QR Code Generation ----------------------- */
export const generateQRCode = (id) => {
  if (!id) {
    throw new Error('Affiliate link ID is required');
  }
  return API.get(`/affiliate-links/${id}/qr-code`, { responseType: 'blob' });
};

/* ----------------------- Public Tracking (No Auth) ----------------------- */
export const trackClick = (code) => {
  if (!code) {
    throw new Error('Affiliate code is required');
  }
  return axios.post(`${API.defaults.baseURL}/affiliate-links/track/${code}`);
};

/* ----------------------- FAQ Service Functions ----------------------- */
export const getAllFAQs = () => API.get('/faq');

export const getActiveFAQs = (params = {}) => API.get('/faq/active', { params });

export const searchFAQs = (params) => API.get('/faq/search', { params });

export const getFAQById = (id) => {
  if (!id) {
    throw new Error('FAQ ID is required');
  }
  return API.get(`/faq/${id}`);
};

export const createFAQ = (faqData) => {
  if (!faqData) {
    throw new Error('FAQ data is required');
  }
  return API.post('/faq', faqData);
};

export const updateFAQ = (id, faqData) => {
  if (!id) {
    throw new Error('FAQ ID is required');
  }
  return API.put(`/faq/${id}`, faqData);
};

export const deleteFAQ = (id) => {
  if (!id) {
    throw new Error('FAQ ID is required');
  }
  return API.delete(`/faq/${id}`);
};

export const getFAQCategories = () => API.get('/faq/categories');

export const getFAQStats = () => API.get('/faq/admin/stats');

/* ----------------------- Export Default API ----------------------- */
export default API;