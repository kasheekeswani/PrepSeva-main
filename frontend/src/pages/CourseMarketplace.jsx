import React, { useEffect, useState } from 'react';
import { fetchCourses, createOrder, verifyAndSavePurchase } from '../services/api';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const CourseMarketplace = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [refInput, setRefInput] = useState('');
  const { user, affiliateCode, setAffiliateCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref && !affiliateCode) {
      setAffiliateCode(ref);
    }
  }, [affiliateCode, setAffiliateCode]);

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

      if (user.purchasedCourses?.includes(course._id)) {
        alert('You have already purchased this course.');
        return;
      }

      if (purchasing) return;
      setPurchasing(true);

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
            await verifyAndSavePurchase({
              razorpay_order_id: orderResponse.order.id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: course._id,
              affiliateCode: affiliateCode || null,
            });

            alert('✅ Purchase Successful! You now have access to the course.');

            const currentIndex = courses.findIndex(c => c._id === course._id);
            const nextCourse = courses[currentIndex + 1];
            if (nextCourse) {
              navigate(`/courses/${nextCourse._id}`);
            }

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

  const handleShare = (courseId) => {
    if (!user) {
      alert('Login to generate affiliate link.');
      return;
    }

    const shareLink = `${window.location.origin}/marketplace?ref=${user._id}`;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        alert('✅ Affiliate link copied! Share it with your friends.');
      })
      .catch(err => {
        console.error('Failed to copy affiliate link:', err);
        alert('❌ Could not copy affiliate link.');
      });
  };

  const handleApplyReferral = () => {
    if (refInput.trim()) {
      setAffiliateCode(refInput.trim());
      alert('✅ Referral code applied!');
      setRefInput('');
    } else {
      alert('❌ Please enter a valid referral code.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #ccc',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#222' }}>Course Marketplace</h1>

        {/* Referral Code Input */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
            placeholder="Enter referral code..."
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '6px',
              flex: 1,
              maxWidth: '300px'
            }}
          />
          <button
            onClick={handleApplyReferral}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Apply
          </button>
        </div>

        {affiliateCode && (
          <div style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            color: '#155724',
            padding: '12px',
            borderRadius: '6px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            🎉 You're shopping through an affiliate link!
            <span style={{ fontWeight: 'bold', marginLeft: '6px' }}>Code: {affiliateCode}</span>
          </div>
        )}
        <p style={{ color: '#666', fontSize: '14px', marginTop: '8px' }}>
          Discover and purchase our premium courses.
        </p>
      </div>

      {courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#666' }}>
          <p style={{ fontSize: '18px' }}>No courses available at the moment.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: '0.3s ease',
              }}
            >
              <CourseCard
                course={course}
                isAdmin={user?.role === 'admin'}
              />
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  style={{
                    width: '100%',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onClick={() => handleBuy(course)}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
                >
                  Buy
                </button>
                <button
                  style={{
                    width: '100%',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onClick={() => handleShare(course._id)}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = '#d0d0d0'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = '#e0e0e0'}
                >
                  Share & Earn 💸
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseMarketplace;
