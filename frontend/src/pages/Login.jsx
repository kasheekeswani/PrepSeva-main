import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post('/auth/login', { email, password });
      const { user, token } = res.data;

      console.log("✅ Login response:", { user, token });

      if (!user || !token) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      login(user, token); // updated to pass both user and token

      const role = user.role;
      if (role === 'admin') {
        navigate('/dashboard');
      } else if (role === 'user') {
        navigate('/user/dashboard');
      } else {
        alert('Invalid user role.');
      }
    } catch (err) {
      console.error('❌ Login error:', err);
      alert(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f2f5',
        padding: '1rem',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#ffffff',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <h2
          style={{
            textAlign: 'center',
            fontSize: '1.75rem',
            fontWeight: '600',
            marginBottom: '0.5rem',
            color: '#333',
          }}
        >
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem',
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => {
            if (!loading) e.target.style.backgroundColor = '#0069d9';
          }}
          onMouseOut={(e) => {
            if (!loading) e.target.style.backgroundColor = '#007bff';
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p
          style={{
            fontSize: '0.95rem',
            textAlign: 'center',
            marginTop: '0.5rem',
            color: '#555',
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{
              color: '#007bff',
              textDecoration: 'none',
              fontWeight: '500',
            }}
            onMouseOver={(e) => {
              e.target.style.textDecoration = 'underline';
            }}
            onMouseOut={(e) => {
              e.target.style.textDecoration = 'none';
            }}
          >
            Register
          </Link>
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border 0.2s, box-shadow 0.2s',
  onFocus: (e) => {
    e.target.style.border = '1px solid #007bff';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,123,255,0.1)';
  },
  onBlur: (e) => {
    e.target.style.border = '1px solid #ccc';
    e.target.style.boxShadow = 'none';
  },
};
