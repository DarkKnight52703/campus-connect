import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { loginUser } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ phone: '', password: '' });

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);
      login(res.data.token, res.data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-10 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <Link to="/" className="text-purple-700 font-bold text-xl">Campus Connect 💜</Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">Welcome back</h2>
          <p className="text-gray-500 text-sm mt-1">Login to see your weekly match</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input name="phone" type="tel" required value={form.phone} onChange={handle}
                placeholder="Enter your phone number"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input name="password" type="password" required value={form.password} onChange={handle}
                placeholder="Your password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-purple-700 text-white font-semibold py-3 rounded-xl hover:bg-purple-800 transition disabled:opacity-60">
              {loading ? 'Logging in...' : 'See my match →'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-5">
          New here?{' '}
          <Link to="/register" className="text-purple-700 font-medium hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
