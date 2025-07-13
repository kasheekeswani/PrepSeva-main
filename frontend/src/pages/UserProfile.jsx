// src/pages/profile/UserProfile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function UserProfile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/users/${user._id}`);
        setFormData({ name: res.data.name, email: res.data.email, password: '' });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put(`/users/${user._id}`, formData);
      alert('✅ Profile updated');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('❌ Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6">Loading profile...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">👤 Your Profile</h2>
      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1 font-semibold">Name</label>
          <input
            name="name"
            type="text"
            className="w-full border p-2 rounded"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">Email</label>
          <input
            name="email"
            type="email"
            className="w-full border p-2 rounded"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-semibold">New Password</label>
          <input
            name="password"
            type="password"
            className="w-full border p-2 rounded"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
