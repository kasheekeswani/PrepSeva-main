// src/pages/CourseDetails.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCourseById, createOrder, verifyAndSavePurchase } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  // ✅ Capture ?ref=CODE for affiliate tracking
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const affiliateCode = params.get('ref');
    if (affiliateCode) {
      localStorage.setItem('affiliateCode', affiliateCode);
    }
  }, [location.search]);

  // ✅ Fetch course
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await getCourseById(id);
        setCourse(res.data);
      } catch (error) {
        console.error('❌ Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const loadRazorpay = async () => {
    if (!window.Razorpay) {
      alert('❌ Razorpay SDK not loaded.');
      return;
    }

    setPurchasing(true);
    try {
      const savedAffiliateCode = localStorage.getItem('affiliateCode');

      // ✅ Create order with affiliate tracking
      const { order } = await createOrder(course._id, savedAffiliateCode);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'Course Purchase',
        description: course.title,
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('✅ Razorpay response:', response);

            // ✅ Verify purchase with all required data
            await verifyAndSavePurchase({
              razorpay_order_id: order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              affiliateCode: savedAffiliateCode,
            });

            // ✅ Remove affiliate code from localStorage
            localStorage.removeItem('affiliateCode');

            // ✅ Show toast and redirect
            toast.success('✅ Purchase successful!');
            navigate('/my-courses');
          } catch (err) {
            console.error('❌ Payment verification failed:', err);
            console.error('❌ Error details:', err.response?.data);
            toast.error('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#3B82F6',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('❌ Payment initiation failed:', err);
      toast.error('❌ Failed to initiate payment.');
    } finally {
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
        <p className="mb-4 text-gray-600">This course does not exist or was removed.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
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
          <span className="text-green-600">
            Commission: {course.affiliateCommission}%
          </span>
        </div>

        {user?.role === 'user' && (
          <button
            onClick={loadRazorpay}
            disabled={purchasing}
            className={`w-full py-3 rounded-lg font-semibold transition ${purchasing
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
          >
            {purchasing ? 'Processing...' : 'Buy Now'}
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
