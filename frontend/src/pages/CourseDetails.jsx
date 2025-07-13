// src/pages/CourseDetails.jsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourseById, createOrder, verifyPurchase } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    getCourseById(id)
      .then((res) => {
        setCourse(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadRazorpay = async () => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded.');
      return;
    }
    setPurchasing(true);
    try {
      const { data } = await createOrder(course._id, user._id);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: 'INR',
        name: 'Affiliate Course Purchase',
        description: course.title,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            await verifyPurchase({
              courseId: course._id,
              affiliateId: user._id,
              paymentId: response.razorpay_payment_id,
            });
            alert('✅ Purchase Successful!');
          } catch {
            alert('❌ Payment verification failed.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#3B82F6' },
      };
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('❌ Failed to initiate payment.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eef2ff, #e0e7ff)'
      }}>
        <div style={{
          border: '4px solid #3B82F6',
          borderTop: '4px solid transparent',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  if (!course) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Course Not Found</h2>
        <p style={{ marginBottom: '1rem', color: '#555' }}>This course does not exist or was removed.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: '#3B82F6',
            color: '#fff',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom right, #eef2ff, #e0e7ff)',
      display: 'flex',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <img
          src={course.thumbnail}
          alt={course.title}
          style={{
            width: '100%',
            height: '300px',
            objectFit: 'cover',
            borderRadius: '12px',
            marginBottom: '1rem'
          }}
        />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{course.title}</h1>
        <p style={{ marginBottom: '1rem', color: '#444' }}>{course.description}</p>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: '#f3f4f6',
          padding: '0.75rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          fontWeight: '500'
        }}>
          <div>Price: ₹{course.price}</div>
          <div style={{ color: 'green' }}>Commission: {course.affiliateCommission}%</div>
        </div>
        {user?.role === 'user' && (
          <button
            onClick={loadRazorpay}
            disabled={purchasing}
            style={{
              width: '100%',
              backgroundColor: purchasing ? '#93c5fd' : '#3B82F6',
              color: '#fff',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: purchasing ? 'not-allowed' : 'pointer'
            }}
          >
            {purchasing ? 'Processing...' : 'Buy Now'}
          </button>
        )}
        {user?.role === 'admin' && (
          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#7c3aed', fontWeight: '600' }}>
            Admin Preview Mode
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetails;
