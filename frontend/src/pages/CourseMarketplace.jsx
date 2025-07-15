import React, { useEffect, useState } from 'react';
import { fetchCourses, createOrder, verifyAndSavePurchase } from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

const CourseMarketplace = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const { user, affiliateCode, setAffiliateCode } = useAuth();

  // Set affiliate code from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !affiliateCode) {
      setAffiliateCode(ref);
    }
  }, [affiliateCode, setAffiliateCode]);

  // Fetch courses
  useEffect(() => {
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
    loadCourses();
  }, []);

  const handleBuy = async (course) => {
    try {
      if (!user) {
        alert('Please login to purchase courses');
        return;
      }

      if (purchasing) return;
      setPurchasing(true);

      console.log('🔍 Starting purchase for:', { courseId: course._id, affiliateCode });

      const orderResponse = await createOrder(course._id, affiliateCode);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.order.amount,
        currency: 'INR',
        name: 'Course Purchase',
        description: `Purchase: ${course.title}`,
        order_id: orderResponse.order.id,
        handler: async (response) => {
          try {
            console.log('✅ Payment successful:', response);
            
            await verifyAndSavePurchase({
              razorpay_order_id: orderResponse.order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              affiliateCode: affiliateCode || null,
            });
            
            alert('✅ Purchase Successful! You now have access to the course.');
          } catch (verifyError) {
            console.error('Payment verification failed:', verifyError);
            alert(`❌ ${verifyError.message}`);
          } finally {
            setPurchasing(false);
          }
        },
        prefill: {
          name: user.name || '',
          email: user.email || '',
        },
        theme: { 
          color: '#3399cc' 
        },
        modal: {
          ondismiss: () => {
            console.log('Payment modal closed');
            setPurchasing(false);
          }
        }
      };

      if (typeof window.Razorpay === 'undefined') {
        alert('Payment gateway not loaded. Please refresh the page.');
        setPurchasing(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert(`❌ ${error.message}`);
      setPurchasing(false);
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
          onClick={() => loadCourses()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
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