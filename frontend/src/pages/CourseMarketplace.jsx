import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchCourses, createOrder, verifyPurchase } from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const CourseMarketplace = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Extract affiliate code from URL params
  const affiliateCode = searchParams.get('ref');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchCourses();
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (course) => {
    try {
      if (!user) {
        alert('Please login to purchase courses');
        return;
      }

      // Create order with affiliate code
      const orderData = {
        courseId: course._id,
        affiliateCode: affiliateCode || null
      };

      const { data } = await createOrder(orderData.courseId, orderData.affiliateCode);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: 'INR',
        name: 'Course Purchase',
        description: `Purchase: ${course.title}`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Verify payment with affiliate code
            await verifyPurchase({
              courseId: course._id,
              affiliateCode: affiliateCode || null,
              paymentId: response.razorpay_payment_id,
            });
            
            alert('✅ Purchase Successful! You now have access to the course.');
            
            // Optionally redirect to course content or user dashboard
            // window.location.href = '/user-dashboard';
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            alert('❌ Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { 
          color: '#3399cc' 
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal closed');
          }
        }
      };

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway not loaded. Please refresh the page.');
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('❌ Failed to create order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadCourses}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Marketplace</h1>
        {affiliateCode && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="text-sm">
              🎉 You're shopping through an affiliate link! 
              <span className="font-semibold ml-1">Code: {affiliateCode}</span>
            </p>
          </div>
        )}
        <p className="text-gray-600">
          Discover and purchase our premium courses
        </p>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onBuyClick={handleBuy}
              isAdmin={user?.role === 'admin'}
              showAffiliateInfo={!!affiliateCode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseMarketplace;