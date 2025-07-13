import axios from 'axios';

// ✅ Create main API instance
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 🔹 Update to your production URL on deploy
  withCredentials: true,
});

// ✅ Request Interceptor: Attach JWT token and structured debugging
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  console.log('🔍 Request Interceptor Fired');
  console.log('🔍 Request URL:', config.url);
  console.log('🔍 Request Method:', config.method);
  console.log('🔍 Token from localStorage:', token);

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header set:', config.headers['Authorization']);
  } else {
    console.log('❌ No token found in localStorage');
  }

  console.log('🔍 All Request Headers:', config.headers);

  return config;
}, (error) => {
  console.error('❌ Request Interceptor Error:', error);
  return Promise.reject(error);
});

// ✅ Response Interceptor: Structured success and error debugging
API.interceptors.response.use(
  (response) => {
    console.log('✅ Response Success:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.status);
    console.error('❌ Error Message:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

/* ----------------------- Course Service Functions ----------------------- */
export const fetchCourses = () => API.get('/courses');

export const createCourse = (formData) => {
  console.log('🔍 createCourse called with:', formData);
  return API.post('/courses', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getCourseById = (id) => API.get(`/courses/${id}`);

export const updateCourse = (id, formData) => {
  console.log('🔍 updateCourse called for ID:', id, 'Data:', formData);
  return API.put(`/courses/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/* ----------------------- Affiliate Service Functions ----------------------- */

export const createOrder = async (courseId, affiliateCode) => {
  try {
    const response = await API.post('/affiliate/order', { courseId, affiliateCode });
    console.log('✅ Order created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Response error:', error.response?.status);
    console.error('❌ Error message:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const verifyPurchase = (data) => API.post('/affiliate/verify', data);

export const getAffiliateEarnings = () => API.get('/affiliate/earnings');

export const getLeaderboard = () => API.get('/affiliate/leaderboard');

/* ----------------------- Affiliate Link Service Functions ----------------------- */

export const createAffiliateLink = (data) => {
  console.log('🔍 createAffiliateLink called with:', data);
  return API.post('/affiliate-links', data);
};

export const getAffiliateLinks = () => API.get('/affiliate-links');

export const getAffiliateLinkById = (id) => API.get(`/affiliate-links/${id}`);

export const updateAffiliateLink = (id, data) => {
  console.log('🔍 updateAffiliateLink called for ID:', id, 'Data:', data);
  return API.put(`/affiliate-links/${id}`, data);
};

export const deleteAffiliateLink = (id) => API.delete(`/affiliate-links/${id}`);

/* ----------------------- Affiliate Link Analytics ----------------------- */

export const getAffiliateLinkAnalytics = (period = '30d') =>
  API.get(`/affiliate-links/analytics?period=${period}`);

export const getAffiliateLinkStats = (id) =>
  API.get(`/affiliate-links/${id}/stats`);

/* ----------------------- QR Code Generation ----------------------- */

export const generateQRCode = (id) =>
  API.get(`/affiliate-links/${id}/qr-code`, { responseType: 'blob' });

/* ----------------------- Public Tracking (No Auth) ----------------------- */

export const trackClick = (code) =>
  axios.post(`${API.defaults.baseURL}/affiliate-links/track/${code}`);

/* ----------------------- FAQ Service Functions ----------------------- */

export const getAllFAQs = () => {
  return API.get('/faq');
};

export const getActiveFAQs = (params = {}) => {
  return API.get('/faq/active', { params });
};

export const searchFAQs = (params) => {
  return API.get('/faq/search', { params });
};

export const getFAQById = (id) => {
  return API.get(`/faq/${id}`);
};

export const createFAQ = (faqData) => {
  return API.post('/faq', faqData);
};

export const updateFAQ = (id, faqData) => {
  return API.put(`/faq/${id}`, faqData);
};

export const deleteFAQ = (id) => {
  return API.delete(`/faq/${id}`);
};

export const getFAQCategories = () => {
  return API.get('/faq/categories');
};

export const getFAQStats = () => {
  return API.get('/faq/admin/stats');
};

/* ----------------------- Export Default API ----------------------- */
export default API;
