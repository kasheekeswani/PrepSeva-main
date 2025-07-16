import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getCourseById,
  tokenStorage,
  fetchCourses,
  getOrCreateAffiliateLink,
  verifyAndSavePurchase,
  createOrder,
} from '../services/api';

import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    affiliateCode,
    setAffiliateCode,
    clearAffiliateCode,
    logout,
  } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [affiliateLink, setAffiliateLink] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  const isTokenExpired = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref && !affiliateCode) {
      clearAffiliateCode();
      setAffiliateCode(ref);
    }
  }, [affiliateCode, clearAffiliateCode, setAffiliateCode]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(id);
        setCourse(res.data);

        // check if user already owns the course
        if (user?.purchasedCourses?.includes(id)) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error('❌ Error fetching course:', err);
        toast.error('Failed to load course details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleShare = async () => {
    try {
      const res = await getOrCreateAffiliateLink(course._id);
      const link = `${window.location.origin}/courses/${course._id}?ref=${res.data.code}`;
      setAffiliateLink(link);
      toast.success('✅ Affiliate link ready to share!');
    } catch (err) {
      toast.error('Failed to generate affiliate link');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const loadRazorpay = async () => {
    if (!window.Razorpay) {
      toast.error('❌ Razorpay SDK not loaded.');
      return;
    }

    const token = tokenStorage.getToken();
    if (!token || isTokenExpired(token)) {
      toast.error('❌ Session expired. Please log in again.');
      tokenStorage.removeToken();
      logout();
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const orderResponse = await createOrder(course._id, affiliateCode);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount,
        currency: 'INR',
        name: 'Course Purchase',
        description: course.title,
        order_id: orderResponse.order.id,
        handler: async (response) => {
          try {
            await verifyAndSavePurchase({
              razorpay_order_id: orderResponse.order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              affiliateCode: affiliateCode || null,
            });

            clearAffiliateCode();
            toast.success('✅ Purchase successful!');

            const allCourses = (await fetchCourses()).data;
            const currentIndex = allCourses.findIndex(c => c._id === course._id);
            const nextCourse = allCourses[currentIndex + 1];

            navigate(nextCourse ? `/courses/${nextCourse._id}` : '/congrats');

          } catch (err) {
            toast.error(`❌ ${err.message}`);
          } finally {
            setPurchasing(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => setPurchasing(false),
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      toast.error(`❌ ${err.message}`);
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-12 h-12" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Course Not Found</h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 flex justify-center p-4">
      <div className="max-w-lg bg-white rounded-2xl shadow-md p-6">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-64 object-cover rounded-xl mb-4"
        />
        <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
        <p className="text-gray-700 mb-4">{course.description}</p>

        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-lg mb-4 font-medium">
          <span>Price: ₹{course.price}</span>
          <span className="text-green-600">Commission: {course.affiliateCommission}%</span>
        </div>

        {/* Show Buy/Share only if user doesn't own the course */}
        {user?.role === 'user' && !hasAccess && (
          <>
            <button
              onClick={loadRazorpay}
              disabled={purchasing}
              className={`w-full mb-3 py-3 rounded-lg font-semibold transition ${
                purchasing ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {purchasing ? 'Processing...' : 'Buy Now'}
            </button>

            <button
              onClick={handleShare}
              className="w-full py-3 rounded-lg font-semibold bg-green-500 hover:bg-green-600 text-white transition"
            >
              Share & Earn
            </button>

            {affiliateLink && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Your affiliate link:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={affiliateLink}
                    readOnly
                    className="w-full px-3 py-2 rounded border text-sm bg-gray-50"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="text-sm bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
                  >
                    {copySuccess ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* If user owns course, maybe show start learning */}
        {hasAccess && (
          <button
            onClick={() => navigate(`/learn/${course._id}`)}
            className="w-full mt-4 py-3 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition"
          >
            Start Learning
          </button>
        )}

        {user?.role === 'admin' && (
          <div className="text-center mt-4 text-purple-600 font-semibold">
            Admin Preview Mode
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
